import type { TripProfile, Trip, Stay, ItineraryDay, Activity, BudgetSplit, Language } from '../types';
import { SEED_PLACES, SEED_STAYS } from '../data/seedData';

/**
 * Calculates suitability & plan fit score (0-100) for a Stay based on Trip Profile and Language
 */
export function scoreStayForProfile(stay: Stay, profile: TripProfile, lang: Language = 'en'): { score: number; whyRecommended: string } {
  let score = 85;
  const reasons: string[] = [];

  const hasPregnant = profile.travelers.some(t => t.specialNeeds.includes('pregnancy'));
  const hasWheelchair = profile.travelers.some(t => t.specialNeeds.includes('wheelchair'));
  const hasSenior = profile.travelers.some(t => t.specialNeeds.includes('elderly') || t.ageGroup === 'senior');
  const hasKids = profile.travelers.some(t => t.ageGroup === 'child' || t.specialNeeds.includes('infant'));
  const isBachelor = profile.groupType === 'bachelor';

  // Medical Proximity Priority
  if (hasPregnant) {
    if (stay.hospitalDistanceKm <= 1.5) {
      score += 12;
      if (lang === 'hi') reasons.push(`आपातकालीन अस्पताल सुरक्षा: अस्पताल से केवल ${stay.hospitalDistanceKm} किमी दूर।`);
      else if (lang === 'mr') reasons.push(`महत्त्वाची रुग्णालय सुरक्षा: आपत्कालीन केंद्रापासून फक्त ${stay.hospitalDistanceKm} किमी.`);
      else reasons.push(`Crucial hospital safety: Only ${stay.hospitalDistanceKm} km from emergency medical center.`);
    } else if (stay.hospitalDistanceKm > 4.0) {
      score -= 20;
    }
  }

  // Accessibility Priority
  if (hasWheelchair || hasSenior) {
    if (stay.suitability.accessible && stay.suitability.senior) {
      score += 10;
      if (lang === 'hi') reasons.push('सीढ़ी-रहित रैंप प्रवेश, लिफ्ट और भूतल कमरे उपलब्ध।');
      else if (lang === 'mr') reasons.push('पायऱ्यांशिवाय रॅम्प प्रवेश, लिफ्ट आणि तळमजल्यावरील खोल्या उपलब्ध.');
      else reasons.push('Features step-free ramp entrances, elevators, and ground-floor access.');
    } else {
      score -= 25;
    }
  }

  // Family Priority
  if (hasKids) {
    if (stay.suitability.family) {
      score += 8;
      if (lang === 'hi') reasons.push('बच्चों के लिए स्विमिंग पूल, सुरक्षित मैदान और शिशु भोजन विकल्प।');
      else if (lang === 'mr') reasons.push('मुलांसाठी स्विमिंग पूल, सुरक्षित परिसर आणि बालकांसाठी अन्न पर्याय.');
      else reasons.push('Has kid-friendly swimming pool, safe grounds, and baby food options.');
    }
  }

  // Bachelor Priority
  if (isBachelor) {
    if (stay.suitability.party) {
      score += 15;
      if (lang === 'hi') reasons.push('समुद्र तट पर शानदार पार्टी का माहौल और नाइटलाइफ़ सुविधा।');
      else if (lang === 'mr') reasons.push('बीचवरील उत्कृष्ट पार्टीचे वातावरण आणि नाईटलाईफची सोय.');
      else reasons.push('Vibrant beachfront social vibe with group cabanas and nightlife access.');
    } else {
      score -= 10;
    }
  }

  // Diet Matching
  if (profile.foodPreference === 'veg' || profile.foodPreference === 'jain') {
    if (stay.suitability.pureVeg) {
      score += 10;
      if (lang === 'hi') reasons.push('100% शुद्ध शाकाहारी रसोईघर और जैन भोजन व्यवस्था।');
      else if (lang === 'mr') reasons.push('१००% शुद्ध शाकाहारी स्वयंपाकघर आणि जैन जेवणाची उत्तम सोय.');
      else reasons.push('100% Pure Veg kitchen ensuring strict kitchen hygiene & Jain customization.');
    }
  }

  // Price compatibility
  const perNightBudget = (profile.totalBudget * 0.4) / 4;
  if (stay.pricePerNight > perNightBudget * 1.4) {
    score -= 15;
    if (lang === 'hi') reasons.push('प्रति-रात्रि बजट सीमा से थोड़ा अधिक।');
    else if (lang === 'mr') reasons.push('प्रति-रात्र बजेट मर्यादेपेक्षा थोडे जास्त.');
    else reasons.push('Slightly higher than ideal per-night budget allocation.');
  }

  const finalScore = Math.min(99, Math.max(50, score));
  const defaultReason = lang === 'hi'
    ? `${stay.name} आपके ${profile.travelers.length} यात्रियों के समूह के लिए एकदम सही है।`
    : lang === 'mr'
    ? `${stay.name} तुमच्या ${profile.travelers.length} प्रवाशांच्या गटासाठी अतिशय योग्य आहे.`
    : `${stay.name} fits your group of ${profile.travelers.length} with ${stay.amenities.slice(0, 2).join(', ')}.`;

  return {
    score: finalScore,
    whyRecommended: reasons.length > 0 ? reasons.join(' ') : defaultReason,
  };
}

