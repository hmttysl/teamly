"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, GripVertical, MoreHorizontal, Trash2, Pencil, X, Calendar, Check } from "lucide-react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDetailDrawer } from "@/components/tasks/TaskDetailDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpaceTasks, type Task, type KanbanColumn } from "@/lib/use-tasks";
import { spaces } from "@/lib/mock-data";
import { useActivity } from "@/lib/use-activity";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

interface ColumnProps {
  id: KanbanColumn;
  title: string;
  count: number;
  tasks: Task[];
  color: string;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task, column: KanbanColumn) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, column: KanbanColumn) => void;
  onAddTask: (column: KanbanColumn) => void;
  onDeleteTask: (taskId: number, taskTitle: string) => void;
  onTitleChange: (newTitle: string) => void;
  isEditingTitle: boolean;
  onStartEditTitle: () => void;
  onEndEditTitle: () => void;
  editingTitleValue: string;
  onEditingTitleChange: (value: string) => void;
}

function KanbanColumn({
  id,
  title,
  count,
  tasks,
  color,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDrop,
  onAddTask,
  onDeleteTask,
  onTitleChange,
  isEditingTitle,
  onStartEditTitle,
  onEndEditTitle,
  editingTitleValue,
  onEditingTitleChange,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, id);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onTitleChange(editingTitleValue);
      onEndEditTitle();
    } else if (e.key === "Escape") {
      onEndEditTitle();
    }
  };

  return (
    <div
      className={`flex-1 min-w-[300px] bg-gray-50 dark:bg-card rounded-lg p-4 transition-all ${
        isDragOver ? "ring-2 ring-[#6B2FD9] ring-opacity-50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${color}`}></div>
          {isEditingTitle ? (
            <Input
              value={editingTitleValue}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onBlur={() => {
                onTitleChange(editingTitleValue);
                onEndEditTitle();
              }}
              onKeyDown={handleTitleKeyDown}
              className="h-7 text-sm font-semibold"
              autoFocus
            />
          ) : (
            <h2
              className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-[#6B2FD9]"
              onDoubleClick={onStartEditTitle}
            >
              {title}
            </h2>
          )}
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 rounded-full text-xs">
            {count}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddTask(id)}>
          <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => onDragStart(e, task, id)}
            className="cursor-grab active:cursor-grabbing group relative"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <div className={id === "done" ? "opacity-70" : ""}>
              <TaskCard
                {...task}
                onClick={() => onTaskClick(task)}
                isDone={id === "done"}
              />
            </div>
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTaskClick(task)}>
                    <Pencil className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDeleteTask(task.id, task.title)}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  spaceId: number;
  spaceDbId?: string;
  spaceName?: string;
  spaceColor?: string;
}

