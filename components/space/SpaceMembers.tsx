"use client";

import { useState } from "react";
import { UserPlus, Crown, Shield, MoreVertical, Copy, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock-data";
import { type Role, hasPermission } from "@/lib/permissions";

interface SpaceMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: Role;
  isOnline: boolean;
  lastSeen?: string;
}

// Mock members with roles and online status
const mockSpaceMembers: SpaceMember[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    initials: "JD",
    role: "Owner",
    isOnline: true,
  },
  {
    id: 2,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    initials: "SC",
    role: "Lead",
    isOnline: true,
  },
  {
    id: 3,
    name: "Alex Turner",
    email: "alex.turner@company.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    initials: "AT",
    role: "Lead",
    isOnline: false,
    lastSeen: "10 min ago",
  },
  {
    id: 4,
    name: "Lisa Wang",
    email: "lisa.wang@company.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    initials: "LW",
    role: "Teammate",
    isOnline: false,
    lastSeen: "2 hours ago",
  },
  {
    id: 5,
    name: "Mike Johnson",
    email: "mike.j@company.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    initials: "MJ",
    role: "Teammate",
    isOnline: true,
  },
  {
    id: 6,
    name: "Emma Davis",
    email: "emma.davis@company.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    initials: "ED",
    role: "Teammate",
    isOnline: false,
    lastSeen: "1 day ago",
  },
];

interface SpaceMembersProps {
  spaceName?: string;
}

export function SpaceMembers({ spaceName }: SpaceMembersProps) {
  const [members, setMembers] = useState<SpaceMember[]>(mockSpaceMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Get current user's role (for permission checks)
  const currentMember = members.find(m => m.name === currentUser.name);
  const currentRole = currentMember?.role || "Teammate";

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      console.log("Inviting:", inviteEmail);
      setInviteEmail("");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://teamly.app/invite/abc123`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleRemoveMember = (memberId: number) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "Owner":
        return <Crown className="w-3 h-3" />;
      case "Lead":
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case "Owner":
        return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
      case "Lead":
        return "bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]";
      default:
        return "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Members</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage members who have access to{" "}
            <span className="font-medium text-gray-900 dark:text-white">{spaceName || "this space"}</span>
          </p>
        </div>

        {/* Invite Section - Only for Owner and Lead */}
        {hasPermission(currentRole, "canInviteMembers") && (
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-[#6B2FD9]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Invite Members</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add new members to this space</p>
              </div>
            </div>
            
            <div className="flex gap-3 mb-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleInvite();
                  }
                }}
                className="flex-1 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500"
              />
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
                className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
              >
                Send Invite
              </Button>
            </div>

            {/* Share Invite Link */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <Input
                readOnly
                value="https://teamly.app/invite/abc123"
                className="flex-1 text-sm bg-transparent border-0 dark:text-gray-300"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Space Members ({members.length})
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              People who can access and collaborate in this space
            </p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/30 text-[#6B2FD9]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-950 ${
                        member.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${getRoleBadgeStyle(member.role)}`}>
                        {getRoleIcon(member.role)}
                        <span className="text-xs font-medium">{member.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.isOnline ? (
                          <span className="text-green-600 dark:text-green-400">Online</span>
                        ) : (
                          `Seen ${member.lastSeen}`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions - Only for Owner */}
                {hasPermission(currentRole, "canRemoveMembers") && member.role !== "Owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {hasPermission(currentRole, "canChangeRoles") && (
                        <>
                          <DropdownMenuItem>Make Lead</DropdownMenuItem>
                          <DropdownMenuItem>Make Teammate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove from Space
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <span className="font-medium">Roles:</span> Owner has full control. Lead can manage tasks and invite members. Teammate can view and update task status.
          </p>
        </div>
      </div>
    </div>
  );
}
