"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Bell, UserPlus, Calendar, CheckSquare, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { InviteMembersDialog } from "@/components/dialogs/InviteMembersDialog";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTasks } from "@/lib/use-tasks";
import { spaces, spaceMembers } from "@/lib/mock-data";

interface TopBarProps {
  activeView: "dashboard" | "space" | "inbox" | "calendar" | "settings";
  onProfileSettingsClick: () => void;
  onNavigateToSpace?: (spaceId: number) => void;
  onOpenTask?: (taskId: number, spaceId: number) => void;
  onNavigateToInbox?: () => void;
}

export function TopBar({ activeView, onProfileSettingsClick, onNavigateToSpace, onOpenTask, onNavigateToInbox }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { allTasks } = useTasks();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { tasks: [], spaces: [], members: [] };

    const query = searchQuery.toLowerCase();

    const filteredTasks = allTasks
      .filter(t => t.title.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query))
      .slice(0, 5);

    const filteredSpaces = spaces
      .filter(s => s.name.toLowerCase().includes(query))
      .slice(0, 3);

    const filteredMembers = spaceMembers
      .filter(m => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query))
      .slice(0, 3);

    return { tasks: filteredTasks, spaces: filteredSpaces, members: filteredMembers };
  }, [searchQuery, allTasks]);

  const hasResults = searchResults.tasks.length > 0 || searchResults.spaces.length > 0 || searchResults.members.length > 0;
  const showDropdown = isSearchFocused && searchQuery.trim().length > 0;

  return (
    <div className="h-16 bg-white dark:bg-background border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search tasks, projects, or members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-10 pr-8 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 overflow-hidden">
            {!hasResults ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchQuery}"
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {/* Tasks */}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800">
                      Tasks
                    </div>
                    {searchResults.tasks.map((task) => (
                      <button
                        key={task.id}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchFocused(false);
                          if (onOpenTask && task.spaceId) {
                            onOpenTask(task.id, task.spaceId);
                          }
                        }}
                      >
                        <CheckSquare className="w-4 h-4 text-[#6B2FD9]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.space?.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Spaces */}
                {searchResults.spaces.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800">
                      Spaces
                    </div>
                    {searchResults.spaces.map((space) => (
                      <button
                        key={space.id}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchFocused(false);
                          if (onNavigateToSpace) {
                            onNavigateToSpace(space.id);
                          }
                        }}
                      >
                        <div className={`w-4 h-4 rounded ${space.color}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{space.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Members */}
                {searchResults.members.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800">
                      Members
                    </div>
                    {searchResults.members.map((member) => (
                      <button
                        key={member.id}
                        className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 text-left"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchFocused(false);
                          // Members don't have a dedicated page, just close the search
                        }}
                      >
                        <Users className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <NotificationPopover
          onNavigateToSpace={onNavigateToSpace}
          onOpenTask={onOpenTask}
          onNavigateToInbox={onNavigateToInbox}
        >
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#6B2FD9] rounded-full"></span>
          </Button>
        </NotificationPopover>

        {/* Only show Invite button when viewing a space */}
        {activeView === "space" && (
          <InviteMembersDialog>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#6B2FD9]/30 text-[#6B2FD9] hover:bg-[#6B2FD9]/10 hover:text-[#6B2FD9]"
            >
              <div className="relative">
                <UserPlus className="w-4 h-4" />
              </div>
              Invite
            </Button>
          </InviteMembersDialog>
        )}
        
        <ProfileMenu onProfileSettingsClick={onProfileSettingsClick} />
      </div>
    </div>
  );
}

