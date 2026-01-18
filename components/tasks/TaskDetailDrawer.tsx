"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  FileText,
  Image,
  File,
  Trash2,
  Download,
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
import { useActivity } from "@/lib/use-activity";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { spaceMembers } from "@/lib/mock-data";
import { getDueDateInfo, getDueDateStyles, formatDateForInput } from "@/lib/date-utils";

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

interface Attachment {
  id: number;
  name: string;
  size: string;
  type: string;
  url?: string;
}

interface Assignee {
  name: string;
  avatar: string;
  initials: string;
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
  space?: {
    name: string;
    color: string;
  };
}

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate?: (taskId: number, updates: Partial<Task>) => void;
}

export function TaskDetailDrawer({ task, isOpen, onClose, onTaskUpdate }: TaskDetailDrawerProps) {
  const [taskTitle, setTaskTitle] = useState(task?.title || "");
  const [taskDescription, setTaskDescription] = useState(task?.description || "");
  const [taskStatus, setTaskStatus] = useState(task?.status || "todo");
  const [taskDueDate, setTaskDueDate] = useState(task?.dueDate || "");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>(task?.assignees || (task?.assignee ? [task.assignee] : []));
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addActivity } = useActivity();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  // Current user info
  const currentUser = useMemo(() => ({
    name: profile?.name || user?.email?.split('@')[0] || "User",
    avatar: profile?.avatar_url || "",
    initials: (profile?.name || user?.email?.split('@')[0] || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
  }), [user, profile]);

  // Reset all state when task changes
  useEffect(() => {
    if (task) {
      setTaskTitle(task.title);
      setTaskDescription(task.description);
      setTaskStatus(task.status || "todo");
      setTaskDueDate(task.dueDate);
      setAssignees(task.assignees || (task.assignee ? [task.assignee] : []));
      setComments([]);
      setAttachments([]);
      setHasChanges(false);
    }
  }, [task?.id]);

  // Track changes
  useEffect(() => {
    if (task) {
      const titleChanged = taskTitle !== task.title;
      const descChanged = taskDescription !== task.description;
      const statusChanged = taskStatus !== (task.status || "todo");
      const dateChanged = taskDueDate !== task.dueDate;
      const assigneesChanged = JSON.stringify(assignees) !== JSON.stringify(task.assignees || (task.assignee ? [task.assignee] : []));
      
      setHasChanges(titleChanged || descChanged || statusChanged || dateChanged || assigneesChanged);
    }
  }, [task, taskTitle, taskDescription, taskStatus, taskDueDate, assignees]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const newAttachment: Attachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url: URL.createObjectURL(file),
      };
      setAttachments(prev => [...prev, newAttachment]);
      
      // Add activity
      if (task) {
        addActivity("attachment", task.title, {
          taskId: task.id,
          spaceName: task.space?.name,
        });
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file removal
  const handleRemoveAttachment = (id: number) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Handle file download
  const handleDownloadAttachment = (attachment: Attachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Save all changes
  const handleSaveChanges = async () => {
    if (!task || !onTaskUpdate) return;
    
    setIsSaving(true);
    
    try {
      const updates: Partial<Task> = {
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        dueDate: taskDueDate,
        assignees: assignees,
      };

      onTaskUpdate(task.id, updates);
      
      // Add activity for update
      addActivity("update", task.title, {
        taskId: task.id,
        spaceName: task.space?.name,
      });

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: string) => {
    setTaskStatus(newStatus);
    
    // Immediately update if callback exists
    if (task && onTaskUpdate) {
      onTaskUpdate(task.id, { status: newStatus });
      
      if (newStatus === "done") {
        addActivity("complete", task.title, {
          taskId: task.id,
          spaceName: task.space?.name,
        });
      }
    }
  };

  // Handle due date change
  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTaskDueDate(newDate);
    
    // Immediately update if callback exists
    if (task && onTaskUpdate) {
      onTaskUpdate(task.id, { dueDate: newDate });
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim() && task) {
      // Add comment to local state
      const newComment: Comment = {
        id: Date.now(),
        user: currentUser,
        text: comment.trim(),
        time: formatTimeAgo(new Date()),
      };
      setComments(prev => [...prev, newComment]);

      // Add to activity log
      addActivity("comment", task.title, {
        taskId: task.id,
        spaceId: task.space?.name ? undefined : undefined,
        spaceName: task.space?.name,
      });
      setComment("");
    }
  };

  if (!task || !isOpen) return null;

  const dueDateInfo = getDueDateInfo(taskDueDate || task.dueDate);
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
              <h2 className="font-semibold text-gray-900 dark:text-white">{t.taskDetailsTitle}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">#{task.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button 
                onClick={handleSaveChanges} 
                disabled={isSaving}
                className="bg-[#6B2FD9] hover:bg-[#5a27b8] text-white gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t.saving : t.save}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.taskTitleLabel}</label>
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
                  {t.status}
                </label>
                <Select value={taskStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">{t.todo}</SelectItem>
                    <SelectItem value="inprogress">{t.inProgress}</SelectItem>
                    <SelectItem value="review">{t.review}</SelectItem>
                    <SelectItem value="done">{t.done}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  {t.dueDate}
                  {dueDateInfo.state !== "normal" && dueDateInfo.state !== "upcoming" && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${dueDateStyles.containerClass} ${dueDateStyles.textClass}`}>
                      {dueDateInfo.label}
                    </span>
                  )}
                </label>
                <Input
                  type="date"
                  value={formatDateForInput(taskDueDate)}
                  onChange={handleDueDateChange}
                  className="text-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
              </div>
            </div>

            {/* Assignees - Multiple */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {t.assignedTo} ({assignees.length})
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
                      {t.addAssignee}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                        {t.selectMember}
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
                          {t.allMembersAssigned}
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.description}</label>
              <Textarea
                value={taskDescription || task.description}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder={t.addDetailedDescription}
                className="min-h-[120px] resize-none dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {t.attachments} ({attachments.length})
              </label>

              {/* Uploaded files list */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment) => {
                    const FileIcon = getFileIcon(attachment.type);
                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                            <FileIcon className="w-4 h-4 text-[#6B2FD9]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                              {attachment.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {attachment.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#6B2FD9]"
                            onClick={() => handleDownloadAttachment(attachment)}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveAttachment(attachment.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload area */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-[#6B2FD9]', 'bg-[#6B2FD9]/5');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-[#6B2FD9]', 'bg-[#6B2FD9]/5');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-[#6B2FD9]', 'bg-[#6B2FD9]/5');
                  const files = e.dataTransfer.files;
                  if (files.length > 0 && fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    Array.from(files).forEach(file => dataTransfer.items.add(file));
                    fileInputRef.current.files = dataTransfer.files;
                    handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                className="border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg p-4 text-center hover:border-[#6B2FD9]/50 dark:hover:border-[#6B2FD9]/50 transition-colors cursor-pointer"
              >
                <Paperclip className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.dropFilesHere}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t.filesUploadHint}
                </p>
              </div>
            </div>

            {/* Secondary Metadata (Created & Completed dates) */}
            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
                {task.createdAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.created} {formatSecondaryDate(task.createdAt)}</span>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                    <span>{t.completed} {formatSecondaryDate(task.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity & Comments */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{t.activity}</h3>
              </div>

              {/* Comments Timeline */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    {t.noCommentsYet}
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={c.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6B2FD9] to-violet-500 text-white text-xs">
                          {c.user.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {c.user.name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {c.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{c.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="flex gap-2 pt-4">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6B2FD9] to-violet-500 text-white text-xs">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder={t.writeComment}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                    className="flex-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
                  />
                  <Button 
                    size="icon" 
                    className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
                    onClick={handleSubmitComment}
                    disabled={!comment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
