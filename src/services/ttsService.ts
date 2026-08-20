// Text-to-Speech audio narration helper for FaithPath Scripture & Prayers

class TextToSpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private currentId: string | null = null;
  private listeners: Set<(speakingId: string | null) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Pre-warm voices
        window.speechSynthesis.getVoices();
      };
    }
  }

  public subscribe(callback: (speakingId: string | null) => void) {
    this.listeners.add(callback);
    callback(this.currentId);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentId));
  }

  public speak(id: string, text: string, options?: { rate?: number; pitch?: number; voiceName?: string }) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported on this device/browser.');
      return;
    }

    // Stop current speech
    this.stop();

    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate ?? 0.95; // Slightly slower, calm cadence for reverent reading
    utterance.pitch = options?.pitch ?? 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (options?.voiceName) {
      const match = voices.find(v => v.name.toLowerCase().includes(options.voiceName!.toLowerCase()));
      if (match) utterance.voice = match;
    } else {
      // Pick best English voice if available (e.g., Natural, Google, Samantha, Daniel)
      const preferred = voices.find(v => 
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Samantha') || v.name.includes('Aaron')))
      ) || voices.find(v => v.lang.startsWith('en'));
      
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentId = id;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentId = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('TTS narration ended/cancelled:', e);
      this.isSpeaking = false;
      this.currentId = null;
      this.notify();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentId = null;
    this.notify();
  }

  public toggle(id: string, text: string, options?: { rate?: number; pitch?: number; voiceName?: string }) {
    if (this.currentId === id) {
      this.stop();
    } else {
      this.speak(id, text, options);
    }
  }

  public isCurrentlySpeaking(id: string): boolean {
    return this.currentId === id;
  }
}

export const ttsService = new TextToSpeechService();
