"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Crown, Shield, MoreVertical, Copy, Check, User, Loader2, AlertCircle } from "lucide-react";
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
import { type Role, hasPermission } from "@/lib/permissions";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { supabase } from "@/lib/supabase";

interface SpaceMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: Role;
  isOnline: boolean;
  joinedAt: string;
}

interface PendingInvite {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface SpaceMembersProps {
  spaceName?: string;
  spaceId?: string; // Supabase UUID
}

export function SpaceMembers({ spaceName, spaceId }: SpaceMembersProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Current user's role in this space
  const [currentRole, setCurrentRole] = useState<Role>("Teammate");

  // Fetch members from Supabase
  const fetchMembers = useCallback(async () => {
    if (!spaceId) return;
    
    setLoading(true);
    try {
      // Get space members with their profile info
      const { data: membersData, error: membersError } = await supabase
        .from("space_members")
        .select(`
          id,
          role,
          joined_at,
          user_id,
          profiles:user_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq("space_id", spaceId);

      if (membersError) throw membersError;

      if (membersData) {
        const formattedMembers: SpaceMember[] = membersData.map((m: any) => {
          const profileData = m.profiles;
          const name = profileData?.name || profileData?.email?.split('@')[0] || "User";
          return {
            id: m.id,
            name,
            email: profileData?.email || "",
            avatar: profileData?.avatar_url || "",
            initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
            role: m.role as Role,
            isOnline: m.user_id === user?.id, // Only current user is "online"
            joinedAt: m.joined_at,
          };
        });
        setMembers(formattedMembers);

        // Set current user's role
        const currentMember = membersData.find((m: any) => m.user_id === user?.id);
        if (currentMember) {
          setCurrentRole(currentMember.role as Role);
        }
      }

      // Get pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from("space_invites")
        .select(`
          id,
          invite_code,
          status,
          created_at,
          invited_user_id,
          profiles:invited_user_id (
            email
          )
        `)
        .eq("space_id", spaceId)
        .eq("status", "pending");

      if (!invitesError && invitesData) {
        const formattedInvites: PendingInvite[] = invitesData.map((inv: any) => ({
          id: inv.id,
          email: inv.profiles?.email || "Unknown",
          status: inv.status,
          createdAt: inv.created_at,
        }));
        setPendingInvites(formattedInvites);
      }

      // Generate or get invite link
      await generateInviteLink();

    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [spaceId, user?.id]);

  // Generate invite link for this space
  const generateInviteLink = async () => {
    if (!spaceId || !user) return;

    // Check if there's an existing general invite link
    const { data: existingInvite } = await supabase
      .from("space_invites")
      .select("invite_code")
      .eq("space_id", spaceId)
      .eq("invited_by", user.id)
      .is("invited_user_id", null)
      .eq("status", "pending")
      .single();

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
          invited_user_id: null, // General link, not for specific user
        });

      if (!error) {
        setInviteLink(`${window.location.origin}/invite/${inviteCode}`);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle invite by email
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !spaceId || !user) return;
    
    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      // Find user by email
      const { data: invitedUser, error: userError } = await supabase
        .from("profiles")
        .select("id, email, name")
        .eq("email", inviteEmail.trim().toLowerCase())
        .single();

      if (userError || !invitedUser) {
        setError("No user found with this email. They need to sign up first.");
        setInviting(false);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("space_members")
        .select("id")
        .eq("space_id", spaceId)
        .eq("user_id", invitedUser.id)
        .single();

      if (existingMember) {
        setError("This user is already a member of this space.");
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
        .single();

      if (existingInvite) {
        setError("This user already has a pending invite.");
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
      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: invitedUser.id,
          type: "space_invite",
          title: `Invitation to join "${spaceName}"`,
          message: `${profile?.name || user.email} invited you to join their space.`,
          data: {
            space_id: spaceId,
            space_name: spaceName,
            invite_code: inviteCode,
            invited_by_name: profile?.name || user.email,
          },
        });

      if (notifError) console.error("Error creating notification:", notifError);

      setSuccess(`Invite sent to ${invitedUser.name || invitedUser.email}!`);
      setInviteEmail("");
      fetchMembers(); // Refresh

    } catch (err: any) {
      console.error("Error sending invite:", err);
      setError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("space_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      fetchMembers();
    } catch (err: any) {
      console.error("Error removing member:", err);
      setError(err.message);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: Role) => {
    try {
      const { error } = await supabase
        .from("space_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
      fetchMembers();
    } catch (err: any) {
      console.error("Error changing role:", err);
      setError(err.message);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B2FD9]" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-background overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{t.members}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.manageMembersFor}{" "}
            <span className="font-medium text-gray-900 dark:text-white">{spaceName || t.spaces}</span>
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Invite Section - Only for Owner and Lead */}
        {hasPermission(currentRole, "canInviteMembers") && (
          <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 rounded-lg">
                <UserPlus className="w-5 h-5 text-[#6B2FD9]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{t.inviteMembersTitle}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.addNewMembersToSpace}</p>
              </div>
            </div>
            
            <div className="flex gap-3 mb-4">
              <Input
                type="email"
                placeholder={t.enterEmailAddress}
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
                disabled={!inviteEmail.trim() || inviting}
                className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.sendInvite}
              </Button>
            </div>

            {/* Share Invite Link */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-900 rounded-lg">
              <Input
                readOnly
                value={inviteLink || "Generating link..."}
                className="flex-1 text-sm bg-transparent border-0 dark:text-gray-300"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                disabled={!inviteLink}
                className="gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t.copyLink}
                  </>
                )}
              </Button>
            </div>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.pendingInvites} ({pendingInvites.length})
                </h3>
                <div className="space-y-2">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between text-sm p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <span className="text-amber-800 dark:text-amber-200">{invite.email}</span>
                      <span className="text-amber-600 dark:text-amber-400 text-xs">
                        {formatDate(invite.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {t.spaceMembersCount} ({members.length})
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.peopleWhoCanAccess}
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
                          <span className="text-green-600 dark:text-green-400">{t.online}</span>
                        ) : (
                          `Joined ${formatDate(member.joinedAt)}`
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
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "Lead")}>
                            {t.makeLead}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(member.id, "Teammate")}>
                            {t.makeTeammate}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        {t.removeFromSpace}
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
            {t.rolesInfo}
          </p>
        </div>
      </div>
    </div>
  );
}
