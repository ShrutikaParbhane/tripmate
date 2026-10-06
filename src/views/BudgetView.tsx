import React, { useState } from 'react';
import type { Trip, Expense, Language } from '../types';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { getSwapSuggestions } from '../services/aiEngine';
import { PieChart, Plus, AlertTriangle, ArrowRightLeft } from 'lucide-react';



interface BudgetViewProps {
  trip: Trip;
  onAddExpense: (expense: Expense) => void;
  lang: Language;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  trip,
  onAddExpense,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(1500);
  const [category, setCategory] = useState<'stay' | 'food' | 'transport' | 'activities' | 'buffer'>('food');
  const [paidBy, setPaidBy] = useState(trip.profile.travelers[0]?.name || 'Traveler 1');
  const [selectedSwapItem, setSelectedSwapItem] = useState<Expense | null>(null);

  const totalBudget = trip.profile.totalBudget;
  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const spentPct = Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const perPersonCost = Math.round(totalSpent / Math.max(1, trip.profile.travelers.length));

  // Category Breakdown Totals
  const categoryTotals = {
    stay: trip.expenses.filter(e => e.category === 'stay').reduce((s, e) => s + e.amount, 0),
    food: trip.expenses.filter(e => e.category === 'food').reduce((s, e) => s + e.amount, 0),
    transport: trip.expenses.filter(e => e.category === 'transport').reduce((s, e) => s + e.amount, 0),
    activities: trip.expenses.filter(e => e.category === 'activities').reduce((s, e) => s + e.amount, 0),
    buffer: trip.expenses.filter(e => e.category === 'buffer').reduce((s, e) => s + e.amount, 0),
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount,
      paidBy,
      date: new Date().toISOString().split('T')[0]
    };

    onAddExpense(newExp);
    setTitle('');
    setAmount(1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 80% and 100% Budget Alert Banner */}
      {spentPct >= 100 ? (
        <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2 text-sm font-black">
            <AlertTriangle className="w-5 h-5" />
            Budget Cap Alert: You have reached 100% of your hard budget (₹{totalBudget.toLocaleString()})!
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-lg">Check Swap Alternatives</span>
        </div>
      ) : spentPct >= 80 ? (
        <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-black">
            <AlertTriangle className="w-5 h-5" />
            Warning: You have spent {spentPct}% of your budget limit.
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-lg">₹{remaining.toLocaleString()} left</span>
        </div>
      ) : null}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <PieChart className="w-3.5 h-3.5" /> {t.budget} Engine
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.budgetCapTracker}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.totalHardCap}: {formatINR(totalBudget)} • Split among {trip.profile.travelers.length} travelers.
          </p>
        </div>
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Budget Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t.totalHardCap}
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalBudget)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="bg-slate-900 dark:bg-white h-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t.spentSoFar}
          </span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {formatINR(totalSpent)}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${spentPct >= 90 ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${spentPct}%` }}
            />
          </div>
        </div>

        {/* Remaining Budget & Per-person Split Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {t.remaining} / {t.perPersonSplit}
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(remaining)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
            👥 {formatINR(perPersonCost)} per traveler
          </p>
        </div>

      </div>

      {/* Main Split & Expense Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Category Breakdown & Swaps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Allocated vs Actual Category Split Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.categoryBreakdownSplit}
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { cat: 'stay', label: 'Stays & Accommodations', allocated: trip.budgetSplit.stay, actual: categoryTotals.stay, color: 'bg-teal-500' },
                { cat: 'food', label: 'Food & Dining', allocated: trip.budgetSplit.food, actual: categoryTotals.food, color: 'bg-emerald-500' },
                { cat: 'transport', label: 'Transport & Cabs', allocated: trip.budgetSplit.transport, actual: categoryTotals.transport, color: 'bg-blue-500' },
                { cat: 'activities', label: 'Activities & Sightseeing', allocated: trip.budgetSplit.activities, actual: categoryTotals.activities, color: 'bg-purple-500' },
                { cat: 'buffer', label: 'Emergency Buffer', allocated: trip.budgetSplit.buffer, actual: categoryTotals.buffer, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.cat} className="space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>{item.label}</span>
                    <span>{formatINR(item.actual)} <span className="text-slate-400 font-normal">/ {formatINR(item.allocated)}</span></span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    <div className={`${item.color} h-full`} style={{ width: `${Math.min(100, (item.actual / Math.max(1, item.allocated)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Log List with Cheaper/Upgrade Swap Buttons */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {t.expenseLog} ({trip.expenses.length} Items)
            </h3>

            <div className="space-y-3">
              {trip.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <span>{exp.title}</span>
                      <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md text-[10px] uppercase">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Paid by {exp.paidBy} • {exp.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {formatINR(exp.amount)}
                    </span>
                    <button
                      onClick={() => setSelectedSwapItem(exp)}
                      className="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition"
                      title="View Cheaper or Upgrade Swap Options"
                    >
                      {t.swap}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Add Expense Form */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 sticky top-20">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              {t.logNewExpense}
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">{t.expenseTitle}</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dinner at Navtara"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  <option value="stay">Stay</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="activities">Activities</option>
                  <option value="buffer">Buffer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                >
                  {trip.profile.travelers.map((tr) => (
                    <option key={tr.id} value={tr.name}>{tr.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white font-extrabold rounded-xl transition shadow-md"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Cheaper / Upgrade Swap Options Modal */}
      {selectedSwapItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-teal-600" />
              Swap Options: {selectedSwapItem.title}
            </h3>

            {(() => {
              const swaps = getSwapSuggestions(selectedSwapItem.amount, selectedSwapItem.category);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                    <div className="font-extrabold text-emerald-800 dark:text-emerald-300">{swaps.cheaper.title}</div>
                    <p className="text-slate-600 dark:text-slate-300">{swaps.cheaper.description}</p>
                    <p className="font-black text-emerald-700">Cost: {formatINR(swaps.cheaper.cost)} (Saves {formatINR(swaps.cheaper.savings)})</p>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
                    <div className="font-extrabold text-purple-800 dark:text-purple-300">{swaps.upgrade.title}</div>
                    <p className="text-slate-600 dark:text-slate-300">{swaps.upgrade.description}</p>
                    <p className="font-black text-purple-700">Cost: {formatINR(swaps.upgrade.cost)} (+{formatINR(swaps.upgrade.extraCost)})</p>
                  </div>
                </div>
              );
            })()}

            <div className="text-right pt-2">
              <button
                onClick={() => setSelectedSwapItem(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