/**
 * Calculates budget split recommendation based on total budget cap in ₹
 */
export function calculateBudgetSplit(totalBudget: number, preference: 'saver' | 'balanced' | 'comfort'): BudgetSplit {
  if (preference === 'saver') {
    return {
      stay: Math.round(totalBudget * 0.32),
      food: Math.round(totalBudget * 0.28),
      transport: Math.round(totalBudget * 0.18),
      activities: Math.round(totalBudget * 0.12),
      buffer: Math.round(totalBudget * 0.10)
    };
  } else if (preference === 'comfort') {
    return {
      stay: Math.round(totalBudget * 0.45),
      food: Math.round(totalBudget * 0.22),
      transport: Math.round(totalBudget * 0.15),
      activities: Math.round(totalBudget * 0.10),
      buffer: Math.round(totalBudget * 0.08)
    };
  }
  return {
    stay: Math.round(totalBudget * 0.40),
    food: Math.round(totalBudget * 0.25),
    transport: Math.round(totalBudget * 0.15),
    activities: Math.round(totalBudget * 0.12),
    buffer: Math.round(totalBudget * 0.08)
  };
}

/**
 * Generates a complete GenAI trip plan draft with structured JSON output and why-this explanations in selected language
 */
export async function generateGenAITrip(profile: TripProfile, lang: Language = 'en'): Promise<Trip> {
  // Simulate AI computation latency (700ms) for realistic GenAI experience
  await new Promise(resolve => setTimeout(resolve, 700));

  const hasPregnant = profile.travelers.some(t => t.specialNeeds.includes('pregnancy'));
  const hasWheelchair = profile.travelers.some(t => t.specialNeeds.includes('wheelchair'));
  const hasSenior = profile.travelers.some(t => t.specialNeeds.includes('elderly') || t.ageGroup === 'senior');
  const hasKids = profile.travelers.some(t => t.ageGroup === 'child' || t.specialNeeds.includes('infant'));
  const isBachelor = profile.groupType === 'bachelor';

  // 1. Filter and Rank Stays
  const rankedStays = SEED_STAYS.map(stay => {
    const { score, whyRecommended } = scoreStayForProfile(stay, profile, lang);
    return {
      ...stay,
      planFitScore: score,
      whyRecommended,
    };
  }).sort((a, b) => (b.planFitScore || 0) - (a.planFitScore || 0));

  const selectedStay = rankedStays[0];

  // 2. Filter Places by restrictive needs first
  let eligiblePlaces = SEED_PLACES.filter(place => {
    if (hasPregnant && !place.suitability.pregnancy) return false;
    if (hasWheelchair && !place.suitability.accessible) return false;
    if (hasSenior && !place.suitability.senior && place.category === 'adventure') return false;
    if (profile.foodPreference === 'veg' && place.category === 'dining' && !place.suitability.pureVeg) return false;
    return true;
  });

  if (eligiblePlaces.length < 8) {
    eligiblePlaces = SEED_PLACES;
  }

  // 3. Build Day-by-Day Itinerary
  const daysCount = 4;
  const itineraryDays: ItineraryDay[] = [];

  const themesEn = [
    { title: 'Arrival & Gentle Exploration', theme: 'Low Travel & Orientation' },
    { title: 'Cultural Heritage & Spiritual Peace', theme: 'Temples, Culture & Quiet Dining' },
    { title: 'Coastal Vistas & Relaxing Sunset', theme: 'Beach Promenade & River Breeze' },
    { title: 'Local Flavors & Farewell Celebration', theme: 'Shopping, Crafts & Special Feast' }
  ];

  const themesHi = [
    { title: 'आगमन और सौम्य अन्वेषण', theme: 'कम यात्रा और आराम' },
    { title: 'सांस्कृतिक विरासत और आध्यात्मिक शांति', theme: 'मंदिर, संस्कृति और शांत भोजन' },
    { title: 'तटीय दृश्य और आरामदायक सूर्यास्त', theme: 'समुद्र तट और नदी की हवा' },
    { title: 'स्थानीय स्वाद और विदाई समारोह', theme: 'खरीदारी और विशेष दावत' }
  ];

  const themesMr = [
    { title: 'आगमन आणि शांत भ्रमंती', theme: 'कमी प्रवास आणि आराम' },
    { title: 'सांस्कृतिक वारसा आणि अध्यात्मिक शांतता', theme: 'मंदिरे, संस्कृती आणि शांत जेवण' },
    { title: 'किनारपट्टीचे दृश्य आणि आल्हाददायक सूर्यास्त', theme: 'बीच आणि नदीचे वारे' },
    { title: 'स्थानिक चव आणि निरोप समारंभ', theme: 'खरेदी आणि विशेष मेजवानी' }
  ];

  const themes = lang === 'hi' ? themesHi : lang === 'mr' ? themesMr : themesEn;

  for (let d = 0; d < daysCount; d++) {
    const dayNumber = d + 1;
    const theme = themes[d % themes.length];
    
    const dayPlaces = eligiblePlaces.slice(d * 3, d * 3 + 3);
    const activities: Activity[] = [];

    // Morning activity
    if (dayPlaces[0]) {
      activities.push({
        id: `gen-act-${dayNumber}-1`,
        title: lang === 'hi' ? `${dayPlaces[0].name} दर्शन / भ्रमण` : lang === 'mr' ? `${dayPlaces[0].name} भेट` : `${dayPlaces[0].name} Visit`,
        timeSlot: '09:30 AM',
        placeId: dayPlaces[0].id,
        location: dayPlaces[0].location,
        cost: dayPlaces[0].approxCost * Math.max(1, profile.travelers.length * 0.8),
        durationMinutes: dayPlaces[0].approxTimeMinutes,
        suitabilityNote: dayPlaces[0].tags.join(' • '),
        category: dayPlaces[0].category
      });
    }

    // Midday Mandatory Rest Break
    if (hasPregnant || hasSenior || hasKids || profile.pace === 'relaxed') {
      activities.push({
        id: `gen-act-${dayNumber}-rest`,
        title: lang === 'hi' ? 'दोपहर का विश्राम और जलपान विराम' : lang === 'mr' ? 'दुपारची विश्रांती आणि अल्पोपहार' : 'Midday Rest & Refreshment Break',
        timeSlot: '01:00 PM',
        location: lang === 'hi' ? 'होटल / शांत लाउंज' : lang === 'mr' ? 'हॉटेल / शांत लाउंज' : 'Stay / Shaded Lounge',
        cost: 0,
        durationMinutes: 90,
        suitabilityNote: hasPregnant
          ? lang === 'hi' ? 'गर्भवती महिला के लिए अनिवार्य विश्राम और जलयोजन।' : lang === 'mr' ? 'गरोदर महिलांसाठी आवश्यक विश्रांती.' : 'Mandatory rest break & hydration protocol for expecting mother.'
          : lang === 'hi' ? 'वरिष्ठ नागरिकों और बच्चों के लिए आरामदायक गति।' : lang === 'mr' ? 'ज्येष्ठ नागरिक आणि मुलांसाठी आरामदायी वेळ.' : 'Relaxed pacing to prevent travel fatigue for elderly & children.',
        category: 'wellness',
        isRestBreak: true
      });
    }

    // Afternoon activity
    if (dayPlaces[1]) {
      activities.push({
        id: `gen-act-${dayNumber}-2`,
        title: lang === 'hi' ? `${dayPlaces[1].name} दौरा` : lang === 'mr' ? `${dayPlaces[1].name} सहल` : `${dayPlaces[1].name} Tour`,
        timeSlot: '04:30 PM',
        placeId: dayPlaces[1].id,
        location: dayPlaces[1].location,
        cost: dayPlaces[1].approxCost * Math.max(1, profile.travelers.length * 0.8),
        durationMinutes: dayPlaces[1].approxTimeMinutes,
        suitabilityNote: dayPlaces[1].tags.join(' • '),
        category: dayPlaces[1].category
      });
    }

    // Dinner Activity
    activities.push({
      id: `gen-act-${dayNumber}-dinner`,
      title: lang === 'hi' ? `${profile.foodPreference.toUpperCase()} विशेष रात्रिभोजन` : lang === 'mr' ? `${profile.foodPreference.toUpperCase()} विशेष रात्रीचे जेवण` : `${profile.foodPreference.toUpperCase()} Dinner Experience`,
      timeSlot: '07:30 PM',
      location: `${profile.destination} Center`,
      cost: 400 * profile.travelers.length,
      durationMinutes: 75,
      suitabilityNote: lang === 'hi' ? `${profile.foodPreference} भोजन और एलर्जी सुरक्षा सुनिश्चित की गई।` : lang === 'mr' ? `${profile.foodPreference} जेवण आणि ॲलर्जी सुरक्षितता सुनिश्चित केली.` : `Badged for ${profile.foodPreference} preference and allergy safety.`,
      category: 'dining'
    });

    const travelTimeMinutes = isBachelor ? 75 : hasSenior || hasPregnant ? 35 : 45;
    const restBreakCount = activities.filter(a => a.isRestBreak).length + 2;
    const estimatedCost = activities.reduce((sum, act) => sum + act.cost, 0);

    let whyThisDay = lang === 'hi' ? `${profile.groupType} समूह के लिए विशेष रूप से योजनाबद्ध।` : lang === 'mr' ? `${profile.groupType} गटासाठी विशेष नियोजन.` : `Planned specifically for ${profile.groupType} travelers.`;
    if (hasPregnant) {
      whyThisDay = lang === 'hi'
        ? `कम यात्रा समय (<${travelTimeMinutes} मिनट), अस्पताल के पास, और दोपहर में विश्राम विराम की व्यवस्था।`
        : lang === 'mr'
        ? `कमी प्रवासाची वेळ (<${travelTimeMinutes} मिनिटे), रुग्णालयाजवळ आणि दुपारच्या विश्रांतीची सोय.`
        : `Low travel hop day (<${travelTimeMinutes} mins travel), close to medical center, with dedicated afternoon rest break.`;
    } else if (hasSenior) {
      whyThisDay = lang === 'hi'
        ? `मंदिर और समतल रास्तों वाले स्थान पहले चुने गए हैं, बिना किसी कठिन चढ़ाई के।`
        : lang === 'mr'
        ? `मंदिरे आणि सोप्या पायी चालण्याच्या जागा प्रथम निवडल्या आहेत, कोणतीही कठीण चढण नाही.`
        : `Temples & gentle walking sites selected first, with zero steep climbs and ground-level dining.`;
    }

    itineraryDays.push({
      dayNumber,
      date: `2026-12-${12 + d}`,
      title: theme.title,
      theme: theme.theme,
      travelTimeMinutes,
      restBreakCount,
      estimatedCost,
      planFitScore: Math.min(99, 92 + (d % 4)),
      whyThisDay,
      activities
    });
  }

  const budgetSplit = calculateBudgetSplit(profile.totalBudget, profile.budgetPreference);
  const tripTitle = lang === 'hi'
    ? `${profile.destination} कस्टम AI यात्रा (${profile.travelers.length} यात्री)`
    : lang === 'mr'
    ? `${profile.destination} कस्टम AI ट्रिप (${profile.travelers.length} प्रवासी)`
    : `${profile.destination} Custom AI Itinerary (${profile.travelers.length} Travelers)`;

  return {
    id: `gen-trip-${Date.now()}`,
    title: tripTitle,
    profile,
    stays: rankedStays.slice(0, 4),
    selectedStayId: selectedStay.id,
    itinerary: itineraryDays,
    bookings: [
      {
        id: `bk-stay-1`,
        category: 'hotel',
        title: `${selectedStay.name} (${daysCount} ${lang === 'hi' ? 'रातें' : lang === 'mr' ? 'रात्री' : 'Nights'})`,
        status: 'confirmed',
        confirmationCode: `AI-${Math.floor(10000 + Math.random() * 90000)}`,
        provider: selectedStay.name,
        date: `${profile.startDate} - ${profile.endDate}`,
        amount: selectedStay.pricePerNight * daysCount,
        notes: hasSenior ? (lang === 'hi' ? 'भूतल और लिफ्ट की सुविधा सुनिश्चित।' : 'तळमजला आणि लिफ्ट सोय निश्चित.') : 'Family suite reserved.'
      },
      {
        id: `bk-trans-1`,
        category: 'transport',
        title: `${lang === 'hi' ? 'निजी एसी वाहन' : lang === 'mr' ? 'खाजगी एसी वाहन' : 'Private AC Vehicle Transfer'} (${daysCount} Days)`,
        status: 'confirmed',
        confirmationCode: `CAB-${Math.floor(1000 + Math.random() * 9000)}`,
        provider: 'TripMate Certified Transport',
        date: `${profile.startDate} - ${profile.endDate}`,
        amount: budgetSplit.transport,
        notes: hasWheelchair ? 'Wheelchair foldable trunk access reserved.' : 'AC Comfort ride'
      }
    ],
    expenses: [
      {
        id: `exp-gen-1`,
        title: `${selectedStay.name} Booking`,
        category: 'stay',
        amount: selectedStay.pricePerNight * daysCount,
        paidBy: profile.travelers[0]?.name || 'Traveler 1',
        date: profile.startDate
      }
    ],
    budgetSplit,
    overallFitScore: 97,
    createdAt: new Date().toISOString()
  };
}


/**
 * Provides Cheaper / Upgrade Swaps for an itinerary activity or stay
 */
export function getSwapSuggestions(itemCost: number, category: string) {
  return {
    cheaper: {
      title: `Saver Alternative (${category})`,
      cost: Math.round(itemCost * 0.6),
      savings: Math.round(itemCost * 0.4),
      description: 'Budget-friendly local option with clean amenities and standard ratings.'
    },
    upgrade: {
      title: `Comfort Upgrade (${category})`,
      cost: Math.round(itemCost * 1.5),
      extraCost: Math.round(itemCost * 0.5),
      description: 'Premium upgrade featuring VIP express entry, ocean view seating, or luxury car pickup.'
    }
  };
}
