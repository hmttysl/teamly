"use client";

import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/lib/auth-context";

interface ProfileMenuProps {
  onProfileSettingsClick: () => void;
}

export function ProfileMenu({ onProfileSettingsClick }: ProfileMenuProps) {
  const { profile, user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Get user display info from auth context
  const displayUser = {
    name: profile?.name || user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    avatar: profile?.avatar_url || "",
    initials: (profile?.name || user?.email?.split('@')[0] || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
  };

  const handleProfileSettingsClick = () => {
    onProfileSettingsClick();
    setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="rounded-full">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src={displayUser.avatar} />
            <AvatarFallback className="bg-[#6B2FD9] text-white">{displayUser.initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end" sideOffset={8}>
        {/* User Info */}
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayUser.avatar} />
              <AvatarFallback className="bg-[#6B2FD9] text-white">{displayUser.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{displayUser.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{displayUser.email}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <button
            onClick={handleProfileSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            Profile Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
