import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  HeartHandshake, 
  Flame, 
  ArrowRight,
  SunMedium,
  Send,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Award,
  Quote,
  RefreshCw,
  Copy,
  Check,
  Shuffle,
  Dices,
  Download,
  Image as ImageIcon,
  X,
  SlidersHorizontal,
  Settings2,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile, NavTab, DailyDevotional, ReadingPlan, BibleTranslation } from '../types';
import { DAILY_VERSE_OF_THE_DAY, DAILY_VERSE_TRANSLATIONS, getDailyVerse, DAILY_AFFIRMATIONS, getTodayAffirmation, INITIAL_READING_PLANS, getRandomScripture } from '../data/devotionals';
import { CommunityPrayerWall } from './CommunityPrayerWall';
import { StreakCalendar } from './StreakCalendar';
import { CARD_THEMES, downloadVerseCardImage, CardTheme } from '../utils/cardGenerator';

interface HomeTabProps {
  user: UserProfile;
  devotional: DailyDevotional;
  onOpenDevotional: () => void;
  setActiveTab: (tab: NavTab) => void;
  onAskAiPrompt: (promptText: string) => void;
  onSaveVerse: (verse: { bookName: string; chapter: number; verse: number; text: string }) => void;
  savedVerseKeys: Set<string>;
  onOpenUpgrade: () => void;
  readingPlans?: ReadingPlan[];
  onTogglePlanDay?: (planId: string, dayNumber: number) => void;
  onChangeTranslation?: (translation: BibleTranslation) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  devotional,
  onOpenDevotional,
  setActiveTab,
  onAskAiPrompt,
  onSaveVerse,
  savedVerseKeys,
  onOpenUpgrade,
  readingPlans,
  onTogglePlanDay,
  onChangeTranslation
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [affirmationIndex, setAffirmationIndex] = useState(() => {
    const today = getTodayAffirmation();
    const idx = DAILY_AFFIRMATIONS.findIndex(a => a.quote === today.quote);
    return idx >= 0 ? idx : 0;
  });
  const [copiedAffirmation, setCopiedAffirmation] = useState(false);

  // Customizable Daily Verse Widget State
  const [showWidgetConfigModal, setShowWidgetConfigModal] = useState(false);
  const [showDevotionalContext, setShowDevotionalContext] = useState(true);
  const [selectedWidgetTranslation, setSelectedWidgetTranslation] = useState<BibleTranslation>(
    user.preferredTranslation || 'NIV'
  );

  const activeDailyVerse = getDailyVerse(selectedWidgetTranslation);

