import React, { useState } from 'react';
import type { Stay, Language, TripProfile } from '../types';
import { SEED_STAYS } from '../data/seedData';
import { scoreStayForProfile } from '../services/aiEngine';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { SuitabilityBadges, PlanFitScoreBadge } from '../components/common/Badge';
import { Hospital, Sparkles, ArrowRightLeft, X, CheckCircle2 } from 'lucide-react';



interface StaysViewProps {
  profile: TripProfile;
  selectedStayId?: string;
  onSelectStay: (stay: Stay) => void;
  lang: Language;
}

export const StaysView: React.FC<StaysViewProps> = ({
  profile,
  selectedStayId,
  onSelectStay,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [compareList, setCompareList] = useState<Stay[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filterNearHospital, setFilterNearHospital] = useState(false);

  // AI Rank Stays for current trip profile
  const rankedStays = SEED_STAYS.map(stay => {
    const { score, whyRecommended } = scoreStayForProfile(stay, profile, lang);
    return { ...stay, planFitScore: score, whyRecommended };
  }).sort((a, b) => (b.planFitScore || 0) - (a.planFitScore || 0));

  const displayStays = filterNearHospital
    ? rankedStays.filter(s => s.hospitalDistanceKm <= 2.0)
    : rankedStays;

  const handleToggleCompare = (stay: Stay) => {
    if (compareList.some(s => s.id === stay.id)) {
      setCompareList(compareList.filter(s => s.id !== stay.id));
    } else {
      if (compareList.length >= 3) return; // max 3
      setCompareList([...compareList, stay]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Filter Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> GenAI {t.stays} Engine
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.aiRankedStaysResorts}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailored to your {profile.groupType} group with special needs & hard budget cap.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterNearHospital(!filterNearHospital)}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 border ${
              filterNearHospital
                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Hospital className="w-4 h-4 text-red-500" />
            {t.nearHospital}
          </button>

          {compareList.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2 bg-slate-900 text-white dark:bg-teal-600 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 animate-pulse"
            >
              <ArrowRightLeft className="w-4 h-4" /> {t.compare} ({compareList.length}/3)
            </button>
          )}
        </div>
      </div>

      {/* Stays List */}
      <div className="space-y-4">
        {displayStays.map((stay, idx) => {
          const isSelected = selectedStayId === stay.id;
          const isInCompare = compareList.some(s => s.id === stay.id);

          return (
            <div
              key={stay.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border transition flex flex-col md:flex-row gap-5 shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20 dark:bg-teal-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Hotel Image */}
              <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 relative">
                <img
                  src={stay.image}
                  alt={stay.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold rounded-md uppercase">
                    Rank #{idx + 1}
                  </span>
                </div>
              </div>

              {/* Info Details */}
              <div className="flex-1 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {stay.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <PlanFitScoreBadge score={stay.planFitScore || 85} size="md" />
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {formatINR(stay.pricePerNight)} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {stay.description}
                  </p>

                  {/* Why Recommended AI Explanation */}
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200 mb-3">
                    <strong className="text-teal-700 dark:text-teal-300">{t.whyRecommended}</strong> {stay.whyRecommended}
                  </div>

                  <SuitabilityBadges
                    suitability={stay.suitability}
                    hospitalDistanceKm={stay.hospitalDistanceKm}
                    size="sm"
                  />
                </div>

                {/* Amenities & Select Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    {stay.amenities.map((am, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md font-medium">
                        ✓ {am}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleCompare(stay)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                        isInCompare
                          ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isInCompare ? t.compared : t.compare}
                    </button>

                    <button
                      onClick={() => onSelectStay(stay)}
                      className={`px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> {t.selectedStay}
                        </>
                      ) : (
                        t.selectThisStay
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-teal-600" /> Side-by-Side Stay Comparison ({compareList.length} Selected)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map((stay) => (
                <div key={stay.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                  <img src={stay.image} alt={stay.name} className="w-full h-32 object-cover rounded-lg" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{stay.name}</h4>
                  <p className="font-black text-teal-600">{formatINR(stay.pricePerNight)} / night</p>
                  <p><strong>Hospital Distance:</strong> {stay.hospitalDistanceKm} km</p>
                  <p><strong>Fit Score:</strong> {stay.planFitScore}%</p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <strong>Amenities:</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {stay.amenities.map((a, idx) => <li key={idx}>{a}</li>)}
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onSelectStay(stay);
                      setShowCompareModal(false);
                    }}
                    className="w-full py-2 bg-slate-900 text-white dark:bg-teal-600 font-bold rounded-lg mt-2"
                  >
                    Select Stay
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
