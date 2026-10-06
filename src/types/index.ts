export type AgeGroup = 'child' | 'teen' | 'adult' | 'senior';

export type SpecialNeed = 'pregnancy' | 'wheelchair' | 'elderly' | 'infant' | 'medical';

export interface Traveler {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  specialNeeds: SpecialNeed[];
  trimester?: string;
  notes?: string;
}

export type GroupType = 'solo' | 'couple' | 'family' | 'bachelor' | 'seniors' | 'mixed';

export type BudgetPreference = 'saver' | 'balanced' | 'comfort';

export type PacePreference = 'relaxed' | 'balanced' | 'packed';

export type FoodPreference = 'veg' | 'nonveg' | 'jain' | 'vegan' | 'halal' | 'eggetarian';

export type Interest = 'beaches' | 'temples' | 'culture' | 'nature' | 'adventure' | 'nightlife' | 'shopping' | 'wellness';

export interface SuitabilityFlags {
  family: boolean;
  accessible: boolean;
  senior: boolean;
  pregnancy: boolean;
  party: boolean;
  pureVeg: boolean;
  jain: boolean;
  halal: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: 'beach' | 'temple' | 'culture' | 'nature' | 'adventure' | 'nightlife' | 'shopping' | 'wellness' | 'dining';
  description: string;
  location: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  approxCost: number;
  approxTimeMinutes: number;
  hospitalDistanceKm: number;
  suitability: SuitabilityFlags;
  tags: string[];
  image: string;
}

export interface Stay {
  id: string;
  name: string;
  type: 'resort' | 'hotel' | 'camp' | 'homestay' | 'villa';
  description: string;
  location: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  rating: number;
  hospitalDistanceKm: number;
  suitability: SuitabilityFlags;
  amenities: string[];
  image: string;
  planFitScore?: number;
  whyRecommended?: string;
}

export interface Activity {
  id: string;
  title: string;
  timeSlot: string;
  placeId?: string;
  location: string;
  cost: number;
  durationMinutes: number;
  suitabilityNote?: string;
  category: string;
  isRestBreak?: boolean;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  title: string;
  theme: string;
  travelTimeMinutes: number;
  restBreakCount: number;
  estimatedCost: number;
  planFitScore: number;
  whyThisDay: string;
  activities: Activity[];
}

export interface Booking {
  id: string;
  category: 'flight' | 'hotel' | 'activity' | 'transport';
  title: string;
  status: 'confirmed' | 'pending' | 'reminder';
  confirmationCode?: string;
  provider: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'stay' | 'food' | 'transport' | 'activities' | 'buffer';
  amount: number;
  paidBy: string;
  date: string;
}

export interface BudgetSplit {
  stay: number;
  food: number;
  transport: number;
  activities: number;
  buffer: number;
}

export interface TripProfile {
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  budgetPreference: BudgetPreference;
  groupType: GroupType;
  travelers: Traveler[];
  interests: Interest[];
  foodPreference: FoodPreference;
  allergies: string[];
  pace: PacePreference;
}

export interface Trip {
  id: string;
  title: string;
  profile: TripProfile;
  stays: Stay[];
  selectedStayId?: string;
  itinerary: ItineraryDay[];
  bookings: Booking[];
  expenses: Expense[];
  budgetSplit: BudgetSplit;
  overallFitScore: number;
  createdAt: string;
}

export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'es' | 'fr';
