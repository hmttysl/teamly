"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Palette, Users, Trash2, LogOut, Archive, Check, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Role, hasPermission } from "@/lib/permissions";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpaceSettingsProps {
  spaceName?: string;
  spaceId?: number;
  spaceDbId?: string;
  spaceColor?: string;
  spaceDescription?: string;
  onLeaveSpace?: (spaceId: number) => void;
  onDeleteSpace?: (spaceId: number) => void;
  onArchiveSpace?: (spaceId: number) => void;
  onUpdateSpace?: (spaceId: number, updates: { name?: string; description?: string; color?: string }) => void;
  onDescriptionChange?: (description: string) => void;
}

const colorOptions = [
  { name: "Purple", class: "bg-purple-500" },
  { name: "Pink", class: "bg-pink-500" },
  { name: "Blue", class: "bg-blue-500" },
  { name: "Cyan", class: "bg-cyan-500" },
  { name: "Orange", class: "bg-orange-500" },
  { name: "Green", class: "bg-green-500" },
  { name: "Indigo", class: "bg-indigo-500" },
  { name: "Rose", class: "bg-rose-500" },
];

export function SpaceSettings({ 
  spaceName = "", 
  spaceId,
  spaceDbId,
  spaceColor = "bg-purple-500",
  spaceDescription = "",
  onLeaveSpace,
  onDeleteSpace,
  onArchiveSpace,
  onUpdateSpace,
  onDescriptionChange,
}: SpaceSettingsProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [name, setName] = useState(spaceName);
  const [description, setDescription] = useState(spaceDescription);
  const [selectedColor, setSelectedColor] = useState(spaceColor);
  const [saved, setSaved] = useState(false);
  const [colorSaved, setColorSaved] = useState(false);
  const [anyoneCanInvite, setAnyoneCanInvite] = useState(true);
  const [membersCanCreateTasks, setMembersCanCreateTasks] = useState(true);
  const [permissionsSaved, setPermissionsSaved] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<Role>("Teammate");
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  // Sync state with props when they change
  useEffect(() => {
    setName(spaceName);
  }, [spaceName]);
  
  useEffect(() => {
    setSelectedColor(spaceColor);
  }, [spaceColor]);
  
  useEffect(() => {
    setDescription(spaceDescription);
  }, [spaceDescription]);
  
  // Fetch current user's role in this space
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!spaceDbId || !user) return;
      
      const { data, error } = await supabase
        .from("space_members")
        .select("role")
        .eq("space_id", spaceDbId)
        .eq("user_id", user.id)
        .single();
      
      if (!error && data) {
        setCurrentUserRole(data.role as Role);
      }
    };
    
    fetchUserRole();
  }, [spaceDbId, user]);
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveDetails = async () => {
    if (!spaceDbId) {
      setSaveError("Space ID not found");
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    
    // Set a safety timeout to prevent infinite saving state
    const safetyTimeout = setTimeout(() => {
      setSaving(false);
      setSaveError("Request timed out. Please check your internet connection.");
    }, 8000);
    
    try {
      const { data, error } = await supabase
        .from("spaces")
        .update({ 
          name,
          description,
          updated_at: new Date().toISOString() 
        })
        .eq("id", spaceDbId)
        .select()
        .single();
      
      clearTimeout(safetyTimeout);
      
      if (error) {
        throw error;
      }
      
      // Update description in parent component
      if (onDescriptionChange) {
        onDescriptionChange(description);
      }
      
      // Also call parent callback if provided
      if (spaceId !== undefined && onUpdateSpace) {
        onUpdateSpace(spaceId, { name, description });
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      clearTimeout(safetyTimeout);
      console.error("Error saving space details:", err);
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = async (color: string) => {
    setSelectedColor(color);
    
    if (!spaceDbId) return;
    
    try {
      const { error } = await supabase
        .from("spaces")
        .update({ 
          color,
          updated_at: new Date().toISOString() 
        })
        .eq("id", spaceDbId);
      
      if (error) throw error;
      
      // Also call parent callback if provided
      if (spaceId !== undefined && onUpdateSpace) {
        onUpdateSpace(spaceId, { color });
      }
      
      setColorSaved(true);
      setTimeout(() => setColorSaved(false), 1500);
    } catch (err) {
      console.error("Error saving color:", err);
    }
  };
  
  const handleSavePermissions = () => {
    // Save to localStorage for now (can be moved to Supabase later)
    if (spaceId !== undefined) {
      localStorage.setItem(`space-${spaceId}-permissions`, JSON.stringify({
        anyoneCanInvite,
        membersCanCreateTasks,
      }));
      setPermissionsSaved(true);
      setTimeout(() => setPermissionsSaved(false), 2000);
    }
  };
  
  // Load permissions from localStorage
  useEffect(() => {
    if (spaceId !== undefined) {
      const saved = localStorage.getItem(`space-${spaceId}-permissions`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAnyoneCanInvite(parsed.anyoneCanInvite ?? true);
        setMembersCanCreateTasks(parsed.membersCanCreateTasks ?? true);
      }
    }
  }, [spaceId]);
  
  const handleLeave = () => {
    if (spaceId !== undefined && onLeaveSpace) {
      onLeaveSpace(spaceId);
      setShowLeaveDialog(false);
    }
  };

  const handleDelete = () => {
    if (spaceId !== undefined && onDeleteSpace) {
      onDeleteSpace(spaceId);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = () => {
    if (spaceId !== undefined && onArchiveSpace) {
      onArchiveSpace(spaceId);
      setShowArchiveDialog(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{t.settings}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.manageSpaceFor}{" "}
            <span className="font-medium text-gray-900 dark:text-white">{name || t.spaces}</span>
          </p>
        </div>

        {/* Space Details */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-[#6B2FD9]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{t.spaceDetails}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.updateSpaceInfo}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.spaceName}
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.enterSpaceName}
                className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.description}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent"
                rows={3}
                placeholder={t.addDescriptionForSpace}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {saveError && (
              <p className="text-sm text-red-500 mb-2">{saveError}</p>
            )}
            <Button 
              className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
              onClick={handleSaveDetails}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.saving || "Saving..."}
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  {t.saved}
                </>
              ) : (
                t.saveChanges
              )}
            </Button>
          </div>
        </div>

        {/* Space Color */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t.spaceColor}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.chooseColorForSpace}</p>
              </div>
            </div>
            {colorSaved && (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> {t.saved}
              </span>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color.class}
                onClick={() => handleColorChange(color.class)}
                className={`relative w-9 h-9 rounded-full transition-all duration-300 hover:scale-110 ${
                  selectedColor === color.class
                    ? "ring-2 ring-offset-2 ring-[#6B2FD9] dark:ring-offset-zinc-900"
                    : ""
                }`}
              >
                {/* Subtle glow effect */}
                <div className={`absolute inset-0 rounded-full ${color.class} blur-sm opacity-40`} />
                {/* Main color circle */}
                <div className={`absolute inset-0.5 rounded-full ${color.class} flex items-center justify-center`}>
                  {selectedColor === color.class && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions - Only for Owner */}
        {hasPermission(currentUserRole, "canEditSpaceSettings") && (
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t.permissions}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.manageWhoCanDo}</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t.anyoneCanInvite}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.allowAnyoneToInvite}</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-[#6B2FD9] rounded accent-[#6B2FD9]" 
                  checked={anyoneCanInvite}
                  onChange={(e) => setAnyoneCanInvite(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t.membersCanCreateTasks}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.allowMembersToCreate}</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-[#6B2FD9] rounded accent-[#6B2FD9]" 
                  checked={membersCanCreateTasks}
                  onChange={(e) => setMembersCanCreateTasks(e.target.checked)}
                />
              </label>
            </div>
            
            <Button 
              className="mt-4 bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
              onClick={handleSavePermissions}
            >
              {permissionsSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  {t.saved}
                </>
              ) : (
                t.savePermissions
              )}
            </Button>
          </div>
        )}

        {/* Leave Space - Not for Owner */}
        {hasPermission(currentUserRole, "canLeaveSpace") && (
          <div className="bg-white dark:bg-card rounded-xl border border-amber-200 dark:border-amber-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                <LogOut className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-amber-900 dark:text-amber-200">{t.leaveSpace}</h2>
                <p className="text-sm text-amber-600 dark:text-amber-400">{t.removeYourselfFromSpace}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">{t.leaveThisSpace}</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">{t.loseAccessWarning}</p>
              </div>
              <Button 
                variant="outline" 
                className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
                onClick={() => setShowLeaveDialog(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.leave}
              </Button>
            </div>
          </div>
        )}

        {/* Space Actions - Only for Owner */}
        {hasPermission(currentUserRole, "canDeleteSpace") && (
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t.spaceActions}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.theseActionsIrreversible}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t.archiveThisSpace}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.archiveSpaceDescShort}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-gray-700 dark:text-gray-300"
                  onClick={() => setShowArchiveDialog(true)}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {t.archive}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">{t.deleteThisSpace}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{t.deleteSpaceDescShort}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.delete}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Owner can't leave notice */}
        {!hasPermission(currentUserRole, "canLeaveSpace") && currentUserRole === "Owner" && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t.ownerNote}:</span> {t.ownerCannotLeave}
            </p>
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{t.deleteSpace}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {t.confirmDelete} <strong>"{name}"</strong>? {t.thisActionCannotBeUndone}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t.cancel}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
              >
                {t.deleteSpace}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Archive Confirmation Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{t.archiveSpace}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {t.confirmArchive} <strong>"{name}"</strong>? {t.canUnarchiveLater}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowArchiveDialog(false)}
              >
                {t.cancel}
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleArchive}
              >
                {t.archive}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Leave Confirmation Dialog */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{t.leaveSpace}</DialogTitle>
                  <DialogDescription className="mt-2">
                    {t.confirmLeave} <strong>"{name}"</strong>? {t.youWillLoseAccess}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLeaveDialog(false)}
              >
                {t.cancel}
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleLeave}
              >
                {t.leaveSpace}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
