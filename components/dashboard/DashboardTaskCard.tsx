"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDueDateInfo, getDueDateStyles } from "@/lib/date-utils";

interface DashboardTaskCardProps {
  title: string;
  dueDate: string;
  space: {
    name: string;
    color: string;
  };
  assignees: Array<{
    name: string;
    avatar: string;
    initials: string;
  }>;
  onClick?: () => void;
}

export function DashboardTaskCard({
  title,
  dueDate,
  space,
  assignees,
  onClick,
}: DashboardTaskCardProps) {
  const dueDateInfo = getDueDateInfo(dueDate);
  const dueDateStyles = getDueDateStyles(dueDateInfo.state);

  return (
    <div
      className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-4 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer group min-w-[300px] max-w-[300px] flex-shrink-0"
      onClick={onClick}
    >
      {/* Space Label */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${space.color}`}></div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{space.name}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-[#6B2FD9] transition-colors leading-tight">
        {title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 3).map((assignee, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-700">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/30 text-[#6B2FD9] text-xs">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          ))}
          {assignees.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-zinc-900 border-2 border-white dark:border-gray-900 ring-1 ring-gray-100 dark:ring-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                +{assignees.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${dueDateStyles.containerClass}`}>
          {dueDateInfo.state === "overdue" ? (
            <AlertCircle className={`w-3 h-3 ${dueDateStyles.iconClass}`} />
          ) : (
            <Calendar className={`w-3 h-3 ${dueDateStyles.iconClass}`} />
          )}
          <span className={dueDateStyles.textClass}>{dueDateInfo.label}</span>
        </div>
      </div>
    </div>
  );
}
