"use client";

import { CheckCheck, UserPlus, AtSign, Check, Calendar, AlertCircle, MessageSquare, CheckCircle2, X, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDueDateInfo, getDueDateStyles } from "@/lib/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

type NotificationType = "space_invite" | "task_assigned" | "mention" | "comment";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "task_assigned":
      return <CheckCheck className="w-4 h-4" />;
    case "space_invite":
      return <UserPlus className="w-4 h-4" />;
    case "mention":
      return <AtSign className="w-4 h-4" />;
    case "comment":
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getIconColorForType = (type: NotificationType) => {
  switch (type) {
    case "task_assigned":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    case "space_invite":
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    case "mention":
      return "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]";
    case "comment":
      return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
  }
};

interface InboxProps {
  onNavigateToSpace?: (spaceId: string) => void;
}

export function Inbox({ onNavigateToSpace }: InboxProps) {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle Accept Invite
  const handleAcceptInvite = async (notification: Notification) => {
    if (!user || !notification.data?.space_id) return;

    setProcessingId(notification.id);
    try {
      const spaceId = notification.data.space_id;
      const inviteCode = notification.data.invite_code;

      // Add user as member of the space
      const { error: memberError } = await supabase
        .from("space_members")
        .insert({
          space_id: spaceId,
          user_id: user.id,
          role: "Teammate",
        });

      if (memberError && !memberError.message.includes("duplicate")) {
        throw memberError;
      }

      // Update invite status
      if (inviteCode) {
        await supabase
          .from("space_invites")
          .update({ status: "accepted" })
          .eq("invite_code", inviteCode);
      }

      // Delete notification
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id);

      // Refresh
      fetchNotifications();

      // Navigate to the space
      if (onNavigateToSpace) {
        onNavigateToSpace(spaceId);
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Decline Invite
  const handleDeclineInvite = async (notification: Notification) => {
    if (!user) return;

    setProcessingId(notification.id);
    try {
      const inviteCode = notification.data?.invite_code;

      // Update invite status
      if (inviteCode) {
        await supabase
          .from("space_invites")
          .update({ status: "declined" })
          .eq("invite_code", inviteCode);
      }

      // Delete notification
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notification.id);

      fetchNotifications();
    } catch (err) {
      console.error("Error declining invite:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id);

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Dismiss notification
  const handleDismiss = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  };

  // Apply filter
  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filterButtons = [
    { label: t.all, value: "all" as const },
    { label: t.unread, value: "unread" as const },
    { label: t.totalTasks, value: "task_assigned" as const },
    { label: t.mentions, value: "mention" as const },
    { label: t.pendingInvites, value: "space_invite" as const },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B2FD9]" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{t.inboxTitle}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} item${unreadCount > 1 ? "s" : ""} need${unreadCount === 1 ? "s" : ""} your attention`
                  : t.youreAllCaughtUp}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#6B2FD9] transition-colors mt-1"
              >
                {t.markAllAsRead}
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

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-card rounded-lg border transition-all cursor-pointer group ${
                notification.is_read
                  ? "border-gray-200 dark:border-zinc-800 opacity-60 hover:opacity-80"
                  : "border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColorForType(
                      notification.type
                    )}`}
                  >
                    {getIconForType(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3
                        className={`font-medium ${
                          notification.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTimestamp(notification.created_at)}
                        </span>
                        <button
                          onClick={(e) => handleDismiss(notification.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.message}</p>

                    {/* Space tag and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {notification.data?.space_name && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#6B2FD9]"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.data.space_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {notification.type === "space_invite" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeclineInvite(notification);
                              }}
                              disabled={processingId === notification.id}
                              className="h-7 text-xs"
                            >
                              {t.decline}
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptInvite(notification);
                              }}
                              disabled={processingId === notification.id}
                              className="h-7 text-xs bg-[#6B2FD9] hover:bg-[#5a27b8]"
                            >
                              {processingId === notification.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                t.accept
                              )}
                            </Button>
                          </div>
                        )}

                        {!notification.is_read && notification.type !== "space_invite" && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
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
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-[#6B2FD9] rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#6B2FD9]/10 to-blue-50 dark:from-[#6B2FD9]/20 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCheck className="w-10 h-10 text-[#6B2FD9]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === "all" ? t.youreAllCaughtUp + " 🎉" : t.noNotifications}
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
        {notifications.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
