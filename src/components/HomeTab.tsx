import React from 'react';
import { UserProfile, NavTab, DailyDevotional, ReadingPlan, BibleTranslation } from '../types';
import { CommunityPrayerWall } from './CommunityPrayerWall';
import { DailyVerseWidget } from './DailyVerseWidget';
import { DailyPrayerPromptWidget } from './DailyPrayerPromptWidget';
import { StreakCalendar } from './StreakCalendar';
import { MergedProjectsHub } from './MergedProjectsHub';
import { HeartHandshake, Sparkles } from 'lucide-react';

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
  onChangeTranslation
}) => {
  return (
    <div className="space-y-4 pb-16 w-full max-w-full min-w-0 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#1D4ED8] text-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-xl border border-blue-700/50 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#D4AF37] text-[#1E3A8A] px-3 py-1 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3" /> Community Fellowship & Devotion
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              Welcome back, {user.name || 'Friend'}!
            </h1>
            <p className="text-xs text-blue-100 max-w-md mt-1 leading-relaxed">
              Grow closer to God today through Scripture, spiritual check-ins, and standing together in prayer with thousands of believers globally.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
            <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />
            <div>
              <div className="text-[10px] font-bold text-blue-200 uppercase">Global Prayer Network</div>
              <div className="text-xs font-black text-white">Always Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Verse Widget */}
      <DailyVerseWidget
        onSaveVerse={onSaveVerse}
        isSaved={savedVerseKeys.has('Romans-8-28')}
        onAskAiPrompt={onAskAiPrompt}
        preferredTranslation={user.preferredTranslation}
        onChangeTranslation={onChangeTranslation}
      />

      {/* NEW: Daily Prayer Prompt Section */}
      <DailyPrayerPromptWidget
        onAskAiPrompt={onAskAiPrompt}
        setActiveTab={setActiveTab}
      />

      {/* Spiritual Streak Calendar */}
      <StreakCalendar
        user={user}
      />

      {/* Option 1: Merged Church & Ministry Projects Hub */}
      <MergedProjectsHub />

      {/* Community Prayer Wall */}
      <CommunityPrayerWall />
    </div>
  );
};
