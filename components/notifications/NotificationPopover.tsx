"use client";

import { useState, useMemo, useRef } from "react";
import { Check, Download, ArrowLeft, FileText, X, ExternalLink, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockNotifications, currentUser } from "@/lib/mock-data";

interface Notification {
  id: number;
  user: {
    name: string;
    avatar: string;
    initials: string;
    online?: boolean;
  };
  action: string;
  location: string;
  time: string;
  category: string;
  content?: string;
  fileName?: string;
  actionButton?: string;
  actionButtons?: string[];
  isRead?: boolean;
  isMention?: boolean;
  spaceId?: number;
  taskId?: number;
  replies?: { user: string; text: string; time: string }[];
}

interface NotificationPopoverProps {
  children: React.ReactNode;
  onNavigateToSpace?: (spaceId: number) => void;
  onOpenTask?: (taskId: number, spaceId: number) => void;
  onNavigateToInbox?: () => void;
}

export function NotificationPopover({ children, onNavigateToSpace, onOpenTask, onNavigateToInbox }: NotificationPopoverProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mentions" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>(
    mockNotifications.map((n, i) => ({
      ...n,
      isRead: i > 1, // First 2 are unread
      isMention: n.action.includes("mentioned") || n.content?.includes("@"),
      spaceId: 1, // Default to first space
      taskId: i + 1,
      replies: [],
    }))
  );
  const [isOpen, setIsOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "mentions":
        return notifications.filter(n => n.isMention);
      case "unread":
        return notifications.filter(n => !n.isRead);
      default:
        return notifications;
    }
  }, [activeTab, notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDismiss = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    
    if (notification.taskId && notification.spaceId && onOpenTask) {
      onOpenTask(notification.taskId, notification.spaceId);
    } else if (notification.spaceId && onNavigateToSpace) {
      onNavigateToSpace(notification.spaceId);
    }
  };

  const handleActionButton = (notification: Notification, action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleMarkAsRead(notification.id);

    if (action === "Accept" || action === "View") {
      setIsOpen(false);
      if (notification.spaceId && onNavigateToSpace) {
        onNavigateToSpace(notification.spaceId);
      }
    } else if (action === "Decline" || action === "Dismiss") {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    } else if (action === "Reply") {
      // Open reply dialog
      setSelectedNotification(notification);
      setReplyDialogOpen(true);
      setReplyText("");
      setReplySent(false);
    } else if (action === "Download" && notification.fileName) {
      // Create a fake download
      const blob = new Blob(["Sample file content for " + notification.fileName], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = notification.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedNotification) return;

    // Add reply to the notification
    setNotifications(prev => prev.map(n => {
      if (n.id === selectedNotification.id) {
        return {
          ...n,
          replies: [...(n.replies || []), {
            user: currentUser.name,
            text: replyText,
            time: "Just now"
          }]
        };
      }
      return n;
    }));

    setReplySent(true);
    setTimeout(() => {
      setReplyDialogOpen(false);
      setSelectedNotification(null);
      setReplyText("");
      setReplySent(false);
    }, 1500);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0 dark:bg-zinc-900 dark:border-zinc-800" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-[#6B2FD9] hover:text-[#5a27b8] transition-colors"
            >
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Mark all as read</span>
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              All
              <span className="ml-2 text-gray-500 dark:text-gray-400">{notifications.length}</span>
            </button>
            <button
              onClick={() => setActiveTab("mentions")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "mentions"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Mentions
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "unread"
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-[#6B2FD9] text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="max-h-[400px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Check className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-t border-gray-100 dark:border-zinc-800 cursor-pointer group relative ${
                  !notification.isRead ? "bg-[#6B2FD9]/5 dark:bg-[#6B2FD9]/10" : ""
                }`}
              >
                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#6B2FD9] rounded-full" />
                )}

                {/* Dismiss button */}
                <button
                  onClick={(e) => handleDismiss(notification.id, e)}
                  className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>

                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300">
                        {notification.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    {notification.user.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    {/* Header */}
                    <div className="mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {notification.user.name}
                      </span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">{notification.action}</span>{" "}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {notification.location}
                      </span>
                    </div>

                    {/* Time and Category */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-3">
                      <span>{notification.time}</span>
                      <span>•</span>
                      <span>{notification.category}</span>
                    </div>

                    {/* Comment Content */}
                    {notification.content && (
                      <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 mb-3 text-sm text-gray-600 dark:text-gray-300">
                        {notification.content}
                        
                        {/* Show replies */}
                        {notification.replies && notification.replies.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 space-y-2">
                            {notification.replies.map((reply, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="font-medium text-[#6B2FD9]">{reply.user}:</span>
                                <span className="text-gray-600 dark:text-gray-300">{reply.text}</span>
                                <span className="text-gray-400 ml-auto">{reply.time}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* File Attachment */}
                    {notification.fileName && (
                      <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{notification.fileName}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {notification.actionButton && (
                        <Button
                          variant={notification.actionButton === "Accept" ? "default" : "outline"}
                          size="sm"
                          className={
                            notification.actionButton === "Accept"
                              ? "bg-[#6B2FD9] hover:bg-[#5a27b8] text-white"
                              : "dark:border-zinc-700 dark:text-gray-300"
                          }
                          onClick={(e) => handleActionButton(notification, notification.actionButton!, e)}
                        >
                          {notification.actionButton === "Reply" && (
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                          )}
                          {notification.actionButton === "Download" && (
                            <Download className="w-4 h-4 mr-1.5" />
                          )}
                          {notification.actionButton}
                        </Button>
                      )}
                      {notification.actionButtons && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="dark:border-zinc-700 dark:text-gray-300"
                            onClick={(e) => handleActionButton(notification, notification.actionButtons![0], e)}
                          >
                            {notification.actionButtons[0]}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-[#6B2FD9] hover:bg-[#5a27b8] text-white"
                            onClick={(e) => handleActionButton(notification, notification.actionButtons![1], e)}
                          >
                            {notification.actionButtons[1]}
                          </Button>
                        </>
                      )}

                      {/* View button for all notifications */}
                      {!notification.actionButton && !notification.actionButtons && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#6B2FD9] hover:text-[#5a27b8] hover:bg-[#6B2FD9]/10"
                        >
                          <ExternalLink className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-zinc-800 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                if (onNavigateToInbox) onNavigateToInbox();
              }}
              className="text-sm text-[#6B2FD9] hover:text-[#5a27b8] font-medium"
            >
              View all in Inbox
            </button>
          </div>
        )}
      </PopoverContent>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-md dark:bg-zinc-900 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <MessageSquare className="w-5 h-5 text-[#6B2FD9]" />
              Reply to Comment
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              {/* Original Comment */}
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedNotification.user.avatar} />
                    <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs">
                      {selectedNotification.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {selectedNotification.user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedNotification.time}
                    </p>
                  </div>
                </div>
                {selectedNotification.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 ml-11">
                    {selectedNotification.content}
                  </p>
                )}
              </div>

              {/* Previous Replies */}
              {selectedNotification.replies && selectedNotification.replies.length > 0 && (
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {selectedNotification.replies.map((reply, idx) => (
                    <div key={idx} className="flex items-start gap-3 ml-4 pl-4 border-l-2 border-[#6B2FD9]/30">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="bg-[#6B2FD9] text-white text-xs">
                          {currentUser.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{reply.user}:</span> {reply.text}
                        </p>
                        <p className="text-xs text-gray-400">{reply.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replySent ? (
                <div className="flex items-center justify-center gap-2 py-4 text-green-600 dark:text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Reply sent!</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-[#6B2FD9] text-white text-xs">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                      className="flex-1 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                      autoFocus
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Popover>
  );
}



