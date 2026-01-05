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

  return {
    // Combined kanban from all spaces
    kanban: getKanbanTasks(),
    allTasks: getAllTasks(),
    completedThisWeek: getCompletedThisWeek(),
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
