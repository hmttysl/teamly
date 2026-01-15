// Spaces data - Empty for fresh account
export const spaces: { id: number; name: string; color: string }[] = [];

// Current user (logged in user)
export const currentUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@company.com",
  avatar: "",
  initials: "JD",
};

// Helper to create dates relative to today
const today = new Date();
const addDays = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Helper to create relative time strings
export const getRelativeTime = (days: number): string => {
  if (days === 0) return "Just now";
  if (days === 1) return "1h ago";
  if (days < 24) return `${days}h ago`;
  if (days < 48) return "1d ago";
  return `${Math.floor(days / 24)}d ago`;
};

// Mock data for tasks - Empty for fresh account
export const myTasks: {
  id: number;
  title: string;
  description: string;
  assignee: { name: string; avatar: string; initials: string };
  assignees: { name: string; avatar: string; initials: string }[];
  dueDate: string;
  createdAt: string;
  space: { name: string; color: string };
}[] = [];

// Weekly progress data - Empty for fresh account
export const weeklyData = [
  { day: "Monday", completed: 0 },
  { day: "Tuesday", completed: 0 },
  { day: "Wednesday", completed: 0 },
  { day: "Thursday", completed: 0 },
  { day: "Friday", completed: 0 },
  { day: "Saturday", completed: 0 },
  { day: "Sunday", completed: 0 },
];

// Kanban board tasks - Empty for fresh account
export const kanbanTasks: {
  todo: any[];
  inProgress: any[];
  review: any[];
  done: any[];
} = {
  todo: [],
  inProgress: [],
  review: [],
  done: [],
};

// Inbox items - Empty for fresh account
export type InboxItemType = "task_assigned" | "space_invite" | "mention" | "task_completed" | "comment";

export interface InboxItem {
  id: number;
  type: InboxItemType;
  title: string;
  context: string;
  spaceName: string;
  spaceColor: string;
  timestamp: string;
  isRead: boolean;
  taskId?: number;
  spaceId?: number;
  dueDate?: string;
  fromUser?: {
    name: string;
    avatar: string;
    initials: string;
  };
}

// Empty inbox for fresh account
export const mockInboxItems: InboxItem[] = [];

// Space members - Only current user for fresh account
export interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: "Owner" | "Lead" | "Teammate";
  initials: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const spaceMembers: Member[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "",
    role: "Owner",
    initials: "JD",
    isOnline: true,
  },
];

// Notifications - Empty for fresh account
export const mockNotifications: {
  id: number;
  type: string;
  user: { name: string; avatar: string; initials: string; online: boolean };
  action: string;
  location: string;
  time: string;
  category: string;
  content?: string;
  actionButton?: string;
  actionButtons?: string[];
  fileName?: string;
}[] = [];

// Task activities - Empty for fresh account
export const mockActivities: {
  id: number;
  user: { name: string; avatar: string; initials: string };
  action: string;
  value?: string;
  comment?: string;
  time: string;
}[] = [];
