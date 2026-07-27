import { BibleBook, DailyDevotional, SavedVerse, PrayerEntry, ReadingPlan } from '../types';
import { POPULAR_BIBLE_BOOKS, getVersesForChapter } from '../data/bibleData';
import { INITIAL_DEVOTIONAL, DAILY_AFFIRMATIONS } from '../data/devotionals';

const STORAGE_KEYS = {
  BIBLE_CHAPTERS: 'faithpath_offline_bible_v1',
  DEVOTIONALS: 'faithpath_offline_devotionals_v1',
  AFFIRMATIONS: 'faithpath_offline_affirmations_v1',
  PRAYERS: 'faithpath_offline_prayers_v1',
  SAVED_VERSES: 'faithpath_offline_saved_verses_v1',
  READING_PLANS: 'faithpath_offline_plans_v1',
  PRELOAD_COMPLETED: 'faithpath_offline_preloaded_v1',
};

export interface CachedChapter {
  bookName: string;
  chapter: number;
  verses: { number: number; text: string }[];
  cachedAt: number;
}

export interface CacheStats {
  cachedChaptersCount: number;
  cachedDevotionalsCount: number;
  cachedAffirmationsCount: number;
  totalSavedVerses: number;
  totalPrayers: number;
  isPreloaded: boolean;
  estimatedStorageKb: number;
}

/**
 * Helper to safely parse localStorage items
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
    return defaultValue;
  }
}

/**
 * Helper to safely write localStorage items
 */
function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

