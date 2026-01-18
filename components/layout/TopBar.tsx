"use client";

import { useState } from "react";
import { Search, Bell, UserPlus, Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "@/components/notifications/NotificationPopover";
import { InviteMembersDialog } from "@/components/dialogs/InviteMembersDialog";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/lib/language-context";
import { Language as LangType } from "@/lib/translations";

interface LanguageOption {
  code: LangType;
  name: string;
  flag: string;
}

// Flag images (place in public/flags/)
const languages: LanguageOption[] = [
  { code: "en", name: "English", flag: "/flags/flag-gb.png" },
  { code: "es", name: "Español", flag: "/flags/flag-es.png" },
  { code: "pt", name: "Português", flag: "/flags/flag-pt.png" },
  { code: "de", name: "Deutsch", flag: "/flags/flag-de.png" },
  { code: "ja", name: "日本語", flag: "/flags/flag-jp.png" },
  { code: "ko", name: "한국어", flag: "/flags/flag-kr.png" },
];

interface TopBarProps {
  activeView: "dashboard" | "space" | "inbox" | "calendar" | "settings" | "echo";
  onProfileSettingsClick: () => void;
}

export function TopBar({ activeView, onProfileSettingsClick }: TopBarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const selectedLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="h-16 bg-white dark:bg-background border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder={t.search}
            className="pl-10 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <Popover open={langMenuOpen} onOpenChange={setLangMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full 
                         bg-gray-100/80 dark:bg-white/[0.08] 
                         border border-gray-200/50 dark:border-white/[0.08]
                         hover:bg-gray-200/80 dark:hover:bg-white/[0.12]
                         hover:border-gray-300/50 dark:hover:border-white/[0.15]
                         transition-all duration-200 cursor-pointer
                         shadow-sm hover:shadow"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10 shadow-inner">
                <img 
                  src={selectedLang.flag} 
                  alt={selectedLang.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end" sideOffset={8}>
            <div className="space-y-1">
              <p className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {t.language}
              </p>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                    language === lang.code
                      ? "bg-[#6B2FD9]/10 text-[#6B2FD9] dark:bg-[#6B2FD9]/20"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <img src={lang.flag} alt={lang.name} className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left font-medium">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-[#6B2FD9]" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />
        
        <NotificationPopover>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#6B2FD9] rounded-full"></span>
          </Button>
        </NotificationPopover>

        {/* Only show Invite button when viewing a space */}
        {activeView === "space" && (
          <InviteMembersDialog>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#6B2FD9]/30 text-[#6B2FD9] hover:bg-[#6B2FD9]/10 hover:text-[#6B2FD9]"
            >
              <div className="relative">
                <UserPlus className="w-4 h-4" />
              </div>
              Invite
            </Button>
          </InviteMembersDialog>
        )}
        
        <ProfileMenu onProfileSettingsClick={onProfileSettingsClick} />
      </div>
    </div>
  );
}

