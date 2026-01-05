// Spaces data
export const spaces = [
  { id: 1, name: "Website Redesign", color: "bg-purple-500" },
  { id: 2, name: "Mobile App", color: "bg-red-500" },
  { id: 3, name: "Marketing Campaign", color: "bg-pink-500" },
];

// Current user (logged in user)
export const currentUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@company.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
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
const getRelativeTime = (days: number): string => {
  if (days === 0) return "Just now";
  if (days === 1) return "1h ago";
  if (days < 24) return `${days}h ago`;
  if (days < 48) return "1d ago";
  return `${Math.floor(days / 24)}d ago`;
};

// Mock data for tasks assigned to current user from multiple spaces
export const myTasks = [
  {
    id: 1,
    title: "Design new landing page",
    description: "Create mockups and wireframes for the new marketing landing page with updated brand colors",
    assignee: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      initials: "SC",
    },
    assignees: [
      {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        initials: "SC",
      },
    ],
    dueDate: addDays(0), // Today
    createdAt: addDays(-5),
    space: {
      name: "Website Redesign",
      color: "bg-purple-500",
    },
  },
  {
    id: 4,
    title: "Implement authentication",
    description: "Add OAuth 2.0 authentication flow with social login options",
    assignee: {
      name: "Alex Turner",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      initials: "AT",
    },
    assignees: [
      {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      {
        name: "Alex Turner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        initials: "AT",
      },
    ],
    dueDate: addDays(-2), // Overdue
    createdAt: addDays(-10),
    space: {
      name: "Mobile App",
      color: "bg-red-500",
    },
  },
  {
    id: 10,
    title: "Email campaign design",
    description: "Create email templates for Q1 marketing campaign",
    assignee: {
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      initials: "JD",
    },
    assignees: [
      {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        initials: "SC",
      },
    ],
    dueDate: addDays(5), // In 5 days
    createdAt: addDays(-2),
    space: {
      name: "Marketing Campaign",
      color: "bg-pink-500",
    },
  },
];

// Weekly progress data
export const weeklyData = [
  { day: "Monday", completed: 4 },
  { day: "Tuesday", completed: 7 },
  { day: "Wednesday", completed: 5 },
  { day: "Thursday", completed: 8 },
  { day: "Friday", completed: 3 },
  { day: "Saturday", completed: 0 },
  { day: "Sunday", completed: 0 },
];

// Kanban board tasks - with John Doe assigned to some tasks
export const kanbanTasks = {
  todo: [
    {
      id: 1,
      title: "Design new landing page",
      description: "Create mockups and wireframes for the new marketing landing page with updated brand colors",
      assignee: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      assignees: [
        {
          name: "John Doe",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          initials: "JD",
        },
        {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          initials: "SC",
        },
      ],
      dueDate: addDays(0), // Today
      createdAt: addDays(-5),
      space: {
        name: "Website Redesign",
        color: "bg-purple-500",
      },
    },
    {
      id: 2,
      title: "Update documentation",
      description: "Review and update API documentation to reflect latest changes in version 2.0",
      assignee: {
        name: "Mike Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        initials: "MJ",
      },
      assignees: [
        {
          name: "Mike Johnson",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
          initials: "MJ",
        },
      ],
      dueDate: addDays(7), // In a week
      createdAt: addDays(-3),
      space: {
        name: "Mobile App",
        color: "bg-red-500",
      },
    },
    {
      id: 3,
      title: "Client feedback review",
      description: "Analyze and compile feedback from recent client surveys",
      assignee: {
        name: "Emma Davis",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        initials: "ED",
      },
      assignees: [
        {
          name: "Emma Davis",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
          initials: "ED",
        },
      ],
      dueDate: addDays(3), // In 3 days
      createdAt: addDays(-2),
      space: {
        name: "Website Redesign",
        color: "bg-purple-500",
      },
    },
  ],
  inProgress: [
    {
      id: 4,
      title: "Implement authentication",
      description: "Add OAuth 2.0 authentication flow with social login options",
      assignee: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      assignees: [
        {
          name: "John Doe",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          initials: "JD",
        },
        {
          name: "Alex Turner",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
          initials: "AT",
        },
      ],
      dueDate: addDays(-1), // Overdue (yesterday)
      createdAt: addDays(-10),
      space: {
        name: "Mobile App",
        color: "bg-red-500",
      },
    },
    {
      id: 5,
      title: "Database optimization",
      description: "Optimize queries and add indexes to improve performance",
      assignee: {
        name: "David Lee",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        initials: "DL",
      },
      assignees: [
        {
          name: "David Lee",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
          initials: "DL",
        },
      ],
      dueDate: addDays(1), // Tomorrow
      createdAt: addDays(-4),
      space: {
        name: "Mobile App",
        color: "bg-red-500",
      },
    },
  ],
  review: [
    {
      id: 6,
      title: "Mobile app testing",
      description: "Conduct comprehensive testing on iOS and Android devices",
      assignee: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      assignees: [
        {
          name: "John Doe",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          initials: "JD",
        },
        {
          name: "Lisa Wang",
          avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
          initials: "LW",
        },
      ],
      dueDate: addDays(0), // Today
      createdAt: addDays(-6),
      space: {
        name: "Mobile App",
        color: "bg-red-500",
      },
    },
    {
      id: 7,
      title: "Security audit report",
      description: "Review findings from third-party security assessment",
      assignee: {
        name: "Ryan Martinez",
        avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop",
        initials: "RM",
      },
      assignees: [
        {
          name: "Ryan Martinez",
          avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop",
          initials: "RM",
        },
      ],
      dueDate: addDays(2), // In 2 days
      createdAt: addDays(-5),
      space: {
        name: "Website Redesign",
        color: "bg-purple-500",
      },
    },
  ],
  done: [
    {
      id: 8,
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment workflows",
      assignee: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        initials: "JD",
      },
      assignees: [
        {
          name: "John Doe",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          initials: "JD",
        },
        {
          name: "Chris Anderson",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
          initials: "CA",
        },
      ],
      dueDate: addDays(-3), // Completed before due
      createdAt: addDays(-14),
      completedAt: addDays(0), // Completed today
      space: {
        name: "Mobile App",
        color: "bg-red-500",
      },
    },
    {
      id: 9,
      title: "Brand guidelines update",
      description: "Finalize and publish updated brand identity guidelines",
      assignee: {
        name: "Jessica Brown",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        initials: "JB",
      },
      assignees: [
        {
          name: "Jessica Brown",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
          initials: "JB",
        },
      ],
      dueDate: addDays(-5),
      createdAt: addDays(-12),
      completedAt: addDays(-6),
      space: {
        name: "Marketing Campaign",
        color: "bg-pink-500",
      },
    },
  ],
};

