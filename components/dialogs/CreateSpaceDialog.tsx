"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const spaceColors = [
  { name: "Purple", class: "bg-[#6B2FD9]" },
  { name: "Red", class: "bg-red-500" },
  { name: "Pink", class: "bg-pink-500" },
  { name: "Blue", class: "bg-blue-500" },
  { name: "Green", class: "bg-green-500" },
  { name: "Yellow", class: "bg-yellow-500" },
  { name: "Orange", class: "bg-orange-500" },
  { name: "Cyan", class: "bg-cyan-500" },
];

interface CreateSpaceDialogProps {
  children: React.ReactNode;
  onCreateSpace?: (name: string, color: string) => void;
}

export function CreateSpaceDialog({ children, onCreateSpace }: CreateSpaceDialogProps) {
  const [spaceName, setSpaceName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-[#6B2FD9]");
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    if (spaceName.trim()) {
      onCreateSpace?.(spaceName.trim(), selectedColor);
      setSpaceName("");
      setSelectedColor("bg-[#6B2FD9]");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
              <FolderPlus className="w-5 h-5 text-[#6B2FD9]" />
            </div>
            <div>
              <DialogTitle>Create New Space</DialogTitle>
              <DialogDescription>
                Add a new space to organize your tasks
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Space Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Space Name
            </label>
            <Input
              placeholder="Enter space name..."
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate();
                }
              }}
              className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Space Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {spaceColors.map((color) => (
                <button
                  key={color.class}
                  onClick={() => setSelectedColor(color.class)}
                  className={`w-8 h-8 rounded-lg ${color.class} transition-all hover:scale-110 ${
                    selectedColor === color.class
                      ? "ring-2 ring-offset-2 ring-[#6B2FD9] dark:ring-offset-black"
                      : ""
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preview
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
              <div className={`w-3 h-3 rounded-full ${selectedColor}`}></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {spaceName || "Space name"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#6B2FD9] hover:bg-[#5a27b8]"
              onClick={handleCreate}
              disabled={!spaceName.trim()}
            >
              Create Space
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

