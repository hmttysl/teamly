"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { activityStore, Activity } from "./activity-store";
import { useAuth } from "./auth-context";

export function useActivity(limit?: number) {
  const { user, profile } = useAuth();
  
  // Current user from auth
  const currentUser = useMemo(() => ({
    name: profile?.name || user?.email?.split('@')[0] || "User",
    avatar: profile?.avatar_url || "",
  }), [user, profile]);

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
  }, [currentUser.name, currentUser.avatar]);

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

