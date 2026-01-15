"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, XCircle, Loader2, LogIn } from "lucide-react";

interface InviteData {
  id: string;
  space_id: string;
  invite_code: string;
  status: string;
  space: {
    id: string;
    name: string;
    color: string;
    description: string | null;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const code = params.code as string;

  useEffect(() => {
    async function fetchInvite() {
      if (!code) {
        setError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        // Fetch invite with space and inviter info
        const { data, error: fetchError } = await supabase
          .from("space_invites")
          .select(`
            id,
            space_id,
            invite_code,
            status,
            spaces:space_id (
              id,
              name,
              color,
              description
            ),
            profiles:invited_by (
              name,
              email
            )
          `)
          .eq("invite_code", code)
          .single();

        if (fetchError || !data) {
          setError("Invite not found or has expired");
          setLoading(false);
          return;
        }

        if (data.status !== "pending") {
          setError("This invite has already been used");
          setLoading(false);
          return;
        }

        setInvite({
          id: data.id,
          space_id: data.space_id,
          invite_code: data.invite_code,
          status: data.status,
          space: data.spaces as any,
          inviter: data.profiles as any,
        });
      } catch (err) {
        setError("Failed to load invite");
      } finally {
        setLoading(false);
      }
    }

    fetchInvite();
  }, [code]);

  const handleAcceptInvite = async () => {
    if (!user || !invite) return;

    setAccepting(true);
    try {
      // Update invite status
      await supabase
        .from("space_invites")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      // Add user to space members
      await supabase
        .from("space_members")
        .insert({
          space_id: invite.space_id,
          user_id: user.id,
          role: "Teammate",
        });

      setAccepted(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError("Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!invite) return;

    try {
      await supabase
        .from("space_invites")
        .update({ status: "declined" })
        .eq("id", invite.id);

      router.push("/");
    } catch (err) {
      setError("Failed to decline invite");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B2FD9] via-[#5a27b8] to-[#4a1f98] flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 text-[#6B2FD9] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading invite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B2FD9] via-[#5a27b8] to-[#4a1f98] flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid Invite
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#6B2FD9] hover:bg-[#5a27b8]"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (accepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B2FD9] via-[#5a27b8] to-[#4a1f98] flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to {invite?.space.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have successfully joined the space. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6B2FD9] via-[#5a27b8] to-[#4a1f98] flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div 
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: invite?.space.color || "#6B2FD9" }}
          >
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You&apos;re invited to join
          </h1>
          <h2 className="text-3xl font-bold text-[#6B2FD9] mb-4">
            {invite?.space.name}
          </h2>
          {invite?.space.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {invite.space.description}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
            Invited by {invite?.inviter?.name || invite?.inviter?.email}
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Please sign in or create an account to accept this invitation.
            </p>
          </div>
          
          <Button
            onClick={() => router.push("/")}
            className="w-full bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Logged in - show accept/decline
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6B2FD9] via-[#5a27b8] to-[#4a1f98] flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div 
          className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: invite?.space.color || "#6B2FD9" }}
        >
          <Users className="w-10 h-10 text-white" />
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          Hey {profile?.name || user.email?.split("@")[0]}!
        </p>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          You&apos;re invited to join
        </h1>
        <h2 className="text-3xl font-bold text-[#6B2FD9] mb-4">
          {invite?.space.name}
        </h2>
        
        {invite?.space.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {invite.space.description}
          </p>
        )}
        
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
          Invited by {invite?.inviter?.name || invite?.inviter?.email}
        </p>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDeclineInvite}
            className="flex-1 border-gray-300 dark:border-zinc-700"
          >
            Decline
          </Button>
          <Button
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="flex-1 bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
          >
            {accepting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Accept & Join
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
