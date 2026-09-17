"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../messages/en.json";
import hi from "../messages/hi.json";
import ta from "../messages/ta.json";

type Language = "en" | "hi" | "ta";
type Messages = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Messages) => string;
}

const dictionaries: Record<Language, Messages> = {
  en: en as Messages,
  hi: hi as Messages,
  ta: ta as Messages,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: keyof Messages) => en[key] || String(key),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: keyof Messages): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return dict[key] || (en as Record<string, string>)[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