// Inbox items - now specific to current user (John Doe)
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

// Generate inbox items relevant to current user
export const mockInboxItems: InboxItem[] = [
  {
    id: 1,
    type: "task_assigned",
    title: "Design new landing page",
    context: "Sarah Chen assigned you to this task",
    spaceName: "Website Redesign",
    spaceColor: "bg-purple-500",
    timestamp: "2h ago",
    isRead: false,
    taskId: 1,
    dueDate: addDays(0),
    fromUser: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      initials: "SC",
    },
  },
  {
    id: 2,
    type: "mention",
    title: "You were mentioned in \"API Integration\"",
    context: "Mike Johnson mentioned you: \"@John Doe can you review this?\"",
    spaceName: "Mobile App",
    spaceColor: "bg-red-500",
    timestamp: "5h ago",
    isRead: false,
    taskId: 4,
    fromUser: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      initials: "MJ",
    },
  },
  {
    id: 3,
    type: "space_invite",
    title: "Invited to Marketing Campaign",
    context: "Emily Davis invited you to join this space",
    spaceName: "Marketing Campaign",
    spaceColor: "bg-pink-500",
    timestamp: "1d ago",
    isRead: false,
    spaceId: 3,
    fromUser: {
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      initials: "ED",
    },
  },
  {
    id: 4,
    type: "task_assigned",
    title: "Implement authentication",
    context: "Alex Turner assigned you to this task",
    spaceName: "Mobile App",
    spaceColor: "bg-red-500",
    timestamp: "2d ago",
    isRead: true,
    taskId: 4,
    dueDate: addDays(-1),
    fromUser: {
      name: "Alex Turner",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      initials: "AT",
    },
  },
  {
    id: 5,
    type: "comment",
    title: "New comment on \"Setup CI/CD pipeline\"",
    context: "Chris Anderson: \"Great work on the pipeline setup!\"",
    spaceName: "Mobile App",
    spaceColor: "bg-red-500",
    timestamp: "3d ago",
    isRead: true,
    taskId: 8,
    fromUser: {
      name: "Chris Anderson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      initials: "CA",
    },
  },
  {
    id: 6,
    type: "task_completed",
    title: "\"Setup CI/CD pipeline\" marked as complete",
    context: "You completed this task",
    spaceName: "Mobile App",
    spaceColor: "bg-red-500",
    timestamp: "3d ago",
    isRead: true,
    taskId: 8,
  },
];

// Space members
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
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    role: "Owner",
    initials: "SC",
    isOnline: true,
  },
  {
    id: 2,
    name: "Alex Turner",
    email: "alex.turner@company.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    role: "Lead",
    initials: "AT",
    isOnline: true,
  },
  {
    id: 3,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    role: "Teammate",
    initials: "LW",
    isOnline: false,
    lastSeen: "10 min ago",
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike.j@company.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    role: "Teammate",
    initials: "MJ",
    isOnline: false,
    lastSeen: "2h ago",
  },
  {
    id: 5,
    name: "Emma Davis",
    email: "emma.davis@company.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "Teammate",
    initials: "ED",
    isOnline: true,
  },
];

// Notifications
export const mockNotifications = [
  {
    id: 1,
    type: "comment",
    user: {
      name: "Insan Kamil",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      initials: "IK",
      online: true,
    },
    action: "Commented in",
    location: "SaaS Management",
    time: "Friday 3:12 PM",
    category: "SaaS Product",
    content: "Really love this approach. I think this is the best solution for the document for sync Automation issue.",
    actionButton: "Reply",
  },
  {
    id: 2,
    type: "invite",
    user: {
      name: "John",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      initials: "JN",
      online: false,
    },
    action: "Invited you to",
    location: "Dashboard Payment",
    time: "Thursday 2:20 PM",
    category: "New Product",
    actionButtons: ["Decline", "Accept"],
  },
  {
    id: 3,
    type: "file",
    user: {
      name: "Miguel Lorenzo",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop",
      initials: "ML",
      online: false,
    },
    action: "Imported a new file in",
    location: "SaaS Management",
    time: "Friday 3:12 PM",
    category: "SaaS Product",
    fileName: "Data Management.csv",
    actionButton: "Download",
  },
];

// Task activities
export const mockActivities = [
  {
    id: 1,
    user: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      initials: "SC",
    },
    action: "changed status to",
    value: "In Progress",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      initials: "MJ",
    },
    action: "commented",
    comment: "This looks great! Let's move forward with this approach.",
    time: "5 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Emma Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      initials: "ED",
    },
    action: "attached",
    value: "design-mockup.fig",
    time: "1 day ago",
  },
];
