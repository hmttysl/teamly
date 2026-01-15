// Global store for Echo tasks
export interface EchoTask {
  id: string;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Completed';
  categoryId?: string;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

export interface EchoCategory {
  id: string;
  name: string;
  color: string;
}

type EchoStoreListener = () => void;

// Empty tasks for fresh account
const INITIAL_TASKS: EchoTask[] = [];

// Default categories for new users
const INITIAL_CATEGORIES: EchoCategory[] = [
  { id: 'cat-1', name: 'Work', color: 'bg-indigo-500' },
  { id: 'cat-2', name: 'Personal', color: 'bg-emerald-500' },
];

class EchoStore {
  private tasks: EchoTask[] = INITIAL_TASKS;
  private categories: EchoCategory[] = INITIAL_CATEGORIES;
  private listeners: Set<EchoStoreListener> = new Set();

  subscribe(listener: EchoStoreListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getTasks(): EchoTask[] {
    return this.tasks;
  }

  getCategories(): EchoCategory[] {
    return this.categories;
  }

  addTask(title: string, description?: string, categoryId?: string, dueDate?: string): EchoTask {
    const newTask: EchoTask = {
      id: Date.now().toString(),
      title,
      description,
      priority: 'Medium',
      status: 'To Do',
      categoryId,
      createdAt: 'Just now',
      dueDate
    };
    this.tasks = [newTask, ...this.tasks];
    this.notify();
    return newTask;
  }

  updateTaskDueDate(taskId: string, dueDate: string | undefined) {
    this.tasks = this.tasks.map(t => 
      t.id === taskId ? { ...t, dueDate } : t
    );
    this.notify();
  }

  getTasksForDate(date: Date): EchoTask[] {
    const dateStr = date.toISOString().split('T')[0];
    return this.tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDateStr = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDateStr === dateStr;
    });
  }

  toggleTaskStatus(taskId: string) {
    this.tasks = this.tasks.map(task => {
      if (task.id === taskId) {
        const isCompleting = task.status !== 'Completed';
        return {
          ...task,
          status: isCompleting ? 'Completed' as const : 'To Do' as const,
          completedAt: isCompleting ? new Date().toISOString() : undefined
        };
      }
      return task;
    });
    this.notify();
  }

  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.notify();
  }

  updateTaskCategory(taskId: string, categoryId: string) {
    this.tasks = this.tasks.map(t => 
      t.id === taskId ? { ...t, categoryId } : t
    );
    this.notify();
  }

  addCategory(name: string, color: string): EchoCategory {
    const newCategory: EchoCategory = {
      id: `cat-${Date.now()}`,
      name,
      color
    };
    this.categories = [...this.categories, newCategory];
    this.notify();
    return newCategory;
  }

  deleteCategory(categoryId: string) {
    this.categories = this.categories.filter(c => c.id !== categoryId);
    // Also remove category from tasks
    this.tasks = this.tasks.map(t => 
      t.categoryId === categoryId ? { ...t, categoryId: undefined } : t
    );
    this.notify();
  }

  // Stats for Dashboard
  getCompletedThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return this.tasks.filter(task => {
      if (task.status !== 'Completed' || !task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfWeek;
    }).length;
  }

  getActiveTasks(): EchoTask[] {
    return this.tasks.filter(t => t.status !== 'Completed');
  }

  getCompletedTasks(): EchoTask[] {
    return this.tasks.filter(t => t.status === 'Completed');
  }
}

// Singleton instance
export const echoStore = new EchoStore();

