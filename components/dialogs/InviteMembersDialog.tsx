"use client";

import { useState } from "react";
import { Mail, Copy, Check, Send, X, UserPlus } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialTeamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    initials: "SJ",
    role: "Admin",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike.c@company.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    initials: "MC",
    role: "Member",
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.d@company.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    initials: "ED",
    role: "Member",
  },
];

interface InviteMembersDialogProps {
  children: React.ReactNode;
}

export function InviteMembersDialog({ children }: InviteMembersDialogProps) {
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);
  const inviteLink = "https://app.teamly.com/invite/abc123xyz";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = () => {
    if (!emailInput.trim()) return;
    
    // Parse emails (comma separated)
    const emails = emailInput.split(",").map(e => e.trim()).filter(e => e.includes("@"));
    
    if (emails.length === 0) return;

    // Add to pending invites
    setPendingInvites(prev => [...prev, ...emails]);
    setEmailInput("");
    setInviteSent(true);
    setTimeout(() => setInviteSent(false), 2000);
  };

  const handleRemovePendingInvite = (email: string) => {
    setPendingInvites(prev => prev.filter(e => e !== email));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Add new members to your workspace via email or share the invite link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email addresses
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter email addresses..."
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  className="pl-10 dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <Button 
                className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                onClick={handleSendInvite}
                disabled={!emailInput.trim()}
              >
                {inviteSent ? (
                  <>
                    <Check className="w-4 h-4" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Separate multiple emails with commas
            </p>
          </div>

          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Pending Invites ({pendingInvites.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {pendingInvites.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9] rounded-full text-sm"
                  >
                    <UserPlus className="w-3 h-3" />
                    {email}
                    <button
                      onClick={() => handleRemovePendingInvite(email)}
                      className="hover:bg-[#6B2FD9]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500 dark:text-gray-400">OR</span>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share invite link
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 dark:border-zinc-700"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="min-w-[100px] dark:border-zinc-700"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Members ({teamMembers.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-[#6B2FD9]/10 text-[#6B2FD9]">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



