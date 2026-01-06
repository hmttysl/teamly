"use client";

import { useState, useRef } from "react";
import { Camera, User, Bell, Globe, Shield, LogOut, Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { currentUser } from "@/lib/mock-data";

export function ProfileSettings() {
  // Profile state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [profileSaved, setProfileSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  // Notifications state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);

  // Preferences state
  const [timezone, setTimezone] = useState("(GMT-05:00) Eastern Time");
  const [weekStartsOn, setWeekStartsOn] = useState<"monday" | "sunday">("monday");
  const [language, setLanguage] = useState("English");
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSavePreferences = () => {
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 2000);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleLogoutAll = () => {
    alert("Logged out from all sessions");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your personal account settings and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-zinc-800">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#6B2FD9]" />
              Profile
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-[#6B2FD9] text-white text-xl">{currentUser.initials}</AvatarFallback>
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-[#6B2FD9] hover:bg-[#5a27b8] text-white rounded-full p-2 shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Profile Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Upload a new photo or update your current one</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => avatarInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload New Photo
                </Button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white" 
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
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
                    Saved!
                  </>
                ) : (
                  "Save Changes"
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
              Notifications
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Email Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">In-App Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications within the app</p>
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Task Reminders</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get reminded about upcoming tasks</p>
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
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">Mention Alerts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone mentions you</p>
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
              Preferences
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent"
              >
                <option>English</option>
                <option>Türkçe</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
              <select 
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B2FD9] focus:border-transparent"
              >
                <option>(GMT-05:00) Eastern Time</option>
                <option>(GMT-06:00) Central Time</option>
                <option>(GMT-07:00) Mountain Time</option>
                <option>(GMT-08:00) Pacific Time</option>
                <option>(GMT+00:00) UTC</option>
                <option>(GMT+01:00) Central European Time</option>
                <option>(GMT+03:00) Turkey Time</option>
              </select>
            </div>

            {/* Week Starts On */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Week Starts On</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setWeekStartsOn("monday")}
                  className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all ${
                    weekStartsOn === "monday"
                      ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]"
                      : "border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  Monday
                </button>
                <button
                  onClick={() => setWeekStartsOn("sunday")}
                  className={`flex-1 py-2.5 px-4 rounded-lg border-2 transition-all ${
                    weekStartsOn === "sunday"
                      ? "border-[#6B2FD9] bg-[#6B2FD9]/10 dark:bg-[#6B2FD9]/20 text-[#6B2FD9]"
                      : "border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                onClick={handleSavePreferences}
              >
                {preferencesSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  "Save Preferences"
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
              Security
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Change Password */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <Input 
                    type="password" 
                    placeholder="Enter current password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <Input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <Input 
                    type="password" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:placeholder:text-gray-500" 
                  />
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
              <div className="flex justify-end pt-4">
                <Button 
                  className="bg-[#6B2FD9] hover:bg-[#5a27b8] gap-2"
                  onClick={handleUpdatePassword}
                >
                  {passwordSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Updated!
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Active Sessions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Log out from all devices and sessions</p>
              <Button 
                variant="outline" 
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={handleLogoutAll}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out from All Sessions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
