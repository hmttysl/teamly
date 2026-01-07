"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Inbox } from "@/components/inbox/Inbox";
import { Calendar } from "@/components/calendar/Calendar";
import { SpaceView } from "@/components/space/SpaceView";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { spaces as initialSpaces } from "@/lib/mock-data";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "space" | "inbox" | "calendar" | "settings">("dashboard");
  const [activeSpaceId, setActiveSpaceId] = useState<number | undefined>(1);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(3);
  const [spaces, setSpaces] = useState(initialSpaces);

  const handleViewChange = (view: "dashboard" | "space" | "inbox" | "calendar", spaceId?: number) => {
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

  const handleCreateSpace = (name: string, color: string) => {
    const newSpace = {
      id: Math.max(...spaces.map(s => s.id), 0) + 1,
      name,
      color,
    };
    setSpaces([...spaces, newSpace]);
    // Automatically navigate to the new space
    setActiveView("space");
    setActiveSpaceId(newSpace.id);
  };

  const handleLeaveSpace = (spaceId: number) => {
    // Remove the space from the list (simulating leaving)
    setSpaces(spaces.filter(s => s.id !== spaceId));
    // Navigate to dashboard
    setActiveView("dashboard");
    setActiveSpaceId(undefined);
  };

  const handleDeleteSpace = (spaceId: number) => {
    // Remove the space from the list
    setSpaces(spaces.filter(s => s.id !== spaceId));
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

  const handleUpdateSpace = (spaceId: number, updates: { name?: string; description?: string; color?: string }) => {
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

  return (
    <div className="h-screen w-full flex bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView === "settings" ? "dashboard" : activeView}
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
