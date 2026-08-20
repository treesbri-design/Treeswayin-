import React, { useState, useEffect } from 'react';
import { Bookmark, Copy, Check, Share2, Sparkles, RefreshCw, Volume2, Image as ImageIcon, Square as StopSquare } from 'lucide-react';
import { getDailyVerse } from '../data/devotionals';
import { BibleTranslation } from '../types';
import { downloadVerseCardImage, CARD_THEMES, CardTheme } from '../utils/cardGenerator';
import { ttsService } from '../services/ttsService';
import { TRANSLATION_OPTIONS } from '../data/devotionals';

interface DailyVerseWidgetProps {
  onSaveVerse?: (verse: { bookName: string; chapter: number; verse: number; text: string }) => void;
  isSaved?: boolean;
  onAskAiPrompt?: (prompt: string) => void;
  preferredTranslation?: BibleTranslation;
  onChangeTranslation?: (translation: BibleTranslation) => void;
}

export const DailyVerseWidget: React.FC<DailyVerseWidgetProps> = ({
  onSaveVerse,
  isSaved = false,
  onAskAiPrompt,
  preferredTranslation = 'NIV',
  onChangeTranslation
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsService.subscribe((id) => setSpeakingId(id));
    return unsub;
  }, []);

  const verseData = getDailyVerse(preferredTranslation);

  const handleCopy = () => {
    const copyText = `"${verseData.text}" - ${verseData.reference} (${verseData.translation})\nShared via FaithPath AI`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (onSaveVerse) {
      onSaveVerse({
        bookName: 'Romans',
        chapter: 8,
        verse: 28,
        text: verseData.text
      });
    }
  };

  const handleAskAi = () => {
    if (onAskAiPrompt) {
      onAskAiPrompt(`Explain the spiritual depth and practical life application of ${verseData.reference}: "${verseData.text}"`);
    }
  };

  const handleDownloadCard = () => {
    downloadVerseCardImage(verseData.text, `${verseData.reference} (${verseData.translation})`, selectedTheme);
    setShowShareModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/80 to-blue-50/60 rounded-[28px] p-4 sm:p-5 border border-amber-200/80 shadow-md space-y-3 relative overflow-hidden">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-amber-500 text-[#1E3A8A] px-2.5 py-0.5 rounded-full shadow-2xs border border-amber-300/60">
          Verse of the Day
        </span>

        {onChangeTranslation && (
          <select
            value={preferredTranslation}
            onChange={(e) => onChangeTranslation(e.target.value as BibleTranslation)}
            className="text-[11px] font-extrabold text-[#1E3A8A] bg-white/95 border border-amber-300 rounded-xl px-2.5 py-1 shadow-2xs focus:outline-none cursor-pointer"
          >
            {TRANSLATION_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag} {t.id} • {t.lang}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Verse Content */}
      <div className="space-y-1.5">
        <blockquote className="text-sm sm:text-base font-serif italic text-slate-800 leading-relaxed font-medium">
          "{verseData.text}"
        </blockquote>
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs font-black text-[#1E3A8A] tracking-tight">
            — {verseData.reference} ({verseData.translation})
          </p>
        </div>
      </div>

      {/* Context note */}
      {verseData.context && (
        <p className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-amber-100 italic leading-tight">
          💡 {verseData.context}
        </p>
      )}

      {/* Action Buttons: Flex-Wrap Graceful Mobile Container */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-amber-200/60">
        {/* Button 0: Listen Audio */}
        <button
          onClick={() => {
            const textToNarrate = `Verse of the Day. ${verseData.reference}. ${verseData.text}`;
            ttsService.toggle('daily-verse-of-the-day', textToNarrate);
          }}
          className={`flex-1 min-w-[75px] xs:min-w-[85px] py-2 px-2.5 sm:px-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
            speakingId === 'daily-verse-of-the-day'
              ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
              : 'bg-white hover:bg-amber-50 text-[#1E3A8A] border-amber-200 shadow-2xs'
          }`}
          title={speakingId === 'daily-verse-of-the-day' ? 'Stop Audio Narration' : 'Listen to Scripture Audio'}
        >
          {speakingId === 'daily-verse-of-the-day' ? (
            <>
              <StopSquare className="w-3.5 h-3.5 fill-white text-white" />
              <span className="truncate">Stop</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span className="truncate">Listen</span>
            </>
          )}
        </button>

        {/* Button 1: Save */}
        <button
          onClick={handleSave}
          className={`flex-1 min-w-[75px] xs:min-w-[85px] py-2 px-2.5 sm:px-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
            isSaved
              ? 'bg-[#1E3A8A] text-amber-300 border-[#1E3A8A] shadow-xs'
              : 'bg-amber-100/90 hover:bg-amber-200 text-[#1E3A8A] border-amber-300/80 shadow-2xs'
          }`}
          title={isSaved ? 'Verse Saved to Profile' : 'Save Verse'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : 'text-[#1E3A8A]'}`} />
          <span className="truncate">{isSaved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Button 2: Copy */}
        <button
          onClick={handleCopy}
          className="flex-1 min-w-[75px] xs:min-w-[85px] py-2 px-2.5 sm:px-3 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-slate-200 shadow-2xs"
          title="Copy Scripture to Clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
          <span className="truncate">{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Button 3: Share Card */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 min-w-[100px] xs:min-w-[110px] py-2 px-2.5 sm:px-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
          title="Generate Visual Share Card"
        >
          <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="truncate">Share Card</span>
        </button>

        {/* Button 4: Ask AI */}
        <button
          onClick={handleAskAi}
          className="flex-1 min-w-[90px] xs:min-w-[100px] py-2 px-2.5 sm:px-3 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 hover:from-purple-800 hover:to-blue-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
          title="Ask AI Reflection & Practical Application"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="truncate">Ask AI</span>
        </button>
      </div>

      {/* SHARE CARD GENERATOR MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-fadeIn border border-amber-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="text-sm font-extrabold text-slate-900">Verse Card Generator</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Theme Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Select Visual Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={`p-2 rounded-xl text-[10px] font-extrabold text-center transition-all border ${
                      selectedTheme.id === t.id
                        ? 'ring-2 ring-[#1E3A8A] border-transparent scale-102 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.bgColors[0]}, ${t.bgColors[1]})`, color: t.textColor }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Card */}
            <div
              className="p-4 rounded-2xl text-center space-y-2 border shadow-sm relative"
              style={{ background: `linear-gradient(135deg, ${selectedTheme.bgColors[0]}, ${selectedTheme.bgColors[1]})`, color: selectedTheme.textColor }}
            >
              <span className="block text-xl" style={{ color: selectedTheme.accentColor }}>✝</span>
              <p className="text-xs font-serif italic line-clamp-4">"{verseData.text}"</p>
              <p className="text-[10px] font-bold" style={{ color: selectedTheme.accentColor }}>
                — {verseData.reference} ({verseData.translation})
              </p>
            </div>

            {/* Action Download */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadCard}
                className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
