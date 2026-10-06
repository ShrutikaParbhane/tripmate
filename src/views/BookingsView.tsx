import React, { useState } from 'react';
import type { Booking, Language } from '../types';
import { TRANSLATIONS, formatINR } from '../services/i18n';
import { TicketCheck, Plus, Building2, Car, Plane, Activity as ActivityIcon } from 'lucide-react';



interface BookingsViewProps {
  bookings: Booking[];
  onAddBooking: (newBooking: Booking) => void;
  lang: Language;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onAddBooking,
  lang
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'flight' | 'hotel' | 'activity' | 'transport'>('hotel');
  const [provider, setProvider] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [date, setDate] = useState('2026-12-12');
  const [amount, setAmount] = useState(3500);

  const filteredBookings = filterCategory === 'all'
    ? bookings
    : bookings.filter(b => b.category === filterCategory);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newB: Booking = {
      id: `bk-${Date.now()}`,
      title,
      category,
      provider: provider || 'Direct Provider',
      confirmationCode: confirmationCode || `CONF-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      amount,
      status: 'confirmed',
      notes: 'Added via TripMate manager'
    };

    onAddBooking(newB);
    setShowAddModal(false);
    setTitle('');
  };

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'flight': return <Plane className="w-4 h-4 text-blue-500" />;
      case 'hotel': return <Building2 className="w-4 h-4 text-teal-500" />;
      case 'transport': return <Car className="w-4 h-4 text-purple-500" />;
      default: return <ActivityIcon className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <TicketCheck className="w-3.5 h-3.5" /> {t.bookings} Manager
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.confirmedReservations}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of flights, hotels, cabs, activities, and check-in reminders.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> {t.addReservation}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'hotel', 'transport', 'activity', 'flight'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition ${
              filterCategory === cat
                ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {cat === 'all' ? t.allBookings : cat}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBookings.map((bk) => (
          <div
            key={bk.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold uppercase text-slate-800 dark:text-slate-200">
                  {categoryIcon(bk.category)} {bk.category}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                  bk.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  ✓ {bk.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {bk.title}
              </h3>

              <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p><strong>Provider:</strong> {bk.provider}</p>
                <p><strong>Confirmation Code:</strong> <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold text-teal-600 dark:text-teal-400">{bk.confirmationCode}</code></p>
                <p><strong>Dates:</strong> {bk.date}</p>
                {bk.notes && <p className="text-[11px] text-slate-400 italic">Note: {bk.notes}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-extrabold">
              <span className="text-slate-400">{t.totalPaid}:</span>
              <span className="text-sm text-slate-900 dark:text-white">{formatINR(bk.amount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Booking Details</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                  placeholder="e.g. Indigo Flight 6E-241"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                    <option value="activity">Activity</option>
                    <option value="flight">Flight</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Provider</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    placeholder="e.g. Taj Hotels"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Confirmation Code</label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    placeholder="e.g. TAJ-982"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                />
              </div>


              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
