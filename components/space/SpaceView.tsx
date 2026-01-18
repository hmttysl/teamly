"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { SpaceMembers } from "./SpaceMembers";
import { SpaceSettings } from "./SpaceSettings";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { EditableTagline } from "@/components/ui/EditableTagline";

interface SpaceMember {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface SpaceViewProps {
  spaceId: number;
  spaceDbId?: string; // Supabase UUID
  spaceName: string;
  spaceColor?: string;
  initialMembers?: SpaceMember[];
  onLeaveSpace?: (spaceId: number) => void;
  onDeleteSpace?: (spaceId: number) => void;
  onArchiveSpace?: (spaceId: number) => void;
  onUpdateSpace?: (spaceId: number, updates: { name?: string; description?: string; color?: string }) => void;
}

type TabType = "board" | "members" | "settings";

export function SpaceView({ 
  spaceId, 
  spaceDbId,
  spaceName,
  spaceColor = "bg-purple-500",
  initialMembers = [],
  onLeaveSpace,
  onDeleteSpace,
  onArchiveSpace,
  onUpdateSpace,
}: SpaceViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("board");
  const [spaceDataCache, setSpaceDataCache] = useState<Record<string, {
    members: SpaceMember[];
    tagline: string;
    userRole: string | null;
  }>>({});
  const { t } = useLanguage();
  const { user } = useAuth();

  // Get current space data from cache or use initialMembers as fallback
  const currentSpaceData = spaceDbId ? spaceDataCache[spaceDbId] : null;
  const members = currentSpaceData?.members?.length ? currentSpaceData.members : initialMembers;
  const tagline = currentSpaceData?.tagline || "";
  const userRole = currentSpaceData?.userRole || null;

  // Check if user can edit (Owner or Lead)
  const canEditTagline = userRole === "owner" || userRole === "Owner" || userRole === "lead" || userRole === "Lead";

  // Fetch space members, role and tagline
  useEffect(() => {
    // Track if this effect is still active (for cleanup)
    let isActive = true;
    
    const fetchSpaceData = async () => {
      if (!spaceDbId) return;

      // Fetch all data in parallel for speed
      const [membersResult, spaceResult] = await Promise.all([
        supabase
          .from("space_members")
          .select(`
            user_id,
            role,
            profiles:user_id (
              id,
              name,
              avatar_url
            )
          `)
          .eq("space_id", spaceDbId),
        supabase
          .from("spaces")
          .select("description")
          .eq("id", spaceDbId)
          .single()
      ]);

      // Only update state if this effect is still active
      if (!isActive) return;

      let newMembers: SpaceMember[] = [];
      let newUserRole: string | null = null;

      // Process members
      if (!membersResult.error && membersResult.data) {
        newMembers = membersResult.data
          .filter((m: any) => m.profiles)
          .map((m: any) => ({
            id: m.profiles.id,
            name: m.profiles.name || "User",
            avatar_url: m.profiles.avatar_url,
          }));

        // Find current user's role
        if (user) {
          const currentUserMember = membersResult.data.find((m: any) => m.user_id === user.id);
          if (currentUserMember) {
            newUserRole = currentUserMember.role;
          }
        }
      }

      // Update cache for this space
      setSpaceDataCache(prev => ({
        ...prev,
        [spaceDbId]: {
          members: newMembers,
          tagline: spaceResult.data?.description || "",
          userRole: newUserRole,
        }
      }));
    };

    fetchSpaceData();

    // Subscribe to real-time updates for this space (only if spaceDbId exists)
    let subscription: ReturnType<typeof supabase.channel> | null = null;
    
    if (spaceDbId) {
      const currentSpaceDbId = spaceDbId; // Capture for closure
      subscription = supabase
        .channel(`space-${spaceDbId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'spaces', filter: `id=eq.${spaceDbId}` },
          (payload) => {
            if (isActive && payload.new && typeof payload.new === 'object' && 'description' in payload.new) {
              setSpaceDataCache(prev => ({
                ...prev,
                [currentSpaceDbId]: {
                  ...prev[currentSpaceDbId],
                  tagline: (payload.new as { description: string }).description || "",
                }
              }));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'space_members', filter: `space_id=eq.${spaceDbId}` },
          () => {
            // Refresh members when membership changes
            if (isActive) {
              fetchSpaceData();
            }
          }
        )
        .subscribe();
    }

    return () => {
      isActive = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [spaceDbId, user]);

  // Handle tagline save
  const handleSaveTagline = async (newTagline: string) => {
    if (!spaceDbId) return;

    // Optimistic update - update cache immediately
    setSpaceDataCache(prev => ({
      ...prev,
      [spaceDbId]: {
        ...prev[spaceDbId],
        tagline: newTagline,
      }
    }));

    const { error } = await supabase
      .from("spaces")
      .update({ description: newTagline, updated_at: new Date().toISOString() })
      .eq("id", spaceDbId);

    if (error) {
      console.error("Failed to save tagline:", error);
      throw error;
    }
  };

  const displayMembers = members.slice(0, 5);
  const extraCount = members.length > 5 ? members.length - 5 : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Space Header */}
      <div className="bg-white dark:bg-background px-8 pt-6 pb-4">
        <div className="flex items-center gap-6">
          <div className={`w-3 h-3 rounded-full ${spaceColor}`}></div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{spaceName}</h1>
              
              {/* Member Avatars - Right next to title */}
              {displayMembers.length > 0 && (
                <div className="flex items-center pl-4 border-l border-gray-300 dark:border-zinc-600">
                  <div className="flex -space-x-2">
                    {displayMembers.map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full border-[3px] border-white dark:border-zinc-900 overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-sm"
                        title={member.name}
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-white font-medium">
                            {member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </span>
                        )}
                      </div>
                    ))}
                    {extraCount > 0 && (
                      <div className="w-8 h-8 rounded-full border-[3px] border-white dark:border-zinc-900 bg-gray-100 dark:bg-zinc-700 flex items-center justify-center shadow-sm">
                        <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold">+{extraCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <EditableTagline
              value={tagline}
              canEdit={canEditTagline}
              onSave={handleSaveTagline}
              placeholder="Add a description..."
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-background px-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("board")}
            className={`py-4 px-1 border-b-2 transition-colors relative ${
              activeTab === "board"
                ? "border-[#6B2FD9] text-[#6B2FD9] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.board}
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-[#6B2FD9] text-[#6B2FD9] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.members}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-[#6B2FD9] text-[#6B2FD9] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {t.settings}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "board" && <KanbanBoard spaceId={spaceId} spaceDbId={spaceDbId} spaceName={spaceName} spaceColor={spaceColor} />}
      {activeTab === "members" && <SpaceMembers spaceName={spaceName} spaceId={spaceDbId} />}
      {activeTab === "settings" && (
        <SpaceSettings 
          spaceName={spaceName} 
          spaceId={spaceId}
          spaceDbId={spaceDbId}
          spaceColor={spaceColor}
          spaceDescription={tagline}
          onLeaveSpace={onLeaveSpace}
          onDeleteSpace={onDeleteSpace}
          onArchiveSpace={onArchiveSpace}
          onUpdateSpace={onUpdateSpace}
          onDescriptionChange={(newDescription: string) => {
            // Update local cache when description changes
            if (spaceDbId) {
              setSpaceDataCache(prev => ({
                ...prev,
                [spaceDbId]: {
                  ...prev[spaceDbId],
                  tagline: newDescription,
                }
              }));
            }
          }}
        />
      )}
    </div>
  );
}
