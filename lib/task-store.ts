// Centralized task store for Teamly
// Tasks are organized by spaceId - each space has its own kanban board

import { currentUser } from "./mock-data";

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  assignees?: {
    name: string;
    avatar: string;
    initials: string;
  }[];
  dueDate: string;
  dueAt?: string | null;
  isAllDay?: boolean;
  createdAt: string;
  completedAt?: string;
  spaceId: number;
  space?: {
    name: string;
    color: string;
  };
  status?: "todo" | "inProgress" | "review" | "done";
}

export type KanbanColumn = "todo" | "inProgress" | "review" | "done";

export interface SpaceKanban {
  todo: Task[];
  inProgress: Task[];
  review: Task[];
  done: Task[];
}

export interface TaskStore {
  // Tasks organized by spaceId
  spaceKanbans: Record<number, SpaceKanban>;
}

// Helper to create dates relative to today
const today = new Date();
const addDays = (days: number): string => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Initial tasks for each space
const initialSpaceKanbans: Record<number, SpaceKanban> = {
  // Space 1: Website Redesign
  1: {
    todo: [
      {
        id: 101,
        title: "Design new landing page",
        description: "Create mockups and wireframes for the new marketing landing page",
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
        dueDate: addDays(2),
        createdAt: addDays(-5),
        spaceId: 1,
        space: { name: "Website Redesign", color: "bg-[#6B2FD9]" },
      },
      {
        id: 102,
        title: "Update navigation menu",
        description: "Redesign the main navigation with dropdown menus",
        assignee: {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          initials: "SC",
        },
        assignees: [
          {
            name: "Sarah Chen",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            initials: "SC",
          },
        ],
        dueDate: addDays(5),
        createdAt: addDays(-3),
        spaceId: 1,
        space: { name: "Website Redesign", color: "bg-[#6B2FD9]" },
      },
    ],
    inProgress: [
      {
        id: 103,
        title: "Implement responsive design",
        description: "Make all pages mobile-friendly",
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
        ],
        dueDate: addDays(0),
        createdAt: addDays(-7),
        spaceId: 1,
        space: { name: "Website Redesign", color: "bg-[#6B2FD9]" },
      },
    ],
    review: [
      {
        id: 104,
        title: "Review hero section design",
        description: "Get feedback on the new hero section",
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
        dueDate: addDays(1),
        createdAt: addDays(-4),
        spaceId: 1,
        space: { name: "Website Redesign", color: "bg-[#6B2FD9]" },
      },
    ],
    done: [
      {
        id: 105,
        title: "Create color palette",
        description: "Define brand colors for the new design",
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
        ],
        dueDate: addDays(-2),
        createdAt: addDays(-10),
        completedAt: addDays(0),
        spaceId: 1,
        space: { name: "Website Redesign", color: "bg-[#6B2FD9]" },
      },
    ],
  },
  // Space 2: Mobile App
  2: {
    todo: [
      {
        id: 201,
        title: "Design app icon",
        description: "Create multiple versions of the app icon",
        assignee: {
          name: "Lisa Wang",
          avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
          initials: "LW",
        },
        assignees: [
          {
            name: "Lisa Wang",
            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
            initials: "LW",
          },
        ],
        dueDate: addDays(4),
        createdAt: addDays(-2),
        spaceId: 2,
        space: { name: "Mobile App", color: "bg-red-500" },
      },
    ],
    inProgress: [
      {
        id: 202,
        title: "Implement authentication",
        description: "Add OAuth 2.0 authentication with social login",
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
        dueDate: addDays(-1),
        createdAt: addDays(-10),
        spaceId: 2,
        space: { name: "Mobile App", color: "bg-red-500" },
      },
      {
        id: 203,
        title: "Database optimization",
        description: "Optimize queries and add indexes",
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
        dueDate: addDays(1),
        createdAt: addDays(-4),
        spaceId: 2,
        space: { name: "Mobile App", color: "bg-red-500" },
      },
    ],
    review: [
      {
        id: 204,
        title: "Mobile app testing",
        description: "Test on iOS and Android devices",
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
        dueDate: addDays(0),
        createdAt: addDays(-6),
        spaceId: 2,
        space: { name: "Mobile App", color: "bg-red-500" },
      },
    ],
    done: [
      {
        id: 205,
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment",
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
        ],
        dueDate: addDays(-3),
        createdAt: addDays(-14),
        completedAt: addDays(-1),
        spaceId: 2,
        space: { name: "Mobile App", color: "bg-red-500" },
      },
    ],
  },
  // Space 3: Marketing Campaign
  3: {
    todo: [
      {
        id: 301,
        title: "Email campaign design",
        description: "Create email templates for Q1 campaign",
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
        ],
        dueDate: addDays(5),
        createdAt: addDays(-2),
        spaceId: 3,
        space: { name: "Marketing Campaign", color: "bg-pink-500" },
      },
      {
        id: 302,
        title: "Social media content calendar",
        description: "Plan posts for next month",
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
        dueDate: addDays(7),
        createdAt: addDays(-1),
        spaceId: 3,
        space: { name: "Marketing Campaign", color: "bg-pink-500" },
      },
    ],
    inProgress: [
      {
        id: 303,
        title: "Create ad creatives",
        description: "Design banner ads for Google and Facebook",
        assignee: {
          name: "Sarah Chen",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
          initials: "SC",
        },
        assignees: [
          {
            name: "Sarah Chen",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            initials: "SC",
          },
        ],
        dueDate: addDays(3),
        createdAt: addDays(-5),
        spaceId: 3,
        space: { name: "Marketing Campaign", color: "bg-pink-500" },
      },
    ],
    review: [],
    done: [
      {
        id: 304,
        title: "Brand guidelines update",
        description: "Finalize updated brand identity",
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
        completedAt: addDays(-2),
        spaceId: 3,
        space: { name: "Marketing Campaign", color: "bg-pink-500" },
      },
    ],
  },
};

