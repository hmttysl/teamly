"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Inbox } from "@/components/inbox/Inbox";
import { Calendar } from "@/components/calendar/Calendar";
import { SpaceView } from "@/components/space/SpaceView";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { spaces as initialSpaces } from "@/lib/mock-data";
import { useTasks } from "@/lib/use-tasks";
import { useInbox } from "@/lib/use-inbox";

export default function Home() {
  const [activeView, setActiveView] = useState<"dashboard" | "space" | "inbox" | "calendar" | "settings">("dashboard");
  const [activeSpaceId, setActiveSpaceId] = useState<number | undefined>(1);
  const [spaces, setSpaces] = useState(initialSpaces);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  const { allTasks } = useTasks();
  const { unreadCount: inboxUnreadCount, markAllAsRead } = useInbox();

  // Find selected task from all tasks
  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return allTasks.find(task => task.id === selectedTaskId) || null;
  }, [selectedTaskId, allTasks]);

  const handleViewChange = (view: "dashboard" | "space" | "inbox" | "calendar", spaceId?: number) => {
    setActiveView(view);
    if (spaceId !== undefined) {
      setActiveSpaceId(spaceId);
    }
    // Mark all as read when viewing inbox
    if (view === "inbox") {
      markAllAsRead();
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

  // Inbox handlers
  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsTaskDrawerOpen(true);
  };

  const handleAcceptInvite = (spaceId: number) => {
    // Find or create the space
    const existingSpace = spaces.find(s => s.id === spaceId);
    if (!existingSpace) {
      // Add the space (simulating accepting invite)
      const newSpace = {
        id: spaceId,
        name: spaceId === 3 ? "Marketing Campaign" : `Space ${spaceId}`,
        color: spaceId === 3 ? "bg-pink-500" : "bg-[#6B2FD9]",
      };
      setSpaces([...spaces, newSpace]);
    }
    // Navigate to the space
    setActiveView("space");
    setActiveSpaceId(spaceId);
  };

  const handleDeclineInvite = (spaceId: number) => {
    // Just decline - remove from spaces if it was added
    // In real app, this would update the backend
    console.log("Declined invite to space:", spaceId);
  };

  const handleCloseTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setSelectedTaskId(null);
  };

  // Search navigation handlers
  const handleNavigateToSpace = (spaceId: number) => {
    setActiveView("space");
    setActiveSpaceId(spaceId);
  };

  const handleOpenTaskFromSearch = (taskId: number, spaceId: number) => {
    // Navigate to the space first
    setActiveView("space");
    setActiveSpaceId(spaceId);
    // Then open the task drawer
    setSelectedTaskId(taskId);
    setIsTaskDrawerOpen(true);
  };

  const handleNavigateToInbox = () => {
    setActiveView("inbox");
    markAllAsRead();
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
          onNavigateToSpace={handleNavigateToSpace}
          onOpenTask={handleOpenTaskFromSearch}
          onNavigateToInbox={handleNavigateToInbox}
        />

        {/* Content Area */}
        {activeView === "dashboard" ? (
          <Dashboard />
        ) : activeView === "inbox" ? (
          <Inbox 
            onTaskClick={handleTaskClick}
            onAcceptInvite={handleAcceptInvite}
            onDeclineInvite={handleDeclineInvite}
          />
        ) : activeView === "calendar" ? (
          <Calendar />
        ) : activeView === "settings" ? (
          <ProfileSettings />
        ) : (
          <SpaceView
            spaceId={activeSpaceId || 1}
            spaceName={activeSpace?.name || ""}
            spaceColor={activeSpace?.color || "bg-[#6B2FD9]"}
            onLeaveSpace={handleLeaveSpace}
            onDeleteSpace={handleDeleteSpace}
            onArchiveSpace={handleArchiveSpace}
            onUpdateSpace={handleUpdateSpace}
          />
        )}
      </div>

      {/* Task Detail Drawer for Inbox */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isTaskDrawerOpen}
        onClose={handleCloseTaskDrawer}
      />
    </div>
  );
}
