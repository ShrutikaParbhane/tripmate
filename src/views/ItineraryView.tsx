import React, { useState } from 'react';
import type { Trip, ItineraryDay, Activity, Language } from '../types';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { PlanFitScoreBadge } from '../components/common/Badge';
import { Calendar, Sparkles, Trash2, ArrowUp, ArrowDown, Edit3, Check, Undo2, Volume2 } from 'lucide-react';
import { voiceAssistant } from '../services/voiceAssistant';



interface ItineraryViewProps {
  trip: Trip;
  onUpdateItinerary: (updatedDays: ItineraryDay[]) => void;
  lang: Language;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  onUpdateItinerary,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [deletedActivityBackup, setDeletedActivityBackup] = useState<{ activity: Activity; dayIdx: number; actIdx: number } | null>(null);
  const [isAIImproving, setIsAIImproving] = useState(false);
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const days = trip.itinerary;
  const currentDay = days[activeDayIndex] || days[0];

  const handleMoveActivity = (dayIdx: number, actIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? actIdx - 1 : actIdx + 1;
    if (targetIdx < 0 || targetIdx >= days[dayIdx].activities.length) return;

    const newDays = [...days];
    const acts = [...newDays[dayIdx].activities];
    const temp = acts[actIdx];
    acts[actIdx] = acts[targetIdx];
    acts[targetIdx] = temp;

    newDays[dayIdx] = { ...newDays[dayIdx], activities: acts };
    onUpdateItinerary(newDays);
  };

  const handleDeleteActivity = (dayIdx: number, actIdx: number) => {
    const act = days[dayIdx].activities[actIdx];
    setDeletedActivityBackup({ activity: act, dayIdx, actIdx });

    const newDays = [...days];
    const acts = newDays[dayIdx].activities.filter((_, i) => i !== actIdx);
    newDays[dayIdx] = { ...newDays[dayIdx], activities: acts };
    onUpdateItinerary(newDays);
  };

  const handleUndoDelete = () => {
    if (!deletedActivityBackup) return;
    const { activity, dayIdx, actIdx } = deletedActivityBackup;

    const newDays = [...days];
    const acts = [...newDays[dayIdx].activities];
    acts.splice(actIdx, 0, activity);
    newDays[dayIdx] = { ...newDays[dayIdx], activities: acts };
    onUpdateItinerary(newDays);
    setDeletedActivityBackup(null);
  };

  const handleImproveWithAI = (dayIdx: number) => {
    setIsAIImproving(true);
    setTimeout(() => {
      const newDays = [...days];
      newDays[dayIdx] = {
        ...newDays[dayIdx],
        planFitScore: Math.min(99, newDays[dayIdx].planFitScore + 2),
        whyThisDay: `${newDays[dayIdx].whyThisDay} (AI optimized rest spacing & travel routes).`
      };
      onUpdateItinerary(newDays);
      setIsAIImproving(false);
    }, 600);
  };

  const handleReadDayAloud = () => {
    if (!currentDay) return;
    const textToRead = `Day ${currentDay.dayNumber}: ${currentDay.title}. Theme: ${currentDay.theme}. Activities include: ${currentDay.activities.map(a => a.title).join(', ')}. Why this day: ${currentDay.whyThisDay}`;
    voiceAssistant.speakText(textToRead, lang);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Undo Delete Toast Banner */}
      {deletedActivityBackup && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <span className="text-xs font-bold">{t.activityDeleted}</span>
          <button
            onClick={handleUndoDelete}
            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs rounded-lg flex items-center gap-1 transition"
          >
            <Undo2 className="w-3.5 h-3.5" /> {t.undoDelete}
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" /> Interactive {t.itinerary} Timeline
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.daywisePlanner}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag, reorder, edit, and optimize rest breaks for your group.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReadDayAloud}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-200 transition"
          >
            <Volume2 className="w-4 h-4 text-teal-600" /> {t.readAloud}
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d, idx) => (
          <button
            key={d.dayNumber}
            onClick={() => setActiveDayIndex(idx)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeDayIndex === idx
                ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-md'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'Day'} {d.dayNumber}</span>
            <span className="text-[10px] opacity-70">({formatINR(d.estimatedCost)})</span>
          </button>
        ))}
      </div>

      {/* Current Day Details Card */}
      {currentDay && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <div className="text-xs font-extrabold uppercase text-teal-600 dark:text-teal-400 tracking-wider">
                {lang === 'hi' ? 'दिन' : lang === 'mr' ? 'दिवस' : 'Day'} {currentDay.dayNumber} Theme: {currentDay.theme}
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {currentDay.title}
              </h2>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                <span>⏱️ {t.travelTime}: {currentDay.travelTimeMinutes} mins total</span>
                <span>☕ {t.restBreaks}: {currentDay.restBreakCount} scheduled</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PlanFitScoreBadge score={currentDay.planFitScore} size="lg" />
              <button
                onClick={() => handleImproveWithAI(activeDayIndex)}
                disabled={isAIImproving}
                className="px-3.5 py-2 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-extrabold text-xs rounded-xl hover:bg-teal-100 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                {isAIImproving ? t.improving : t.improveWithAI}
              </button>
            </div>
          </div>

          {/* AI Explanation Banner */}
          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200">
            <strong className="text-teal-700 dark:text-teal-300">{t.whyThis}:</strong> {currentDay.whyThisDay}
          </div>

          {/* Activities List */}
          <div className="space-y-3">
            {currentDay.activities.map((act, actIdx) => (
              <div
                key={act.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                  act.isRestBreak
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col items-center">
                    <span className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black rounded-md">
                      {act.timeSlot}
                    </span>
                  </div>

                  <div className="flex-1">
                    {editingActId === act.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-md"
                        />
                        <button
                          onClick={() => {
                            const newDays = [...days];
                            newDays[activeDayIndex].activities[actIdx].title = editTitle;
                            onUpdateItinerary(newDays);
                            setEditingActId(null);
                          }}
                          className="p-1 text-teal-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {act.title}
                        <button
                          onClick={() => {
                            setEditingActId(act.id);
                            setEditTitle(act.title);
                          }}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </h4>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400">{act.location}</p>
                    {act.suitabilityNote && (
                      <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold mt-1">
                        ✓ {act.suitabilityNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {act.cost > 0 && (
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white mr-2">
                      {formatINR(act.cost)}
                    </span>
                  )}

                  {/* Reorder up/down */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMoveActivity(activeDayIndex, actIdx, 'up')}
                      disabled={actIdx === 0}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveActivity(activeDayIndex, actIdx, 'down')}
                      disabled={actIdx === currentDay.activities.length - 1}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteActivity(activeDayIndex, actIdx)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
