"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Calendar,
  User,
  Users,
  Flag,
  MessageSquare,
  Paperclip,
  Send,
  Clock,
  CheckCircle,
  Plus,
  UserMinus,
  Image,
  File,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { mockActivities, spaceMembers, currentUser } from "@/lib/mock-data";
import { getDueDateInfo, getDueDateStyles, formatDateForInput } from "@/lib/date-utils";

interface Assignee {
  name: string;
  avatar: string;
  initials: string;
}

interface Attachment {
  id: number;
  name: string;
  type: "image" | "file";
  url: string;
  size: string;
}

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
    initials: string;
  };
  text: string;
  time: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: Assignee;
  assignees?: Assignee[];
  dueDate: string;
  createdAt?: string;
  completedAt?: string;
  status?: string;
}

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskDetailDrawer({ task, isOpen, onClose, onSave }: TaskDetailDrawerProps) {
  const [taskTitle, setTaskTitle] = useState(task?.title || "");
  const [taskDescription, setTaskDescription] = useState(task?.description || "");
  const [taskStatus, setTaskStatus] = useState(task?.status || "todo");
  const [taskDueDate, setTaskDueDate] = useState(task?.dueDate ? formatDateForInput(task.dueDate) : "");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>(task?.assignees || (task?.assignee ? [task.assignee] : []));
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when task changes
  useEffect(() => {
    if (task) {
      setTaskTitle(task.title || "");
      setTaskDescription(task.description || "");
      setTaskStatus(task.status || "todo");
      setTaskDueDate(task.dueDate ? formatDateForInput(task.dueDate) : "");
      setAssignees(task.assignees || (task.assignee ? [task.assignee] : []));
    }
  }, [task]);

  if (!task || !isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const newAttachment: Attachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: isImage ? "image" : "file",
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
      };
      setAttachments((prev) => [...prev, newAttachment]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleRemoveAttachment = (id: number) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      user: {
        name: currentUser.name,
        avatar: currentUser.avatar,
        initials: currentUser.initials,
      },
      text: comment,
      time: "Just now",
    };
    setComments((prev) => [...prev, newComment]);
    setComment("");
  };

  const handleSaveChanges = () => {
    if (onSave) {
      onSave(task.id, {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus as Task["status"],
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : task.dueDate,
        assignees,
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);
  const dueDateStyles = getDueDateStyles(dueDateInfo.state);

  const formatSecondaryDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get available members (not already assigned)
  const availableMembers = spaceMembers.filter(
    member => !assignees.some(a => a.name === member.name)
  );

  const handleAddAssignee = (member: typeof spaceMembers[0]) => {
    const newAssignee: Assignee = {
      name: member.name,
      avatar: member.avatar,
      initials: member.initials,
    };
    setAssignees([...assignees, newAssignee]);
    setIsAddingAssignee(false);
  };

  const handleRemoveAssignee = (name: string) => {
    if (assignees.length > 1) {
      setAssignees(assignees.filter(a => a.name !== name));
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-background/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-card z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
              <Flag className="w-5 h-5 text-[#6B2FD9]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Task Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">#{task.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
              <Input
                value={taskTitle || task.title}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="text-lg font-semibold dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
            </div>

            {/* Status and Due Date Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  Status
                </label>
                <Select value={taskStatus} onValueChange={setTaskStatus}>
                  <SelectTrigger className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  Due Date
                  {dueDateInfo.state !== "normal" && dueDateInfo.state !== "upcoming" && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dueDateStyles.containerClass} ${dueDateStyles.textClass}`}>
                      {dueDateInfo.label}
                    </span>
                  )}
                </label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="text-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
              </div>
            </div>

            {/* Assignees - Multiple */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Assigned to ({assignees.length})
              </label>
              
              <div className="space-y-2">
                {/* Current Assignees */}
                {assignees.map((assignee) => (
                  <div 
                    key={assignee.name}
                    className="flex items-center justify-between p-2 border border-gray-200 dark:border-zinc-800 rounded-lg group hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={assignee.avatar} />
                      <AvatarFallback className="bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/30 text-[#6B2FD9] text-xs">
                        {assignee.initials}
                      </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-900 dark:text-white">{assignee.name}</span>
                    </div>
                    {assignees.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveAssignee(assignee.name)}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Assignee Button */}
                <Popover open={isAddingAssignee} onOpenChange={setIsAddingAssignee}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 border-dashed text-gray-500 dark:text-gray-400 dark:border-zinc-700 hover:border-[#6B2FD9]/50 dark:hover:border-[#6B2FD9]/50 hover:text-[#6B2FD9]"
                    >
                      <Plus className="w-4 h-4" />
                      Add assignee
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                        Select a member
                      </p>
                      {availableMembers.length > 0 ? (
                        <div className="space-y-1">
                          {availableMembers.map((member) => (
                            <button
                              key={member.id}
                              onClick={() => handleAddAssignee(member)}
                              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-left"
                            >
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/30 text-[#6B2FD9] text-xs">
                                {member.initials}
                              </AvatarFallback>
                            </Avatar>
                              <span className="text-sm text-gray-900 dark:text-white">{member.name}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
                          All members are already assigned
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={taskDescription || task.description}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Add a detailed description..."
                className="min-h-[120px] resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                Attachments ({attachments.length})
              </label>
              
              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg group"
                    >
                      {attachment.type === "image" ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 flex items-center justify-center flex-shrink-0">
                          <File className="w-6 h-6 text-[#6B2FD9]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {attachment.size}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg p-4 text-center hover:border-[#6B2FD9]/50 dark:hover:border-[#6B2FD9]/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <Paperclip className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Click to upload images or files
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG, PDF, DOC up to 10MB
                </p>
              </div>
            </div>

            {/* Secondary Metadata (Created & Completed dates) */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
                {task.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Created {formatSecondaryDate(task.createdAt)}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                    <span>Completed {formatSecondaryDate(task.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity & Comments */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Activity & Comments</h3>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-xs">
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {activity.user.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{activity.action}</span>
                          {activity.value && (
                            <span className="text-sm font-medium text-[#6B2FD9]">
                              {activity.value}
                            </span>
                          )}
                        </div>
                        {activity.comment && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{activity.comment}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}

                {/* New Comments */}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={c.user.avatar} />
                      <AvatarFallback className="bg-[#6B2FD9] text-white text-xs">
                        {c.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-[#6B2FD9]/5 dark:bg-[#6B2FD9]/10 rounded-lg p-3 border border-[#6B2FD9]/20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {c.user.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">commented</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 inline-block">
                        {c.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 pt-4">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-[#6B2FD9] text-white text-xs">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    className="flex-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
                  />
                  <Button 
                    size="icon" 
                    className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
                    onClick={handleAddComment}
                    disabled={!comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="border-t border-gray-200 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {attachments.length > 0 && `${attachments.length} attachment${attachments.length > 1 ? 's' : ''}`}
              {attachments.length > 0 && comments.length > 0 && ' • '}
              {comments.length > 0 && `${comments.length} new comment${comments.length > 1 ? 's' : ''}`}
            </p>
            <Button 
              className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
              onClick={handleSaveChanges}
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
