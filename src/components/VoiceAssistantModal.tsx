import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Check, X, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speechService';
import { parseFarmerQuery, ParsedIntent } from '../services/nlpEngine';
import { offlineSyncService } from '../services/offlineSyncService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule: (intent: ParsedIntent) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToModule
}) => {
  const [step, setStep] = useState<'idle' | 'listening' | 'confirming' | 'processing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [detectedIntent, setDetectedIntent] = useState<ParsedIntent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample Solapur Dialect prompts from the paper
  const SOLAPUR_SAMPLE_PROMPTS = [
    { text: 'सोलापूरचा ज्वारीचा भाव काय हाय?', desc: 'बाजारभाव' },
    { text: 'कांद्यावर जांभळा करपा पडलाय काय करू?', desc: 'रोग निदान' },
    { text: 'माझे शेत आणि पिकांची स्थिती दाखवा', desc: 'माझे शेत' },
    { text: 'पंढरपूरचं हवामान कसं हाय?', desc: 'हवामान' },
    { text: 'ठिबक सिंचन योजना कशी मिळवायची?', desc: 'शासकीय योजना' },
    { text: 'डाळिंबाची संपूर्ण माहिती सांगा', desc: 'पीक माहिती' }
  ];

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      speechService.stopSpeaking();
      speechService.stopListening();
      setStep('idle');
      setTranscript('');
      setDetectedIntent(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage('');
    setStep('listening');
    setTranscript('');

    speechService.listenOnce(
      (resultText) => {
        handleReceivedSpeech(resultText);
      },
      (error) => {
        setStep('idle');
        setErrorMessage(
          error === 'no-speech'
            ? 'काही आवाज ऐकू आला नाही. कृपया पुन्हा बोला किंवा खालील नमुना निवडा.'
            : 'मायक्रोफोन परवानगी तपासा किंवा खालील नमुना पर्यायांवर टॅप करा.'
        );
      }
    );
  };

  const handleReceivedSpeech = (text: string) => {
    setTranscript(text);
    const intent = parseFarmerQuery(text);
    setDetectedIntent(intent);
    setStep('confirming');

    // 2-Way Auditory Confirmation: System reads aloud what it heard
    const confirmationSpeech = `ऐकलं आहे: ${text}. ${intent.confirmationQuestion}`;
    speechService.speak(confirmationSpeech);

    // Log query in offline sync queue
    offlineSyncService.enqueueAction('voice_log', { query: text, intent: intent.intent });
  };

  const handleSelectSample = (promptText: string) => {
    speechService.hapticFeedback(40);
    handleReceivedSpeech(promptText);
  };

  // Farmer confirms "होय" (Yes)
  const handleConfirmYes = () => {
    speechService.hapticFeedback(60);
    speechService.playTone('confirm');
    speechService.stopSpeaking();
    if (detectedIntent) {
      setStep('processing');
      setTimeout(() => {
        onNavigateToModule(detectedIntent);
        onClose();
      }, 400);
    }
  };

  // Farmer rejects "नाही" (No)
  const handleConfirmNo = () => {
    speechService.hapticFeedback(40);
    speechService.stopSpeaking();
    setStep('idle');
    setTranscript('');
    setDetectedIntent(null);
    startListening();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-stone-900 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">अ‍ॅग्रोवाणी संवाद सहाय्यक</h3>
              <p className="text-xs text-stone-500">सोलापूर मायबोली व द्विमार्गी आवाज पुष्टीकरण</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 font-bold text-xl cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
          {step === 'listening' && (
            <div className="space-y-4 py-4 w-full">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-emerald-100 animate-ping absolute opacity-60" />
                <div className="w-24 h-24 rounded-full bg-emerald-200 animate-pulse absolute" />
                <div className="relative w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-lg">
                  <Mic className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-emerald-900">मी ऐकत आहे, बोला...</h4>
                <p className="text-xs text-stone-600 mt-1">
                  मराठीत किंवा सोलापुरी बोलीत बोला (उदा. "कांद्याचा भाव काय हाय?")
                </p>
              </div>
              <button
                onClick={() => {
                  speechService.stopListening();
                  setStep('idle');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-full bg-stone-100"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>थांबवा</span>
              </button>
            </div>
          )}

          {step === 'confirming' && detectedIntent && (
            <div className="space-y-4 py-2 w-full animate-in zoom-in-95 duration-200">
              <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wide">
                  <Volume2 className="w-4 h-4 text-amber-700 animate-bounce" />
                  <span>ऐकलेले संभाषण (Auditory Confirmation)</span>
                </div>
                <div className="text-base font-extrabold text-stone-900 italic">
                  "{transcript}"
                </div>
                <div className="text-xs text-stone-700 pt-1 border-t border-amber-200">
                  {detectedIntent.confirmationQuestion}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleConfirmNo}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-sm cursor-pointer shadow-xs active:scale-95 transition"
                >
                  <X className="w-5 h-5 text-rose-600" />
                  <span>नाही, पुन्हा बोला</span>
                </button>
                <button
                  onClick={handleConfirmYes}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm cursor-pointer shadow-md active:scale-95 transition"
                >
                  <Check className="w-5 h-5 text-white" />
                  <span>होय, पुढे जा</span>
                </button>
              </div>
            </div>
          )}

          {step === 'idle' && (
            <div className="space-y-4 w-full">
              <button
                onClick={startListening}
                className="inline-flex flex-col items-center gap-2 p-5 rounded-3xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg cursor-pointer active:scale-95 transition mx-auto"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Mic className="w-8 h-8" />
                </div>
                <span className="font-extrabold text-sm">बोलण्यासाठी टॅप करा</span>
              </button>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Sample Solapur Dialect Prompts */}
              <div className="pt-2 text-left w-full">
                <div className="text-xs font-bold text-stone-700 mb-2">
                  सोलापूर मायबोली नमुना प्रश्न (टॅप करा):
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {SOLAPUR_SAMPLE_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(p.text)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-left transition cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-stone-800">
                        {p.text}
                      </div>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-stone-200 text-center">
          <p className="text-[11px] text-stone-500">
            सोलापूर dialect phrase hinting + Google Speech-to-Text & Dialogflow NLU
          </p>
        </div>
      </div>
    </div>
  );
};
