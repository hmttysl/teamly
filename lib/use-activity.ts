"use client";

import { useState, useEffect, useCallback } from "react";
import { activityStore, Activity } from "./activity-store";
import { currentUser } from "./mock-data";

export function useActivity(limit?: number) {
  const [activities, setActivities] = useState<Activity[]>(() => 
    activityStore.getActivities(limit)
  );

  useEffect(() => {
    const unsubscribe = activityStore.subscribe(() => {
      setActivities(activityStore.getActivities(limit));
    });
    return unsubscribe;
  }, [limit]);

  const addActivity = useCallback((
    type: Activity["type"],
    taskTitle: string,
    options?: {
      taskId?: number;
      spaceId?: number;
      spaceName?: string;
      fromColumn?: string;
      toColumn?: string;
    }
  ) => {
    activityStore.addActivity({
      type,
      user: {
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      taskTitle,
      ...options,
    });
  }, []);

  const formatTimeAgo = useCallback((date: Date) => {
    return activityStore.formatTimeAgo(date);
  }, []);

  const getActionText = useCallback((type: Activity["type"]) => {
    return activityStore.getActionText(type);
  }, []);

  return {
    activities,
    addActivity,
    formatTimeAgo,
    getActionText,
    allActivities: activityStore.getActivities(),
  };
}

