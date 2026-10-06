import React, { useState } from 'react';
import { Compass, Sparkles, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../services/i18n';


interface AuthViewProps {
  onLogin: (email: string) => void;
  onTryDemo: () => void;
  lang: Language;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onTryDemo, lang }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 transition-colors">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 dark:bg-teal-600 text-teal-400 dark:text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Compass className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            TripMate
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {t.tagline}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isSignUp ? t.createAccountHeader : t.welcomeBack}
            </h2>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              {isSignUp ? t.existingUser : t.newUser}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t.emailAddress}
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t.password}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-md"
            >
              {isSignUp ? t.createAccount : t.signIn}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-800 text-xs font-bold text-slate-400">
              {t.orExploreInstantly}
            </span>
          </div>

          {/* Instant Demo Trip Button */}
          <button
            onClick={onTryDemo}
            className="w-full py-3.5 bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-extrabold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            {t.tryDemoTrip} (Family of 5 in Goa)
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-teal-600" /> {t.privateData}</span>
          <span className="flex items-center gap-1"><UserCheck className="w-4 h-4 text-teal-600" /> {t.accessibleUX}</span>
        </div>

      </div>
    </div>
  );
};
