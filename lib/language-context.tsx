"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "./translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationsType = any;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationsType;
  detectedTimezone: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect language from browser
function detectBrowserLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  
  const browserLang = navigator.language.toLowerCase();
  
  // Map browser language codes to our supported languages
  if (browserLang.startsWith("es")) return "es"; // Spanish
  if (browserLang.startsWith("pt")) return "pt"; // Portuguese
  if (browserLang.startsWith("de")) return "de"; // German
  if (browserLang.startsWith("ja")) return "ja"; // Japanese
  if (browserLang.startsWith("ko")) return "ko"; // Korean
  
  return "en"; // Default to English
}

// Detect timezone from browser
function detectTimezone(): string {
  if (typeof Intl === "undefined") return "UTC";
  
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [detectedTimezone, setDetectedTimezone] = useState<string>("UTC");

  // Load saved language preference or detect from browser
  useEffect(() => {
    const saved = localStorage.getItem("teamly-language") as Language;
    
    if (saved && (saved === "en" || saved === "es" || saved === "pt" || saved === "de" || saved === "ja" || saved === "ko")) {
      // Use saved preference
      setLanguageState(saved);
    } else {
      // Auto-detect from browser
      const detected = detectBrowserLanguage();
      setLanguageState(detected);
      localStorage.setItem("teamly-language", detected);
    }
    
    // Detect timezone
    const tz = detectTimezone();
    setDetectedTimezone(tz);
    
    // Save timezone if not already saved
    if (!localStorage.getItem("teamly-timezone")) {
      localStorage.setItem("teamly-timezone", tz);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("teamly-language", lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detectedTimezone }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
