import React, { useState } from 'react';
import { UserProfile, NavTab, DailyDevotional, ReadingPlan, BibleTranslation } from '../types';
import { CommunityPrayerWall } from './CommunityPrayerWall';
import { DailyVerseWidget } from './DailyVerseWidget';
import { DailyPrayerPromptWidget } from './DailyPrayerPromptWidget';
import { StreakCalendar } from './StreakCalendar';
import { MergedProjectsHub } from './MergedProjectsHub';
import { HeartHandshake, Sparkles, Download, Image as ImageIcon, Check, Share2, ExternalLink } from 'lucide-react';
import faithpathCoverImage from '../assets/images/faithpath_cover_photo_1786516656210.jpg';

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
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = faithpathCoverImage;
    a.download = 'FaithPath_App_Cover_Photo_851x315.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + faithpathCoverImage);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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

      {/* Official FaithPath Cover Photo Card */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-[#D4AF37] border border-amber-200/60">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">FaithPath Cover Photo</h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-100">
                  851 × 315 Banner
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Warm, text-free visual illustrating community connection, love, and service in action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#1E3A8A] hover:bg-blue-900 text-white flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-blue-900/20"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Image</span>
            </button>
          </div>
        </div>

        {/* Cover Image Container */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-100">
          <img
            src={faithpathCoverImage}
            alt="FaithPath Community Cover"
            className="w-full h-auto aspect-[851/315] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white text-xs font-semibold flex items-center justify-between w-full">
              <span>FaithPath App Page Cover • Community & Service in Action</span>
              <a
                href={faithpathCoverImage}
                target="_blank"
                rel="noreferrer"
                className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg hover:bg-white/30 text-white flex items-center gap-1 text-[11px]"
              >
                Open Original <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
