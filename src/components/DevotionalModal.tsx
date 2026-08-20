import React, { useState, useEffect } from 'react';
import { X, BookOpen, HeartHandshake, Share2, Sparkles, Volume2, Square as StopSquare } from 'lucide-react';
import { DailyDevotional } from '../types';
import { ttsService } from '../services/ttsService';

interface DevotionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotional: DailyDevotional;
  onAskAiPrompt: (promptText: string) => void;
}

export const DevotionalModal: React.FC<DevotionalModalProps> = ({
  isOpen,
  onClose,
  devotional,
  onAskAiPrompt
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsService.subscribe((id) => setSpeakingId(id));
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleToggleAudio = () => {
    const fullText = `Daily Devotional: ${devotional.title}. Scripture: ${devotional.scriptureRef}. "${devotional.verseText}". ${devotional.body}. Reflection: ${devotional.reflection}. Today's Prayer: ${devotional.prayer}`;
    ttsService.toggle('devotional-modal', fullText);
  };

  const handleClose = () => {
    ttsService.stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto border border-amber-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center justify-between pr-8">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
              Daily Devotional • {devotional.date}
            </span>

            <button
              onClick={handleToggleAudio}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-2xs ${
                speakingId === 'devotional-modal'
                  ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              {speakingId === 'devotional-modal' ? (
                <>
                  <StopSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Listen to Audio</span>
                </>
              )}
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 pt-1">{devotional.title}</h2>
          <p className="text-xs font-bold text-[#1E3A8A]">Scripture: {devotional.scriptureRef}</p>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 font-serif italic text-xs text-slate-800 leading-relaxed">
          "{devotional.verseText}"
        </div>

        <div className="space-y-3 text-xs text-slate-800 leading-relaxed font-sans">
          {devotional.body.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 space-y-1">
          <h4 className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1">
            💡 Reflection Question
          </h4>
          <p className="text-xs text-slate-800 font-medium">{devotional.reflection}</p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
              🙏 Today's Prayer
            </h4>
            <button
              onClick={() => ttsService.toggle('devotional-prayer-only', `Today's Prayer: ${devotional.prayer}`)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                speakingId === 'devotional-prayer-only'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Volume2 className="w-3 h-3" />
              <span>{speakingId === 'devotional-prayer-only' ? 'Stop' : 'Listen Prayer'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-700 italic">{devotional.prayer}</p>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => {
              handleClose();
              onAskAiPrompt(`Give me further spiritual insights on today's devotional topic: ${devotional.title} (${devotional.scriptureRef})`);
            }}
            className="flex-1 py-2.5 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-900 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Ask AI Reflection
          </button>
        </div>
      </div>
    </div>
  );
};
