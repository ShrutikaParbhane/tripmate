import React, { useState } from 'react';
import { Compass, Users, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

import type { Language } from '../../types';
import { TRANSLATIONS } from '../../services/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onFinish: () => void;
  lang?: Language;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onFinish, lang = 'en' }) => {
  const [step, setStep] = useState(1);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-teal-600' : 'w-2 bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">{t.step} {step} {t.of} 3</span>
        </div>

        {step === 1 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.welcomeTripMate}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {t.onboardingDesc1}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Personalized Profile Engine</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {t.onboardingDesc2}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">GenAI Suggests, User Decides</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {t.onboardingDesc3}
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              {t.back}
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              {t.next} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-extrabold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition flex items-center gap-1.5 shadow-md"
            >
              {t.getStarted} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
