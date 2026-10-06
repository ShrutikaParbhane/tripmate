import React from 'react';
import { LayoutDashboard, PlusCircle, Compass, BedDouble, CalendarDays, PieChart } from 'lucide-react';
import type { Language } from '../../types';
import { TRANSLATIONS } from '../../services/i18n';


interface MobileNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  lang: Language;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeScreen, onNavigate, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const mobileTabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'create_trip', label: t.createTrip, icon: PlusCircle },
    { id: 'explore', label: t.explore, icon: Compass },
    { id: 'stays', label: t.stays, icon: BedDouble },
    { id: 'itinerary', label: t.itinerary, icon: CalendarDays },
    { id: 'budget', label: t.budget, icon: PieChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 py-1.5 transition-colors">
      <div className="flex items-center justify-around">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center min-w-12 py-1 px-1 rounded-xl transition-colors ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110 text-teal-600 dark:text-teal-400' : ''}`} />
              <span className="text-[10px] truncate max-w-16">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
