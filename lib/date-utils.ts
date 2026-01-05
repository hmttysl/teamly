// Date utility functions for task due dates

export type DueDateState = "overdue" | "today" | "tomorrow" | "upcoming" | "normal";

export interface DueDateInfo {
  label: string;
  state: DueDateState;
}

/**
 * Calculate the due date label and state based on the due date
 */
export function getDueDateInfo(dueDate: string | Date): DueDateInfo {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const due = new Date(dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  
  // Calculate difference in days
  const diffTime = dueDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    // Overdue
    return {
      label: "Overdue",
      state: "overdue",
    };
  } else if (diffDays === 0) {
    // Today
    return {
      label: "Today",
      state: "today",
    };
  } else if (diffDays === 1) {
    // Tomorrow
    return {
      label: "Tomorrow",
      state: "tomorrow",
    };
  } else if (diffDays <= 7) {
    // Within a week - show day name
    const dayName = due.toLocaleDateString("en-US", { weekday: "short" });
    return {
      label: dayName,
      state: "upcoming",
    };
  } else {
    // Normal date - show "Jan 15" format
    const label = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return {
      label,
      state: "normal",
    };
  }
}

/**
 * Get Tailwind classes for due date styling based on state
 */
export function getDueDateStyles(state: DueDateState): {
  containerClass: string;
  textClass: string;
  iconClass: string;
} {
  switch (state) {
    case "overdue":
      return {
        containerClass: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800",
        textClass: "text-red-600 dark:text-red-400 font-medium",
        iconClass: "text-red-500 dark:text-red-400",
      };
    case "today":
      return {
        containerClass: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
        textClass: "text-emerald-600 dark:text-emerald-400 font-medium",
        iconClass: "text-emerald-500 dark:text-emerald-400",
      };
    case "tomorrow":
      return {
        containerClass: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
        textClass: "text-blue-600 dark:text-blue-400",
        iconClass: "text-blue-500 dark:text-blue-400",
      };
    case "upcoming":
      return {
        containerClass: "bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800",
        textClass: "text-gray-600 dark:text-gray-400",
        iconClass: "text-gray-400 dark:text-gray-500",
      };
    case "normal":
    default:
      return {
        containerClass: "",
        textClass: "text-gray-500 dark:text-gray-400",
        iconClass: "text-gray-400 dark:text-gray-500",
      };
  }
}

/**
 * Format a date for display in the task detail view
 */
export function formatDetailDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date for the date input (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

