"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDueDateInfo, getDueDateStyles } from "@/lib/date-utils";

interface TaskCardProps {
  title: string;
  description: string;
  assignee: {
    name: string;
    avatar: string;
    initials: string;
  };
  assignees?: {
    name: string;
    avatar: string;
    initials: string;
  }[];
  dueDate: string;
  onClick?: () => void;
  isDone?: boolean;
}

export function TaskCard({ title, description, assignee, assignees, dueDate, onClick, isDone }: TaskCardProps) {
  const dueDateInfo = getDueDateInfo(dueDate);
  const dueDateStyles = getDueDateStyles(dueDateInfo.state);
  const displayAssignees = assignees || [assignee];

  return (
    <div 
      className="bg-white dark:bg-card rounded-lg border border-gray-200 dark:border-zinc-800 p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Title */}
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#6B2FD9] transition-colors ${isDone ? "line-through opacity-60" : ""}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 ${isDone ? "line-through opacity-60" : ""}`}>
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
        {/* Assignees */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayAssignees.slice(0, 3).map((a, idx) => (
              <Avatar key={idx} className="h-6 w-6 border-2 border-white dark:border-zinc-950">
                <AvatarImage src={a.avatar} />
                <AvatarFallback className="bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/30 text-[#6B2FD9] text-xs">
                  {a.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {displayAssignees.length > 3 && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              +{displayAssignees.length - 3}
            </span>
          )}
        </div>

        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${isDone ? "" : dueDateStyles.containerClass}`}>
          {!isDone && dueDateInfo.state === "overdue" ? (
            <AlertCircle className={`w-3 h-3 ${dueDateStyles.iconClass}`} />
          ) : (
            <Calendar className={`w-3 h-3 ${isDone ? "text-gray-400" : dueDateStyles.iconClass}`} />
          )}
          <span className={isDone ? "text-gray-400 line-through" : dueDateStyles.textClass}>
            {dueDateInfo.label}
          </span>
        </div>
      </div>
    </div>
  );
}