export function KanbanBoard({ spaceId, spaceDbId, spaceName, spaceColor = "bg-purple-500" }: KanbanBoardProps) {
  const { kanban, moveTask, addTask, updateTask, deleteTask } = useSpaceTasks(spaceId);
  const { addActivity } = useActivity();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  
  // Current user info from auth
  const currentUser = useMemo(() => ({
    id: 0,
    name: profile?.name || user?.email?.split('@')[0] || "User",
    avatar: profile?.avatar_url || "",
    initials: (profile?.name || user?.email?.split('@')[0] || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    email: user?.email || "",
  }), [user, profile]);
  
  // All available members for assignment (just current user for now)
  const allMembers = useMemo(() => [currentUser], [currentUser]);
  
  // Space members (excluding current user) - fetched from Supabase
  const [spaceMembers, setSpaceMembers] = useState<typeof allMembers>([]);
  
  // Fetch space members from Supabase
  useEffect(() => {
    const fetchSpaceMembers = async () => {
      if (!spaceDbId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from("space_members")
          .select(`
            user_id,
            profiles:user_id (
              id,
              name,
              email,
              avatar_url
            )
          `)
          .eq("space_id", spaceDbId);
        
        if (error) throw error;
        
        const members = (data || [])
          .filter((m: any) => m.profiles && m.user_id !== user.id) // Exclude current user
          .map((m: any, index: number) => ({
            id: index + 1,
            name: m.profiles.name || "User",
            avatar: m.profiles.avatar_url || "",
            initials: (m.profiles.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            email: m.profiles.email || "",
          }));
        
        setSpaceMembers(members);
      } catch (err) {
        console.error("Error fetching space members:", err);
      }
    };
    
    fetchSpaceMembers();
  }, [spaceDbId, user]);
  
  // Get space info
  const spaceInfo = spaces.find(s => s.id === spaceId) || { name: spaceName || "Space", color: spaceColor };
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; column: KanbanColumn } | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState<KanbanColumn | null>(null);
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskDueTime, setNewTaskDueTime] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<{id: number; name: string; avatar: string; initials: string; email: string}[]>([]);
  const [assignSelf, setAssignSelf] = useState(true);

  // Custom column titles - only stores user-edited titles
  const [customColumnTitles, setCustomColumnTitles] = useState<Partial<Record<KanbanColumn, string>>>({});
  
  // Computed column titles - uses custom if set, otherwise translation
  const columnTitles = useMemo(() => ({
    todo: customColumnTitles.todo || t.todo,
    inProgress: customColumnTitles.inProgress || t.inProgress,
    review: customColumnTitles.review || t.review,
    done: customColumnTitles.done || t.done,
  }), [customColumnTitles, t]);
  
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleDragStart = (e: React.DragEvent, task: Task, column: KanbanColumn) => {
    setDraggedTask({ task, column });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const columnNames: Record<KanbanColumn, string> = {
    todo: t.todo,
    inProgress: t.inProgress,
    review: t.review,
    done: t.done,
  };

  const handleDrop = (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault();
    if (draggedTask && draggedTask.column !== targetColumn) {
      moveTask(draggedTask.task.id, draggedTask.column, targetColumn);
      
      // Add activity for move
      const activityType = targetColumn === "done" ? "complete" : "move";
      addActivity(activityType, draggedTask.task.title, {
        taskId: draggedTask.task.id,
        spaceId,
        spaceName: spaceInfo.name,
        fromColumn: columnNames[draggedTask.column],
        toColumn: columnNames[targetColumn],
      });
    }
    setDraggedTask(null);
  };

  const handleAddTask = (column: KanbanColumn) => {
    setShowAddTaskModal(column);
    setNewTaskTitle("");
    setNewTaskDescription("");
    // Use local date to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setNewTaskDueDate(`${year}-${month}-${day}`);
    setNewTaskDueTime("09:00");
    setIsAllDay(false);
    setSelectedAssignees([]);
    setAssignSelf(true);
  };

  const toggleAssignee = (member: typeof allMembers[0]) => {
    const isSelected = selectedAssignees.some(a => a.name === member.name);
    if (isSelected) {
      setSelectedAssignees(selectedAssignees.filter(a => a.name !== member.name));
    } else {
      setSelectedAssignees([...selectedAssignees, member]);
    }
  };

  const handleSubmitNewTask = async () => {
    if (newTaskTitle.trim() && showAddTaskModal && spaceDbId) {
      // Build assignees list
      let assignees = [...selectedAssignees];
      
      // Add self if checked and not already in list
      if (assignSelf && !assignees.some(a => a.name === currentUser.name)) {
        assignees.unshift({
          id: 0,
          name: currentUser.name,
          avatar: currentUser.avatar,
          initials: currentUser.initials,
          email: currentUser.email,
        });
      }

      // If no assignees, at least add current user
      if (assignees.length === 0) {
        assignees = [{
          id: 0,
          name: currentUser.name,
          avatar: currentUser.avatar,
          initials: currentUser.initials,
          email: currentUser.email,
        }];
      }

      // Build due date with time
      let dueDateTime: string;
      let dueAt: string | null = null;
      
      if (newTaskDueDate) {
        if (isAllDay) {
          dueDateTime = new Date(newTaskDueDate).toISOString();
        } else if (newTaskDueTime) {
          const [hours, minutes] = newTaskDueTime.split(':');
          const date = new Date(newTaskDueDate);
          date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          dueDateTime = date.toISOString();
          dueAt = date.toISOString();
        } else {
          dueDateTime = new Date(newTaskDueDate).toISOString();
        }
      } else {
        dueDateTime = new Date().toISOString();
      }

      // Save task to Supabase
      try {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert({
            space_id: spaceDbId,
            title: newTaskTitle,
            description: newTaskDescription || null,
            status: showAddTaskModal,
            due_date: newTaskDueDate ? dueDateTime : null,
            is_all_day: isAllDay,
            created_by: user?.id,
          })
          .select()
          .single();

        if (taskError) throw taskError;

        // Add assignees to task_assignees table
        if (taskData) {
          // Get user IDs for assignees (need to look them up from space_members)
          const { data: memberData } = await supabase
            .from("space_members")
            .select("user_id, profiles:user_id(email)")
            .eq("space_id", spaceDbId);

          const assigneeUserIds: string[] = [];
          
          for (const assignee of assignees) {
            // Find matching member by email
            const member = memberData?.find((m: any) => m.profiles?.email === assignee.email);
            if (member) {
              assigneeUserIds.push(member.user_id);
            } else if (assignee.email === user?.email && user?.id) {
              // Current user
              assigneeUserIds.push(user.id);
            }
          }

          // Insert task assignees
          if (assigneeUserIds.length > 0) {
            await supabase
              .from("task_assignees")
              .insert(assigneeUserIds.map(userId => ({
                task_id: taskData.id,
                user_id: userId,
              })));

            // Send notifications to assignees (except current user)
            const notificationsToSend = assigneeUserIds
              .filter(userId => userId !== user?.id)
              .map(userId => ({
                user_id: userId,
                type: "task_assigned",
                title: t.newTaskAssigned || "New Task Assigned",
                message: `${profile?.name || "Someone"} ${t.assignedYouTask || "assigned you a task"}: ${newTaskTitle}`,
                data: {
                  task_id: taskData.id,
                  space_id: spaceDbId,
                  assigned_by: user?.id,
                },
                read: false,
              }));

            if (notificationsToSend.length > 0) {
              await supabase.from("notifications").insert(notificationsToSend);
            }
          }
        }
      } catch (err) {
        console.error("Error saving task to Supabase:", err);
      }

      // Also add to local state for immediate UI update
      addTask(showAddTaskModal, {
        title: newTaskTitle,
        description: newTaskDescription,
        assignee: {
          name: assignees[0].name,
          avatar: assignees[0].avatar,
          initials: assignees[0].initials,
        },
        assignees: assignees.map(a => ({
          name: a.name,
          avatar: a.avatar,
          initials: a.initials,
        })),
        dueDate: dueDateTime,
        dueAt: dueAt,
        isAllDay: isAllDay,
        createdAt: new Date().toISOString(),
        space: {
          name: spaceInfo.name,
          color: spaceInfo.color,
        },
      });
      
      // Add activity for task creation
      addActivity("create", newTaskTitle, {
        spaceId,
        spaceName: spaceInfo.name,
      });
      
      setShowAddTaskModal(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskDueTime("");
    setIsAllDay(false);
    setSelectedAssignees([]);
    setAssignSelf(true);
  };

  const handleDeleteTask = (taskId: number, taskTitle?: string) => {
    deleteTask(taskId);
    
    // Add activity for task deletion
    if (taskTitle) {
      addActivity("delete", taskTitle, {
        taskId,
        spaceId,
        spaceName: spaceInfo.name,
      });
    }
  };

  const handleStartEditTitle = (column: KanbanColumn) => {
    setEditingColumn(column);
    setEditingTitleValue(columnTitles[column]);
  };

  const handleTitleChange = (column: KanbanColumn, newTitle: string) => {
    if (newTitle.trim()) {
      // Check if the new title is the same as the translation (reset to default)
      const defaultTitle = t[column];
      if (newTitle.trim() === defaultTitle) {
        // Remove custom title, use translation
        setCustomColumnTitles((prev) => {
          const updated = { ...prev };
          delete updated[column];
          return updated;
        });
      } else {
        // Store custom title
        setCustomColumnTitles((prev) => ({ ...prev, [column]: newTitle.trim() }));
      }
    }
  };

  // Handle task updates from detail drawer
  const handleTaskUpdate = (taskId: number, updates: Partial<Task>) => {
    // Find which column the task is in
    for (const column of Object.keys(kanban) as KanbanColumn[]) {
      const taskIndex = kanban[column].findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        // If status changed, move the task
        if (updates.status) {
          const statusToColumn: Record<string, KanbanColumn> = {
            todo: "todo",
            inprogress: "inProgress",
            review: "review",
            done: "done",
          };
          const newColumn = statusToColumn[updates.status];
          if (newColumn && newColumn !== column) {
            moveTask(taskId, column, newColumn);
          }
        }
        
        // Persist all other changes to the task store
        updateTask(taskId, updates);
        break;
      }
    }
    
    // Update selected task if it's the one being edited
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const columns: { id: KanbanColumn; color: string }[] = [
    { id: "todo", color: "bg-slate-500" },
    { id: "inProgress", color: "bg-blue-500" },
    { id: "review", color: "bg-yellow-500" },
    { id: "done", color: "bg-emerald-500" },
  ];

  return (
    <div className="flex-1 bg-gray-100 dark:bg-background flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="p-6 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {spaceName || "Website Redesign"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your team&apos;s tasks
          </p>
        </div>
        <Button 
          onClick={() => handleAddTask("todo")}
          className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Scrollable Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(({ id, color }) => (
            <KanbanColumn
              key={id}
              id={id}
              title={columnTitles[id]}
              count={kanban[id].length}
              tasks={kanban[id]}
              color={color}
              onTaskClick={handleTaskClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onTitleChange={(newTitle) => handleTitleChange(id, newTitle)}
              isEditingTitle={editingColumn === id}
              onStartEditTitle={() => handleStartEditTitle(id)}
              onEndEditTitle={() => setEditingColumn(null)}
              editingTitleValue={editingTitleValue}
              onEditingTitleChange={setEditingTitleValue}
            />
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Task
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowAddTaskModal(null);
                  resetForm();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="dark:bg-zinc-800 dark:border-zinc-700"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Add a description..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent resize-none"
                />
              </div>

              {/* Due Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date & Time
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="pl-10 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                  {!isAllDay && (
                    <div className="w-32">
                      <Input
                        type="time"
                        value={newTaskDueTime}
                        onChange={(e) => setNewTaskDueTime(e.target.value)}
                        className="dark:bg-zinc-800 dark:border-zinc-700"
                      />
                    </div>
                  )}
                </div>
                {/* All Day Toggle */}
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="w-4 h-4 text-[#6B2FD9] rounded accent-[#6B2FD9]"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">All day</span>
                </label>
              </div>

              {/* Assign to Self */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignees
                </label>
                <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                  assignSelf
                    ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20"
                    : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
                }`}>
                  <input
                    type="checkbox"
                    checked={assignSelf}
                    onChange={(e) => setAssignSelf(e.target.checked)}
                    className="w-4 h-4 text-[#6B2FD9] rounded accent-[#6B2FD9]"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback className="bg-[#6B2FD9] text-white text-xs">
                        {currentUser.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9] px-2 py-1 rounded">
                    You
                  </span>
                  {assignSelf && (
                    <Check className="w-4 h-4 text-[#6B2FD9]" />
                  )}
                </label>
              </div>

              {/* Other Assignees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.addTeamMembers}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {spaceMembers.map((member) => {
                    const isSelected = selectedAssignees.some(a => a.name === member.name);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20"
                            : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAssignee({
                            id: member.id,
                            name: member.name,
                            avatar: member.avatar,
                            initials: member.initials,
                            email: member.email,
                          })}
                          className="w-4 h-4 text-[#6B2FD9] rounded accent-[#6B2FD9]"
                        />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 text-xs">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#6B2FD9]" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Selected Assignees Preview */}
              {(assignSelf || selectedAssignees.length > 0) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assigned to ({(assignSelf ? 1 : 0) + selectedAssignees.length})
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {assignSelf && (
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs">
                            {currentUser.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-700 dark:text-gray-300">You</span>
                      </div>
                    )}
                    {selectedAssignees.map((assignee) => (
                      <div 
                        key={assignee.name}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full"
                      >
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {assignee.name.split(' ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddTaskModal(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitNewTask}
                disabled={!newTaskTitle.trim()}
                className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
              >
                Create Task
              </Button>
            </div>
          </div>
        </div>
      )}

      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}