class OfflineStorageService {
  private bibleCache: Record<string, CachedChapter> = {};
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.initialized) return;
    this.bibleCache = getStorageItem<Record<string, CachedChapter>>(STORAGE_KEYS.BIBLE_CHAPTERS, {});
    
    // Check if initial seed is preloaded, if not, perform silent auto-cache of popular scriptures
    const isPreloaded = getStorageItem<boolean>(STORAGE_KEYS.PRELOAD_COMPLETED, false);
    if (!isPreloaded) {
      this.preloadCoreScriptures();
    }
    
    this.initialized = true;
  }

  private getChapterKey(bookName: string, chapter: number): string {
    return `${bookName.toLowerCase()}_ch${chapter}`;
  }

  /**
   * Cache a single chapter in memory + localStorage
   */
  public cacheChapter(bookName: string, chapter: number, verses: { number: number; text: string }[]): void {
    const key = this.getChapterKey(bookName, chapter);
    const entry: CachedChapter = {
      bookName,
      chapter,
      verses,
      cachedAt: Date.now()
    };
    this.bibleCache[key] = entry;
    setStorageItem(STORAGE_KEYS.BIBLE_CHAPTERS, this.bibleCache);
  }

  /**
   * Retrieve cached chapter or fallback generator
   */
  public getChapter(bookName: string, chapter: number): { number: number; text: string }[] {
    const key = this.getChapterKey(bookName, chapter);
    if (this.bibleCache[key]) {
      return this.bibleCache[key].verses;
    }

    // Try retrieving from popular pre-defined books
    const verses = getVersesForChapter(bookName, chapter);
    if (verses && verses.length > 0) {
      // Auto cache upon viewing
      this.cacheChapter(bookName, chapter, verses);
      return verses;
    }

    return [];
  }

  /**
   * Preload popular core Bible books & devotionals for full offline access
   */
  public preloadCoreScriptures(): CacheStats {
    // 1. Cache popular books chapters
    POPULAR_BIBLE_BOOKS.forEach(book => {
      Object.entries(book.chapters).forEach(([chapterNumStr, verses]) => {
        const chapterNum = Number(chapterNumStr);
        const key = this.getChapterKey(book.name, chapterNum);
        this.bibleCache[key] = {
          bookName: book.name,
          chapter: chapterNum,
          verses,
          cachedAt: Date.now()
        };
      });
    });

    setStorageItem(STORAGE_KEYS.BIBLE_CHAPTERS, this.bibleCache);

    // 2. Cache devotionals & affirmations
    setStorageItem(STORAGE_KEYS.DEVOTIONALS, [INITIAL_DEVOTIONAL]);
    setStorageItem(STORAGE_KEYS.AFFIRMATIONS, DAILY_AFFIRMATIONS);
    setStorageItem(STORAGE_KEYS.PRELOAD_COMPLETED, true);

    return this.getStats();
  }

  /**
   * Get Cached Devotionals
   */
  public getCachedDevotionals(): DailyDevotional[] {
    const devotionals = getStorageItem<DailyDevotional[]>(STORAGE_KEYS.DEVOTIONALS, []);
    return devotionals.length > 0 ? devotionals : [INITIAL_DEVOTIONAL];
  }

  /**
   * Cache User Prayer Entries
   */
  public savePrayersOffline(prayers: PrayerEntry[]): void {
    setStorageItem(STORAGE_KEYS.PRAYERS, prayers);
  }

  public getOfflinePrayers(defaultPrayers: PrayerEntry[]): PrayerEntry[] {
    return getStorageItem<PrayerEntry[]>(STORAGE_KEYS.PRAYERS, defaultPrayers);
  }

  /**
   * Cache Saved Verses
   */
  public saveVersesOffline(verses: SavedVerse[]): void {
    setStorageItem(STORAGE_KEYS.SAVED_VERSES, verses);
  }

  public getOfflineSavedVerses(defaultVerses: SavedVerse[]): SavedVerse[] {
    return getStorageItem<SavedVerse[]>(STORAGE_KEYS.SAVED_VERSES, defaultVerses);
  }

  /**
   * Cache Reading Plans
   */
  public saveReadingPlansOffline(plans: ReadingPlan[]): void {
    setStorageItem(STORAGE_KEYS.READING_PLANS, plans);
  }

  public getOfflineReadingPlans(defaultPlans: ReadingPlan[]): ReadingPlan[] {
    return getStorageItem<ReadingPlan[]>(STORAGE_KEYS.READING_PLANS, defaultPlans);
  }

  /**
   * Retrieve caching statistics and storage usage
   */
  public getStats(): CacheStats {
    const cachedChapters = Object.keys(this.bibleCache).length;
    const devotionals = this.getCachedDevotionals().length;
    const affirmations = getStorageItem<any[]>(STORAGE_KEYS.AFFIRMATIONS, DAILY_AFFIRMATIONS).length;
    const savedVerses = getStorageItem<any[]>(STORAGE_KEYS.SAVED_VERSES, []).length;
    const prayers = getStorageItem<any[]>(STORAGE_KEYS.PRAYERS, []).length;
    const isPreloaded = getStorageItem<boolean>(STORAGE_KEYS.PRELOAD_COMPLETED, false);

    let rawStringLength = 0;
    try {
      rawStringLength = (localStorage.getItem(STORAGE_KEYS.BIBLE_CHAPTERS) || '').length +
                        (localStorage.getItem(STORAGE_KEYS.DEVOTIONALS) || '').length;
    } catch {
      rawStringLength = 150000;
    }

    return {
      cachedChaptersCount: cachedChapters,
      cachedDevotionalsCount: devotionals,
      cachedAffirmationsCount: affirmations,
      totalSavedVerses: savedVerses,
      totalPrayers: prayers,
      isPreloaded,
      estimatedStorageKb: Math.round(rawStringLength / 1024)
    };
  }

  /**
   * Clear offline cache if user requests manual refresh
   */
  public clearCache(): void {
    this.bibleCache = {};
    localStorage.removeItem(STORAGE_KEYS.BIBLE_CHAPTERS);
    localStorage.removeItem(STORAGE_KEYS.DEVOTIONALS);
    localStorage.removeItem(STORAGE_KEYS.PRELOAD_COMPLETED);
    this.preloadCoreScriptures();
  }
}

export const offlineStorage = new OfflineStorageService();
