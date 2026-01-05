"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Calendar as CalendarIcon, ExternalLink, Clock, Users, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/lib/mock-data";
import { useTasks, type Task } from "@/lib/use-tasks";

// Time slots for the calendar
const timeSlots = [
  "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"
];

export function Calendar() {
  const { kanban } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Combine all tasks from kanban and filter for current user
  const userTasks = useMemo(() => {
    const { todo, inProgress, review, done } = kanban;
    const allTasks = [...todo, ...inProgress, ...review, ...done];
    
    return allTasks.filter(task => {
      // Check assignees array first
      if (task.assignees && task.assignees.length > 0) {
        return task.assignees.some(a => a.name === currentUser.name);
      }
      // Fallback to single assignee
      return task.assignee?.name === currentUser.name;
    }).map(task => ({
      ...task,
      assignees: task.assignees || [task.assignee],
      space: task.space || { name: "General", color: "bg-gray-500" },
    }));
  }, [kanban]);

  // Get week days
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // Get tasks for a specific day (filtered by search if any)
  const getTasksForDay = (date: Date) => {
    return userTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const matchesDate = (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
      
      if (!matchesDate) return false;
      
      // Filter by search query
      if (searchQuery) {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  };

  // Get today's tasks for the header
  const todaysTasks = useMemo(() => {
    const today = new Date();
    return userTasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    });
  }, [userTasks]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "2-digit", 
      year: "numeric" 
    });
  };

  const formatDayHeader = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    return { day, weekday };
  };

  const getWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    return `${startStr} - ${endStr}`;
  };

  const getTaskTime = (task: Task) => {
    if (task.isAllDay) return "All day";
    if (task.dueAt) {
      const date = new Date(task.dueAt);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return "9:00 AM";
  };

  const handleCompleteTask = (taskId: number) => {
    completeTask(taskId);
    setSelectedTask(null);
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-hidden flex">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-card">
          {/* Date and Summary */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{formatDate(new Date())}</h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1 flex items-center gap-2">
              You have {todaysTasks.length} task{todaysTasks.length !== 1 ? 's' : ''} today
              <CalendarIcon className="w-4 h-4" />
            </p>
          </div>

          {/* Quick Access Cards */}
          {todaysTasks.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {todaysTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`min-w-[280px] border rounded-xl p-4 cursor-pointer transition-all ${
                    task.status === "done"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50"
                      : "bg-gradient-to-br from-[#6B2FD9] to-[#4c1d95] border-transparent text-white hover:shadow-lg hover:scale-[1.02]"
                  }`}
                >
                  <h3 className={`font-medium truncate ${task.status === "done" ? "line-through text-gray-500 dark:text-gray-400" : "text-white"}`}>
                    {task.title}
                  </h3>
                  <p className={`text-sm mt-1 ${task.status === "done" ? "text-green-600 dark:text-green-400" : "text-white/80"}`}>
                    {task.status === "done" ? "Completed" : "Due Today"}
                  </p>
                  <div className={`flex items-center gap-2 mt-3 text-sm ${task.status === "done" ? "text-green-600 dark:text-green-400" : "text-white/80"}`}>
                    <ExternalLink className="w-4 h-4" />
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-card flex items-center gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <Input
              placeholder="Search in calendar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToday}
            className="bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-700"
          >
            Today
          </Button>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-8 w-8 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-8 w-8 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
            <CalendarIcon className="w-4 h-4" />
            <span>{getWeekRange()}</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 flex overflow-hidden bg-white dark:bg-card">
          {/* Time Column */}
          <div className="w-16 flex-shrink-0 border-r border-gray-200 dark:border-zinc-800">
            <div className="h-14 border-b border-gray-200 dark:border-zinc-800" /> {/* Spacer for header */}
            {timeSlots.map((time) => (
              <div key={time} className="h-24 px-3 py-2 text-right">
                <span className="text-xs text-gray-400 dark:text-zinc-500">{time}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <ScrollArea className="flex-1">
            <div className="flex min-w-max">
              {weekDays.map((day, dayIndex) => {
                const { day: dayNum, weekday } = formatDayHeader(day);
                const dayTasks = getTasksForDay(day);
                const today = isToday(day);

                return (
                  <div key={dayIndex} className="w-48 flex-shrink-0 border-r border-gray-200 dark:border-zinc-800 last:border-r-0">
                    {/* Day Header */}
                    <div className={`h-14 px-4 py-2 border-b border-gray-200 dark:border-zinc-800 ${today ? 'bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/15' : ''}`}>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-bold ${today ? 'text-[#6B2FD9]' : 'text-gray-900 dark:text-white'}`}>
                          {dayNum}
                        </span>
                        <span className={`text-xs ${today ? 'text-[#6B2FD9]' : 'text-gray-400 dark:text-zinc-500'}`}>
                          {weekday}
                        </span>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="relative">
                      {timeSlots.map((_, slotIndex) => (
                        <div key={slotIndex} className={`h-24 border-b border-gray-100 dark:border-zinc-800/50 ${today ? 'bg-[#6B2FD9]/5' : ''}`} />
                      ))}

                      {/* Tasks */}
                      {dayTasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`absolute left-2 right-2 border rounded-xl p-3 cursor-pointer transition-colors shadow-sm ${
                            task.status === "done"
                              ? "bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 opacity-60"
                              : "bg-[#6B2FD9] border-[#5a27b8] hover:bg-[#5a27b8]"
                          }`}
                          style={{ top: `${taskIndex * 110 + 10}px` }}
                        >
                          <h4 className={`font-medium text-sm truncate ${
                            task.status === "done"
                              ? "line-through text-gray-500 dark:text-gray-400"
                              : "text-white"
                          }`}>
                            {task.title}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            task.status === "done"
                              ? "text-gray-400 dark:text-gray-500"
                              : "text-white/80"
                          }`}>
                            {getTaskTime(task)}
                          </p>
                          
                          {/* Assignees */}
                          <div className="flex items-center mt-2">
                            <div className="flex -space-x-2">
                              {task.assignees?.slice(0, 3).map((assignee, idx) => (
                                <Avatar key={idx} className={`w-6 h-6 border-2 ${
                                  task.status === "done"
                                    ? "border-gray-100 dark:border-zinc-800"
                                    : "border-[#6B2FD9]"
                                }`}>
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback className={`text-xs ${
                                    task.status === "done"
                                      ? "bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-400"
                                      : "bg-[#5a27b8] text-white"
                                  }`}>
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            {task.assignees && task.assignees.length > 3 && (
                              <span className={`text-xs ml-2 ${
                                task.status === "done"
                                  ? "text-gray-400 dark:text-gray-500"
                                  : "text-white/80"
                              }`}>
                                +{task.assignees.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Task Detail Sidebar */}
      {selectedTask && (
        <div className="w-96 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedTask.status === "done"
                  ? "bg-green-600"
                  : "bg-purple-600"
              }`}>
                {selectedTask.status === "done" ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <CalendarIcon className="w-4 h-4 text-white" />
                )}
              </div>
              {selectedTask.status === "done" && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedTask(null)}
              className="text-gray-400 dark:text-zinc-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Title */}
              <h2 className={`text-xl font-bold mb-2 ${
                selectedTask.status === "done"
                  ? "line-through text-gray-500 dark:text-gray-400"
                  : "text-gray-900 dark:text-white"
              }`}>
                {selectedTask.title}
              </h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
                {new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "2-digit"
                })} • {getTaskTime(selectedTask)}
              </p>

              {/* Status Badge */}
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  selectedTask.status === "done"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : selectedTask.status === "inProgress"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : selectedTask.status === "review"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300"
                }`}>
                  {selectedTask.status === "done" && <CheckCircle2 className="w-4 h-4" />}
                  {selectedTask.status === "todo" && "To Do"}
                  {selectedTask.status === "inProgress" && "In Progress"}
                  {selectedTask.status === "review" && "In Review"}
                  {selectedTask.status === "done" && "Completed"}
                </span>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                  <p className="text-gray-600 dark:text-zinc-300 text-sm">{selectedTask.description}</p>
                </div>
              )}

              {/* Attendees */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Assignees
                </h3>
                <div className="space-y-3">
                  {selectedTask.assignees?.map((assignee, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white text-sm font-medium flex items-center gap-2">
                          {assignee.name}
                          {assignee.name === currentUser.name && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-gray-400 dark:text-zinc-500 text-xs">{assignee.name.toLowerCase().replace(' ', '.')}@company.com</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Space Info */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Space
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                  <div className={`w-3 h-3 rounded-full ${selectedTask.space?.color || 'bg-gray-500'}`} />
                  <span className="text-gray-900 dark:text-white text-sm">{selectedTask.space?.name || 'General'}</span>
                </div>
              </div>

              {/* Reminder */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reminder
                </h3>
                <p className="text-gray-600 dark:text-zinc-300 text-sm">
                  {selectedTask.isAllDay ? "9:00 AM on due date" : "1 hour before"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {selectedTask.status !== "done" && (
                  <Button 
                    onClick={() => handleCompleteTask(selectedTask.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                <Button variant="outline" className="w-full border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  Edit Task
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