  const [copiedDailyVerse, setCopiedDailyVerse] = useState(false);
  const [showSocialPostModal, setShowSocialPostModal] = useState(false);
  const [selectedSocialTheme, setSelectedSocialTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const handleCopyDailyVerse = () => {
    const textToCopy = `"${activeDailyVerse.text}" — ${activeDailyVerse.reference} (${activeDailyVerse.translation})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedDailyVerse(true);
    setTimeout(() => setCopiedDailyVerse(false), 2000);
  };

  const handleCopySocialCaption = () => {
    const caption = `✨ Daily Verse of the Day ✨\n\n"${activeDailyVerse.text}"\n\n📖 ${activeDailyVerse.reference} (${activeDailyVerse.translation})\n\n💡 "${activeDailyVerse.context}"\n\n#VerseOfTheDay #FaithPath #DailyScripture #BibleVerse #Faith`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(caption);
    }
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Scripture Randomizer State
  const [randomVerse, setRandomVerse] = useState(() => getRandomScripture());
  const [isSpinning, setIsSpinning] = useState(false);
  const [copiedRandom, setCopiedRandom] = useState(false);

  const handleRefreshRandomVerse = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setRandomVerse(getRandomScripture(randomVerse.reference));
      setIsSpinning(false);
    }, 300);
  };

  const isRandomSaved = savedVerseKeys.has(`${randomVerse.bookName}-${randomVerse.chapter}-${randomVerse.verse}`);

  const handleSaveRandomVerse = () => {
    onSaveVerse({
      bookName: randomVerse.bookName,
      chapter: randomVerse.chapter,
      verse: randomVerse.verse,
      text: randomVerse.text
    });
  };

  const handleCopyRandomVerse = () => {
    const textToCopy = `"${randomVerse.text}" — ${randomVerse.reference} (${randomVerse.translation})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedRandom(true);
    setTimeout(() => setCopiedRandom(false), 2000);
  };

  const plans = readingPlans && readingPlans.length > 0 ? readingPlans : INITIAL_READING_PLANS;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-1');

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const completedDaysCount = activePlan ? activePlan.days.filter(d => d.isCompleted).length : 0;
  const totalDaysCount = activePlan ? activePlan.totalDays : 1;
  const completionPercent = Math.round((completedDaysCount / totalDaysCount) * 100);

  const todayPassage = activePlan?.days.find(d => d.dayNumber === activePlan.currentDay) || activePlan?.days[0];

  const handleToggleTodayPassage = (planId: string, dayNumber: number) => {
    if (onTogglePlanDay) {
      onTogglePlanDay(planId, dayNumber);
    }
  };

  const isSaved = savedVerseKeys.has(`Romans-8-28`);
  const currentAffirmation = DAILY_AFFIRMATIONS[affirmationIndex % DAILY_AFFIRMATIONS.length];

  const handleNextAffirmation = () => {
    setAffirmationIndex(prev => (prev + 1) % DAILY_AFFIRMATIONS.length);
  };

  const handleCopyAffirmation = () => {
    const textToCopy = `"${currentAffirmation.quote}" — ${currentAffirmation.scripture} (via FaithPath AI)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopiedAffirmation(true);
    setTimeout(() => setCopiedAffirmation(false), 2000);
  };

  const promptSuggestions = [
    { title: "Give me a prayer for anxiety", icon: "🙏", category: "Prayer" },
    { title: "Help me understand Psalm 23", icon: "🕊️", category: "Scripture" },
    { title: "What does Romans 8:28 mean?", icon: "📖", category: "Exegesis" },
    { title: "How do I trust God in uncertainty?", icon: "✨", category: "Wisdom" },
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    onAskAiPrompt(quickQuery);
    setQuickQuery('');
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Top Banner Bento Card */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2448B1] to-[#122452] text-white p-6 rounded-[28px] sm:rounded-[32px] shadow-xl border border-blue-700/50 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-200 tracking-wide flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5 text-amber-300" />
              {getTimeGreeting()}, {user.name.split(' ')[0]}
            </span>
            <span className="text-[10px] bg-white/10 backdrop-blur-md border border-white/20 text-[#D4AF37] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {user.streakDays} Day Streak
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
            Grow closer to God today.
          </h2>
          <p className="text-xs text-blue-100/90 leading-relaxed mb-5">
            "Your word is a lamp for my feet, a light on my path." — Psalm 119:105
          </p>

          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => setActiveTab('bible')}
              className="flex-1 py-2.5 px-4 bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <BookOpen className="w-4 h-4" />
              Continue Reading
            </button>

            {!user.isPremium && (
              <button
                onClick={onOpenUpgrade}
                className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-300/40 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Go Premium
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Daily Streak Calendar Card */}
      <StreakCalendar user={user} />

      {/* Bento Grid Layout (Stacked on mobile, 12-col grid on wide) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Daily Verse Bento Card (Col span 12 / 8) */}
        <div className="md:col-span-12 lg:col-span-7 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-[28px] sm:rounded-[32px] p-6 text-white relative overflow-hidden shadow-lg shadow-blue-900/10 flex flex-col justify-between">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border border-white/10">
                  Daily Verse
                </span>
                <button
                  onClick={() => setShowWidgetConfigModal(true)}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-extrabold text-blue-100 flex items-center gap-1 border border-white/10 transition-all active:scale-95"
                  title="Customize Widget Translation & Options"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#D4AF37]" />
                  <span>{selectedWidgetTranslation} Widget</span>
                </button>
              </div>
              <span className="text-xs font-bold text-[#D4AF37]">
                {activeDailyVerse.reference} ({activeDailyVerse.translation})
              </span>
            </div>

            <div className="my-2">
              <p className="text-base sm:text-lg font-serif italic text-white leading-relaxed">
                "{activeDailyVerse.text}"
              </p>
            </div>

            {showDevotionalContext && (
              <p className="text-xs text-blue-100/80 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 animate-fadeIn">
                💡 {activeDailyVerse.context}
              </p>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between relative z-10 gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() =>
                  onSaveVerse({
                    bookName: 'Romans',
                    chapter: 8,
                    verse: 28,
                    text: activeDailyVerse.text,
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSaved
                    ? 'bg-[#D4AF37] text-[#1E3A8A]'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#1E3A8A]' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={handleCopyDailyVerse}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs flex items-center gap-1.5 font-bold transition-all"
                title="Copy Verse to Clipboard"
              >
                {copiedDailyVerse ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-200" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSocialPostModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] text-xs flex items-center gap-1.5 font-extrabold shadow-sm transition-all active:scale-95"
                title="Share as Social Post Card"
              >
                <Share2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Share as Social Post</span>
              </button>
            </div>

            <button
              onClick={() => onAskAiPrompt(`Explain the full context and background of ${activeDailyVerse.reference}`)}
              className="text-xs text-[#D4AF37] font-extrabold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </div>

          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Ask FaithPath AI Bento Card */}
        <div className="md:col-span-12 lg:col-span-5 bg-white rounded-[28px] sm:rounded-[32px] border border-slate-100 p-5 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-[#1E3A8A] rounded-2xl flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1E3A8A]">Ask FaithPath AI</h3>
                  <p className="text-[10px] text-slate-500">Instant biblical wisdom & guidance</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('ai')}
                className="text-xs text-[#1E3A8A] font-bold hover:underline flex items-center gap-0.5"
              >
                Open <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 mb-3">
              {promptSuggestions.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onAskAiPrompt(item.title)}
                  className="p-2.5 bg-slate-50 rounded-xl text-[11px] font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#1E3A8A] cursor-pointer border border-slate-100/80 transition-all flex items-center justify-between"
                >
                  <span className="truncate pr-2">{item.icon} {item.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleQuickSubmit} className="relative mt-2">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
            />
            <button
              type="submit"
              disabled={!quickQuery.trim()}
              className="absolute right-1.5 top-1.5 p-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </form>
        </div>

        {/* Daily Affirmation Bento Card */}
        <div className="md:col-span-12 lg:col-span-6 bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] rounded-[28px] sm:rounded-[32px] border border-amber-300/80 p-5 shadow-lg shadow-amber-900/5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold">
                  <Quote className="w-4 h-4 text-amber-900" />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    Daily Affirmation
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-white/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-300/60">
                {currentAffirmation.theme}
              </span>
            </div>

            <div className="my-3 space-y-2">
              <p className="text-base sm:text-lg font-serif italic text-amber-950 leading-relaxed font-semibold">
                "{currentAffirmation.quote}"
              </p>
              <p className="text-xs font-extrabold text-amber-900 tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                {currentAffirmation.scripture}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-amber-300/60 flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAffirmation}
                className="px-3 py-1.5 bg-white/90 hover:bg-white text-amber-900 rounded-xl text-xs font-bold border border-amber-300/80 flex items-center gap-1.5 shadow-2xs transition-all"
              >
                {copiedAffirmation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-800" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNextAffirmation}
                className="p-2 bg-white/90 hover:bg-white text-amber-900 rounded-xl text-xs border border-amber-300/80 transition-all hover:rotate-45"
                title="Next Affirmation"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-800" />
              </button>
            </div>

            <button
              onClick={() => onAskAiPrompt(`How can I live out this scripture affirmation in my day: "${currentAffirmation.quote}" (${currentAffirmation.scripture})?`)}
              className="text-xs font-extrabold text-[#1E3A8A] hover:underline flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Reflect with AI
            </button>
          </div>
        </div>

        {/* Scripture Randomizer Bento Card */}
        <div className="md:col-span-12 lg:col-span-6 bg-gradient-to-br from-indigo-900 via-[#1E3A8A] to-blue-950 text-white rounded-[28px] sm:rounded-[32px] border border-indigo-700/60 p-5 shadow-lg shadow-indigo-950/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-2xl bg-indigo-800/80 text-[#D4AF37] flex items-center justify-center font-bold border border-indigo-600/50 shadow-xs">
                  <Dices className={`w-4 h-4 text-[#D4AF37] transition-transform duration-500 ${isSpinning ? 'rotate-180 scale-110' : ''}`} />
                </span>
                <div>
                  <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-700/60">
                    Scripture Randomizer
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-200 bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-700/40">
                  {randomVerse.theme}
                </span>

                <button
                  onClick={handleRefreshRandomVerse}
                  disabled={isSpinning}
                  className="px-2.5 py-1 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs transition-all active:scale-95 shrink-0"
                  title="Refresh Random Verse"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#1E3A8A] ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Main Verse Content */}
            <div className={`my-3 p-3.5 bg-blue-950/60 rounded-2xl border border-indigo-700/40 backdrop-blur-xs transition-opacity duration-300 ${isSpinning ? 'opacity-40' : 'opacity-100'}`}>
              <p className="text-sm sm:text-base font-serif leading-relaxed text-blue-50 font-medium italic">
                "{randomVerse.text}"
              </p>
              <div className="mt-2.5 flex items-center justify-between text-xs font-extrabold text-[#D4AF37]">
                <span>— {randomVerse.reference} ({randomVerse.translation})</span>
                <span className="text-[10px] font-bold text-blue-300/80 uppercase">{randomVerse.bookName}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-indigo-800/80 flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSaveRandomVerse}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isRandomSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-indigo-900/60 hover:bg-indigo-800 text-blue-100 border-indigo-700/60'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isRandomSaved ? 'fill-amber-300 text-amber-300' : 'text-blue-300'}`} />
                <span>{isRandomSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleCopyRandomVerse}
                className="px-2.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-blue-100 rounded-xl text-xs font-bold border border-indigo-700/60 flex items-center gap-1.5 transition-all"
              >
                {copiedRandom ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => onAskAiPrompt(`Give me a deep devotional breakdown and practical daily application of ${randomVerse.reference}: "${randomVerse.text}"`)}
              className="text-xs font-extrabold text-white hover:text-amber-300 flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-3 py-1.5 rounded-xl border border-blue-400/40 shadow-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Explain with AI
            </button>
          </div>
        </div>

        {/* Daily Reading Plan Progress Bento Card */}
        <div className="md:col-span-12 lg:col-span-6 bg-white rounded-[28px] sm:rounded-[32px] border border-slate-100 p-5 shadow-lg shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold shadow-xs shrink-0">
                  <BookOpen className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-[#1E3A8A] uppercase tracking-widest bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/80">
                    Reading Plan Progress
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-0.5 truncate">
                    {activePlan.title}
                  </h4>
                </div>
              </div>

              {plans.length > 1 && (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="text-[11px] font-bold text-[#1E3A8A] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus:outline-none shrink-0"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Progress Bar Visual Component */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 my-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  Overall Completion
                </span>
                <span className="font-black text-[#1E3A8A] bg-blue-100/60 px-2 py-0.5 rounded-lg">
                  {completionPercent}%
                </span>
              </div>

              {/* Progress Bar Visual */}
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#D4AF37] rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${Math.max(completionPercent, 4)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-0.5 font-bold">
                <span>Day {activePlan.currentDay} of {activePlan.totalDays}</span>
                <span>{completedDaysCount} / {activePlan.totalDays} Days Completed</span>
              </div>
            </div>

            {/* Today's Reading Passage */}
            {todayPassage && (
              <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">
                      Day {todayPassage.dayNumber} Passage
                    </span>
                  </div>
                  <p className="text-xs font-black text-[#1E3A8A] truncate">{todayPassage.passage}</p>
                  <p className="text-[11px] text-slate-600 truncate">{todayPassage.title}</p>
                </div>

                <button
                  onClick={() => handleToggleTodayPassage(activePlan.id, todayPassage.dayNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shrink-0 shadow-xs ${
                    todayPassage.isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#1E3A8A] hover:bg-blue-900 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {todayPassage.isCompleted ? 'Done' : 'Mark Done'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-semibold">
              Category: {activePlan.category}
            </span>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs text-[#1E3A8A] font-extrabold hover:underline flex items-center gap-1"
            >
              All Plans <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Daily Devotional Bento Card */}
        <div className="md:col-span-12 lg:col-span-6 bg-white rounded-[28px] sm:rounded-[32px] border border-slate-100 p-5 shadow-lg shadow-slate-200/50 flex flex-col justify-between">
          <div>
            <div className="w-full h-24 bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100/60 rounded-2xl mb-3.5 overflow-hidden relative flex items-center p-4 border border-amber-200/60">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Morning Devotional
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mt-1">{devotional.title}</h4>
              </div>
            </div>

            <p className="text-xs font-bold text-[#1E3A8A] mb-1.5">
              Scripture: {devotional.scriptureRef}
            </p>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
              {devotional.body}
            </p>
          </div>

          <button
            onClick={onOpenDevotional}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-[#1E3A8A] font-extrabold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            Read Full Devotional
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

        {/* Prayer Journal Bento Box */}
        <div className="md:col-span-12 lg:col-span-6 bg-[#F0F4FF] rounded-[28px] sm:rounded-[32px] border border-indigo-100/90 p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-extrabold text-sm text-[#1E3A8A] flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                Prayer & Gratitude Journal
              </h4>
              <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">
                Active Entries
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="bg-white p-3 rounded-2xl flex items-center gap-3 border border-indigo-50 shadow-xs">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Peace for family transition</p>
                  <p className="text-[10px] text-slate-500">Answered Testimony!</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              <div className="bg-white p-3 rounded-2xl flex items-center gap-3 border border-indigo-50 shadow-xs">
                <div className="w-1.5 h-8 bg-amber-400 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Healing for Grandmother</p>
                  <p className="text-[10px] text-slate-500">Logged yesterday • Seeking</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('prayer')}
            className="w-full py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-2xl text-xs font-extrabold shadow-md transition-colors"
          >
            + New Prayer Entry
          </button>
        </div>

        {/* Global Community Prayer Wall Bento Section */}
        <div className="col-span-12">
          <CommunityPrayerWall />
        </div>
      </div>

      {/* SHARE DAILY VERSE AS SOCIAL POST MODAL */}
      {showSocialPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowSocialPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center font-bold shadow-md">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Share Daily Verse as Social Post</h3>
                <p className="text-[11px] text-slate-500">Pick a background theme & generate shareable card</p>
              </div>
            </div>

            {/* Theme Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <span>Select Background Theme:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((theme) => {
                  const isSelected = selectedSocialTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedSocialTheme(theme)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all flex flex-col justify-between h-14 relative overflow-hidden ${
                        isSelected
                          ? 'border-[#1E3A8A] ring-2 ring-[#1E3A8A]/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${theme.gradientCss} opacity-90`}
                      />
                      <div className="relative z-10 flex items-center justify-between w-full">
                        <span 
                          className="font-extrabold text-[10px] truncate max-w-[80%]"
                          style={{ color: theme.textColor }}
                        >
                          {theme.name}
                        </span>
                        {isSelected && (
                          <div 
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: theme.accentColor, color: '#1E3A8A' }}
                          >
                            <Check className="w-2.5 h-2.5 font-bold" />
                          </div>
                        )}
                      </div>
                      <div className="relative z-10 flex items-center gap-1 mt-auto">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.borderColor }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Card Preview */}
            <div 
              className={`bg-gradient-to-br ${selectedSocialTheme.gradientCss} p-6 rounded-2xl shadow-lg space-y-3 text-center relative overflow-hidden border transition-all duration-300`}
              style={{ borderColor: selectedSocialTheme.borderColor }}
            >
              <div 
                className="w-8 h-8 mx-auto rounded-full border flex items-center justify-center font-bold text-sm"
                style={{ 
                  backgroundColor: `${selectedSocialTheme.accentColor}20`,
                  borderColor: selectedSocialTheme.accentColor,
                  color: selectedSocialTheme.accentColor
                }}
              >
                ✝
              </div>

              <p 
                className="text-sm sm:text-base font-serif italic leading-relaxed px-2"
                style={{ color: selectedSocialTheme.textColor }}
              >
                "{DAILY_VERSE_OF_THE_DAY.text}"
              </p>

              <div className="pt-2 border-t" style={{ borderColor: `${selectedSocialTheme.accentColor}40` }}>
                <p className="text-xs font-black tracking-wide" style={{ color: selectedSocialTheme.accentColor }}>
                  {DAILY_VERSE_OF_THE_DAY.reference} ({DAILY_VERSE_OF_THE_DAY.translation})
                </p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: selectedSocialTheme.subTextColor }}>
                  FaithPath AI • Verse of the Day
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const ref = `${DAILY_VERSE_OF_THE_DAY.reference} (${DAILY_VERSE_OF_THE_DAY.translation})`;
                  downloadVerseCardImage(DAILY_VERSE_OF_THE_DAY.text, ref, selectedSocialTheme);
                }}
                className="w-full py-3 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4 text-[#1E3A8A]" />
                Download High-Res Card (.PNG)
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopySocialCaption}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Caption Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Caption & Tags</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Daily Verse - FaithPath AI',
                        text: `✨ Daily Verse ✨\n"${DAILY_VERSE_OF_THE_DAY.text}" — ${DAILY_VERSE_OF_THE_DAY.reference}`
                      });
                    } else {
                      handleCopySocialCaption();
                      alert('Caption copied! Ready to paste into Instagram, Facebook, or X.');
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Native Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZABLE WIDGET CONFIGURATION MODAL */}
      {showWidgetConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowWidgetConfigModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center font-bold shadow-md shrink-0">
                <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Configure Verse Widget</h3>
                <p className="text-[11px] text-slate-500">Pick preferred translation & display settings</p>
              </div>
            </div>

            {/* Translation Selection Section */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Preferred Bible Translation
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'NIV' as BibleTranslation, name: 'NIV', desc: 'New International' },
                  { code: 'KJV' as BibleTranslation, name: 'KJV', desc: 'King James Version' },
                  { code: 'ESV' as BibleTranslation, name: 'ESV', desc: 'English Standard' },
                  { code: 'WEB' as BibleTranslation, name: 'WEB', desc: 'World English Bible' },
                ].map((trans) => {
                  const isSelected = selectedWidgetTranslation === trans.code;
                  return (
                    <button
                      key={trans.code}
                      type="button"
                      onClick={() => {
                        setSelectedWidgetTranslation(trans.code);
                        if (onChangeTranslation) onChangeTranslation(trans.code);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#1E3A8A] bg-blue-50/70 ring-2 ring-[#1E3A8A]/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-black text-xs ${isSelected ? 'text-[#1E3A8A]' : 'text-slate-800'}`}>
                          {trans.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">
                        {trans.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Verse Preview Box */}
            <div className="p-4 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] rounded-2xl text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-[#D4AF37] font-bold">
                <span>PREVIEW ({activeDailyVerse.translation})</span>
                <span>{activeDailyVerse.reference}</span>
              </div>
              <p className="text-xs font-serif italic leading-relaxed text-white">
                "{activeDailyVerse.text}"
              </p>
            </div>

            {/* Display Options Toggle */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Display Options
              </label>

              <button
                type="button"
                onClick={() => setShowDevotionalContext(!showDevotionalContext)}
                className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  {showDevotionalContext ? (
                    <Eye className="w-4 h-4 text-[#1E3A8A]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  )}
                  <div className="text-left">
                    <span className="font-bold text-slate-800 block">Show Devotional Insights</span>
                    <span className="text-[10px] text-slate-500">Displays spiritual commentary under verse</span>
                  </div>
                </div>

                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  showDevotionalContext ? 'bg-[#1E3A8A]' : 'bg-slate-300'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    showDevotionalContext ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </div>
              </button>
            </div>

            {/* Save & Apply */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowWidgetConfigModal(false)}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Check className="w-4 h-4 text-[#D4AF37]" />
                Apply Widget Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

