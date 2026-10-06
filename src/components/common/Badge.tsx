import React from 'react';
import type { SuitabilityFlags } from '../../types';
import { ShieldAlert, Accessibility, Users, HeartHandshake, Sparkles, Utensils, Hospital, Award } from 'lucide-react';


interface SuitabilityBadgesProps {
  suitability: SuitabilityFlags;
  hospitalDistanceKm?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const SuitabilityBadges: React.FC<SuitabilityBadgesProps> = ({
  suitability,
  hospitalDistanceKm,
  className = '',
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const badgeBase = `inline-flex items-center gap-1 rounded-full font-medium transition-colors ${
    isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  }`;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {hospitalDistanceKm !== undefined && hospitalDistanceKm <= 2.0 && (
        <span className={`${badgeBase} bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800`} title="Emergency Hospital within 2km">
          <Hospital className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Near Hospital ({hospitalDistanceKm}km)
        </span>
      )}

      {suitability.pregnancy && (
        <span className={`${badgeBase} bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-800`}>
          <ShieldAlert className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Pregnancy Safe
        </span>
      )}

      {suitability.accessible && (
        <span className={`${badgeBase} bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800`}>
          <Accessibility className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Step-Free Accessible
        </span>
      )}

      {suitability.senior && (
        <span className={`${badgeBase} bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800`}>
          <HeartHandshake className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Senior Friendly
        </span>
      )}

      {suitability.family && (
        <span className={`${badgeBase} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800`}>
          <Users className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Family Friendly
        </span>
      )}

      {suitability.pureVeg && (
        <span className={`${badgeBase} bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800`}>
          <Utensils className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Pure Veg
        </span>
      )}

      {suitability.party && (
        <span className={`${badgeBase} bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800`}>
          <Sparkles className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          Party & Nightlife
        </span>
      )}
    </div>
  );
};

export const PlanFitScoreBadge: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ score, size = 'md' }) => {
  let color = 'bg-teal-500 text-white dark:bg-teal-600';
  if (score >= 95) color = 'bg-emerald-600 text-white';
  else if (score >= 85) color = 'bg-teal-600 text-white';
  else color = 'bg-amber-600 text-white';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-sm font-extrabold'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-md shadow-sm ${color} ${sizeClasses[size]}`}>
      <Award className="w-3.5 h-3.5" />
      Fit Score {score}%
    </span>
  );
};
