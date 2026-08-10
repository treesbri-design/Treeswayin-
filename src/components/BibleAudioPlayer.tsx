import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Sliders, 
  Music, 
  Gauge, 
  ChevronDown, 
  Radio, 
  Volume1,
  X
} from 'lucide-react';

interface VerseItem {
  number: number;
  text: string;
}

interface BibleAudioPlayerProps {
  bookName: string;
  chapter: number;
  translation: string;
  verses: VerseItem[];
  onCurrentVerseChange?: (verseNumber: number | null) => void;
  onClose?: () => void;
}

export const BibleAudioPlayer: React.FC<BibleAudioPlayerProps> = ({
  bookName,
  chapter,
  translation,
  verses,
  onCurrentVerseChange,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  isPlayingRef.current = isPlaying;

  // Load voices on mount
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Prefer English natural voices
        const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        setSelectedVoice(preferred || null);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis?.cancel();
      stopAmbient();
    };
  }, []);

  // Update current verse highlight when index changes
  useEffect(() => {
    if (isPlaying && verses[currentVerseIndex]) {
      onCurrentVerseChange?.(verses[currentVerseIndex].number);
    } else if (!isPlaying) {
      onCurrentVerseChange?.(null);
    }
  }, [currentVerseIndex, isPlaying, verses, onCurrentVerseChange]);

  // Ambient sound synth generator using Web Audio API
  const startAmbient = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 soft tone

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3 warm pad

      gain.gain.setValueAtTime(0.02, ctx.currentTime); // Very soft warm background pad

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ambientGainRef.current = gain;
    } catch (e) {
      console.warn('Ambient sound failed:', e);
    }
  };

  const stopAmbient = () => {
    if (ambientGainRef.current && audioCtxRef.current) {
      try {
        ambientGainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
      } catch {}
    }
  };

  const toggleAmbient = () => {
    if (!ambientSound) {
      startAmbient();
      setAmbientSound(true);
    } else {
      stopAmbient();
      setAmbientSound(false);
    }
  };

  // Speak a specific verse
  const speakVerse = (index: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (index < 0 || index >= verses.length) {
      setIsPlaying(false);
      setCurrentVerseIndex(0);
      onCurrentVerseChange?.(null);
      stopAmbient();
      return;
    }

    const currentVerse = verses[index];
    let textToSpeak = '';
    
    if (index === 0) {
      textToSpeak = `${bookName}, Chapter ${chapter}. Verse 1. ${currentVerse.text}`;
    } else {
      textToSpeak = `Verse ${currentVerse.number}. ${currentVerse.text}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        if (index + 1 < verses.length) {
          setCurrentVerseIndex(index + 1);
          speakVerse(index + 1);
        } else {
          setIsPlaying(false);
          setCurrentVerseIndex(0);
          onCurrentVerseChange?.(null);
          if (ambientSound) stopAmbient();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
      onCurrentVerseChange?.(null);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (ambientSound) startAmbient();
      speakVerse(currentVerseIndex);
    }
  };

  const handlePause = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setCurrentVerseIndex(0);
    onCurrentVerseChange?.(null);
    stopAmbient();
  };

  const handlePrevVerse = () => {
    const nextIdx = Math.max(0, currentVerseIndex - 1);
    setCurrentVerseIndex(nextIdx);
    if (isPlaying) {
      speakVerse(nextIdx);
    }
  };

  const handleNextVerse = () => {
    const nextIdx = Math.min(verses.length - 1, currentVerseIndex + 1);
    setCurrentVerseIndex(nextIdx);
    if (isPlaying) {
      speakVerse(nextIdx);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      speakVerse(currentVerseIndex);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    const voice = availableVoices.find(v => v.name === voiceName) || null;
    setSelectedVoice(voice);
    if (isPlaying) {
      speakVerse(currentVerseIndex);
    }
  };

  const progressPercentage = verses.length > 0 ? ((currentVerseIndex + 1) / verses.length) * 100 : 0;

  return (
    <div className="bg-[#1E3A8A] text-white rounded-[24px] sm:rounded-[28px] p-4 sm:p-5 shadow-2xl border border-blue-800 space-y-3 relative overflow-hidden transition-all animate-fadeIn">
      {/* Background Subtle Gradient & Sparkle Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest">
                AI Audio Narration
              </span>
              <span className="text-[9px] font-bold bg-blue-900/80 px-2 py-0.5 rounded-full text-blue-200 border border-blue-700">
                {translation}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-white">
              {bookName} Chapter {chapter}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              showSettings 
                ? 'bg-amber-400 text-slate-900 border-amber-300' 
                : 'bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700'
            }`}
            title="Audio Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Close Player */}
          {onClose && (
            <button
              type="button"
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-2 rounded-xl bg-blue-900/60 hover:bg-rose-900/80 text-blue-200 hover:text-white border border-blue-700 transition-all"
              title="Close Audio Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal Bar (if opened) */}
      {showSettings && (
        <div className="p-3 bg-blue-950/90 rounded-2xl border border-blue-800/80 space-y-2 text-xs animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            {/* Voice Dropdown */}
            {availableVoices.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[11px] text-blue-300 font-bold shrink-0">Voice:</span>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="bg-blue-900 text-white font-medium text-xs px-2.5 py-1 rounded-xl border border-blue-700 focus:outline-none w-full sm:w-48"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ambient Background Sound Toggle */}
            <button
              type="button"
              onClick={toggleAmbient}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs ${
                ambientSound 
                  ? 'bg-amber-400 text-slate-900 border border-amber-300' 
                  : 'bg-blue-900 hover:bg-blue-800 text-blue-200 border border-blue-700'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{ambientSound ? 'Ambient Pad: ON 🎵' : 'Enable Prayer Ambient Pad'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar & Current Verse Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-blue-200">
          <span>
            Verse {currentVerseIndex + 1} of {verses.length}
          </span>
          <span className="text-amber-300">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-blue-950/80 rounded-full h-2 overflow-hidden border border-blue-800 relative">
          <div 
            className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Spoken Text Preview */}
        {verses[currentVerseIndex] && (
          <p className="text-xs font-serif italic text-blue-100/90 truncate pt-0.5">
            "{verses[currentVerseIndex].text}"
          </p>
        )}
      </div>

      {/* Main Playback Controls */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          {[0.8, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                playbackRate === rate
                  ? 'bg-amber-400 text-slate-900 font-extrabold shadow-2xs'
                  : 'bg-blue-900/60 hover:bg-blue-800 text-blue-300'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Core Media Buttons */}
        <div className="flex items-center gap-2">
          {/* Skip Prev */}
          <button
            type="button"
            onClick={handlePrevVerse}
            disabled={currentVerseIndex === 0}
            className="p-2 rounded-full bg-blue-900/80 hover:bg-blue-800 text-white disabled:opacity-30 border border-blue-700 transition-all active:scale-95"
            title="Previous Verse"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          {isPlaying ? (
            <button
              type="button"
              onClick={handlePause}
              className="p-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/20 font-black transition-all active:scale-95"
              title="Pause Narration"
            >
              <Pause className="w-5 h-5 fill-slate-900" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              className="p-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-lg shadow-amber-400/20 font-black transition-all active:scale-95"
              title="Play AI Narration"
            >
              <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
            </button>
          )}

          {/* Stop */}
          <button
            type="button"
            onClick={handleStop}
            className="p-2 rounded-full bg-blue-900/80 hover:bg-rose-900/80 text-blue-200 hover:text-white border border-blue-700 transition-all active:scale-95"
            title="Stop Audio"
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Skip Next */}
          <button
            type="button"
            onClick={handleNextVerse}
            disabled={currentVerseIndex >= verses.length - 1}
            className="p-2 rounded-full bg-blue-900/80 hover:bg-blue-800 text-white disabled:opacity-30 border border-blue-700 transition-all active:scale-95"
            title="Next Verse"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Mute Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700 transition-all"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
