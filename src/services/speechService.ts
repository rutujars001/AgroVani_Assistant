/**
 * Fast & Responsive Speech Service for AgroVani
 * Fixes:
 * 1. Cancels all pending speech instantly on stop or new speak call.
 * 2. Instant response without 2-second delay.
 * 3. Never queues old starter speeches.
 * 4. Authentic Marathi pronunciation.
 */

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private clientAudioCache = new Map<string, string>();
  private selectedVoiceName: 'Kore' | 'Puck' = 'Kore';

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'mr-IN';
      }
    }
  }

  setVoiceType(voice: 'Kore' | 'Puck') {
    this.selectedVoiceName = voice;
  }

  // Play fast feedback tone
  playTone(type: 'start' | 'confirm' | 'error' | 'success') {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext may require user gesture
    }
  }

  hapticFeedback(duration = 35) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch {
        // ignore
      }
    }
  }

  // Force stop everything instantly
  stopSpeaking() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Speak Marathi text immediately
   */
  async speak(text: string, onEnd?: () => void): Promise<boolean> {
    // 1. Immediately kill any current or queued speech
    this.stopSpeaking();

    if (!text || text.trim() === '') {
      if (onEnd) onEnd();
      return false;
    }

    const cleanText = text.trim();
    const cacheKey = `${this.selectedVoiceName}:${cleanText}`;

    // 2. If cached Gemini audio is available, play immediately
    if (this.clientAudioCache.has(cacheKey)) {
      const cachedDataUrl = this.clientAudioCache.get(cacheKey)!;
      return this.playAudioDataUrl(cachedDataUrl, onEnd);
    }

    // 3. For instant immediate response (<50ms), start native Marathi speech synthesis right away
    // so the farmer doesn't wait in silence
    const started = this.fallbackBrowserSpeak(cleanText, onEnd);

    // 4. In background, asynchronously warm the cache from Gemini TTS for future playback
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText,
        voiceName: this.selectedVoiceName,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.audioBase64) {
          this.clientAudioCache.set(cacheKey, `data:audio/wav;base64,${data.audioBase64}`);
        }
      })
      .catch(() => {});

    return started;
  }

  private playAudioDataUrl(dataUrl: string, onEnd?: () => void): boolean {
    try {
      this.stopSpeaking();
      const audio = new Audio(dataUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        if (onEnd) onEnd();
      };

      audio.play().catch(() => {
        if (onEnd) onEnd();
      });

      return true;
    } catch {
      if (onEnd) onEnd();
      return false;
    }
  }

  private fallbackBrowserSpeak(text: string, onEnd?: () => void): boolean {
    if (!this.synth) {
      if (onEnd) onEnd();
      return false;
    }

    // Phonetically normalize numbers and terms to pure Marathi
    const phoneticMarathi = text
      .replace(/APMC/gi, 'बाजार समिती')
      .replace(/(\d+)\.?(\d*)\s*°C/g, '$1 अंश')
      .replace(/₹\s*(\d+)/g, '$1 रुपये')
      .replace(/m\/s/g, 'मीटर प्रति सेकंद')
      .replace(/km\/h/g, 'किलोमीटर प्रति तास');

    const utterance = new SpeechSynthesisUtterance(phoneticMarathi);
    utterance.lang = 'mr-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = this.synth.getVoices();
    const mrVoice = voices.find(
      (v) =>
        v.lang === 'mr-IN' ||
        v.lang.toLowerCase().includes('mr') ||
        v.name.toLowerCase().includes('marathi') ||
        v.name.includes('मराठी')
    );
    const hiVoice = voices.find(
      (v) =>
        (v.lang === 'hi-IN' || v.lang.toLowerCase().includes('hi')) &&
        !v.name.toLowerCase().includes('english')
    );

    if (mrVoice) {
      utterance.voice = mrVoice;
    } else if (hiVoice) {
      utterance.voice = hiVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
    return true;
  }

  isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  listenOnce(onResult: (transcript: string) => void, onError: (err: string) => void) {
    if (!this.recognition) {
      onError('तुमच्या ब्राऊझरमध्ये मायक्रोफोन सपोर्ट उपलब्ध नाही.');
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    this.stopSpeaking();
    this.hapticFeedback(50);
    this.playTone('start');

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      this.hapticFeedback(40);
      this.playTone('confirm');
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'आवाज ओळखता आला नाही');
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'मायक्रोफोन सुरू करता आला नाही');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
