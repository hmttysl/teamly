"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, ListTodo, CalendarClock, Target, X, History, Sparkles, Plus } from "lucide-react";
import { DashboardTaskCard } from "./DashboardTaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { currentUser, spaces } from "@/lib/mock-data";
import { useTasks } from "@/lib/use-tasks";
import { useActivity } from "@/lib/use-activity";
import { addTask as addTaskToStore } from "@/lib/task-store";

// Get dynamic greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Get the start of the current week (Sunday)
function getStartOfWeek(): Date {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

// Get day name from date
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function Dashboard() {
  const { kanban } = useTasks();
  const { activities, formatTimeAgo, getActionText, allActivities, addActivity } = useActivity(4);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?.id || 1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const greeting = getGreeting();

  // Combine all tasks from kanban columns
  const allTasks = useMemo(() => {
    const { todo, inProgress, review, done } = kanban;
    return [...todo, ...inProgress, ...review, ...done];
  }, [kanban]);

  // Filter tasks where current user is assigned
  const userTasks = useMemo(() => {
    return allTasks.filter(task => {
      // Check assignees array first
      if (task.assignees && task.assignees.length > 0) {
        return task.assignees.some(a => a.name === currentUser.name);
      }
      // Fallback to single assignee
      return task.assignee?.name === currentUser.name;
    });
  }, [allTasks]);

  // Prepare tasks for display (ensure they have required fields)
  const displayTasks = useMemo(() => {
    return userTasks.map(task => ({
      ...task,
      assignees: task.assignees || [task.assignee],
      space: task.space || { name: "General", color: "bg-gray-500" },
    }));
  }, [userTasks]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const totalTasks = userTasks.length;
    
    // Count by status
    const inProgressCount = kanban.inProgress.filter(task => {
      if (task.assignees && task.assignees.length > 0) {
        return task.assignees.some(a => a.name === currentUser.name);
      }
      return task.assignee?.name === currentUser.name;
    }).length;

    const todoCount = kanban.todo.filter(task => {
      if (task.assignees && task.assignees.length > 0) {
        return task.assignees.some(a => a.name === currentUser.name);
      }
      return task.assignee?.name === currentUser.name;
    }).length;

    const reviewCount = kanban.review.filter(task => {
      if (task.assignees && task.assignees.length > 0) {
        return task.assignees.some(a => a.name === currentUser.name);
      }
      return task.assignee?.name === currentUser.name;
    }).length;

    // Upcoming = todo + review
    const upcomingCount = todoCount + reviewCount;

    return {
      total: totalTasks,
      inProgress: inProgressCount,
      upcoming: upcomingCount,
    };
  }, [kanban, userTasks]);

  // Get completed tasks assigned to current user this week
  const userCompletedThisWeek = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    return kanban.done.filter(task => {
      // Check if user is assigned
      const isUserAssigned = task.assignees && task.assignees.length > 0
        ? task.assignees.some(a => a.name === currentUser.name)
        : task.assignee?.name === currentUser.name;
      
      if (!isUserAssigned) return false;
      
      // Check if completed this week
      if (!task.completedAt) return false;
      const completedDate = new Date(task.completedAt);
      return completedDate >= startOfWeek;
    }).length;
  }, [kanban.done]);

  // Calculate weekly progress percentage
  const weeklyProgress = useMemo(() => {
    const totalWeeklyTasks = userTasks.length;
    if (totalWeeklyTasks === 0) return 0;
    return Math.round((userCompletedThisWeek / Math.max(totalWeeklyTasks, 1)) * 100);
  }, [userTasks.length, userCompletedThisWeek]);


  // Generate dynamic weekly progress data - only for current user's tasks
  const weeklyData = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize all days with 0
    const weekData = days.map(day => ({ day, completed: 0 }));
    
    // Count completed tasks per day - only tasks assigned to current user
    kanban.done.forEach(task => {
      // Check if user is assigned
      const isUserAssigned = task.assignees && task.assignees.length > 0
        ? task.assignees.some(a => a.name === currentUser.name)
        : task.assignee?.name === currentUser.name;
      
      if (!isUserAssigned) return;
      
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        if (completedDate >= startOfWeek) {
          const dayIndex = completedDate.getDay();
          weekData[dayIndex].completed++;
        }
      }
    });

    // Reorder to start from Monday
    return [...weekData.slice(1), weekData[0]];
  }, [kanban.done]);

  // Find peak day
  const peakDay = useMemo(() => {
    return weeklyData.reduce((max, day) => day.completed > max.completed ? day : max, weeklyData[0]);
  }, [weeklyData]);

  const peakDayIndex = weeklyData.findIndex(d => d.day === peakDay.day);

  // Generate insight text
  const getWeeklyInsight = () => {
    if (peakDay.completed === 0) return "Start tracking your completed tasks this week";
    
    if (peakDayIndex <= 2) {
      return `Your productivity peaked early in the week on ${peakDay.day}`;
    } else if (peakDayIndex <= 4) {
      return `You completed most tasks mid-week on ${peakDay.day}`;
    } else {
      return `Your productivity peaked late in the week on ${peakDay.day}`;
    }
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-[#6B2FD9] to-[#8b5cf6] p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden group/banner">
          {/* Floating Sparkle with Glow */}
          <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 transition-all duration-700 group-hover/banner:scale-105">
            {/* Subtle outer glow */}
            <div className="absolute inset-0 bg-white/10 rounded-full blur-[40px] scale-[2] opacity-0 group-hover/banner:opacity-100 transition-all duration-1000" />
            {/* Sparkle icon */}
            <Sparkles 
              className="relative w-20 h-20 md:w-28 md:h-28 text-white/25 
                group-hover/banner:text-white/90 
                group-hover/banner:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] 
                transition-all duration-700 ease-out" 
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-28 md:pr-40">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight max-w-xl">
                Hi {currentUser.name.split(' ')[0]}! Ready to make today productive? 👋
              </h2>
              
              <div className="space-y-2">
                <p className="text-white/80 text-sm md:text-base">
                  You&apos;ve completed <span className="font-bold text-white">{weeklyProgress}%</span> of your weekly goals.
                </p>
                <div className="w-full max-w-sm h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                    style={{ width: `${weeklyProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Create Task Button */}
            <button 
              onClick={() => setShowCreateTaskModal(true)}
              className="bg-white hover:bg-gray-50 text-[#6B2FD9] px-6 py-4 rounded-2xl font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 self-start lg:self-center"
            >
              <Plus size={20} className="stroke-[3]" />
              <span>Create Task</span>
            </button>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</h3>
              <div className="p-1.5 bg-gray-50 dark:bg-zinc-900 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
                <ListTodo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.total}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-600 dark:text-gray-400">Assigned to you</span>
            </div>
          </div>

          {/* Active Work */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Work</h3>
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.inProgress}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-indigo-500 font-medium">Focus</span>
              <span className="text-gray-500 dark:text-gray-400">on these</span>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Upcoming</h3>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.upcoming}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-medium">To do</span>
              <span className="text-gray-500 dark:text-gray-400">& in review</span>
            </div>
          </div>

          {/* Completed This Week */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Completed This Week</h3>
              <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900/50 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{userCompletedThisWeek}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-green-600 dark:text-green-400 font-medium">Done</span>
              <span className="text-gray-500 dark:text-gray-400">by you this week</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Progress Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#6B2FD9]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Weekly Progress</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks completed this week</p>
              </div>
            </div>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    tickFormatter={(value) => value.substring(0, 3)}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    domain={[0, 'dataMax + 2']}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '12px',
                      padding: '10px 14px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 500 }}
                    formatter={(value: number) => [`${value} tasks`, 'Completed']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={3}
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isPeak = payload.day === peakDay.day && peakDay.completed > 0;
                      
                      return (
                        <g key={payload.day}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isPeak ? 7 : 4}
                            fill={isPeak ? '#7c3aed' : '#8b5cf6'}
                            stroke="white"
                            strokeWidth={isPeak ? 3 : 2}
                            style={{
                              filter: isPeak ? 'drop-shadow(0 2px 4px rgba(139, 92, 246, 0.4))' : 'none',
                            }}
                          />
                          {isPeak && (
                            <text
                              x={cx}
                              y={cy - 18}
                              textAnchor="middle"
                              fontSize={16}
                            >
                              🔥
                            </text>
                          )}
                        </g>
                      );
                    }}
                    activeDot={{ 
                      r: 6, 
                      fill: '#8b5cf6', 
                      stroke: 'white', 
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Insight Text */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#6B2FD9]"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{getWeeklyInsight()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-card rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <button 
                onClick={() => setShowHistoryModal(true)}
                className="text-sm text-[#6B2FD9] hover:text-[#5a27b8] font-medium"
              >
                View History
              </button>
            </div>
            
            <div className="space-y-5">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="relative">
                      <img 
                        src={activity.user.avatar} 
                        alt={activity.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400"> {getActionText(activity.type)}</span>
                      </p>
                      <p className="text-sm text-[#6B2FD9] dark:text-[#a78bfa] font-medium truncate">{activity.taskTitle}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* My Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">My Tasks</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tasks assigned to you from all spaces
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                className="h-9 w-9 shadow-sm hover:shadow"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                className="h-9 w-9 shadow-sm hover:shadow"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Task Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide scroll-smooth -mx-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayTasks.length > 0 ? (
            displayTasks.map((task) => (
              <DashboardTaskCard
                key={task.id}
                title={task.title}
                dueDate={task.dueDate}
                space={task.space}
                assignees={task.assignees}
                onClick={() => handleTaskClick(task)}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">No tasks assigned to you</p>
                <p className="text-sm">Tasks you're assigned to will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />

      {/* Activity History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                  <History className="w-5 h-5 text-[#6B2FD9]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity History</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All recent activities</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowHistoryModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {allActivities.length > 0 ? (
                allActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <img 
                        src={activity.user.avatar} 
                        alt={activity.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                        activity.type === "complete" ? "bg-green-500" :
                        activity.type === "create" ? "bg-blue-500" :
                        activity.type === "move" ? "bg-yellow-500" :
                        activity.type === "comment" ? "bg-[#6B2FD9]" :
                        activity.type === "delete" ? "bg-red-500" :
                        "bg-gray-400"
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{activity.user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400"> {getActionText(activity.type)}</span>
                      </p>
                      <p className="text-sm text-[#6B2FD9] dark:text-[#a78bfa] font-medium truncate">{activity.taskTitle}</p>
                      {activity.type === "move" && activity.fromColumn && activity.toColumn && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {activity.fromColumn} → {activity.toColumn}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No activity history yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Task Modal */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                  <Plus className="w-5 h-5 text-[#6B2FD9]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Create Task</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setNewTaskTitle("");
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Space Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Space
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {spaces.map((space) => (
                    <button
                      key={space.id}
                      onClick={() => setSelectedSpaceId(space.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedSpaceId === space.id
                          ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${space.color}`} />
                      <span className={`text-sm font-medium ${
                        selectedSpaceId === space.id 
                          ? "text-[#6B2FD9]" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {space.name}
                      </span>
                      {selectedSpaceId === space.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#6B2FD9] ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <Input
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTaskTitle.trim()) {
                      const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];
                      addTaskToStore(selectedSpaceId, "todo", {
                        title: newTaskTitle.trim(),
                        description: "",
                        assignee: {
                          name: currentUser.name,
                          avatar: currentUser.avatar,
                          initials: currentUser.initials,
                        },
                        assignees: [{
                          name: currentUser.name,
                          avatar: currentUser.avatar,
                          initials: currentUser.initials,
                        }],
                        dueDate: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        space: { name: selectedSpace.name, color: selectedSpace.color },
                      });
                      addActivity("create", newTaskTitle.trim(), { spaceId: selectedSpaceId, spaceName: selectedSpace.name });
                      setNewTaskTitle("");
                      setShowCreateTaskModal(false);
                    }
                  }}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Task will be added to the To Do column of the selected space.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-[#6B2FD9] hover:bg-[#5a27b8]"
                disabled={!newTaskTitle.trim()}
                onClick={() => {
                  if (newTaskTitle.trim()) {
                    const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];
                    addTaskToStore(selectedSpaceId, "todo", {
                      title: newTaskTitle.trim(),
                      description: "",
                      assignee: {
                        name: currentUser.name,
                        avatar: currentUser.avatar,
                        initials: currentUser.initials,
                      },
                      assignees: [{
                        name: currentUser.name,
                        avatar: currentUser.avatar,
                        initials: currentUser.initials,
                      }],
                      dueDate: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      space: { name: selectedSpace.name, color: selectedSpace.color },
                    });
                    addActivity("create", newTaskTitle.trim(), { spaceId: selectedSpaceId, spaceName: selectedSpace.name });
                    setNewTaskTitle("");
                    setShowCreateTaskModal(false);
                  }
                }}
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

