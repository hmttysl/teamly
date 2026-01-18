"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Inbox } from "@/components/inbox/Inbox";
import { Calendar } from "@/components/calendar/Calendar";
import { SpaceView } from "@/components/space/SpaceView";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import EchoPage from "@/components/echo/EchoPage";
import { LoginPage } from "@/components/auth/LoginPage";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import TeamlyLoader from "@/components/ui/TeamlyLoader";

interface SpaceMember {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface Space {
  id: number;
  dbId?: string; // UUID from Supabase
  name: string;
  color: string;
  members?: SpaceMember[];
}

// Generate a consistent numeric ID from a UUID string
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export default function Home() {
  const { user, profile, isLoading } = useAuth();
  
  const [activeView, setActiveView] = useState<"dashboard" | "space" | "inbox" | "calendar" | "settings" | "echo">("dashboard");
  const [activeSpaceId, setActiveSpaceId] = useState<number | undefined>(undefined);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);

  // Fetch user's spaces from Supabase with real-time subscription
  useEffect(() => {
    if (user) {
      fetchSpaces();
      
      // Subscribe to real-time changes on spaces table
      const spacesSubscription = supabase
        .channel('spaces-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'spaces' },
          () => {
            // Refresh spaces when any change happens
            fetchSpaces();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'space_members' },
          () => {
            // Refresh spaces when membership changes
            fetchSpaces();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(spacesSubscription);
      };
    } else {
      setSpaces([]);
      setSpacesLoading(false);
    }
  }, [user]);

  const fetchSpaces = async () => {
    if (!user) return;
    
    setSpacesLoading(true);
    
    // First get space IDs where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from("space_members")
      .select("space_id")
      .eq("user_id", user.id);

    if (memberError) {
      console.error("Error fetching member spaces:", memberError);
      setSpacesLoading(false);
      return;
    }

    const spaceIds = memberData?.map(m => m.space_id) || [];
    
    if (spaceIds.length === 0) {
      setSpaces([]);
      setSpacesLoading(false);
      return;
    }

    // Then get the actual space data
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .in("id", spaceIds)
      .order("created_at", { ascending: true });

    if (error && error.message) {
      console.error("Error fetching spaces:", error.message);
      setSpacesLoading(false);
      return;
    }
    
    if (data) {
      // First set spaces immediately (without members) so they appear right away
      const initialSpaces = data.map((space) => ({
        id: hashStringToNumber(space.id),
        dbId: space.id,
        name: space.name,
        color: space.color,
        members: [] as SpaceMember[],
      }));
      setSpaces(initialSpaces);
      setSpacesLoading(false);

      // Then fetch members in background and update
      try {
        const spacesWithMembers = await Promise.all(
          data.map(async (space) => {
            try {
              const { data: membersData } = await supabase
                .from("space_members")
                .select(`
                  user_id,
                  profiles:user_id (
                    id,
                    name,
                    avatar_url
                  )
                `)
                .eq("space_id", space.id);

              const members: SpaceMember[] = (membersData || [])
                .filter((m: any) => m.profiles)
                .map((m: any) => ({
                  id: m.profiles.id,
                  name: m.profiles.name || "User",
                  avatar_url: m.profiles.avatar_url,
                }));

              return {
                id: hashStringToNumber(space.id),
                dbId: space.id,
                name: space.name,
                color: space.color,
                members,
              };
            } catch {
              // If member fetch fails, return space without members
              return {
                id: hashStringToNumber(space.id),
                dbId: space.id,
                name: space.name,
                color: space.color,
                members: [] as SpaceMember[],
              };
            }
          })
        );
        
        setSpaces(spacesWithMembers);
      } catch (err) {
        console.error("Error fetching space members:", err);
        // Keep the spaces without members - already set above
      }
    } else {
      setSpacesLoading(false);
    }
  };

  const handleViewChange = (view: "dashboard" | "space" | "inbox" | "calendar" | "echo", spaceId?: number) => {
    setActiveView(view);
    if (spaceId !== undefined) {
      setActiveSpaceId(spaceId);
    }
    // Reset inbox count when viewing inbox
    if (view === "inbox") {
      setInboxUnreadCount(0);
    }
  };

  const handleProfileSettingsClick = () => {
    setActiveView("settings");
  };

  const handleCreateSpace = async (name: string, color: string) => {
    if (!user) return;

    try {
      // Create the space
      const { data, error } = await supabase
        .from("spaces")
        .insert({
          name,
          color,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating space:", error.message);
        return;
      }

      if (data) {
        // Add owner as a member of the space
        const { error: memberError } = await supabase
          .from("space_members")
          .insert({
            space_id: data.id,
            user_id: user.id,
            role: "owner",
          });

        if (memberError) {
          console.error("Error adding owner to space_members:", memberError.message);
        }

        // Refresh spaces list from database
        await fetchSpaces();
        
        // Use the consistent hash ID for the new space
        const newSpaceId = hashStringToNumber(data.id);
        
        // Navigate to the new space
        setActiveView("space");
        setActiveSpaceId(newSpaceId);
      }
    } catch (err) {
      console.error("Error in handleCreateSpace:", err);
    }
  };

  const handleLeaveSpace = async (spaceId: number) => {
    // Remove the space from the list (simulating leaving)
    setSpaces(spaces.filter(s => s.id !== spaceId));
    // Navigate to dashboard
    setActiveView("dashboard");
    setActiveSpaceId(undefined);
  };

  const handleDeleteSpace = async (spaceId: number) => {
    const spaceToDelete = spaces.find(s => s.id === spaceId);
    if (!spaceToDelete || !user || !spaceToDelete.dbId) {
      console.error("Cannot delete space: space not found or no dbId");
      return;
    }

    // Delete from Supabase
    const { error } = await supabase
      .from("spaces")
      .delete()
      .eq("id", spaceToDelete.dbId);

    if (error) {
      console.error("Error deleting space:", error);
      return;
    }

    // Refresh spaces
    await fetchSpaces();
    // Navigate to dashboard
    setActiveView("dashboard");
    setActiveSpaceId(undefined);
  };

  const handleArchiveSpace = (spaceId: number) => {
    // For now, just remove from list (in real app, would mark as archived)
    setSpaces(spaces.filter(s => s.id !== spaceId));
    // Navigate to dashboard
    setActiveView("dashboard");
    setActiveSpaceId(undefined);
  };

  const handleUpdateSpace = async (spaceId: number, updates: { name?: string; description?: string; color?: string }) => {
    const spaceToUpdate = spaces.find(s => s.id === spaceId);
    if (!spaceToUpdate || !spaceToUpdate.dbId) return;

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { error } = await supabase
      .from("spaces")
      .update(updateData)
      .eq("id", spaceToUpdate.dbId);

    if (error) {
      console.error("Error updating space:", error);
      return;
    }

    // Update local state
    setSpaces(prev => prev.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          name: updates.name ?? s.name,
          color: updates.color ?? s.color,
        };
      }
      return s;
    }));
  };

  // Get the active space
  const activeSpace = spaces.find((space) => space.id === activeSpaceId);

  // Show loading state (minimum 2 seconds to see animation, max 5 seconds timeout)
  const [showLoader, setShowLoader] = useState(true);
  const [loadStartTime] = useState(() => Date.now());
  
  useEffect(() => {
    // Calculate remaining time to show loader (minimum 2 seconds)
    const elapsed = Date.now() - loadStartTime;
    const minDisplayTime = 2000; // 2 seconds minimum
    const remainingTime = Math.max(0, minDisplayTime - elapsed);
    
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoader(false), remainingTime);
      return () => clearTimeout(timer);
    }
    
    // Safety timeout - never show loader for more than 5 seconds
    const safetyTimer = setTimeout(() => {
      console.log("Safety timeout triggered - hiding loader");
      setShowLoader(false);
    }, 5000);
    
    return () => clearTimeout(safetyTimer);
  }, [isLoading, loadStartTime]);

  if (isLoading || showLoader) {
    return <TeamlyLoader />;
  }

  // Show login page if not logged in
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen w-full flex bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView === "settings" ? "dashboard" : activeView as "dashboard" | "space" | "inbox" | "calendar" | "echo"}
        activeSpaceId={activeSpaceId}
        onViewChange={handleViewChange}
        inboxUnreadCount={inboxUnreadCount}
        spaces={spaces}
        onCreateSpace={handleCreateSpace}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar 
          activeView={activeView === "settings" ? "dashboard" : activeView} 
          onProfileSettingsClick={handleProfileSettingsClick}
          activeSpaceId={activeSpace?.dbId}
          activeSpaceName={activeSpace?.name}
        />

        {/* Content Area */}
        {activeView === "dashboard" ? (
          <Dashboard />
        ) : activeView === "inbox" ? (
          <Inbox 
            onNavigateToSpace={(dbId) => {
              // Find the space by dbId and navigate to it
              const space = spaces.find(s => s.dbId === dbId);
              if (space) {
                setActiveSpaceId(space.id);
                setActiveView("space");
              } else {
                // Refresh spaces and try again
                fetchSpaces();
              }
            }}
          />
        ) : activeView === "calendar" ? (
          <Calendar />
        ) : activeView === "settings" ? (
          <ProfileSettings />
        ) : activeView === "echo" ? (
          <EchoPage />
        ) : (
          <SpaceView
            spaceId={activeSpaceId || 1}
            spaceDbId={activeSpace?.dbId}
            spaceName={activeSpace?.name || ""}
            spaceColor={activeSpace?.color || "bg-purple-500"}
            initialMembers={activeSpace?.members || []}
            onLeaveSpace={handleLeaveSpace}
            onDeleteSpace={handleDeleteSpace}
            onArchiveSpace={handleArchiveSpace}
            onUpdateSpace={handleUpdateSpace}
          />
        )}
      </div>
    </div>
  );
}
