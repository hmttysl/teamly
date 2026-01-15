// Centralized task store for Teamly
// Tasks are organized by spaceId - each space has its own kanban board

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

// Empty initial tasks for fresh account
const initialSpaceKanbans: Record<number, SpaceKanban> = {};

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
