"use client";

import { useState, useEffect } from "react";
import { Mail, Copy, Check, Loader2, AlertCircle } from "lucide-react";
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
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: string;
}

interface InviteMembersDialogProps {
  children: React.ReactNode;
  spaceId?: string;
  spaceName?: string;
}

export function InviteMembersDialog({ children, spaceId, spaceName }: InviteMembersDialogProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch members and generate invite link when dialog opens
  useEffect(() => {
    if (isOpen && spaceId) {
      fetchMembers();
      generateInviteLink();
    }
  }, [isOpen, spaceId]);

  const fetchMembers = async () => {
    if (!spaceId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("space_members")
        .select(`
          id,
          role,
          user_id,
          profiles:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq("space_id", spaceId);

      if (error) throw error;

      if (data) {
        const formattedMembers: TeamMember[] = data
          .filter((m: any) => m.profiles)
          .map((m: any) => {
            const name = m.profiles.name || m.profiles.email?.split('@')[0] || "User";
            return {
              id: m.id,
              name,
              email: m.profiles.email || "",
              avatar: m.profiles.avatar_url || "",
              initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
              role: m.role,
            };
          });
        setMembers(formattedMembers);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async () => {
    if (!spaceId || !user) return;

    try {
      // Check for existing invite link
      const { data: existingInvite } = await supabase
        .from("space_invites")
        .select("invite_code")
        .eq("space_id", spaceId)
        .eq("invited_by", user.id)
        .is("invited_user_id", null)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        setInviteLink(`${window.location.origin}/invite/${existingInvite.invite_code}`);
      } else {
        // Create new invite link
        const inviteCode = crypto.randomUUID().slice(0, 8);
        const { error } = await supabase
          .from("space_invites")
          .insert({
            space_id: spaceId,
            invited_by: user.id,
            invite_code: inviteCode,
            invited_user_id: null,
          });

        if (!error) {
          setInviteLink(`${window.location.origin}/invite/${inviteCode}`);
        }
      }
    } catch (err) {
      console.error("Error generating invite link:", err);
    }
  };

  const handleSendInvite = async () => {
    if (!emailInput.trim() || !spaceId || !user) return;

    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      // Find user by email
      const { data: invitedUser, error: userError } = await supabase
        .from("profiles")
        .select("id, email, name")
        .eq("email", emailInput.trim().toLowerCase())
        .maybeSingle();

      if (userError) throw userError;

      if (!invitedUser) {
        setError(t.userNotFoundSignUpFirst || "User not found. They need to sign up first.");
        setInviting(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("space_members")
        .select("id")
        .eq("space_id", spaceId)
        .eq("user_id", invitedUser.id)
        .maybeSingle();

      if (existingMember) {
        setError(t.userAlreadyMember || "This user is already a member of this space.");
        setInviting(false);
        return;
      }

      // Check if already invited
      const { data: existingInvite } = await supabase
        .from("space_invites")
        .select("id")
        .eq("space_id", spaceId)
        .eq("invited_user_id", invitedUser.id)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvite) {
        setError(t.userAlreadyInvited || "This user already has a pending invite.");
        setInviting(false);
        return;
      }

      // Create invite
      const inviteCode = crypto.randomUUID().slice(0, 8);
      const { error: inviteError } = await supabase
        .from("space_invites")
        .insert({
          space_id: spaceId,
          invited_by: user.id,
          invited_user_id: invitedUser.id,
          invite_code: inviteCode,
        });

      if (inviteError) throw inviteError;

      // Create notification for invited user
      await supabase
        .from("notifications")
        .insert({
          user_id: invitedUser.id,
          type: "space_invite",
          title: `${t.invitationToJoin || "Invitation to join"} "${spaceName || "Space"}"`,
          message: `${profile?.name || user.email} ${t.invitedYouToJoin || "invited you to join their space"}.`,
          data: {
            space_id: spaceId,
            space_name: spaceName,
            invite_code: inviteCode,
            invited_by_name: profile?.name || user.email,
          },
        });

      setSuccess(`${t.inviteSentTo || "Invite sent to"} ${invitedUser.name || invitedUser.email}!`);
      setEmailInput("");
      fetchMembers();

    } catch (err: any) {
      console.error("Error sending invite:", err);
      setError(err.message || "Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.inviteMembers || "Invite Team Members"}</DialogTitle>
          <DialogDescription>
            {t.inviteMembersDesc || "Add new members to your workspace via email or share the invite link"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.emailAddress || "Email address"}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t.emailPlaceholder || "Enter email address..."}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  className="pl-10 dark:bg-zinc-900 dark:border-zinc-700"
                />
              </div>
              <Button 
                className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
                onClick={handleSendInvite}
                disabled={!emailInput.trim() || inviting}
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : (t.sendInvite || "Send Invite")}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-zinc-950 px-2 text-gray-500">{t.or || "OR"}</span>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t.shareInviteLink || "Share invite link"}
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteLink || (t.generatingLink || "Generating link...")}
                readOnly
                className="bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 dark:border-zinc-700"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                disabled={!inviteLink}
                className="min-w-[100px]"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-600" />
                    {t.copied || "Copied"}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    {t.copy || "Copy"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.teamMembers || "Team Members"} ({members.length})
              </h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-[#6B2FD9]" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t.noMembersYet || "No members yet"}
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {members.map((member) => (
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
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 rounded-full">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
