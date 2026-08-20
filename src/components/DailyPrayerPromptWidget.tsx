import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  BookOpen, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  CheckSquare, 
  Square, 
  Flame, 
  PenTool, 
  BookmarkCheck,
  Feather,
  ChevronRight,
  Volume2,
  VolumeX,
  Square as StopSquare
} from 'lucide-react';
import { DailyPrayerPrompt, NavTab } from '../types';
import { fetchDailyPrayerPrompt } from '../services/apiService';
import { ttsService } from '../services/ttsService';

interface DailyPrayerPromptWidgetProps {
  onAskAiPrompt?: (promptText: string) => void;
  setActiveTab?: (tab: NavTab) => void;
}

const CATEGORIES = [
  { id: 'Gratitude & Peace', label: 'Gratitude & Peace', icon: '🕊️' },
  { id: 'Strength & Courage', label: 'Strength & Courage', icon: '🛡️' },
  { id: 'Guidance & Wisdom', label: 'Guidance & Wisdom', icon: '💡' },
  { id: 'Family & Healing', label: 'Family & Healing', icon: '❤️' },
  { id: 'Spiritual Renewal', label: 'Spiritual Renewal', icon: '🌱' },
];

export const DailyPrayerPromptWidget: React.FC<DailyPrayerPromptWidgetProps> = ({
  onAskAiPrompt,
  setActiveTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Gratitude & Peace');
  const [promptData, setPromptData] = useState<DailyPrayerPrompt | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [checkedPoints, setCheckedPoints] = useState<Record<number, boolean>>({});
  const [userJournalInput, setUserJournalInput] = useState<string>('');
  const [showJournalInput, setShowJournalInput] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsService.subscribe((id) => setSpeakingId(id));
    return unsub;
  }, []);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const loadPrompt = async (cat: string) => {
    setIsLoading(true);
    setCheckedPoints({});
    try {
      const data = await fetchDailyPrayerPrompt(cat);
      setPromptData(data);
    } catch (err) {
      console.warn("Failed to load daily prayer prompt:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompt(selectedCategory);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    loadPrompt(cat);
  };

  const handleCopyPrayer = () => {
    if (!promptData) return;
    const textToCopy = `Today's Prayer Prompt (${promptData.theme}):\n\n"${promptData.prayerStarter}"\n\nScripture: ${promptData.scriptureAnchor.reference} - "${promptData.scriptureAnchor.text}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    triggerToast('Prayer prompt copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  const togglePointCheck = (index: number) => {
    setCheckedPoints(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSaveToPrayerList = () => {
    if (!userJournalInput.trim()) {
      triggerToast('Please type a reflection or prayer first.');
      return;
    }
    // Save to local storage prayers list
    try {
      const existing = JSON.parse(localStorage.getItem('faithpath_local_prayers') || '[]');
      const newEntry = {
        id: `prayer-${Date.now()}`,
        title: promptData?.theme ? `Prayer: ${promptData.theme}` : 'Daily Reflection',
        content: userJournalInput,
        category: 'Gratitude',
        createdAt: new Date().toISOString(),
        isAnswered: false
      };
      localStorage.setItem('faithpath_local_prayers', JSON.stringify([newEntry, ...existing]));
      triggerToast('Saved to your Prayer List! 🙏');
      setUserJournalInput('');
      setShowJournalInput(false);
    } catch (e) {
      triggerToast('Saved!');
    }
  };

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4 relative overflow-hidden transition-all">
      {/* Toast Popup */}
      {toastMessage && (
        <div className="absolute top-3 right-3 z-30 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-1.5 animate-fadeIn">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-300/60 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Daily Prayer Prompt
            </span>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
              {todayFormatted}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#1E3A8A]" />
            Begin Your Quiet Time
          </h2>
        </div>

        <button
          type="button"
          onClick={() => loadPrompt(selectedCategory)}
          disabled={isLoading}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-2xs"
          title="Generate fresh AI prayer prompt"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1E3A8A] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Generating...' : 'Refresh Prompt'}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Choose Today's Focus:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Loading Skeleton vs Display */}
      {isLoading ? (
        <div className="py-8 space-y-3 animate-pulse">
          <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
          <div className="h-20 bg-slate-100 rounded-2xl w-full"></div>
          <div className="h-16 bg-blue-50 rounded-2xl w-full"></div>
        </div>
      ) : promptData ? (
        <div className="space-y-4">
          {/* Theme Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Feather className="w-4 h-4 text-amber-600" />
              {promptData.theme}
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
              {promptData.category}
            </span>
          </div>

          {/* Scripture Anchor */}
          {promptData.scriptureAnchor && (
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  Scripture Anchor: {promptData.scriptureAnchor.reference}
                </span>

                {onAskAiPrompt && (
                  <button
                    onClick={() => onAskAiPrompt(`Explain the context of ${promptData.scriptureAnchor.reference} and how it applies to daily prayer.`)}
                    className="text-[10px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-0.5"
                  >
                    <span>Reflect with AI</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-xs font-serif italic font-medium text-slate-800 leading-relaxed">
                "{promptData.scriptureAnchor.text}"
              </p>
            </div>
          )}

          {/* Prayer Starter Text Box */}
          <div className="p-4 bg-gradient-to-br from-amber-50/70 via-yellow-50/30 to-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Prayer Starter
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const textToNarrate = `Daily Prayer. Theme: ${promptData.theme}. Scripture: ${promptData.scriptureAnchor?.text || ''}. Prayer: ${promptData.prayerStarter}`;
                    ttsService.toggle('daily-prayer-prompt', textToNarrate);
                  }}
                  className={`px-2.5 py-1 font-bold text-[10px] rounded-lg border shadow-2xs flex items-center gap-1 transition-all ${
                    speakingId === 'daily-prayer-prompt'
                      ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                      : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                  title={speakingId === 'daily-prayer-prompt' ? 'Stop Narration' : 'Listen to Prayer Audio'}
                >
                  {speakingId === 'daily-prayer-prompt' ? (
                    <>
                      <StopSquare className="w-3 h-3 fill-white" />
                      <span>Stop Audio</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-amber-700" />
                      <span>Listen</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrayer}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 font-bold text-[10px] rounded-lg border border-amber-300 shadow-2xs flex items-center gap-1 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-amber-700" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs font-serif font-bold text-slate-900 leading-relaxed pt-1">
              "{promptData.prayerStarter}"
            </p>
          </div>

          {/* Guided Reflection Points */}
          {promptData.guidedPoints && promptData.guidedPoints.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Guided Prayer Checkpoints
              </span>

              <div className="space-y-1.5">
                {promptData.guidedPoints.map((point, index) => {
                  const isDone = !!checkedPoints[index];
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => togglePointCheck(index)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-start gap-2.5 transition-all ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 line-through opacity-80'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-tight">{point}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expandable Personal Prayer Box */}
          <div className="pt-2 border-t border-slate-100">
            {!showJournalInput ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowJournalInput(true)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-xs font-extrabold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all"
                >
                  <PenTool className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Write Personal Prayer Response</span>
                </button>

                {setActiveTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('prayer')}
                    className="text-xs font-bold text-slate-500 hover:text-[#1E3A8A] flex items-center gap-1"
                  >
                    <span>Open Prayer Journal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <PenTool className="w-3.5 h-3.5 text-amber-600" />
                    Your Prayer Response:
                  </label>
                  <button
                    onClick={() => setShowJournalInput(false)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={userJournalInput}
                  onChange={(e) => setUserJournalInput(e.target.value)}
                  placeholder="Lord, today I bring my heart before You..."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 font-serif"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToPrayerList}
                    className="px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save to My Prayer List</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
