// Centralized inbox store for Teamly
// Manages inbox items and unread count globally

import { mockInboxItems, InboxItem } from "./mock-data";

// Store state
let inboxItems: InboxItem[] = [...mockInboxItems];
let listeners: Set<() => void> = new Set();

// Subscribe to changes
export function subscribeInbox(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Getters
export function getInboxItems(): InboxItem[] {
  return inboxItems;
}

export function getUnreadCount(): number {
  return inboxItems.filter(item => !item.isRead).length;
}

export function getFilteredItems(filter: "all" | "unread" | string): InboxItem[] {
  if (filter === "all") return inboxItems;
  if (filter === "unread") return inboxItems.filter(item => !item.isRead);
  return inboxItems.filter(item => item.type === filter);
}

// Actions
export function markAsRead(itemId: number): void {
  inboxItems = inboxItems.map(item =>
    item.id === itemId ? { ...item, isRead: true } : item
  );
  notifyListeners();
}

export function markAllAsRead(): void {
  inboxItems = inboxItems.map(item => ({ ...item, isRead: true }));
  notifyListeners();
}

export function dismissItem(itemId: number): void {
  inboxItems = inboxItems.filter(item => item.id !== itemId);
  notifyListeners();
}

export function addInboxItem(item: Omit<InboxItem, "id">): void {
  const newId = Math.max(...inboxItems.map(i => i.id), 0) + 1;
  inboxItems = [{ ...item, id: newId } as InboxItem, ...inboxItems];
  notifyListeners();
}

