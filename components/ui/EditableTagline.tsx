"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check } from "lucide-react";

interface EditableTaglineProps {
  value: string;
  canEdit: boolean;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
}

export function EditableTagline({ 
  value, 
  canEdit, 
  onSave, 
  placeholder = "Add a description..." 
}: EditableTaglineProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save tagline:", error);
      setEditValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing && !isSaving) {
        handleSave();
      }
    }, 150);
  };

  // Non-editable view for unauthorized users
  if (!canEdit) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {value || placeholder}
      </p>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          placeholder={placeholder}
          className="flex-1 text-sm bg-transparent border-b-2 border-[#6B2FD9] text-gray-700 dark:text-gray-300 
                     focus:outline-none focus:ring-0 py-0.5 px-0
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     disabled:opacity-50"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
          aria-label="Save tagline"
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </button>
      </div>
    );
  }

  // View mode for authorized users (with hover effects)
  return (
    <div
      className="relative group inline-flex items-center gap-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      <div
        className={`relative py-0.5 px-2 -ml-2 rounded transition-all duration-200 ${
          isHovered
            ? "bg-gray-100 dark:bg-white/5 ring-1 ring-gray-200 dark:ring-white/10"
            : ""
        }`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 pr-6">
          {value || <span className="italic text-gray-400 dark:text-gray-500">{placeholder}</span>}
        </p>
        
        {/* Pencil icon - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={`absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded 
                      text-gray-400 hover:text-[#6B2FD9] hover:bg-[#6B2FD9]/10
                      transition-all duration-200 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
          aria-label="Edit tagline"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