// Initialize store
let taskStore: TaskStore = {
  spaceKanbans: initialSpaceKanbans,
};

// Listeners for state changes
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Get empty kanban for new spaces
function getEmptyKanban(): SpaceKanban {
  return {
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  };
}

// Getters
export function getTaskStore(): TaskStore {
  return taskStore;
}

export function getKanbanForSpace(spaceId: number): SpaceKanban {
  return taskStore.spaceKanbans[spaceId] || getEmptyKanban();
}

// For backward compatibility - returns combined kanban of all spaces
export function getKanbanTasks(): SpaceKanban {
  const combined: SpaceKanban = {
    todo: [],
    inProgress: [],
    review: [],
    done: [],
  };

  Object.values(taskStore.spaceKanbans).forEach(kanban => {
    combined.todo.push(...kanban.todo);
    combined.inProgress.push(...kanban.inProgress);
    combined.review.push(...kanban.review);
    combined.done.push(...kanban.done);
  });

  return combined;
}

export function getAllTasks(): Task[] {
  const tasks: Task[] = [];
  Object.values(taskStore.spaceKanbans).forEach(kanban => {
    tasks.push(...kanban.todo, ...kanban.inProgress, ...kanban.review, ...kanban.done);
  });
  return tasks;
}

export function getAllTasksForSpace(spaceId: number): Task[] {
  const kanban = getKanbanForSpace(spaceId);
  return [...kanban.todo, ...kanban.inProgress, ...kanban.review, ...kanban.done];
}

export function getCompletedThisWeek(): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  let count = 0;
  Object.values(taskStore.spaceKanbans).forEach(kanban => {
    kanban.done.forEach(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate >= startOfWeek) {
          count++;
        }
      }
    });
  });

  return count;
}

