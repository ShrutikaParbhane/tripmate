import { useState, useEffect } from 'react';

import type { Trip, Language, Place, Stay, ItineraryDay, Booking, Expense } from './types';
import { DEFAULT_DEMO_TRIP, SCENARIO_PRESETS } from './data/seedData';
import { generateGenAITrip } from './services/aiEngine';
import type { VoiceCommandResult } from './services/voiceAssistant';
import { voiceAssistant } from './services/voiceAssistant';
import { TextSizeProvider } from './components/common/TextSizeContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { VoiceModal } from './components/common/VoiceModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { HelpTourModal } from './components/common/HelpTourModal';

// Views
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { CreateTripView } from './views/CreateTripView';
import { ExploreView } from './views/ExploreView';
import { StaysView } from './views/StaysView';
import { ItineraryView } from './views/ItineraryView';
import { BookingsView } from './views/BookingsView';
import { BudgetView } from './views/BudgetView';
import { SummaryShareView } from './views/SummaryShareView';

export function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // default true for instant live demo experience
  const [userEmail, setUserEmail] = useState('demo.traveler@tripmate.ai');
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [currentTrip, setCurrentTrip] = useState<Trip>(DEFAULT_DEMO_TRIP);
  const [searchQuery, setSearchQuery] = useState('');

  // Language & Theme State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('tripmate_lang') as Language) || 'en';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('tripmate_theme') === 'dark';
  });

  // Modal States
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('tripmate_onboarding_done');
  });

  // Theme Toggle Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tripmate_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tripmate_theme', 'light');
    }
  }, [isDark]);

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('tripmate_lang', newLang);
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setActiveScreen('dashboard');
  };

  const handleTryDemo = () => {
    setUserEmail('demo.family@tripmate.ai');
    setCurrentTrip(DEFAULT_DEMO_TRIP);
    setIsLoggedIn(true);
    setActiveScreen('dashboard');
  };

  const handleSelectScenario = async (scenarioId: string) => {
    const sc = SCENARIO_PRESETS.find(s => s.id === scenarioId);
    if (sc) {
      const generated = await generateGenAITrip(sc.profile, lang);
      setCurrentTrip(generated);
      setActiveScreen('dashboard');
    }
  };

  // Voice Command Execution Handler
  const handleExecuteVoiceCommand = async (res: VoiceCommandResult) => {
    if (res.action === 'navigate' && res.targetScreen) {
      setActiveScreen(res.targetScreen);
    } else if (res.action === 'filter_hospital') {
      setActiveScreen('stays');
    } else if (res.action === 'read_itinerary') {
      setActiveScreen('itinerary');
      const textToRead = `Today's itinerary for ${currentTrip.title}: ${currentTrip.itinerary[0]?.activities.map(a => a.title).join(', ')}`;
      voiceAssistant.speakText(textToRead, lang);
    } else if (res.action === 'create_trip' && res.tripParams) {
      setActiveScreen('create_trip');
    }
  };

  // State Mutators for Child Views
  const handleAddPlaceToTrip = (place: Place) => {
    const newTrip = { ...currentTrip };
    const firstDay = newTrip.itinerary[0];
    if (firstDay) {
      firstDay.activities.push({
        id: `user-act-${Date.now()}`,
        title: place.name,
        timeSlot: '03:00 PM',
        placeId: place.id,
        location: place.location,
        cost: place.approxCost,
        durationMinutes: place.approxTimeMinutes,
        suitabilityNote: place.tags.join(' • '),
        category: place.category
      });
    }
    setCurrentTrip(newTrip);
  };

  const handleSelectStay = (stay: Stay) => {
    setCurrentTrip({
      ...currentTrip,
      selectedStayId: stay.id,
      stays: [stay, ...currentTrip.stays.filter(s => s.id !== stay.id)]
    });
  };

  const handleUpdateItinerary = (updatedDays: ItineraryDay[]) => {
    setCurrentTrip({
      ...currentTrip,
      itinerary: updatedDays
    });
  };

  const handleAddBooking = (newBooking: Booking) => {
    setCurrentTrip({
      ...currentTrip,
      bookings: [newBooking, ...currentTrip.bookings]
    });
  };

  const handleAddExpense = (newExpense: Expense) => {
    setCurrentTrip({
      ...currentTrip,
      expenses: [newExpense, ...currentTrip.expenses]
    });
  };

  if (!isLoggedIn) {
    return (
      <AuthView
        onLogin={handleLogin}
        onTryDemo={handleTryDemo}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header Bar */}
      <Header
        currentLang={lang}
        onSelectLang={handleSelectLang}
        isDark={isDark}
        onToggleDark={() => setIsDark(!isDark)}
        onOpenVoiceModal={() => setIsVoiceOpen(true)}
        onOpenHelpModal={() => setIsHelpOpen(true)}
        userEmail={userEmail}
        onLogout={() => setIsLoggedIn(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeScreen={activeScreen}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Desktop Sidebar Navigation */}
        <Sidebar
          activeScreen={activeScreen}
          onNavigate={setActiveScreen}
          lang={lang}
        />

        {/* Dynamic Screen View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activeScreen === 'dashboard' && (
            <DashboardView
              currentTrip={currentTrip}
              onNavigate={setActiveScreen}
              onSelectScenario={handleSelectScenario}
              lang={lang}
            />
          )}

          {activeScreen === 'create_trip' && (
            <CreateTripView
              onTripGenerated={(newTrip) => {
                setCurrentTrip(newTrip);
                setActiveScreen('dashboard');
              }}
              lang={lang}
              onOpenVoice={() => setIsVoiceOpen(true)}
            />
          )}

          {activeScreen === 'explore' && (
            <ExploreView
              onAddPlaceToTrip={handleAddPlaceToTrip}
              lang={lang}
            />
          )}

          {activeScreen === 'stays' && (
            <StaysView
              profile={currentTrip.profile}
              selectedStayId={currentTrip.selectedStayId}
              onSelectStay={handleSelectStay}
              lang={lang}
            />
          )}

          {activeScreen === 'itinerary' && (
            <ItineraryView
              trip={currentTrip}
              onUpdateItinerary={handleUpdateItinerary}
              lang={lang}
            />
          )}

          {activeScreen === 'bookings' && (
            <BookingsView
              bookings={currentTrip.bookings}
              onAddBooking={handleAddBooking}
              lang={lang}
            />
          )}

          {activeScreen === 'budget' && (
            <BudgetView
              trip={currentTrip}
              onAddExpense={handleAddExpense}
              lang={lang}
            />
          )}

          {activeScreen === 'summary' && (
            <SummaryShareView
              trip={currentTrip}
              lang={lang}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation Tab Bar */}
      <MobileNav
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        lang={lang}
      />

      {/* Modals */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        lang={lang}
        onExecuteCommand={handleExecuteVoiceCommand}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onFinish={() => {
          setIsOnboardingOpen(false);
          localStorage.setItem('tripmate_onboarding_done', 'true');
        }}
        lang={lang}
      />

      <HelpTourModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        lang={lang}
      />

    </div>
  );
}

export default function App() {
  return (
    <TextSizeProvider>
      <AppContent />
    </TextSizeProvider>
  );
}
