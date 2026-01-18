"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Filter,
  Tag,
  X,
  Check
} from 'lucide-react';
import EchoTodoList from './EchoTodoList';
import { useEcho } from '@/lib/use-echo';
import { useLanguage } from '@/lib/language-context';

const PRESET_COLORS = [
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-rose-500',
];

const EchoPage: React.FC = () => {
  const { categories, addCategory } = useEcho();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory(newCatName, selectedColor);
    setNewCatName('');
    setSelectedColor(PRESET_COLORS[0]);
    setShowAddCategory(false);
  };

  return (
    <div className="flex-1 w-full h-full bg-gray-50 dark:bg-background space-y-12 animate-in fade-in duration-500 px-4 md:px-8 overflow-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#6B2FD9]/20 text-[#6B2FD9] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-[#6B2FD9]/20">{t.workspace}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{t.echoTasksTitle}</h1>
          <p className="text-gray-500 dark:text-zinc-500 mt-3 text-base font-medium max-w-2xl leading-relaxed">{t.echoDescription}</p>
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-3 px-5 py-3 border rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${
                activeFilter !== 'all' 
                ? 'bg-[#6B2FD9] border-[#6B2FD9] text-white' 
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
            >
              <Filter size={20} />
              <span>{activeFilter === 'all' ? t.filter : categories.find(c => c.id === activeFilter)?.name}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{t.categories}</span>
                  <button onClick={() => { setShowAddCategory(true); setShowFilterMenu(false); }} className="text-[#6B2FD9] hover:text-[#5a27b8]">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  <button 
                    onClick={() => { setActiveFilter('all'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === 'all' ? 'bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                  >
                    {t.allTasks}
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => { setActiveFilter(cat.id); setShowFilterMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === cat.id ? 'bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#6B2FD9] text-white rounded-xl text-sm font-bold hover:bg-[#5a27b8] transition-all shadow-lg active:scale-95"
          >
            <Tag size={18} />
            <span className="hidden sm:inline">{t.newCategory}</span>
          </button>
        </div>
      </div>

      {/* New Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.createLabel}</h3>
              <button onClick={() => setShowAddCategory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide mb-2 block">{t.labelName}</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t.egArchitecture}
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6B2FD9]/50 font-medium placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide mb-3 block">{t.color}</label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-9 h-9 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 ${
                        selectedColor === color 
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-[#6B2FD9]' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Subtle glow effect */}
                      <div className={`absolute inset-0 rounded-full ${color} blur-sm opacity-40`} />
                      {/* Main color circle */}
                      <div className={`absolute inset-0.5 rounded-full ${color} flex items-center justify-center`}>
                        {selectedColor === color && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="w-full py-3 bg-[#6B2FD9] text-white rounded-xl font-semibold hover:bg-[#5a27b8] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Todo List Area */}
      <div className="w-full max-w-5xl mx-auto pb-8">
        <EchoTodoList activeFilter={activeFilter} />
      </div>
    </div>
  );
};

export default EchoPage;
