import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Crown, 
  Bookmark, 
  Flame, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Calendar,
  Layers,
  Share2,
  Volume2,
  Database,
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  Shield,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { UserProfile, SavedVerse, ReadingPlan, NotificationSetting, BibleTranslation, PrayerEntry } from '../types';
import { offlineStorage } from '../services/offlineStorageService';
import { PrivacyPolicy } from './PrivacyPolicy';

interface ProfileTabProps {
  user: UserProfile;
  savedVerses: SavedVerse[];
  onRemoveSavedVerse: (id: string) => void;
  readingPlans: ReadingPlan[];
  prayers?: PrayerEntry[];
  notifications: NotificationSetting;
  onUpdateNotifications: (settings: Partial<NotificationSetting>) => void;
  onOpenUpgrade: () => void;
  onOpenAuth: () => void;
  onOpenSermonSummarizer: () => void;
  onOpenStudyPlanModal: () => void;
  preferredTranslation: BibleTranslation;
  onChangeTranslation: (t: BibleTranslation) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  savedVerses,
  onRemoveSavedVerse,
  readingPlans,
  prayers = [],
  notifications,
  onUpdateNotifications,
  onOpenUpgrade,
  onOpenAuth,
  onOpenSermonSummarizer,
  onOpenStudyPlanModal,
  preferredTranslation,
  onChangeTranslation
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'saved' | 'plans' | 'settings' | 'privacy'>('overview');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  const handleExportData = () => {
    setIsExporting(true);
    setExportSuccessMsg(null);

    // Read stored highlights and prayers fallback if needed
    let savedHighlights = [];
    try {
      const rawHighlights = localStorage.getItem('faithpath_highlights');
      if (rawHighlights) savedHighlights = JSON.parse(rawHighlights);
    } catch (e) {}

    let activePrayers = prayers;
    if (!activePrayers || activePrayers.length === 0) {
      try {
        const rawPrayers = localStorage.getItem('faithpath_prayers');
        if (rawPrayers) activePrayers = JSON.parse(rawPrayers);
      } catch (e) {}
    }

    const exportPayload = {
      exportMetadata: {
        appName: 'FaithConnect',
        exportVersion: '1.0',
        exportedAt: new Date().toISOString(),
        totalItemsCount: savedVerses.length + activePrayers.length + readingPlans.length + savedHighlights.length,
        itemBreakdown: {
          savedVersesCount: savedVerses.length,
          prayerEntriesCount: activePrayers.length,
          readingPlansCount: readingPlans.length,
          verseHighlightsCount: savedHighlights.length
        }
      },
      userProfile: {
        name: user.name,
        email: user.email,
        joinedDate: user.joinedDate,
        preferredTranslation: user.preferredTranslation,
        streakDays: user.streakDays
      },
      savedVerses,
      prayerJournal: activePrayers,
      readingPlanHistory: readingPlans,
      verseHighlights: savedHighlights
    };

    setTimeout(() => {
      try {
        const jsonString = JSON.stringify(exportPayload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `faithpath_backup_${todayStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setExportSuccessMsg(`Successfully exported backup file with ${savedVerses.length} Saved Verses, ${activePrayers.length} Prayer Entries, and ${readingPlans.length} Study Plans!`);
      } catch (err) {
        alert('Could not complete data export. Please try again.');
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2A4AA5] to-[#0F2355] text-white p-6 rounded-[28px] sm:rounded-[32px] shadow-lg border border-blue-700/60 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name || "User profile"}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-900 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-md">
                  <User className="w-7 h-7" />
                </div>
              )}
              {user.isPremium && (
                <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#1E3A8A] p-1 rounded-full shadow-xs" title="Premium Active">
                  <Crown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-extrabold text-white">{user.name || 'FaithPath Pilgrim'}</h2>
                <span className="text-[10px] font-black bg-gradient-to-r from-[#D4AF37] to-amber-300 text-[#1E3A8A] px-2.5 py-0.5 rounded-full shadow-xs border border-amber-300/40">
                  30-DAY FREE TRIAL
                </span>
              </div>
              <p className="text-xs text-blue-200">{user.email || 'Sign in or personalize your profile'}</p>
              <p className="text-[10px] text-blue-300 mt-0.5">Member since {user.joinedDate || 'August 2026'}</p>
            </div>
          </div>

          <button
            onClick={onOpenAuth}
            className="p-2 text-blue-200 hover:text-white bg-blue-800/60 rounded-xl"
            title="Edit Profile or Switch User"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* 30-Day Free Premium Trial Status Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-900/60 to-blue-950/80 border border-amber-400/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] text-[#1E3A8A] flex items-center justify-center shrink-0 font-bold shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-amber-200 flex items-center gap-1">
                <span>30-Day Free Trial Active</span>
                <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-black">
                  {user.trialDaysRemaining ?? 30} DAYS LEFT
                </span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-tight">
                All premium AI features, custom study plans, and voice audio study unlocked $0.00.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUpgrade}
            className="px-3 py-1.5 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-extrabold text-[11px] rounded-xl shrink-0 shadow-sm transition-all"
          >
            Manage
          </button>
        </div>

        {/* Growth Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-blue-700/60 text-center">
          <div className="bg-blue-900/40 p-2.5 rounded-2xl border border-blue-700/40">
            <span className="text-base font-extrabold text-amber-300 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              {user.streakDays}
            </span>
            <span className="text-[10px] text-blue-200 font-medium">Day Streak</span>
          </div>

          <div className="bg-blue-900/40 p-2.5 rounded-2xl border border-blue-700/40">
            <span className="text-base font-extrabold text-white">
              {savedVerses.length}
            </span>
            <span className="text-[10px] text-blue-200 font-medium">Saved Verses</span>
          </div>

          <div className="bg-blue-900/40 p-2.5 rounded-2xl border border-blue-700/40">
            <span className="text-base font-extrabold text-white">
              {user.readingProgressCount}
            </span>
            <span className="text-[10px] text-blue-200 font-medium">Chapters Read</span>
          </div>
        </div>

        {/* Upgrade Banner if Free */}
        {!user.isPremium && (
          <button
            onClick={onOpenUpgrade}
            className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#C29F2F] hover:to-[#A2801F] text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4" />
              <span>Upgrade to FaithPath Premium</span>
            </div>
            <span className="text-[10px] uppercase font-black bg-[#1E3A8A] text-white px-2 py-0.5 rounded-md">
              Unlock All AI
            </span>
          </button>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center bg-white p-1.5 rounded-[22px] border border-slate-100 shadow-md shadow-slate-200/40">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSection === 'overview' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveSection('saved')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSection === 'saved' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Verses ({savedVerses.length})
        </button>
        <button
          onClick={() => setActiveSection('plans')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSection === 'plans' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Plans
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSection === 'settings' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveSection('privacy')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeSection === 'privacy' ? 'bg-[#1E3A8A] text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Privacy
        </button>
      </div>

      {/* SECTION 1: AI TOOLS & FEATURES */}
      {activeSection === 'overview' && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-1">
            FaithPath AI Premium Tools
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Tool 1: AI Study Plan Generator */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Personalized AI Study Plans</h4>
                  <p className="text-[11px] text-slate-500">Generate 7-day or 30-day topical Bible plans.</p>
                </div>
              </div>
              <button
                onClick={onOpenStudyPlanModal}
                className="py-1.5 px-3 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors shrink-0"
              >
                Generate
              </button>
            </div>

            {/* Tool 2: AI Sermon Summarizer */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Sermon & Lecture Summarizer</h4>
                  <p className="text-[11px] text-slate-500">Extract key takeaways & application steps.</p>
                </div>
              </div>
              <button
                onClick={onOpenSermonSummarizer}
                className="py-1.5 px-3 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors shrink-0"
              >
                Summarize
              </button>
            </div>

            {/* Tool 3: Voice AI Study */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Volume2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Voice AI Bible Study</h4>
                  <p className="text-[11px] text-slate-500">Audio narration & speech synthesis integrated.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SAVED VERSES */}
      {activeSection === 'saved' && (
        <div className="space-y-3">
          {savedVerses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center space-y-2 border border-slate-200">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No saved verses yet</h4>
              <p className="text-xs text-slate-500">Tap the bookmark icon on any verse while reading the Bible or Verse of the Day to save it here.</p>
            </div>
          ) : (
            savedVerses.map((verse) => (
              <div key={verse.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#1E3A8A]">
                    {verse.bookName} {verse.chapter}:{verse.verse} ({verse.translation})
                  </span>
                  <button
                    onClick={() => onRemoveSavedVerse(verse.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Remove Saved Verse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-serif text-slate-800 italic pl-2 border-l-2 border-[#D4AF37]">
                  "{verse.text}"
                </p>
                <p className="text-[10px] text-slate-400 text-right">Saved {verse.dateSaved}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 3: READING PLANS */}
      {activeSection === 'plans' && (
        <div className="space-y-3">
          {readingPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {plan.category}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">{plan.title}</h4>
                  <p className="text-xs text-slate-500 leading-snug">{plan.description}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Progress</span>
                  <span>{plan.currentDay} of {plan.totalDays} Days</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#1E3A8A] to-[#D4AF37] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(plan.currentDay / plan.totalDays) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: SETTINGS */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          {/* Offline Storage & Offline Bible Cache Panel */}
          <div className="bg-gradient-to-br from-blue-950 via-[#1E3A8A] to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-blue-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  Offline Bible & Devotional Storage
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Active
              </span>
            </div>

            <p className="text-xs text-blue-100 leading-relaxed">
              All Bible chapters and daily devotionals you read are automatically stored in local browser cache for offline access without an internet connection.
            </p>

            {/* Offline Cache Stats */}
            <div className="grid grid-cols-3 gap-2 bg-blue-900/40 p-3 rounded-xl border border-blue-700/40 text-center">
              <div>
                <span className="block text-sm font-black text-amber-300">
                  {offlineStorage.getStats().cachedChaptersCount}
                </span>
                <span className="text-[10px] text-blue-200">Chapters Saved</span>
              </div>
              <div>
                <span className="block text-sm font-black text-white">
                  {offlineStorage.getStats().cachedDevotionalsCount}
                </span>
                <span className="text-[10px] text-blue-200">Devotionals</span>
              </div>
              <div>
                <span className="block text-sm font-black text-emerald-300">
                  ~{offlineStorage.getStats().estimatedStorageKb} KB
                </span>
                <span className="text-[10px] text-blue-200">Local Cache</span>
              </div>
            </div>

            <button
              onClick={() => {
                offlineStorage.preloadCoreScriptures();
                alert('Success! All core Bible books (Genesis, Psalms, Proverbs, Isaiah, Matthew, John, Romans, Philippians, Revelation) and 30-Day Devotionals are pre-loaded into local browser cache for full offline access.');
                window.location.reload();
              }}
              className="w-full py-2 px-3 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Pre-Download Full Core Bible Library for Offline Use
            </button>
          </div>

          {/* Data Export & Personal Backup Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                  <Database className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Personal Data Export & Backup</h3>
                  <p className="text-[10px] text-slate-500">Download a full JSON copy of your spiritual entries.</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                JSON Backup
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Back up your entire personal profile including saved scripture verses, prayer journal entries, reading plan progress, and verse highlights.
            </p>

            {/* Quick Stats Grid of Content Ready to Export */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-xs">
              <div>
                <span className="block font-black text-[#1E3A8A] text-sm">{savedVerses.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Saved Verses</span>
              </div>
              <div>
                <span className="block font-black text-amber-600 text-sm">{prayers.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Prayer Entries</span>
              </div>
              <div>
                <span className="block font-black text-blue-600 text-sm">{readingPlans.length}</span>
                <span className="text-[10px] text-slate-500 font-medium">Study Plans</span>
              </div>
            </div>

            {exportSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              {isExporting ? 'Generating JSON Backup...' : 'Export Personal Data (.JSON)'}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              App Settings & Notifications
            </h3>

            <div className="space-y-3 text-xs">
              {/* Preferred Translation */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Default Bible Translation</p>
                  <p className="text-[10px] text-slate-500">Select your primary translation for reading.</p>
                </div>
                <select
                  value={preferredTranslation}
                  onChange={(e) => onChangeTranslation(e.target.value as BibleTranslation)}
                  className="py-1 px-2.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-[#1E3A8A]"
                >
                  <option value="NIV">NIV</option>
                  <option value="KJV">KJV</option>
                  <option value="ESV">ESV</option>
                  <option value="WEB">WEB</option>
                </select>
              </div>

              {/* Push Notifications Permission Requester */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">System Notification Permissions</p>
                  <p className="text-[10px] text-slate-500">Allow browser & OS push alerts for daily verses.</p>
                </div>
                <button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                          console.log('The user accepted');
                          // Check for ServiceWorker registration showNotification with actions support
                          if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.ready.then(registration => {
                              registration.showNotification("Your content is ready", {
                                body: "Your content is ready to be viewed. View it now?",
                                icon: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=192",
                                // @ts-expect-error actions is standard in ServiceWorker NotificationOptions
                                actions: [
                                  { action: "view", title: "View" },
                                  { action: "dismiss", title: "Dismiss" }
                                ]
                              });
                            }).catch(() => {
                              try {
                                new Notification("Your content is ready", {
                                  body: "Your content is ready to be viewed. View it now?",
                                  icon: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=192"
                                });
                              } catch (e) {}
                            });
                          } else {
                            try {
                              new Notification("Your content is ready", {
                                body: "Your content is ready to be viewed. View it now?",
                                icon: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=192"
                              });
                            } catch (e) {}
                          }
                          onUpdateNotifications({ dailyVerseEnabled: true, prayerReminderEnabled: true });
                        } else {
                          console.log('Notification permission:', permission);
                        }
                      }).catch(e => {
                        console.error('Error requesting notification permission', e);
                      });
                    } else {
                      alert('Web Notifications API is not supported in this browser environment.');
                    }
                  }}
                  className="px-3 py-1.5 bg-[#1E3A8A] text-white hover:bg-blue-900 font-extrabold text-[11px] rounded-lg shadow-xs transition-colors"
                >
                  Enable & Test
                </button>
              </div>

              {/* Daily Verse Notification */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Daily Verse Notifications</p>
                  <p className="text-[10px] text-slate-500">Receive scripture encouraging push notifications.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyVerseEnabled}
                  onChange={(e) => onUpdateNotifications({ dailyVerseEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#1E3A8A] cursor-pointer"
                />
              </div>

              {/* Prayer Reminder */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Evening Prayer Reminders</p>
                  <p className="text-[10px] text-slate-500">Remind me to log prayers and gratitude.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.prayerReminderEnabled}
                  onChange={(e) => onUpdateNotifications({ prayerReminderEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#1E3A8A] cursor-pointer"
                />
              </div>

              {/* Privacy Policy & Terms */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Privacy & Data Security</p>
                  <p className="text-[10px] text-slate-500">Read our strict user data protection pledge.</p>
                </div>
                <button
                  onClick={() => setActiveSection('privacy')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5 text-[#0d4c73]" />
                  <span>View Policy</span>
                </button>
              </div>

              {/* Android Package & Bundle Download */}
              <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-[#0d4c73] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Google Play Android Package (.ZIP)</h4>
                    <p className="text-[10px] text-slate-600 leading-normal">
                      Download the complete Android Gradle project with icons and manifest configured for <strong>com.faithconnectapp.live</strong>.
                    </p>
                  </div>
                </div>
                <a
                  href="/api/download-android-project"
                  download="faithconnect-android-package.zip"
                  className="w-full py-2 bg-[#0d4c73] hover:bg-[#082f49] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Android Project (.ZIP)</span>
                </a>
              </div>

              {/* Reset App State */}
              <button
                onClick={() => {
                  if (confirm('Reset local cached settings and data?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Local App Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PRIVACY POLICY & COMPLIANCE */}
      {activeSection === 'privacy' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Legal & Privacy Compliance
            </h3>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0d4c73] font-bold hover:underline flex items-center gap-1"
            >
              <span>Open in Browser</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <PrivacyPolicy />
        </div>
      )}
    </div>
  );
};
