"use client";

import { useState } from "react";
import { Check, Download, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockNotifications } from "@/lib/mock-data";

interface NotificationPopoverProps {
  children: React.ReactNode;
}

export function NotificationPopover({ children }: NotificationPopoverProps) {
  const [activeTab, setActiveTab] = useState<"all" | "mentions" | "unread">("all");

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notification</h2>
          <button className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-600 transition-colors">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Mark all as read</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Notification
              <span className="ml-2 text-gray-500">3</span>
            </button>
            <button
              onClick={() => setActiveTab("mentions")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "mentions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Mentions
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="max-h-[500px] overflow-y-auto">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={notification.user.avatar} />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {notification.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  {notification.user.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="mb-1">
                    <span className="font-semibold text-gray-900">
                      {notification.user.name}
                    </span>{" "}
                    <span className="text-gray-500">{notification.action}</span>{" "}
                    <span className="font-semibold text-gray-900">
                      {notification.location}
                    </span>
                  </div>

                  {/* Time and Category */}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span>{notification.time}</span>
                    <span>•</span>
                    <span>{notification.category}</span>
                  </div>

                  {/* Comment Content */}
                  {notification.content && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-600">
                      {notification.content}
                    </div>
                  )}

                  {/* File Attachment */}
                  {notification.fileName && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{notification.fileName}</span>
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
                            ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                            : ""
                        }
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
                        <Button variant="outline" size="sm">
                          {notification.actionButtons[0]}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        >
                          {notification.actionButtons[1]}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}



