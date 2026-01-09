// React hook for accessing the Echo store
import { useSyncExternalStore, useCallback } from 'react';
import { echoStore, EchoTask, EchoCategory } from './echo-store';

export function useEcho() {
  const tasks = useSyncExternalStore(
    (callback) => echoStore.subscribe(callback),
    () => echoStore.getTasks(),
    () => echoStore.getTasks()
  );

  const categories = useSyncExternalStore(
    (callback) => echoStore.subscribe(callback),
    () => echoStore.getCategories(),
    () => echoStore.getCategories()
  );

  const addTask = useCallback((title: string, description?: string, categoryId?: string, dueDate?: string) => {
    return echoStore.addTask(title, description, categoryId, dueDate);
  }, []);

  const updateTaskDueDate = useCallback((taskId: string, dueDate: string | undefined) => {
    echoStore.updateTaskDueDate(taskId, dueDate);
  }, []);

  const getTasksForDate = useCallback((date: Date) => {
    return echoStore.getTasksForDate(date);
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    echoStore.toggleTaskStatus(taskId);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    echoStore.deleteTask(taskId);
  }, []);

  const updateTaskCategory = useCallback((taskId: string, categoryId: string) => {
    echoStore.updateTaskCategory(taskId, categoryId);
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    return echoStore.addCategory(name, color);
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    echoStore.deleteCategory(categoryId);
  }, []);

  const getCompletedThisWeek = useCallback(() => {
    return echoStore.getCompletedThisWeek();
  }, []);

  const activeTasks = tasks.filter(t => t.status !== 'Completed');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  return {
    tasks,
    categories,
    activeTasks,
    completedTasks,
    addTask,
    toggleTaskStatus,
    deleteTask,
    updateTaskCategory,
    updateTaskDueDate,
    addCategory,
    deleteCategory,
    getCompletedThisWeek,
    getTasksForDate
  };
}

export type { EchoTask, EchoCategory };

