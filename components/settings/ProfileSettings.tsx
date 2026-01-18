"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, User, Bell, Globe, Shield, LogOut, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

// Common timezones
const TIMEZONES = [
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) São Paulo" },
  { value: "Atlantic/Azores", label: "(GMT-01:00) Azores" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris, Berlin" },
  { value: "Europe/Athens", label: "(GMT+02:00) Athens, Helsinki" },
  { value: "Europe/Istanbul", label: "(GMT+03:00) Istanbul" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Karachi" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) Mumbai, New Delhi" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
  { value: "Asia/Shanghai", label: "(GMT+08:00) Beijing, Shanghai" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
  { value: "Australia/Sydney", label: "(GMT+11:00) Sydney" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland" },
];

// Get user's system timezone
const getSystemTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
};

export function ProfileSettings() {
  const { t } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  
  // Profile state
  const [name, setName] = useState(profile?.name || user?.email?.split('@')[0] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);

  // Preferences state - detect user's timezone
  const [timezone, setTimezone] = useState(getSystemTimezone());
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Update name/email/avatar when profile loads
  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (user?.email) setEmail(user.email);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }, [profile, user]);

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t.pleaseSelectImage || 'Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t.imageTooLarge || 'Image must be less than 2MB');
      return;
    }

    setAvatarUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setAvatarUrl(publicUrl);
      
      // Refresh profile in auth context
      if (refreshProfile) {
        await refreshProfile();
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || t.failedToUploadImage || 'Failed to upload image');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    // Save timezone to localStorage for now
    localStorage.setItem('userTimezone', timezone);
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 2000);
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!newPassword) {
      setPasswordError(t.newPasswordRequired || "New password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(t.passwordMinLength || "Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setPasswordSuccess(t.passwordUpdated || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t.profileSettingsTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t.manageYourProfile}</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#6B2FD9]" />
              {t.profile}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-[#6B2FD9] text-white text-xl">{(name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute bottom-0 right-0 bg-[#6B2FD9] hover:bg-[#5a27b8] text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t.profilePhoto}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t.uploadNewPhoto}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {t.uploadNewPhotoBtn}
                </Button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.fullName}</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white" 
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.email}</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white" 
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                onClick={handleSaveProfile}
              >
                {profileSaved ? (
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
        </div>

        {/* Notifications Section */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#6B2FD9]" />
              {t.notificationsSection}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t.emailNotifications}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.receiveEmailNotifications}</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? "bg-[#6B2FD9]" : "bg-gray-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* In-App Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t.inAppNotifications}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.showInAppNotifications}</p>
              </div>
              <button
                onClick={() => setInAppNotifications(!inAppNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  inAppNotifications ? "bg-[#6B2FD9]" : "bg-gray-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    inAppNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Task Reminders */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t.taskReminders}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.getRemindersForTasks}</p>
              </div>
              <button
                onClick={() => setTaskReminders(!taskReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  taskReminders ? "bg-[#6B2FD9]" : "bg-gray-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    taskReminders ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Mention Alerts */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t.mentionAlerts}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.getNotifiedWhenMentioned}</p>
              </div>
              <button
                onClick={() => setMentionAlerts(!mentionAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  mentionAlerts ? "bg-[#6B2FD9]" : "bg-gray-200 dark:bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mentionAlerts ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#6B2FD9]" />
              {t.preferences}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.timezone}</label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t.detectedTimezone || "Detected"}: {getSystemTimezone()}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                onClick={handleSavePreferences}
              >
                {preferencesSaved ? (
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
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#6B2FD9]" />
              {t.security}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">{t.updatePassword}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.newPassword}</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500" 
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.passwordMinLengthHint || "Minimum 6 characters"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.confirmNewPassword}</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500" 
                  />
                </div>
              </div>
              
              {passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  {passwordSuccess}
                </div>
              )}
              
              <div className="flex justify-end pt-4">
                <Button 
                  className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                  onClick={handleUpdatePassword}
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t.updatePassword
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t.activeSessions}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.logOutFromAllSessions}</p>
              <Button 
                variant="outline" 
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={handleLogoutAll}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t.logOutAll}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
