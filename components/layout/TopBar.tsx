"use client";

import { Search, Bell, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { InviteMembersDialog } from "@/components/dialogs/InviteMembersDialog";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface TopBarProps {
  activeView: "dashboard" | "space" | "inbox" | "calendar" | "settings";
  onProfileSettingsClick: () => void;
}

export function TopBar({ activeView, onProfileSettingsClick }: TopBarProps) {
  return (
    <div className="h-16 bg-white dark:bg-background border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search tasks, projects, or members..."
            className="pl-10 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <NotificationPopover>
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

