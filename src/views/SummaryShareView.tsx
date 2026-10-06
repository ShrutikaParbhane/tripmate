import React, { useState } from 'react';
import type { Trip, Language } from '../types';
import { TRANSLATIONS, formatINR, formatDate } from '../services/i18n';
import { Share2, Printer, Download, UserPlus, Copy, Check, Users, Compass } from 'lucide-react';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';



interface SummaryShareViewProps {
  trip: Trip;
  lang: Language;
}

export const SummaryShareView: React.FC<SummaryShareViewProps> = ({ trip, lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [copiedLink, setCopiedLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [invitedCompanions, setInvitedCompanions] = useState<{ email: string; role: string }[]>([
    { email: 'priya.sharma@example.com', role: 'Editor' },
    { email: 'amit.sharma@example.com', role: 'Viewer' }
  ]);

  const shareableUrl = `${window.location.origin}/trip/${trip.id}?invite=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInvitedCompanions([...invitedCompanions, { email: inviteEmail, role: inviteRole === 'editor' ? 'Editor' : 'Viewer' }]);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`TripMate Itinerary: ${trip.title}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Destination: ${trip.profile.destination}`, 14, 30);
    doc.text(`Dates: ${trip.profile.startDate} to ${trip.profile.endDate}`, 14, 38);
    doc.text(`Total Budget: INR ${trip.profile.totalBudget}`, 14, 46);
    doc.text(`Travelers (${trip.profile.travelers.length}): ${trip.profile.travelers.map(t => t.name).join(', ')}`, 14, 54);

    let y = 66;
    trip.itinerary.forEach((day) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.text(`Day ${day.dayNumber}: ${day.title}`, 14, y);
      y += 8;
      doc.setFontSize(10);
      day.activities.forEach((act) => {
        doc.text(`• ${act.timeSlot} - ${act.title} (${act.location})`, 18, y);
        y += 6;
      });
      y += 4;
    });

    doc.save(`${trip.profile.destination}_TripMate_Itinerary.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* Action Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Share2 className="w-3.5 h-3.5" /> {t.summaryShare}
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t.tripOverview}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Invite friends/family, copy shareable link, or export clean PDF for printing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" /> {t.inviteCompanions}
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> {t.exportPDF}
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> {t.printPlan}
          </button>
        </div>
      </div>

      {/* Share Link Banner */}
      <div className="bg-teal-50 dark:bg-teal-950/60 p-4 rounded-2xl border border-teal-200 dark:border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200 font-bold">
          <Share2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{t.shareableLink}:</span>
          <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-teal-300 dark:border-teal-700 text-[11px] truncate max-w-xs">
            {shareableUrl}
          </code>
        </div>

        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-teal-600 font-extrabold text-xs rounded-xl flex items-center gap-1.5 hover:bg-slate-800 transition shrink-0"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copiedLink ? t.copied : t.copyShareLink}
        </button>
      </div>

      {/* Main Printable Trip Document Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-md space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-teal-600 uppercase tracking-widest mb-1">
              <Compass className="w-4 h-4" /> TripMate Certified Plan
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              {trip.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Destination: <strong>{trip.profile.destination}</strong> • Dates: <strong>{formatDate(trip.profile.startDate, lang)} – {formatDate(trip.profile.endDate, lang)}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black text-xs rounded-xl border border-teal-200 dark:border-teal-800">
              Overall Fit Score: {trip.overallFitScore}%
            </span>
            <p className="text-[11px] font-bold text-slate-400 mt-1.5">
              Hard Budget Cap: {formatINR(trip.profile.totalBudget)}
            </p>
          </div>
        </div>

        {/* Travelers Summary */}
        <div>
          <h3 className="text-xs font-extrabold uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" /> Confirmed Travelers ({trip.profile.travelers.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trip.profile.travelers.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="font-bold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-[11px] text-slate-500 capitalize">{t.ageGroup}</div>
                {t.specialNeeds.length > 0 && (
                  <div className="text-[10px] text-pink-600 dark:text-pink-400 font-bold mt-1">
                    Special: {t.specialNeeds.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary Schedule Overview */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Day-by-Day Complete Itinerary
          </h3>

          <div className="space-y-4">
            {trip.itinerary.map((d) => (
              <div key={d.dayNumber} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="text-teal-600 dark:text-teal-400 font-extrabold">Day {d.dayNumber}: {d.title}</span>
                  <span className="text-slate-400 font-normal">Est. Spend: {formatINR(d.estimatedCost)}</span>
                </div>
                <div className="space-y-1 text-xs">
                  {d.activities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span>• <strong>{a.timeSlot}</strong> - {a.title} ({a.location})</span>
                      {a.cost > 0 && <span>{formatINR(a.cost)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invited Companions List */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-extrabold uppercase text-slate-400 mb-2 tracking-wider">
            Invited Companions & Roles
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {invitedCompanions.map((c, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium">
                {c.email} <strong className="text-teal-600">({c.role})</strong>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Trip Companion</h3>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Companion Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                  placeholder="companion@example.com"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Permission Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-xl font-bold"
                >
                  <option value="viewer">Viewer (Can view itinerary & details)</option>
                  <option value="editor">Editor (Can edit activities & expenses)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-xl"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
