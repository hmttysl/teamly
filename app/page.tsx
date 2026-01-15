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

interface Space {
  id: number;
  name: string;
  color: string;
}

export default function Home() {
  const { user, profile, isLoading } = useAuth();
  
  const [activeView, setActiveView] = useState<"dashboard" | "space" | "inbox" | "calendar" | "settings" | "echo">("dashboard");
  const [activeSpaceId, setActiveSpaceId] = useState<number | undefined>(undefined);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [spacesLoading, setSpacesLoading] = useState(true);

  // Fetch user's spaces from Supabase
  useEffect(() => {
    if (user) {
      fetchSpaces();
    } else {
      setSpaces([]);
      setSpacesLoading(false);
    }
  }, [user]);

  const fetchSpaces = async () => {
    if (!user) return;
    
    setSpacesLoading(true);
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .order("created_at", { ascending: true });

    if (error && error.message) {
      console.error("Error fetching spaces:", error.message);
    } else if (data) {
      // Convert UUID to number for compatibility with existing code
      const mappedSpaces = data.map((space, index) => ({
        id: index + 1,
        dbId: space.id, // Keep the original UUID
        name: space.name,
        color: space.color,
      }));
      setSpaces(mappedSpaces);
    }
    setSpacesLoading(false);
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
      console.error("Error creating space:", error);
      return;
    }

    if (data) {
      // Also add the owner as a member
      await supabase
        .from("space_members")
        .insert({
          space_id: data.id,
          user_id: user.id,
          role: "owner",
        });

      // Refresh spaces
      await fetchSpaces();
      
      // Navigate to the new space
      const newSpaceIndex = spaces.length + 1;
      setActiveView("space");
      setActiveSpaceId(newSpaceIndex);
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
    if (!spaceToDelete || !user) return;

    // Delete from Supabase
    const { error } = await supabase
      .from("spaces")
      .delete()
      .eq("id", (spaceToDelete as any).dbId);

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
    if (!spaceToUpdate) return;

    const { error } = await supabase
      .from("spaces")
      .update({
        name: updates.name,
        color: updates.color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (spaceToUpdate as any).dbId);

    if (error) {
      console.error("Error updating space:", error);
      return;
    }

    // Update local state
    setSpaces(spaces.map(s => {
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/logo2.png" 
            alt="Teamly Logo" 
            className="w-16 h-16 object-contain animate-pulse"
          />
          <div className="w-8 h-8 border-4 border-[#6B2FD9]/30 border-t-[#6B2FD9] rounded-full animate-spin" />
        </div>
      </div>
    );
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
        />

        {/* Content Area */}
        {activeView === "dashboard" ? (
          <Dashboard />
        ) : activeView === "inbox" ? (
          <Inbox />
        ) : activeView === "calendar" ? (
          <Calendar />
        ) : activeView === "settings" ? (
          <ProfileSettings />
        ) : activeView === "echo" ? (
          <EchoPage />
        ) : (
          <SpaceView
            spaceId={activeSpaceId || 1}
            spaceName={activeSpace?.name || ""}
            spaceColor={activeSpace?.color || "bg-purple-500"}
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
