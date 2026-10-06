import React from 'react';
import { LayoutDashboard, PlusCircle, Compass, BedDouble, CalendarDays, TicketCheck, PieChart, Share2 } from 'lucide-react';
import type { Language } from '../../types';
import { TRANSLATIONS } from '../../services/i18n';


interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'create_trip', label: t.createTrip, icon: PlusCircle, highlight: true },
    { id: 'explore', label: t.explore, icon: Compass },
    { id: 'stays', label: t.stays, icon: BedDouble },
    { id: 'itinerary', label: t.itinerary, icon: CalendarDays },
    { id: 'bookings', label: t.bookings, icon: TicketCheck },
    { id: 'budget', label: t.budget, icon: PieChart },
    { id: 'summary', label: t.summaryShare, icon: Share2 },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col justify-between py-6 px-3 min-h-[calc(100vh-61px)] shrink-0 transition-colors">
      <div className="space-y-1">
        <div className="px-3 pb-3 mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {t.navigation}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-md'
                  : item.highlight
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/80 border border-teal-200 dark:border-teal-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Trip Status Footer Card */}
      <div className="mt-6 p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-700">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-black uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          {t.genaiEngine}
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {t.genaiFooterDesc}
        </p>
      </div>
    </aside>
  );
};
