import React from 'react';
import { Compass, Search, Globe, Mic, Sun, Moon, HelpCircle, User } from 'lucide-react';
import type { Language } from '../../types';
import { LANGUAGES, TRANSLATIONS } from '../../services/i18n';
import { useTextSize } from '../common/TextSizeContext';


interface HeaderProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenVoiceModal: () => void;
  onOpenHelpModal: () => void;
  userEmail?: string;
  onLogout?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeScreen: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  isDark,
  onToggleDark,
  onOpenVoiceModal,
  onOpenHelpModal,
  userEmail,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const { textSize, setTextSize } = useTextSize();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-teal-600 dark:to-teal-700 text-teal-400 dark:text-white flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                TripMate
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-md uppercase tracking-wider">
                GenAI v2
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            />
          </div>
        </div>

        {/* Quick Action Utilities: Voice, Text Size, Language, Theme, Help, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Floating Mic Button */}
          <button
            onClick={onOpenVoiceModal}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-sm text-xs font-bold"
            title="Voice Assistant (Web Speech API)"
            aria-label="Voice Assistant"
          >
            <Mic className="w-4 h-4 animate-bounce" />
            <span className="hidden lg:inline">{t.voiceAssistant}</span>
          </button>

          {/* Text Size Multiplier (A- / A / A+) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setTextSize('sm')}
              className={`px-2 py-1 text-xs font-extrabold rounded-lg transition ${
                textSize === 'sm' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Small Text (A-)"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('md')}
              className={`px-2 py-1 text-xs font-extrabold rounded-lg transition ${
                textSize === 'md' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Standard Text (A)"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-2 py-1 text-xs font-extrabold rounded-lg transition ${
                textSize === 'lg' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
              title="Large Accessible Text (A+)"
            >
              A+
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-700 dark:text-slate-300">
              <Globe className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
              <select
                value={currentLang}
                onChange={(e) => onSelectLang(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Select Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDark}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Help Tour (?) Button */}
          <button
            onClick={onOpenHelpModal}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Help Tour & FAQ"
            aria-label="Help Tour"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Profile / Demo User Status */}
          <div className="pl-1 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 dark:hover:text-red-400 hidden sm:block"
              >
                {t.signOut}
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
