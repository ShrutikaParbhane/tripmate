import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import type { VoiceCommandResult } from '../../services/voiceAssistant';
import { voiceAssistant } from '../../services/voiceAssistant';
import type { Language } from '../../types';
import { TRANSLATIONS } from '../../services/i18n';


interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onExecuteCommand: (result: VoiceCommandResult) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onExecuteCommand
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<VoiceCommandResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    if (isOpen) {
      handleStartListening();
    } else {
      voiceAssistant.stopListening();
      setIsListening(false);
    }
  }, [isOpen]);

  const handleStartListening = () => {
    setErrorMsg('');
    setTranscript('');
    setParsedResult(null);
    setIsListening(true);

    voiceAssistant.startListening(
      lang,
      (text, isFinal) => {
        setTranscript(text);
        if (isFinal) {
          const res = voiceAssistant.parseCommand(text);
          setParsedResult(res);
          setIsListening(false);
        }
      },
      () => setIsListening(false),
      (err) => {
        setErrorMsg(err);
        setIsListening(false);
      }
    );
  };

  const handleStop = () => {
    voiceAssistant.stopListening();
    setIsListening(false);
    if (transcript) {
      const res = voiceAssistant.parseCommand(transcript);
      setParsedResult(res);
    }
  };

  const handleConfirm = () => {
    if (parsedResult) {
      onExecuteCommand(parsedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-3 relative">
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-teal-400/30 animate-ping" />
            )}
            {isListening ? <Mic className="w-8 h-8 text-teal-600" /> : <MicOff className="w-8 h-8 text-slate-400" />}
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t.voiceAssistant}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.voiceCommandPrompt}
          </p>
        </div>

        {/* Live Transcript Display */}
        <div className="min-h-24 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-center mb-4">
          {transcript ? (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">
              "{transcript}"
            </p>
          ) : isListening ? (
            <p className="text-xs text-teal-600 dark:text-teal-400 animate-pulse font-medium">
              Listening to your voice... Speak now!
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Press microphone below to start speaking
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Command Action Summary */}
        {parsedResult && parsedResult.action !== 'unknown' && (
          <div className="mb-6 p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 rounded-xl text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 mb-1">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Understood Action:
            </div>
            {parsedResult.action === 'create_trip' && parsedResult.tripParams && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Plan a <strong>{parsedResult.tripParams.days}-day {parsedResult.tripParams.destination} trip</strong> for {parsedResult.tripParams.travelerCount} travelers with budget <strong>₹{parsedResult.tripParams.budget.toLocaleString()}</strong>.
              </p>
            )}
            {parsedResult.action === 'filter_hospital' && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Show stays and hotels located near emergency hospitals (&lt;2km distance).
              </p>
            )}
            {parsedResult.action === 'read_itinerary' && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Read today's itinerary activities and rest schedule out loud.
              </p>
            )}
            {parsedResult.action === 'navigate' && (
              <p className="text-xs text-slate-700 dark:text-slate-300">
                Navigate directly to <strong>{parsedResult.targetScreen?.toUpperCase()}</strong> screen.
              </p>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3">
          {isListening ? (
            <button
              onClick={handleStop}
              className="flex-1 py-2.5 px-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition text-sm flex items-center justify-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              Stop Listening
            </button>
          ) : (
            <button
              onClick={handleStartListening}
              className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Speak Again
            </button>
          )}

          {parsedResult && parsedResult.action !== 'unknown' && (
            <button
              onClick={handleConfirm}
              className="py-2.5 px-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition text-sm flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              {t.confirmAction}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
