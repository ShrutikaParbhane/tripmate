import React, { useState } from 'react';
import type { TripProfile, GroupType, SpecialNeed, Traveler, Interest, FoodPreference, PacePreference, Trip, Language } from '../types';
import { generateGenAITrip } from '../services/aiEngine';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { Sparkles, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Mic } from 'lucide-react';
import { PlanFitScoreBadge } from '../components/common/Badge';



interface CreateTripViewProps {
  onTripGenerated: (newTrip: Trip) => void;
  lang: Language;
  onOpenVoice: () => void;
}

export const CreateTripView: React.FC<CreateTripViewProps> = ({ onTripGenerated, lang, onOpenVoice }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<Trip | null>(null);

  // Form State
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState('2026-12-12');
  const [endDate, setEndDate] = useState('2026-12-16');
  const [totalBudget, setTotalBudget] = useState(80000);
  const [budgetPreference, setBudgetPreference] = useState<'saver' | 'balanced' | 'comfort'>('balanced');

  const [groupType, setGroupType] = useState<GroupType>('family');
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 't-1', name: 'Traveler 1 (Adult)', ageGroup: 'adult', specialNeeds: [] },
    { id: 't-2', name: 'Traveler 2 (Senior)', ageGroup: 'senior', specialNeeds: ['elderly'], notes: 'Ground floor preference' }
  ]);

  const [interests, setInterests] = useState<Interest[]>(['temples', 'beaches', 'culture', 'wellness']);
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('veg');
  const [allergies, setAllergies] = useState<string>('Peanuts');
  const [pace, setPace] = useState<PacePreference>('relaxed');

  const handleAddTraveler = () => {
    const newId = `t-${travelers.length + 1}`;
    setTravelers([
      ...travelers,
      { id: newId, name: `Traveler ${travelers.length + 1}`, ageGroup: 'adult', specialNeeds: [] }
    ]);
  };

  const handleRemoveTraveler = (id: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter(t => t.id !== id));
  };

  const handleToggleSpecialNeed = (travelerId: string, need: SpecialNeed) => {
    setTravelers(travelers.map(t => {
      if (t.id === travelerId) {
        const needs = t.specialNeeds.includes(need)
          ? t.specialNeeds.filter(n => n !== need)
          : [...t.specialNeeds, need];
        return { ...t, specialNeeds: needs };
      }
      return t;
    }));
  };

  const handleToggleInterest = (inst: Interest) => {
    if (interests.includes(inst)) {
      setInterests(interests.filter(i => i !== inst));
    } else {
      setInterests([...interests, inst]);
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setStep(4);

    const profile: TripProfile = {
      destination,
      startDate,
      endDate,
      totalBudget,
      budgetPreference,
      groupType,
      travelers,
      interests,
      foodPreference,
      allergies: allergies ? allergies.split(',').map(s => s.trim()) : [],
      pace
    };

    const newTrip = await generateGenAITrip(profile, lang);
    setGeneratedDraft(newTrip);
    setIsGenerating(false);
  };

  const handleAcceptDraft = () => {
    if (generatedDraft) {
      onTripGenerated(generatedDraft);
    }
  };

  const groupOptions: { type: GroupType; title: string; desc: string; icon: string }[] = [
    { type: 'solo', title: lang === 'hi' ? 'अकेले यात्री (सोलों)' : lang === 'mr' ? 'एकटा प्रवासी (सोलो)' : 'Solo Explorer', desc: lang === 'hi' ? 'सुरक्षा और स्वतंत्रता के साथ एकल यात्रा' : lang === 'mr' ? 'स्वातंत्र्य आणि सुरक्षेसह प्रवास' : 'Single traveler seeking freedom & safety', icon: '👤' },
    { type: 'couple', title: lang === 'hi' ? 'युगल (कपल)' : lang === 'mr' ? 'दंपती (कपल्स)' : 'Couple Gateway', desc: lang === 'hi' ? 'रोमांटिक और सुखद यादें' : lang === 'mr' ? 'रोमँटिक आणि अविस्मरणीय क्षण' : 'Romantic, cozy & memorable moments', icon: '👩‍❤️‍👨' },
    { type: 'family', title: lang === 'hi' ? 'बच्चों के साथ परिवार' : lang === 'mr' ? 'मुलांसह कुटुंब' : 'Family with Kids', desc: lang === 'hi' ? 'सुरक्षित पूल, बच्चों के मेनू और आसान यात्रा' : lang === 'mr' ? 'सुरक्षित पूल, मुलांचे मेनू आणि सोपा प्रवास' : 'Safe pools, kid menus & easy hops', icon: '👨‍👩‍👧‍👦' },
    { type: 'bachelor', title: lang === 'hi' ? 'मित्र / बैचलर ग्रुप' : lang === 'mr' ? 'मित्र / बॅचलर ग्रुप' : 'Friends / Bachelor', desc: lang === 'hi' ? 'कैंपिंग, बीच शेक और नाइटलाइफ़' : lang === 'mr' ? 'कॅम्पिंग, बीच शेक्स आणि नाईटलाईफ' : 'Camping, beach shacks & nightlife', icon: '🎉' },
    { type: 'seniors', title: lang === 'hi' ? 'वरिष्ठ नागरिक' : lang === 'mr' ? 'ज्येष्ठ नागरिक' : 'Senior Citizens', desc: lang === 'hi' ? 'मंदिर, भूतल कमरे, शांत गति' : lang === 'mr' ? 'मंदिरे, तळमजला खोल्या, शांत वेग' : 'Spiritual temples, ground floor, slow pace', icon: '👵👨‍🦳' },
    { type: 'mixed', title: lang === 'hi' ? 'मिश्रित बहु-पीढ़ी' : lang === 'mr' ? 'मिश्रित गट' : 'Mixed Multi-gen', desc: lang === 'hi' ? 'विभिन्न आवश्यकताओं का संतुलन' : lang === 'mr' ? 'विविध गरजांचे संतुलन' : 'Diverse needs balanced with care', icon: '🤝' },
  ];

  const interestOptions: { id: Interest; label: string; icon: string }[] = [
    { id: 'beaches', label: t.beaches, icon: '🏖️' },
    { id: 'temples', label: t.templesSpiritual, icon: '🛕' },
    { id: 'culture', label: t.cultureHeritage, icon: '🏛️' },
    { id: 'nature', label: t.natureParks, icon: '🌿' },
    { id: 'adventure', label: t.adventureSports, icon: '🪂' },
    { id: 'nightlife', label: t.nightlifeClubs, icon: '🪩' },
    { id: 'shopping', label: t.shoppingMarkets, icon: '🛍️' },
    { id: 'wellness', label: t.wellnessSpa, icon: '🧘' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Wizard Header & Progress */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> {t.step} {step} {t.of} 4 • {t.createTrip} {t.wizard}
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {step === 1 && t.tripBasics}
            {step === 2 && t.groupTravelerProfile}
            {step === 3 && t.foodPacePreferences}
            {step === 4 && t.genaiDecisionReview}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-xl transition text-xs font-bold flex items-center gap-1"
            title="Voice Input on fields"
          >
            <Mic className="w-4 h-4 text-teal-600" />
            {t.voiceFill}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className="bg-teal-600 h-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* STEP 1: TRIP BASICS */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Destination */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition"
                placeholder="e.g. Goa, Manali, Kerala"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 transition"
                />
              </div>
            </div>

          </div>

          {/* Hard Budget Cap Slider & Input */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Total Hard Budget Cap (₹)
              </label>
              <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                {formatINR(totalBudget)}
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="250000"
              step="5000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              TripMate's GenAI Decision Engine will strictly enforce this cap across Stays, Transport, Food, Activities, and Buffer.
            </p>
          </div>

          {/* Budget Preference Split */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Budget Split Preference
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'saver', label: 'Saver', desc: 'Max activities, budget stays' },
                { id: 'balanced', label: 'Balanced', desc: 'Comfort stays & good food' },
                { id: 'comfort', label: 'Comfort / Luxury', desc: 'Resorts & private cabs' },
              ].map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setBudgetPreference(pref.id as any)}
                  className={`p-3 rounded-xl border text-left transition ${
                    budgetPreference === pref.id
                      ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-extrabold text-xs">{pref.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{pref.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
            >
              Next: Group & Travelers <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: GROUP TYPE & TRAVELERS LIST */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          
          {/* Group Type Cards */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Who is Traveling? (Group Type)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {groupOptions.map((g) => (
                <button
                  key={g.type}
                  type="button"
                  onClick={() => setGroupType(g.type)}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    groupType === g.type
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-500 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500/20'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{g.icon}</div>
                  <div>
                    <div className="font-extrabold text-xs">{g.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Travelers List Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                Travelers List ({travelers.length} People)
              </label>
              <button
                type="button"
                onClick={handleAddTraveler}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Person
              </button>
            </div>

            <div className="space-y-3">
              {travelers.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTravelers(travelers.map(tr => tr.id === t.id ? { ...tr, name: val } : tr));
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                      placeholder="Traveler Name"
                    />

                    <div className="flex items-center gap-2">
                      <select
                        value={t.ageGroup}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setTravelers(travelers.map(tr => tr.id === t.id ? { ...tr, ageGroup: val } : tr));
                        }}
                        className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="adult">Adult (18-59)</option>
                        <option value="senior">Senior (60+)</option>
                        <option value="teen">Teenager (13-17)</option>
                        <option value="child">Child (&lt;12)</option>
                      </select>

                      {travelers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTraveler(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Special Needs Toggles */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Special Needs (Private local data):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { need: 'pregnancy' as SpecialNeed, label: 'Pregnancy' },
                        { need: 'wheelchair' as SpecialNeed, label: 'Wheelchair / Reduced Mobility' },
                        { need: 'elderly' as SpecialNeed, label: 'Elderly (Slow Pace)' },
                        { need: 'infant' as SpecialNeed, label: 'Infant / Kid Care' },
                        { need: 'medical' as SpecialNeed, label: 'Medical Proximity Need' },
                      ].map((sn) => (
                        <button
                          key={sn.need}
                          type="button"
                          onClick={() => handleToggleSpecialNeed(t.id, sn.need)}
                          className={`px-2.5 py-1 text-[11px] rounded-full font-bold transition ${
                            t.specialNeeds.includes(sn.need)
                              ? 'bg-pink-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-pink-300'
                          }`}
                        >
                          {t.specialNeeds.includes(sn.need) ? '✓ ' : '+ '}
                          {sn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
            >
              Next: Food & Pace <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INTERESTS, FOOD & PACE */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
          
          {/* Interests */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Trip Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {interestOptions.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => handleToggleInterest(inst.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 ${
                    interests.includes(inst.id)
                      ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white border-transparent shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xl">{inst.icon}</span>
                  <span className="text-xs font-bold">{inst.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Preference */}
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Food & Diet Preference
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'veg', label: 'Pure Veg' },
                { id: 'jain', label: 'Jain' },
                { id: 'nonveg', label: 'Non-Veg' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'halal', label: 'Halal' },
                { id: 'eggetarian', label: 'Eggetarian' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFoodPreference(f.id as FoodPreference)}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-extrabold transition ${
                    foodPreference === f.id
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies & Pace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Allergies & Restrictions
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                placeholder="e.g. Peanuts, Shellfish, Dairy"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Travel Pace
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['relaxed', 'balanced', 'packed'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPace(p as PacePreference)}
                    className={`py-2 px-2 rounded-xl border text-center text-xs font-extrabold capitalize transition ${
                      pace === p
                        ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white border-transparent'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleGenerateAI}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-black rounded-xl transition text-sm flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-5 h-5 text-teal-200 animate-spin" />
              Generate Plan with GenAI
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GENAI DRAFT REVIEW */}
      {step === 4 && (
        <div className="space-y-6">
          {isGenerating ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                GenAI Decision Engine is Computing...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Analyzing traveler special needs, checking hospital proximity, verifying pure veg restaurants, and allocating hard budget cap ₹{totalBudget.toLocaleString()}...
              </p>
            </div>
          ) : generatedDraft ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* AI Draft Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-teal-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Draft Generated • Fit Score {generatedDraft.overallFitScore}%
                  </div>
                  <h2 className="text-2xl font-black">{generatedDraft.title}</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    AI suggests, user decides. Review items below before saving to active trips.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
                  >
                    Edit Criteria
                  </button>
                  <button
                    onClick={handleAcceptDraft}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept & Save Trip
                  </button>
                </div>
              </div>

              {/* Disclaimer Note */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Notice: AI plans may be outdated; please verify real-time prices and hospital contact info before booking.</span>
              </div>

              {/* Draft Itinerary Days */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Generated Day-by-Day Timeline ({generatedDraft.itinerary.length} Days)
                </h3>

                {generatedDraft.itinerary.map((day) => (
                  <div key={day.dayNumber} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                      <div>
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase">
                          Day {day.dayNumber} • {day.theme}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{day.title}</h4>
                      </div>
                      <PlanFitScoreBadge score={day.planFitScore} size="sm" />
                    </div>

                    <div className="p-3 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-xs text-teal-800 dark:text-teal-200">
                      <strong>Why this day:</strong> {day.whyThisDay}
                    </div>

                    <div className="space-y-2">
                      {day.activities.map((act) => (
                        <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white mr-2">{act.timeSlot}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</span>
                            {act.suitabilityNote && (
                              <p className="text-[11px] text-teal-700 dark:text-teal-300 font-medium mt-0.5">✓ {act.suitabilityNote}</p>
                            )}
                          </div>
                          {act.cost > 0 && <span className="font-bold text-slate-900 dark:text-white">{formatINR(act.cost)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : null}
        </div>
      )}

    </div>
  );
};
