import React from 'react';
import { HelpCircle, Mic, Hospital, PieChart, Users, X } from 'lucide-react';


import type { Language } from '../../types';
import { TRANSLATIONS } from '../../services/i18n';

interface HelpTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const HelpTourModal: React.FC<HelpTourModalProps> = ({ isOpen, onClose, lang = 'en' }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.guideTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.guideSubtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Users className="w-4 h-4 text-teal-600" />
              1. Traveler Profile Engine
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Add every traveler with their age group and optional special needs (pregnancy trimester, wheelchair, elderly, infants, medical needs). Special needs are kept strictly private locally.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Hospital className="w-4 h-4 text-red-600" />
              2. Hospital Proximity & Accessibility
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              For pregnant travelers and reduced mobility seniors, hotels and places show exact hospital distance and step-free accessibility tags.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Mic className="w-4 h-4 text-purple-600" />
              3. Multilingual Voice Assistant
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Click the floating microphone button to speak commands in 10 languages, e.g., "Plan a 4 day Goa trip for family of 5 under 80000 rupees" or listen to your itinerary read out loud.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              <PieChart className="w-4 h-4 text-amber-600" />
              4. Hard Budget Cap in ₹
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              TripMate never exceeds your set budget limit. It tracks real-time spending, category breakdown, alerts at 80%/100%, and offers cheaper/upgrade item swaps.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition text-sm shadow-md"
          >
            {t.gotIt}
          </button>
        </div>
      </div>
    </div>
  );
};
