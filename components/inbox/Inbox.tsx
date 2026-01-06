"use client";

import { CheckCheck, UserPlus, AtSign, Check, Calendar, AlertCircle, MessageSquare, CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { InboxItem, InboxItemType, currentUser } from "@/lib/mock-data";
import { getDueDateInfo, getDueDateStyles } from "@/lib/date-utils";
import { useInbox } from "@/lib/use-inbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const getIconForType = (type: InboxItemType) => {
  switch (type) {
    case "task_assigned":
      return <CheckCheck className="w-4 h-4" />;
    case "space_invite":
      return <UserPlus className="w-4 h-4" />;
    case "mention":
      return <AtSign className="w-4 h-4" />;
    case "comment":
      return <MessageSquare className="w-4 h-4" />;
    case "task_completed":
      return <CheckCircle2 className="w-4 h-4" />;
  }
};

const getIconColorForType = (type: InboxItemType) => {
  switch (type) {
    case "task_assigned":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "space_invite":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "mention":
      return "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]";
    case "comment":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
    case "task_completed":
      return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
  }
};

interface InboxProps {
  onTaskClick?: (taskId: number) => void;
  onAcceptInvite?: (spaceId: number) => void;
  onDeclineInvite?: (spaceId: number) => void;
}

export function Inbox({ onTaskClick, onAcceptInvite, onDeclineInvite }: InboxProps) {
  const { items, unreadCount, markAsRead, markAllAsRead, dismissItem } = useInbox();
  const [filter, setFilter] = useState<"all" | "unread" | InboxItemType>("all");

  // Apply filter
  const filteredItems = (() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter(item => !item.isRead);
    return items.filter(item => item.type === filter);
  })();

  const handleItemClick = (item: InboxItem) => {
    // Mark as read
    markAsRead(item.id);

    // Open task/space
    if (item.taskId && onTaskClick) {
      onTaskClick(item.taskId);
    }
  };

  const handleMarkAsRead = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(itemId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleAcceptInvite = (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove from list
    dismissItem(item.id);
    if (item.spaceId && onAcceptInvite) {
      onAcceptInvite(item.spaceId);
    }
  };

  const handleDeclineInvite = (item: InboxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Remove from list
    dismissItem(item.id);
    if (item.spaceId && onDeclineInvite) {
      onDeclineInvite(item.spaceId);
    }
  };

  const handleDismiss = (itemId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissItem(itemId);
  };

  const filterButtons: { label: string; value: "all" | "unread" | InboxItemType }[] = [
    { label: "All", value: "all" },
    { label: "Unread", value: "unread" },
    { label: "Tasks", value: "task_assigned" },
    { label: "Mentions", value: "mention" },
    { label: "Invites", value: "space_invite" },
  ];

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Inbox</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} item${unreadCount > 1 ? "s" : ""} need${unreadCount === 1 ? "s" : ""} your attention`
                  : "All caught up! No items need your attention"}
              </p>
            </div>
            
            {/* Mark all as read action */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#6B2FD9] transition-colors mt-1"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {filterButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filter === btn.value
                    ? "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]"
                    : "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
                }`}
              >
                {btn.label}
                {btn.value === "unread" && unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-[#6B2FD9] text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Inbox Items */}
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const dueDateInfo = item.dueDate ? getDueDateInfo(item.dueDate) : null;
            const dueDateStyles = dueDateInfo ? getDueDateStyles(dueDateInfo.state) : null;

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`bg-white dark:bg-card rounded-lg border transition-all cursor-pointer group ${
                  item.isRead
                    ? "border-gray-200 dark:border-zinc-800 opacity-60 hover:opacity-80"
                    : "border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* User Avatar or Icon */}
                    {item.fromUser ? (
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={item.fromUser.avatar} />
                        <AvatarFallback className={getIconColorForType(item.type)}>
                          {item.fromUser.initials}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColorForType(
                          item.type
                        )}`}
                      >
                        {getIconForType(item.type)}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3
                          className={`font-medium ${
                            item.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {item.timestamp}
                          </span>
                          {/* Dismiss button */}
                          <button
                            onClick={(e) => handleDismiss(item.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                          >
                            <X className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.context}</p>

                      {/* Space tag, Due Date, and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${item.spaceColor}`}
                            ></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.spaceName}
                            </span>
                          </div>

                          {/* Due Date for task assignments */}
                          {dueDateInfo && dueDateStyles && (
                            <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${dueDateStyles.containerClass}`}>
                              {dueDateInfo.state === "overdue" ? (
                                <AlertCircle className={`w-3 h-3 ${dueDateStyles.iconClass}`} />
                              ) : (
                                <Calendar className={`w-3 h-3 ${dueDateStyles.iconClass}`} />
                              )}
                              <span className={dueDateStyles.textClass}>{dueDateInfo.label}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons based on type */}
                        <div className="flex items-center gap-2">
                          {/* Space invite actions */}
                          {item.type === "space_invite" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleDeclineInvite(item, e)}
                                className="h-7 text-xs"
                              >
                                Decline
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => handleAcceptInvite(item, e)}
                                className="h-7 text-xs bg-[#6B2FD9] hover:bg-[#5a27b8]"
                              >
                                Accept
                              </Button>
                            </div>
                          )}

                          {/* Mark as read button */}
                          {!item.isRead && item.type !== "space_invite" && (
                            <button
                              onClick={(e) => handleMarkAsRead(item.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#6B2FD9] hover:text-[#5a27b8] flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!item.isRead && (
                      <div className="w-2 h-2 bg-[#6B2FD9] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B2FD9]/10 to-blue-50 dark:from-[#6B2FD9]/20 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCheck className="w-10 h-10 text-[#6B2FD9]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === "all" ? "You're all caught up 🎉" : "No items in this category"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {filter === "all"
                ? "No tasks, mentions, or invites need your attention right now."
                : "No notifications match your current filter."}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 text-[#6B2FD9] hover:underline text-sm"
              >
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Summary Stats */}
        {items.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Showing {filteredItems.length} of {items.length} notifications for {currentUser.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
