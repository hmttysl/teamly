"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, CheckCircle2, Sparkles } from 'lucide-react';

const TeamlyLoader: React.FC = () => {
  const [statusIndex, setStatusIndex] = useState(0);
  
  // Status messages that reflect the app's spirit
  const statuses = [
    "Syncing team spirit...",
    "Polishing kanban boards...",
    "Waking up the office otter...",
    "Transforming chaos into cards...",
    "Almost ready, team!"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [statuses.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden"
    >
      {/* Decorative Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-[#6B2FD9]/20 dark:bg-[#6B2FD9]/30 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-violet-500/20 dark:bg-violet-500/30 rounded-full blur-[80px]"
        />
      </div>

      {/* Main Animation Group */}
      <div className="relative flex flex-col items-center">
        {/* Logo and Icon Animation */}
        <div className="relative mb-12">
          {/* Pulsing Ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#6B2FD9] rounded-full blur-2xl"
          />

          {/* Main Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="relative w-52 h-52 flex items-center justify-center"
          >
            {/* Teamly Logo */}
            <img 
              src="/logo2.png" 
              alt="Teamly" 
              className="w-52 h-52 object-cover"
            />
            
          </motion.div>
        </div>

        {/* Text and Status Area */}
        <div className="text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight"
          >
            Teamly
          </motion.h1>
          
          <div className="h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-slate-500 dark:text-slate-400 font-semibold text-sm flex items-center gap-2"
              >
                {statuses[statusIndex]}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="mt-10 w-72 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden relative border border-slate-200 dark:border-zinc-700">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.5, ease: "easeInOut" }}
            className="absolute h-full bg-gradient-to-r from-[#6B2FD9] via-violet-500 to-[#6B2FD9] shadow-[0_0_15px_rgba(107,47,217,0.5)]"
          />
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1 }}
          className="mt-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-black"
        >
          Powering Your Collaboration
        </motion.p>
      </div>

      {/* Floating Task Cards Preview in Background */}
      <div className="absolute bottom-16 flex gap-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: [0, 0.8, 0], 
              y: [40, 0, -40],
              rotate: [i * 5 - 5, i * 2, i * 5 - 5]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 1.2,
              ease: "easeInOut"
            }}
            className="w-36 h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-xl p-3 flex flex-col justify-between"
          >
             <div className="space-y-2">
               <div className="h-2 w-20 bg-slate-200 dark:bg-zinc-700 rounded-full" />
               <div className="h-2 w-12 bg-[#6B2FD9]/30 rounded-full" />
             </div>
             <div className="flex justify-end items-center gap-1">
               <div className="w-5 h-5 bg-slate-100 dark:bg-zinc-800 rounded-full border border-white dark:border-zinc-700" />
               <div className="w-5 h-5 bg-[#6B2FD9]/20 rounded-full border border-white dark:border-zinc-700" />
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TeamlyLoader;
