export type NavTab = 'home' | 'bible' | 'ai' | 'prayer' | 'profile';

export type BibleTranslation = 'NIV' | 'KJV' | 'ESV' | 'WEB';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  isPremium: boolean;
  trialDaysRemaining?: number;
  trialStartDate?: string;
  streakDays: number;
  lastActiveDate: string;
  preferredTranslation: BibleTranslation;
  readingProgressCount: number;
  joinedDate: string;
}

export interface VerseHighlight {
  id: string;
  verseId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  color: 'gold' | 'blue' | 'emerald' | 'rose' | 'amber';
  date: string;
}

export interface SavedVerse {
  id: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  translation: BibleTranslation;
  dateSaved: string;
  notes?: string;
}

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapter {
  chapterNumber: number;
  verses: BibleVerse[];
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'Old' | 'New';
  category: 'Law' | 'History' | 'Poetry' | 'Prophets' | 'Gospels' | 'Epistles' | 'Apocalyptic';
  chapterCount: number;
  chapters: Record<number, BibleVerse[]>;
}

export interface PrayerEntry {
  id: string;
  title: string;
  content: string;
  category: 'Family' | 'Healing' | 'Guidance' | 'Peace' | 'Gratitude' | 'General';
  mood: 'Blessed' | 'Anxious' | 'Hopeful' | 'Thankful' | 'Seeking' | 'Peaceful';
  isAnswered: boolean;
  answeredDate?: string;
  testimonyNote?: string;
  createdAt: string;
  audioUrl?: string;
  audioDuration?: number;
  audioTranscript?: string;
}

export interface CommunityPrayerRequest {
  id: string;
  authorAlias: string;
  location?: string;
  category: 'Healing' | 'Family' | 'Peace' | 'Guidance' | 'Comfort' | 'Praise';
  requestText: string;
  prayerCount: number;
  timeAgo: string;
  isUrgent?: boolean;
  hasUserPrayed?: boolean;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  currentDay: number;
  category: string;
  isCustomAI?: boolean;
  days: {
    dayNumber: number;
    title: string;
    passage: string;
    summary: string;
    isCompleted: boolean;
  }[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  scriptureReferences?: string[];
}

export interface DailyDevotional {
  id: string;
  date: string;
  title: string;
  scriptureRef: string;
  verseText: string;
  author: string;
  body: string;
  reflection: string;
  prayer: string;
  imageUrl?: string;
}

export interface NotificationSetting {
  dailyVerseEnabled: boolean;
  dailyVerseTime: string; // e.g. "08:00"
  prayerReminderEnabled: boolean;
  prayerReminderTime: string; // e.g. "20:00"
  readingPlanReminderEnabled: boolean;
}
