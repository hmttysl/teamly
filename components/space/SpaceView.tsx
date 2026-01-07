"use client";

import { useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { SpaceMembers } from "./SpaceMembers";
import { SpaceSettings } from "./SpaceSettings";

interface SpaceViewProps {
  spaceId: number;
  spaceName: string;
  spaceColor?: string;
  onLeaveSpace?: (spaceId: number) => void;
  onDeleteSpace?: (spaceId: number) => void;
  onArchiveSpace?: (spaceId: number) => void;
  onUpdateSpace?: (spaceId: number, updates: { name?: string; description?: string; color?: string }) => void;
}

type TabType = "board" | "members" | "settings";

export function SpaceView({ 
  spaceId, 
  spaceName,
  spaceColor = "bg-purple-500",
  onLeaveSpace,
  onDeleteSpace,
  onArchiveSpace,
  onUpdateSpace,
}: SpaceViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("board");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
            Board
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-[#6B2FD9] text-[#6B2FD9] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-4 px-1 border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-[#6B2FD9] text-[#6B2FD9] font-medium"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "board" && <KanbanBoard spaceId={spaceId} spaceName={spaceName} spaceColor={spaceColor} />}
      {activeTab === "members" && <SpaceMembers spaceName={spaceName} />}
      {activeTab === "settings" && (
        <SpaceSettings 
          spaceName={spaceName} 
          spaceId={spaceId}
          spaceColor={spaceColor}
          onLeaveSpace={onLeaveSpace}
          onDeleteSpace={onDeleteSpace}
          onArchiveSpace={onArchiveSpace}
          onUpdateSpace={onUpdateSpace}
        />
      )}
    </div>
  );
}
