"use client";

import { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, ListTodo, CalendarClock } from "lucide-react";
import { DashboardTaskCard } from "./DashboardTaskCard";
import { Button } from "@/components/ui/button";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { currentUser } from "@/lib/mock-data";
import { useTasks } from "@/lib/use-tasks";

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
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {greeting}, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            You have <span className="font-semibold text-gray-900 dark:text-white">{stats.total} tasks</span> assigned to you
          </p>
        </div>

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

          {/* In Progress */}
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">In Progress</h3>
              <div className="p-1.5 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg group-hover:bg-[#6B2FD9]/20 dark:group-hover:bg-[#6B2FD9]/30 transition-colors">
                <TrendingUp className="w-4 h-4 text-[#6B2FD9]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.inProgress}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#6B2FD9] font-medium">Active</span>
              <span className="text-gray-500 dark:text-gray-400">work items</span>
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

        {/* Weekly Progress Chart */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
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
    </div>
  );
}

