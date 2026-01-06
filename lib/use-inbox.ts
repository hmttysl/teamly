// React hook for accessing the inbox store

import { useState, useEffect, useCallback } from "react";
import {
  subscribeInbox,
  getInboxItems,
  getUnreadCount,
  getFilteredItems,
  markAsRead,
  markAllAsRead,
  dismissItem,
  addInboxItem,
} from "./inbox-store";
import { InboxItem } from "./mock-data";

export function useInbox() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeInbox(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  return {
    items: getInboxItems(),
    unreadCount: getUnreadCount(),
    getFiltered: useCallback((filter: "all" | "unread" | string) => getFilteredItems(filter), []),
    markAsRead: useCallback((itemId: number) => markAsRead(itemId), []),
    markAllAsRead: useCallback(() => markAllAsRead(), []),
    dismissItem: useCallback((itemId: number) => dismissItem(itemId), []),
    addItem: useCallback((item: Omit<InboxItem, "id">) => addInboxItem(item), []),
  };
}

