"use client";

import { LayoutGrid, Plus, Inbox, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateSpaceDialog } from "@/components/dialogs/CreateSpaceDialog";
import { currentUser } from "@/lib/mock-data";

interface Space {
  id: number;
  name: string;
  color: string;
}

interface SidebarProps {
  activeView: "dashboard" | "space" | "inbox" | "calendar";
  activeSpaceId?: number;
  onViewChange: (view: "dashboard" | "space" | "inbox" | "calendar", spaceId?: number) => void;
  inboxUnreadCount?: number;
  spaces: Space[];
  onCreateSpace?: (name: string, color: string) => void;
}

export function Sidebar({ activeView, activeSpaceId, onViewChange, inboxUnreadCount, spaces, onCreateSpace }: SidebarProps) {
  return (
    <div className="w-64 bg-white dark:bg-background border-r border-gray-200 dark:border-zinc-800 flex flex-col h-full">
      {/* Team Name */}
      <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6B2FD9] to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">T</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">Teamly</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Premium Team</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            activeView === "dashboard"
              ? "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9] hover:bg-[#6B2FD9]/20 dark:hover:bg-[#6B2FD9]/30"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => onViewChange("dashboard")}
        >
          <LayoutGrid className="w-4 h-4" />
          Dashboard
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 relative ${
            activeView === "inbox"
              ? "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9] hover:bg-[#6B2FD9]/20 dark:hover:bg-[#6B2FD9]/30"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => onViewChange("inbox")}
        >
          <Inbox className="w-4 h-4" />
          Inbox
          {inboxUnreadCount !== undefined && inboxUnreadCount > 0 && (
            <span className="ml-auto bg-[#6B2FD9] text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {inboxUnreadCount}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 ${
            activeView === "calendar"
              ? "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9] hover:bg-[#6B2FD9]/20 dark:hover:bg-[#6B2FD9]/30"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
          onClick={() => onViewChange("calendar")}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </Button>

        {/* Spaces Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Spaces
            </span>
            <CreateSpaceDialog onCreateSpace={onCreateSpace}>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-[#6B2FD9]/10 dark:hover:bg-[#6B2FD9]/20 hover:text-[#6B2FD9]">
                <Plus className="w-3 h-3" />
              </Button>
            </CreateSpaceDialog>
          </div>
          <div className="space-y-1">
            {spaces.map((space) => (
              <button
                key={space.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                  activeView === "space" && activeSpaceId === space.id
                    ? "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => onViewChange("space", space.id)}
              >
                <div className={`w-2 h-2 rounded-full ${space.color} flex-shrink-0`}></div>
                <span className="text-sm">{space.name}</span>
              </button>
            ))}
          </div>
        </div>

      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B2FD9] to-blue-500 flex items-center justify-center overflow-hidden">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-medium">{currentUser.initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
