"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, ListTodo, CalendarClock, Target, X, History, Sparkles, Plus, Flame, LineChart as ChartIcon, Zap } from "lucide-react";
import { DashboardTaskCard } from "./DashboardTaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { currentUser, spaces } from "@/lib/mock-data";
import { useTasks } from "@/lib/use-tasks";
import { useActivity } from "@/lib/use-activity";
import { addTask as addTaskToStore } from "@/lib/task-store";
import { useEcho } from "@/lib/use-echo";

// Currently online users (simulated)
const onlineUsers = ["John Doe", "Sarah Jenkins", "Alex Riviera"];

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
  const { addTask: addEchoTask, completedTasks: echoCompletedTasks, activeTasks: echoActiveTasks, getCompletedThisWeek: getEchoCompletedThisWeek } = useEcho();
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | "echo">(spaces[0]?.id || 1);
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

  // Calculate dynamic stats (including Echo tasks)
  const stats = useMemo(() => {
    // Total includes both kanban and echo tasks
    const totalTasks = userTasks.length + echoActiveTasks.length + echoCompletedTasks.length;
    
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

    // Upcoming = todo + review + echo active tasks
    const upcomingCount = todoCount + reviewCount + echoActiveTasks.length;

    return {
      total: totalTasks,
      inProgress: inProgressCount,
      upcoming: upcomingCount,
    };
  }, [kanban, userTasks, echoActiveTasks, echoCompletedTasks]);

  // Get completed tasks assigned to current user this week (including Echo)
  const userCompletedThisWeek = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    const kanbanCompleted = kanban.done.filter(task => {
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
    
    // Add Echo completed this week
    const echoCompleted = getEchoCompletedThisWeek();
    
    return kanbanCompleted + echoCompleted;
  }, [kanban.done, getEchoCompletedThisWeek]);

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
          {/* Sparkle Decoration */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center select-none pointer-events-none animate-float">
            {/* Dynamic Aura Layers */}
            <div className="absolute inset-0 bg-white/10 blur-[90px] rounded-full scale-125 animate-sparkle" />
            <div className="absolute w-36 h-36 md:w-48 md:h-48 bg-purple-400/30 blur-[50px] rounded-full animate-shimmer" />
            
            {/* Primary Shining Star */}
            <svg
              viewBox="0 0 100 100"
              className="relative z-10 w-24 h-24 md:w-32 md:h-32 text-white drop-shadow-[0_0_25px_rgba(255,255,255,1)] animate-sparkle"
            >
              <path
                fill="currentColor"
                d="M50 0 C52 38 62 48 100 50 C62 52 52 62 50 100 C48 62 38 52 0 50 C38 48 48 38 50 0"
              />
            </svg>

            {/* Orbiting Satellites */}
            <div className="absolute animate-orbit-fast">
              <svg viewBox="0 0 100 100" className="w-6 h-6 md:w-8 md:h-8 text-white filter drop-shadow-[0_0_10px_white]">
                <path
                  fill="currentColor"
                  d="M50 0 C52 35 65 48 100 50 C65 52 52 65 50 100 C48 65 35 52 0 50 C35 48 48 35 50 0"
                />
              </svg>
            </div>

            <div className="absolute animate-orbit-slow" style={{ animationDelay: '-4s' }}>
              <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full blur-[1px] shadow-[0_0_15px_white]" />
            </div>
            
            <div className="absolute animate-orbit-slow" style={{ animationDelay: '-8s' }}>
              <svg viewBox="0 0 100 100" className="w-4 h-4 md:w-6 md:h-6 text-white/50">
                <path
                  fill="currentColor"
                  d="M50 0 C52 35 65 48 100 50 C65 52 52 65 50 100 C48 65 35 52 0 50 C35 48 48 35 50 0"
                />
              </svg>
            </div>

            {/* Magic Dust Particles */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-shimmer"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.4}s`,
                  opacity: 0.8
                }}
              />
            ))}
          </div>

          <div className="relative z-10 pr-48 md:pr-72">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight tracking-tight max-w-xl">
                Hi {currentUser.name.split(' ')[0]}! Ready to make today productive?
              </h2>
              
              <div className="space-y-2">
                <p className="text-white/80 text-sm md:text-base">
                  You&apos;ve completed <span className="font-bold text-white">{weeklyProgress}%</span> of your weekly goals.
                </p>
                <div className="w-full max-w-lg h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                    style={{ width: `${weeklyProgress}%` }}
                  />
                </div>
              </div>

              {/* Create Task Button */}
              <button 
                onClick={() => setShowCreateTaskModal(true)}
                className="bg-white hover:bg-gray-50 text-[#6B2FD9] px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 flex items-center gap-1.5 text-sm"
              >
                <Plus size={16} className="stroke-[2.5]" />
                <span>Create Task</span>
              </button>
            </div>
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
          <div className="lg:col-span-2 bg-white dark:bg-card rounded-[32px] border border-gray-200 dark:border-zinc-800 p-8 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                <ChartIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Weekly Progress</h3>
                <p className="text-sm text-gray-500">Tasks completed this week</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="flex-1 w-full relative min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" className="dark:stroke-white/5 stroke-gray-200" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                    tickFormatter={(value) => value.substring(0, 3)}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dx={-10}
                    domain={[0, 'dataMax + 2']}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#17171a', 
                      border: 'none', 
                      borderRadius: '12px', 
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: '#8b5cf6' }}
                    cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                    formatter={(value: number) => [`${value} tasks`, 'Completed']}
                    labelFormatter={(label) => label}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#8b5cf6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      const isPeak = payload.day === peakDay.day && peakDay.completed > 0;
                      
                      return (
                        <g key={payload.day}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#8b5cf6"
                            stroke="#fff"
                            strokeWidth={2}
                          />
                          {isPeak && (
                            <foreignObject x={cx - 12} y={cy - 44} width={24} height={24}>
                              <div className="flex items-center justify-center">
                                <Flame 
                                  className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                                  size={20}
                                />
                              </div>
                            </foreignObject>
                          )}
                        </g>
                      );
                    }}
                    activeDot={{ r: 8, fill: '#8b5cf6', strokeWidth: 0 }}
                  />
                </AreaChart>
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
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                        onlineUsers.includes(activity.user.name) ? "bg-green-500" : "bg-gray-400"
                      }`}></div>
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
                        onlineUsers.includes(activity.user.name) 
                          ? "bg-green-500" 
                          : "bg-gray-400"
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
              {/* Destination Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {/* Echo Option */}
                  <button
                    onClick={() => setSelectedSpaceId("echo")}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedSpaceId === "echo"
                        ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/40"
                        : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#6B2FD9]/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-[#6B2FD9]" />
                    </div>
                    <span className={`text-sm font-medium ${
                      selectedSpaceId === "echo" 
                        ? "text-[#6B2FD9] dark:text-[#a78bfa]" 
                        : "text-gray-700 dark:text-gray-300"
                    }`}>
                      Echo Tasks
                    </span>
                    {selectedSpaceId === "echo" && (
                      <CheckCircle2 className="w-4 h-4 text-[#6B2FD9] dark:text-[#a78bfa] ml-auto" />
                    )}
                  </button>
                  
                  {/* Spaces */}
                  {spaces.map((space) => (
                    <button
                      key={space.id}
                      onClick={() => setSelectedSpaceId(space.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedSpaceId === space.id
                          ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/40"
                          : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${space.color}`} />
                      <span className={`text-sm font-medium ${
                        selectedSpaceId === space.id 
                          ? "text-[#6B2FD9] dark:text-[#a78bfa]" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {space.name}
                      </span>
                      {selectedSpaceId === space.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#6B2FD9] dark:text-[#a78bfa] ml-auto" />
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
                      if (selectedSpaceId === "echo") {
                        // Add to Echo
                        addEchoTask(newTaskTitle.trim());
                        addActivity("create", newTaskTitle.trim(), { spaceId: 0, spaceName: "Echo Tasks" });
                      } else {
                        // Add to Space
                        const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];
                        addTaskToStore(selectedSpaceId as number, "todo", {
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
                        addActivity("create", newTaskTitle.trim(), { spaceId: selectedSpaceId as number, spaceName: selectedSpace.name });
                      }
                      setNewTaskTitle("");
                      setShowCreateTaskModal(false);
                    }
                  }}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedSpaceId === "echo" 
                  ? "Task will be added to Echo Tasks."
                  : "Task will be added to the To Do column of the selected space."}
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
                    if (selectedSpaceId === "echo") {
                      // Add to Echo
                      addEchoTask(newTaskTitle.trim());
                      addActivity("create", newTaskTitle.trim(), { spaceId: 0, spaceName: "Echo Tasks" });
                    } else {
                      // Add to Space
                      const selectedSpace = spaces.find(s => s.id === selectedSpaceId) || spaces[0];
                      addTaskToStore(selectedSpaceId as number, "todo", {
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
                      addActivity("create", newTaskTitle.trim(), { spaceId: selectedSpaceId as number, spaceName: selectedSpace.name });
                    }
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

