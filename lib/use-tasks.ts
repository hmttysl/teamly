// React hook for accessing the task store

import { useState, useEffect, useCallback } from "react";
import {
  getTaskStore,
  getKanbanTasks,
  getKanbanForSpace,
  getAllTasks,
  getAllTasksForSpace,
  getCompletedThisWeek,
  subscribe,
  moveTask,
  addTask,
  updateTask,
  deleteTask,
  completeTask,
  initializeSpace,
  deleteSpaceTasks,
  type Task,
  type KanbanColumn,
  type SpaceKanban,
} from "./task-store";

// Hook for all tasks across all spaces (for Dashboard)
export function useTasks() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  // Add task to the default space (spaceId 1)
  const addTaskToDefault = useCallback((column: KanbanColumn, task: Omit<Task, "id" | "status" | "spaceId">) => {
    addTask(1, column, task);
  }, []);

  // Update task - finds task in any space and updates it
  const updateTaskGlobal = useCallback((taskId: number, updates: Partial<Task>) => {
    // Find which space the task is in
    const store = getTaskStore();
    for (const [spaceIdStr, kanban] of Object.entries(store.spaceKanbans)) {
      const spaceId = parseInt(spaceIdStr);
      const columns: KanbanColumn[] = ["todo", "inProgress", "review", "done"];
      for (const column of columns) {
        const task = kanban[column].find(t => t.id === taskId);
        if (task) {
          // If status is changing, we need to move the task
          if (updates.status) {
            const statusToColumn: Record<string, KanbanColumn> = {
              todo: "todo",
              inprogress: "inProgress",
              inProgress: "inProgress",
              review: "review",
              done: "done",
            };
            const newColumn = statusToColumn[updates.status];
            if (newColumn && newColumn !== column) {
              moveTask(spaceId, taskId, column, newColumn);
            }
          }
          updateTask(spaceId, taskId, updates);
          return;
        }
      }
    }
  }, []);

  return {
    // Combined kanban from all spaces
    kanban: getKanbanTasks(),
    allTasks: getAllTasks(),
    completedThisWeek: getCompletedThisWeek(),
    addTask: addTaskToDefault,
    updateTask: updateTaskGlobal,
  };
}

// Hook for a specific space's tasks (for KanbanBoard)
export function useSpaceTasks(spaceId: number) {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  const kanban = getKanbanForSpace(spaceId);
  const allTasks = getAllTasksForSpace(spaceId);

  return {
    kanban,
    allTasks,
    moveTask: useCallback((taskId: number, from: KanbanColumn, to: KanbanColumn) => {
      moveTask(spaceId, taskId, from, to);
    }, [spaceId]),
    addTask: useCallback((column: KanbanColumn, task: Omit<Task, "id" | "status" | "spaceId">) => {
      addTask(spaceId, column, task);
    }, [spaceId]),
    updateTask: useCallback((taskId: number, updates: Partial<Task>) => {
      updateTask(spaceId, taskId, updates);
    }, [spaceId]),
    deleteTask: useCallback((taskId: number) => {
      deleteTask(spaceId, taskId);
    }, [spaceId]),
    completeTask: useCallback((taskId: number) => {
      completeTask(spaceId, taskId);
    }, [spaceId]),
    initializeSpace: useCallback((spaceName: string, spaceColor: string) => {
      initializeSpace(spaceId, spaceName, spaceColor);
    }, [spaceId]),
  };
}

// Hook for managing spaces
export function useSpaceManagement() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  return {
    initializeSpace: useCallback((spaceId: number, spaceName: string, spaceColor: string) => {
      initializeSpace(spaceId, spaceName, spaceColor);
    }, []),
    deleteSpaceTasks: useCallback((spaceId: number) => {
      deleteSpaceTasks(spaceId);
    }, []),
  };
}

export type { Task, KanbanColumn, SpaceKanban };