// Initialize kanban for a new space
export function initializeSpace(spaceId: number, spaceName: string, spaceColor: string) {
  if (!taskStore.spaceKanbans[spaceId]) {
    taskStore = {
      ...taskStore,
      spaceKanbans: {
        ...taskStore.spaceKanbans,
        [spaceId]: getEmptyKanban(),
      },
    };
    notifyListeners();
  }
}

// Mutations
export function moveTask(spaceId: number, taskId: number, fromColumn: KanbanColumn, toColumn: KanbanColumn) {
  const kanban = taskStore.spaceKanbans[spaceId];
  if (!kanban) return;

  const fromTasks = [...kanban[fromColumn]];
  const taskIndex = fromTasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return;
  
  const [task] = fromTasks.splice(taskIndex, 1);
  const updatedTask = { 
    ...task, 
    status: toColumn,
    completedAt: toColumn === "done" ? new Date().toISOString() : undefined
  };
  
  taskStore = {
    ...taskStore,
    spaceKanbans: {
      ...taskStore.spaceKanbans,
      [spaceId]: {
        ...kanban,
        [fromColumn]: fromTasks,
        [toColumn]: [...kanban[toColumn], updatedTask],
      },
    },
  };
  
  notifyListeners();
}

export function addTask(spaceId: number, column: KanbanColumn, task: Omit<Task, "id" | "status" | "spaceId">) {
  // Initialize space if it doesn't exist
  if (!taskStore.spaceKanbans[spaceId]) {
    taskStore.spaceKanbans[spaceId] = getEmptyKanban();
  }

  const newId = Math.max(...getAllTasks().map(t => t.id), 0) + 1;
  const newTask: Task = {
    ...task,
    id: newId,
    status: column,
    spaceId,
  };
  
  taskStore = {
    ...taskStore,
    spaceKanbans: {
      ...taskStore.spaceKanbans,
      [spaceId]: {
        ...taskStore.spaceKanbans[spaceId],
        [column]: [...taskStore.spaceKanbans[spaceId][column], newTask],
      },
    },
  };
  
  notifyListeners();
}

export function updateTask(spaceId: number, taskId: number, updates: Partial<Task>) {
  const kanban = taskStore.spaceKanbans[spaceId];
  if (!kanban) return;

  const columns: KanbanColumn[] = ["todo", "inProgress", "review", "done"];
  
  for (const column of columns) {
    const taskIndex = kanban[column].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      const updatedTasks = [...kanban[column]];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };
      
      taskStore = {
        ...taskStore,
        spaceKanbans: {
          ...taskStore.spaceKanbans,
          [spaceId]: {
            ...kanban,
            [column]: updatedTasks,
          },
        },
      };
      
      notifyListeners();
      return;
    }
  }
}

export function deleteTask(spaceId: number, taskId: number) {
  const kanban = taskStore.spaceKanbans[spaceId];
  if (!kanban) return;

  const columns: KanbanColumn[] = ["todo", "inProgress", "review", "done"];
  
  for (const column of columns) {
    const taskIndex = kanban[column].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      taskStore = {
        ...taskStore,
        spaceKanbans: {
          ...taskStore.spaceKanbans,
          [spaceId]: {
            ...kanban,
            [column]: kanban[column].filter(t => t.id !== taskId),
          },
        },
      };
      
      notifyListeners();
      return;
    }
  }
}

export function completeTask(spaceId: number, taskId: number) {
  const kanban = taskStore.spaceKanbans[spaceId];
  if (!kanban) return;

  const columns: KanbanColumn[] = ["todo", "inProgress", "review"];
  
  for (const column of columns) {
    const taskIndex = kanban[column].findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      moveTask(spaceId, taskId, column, "done");
      return;
    }
  }
}

// Delete all tasks for a space (when space is deleted)
export function deleteSpaceTasks(spaceId: number) {
  const { [spaceId]: removed, ...remaining } = taskStore.spaceKanbans;
  taskStore = {
    ...taskStore,
    spaceKanbans: remaining,
  };
  notifyListeners();
}
