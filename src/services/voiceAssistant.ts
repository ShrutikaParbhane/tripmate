import type { Language } from '../types';


export interface VoiceCommandResult {
  action: 'navigate' | 'create_trip' | 'filter_hospital' | 'read_itinerary' | 'add_expense' | 'unknown';
  targetScreen?: string;
  tripParams?: {
    destination: string;
    days: number;
    budget: number;
    travelerCount: number;
  };
  expenseParams?: {
    amount: number;
    title: string;
  };
  rawTranscript: string;
}

class VoiceAssistantService {
  private recognition: any = null;
  private isListening = false;
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    lang: Language,
    onResult: (transcript: string, isFinal: boolean) => void,
    onEnd: () => void,
    onError: (err: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech Recognition is not supported in this browser.');
      return;
    }

    const langCodeMap: Record<Language, string> = {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      es: 'es-ES',
      fr: 'fr-FR',
    };

    this.recognition.lang = langCodeMap[lang] || 'en-US';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Voice input error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
      onError('Could not start microphone');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public parseCommand(transcript: string): VoiceCommandResult {
    const lower = transcript.toLowerCase();

    // Check plan trip command
    if (lower.includes('plan') || lower.includes('create') || lower.includes('trip') || lower.includes('गोवा')) {
      const budgetMatch = lower.match(/(\d+)\s*(rupees|rs|inr|₹|हजार|रुपये)/) || lower.match(/under\s*(\d+)/);
      const daysMatch = lower.match(/(\d+)\s*(day|days|दिन)/);
      const countMatch = lower.match(/family of\s*(\d+)/) || lower.match(/(\d+)\s*(people|members|pax|लोग)/);

      const budget = budgetMatch ? parseInt(budgetMatch[1]) * (lower.includes('हजार') ? 1000 : 1) : 80000;
      const days = daysMatch ? parseInt(daysMatch[1]) : 4;
      const travelerCount = countMatch ? parseInt(countMatch[1]) : 5;

      return {
        action: 'create_trip',
        tripParams: {
          destination: lower.includes('goa') || lower.includes('गोवा') ? 'Goa' : 'Goa',
          days,
          budget,
          travelerCount,
        },
        rawTranscript: transcript
      };
    }

    // Check hospital stays command
    if (lower.includes('hospital') || lower.includes('अस्पताल') || lower.includes('रुग्णालय') || lower.includes('medical')) {
      return {
        action: 'filter_hospital',
        targetScreen: 'stays',
        rawTranscript: transcript
      };
    }

    // Check read itinerary command
    if (lower.includes('read') || lower.includes('itinerary') || lower.includes('today') || lower.includes('सुनाएं') || lower.includes('वाचा')) {
      return {
        action: 'read_itinerary',
        rawTranscript: transcript
      };
    }

    // Check navigation command
    if (lower.includes('budget') || lower.includes('expense')) {
      return { action: 'navigate', targetScreen: 'budget', rawTranscript: transcript };
    }
    if (lower.includes('explore') || lower.includes('places')) {
      return { action: 'navigate', targetScreen: 'explore', rawTranscript: transcript };
    }
    if (lower.includes('stays') || lower.includes('hotels')) {
      return { action: 'navigate', targetScreen: 'stays', rawTranscript: transcript };
    }
    if (lower.includes('dashboard') || lower.includes('home')) {
      return { action: 'navigate', targetScreen: 'dashboard', rawTranscript: transcript };
    }

    return { action: 'unknown', rawTranscript: transcript };
  }

  public speakText(text: string, lang: Language = 'en') {
    if (!this.synth) return;

    this.synth.cancel(); // Stop any existing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const langCodeMap: Record<Language, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      es: 'es-ES',
      fr: 'fr-FR',
    };
    utterance.lang = langCodeMap[lang] || 'en-US';
    utterance.rate = 0.95; // Clear natural pace

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const voiceAssistant = new VoiceAssistantService();
