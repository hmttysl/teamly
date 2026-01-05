"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Palette, Users, Trash2, LogOut, Archive, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { currentUser } from "@/lib/mock-data";
import { type Role, hasPermission } from "@/lib/permissions";

interface SpaceSettingsProps {
  spaceName?: string;
  spaceId?: number;
  spaceColor?: string;
  onLeaveSpace?: (spaceId: number) => void;
  onDeleteSpace?: (spaceId: number) => void;
  onArchiveSpace?: (spaceId: number) => void;
  onUpdateSpace?: (spaceId: number, updates: { name?: string; description?: string; color?: string }) => void;
}

// Current user's role in this space (mock - in real app would come from API)
const currentUserRole: Role = "Owner";

const colorOptions = [
  { name: "Purple", class: "bg-purple-500" },
  { name: "Red", class: "bg-red-500" },
  { name: "Pink", class: "bg-pink-500" },
  { name: "Blue", class: "bg-blue-500" },
  { name: "Green", class: "bg-green-500" },
  { name: "Yellow", class: "bg-yellow-500" },
  { name: "Orange", class: "bg-orange-500" },
  { name: "Cyan", class: "bg-cyan-500" },
];

export function SpaceSettings({ 
  spaceName = "", 
  spaceId,
  spaceColor = "bg-purple-500",
  onLeaveSpace,
  onDeleteSpace,
  onArchiveSpace,
  onUpdateSpace,
}: SpaceSettingsProps) {
  const [name, setName] = useState(spaceName);
  const [description, setDescription] = useState("Collaborate on tasks and projects");
  const [selectedColor, setSelectedColor] = useState(spaceColor);
  const [saved, setSaved] = useState(false);
  const [anyoneCanInvite, setAnyoneCanInvite] = useState(true);
  const [membersCanCreateTasks, setMembersCanCreateTasks] = useState(true);
  
  const handleSaveDetails = () => {
    if (spaceId && onUpdateSpace) {
      onUpdateSpace(spaceId, { name, description });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (spaceId && onUpdateSpace) {
      onUpdateSpace(spaceId, { color });
    }
  };
  
  const handleLeave = () => {
    if (spaceId && onLeaveSpace) {
      onLeaveSpace(spaceId);
    }
  };

  const handleDelete = () => {
    if (spaceId && onDeleteSpace) {
      onDeleteSpace(spaceId);
    }
  };

  const handleArchive = () => {
    if (spaceId && onArchiveSpace) {
      onArchiveSpace(spaceId);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage settings for{" "}
            <span className="font-medium text-gray-900 dark:text-white">{name || "this space"}</span>
          </p>
        </div>

        {/* Space Details */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-[#6B2FD9]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Space Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update space name and description</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Space Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter space name"
                className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent"
                rows={3}
                placeholder="Add a description for this space"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <Button 
              className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
              onClick={handleSaveDetails}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Space Color */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Space Color</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a color to identify this space</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color.class}
                onClick={() => handleColorChange(color.class)}
                className={`w-10 h-10 rounded-lg ${color.class} hover:scale-110 transition-transform border-2 ${
                  selectedColor === color.class 
                    ? "border-white ring-2 ring-offset-2 ring-[#6B2FD9] dark:ring-offset-zinc-950" 
                    : "border-white/50 dark:border-zinc-800"
                } shadow-md relative`}
              >
                {selectedColor === color.class && (
                  <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                )}
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
                <h2 className="font-semibold text-gray-900 dark:text-white">Permissions</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control who can do what in this space</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Anyone can invite members</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All members can invite others to this space</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#6B2FD9] rounded accent-[#6B2FD9]" 
                  checked={anyoneCanInvite}
                  onChange={(e) => setAnyoneCanInvite(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Members can create tasks</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow all members to create new tasks</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#6B2FD9] rounded accent-[#6B2FD9]" 
                  checked={membersCanCreateTasks}
                  onChange={(e) => setMembersCanCreateTasks(e.target.checked)}
                />
              </label>
            </div>
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
                <h2 className="font-semibold text-amber-900 dark:text-amber-200">Leave Space</h2>
                <p className="text-sm text-amber-600 dark:text-amber-400">Remove yourself from this space</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">Leave this space</p>
                <p className="text-sm text-amber-700 dark:text-amber-400">You will lose access to all tasks and conversations in this space</p>
              </div>
              <ConfirmDialog
                title="Leave Space"
                description={`Are you sure you want to leave "${name}"? You will lose access to all tasks and conversations. You can rejoin if someone invites you again.`}
                confirmButtonText="Leave Space"
                variant="warning"
                onConfirm={handleLeave}
              >
                <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white">
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </ConfirmDialog>
            </div>
          </div>
        )}

        {/* Danger Zone - Only for Owner */}
        {hasPermission(currentUserRole, "canDeleteSpace") && (
          <div className="bg-white dark:bg-card rounded-xl border border-red-200 dark:border-red-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="font-semibold text-red-900 dark:text-red-200">Danger Zone</h2>
                <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions for this space</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-zinc-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Archive this space</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hide this space from the sidebar. You can unarchive later.</p>
                </div>
                <ConfirmDialog
                  title="Archive Space"
                  description={`Are you sure you want to archive "${name}"? The space will be hidden from the sidebar but can be restored later.`}
                  confirmButtonText="Archive"
                  variant="warning"
                  onConfirm={handleArchive}
                >
                  <Button variant="outline" className="text-gray-700 dark:text-gray-300">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </ConfirmDialog>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">Delete this space</p>
                  <p className="text-sm text-red-600 dark:text-red-400">Permanently delete this space and all its tasks. This action cannot be undone.</p>
                </div>
                <ConfirmDialog
                  title="Delete Space"
                  description={`This will permanently delete "${name}" and all its tasks, comments, and files. This action cannot be undone.`}
                  confirmText={name}
                  confirmButtonText="Delete Space"
                  variant="danger"
                  requireConfirmText={true}
                  onConfirm={handleDelete}
                >
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </ConfirmDialog>
              </div>
            </div>
          </div>
        )}

        {/* Owner can't leave notice */}
        {!hasPermission(currentUserRole, "canLeaveSpace") && currentUserRole === "Owner" && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <span className="font-medium">Note:</span> As the Owner, you cannot leave this space. Transfer ownership to another member first, or delete the space.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
