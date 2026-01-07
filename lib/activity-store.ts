// Global Activity Store for Recent Activity tracking

export interface Activity {
  id: number;
  type: "comment" | "move" | "complete" | "create" | "assign" | "delete";
  user: {
    name: string;
    avatar: string;
  };
  taskTitle: string;
  taskId?: number;
  spaceId?: number;
  spaceName?: string;
  fromColumn?: string;
  toColumn?: string;
  timestamp: Date;
}

// Activity store
let activities: Activity[] = [];
let nextActivityId = 1;
let listeners: (() => void)[] = [];

// Initialize with some mock activities
const mockActivities: Activity[] = [
  {
    id: nextActivityId++,
    type: "comment",
    user: { name: "Sarah Jenkins", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    taskTitle: "Design new landing page",
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  {
    id: nextActivityId++,
    type: "move",
    user: { name: "Marcus Aurelius", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    taskTitle: "Email campaign",
    fromColumn: "To Do",
    toColumn: "In Progress",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
  },
  {
    id: nextActivityId++,
    type: "complete",
    user: { name: "Alex Riviera", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    taskTitle: "API Integration",
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: nextActivityId++,
    type: "create",
    user: { name: "John Cooper", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    taskTitle: "User research docs",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
];

activities = [...mockActivities];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export const activityStore = {
  getActivities: (limit?: number): Activity[] => {
    const sorted = [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  },

  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: nextActivityId++,
      timestamp: new Date(),
    };
    activities.unshift(newActivity);
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities = activities.slice(0, 50);
    }
    notifyListeners();
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },

  // Helper to format time ago
  formatTimeAgo: (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    if (diffDays < 7) return `${diffDays}D AGO`;
    return date.toLocaleDateString();
  },

  // Get action text based on activity type
  getActionText: (type: Activity["type"]): string => {
    switch (type) {
      case "comment": return "commented on";
      case "move": return "moved";
      case "complete": return "completed";
      case "create": return "created";
      case "assign": return "was assigned to";
      case "delete": return "deleted";
      default: return "updated";
    }
  },
};

