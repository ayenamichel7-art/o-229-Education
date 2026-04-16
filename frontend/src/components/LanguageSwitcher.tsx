import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(nextLng);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 rounded-lg shadow-sm"
      title={i18n.language === "fr" ? "Passer en Anglais" : "Switch to French"}
    >
      <Globe size={16} />
      <span>{i18n.language === "fr" ? "FR" : "EN"}</span>
    </button>
  );
};
