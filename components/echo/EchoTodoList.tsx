"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronDown,
  ChevronUp,
  Check,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useEcho, EchoTask, EchoCategory } from '@/lib/use-echo';

interface EchoTodoListProps {
  activeFilter: string;
}

const EchoTodoList: React.FC<EchoTodoListProps> = ({ activeFilter }) => {
  const { 
    tasks, 
    categories, 
    addTask, 
    toggleTaskStatus, 
    deleteTask, 
    updateTaskCategory,
    updateTaskDueDate,
    deleteCategory 
  } = useEcho();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, undefined, undefined, newTaskDate || undefined);
    setNewTaskTitle('');
    setNewTaskDate('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredTasks = activeFilter === 'all' 
    ? tasks 
    : tasks.filter(t => t.categoryId === activeFilter);

  const activeTasks = filteredTasks.filter(t => t.status !== 'Completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'Completed');

  return (
    <div className="space-y-6 w-full">
      {/* Input */}
      <form onSubmit={handleAddTask} className="relative w-full">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600">
              <Sparkles size={20} />
            </div>
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#6B2FD9]/50 focus:border-[#6B2FD9] transition-all text-base font-medium placeholder:text-gray-400 dark:placeholder:text-zinc-600 text-gray-900 dark:text-white shadow-sm"
            />
          </div>
          <div className="relative">
            <input 
              type="date" 
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#6B2FD9]/50 focus:border-[#6B2FD9] transition-all text-sm font-medium text-gray-700 dark:text-zinc-300 shadow-sm w-[140px]"
            />
          </div>
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-[#6B2FD9] text-white px-5 py-4 rounded-xl text-sm font-semibold hover:bg-[#5a27b8] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Create
          </button>
        </div>
      </form>

      {/* Task List Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">
          Active Tasks {activeFilter !== 'all' && <span className="text-[#6B2FD9] ml-1">/ {categories.find(c => c.id === activeFilter)?.name}</span>}
        </h3>
        <span className="text-xs font-medium text-gray-400 dark:text-zinc-600">{activeTasks.length} items</span>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {activeTasks.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task} 
            categories={categories}
            onToggle={toggleTaskStatus} 
            onDelete={deleteTask}
            onCategoryChange={updateTaskCategory}
            onDeleteCategory={deleteCategory}
            onDateChange={updateTaskDueDate}
            formatDate={formatDate}
          />
        ))}
      </div>

      {activeTasks.length === 0 && (
        <div className="py-12 text-center bg-gray-50 dark:bg-zinc-900/50 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
          <CheckCircle2 size={40} className="text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-zinc-500 font-medium">All tasks completed!</p>
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-zinc-800">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900/50 hover:bg-gray-100 dark:hover:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500">
                <Check size={16} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Completed ({completedTasks.length})
              </span>
            </div>
            <div className="text-gray-400 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-white transition-all">
              {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>

          {showCompleted && (
            <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
              {completedTasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  categories={categories}
                  onToggle={toggleTaskStatus} 
                  onDelete={deleteTask}
                  onCategoryChange={updateTaskCategory}
                  onDeleteCategory={deleteCategory}
                  onDateChange={updateTaskDueDate}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 mt-6">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase">Pending</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeTasks.length}</span>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase">Done</span>
            <span className="text-2xl font-bold text-emerald-500">{completedTasks.length}</span>
          </div>
          <div className="h-10 w-px bg-gray-200 dark:bg-zinc-800"></div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase">Progress</span>
            <span className="text-2xl font-bold text-[#6B2FD9]">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#6B2FD9]/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#6B2FD9] animate-pulse"></div>
          <span className="text-xs font-semibold text-[#6B2FD9]">Active</span>
        </div>
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ 
  task: EchoTask; 
  categories: EchoCategory[];
  onToggle: (id: string) => void; 
  onDelete: (id: string) => void;
  onCategoryChange: (taskId: string, categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onDateChange: (taskId: string, date: string | undefined) => void;
  formatDate: (dateStr: string) => string;
}> = ({ task, categories, onToggle, onDelete, onCategoryChange, onDeleteCategory, onDateChange, formatDate }) => {
  const isCompleted = task.status === 'Completed';
  const category = categories.find(c => c.id === task.categoryId);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className={`group flex items-center gap-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700 ${
      isCompleted ? 'opacity-50' : ''
    }`}>
      <button 
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
          isCompleted 
          ? 'bg-emerald-500 text-white' 
          : 'border-2 border-gray-300 dark:border-zinc-700 hover:border-[#6B2FD9] text-transparent hover:text-[#6B2FD9]/50'
        }`}
      >
        {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : <Circle size={16} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(task.id)}>
        <h4 className={`font-semibold text-base transition-all truncate ${
          isCompleted ? 'line-through text-gray-400 dark:text-zinc-600' : 'text-gray-900 dark:text-white'
        }`}>
          {task.title}
        </h4>
        {task.description && (
          <p className={`text-sm truncate ${
            isCompleted ? 'text-gray-300 dark:text-zinc-700' : 'text-gray-500 dark:text-zinc-500'
          }`}>
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Date Badge */}
        <div className="relative">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowDatePicker(!showDatePicker); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium ${
              task.dueDate 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20' 
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 hover:text-[#6B2FD9] hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Calendar size={12} />
            <span>{task.dueDate ? formatDate(task.dueDate) : 'Date'}</span>
          </button>
          
          {showDatePicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowDatePicker(false)} />
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-40 p-3 animate-in slide-in-from-top-2 duration-200">
                <input 
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    onDateChange(task.id, e.target.value || undefined);
                    setShowDatePicker(false);
                  }}
                  className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2FD9]/50"
                />
                {task.dueDate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDateChange(task.id, undefined);
                      setShowDatePicker(false);
                    }}
                    className="w-full mt-2 text-xs text-rose-500 hover:text-rose-600 font-medium"
                  >
                    Remove date
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Category Badge */}
        <div className="relative">
          {category ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCatPicker(!showCatPicker); }}
              className={`flex items-center justify-center px-3 py-1.5 rounded-full ${category.color} transition-all hover:scale-105 active:scale-95`}
            >
              <span className="text-xs font-semibold text-white">
                {category.name}
              </span>
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowCatPicker(!showCatPicker); }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-zinc-500 hover:text-[#6B2FD9] hover:border-[#6B2FD9] transition-all"
            >
              <Plus size={16} />
            </button>
          )}
          
          {showCatPicker && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowCatPicker(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg z-40 p-2 animate-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase">Category</div>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      className="group/cat flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onCategoryChange(task.id, cat.id); 
                          setShowCatPicker(false); 
                        }}
                        className="flex-1 flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-all"
                      >
                        <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                        {cat.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(cat.id);
                        }}
                        className="p-1 text-gray-300 dark:text-zinc-700 hover:text-rose-500 rounded opacity-0 group-hover/cat:opacity-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-2 text-gray-300 dark:text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default EchoTodoList;
