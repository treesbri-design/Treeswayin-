import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { BibleTab } from './components/BibleTab';
import { AiTab } from './components/AiTab';
import { PrayerTab } from './components/PrayerTab';
import { ProfileTab } from './components/ProfileTab';

import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './components/AuthModal';
import { DevotionalModal } from './components/DevotionalModal';
import { SermonSummarizerModal } from './components/SermonSummarizerModal';
import { StudyPlanModal } from './components/StudyPlanModal';
import { NotificationModal } from './components/NotificationModal';

import { 
  UserProfile, 
  NavTab, 
  SavedVerse, 
  VerseHighlight, 
  PrayerEntry, 
  ReadingPlan, 
  AIChatMessage, 
  NotificationSetting, 
  BibleTranslation 
} from './types';

import { INITIAL_DEVOTIONAL, INITIAL_READING_PLANS, DAILY_VERSE_OF_THE_DAY } from './data/devotionals';

export default function App() {
  // Mobile Frame vs Fullscreen mode
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // User State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('faithpath_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return {
          ...parsed,
          isPremium: true,
          trialDaysRemaining: parsed.trialDaysRemaining ?? 30,
          trialStartDate: parsed.trialStartDate || new Date().toISOString().split('T')[0]
        };
      } catch (e) {}
    }
    return {
      id: 'usr-1',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@gmail.com',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      isPremium: true,
      trialDaysRemaining: 30,
      trialStartDate: new Date().toISOString().split('T')[0],
      streakDays: 7,
      lastActiveDate: new Date().toISOString().split('T')[0],
      preferredTranslation: 'NIV',
      readingProgressCount: 14,
      joinedDate: 'July 2026'
    };
  });

  // Saved Verses State
  const [savedVerses, setSavedVerses] = useState<SavedVerse[]>(() => {
    const saved = localStorage.getItem('faithpath_saved_verses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'sv-1',
        bookName: 'Romans',
        chapter: 8,
        verse: 28,
        text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
        translation: 'NIV',
        dateSaved: 'Today'
      }
    ];
  });

  // Saved Verse Keys Set for O(1) lookup
  const savedVerseKeys = new Set(savedVerses.map(v => `${v.bookName}-${v.chapter}-${v.verse}`));

  // Highlights State
  const [highlights, setHighlights] = useState<VerseHighlight[]>(() => {
    const saved = localStorage.getItem('faithpath_highlights');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'hl-1',
        verseId: 'Psalms-23-1',
        bookName: 'Psalms',
        chapter: 23,
        verse: 1,
        text: 'The LORD is my shepherd, I lack nothing.',
        color: 'gold',
        date: 'Yesterday'
      }
    ];
  });

  // Prayer Journal State
  const [prayers, setPrayers] = useState<PrayerEntry[]>(() => {
    const saved = localStorage.getItem('faithpath_prayers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'pr-1',
        title: 'Peace & Wisdom for New Job Transition',
        content: 'Heavenly Father, as I start this new career chapter, please grant me clarity, diligence, and peaceful confidence in Your plans.',
        category: 'Guidance',
        mood: 'Hopeful',
        isAnswered: true,
        answeredDate: 'July 24, 2026',
        testimonyNote: 'God granted immense favor during interview and team onboarding!',
        createdAt: 'July 18, 2026'
      },
      {
        id: 'pr-2',
        title: 'Healing for Grandmother',
        content: 'Lord Jesus, place Your healing touch upon my grandmother and restore her strength.',
        category: 'Healing',
        mood: 'Seeking',
        isAnswered: false,
        createdAt: 'July 26, 2026'
      }
    ];
  });

  // Reading Plans State
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>(() => {
    const saved = localStorage.getItem('faithpath_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_READING_PLANS;
  });

  // AI Messages State
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>(() => {
    const saved = localStorage.getItem('faithpath_ai_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Notifications Settings State
  const [notifications, setNotifications] = useState<NotificationSetting>(() => {
    const saved = localStorage.getItem('faithpath_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      dailyVerseEnabled: true,
      dailyVerseTime: '08:00',
      prayerReminderEnabled: true,
      prayerReminderTime: '20:00',
      readingPlanReminderEnabled: true
    };
  });

  // Translation state
  const [preferredTranslation, setPreferredTranslation] = useState<BibleTranslation>(user.preferredTranslation || 'NIV');

  // Modals state
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [showDevotionalModal, setShowDevotionalModal] = useState<boolean>(false);
  const [showSermonModal, setShowSermonModal] = useState<boolean>(false);
  const [showStudyPlanModal, setShowStudyPlanModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Persist State Changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('faithpath_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('faithpath_saved_verses', JSON.stringify(savedVerses));
  }, [savedVerses]);

  useEffect(() => {
    localStorage.setItem('faithpath_highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('faithpath_prayers', JSON.stringify(prayers));
  }, [prayers]);

  useEffect(() => {
    localStorage.setItem('faithpath_plans', JSON.stringify(readingPlans));
  }, [readingPlans]);

  useEffect(() => {
    localStorage.setItem('faithpath_ai_chats', JSON.stringify(aiMessages));
  }, [aiMessages]);

  useEffect(() => {
    localStorage.setItem('faithpath_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const handleSaveVerse = (verse: { bookName: string; chapter: number; verse: number; text: string }) => {
    const key = `${verse.bookName}-${verse.chapter}-${verse.verse}`;
    if (savedVerseKeys.has(key)) {
      setSavedVerses(prev => prev.filter(v => !(v.bookName === verse.bookName && v.chapter === verse.chapter && v.verse === verse.verse)));
    } else {
      const newSaved: SavedVerse = {
        id: `sv-${Date.now()}`,
        bookName: verse.bookName,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        translation: preferredTranslation,
        dateSaved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      setSavedVerses(prev => [newSaved, ...prev]);
    }
  };

  const handleToggleHighlight = (verseId: string, bookName: string, chapter: number, verse: number, text: string, color: VerseHighlight['color'] = 'gold') => {
    const existing = highlights.find(h => h.verseId === verseId);
    if (existing && existing.color === color) {
      setHighlights(prev => prev.filter(h => h.verseId !== verseId));
    } else {
      const newHl: VerseHighlight = {
        id: `hl-${Date.now()}`,
        verseId,
        bookName,
        chapter,
        verse,
        text,
        color,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      setHighlights(prev => [newHl, ...prev.filter(h => h.verseId !== verseId)]);
    }
  };

  const handleAddPrayer = (entry: Omit<PrayerEntry, 'id' | 'createdAt' | 'isAnswered'>) => {
    const newEntry: PrayerEntry = {
      ...entry,
      id: `pr-${Date.now()}`,
      isAnswered: false,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setPrayers(prev => [newEntry, ...prev]);
  };

  const handleToggleAnsweredPrayer = (id: string, testimonyNote?: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isAnswered: true,
          answeredDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          testimonyNote: testimonyNote || p.testimonyNote
        };
      }
      return p;
    }));
  };

  const handleDeletePrayer = (id: string) => {
    setPrayers(prev => prev.filter(p => p.id !== id));
  };

  const handleAskAiPrompt = (promptText: string) => {
    setAiInitialPrompt(promptText);
    setActiveTab('ai');
  };

  const handleUpgradeSuccess = () => {
    setUser(prev => ({ 
      ...prev, 
      isPremium: true,
      trialDaysRemaining: 30,
      trialStartDate: new Date().toISOString().split('T')[0]
    }));
    alert('🎉 Congratulations! Your 30-Day Free Premium Trial is active with full access to all AI features.');
  };

  const handleTogglePlanDay = (planId: string, dayNumber: number) => {
    setReadingPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const updatedDays = p.days.map(d => {
          if (d.dayNumber === dayNumber) {
            return { ...d, isCompleted: !d.isCompleted };
          }
          return d;
        });
        const completedCount = updatedDays.filter(d => d.isCompleted).length;
        return {
          ...p,
          currentDay: Math.min(completedCount + 1, p.totalDays),
          days: updatedDays
        };
      }
      return p;
    }));
  };

  // Main Tab Content Renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            user={user}
            devotional={INITIAL_DEVOTIONAL}
            onOpenDevotional={() => setShowDevotionalModal(true)}
            setActiveTab={setActiveTab}
            onAskAiPrompt={handleAskAiPrompt}
            onSaveVerse={handleSaveVerse}
            savedVerseKeys={savedVerseKeys}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            readingPlans={readingPlans}
            onTogglePlanDay={handleTogglePlanDay}
            onChangeTranslation={(t) => {
              setPreferredTranslation(t);
              setUser(prev => ({ ...prev, preferredTranslation: t }));
            }}
          />
        );
      case 'bible':
        return (
          <BibleTab
            onSaveVerse={handleSaveVerse}
            savedVerseKeys={savedVerseKeys}
            highlights={highlights}
            onToggleHighlight={handleToggleHighlight}
            onAskAiPrompt={handleAskAiPrompt}
            preferredTranslation={preferredTranslation}
            onChangeTranslation={(t) => {
              setPreferredTranslation(t);
              setUser(prev => ({ ...prev, preferredTranslation: t }));
            }}
          />
        );
      case 'ai':
        return (
          <AiTab
            user={user}
            messages={aiMessages}
            setMessages={setAiMessages}
            initialPrompt={aiInitialPrompt}
            onClearInitialPrompt={() => setAiInitialPrompt('')}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
          />
        );
      case 'prayer':
        return (
          <PrayerTab
            prayers={prayers}
            onAddPrayer={handleAddPrayer}
            onToggleAnswered={handleToggleAnsweredPrayer}
            onDeletePrayer={handleDeletePrayer}
          />
        );
      case 'profile':
        return (
          <ProfileTab
            user={user}
            savedVerses={savedVerses}
            onRemoveSavedVerse={(id) => setSavedVerses(prev => prev.filter(v => v.id !== id))}
            readingPlans={readingPlans}
            prayers={prayers}
            notifications={notifications}
            onUpdateNotifications={(newSettings) => setNotifications(prev => ({ ...prev, ...newSettings }))}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenSermonSummarizer={() => setShowSermonModal(true)}
            onOpenStudyPlanModal={() => setShowStudyPlanModal(true)}
            preferredTranslation={preferredTranslation}
            onChangeTranslation={(t) => {
              setPreferredTranslation(t);
              setUser(prev => ({ ...prev, preferredTranslation: t }));
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans select-none overflow-x-hidden">
      {/* Outer Shell Wrapper (Mobile Device Phone Frame vs Full Screen) */}
      <div 
        className={`w-full transition-all duration-300 bg-[#F8F9FC] relative flex flex-col min-h-screen sm:min-h-0 ${
          isPhoneFrame
            ? 'max-w-md sm:rounded-[44px] sm:shadow-2xl sm:border-[10px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/50 sm:my-4 sm:overflow-hidden'
            : 'max-w-3xl rounded-none sm:rounded-3xl shadow-xl border-none my-0'
        }`}
      >
        {/* Phone Notch/Speaker Bar on Mobile Frame */}
        {isPhoneFrame && (
          <div className="hidden sm:flex justify-center items-center pt-2.5 pb-1 bg-[#1E3A8A]">
            <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              <span className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        )}

        {/* App Header */}
        <Header
          user={user}
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
          onOpenAuth={() => setShowAuthModal(true)}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadNotifications={1}
        />

        {/* Main Tab Content View */}
        <main className="flex-1 p-4 overflow-y-auto">
          {renderTabContent()}
        </main>

        {/* Bottom Floating Navigation Bar */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* MODALS */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        user={user}
        onUpdateUser={(updated) => setUser(prev => ({ ...prev, ...updated }))}
      />

      <DevotionalModal
        isOpen={showDevotionalModal}
        onClose={() => setShowDevotionalModal(false)}
        devotional={INITIAL_DEVOTIONAL}
        onAskAiPrompt={handleAskAiPrompt}
      />

      <SermonSummarizerModal
        isOpen={showSermonModal}
        onClose={() => setShowSermonModal(false)}
        onOpenUpgrade={() => {
          setShowSermonModal(false);
          setShowUpgradeModal(true);
        }}
        isPremium={user.isPremium}
      />

      <StudyPlanModal
        isOpen={showStudyPlanModal}
        onClose={() => setShowStudyPlanModal(false)}
        onAddReadingPlan={(newPlan) => setReadingPlans(prev => [newPlan, ...prev])}
        onOpenUpgrade={() => {
          setShowStudyPlanModal(false);
          setShowUpgradeModal(true);
        }}
        isPremium={user.isPremium}
      />

      <NotificationModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}
