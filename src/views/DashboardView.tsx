import React from 'react';
import type { Trip, Language } from '../types';
import { TRANSLATIONS, formatINR, formatDate } from '../services/i18n';
import { Clock, PlusCircle, Compass, BedDouble, PieChart, Users, ArrowRight, Sparkles } from 'lucide-react';



interface DashboardViewProps {
  currentTrip: Trip;
  onNavigate: (screen: string) => void;
  onSelectScenario?: (scenarioId: string) => void;
  lang: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentTrip,
  onNavigate,
  lang
}) => {

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Countdown calculations
  const startDate = new Date(currentTrip.profile.startDate);
  const today = new Date('2026-12-01'); // simulated timeline
  const diffTime = Math.max(0, startDate.getTime() - today.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const totalSpent = currentTrip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetPercentage = Math.round((totalSpent / currentTrip.profile.totalBudget) * 100);


  const todayItinerary = currentTrip.itinerary[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-extrabold uppercase tracking-wider mb-1 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            GenAI Active Plan • {currentTrip.profile.destination}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentTrip.title}
          </h1>
          <p className="text-xs text-slate-300">
            {currentTrip.profile.travelers.length} Travelers • {formatDate(currentTrip.profile.startDate, lang)} - {formatDate(currentTrip.profile.endDate, lang)} • Budget: {formatINR(currentTrip.profile.totalBudget)}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('create_trip')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-md shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            {t.createTrip}
          </button>
        </div>
      </div>



      {/* Main Grid: Trip Stats, Countdown, Budget Ring & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols on lg): Countdown, Progress, Today's Plan */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            {/* Countdown Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t.countdown}</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{daysLeft} {lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'Days'}</div>
                <div className="text-[10px] font-semibold text-slate-500">{t.toDeparture}</div>
              </div>
            </div>

            {/* Overall Fit Score Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t.planFitScore}</div>
                <div className="text-lg font-black text-teal-600 dark:text-teal-400">{currentTrip.overallFitScore}%</div>
                <div className="text-[10px] font-semibold text-slate-500">{t.highlyCustomized}</div>
              </div>
            </div>

            {/* Budget Status Card */}
            <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PieChart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{t.spentBudget}</div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {formatINR(totalSpent)} <span className="text-xs font-normal text-slate-400">/ {formatINR(currentTrip.profile.totalBudget)}</span>
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {100 - budgetPercentage}% {t.remaining}
                </div>
              </div>
            </div>

          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  {lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'Day'} {todayItinerary?.dayNumber || 1} • {todayItinerary?.title || 'Arrival & Stroll'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.todaysItinerary}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('itinerary')}
                className="text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {t.fullItinerary} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayItinerary?.whyThisDay && (
              <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong>{t.whyThis}:</strong> {todayItinerary.whyThisDay}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {todayItinerary?.activities.map((act) => (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                    act.isRestBreak
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-black shrink-0">
                      {act.timeSlot}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold">{act.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{act.location}</p>
                      {act.suitabilityNote && (
                        <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold mt-1">
                          ✓ {act.suitabilityNote}
                        </p>
                      )}
                    </div>
                  </div>
                  {act.cost > 0 && (
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 shrink-0">
                      {formatINR(act.cost)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Traveler Profile Summary & Quick Actions */}
        <div className="space-y-6">
          
          {/* Group Profile Summary Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              {t.travelerProfile} ({currentTrip.profile.travelers.length})
            </h3>

            <div className="space-y-2 mb-4">
              {currentTrip.profile.travelers.map((tr) => (
                <div key={tr.id} className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <span>{tr.name} ({tr.ageGroup})</span>
                    {tr.specialNeeds.length > 0 && (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 rounded-full text-[10px]">
                        {tr.specialNeeds.join(', ')}
                      </span>
                    )}
                  </div>
                  {tr.notes && <p className="text-[11px] text-slate-500 mt-0.5">{tr.notes}</p>}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p><strong>{t.diet}</strong> <span className="uppercase text-teal-600 dark:text-teal-400 font-extrabold">{currentTrip.profile.foodPreference}</span></p>
              <p><strong>{t.pace}</strong> <span className="capitalize">{currentTrip.profile.pace}</span></p>
              <p><strong>{t.interests}</strong> {currentTrip.profile.interests.join(', ')}</p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.quickShortcuts}
            </h3>
            <button
              onClick={() => onNavigate('explore')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2"><Compass className="w-4 h-4 text-teal-600" /> {t.explorePlaces}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigate('stays')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2"><BedDouble className="w-4 h-4 text-teal-600" /> {t.viewAIRankedStays}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onNavigate('budget')}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2"><PieChart className="w-4 h-4 text-teal-600" /> {t.trackBudgetExpenses}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
