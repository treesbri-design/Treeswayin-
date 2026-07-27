import React from 'react';
import { X, BookOpen, HeartHandshake, Share2, Sparkles, Volume2 } from 'lucide-react';
import { DailyDevotional } from '../types';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto border border-amber-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
            Daily Devotional • {devotional.date}
          </span>
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
          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
            🙏 Today's Prayer
          </h4>
          <p className="text-xs text-slate-700 italic">{devotional.prayer}</p>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => {
              onClose();
              onAskAiPrompt(`Give me further spiritual insights on today's devotional topic: ${devotional.title} (${devotional.scriptureRef})`);
            }}
            className="flex-1 py-2.5 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Ask AI Reflection
          </button>
        </div>
      </div>
    </div>
  );
};
