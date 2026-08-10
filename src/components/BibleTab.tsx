import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Book, 
  BookOpen,
  Bookmark, 
  Highlighter, 
  Share2, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Copy,
  SlidersHorizontal,
  X,
  Palette,
  Download,
  Image as ImageIcon,
  BrainCircuit,
  HardDriveDownload,
  CheckCircle2,
  FolderDown,
  ArrowDownToLine,
  WifiOff,
  ArrowRight,
  Compass,
  Filter
} from 'lucide-react';
import { BibleBook, BibleTranslation, SavedVerse, VerseHighlight } from '../types';
import { POPULAR_BIBLE_BOOKS, ALL_BIBLE_BOOKS_NAMES, getVersesForChapter } from '../data/bibleData';
import { offlineStorage } from '../services/offlineStorageService';
import { CARD_THEMES, downloadVerseCardImage, shareVerseCardImage, CardTheme } from '../utils/cardGenerator';
import { BibleQuizModal } from './BibleQuizModal';
import { OfflineBibleModal } from './OfflineBibleModal';
import { BibleAudioPlayer } from './BibleAudioPlayer';

interface BibleTabProps {
  onSaveVerse: (verse: { bookName: string; chapter: number; verse: number; text: string }) => void;
  savedVerses?: SavedVerse[];
  savedVerseKeys: Set<string>;
  highlights: VerseHighlight[];
  onToggleHighlight: (verseId: string, bookName: string, chapter: number, verse: number, text: string, color?: VerseHighlight['color']) => void;
  onAskAiPrompt: (promptText: string) => void;
  preferredTranslation: BibleTranslation;
  onChangeTranslation: (t: BibleTranslation) => void;
}

export const BibleTab: React.FC<BibleTabProps> = ({
  onSaveVerse,
  savedVerses = [],
  savedVerseKeys,
  highlights,
  onToggleHighlight,
  onAskAiPrompt,
  preferredTranslation,
  onChangeTranslation
}) => {
  // State
  const [viewMode, setViewMode] = useState<'reader' | 'saved' | 'highlights'>('reader');
  const [highlightFilter, setHighlightFilter] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<string>('John');
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReadingAudio, setIsReadingAudio] = useState<boolean>(false);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [shareModalVerse, setShareModalVerse] = useState<{ number: number; text: string } | null>(null);
  const [selectedCardTheme, setSelectedCardTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [offlineSyncToken, setOfflineSyncToken] = useState<number>(0);
  const [shareToastMessage, setShareToastMessage] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [activeSpokenVerseNumber, setActiveSpokenVerseNumber] = useState<number | null>(null);

  const triggerToast = (msg: string) => {
    setShareToastMessage(msg);
    setTimeout(() => setShareToastMessage(null), 3000);
  };

  const isCurrentChapterDownloaded = useMemo(() => {
    return offlineStorage.isChapterDownloaded(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter, offlineSyncToken]);

  const handleDownloadCurrentChapter = () => {
    const res = offlineStorage.downloadChapterOffline(selectedBook, selectedChapter);
    setOfflineSyncToken(prev => prev + 1);
    triggerToast(`Downloaded ${selectedBook} Chapter ${selectedChapter} (${res.versesCount} verses) for offline reading! 📥`);
  };

  // Web Share API text helper
  const handleNativeShareText = async (
    verseText: string,
    bookName: string,
    chapterNum: number,
    verseNum: number,
    extraInfo?: { isHighlight?: boolean; highlightColor?: string; dateSaved?: string }
  ) => {
    const refText = `${bookName} ${chapterNum}:${verseNum} (${preferredTranslation})`;
    const appUrl = window.location.href;
    
    let tag = '';
    if (extraInfo?.isHighlight) {
      tag = ` [Highlighted ${extraInfo.highlightColor ? extraInfo.highlightColor.toUpperCase() : 'Verse'}]`;
    } else if (extraInfo?.dateSaved) {
      tag = ` [Saved Verse]`;
    }

    const shareText = `"${verseText}" — ${refText}${tag}\n\nRead & study scripture on FaithPath AI: ${appUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: refText,
          text: shareText,
          url: appUrl
        });
        triggerToast('Verse shared via Web Share API! 📤');
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User cancelled share modal
      }
    }

    // Fallback if Web Share API is unavailable
    try {
      await navigator.clipboard.writeText(shareText);
      triggerToast('Verse & App Link copied to clipboard! 📋');
    } catch {
      triggerToast('Verse text copied!');
    }
  };

  // Web Share API image card helper
  const handleNativeShareImageCard = async () => {
    if (!shareModalVerse) return;
    const refText = `${selectedBook} ${selectedChapter}:${shareModalVerse.number} (${preferredTranslation})`;
    
    const sharedSuccessfully = await shareVerseCardImage(
      shareModalVerse.text,
      refText,
      selectedCardTheme
    );

    if (sharedSuccessfully) {
      triggerToast('Verse image card shared!');
    } else {
      // Fallback: download card image
      downloadVerseCardImage(shareModalVerse.text, refText, selectedCardTheme);
      triggerToast('Card downloaded! Use this file to share on social media.');
    }
  };

  // Verse lookup with offline cache integration
  const currentVerses = useMemo(() => {
    return offlineStorage.getChapter(selectedBook, selectedChapter);
  }, [selectedBook, selectedChapter]);

  // Current book metadata
  const currentBookMeta = useMemo(() => {
    return POPULAR_BIBLE_BOOKS.find(b => b.name.toLowerCase() === selectedBook.toLowerCase()) || {
      id: selectedBook.toLowerCase(),
      name: selectedBook,
      testament: ALL_BIBLE_BOOKS_NAMES.indexOf(selectedBook) < 39 ? 'Old' : 'New',
      category: 'Scripture',
      chapterCount: 28
    };
  }, [selectedBook]);

  // Search books and chapters
  const bookSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();

    // Check for book name + optional chapter number (e.g. "John 3", "1 Cor 13", "Ps 23", "Genesis 12", "Jn 3")
    const matchWithChapter = q.match(/^([1-3]?\s*[a-z]+(?:\s+[a-z]+)?)\s*(\d+)$/i);
    let targetChapterFromQuery: number | null = null;
    let bookQueryText = q;

    if (matchWithChapter) {
      bookQueryText = matchWithChapter[1].trim().toLowerCase();
      targetChapterFromQuery = parseInt(matchWithChapter[2], 10);
    }

    const matches = ALL_BIBLE_BOOKS_NAMES.filter(bookName => {
      const bn = bookName.toLowerCase();
      if (bn.includes(bookQueryText)) return true;
      if (bookQueryText === 'gen' && bn === 'genesis') return true;
      if (bookQueryText === 'ex' && bn === 'exodus') return true;
      if (bookQueryText === 'lev' && bn === 'leviticus') return true;
      if (bookQueryText === 'num' && bn === 'numbers') return true;
      if (bookQueryText === 'deut' && bn === 'deuteronomy') return true;
      if (bookQueryText === 'ps' && bn === 'psalms') return true;
      if (bookQueryText === 'psalm' && bn === 'psalms') return true;
      if (bookQueryText === 'prov' && bn === 'proverbs') return true;
      if (bookQueryText === 'matt' && bn === 'matthew') return true;
      if (bookQueryText === 'jn' && bn === 'john') return true;
      if (bookQueryText === 'rom' && bn === 'romans') return true;
      if (bookQueryText === 'cor' && bn.includes('corinthians')) return true;
      if (bookQueryText === 'rev' && bn === 'revelation') return true;
      if (bookQueryText === 'heb' && bn === 'hebrews') return true;
      if (bookQueryText === 'gal' && bn === 'galatians') return true;
      if (bookQueryText === 'eph' && bn === 'ephesians') return true;
      if (bookQueryText === 'phil' && bn === 'philippians') return true;
      if (bookQueryText === 'col' && bn === 'colossians') return true;
      if (bookQueryText === 'sam' && bn.includes('samuel')) return true;
      if (bookQueryText === 'kg' && bn.includes('kings')) return true;
      if (bookQueryText === 'chr' && bn.includes('chronicles')) return true;
      if (bookQueryText === 'pet' && bn.includes('peter')) return true;
      if (bookQueryText === 'tim' && bn.includes('timothy')) return true;
      if (bookQueryText === 'thess' && bn.includes('thessalonians')) return true;
      return false;
    });

    return matches.map(bookName => {
      const meta = POPULAR_BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase()) || {
        id: bookName.toLowerCase(),
        name: bookName,
        testament: ALL_BIBLE_BOOKS_NAMES.indexOf(bookName) < 39 ? 'Old' : 'New',
        category: 'Scripture',
        chapterCount: ALL_BIBLE_BOOKS_NAMES.indexOf(bookName) < 39 ? 30 : 20
      };

      return {
        bookName,
        testament: meta.testament,
        chapterCount: meta.chapterCount || 28,
        suggestedChapter: targetChapterFromQuery && targetChapterFromQuery <= (meta.chapterCount || 150) ? targetChapterFromQuery : null
      };
    });
  }, [searchQuery]);

  const handleJumpToBookChapter = (bookName: string, chapter: number = 1) => {
    setSelectedBook(bookName);
    setSelectedChapter(chapter);
    setSearchQuery('');
    setViewMode('reader');
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { bookName: string; chapter: number; verseNumber: number; text: string }[] = [];

    POPULAR_BIBLE_BOOKS.forEach(book => {
      Object.entries(book.chapters).forEach(([chapNum, verses]) => {
        verses.forEach(v => {
          if (
            v.text.toLowerCase().includes(query) ||
            `${book.name} ${chapNum}:${v.number}`.toLowerCase().includes(query)
          ) {
            results.push({
              bookName: book.name,
              chapter: Number(chapNum),
              verseNumber: v.number,
              text: v.text
            });
          }
        });
      });
    });

    return results.slice(0, 20);
  }, [searchQuery]);

  // Filtered Highlights
  const filteredHighlights = useMemo(() => {
    if (highlightFilter === 'all') return highlights;
    return highlights.filter(h => h.color === highlightFilter);
  }, [highlights, highlightFilter]);

  // Handle Audio Speech Synthesis & Player
  const handleToggleAudio = () => {
    setShowAudioPlayer(prev => !prev);
  };

  // Check highlight color
  const getHighlightColor = (verseNum: number) => {
    const key = `${selectedBook}-${selectedChapter}-${verseNum}`;
    const found = highlights.find(h => h.verseId === key);
    return found ? found.color : null;
  };

  const highlightBgClasses: Record<string, string> = {
    gold: 'bg-amber-100/90 text-slate-900 border-l-2 border-amber-400 pl-1.5',
    blue: 'bg-blue-100/90 text-slate-900 border-l-2 border-blue-400 pl-1.5',
    emerald: 'bg-emerald-100/90 text-slate-900 border-l-2 border-emerald-400 pl-1.5',
    rose: 'bg-rose-100/90 text-slate-900 border-l-2 border-rose-400 pl-1.5',
    amber: 'bg-yellow-100/90 text-slate-900 border-l-2 border-yellow-400 pl-1.5'
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn relative">
      {/* Toast Feedback Notification */}
      {shareToastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>{shareToastMessage}</span>
        </div>
      )}

      {/* Top Bible Controls & Search Bar */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-3">
        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1E3A8A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search books (e.g. John 3, Ps 23), chapters, or verses..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] rounded-2xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Suggestion Pills */}
          {!searchQuery && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-500" />
                Quick Jump:
              </span>
              {[
                { label: 'John 3', book: 'John', chapter: 3 },
                { label: 'Psalms 23', book: 'Psalms', chapter: 23 },
                { label: 'Genesis 1', book: 'Genesis', chapter: 1 },
                { label: 'Romans 8', book: 'Romans', chapter: 8 },
                { label: 'Proverbs 3', book: 'Proverbs', chapter: 3 },
                { label: '1 Cor 13', book: '1 Corinthians', chapter: 13 },
                { label: 'Revelation 21', book: 'Revelation', chapter: 21 }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleJumpToBookChapter(chip.book, chip.chapter)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#1E3A8A] font-bold rounded-xl border border-slate-200/80 shrink-0 transition-all active:scale-95 text-[10px]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Navigation Tabs (Reader vs Saved Verses vs Highlights) */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('reader')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'reader'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Book className="w-3.5 h-3.5" />
              <span>Reader</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('saved')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'saved'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-300" />
              <span>Saved ({savedVerses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('highlights')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'highlights'
                  ? 'bg-[#1E3A8A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5 text-yellow-300" />
              <span>Highlights ({highlights.length})</span>
            </button>
          </div>
        )}

        {/* Translation Selector & Book Selectors (Reader mode) */}
        {!searchQuery && viewMode === 'reader' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Book Selector */}
            <select
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setSelectedChapter(1);
              }}
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
            >
              {ALL_BIBLE_BOOKS_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Chapter Selector */}
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
            >
              {Array.from({ length: currentBookMeta.chapterCount || 28 }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>Chapter {ch}</option>
              ))}
            </select>

            {/* Translation Picker */}
            <div className="flex items-center bg-slate-100/80 rounded-xl p-1 border border-slate-200">
              {(['NIV', 'KJV', 'ESV', 'WEB'] as BibleTranslation[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onChangeTranslation(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    preferredTranslation === t
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Offline Storage Manager Button */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Manage Offline Bible Storage"
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline Bible</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS MODE */}
      {searchQuery ? (
        <div className="space-y-4 animate-fadeIn">
          {/* BOOK & CHAPTER MATCHES SECTION */}
          {bookSearchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#1E3A8A]" />
                  Matching Books & Chapters ({bookSearchResults.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookSearchResults.map((b) => (
                  <div
                    key={b.bookName}
                    className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{b.bookName}</h4>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] border border-blue-100">
                            {b.testament}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500">
                          {b.chapterCount} Chapters available
                        </p>
                      </div>

                      {b.suggestedChapter ? (
                        <button
                          onClick={() => handleJumpToBookChapter(b.bookName, b.suggestedChapter!)}
                          className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                        >
                          <span>Go to Ch. {b.suggestedChapter}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJumpToBookChapter(b.bookName, 1)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-[#1E3A8A] text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1 transition-all shrink-0"
                        >
                          <span>Open Book</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Select Chapter Chips */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tap Chapter to Read:
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                        {Array.from({ length: Math.min(b.chapterCount, 50) }, (_, i) => i + 1).map((ch) => (
                          <button
                            key={ch}
                            onClick={() => handleJumpToBookChapter(b.bookName, ch)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
                              b.suggestedChapter === ch
                                ? 'bg-amber-400 text-slate-900 border-amber-500 font-black shadow-2xs scale-105'
                                : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1E3A8A] border-slate-200'
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCRIPTURE TEXT MATCHES SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-amber-600" />
                Verse Text Matches ({searchResults.length})
              </h3>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#1E3A8A] font-bold hover:underline"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 && bookSearchResults.length === 0 ? (
              <div className="bg-white rounded-[28px] p-8 text-center space-y-2 border border-slate-100 shadow-md">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No books or verses found matching "{searchQuery}"</p>
                <p className="text-xs text-slate-500">Try searching for book names (e.g. "John", "Psalms"), references (e.g. "Genesis 12", "Ps 23"), or keywords like "Love", "Peace", "Faith".</p>
                <button
                  onClick={() => onAskAiPrompt(`Where in the Bible does it talk about ${searchQuery}?`)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#1E3A8A] rounded-xl text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Ask FaithPath AI to find verses
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-blue-300 shadow-xs space-y-2 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleJumpToBookChapter(res.bookName, res.chapter)}
                        className="text-xs font-bold text-[#1E3A8A] hover:underline text-left"
                      >
                        {res.bookName} {res.chapter}:{res.verseNumber} ({preferredTranslation})
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNativeShareText(res.text, res.bookName, res.chapter, res.verseNumber);
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                          title="Share via Native Web Share API"
                        >
                          <Share2 className="w-3 h-3 text-amber-600" />
                          Share Native
                        </button>
                        <button
                          onClick={() => handleJumpToBookChapter(res.bookName, res.chapter)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
                        >
                          Read Chapter →
                        </button>
                      </div>
                    </div>
                    <p 
                      onClick={() => handleJumpToBookChapter(res.bookName, res.chapter)}
                      className="text-xs font-serif text-slate-800 italic cursor-pointer"
                    >
                      "{res.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'saved' ? (
        /* SAVED VERSES TAB */
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                Saved Verses ({savedVerses.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Bookmarked Scriptures ready for reflection & Web Share API sharing
              </p>
            </div>
            {savedVerses.length > 0 && (
              <button
                onClick={() => setViewMode('reader')}
                className="text-xs font-bold text-[#1E3A8A] hover:underline"
              >
                Back to Reader →
              </button>
            )}
          </div>

          {savedVerses.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No saved verses yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Bookmark verses while reading in the Bible Reader to save them here for quick access and native sharing.
              </p>
              <button
                onClick={() => setViewMode('reader')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Book className="w-3.5 h-3.5" />
                Open Bible Reader
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedVerses.map((sv) => (
                <div
                  key={sv.id}
                  className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 hover:border-amber-300 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      {sv.bookName} {sv.chapter}:{sv.verse} ({sv.translation || preferredTranslation})
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Saved {sv.dateSaved}
                    </span>
                  </div>

                  <p className="text-xs font-serif italic text-slate-900 leading-relaxed">
                    "{sv.text}"
                  </p>

                  <div className="pt-2 border-t border-amber-200/50 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Native Share Button */}
                      <button
                        type="button"
                        onClick={() => handleNativeShareText(sv.text, sv.bookName, sv.chapter, sv.verse, { dateSaved: sv.dateSaved })}
                        className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                        title="Share saved verse via Web Share API"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Share Native</span>
                      </button>

                      {/* Card Customizer */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(sv.bookName);
                          setSelectedChapter(sv.chapter);
                          setShareModalVerse({ number: sv.verse, text: sv.text });
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verse Card</span>
                      </button>

                      {/* Read Chapter in Context */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(sv.bookName);
                          setSelectedChapter(sv.chapter);
                          setViewMode('reader');
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Book className="w-3.5 h-3.5 text-slate-500" />
                        <span>Read Chapter</span>
                      </button>
                    </div>

                    {/* Unsave Button */}
                    <button
                      type="button"
                      onClick={() => onSaveVerse({ bookName: sv.bookName, chapter: sv.chapter, verse: sv.verse, text: sv.text })}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 p-1"
                      title="Remove from saved"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-rose-600" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : viewMode === 'highlights' ? (
        /* HIGHLIGHTED VERSES TAB */
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Highlighter className="w-4 h-4 text-amber-500 fill-amber-300" />
                Highlighted Verses ({highlights.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Your highlighted Scriptures ready to share via Web Share API
              </p>
            </div>

            {/* Filter by Color */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['all', 'gold', 'blue', 'emerald', 'rose'].map((col) => (
                <button
                  key={col}
                  onClick={() => setHighlightFilter(col)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    highlightFilter === col
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {filteredHighlights.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Highlighter className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No highlighted verses found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select color highlights while reading chapters to color-code and organize your favorite verses.
              </p>
              <button
                onClick={() => setViewMode('reader')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Book className="w-3.5 h-3.5" />
                Open Bible Reader
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHighlights.map((hl) => (
                <div
                  key={hl.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${highlightBgClasses[hl.color] || 'bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#1E3A8A] bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
                        {hl.bookName} {hl.chapter}:{hl.verse} ({preferredTranslation})
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 capitalize text-slate-700">
                        {hl.color}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      {hl.date}
                    </span>
                  </div>

                  <p className="text-xs font-serif italic text-slate-900 leading-relaxed">
                    "{hl.text}"
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Native Share Button */}
                      <button
                        type="button"
                        onClick={() => handleNativeShareText(hl.text, hl.bookName, hl.chapter, hl.verse, { isHighlight: true, highlightColor: hl.color })}
                        className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                        title="Share highlighted verse via Web Share API"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Share Highlight</span>
                      </button>

                      {/* Card Customizer */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(hl.bookName);
                          setSelectedChapter(hl.chapter);
                          setShareModalVerse({ number: hl.verse, text: hl.text });
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verse Card</span>
                      </button>

                      {/* Read Chapter in Context */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(hl.bookName);
                          setSelectedChapter(hl.chapter);
                          setViewMode('reader');
                        }}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Book className="w-3.5 h-3.5 text-slate-500" />
                        <span>Read Chapter</span>
                      </button>
                    </div>

                    {/* Clear Highlight */}
                    <button
                      type="button"
                      onClick={() => onToggleHighlight(hl.verseId, hl.bookName, hl.chapter, hl.verse, hl.text, hl.color)}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 p-1"
                      title="Remove highlight"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CHAPTER READER MODE */
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-4">
          {/* Chapter Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                disabled={selectedChapter <= 1}
                onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {selectedBook} {selectedChapter}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  {currentBookMeta.testament} Testament • {preferredTranslation}
                </p>
              </div>
              <button
                disabled={selectedChapter >= (currentBookMeta.chapterCount || 50)}
                onClick={() => setSelectedChapter(prev => prev + 1)}
                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Download Chapter Action */}
              <button
                type="button"
                onClick={handleDownloadCurrentChapter}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                  isCurrentChapterDownloaded
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
                title="Store chapter in localStorage for offline reading"
              >
                {isCurrentChapterDownloaded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Downloaded ✓</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Download Ch. {selectedChapter}</span>
                  </>
                )}
              </button>

              {/* Bible Quiz Toggle */}
              <button
                onClick={() => setIsQuizOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-[#1E3A8A] font-black text-xs rounded-2xl shadow-xs transition-all active:scale-95"
              >
                <BrainCircuit className="w-4 h-4 text-[#1E3A8A]" />
                Take Quiz
              </button>

              {/* Audio Reader Toggle */}
              <button
                onClick={handleToggleAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  showAudioPlayer
                    ? 'bg-amber-500 text-slate-900 shadow-sm font-extrabold'
                    : 'bg-blue-50 text-[#1E3A8A] hover:bg-blue-100'
                }`}
              >
                {showAudioPlayer ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {showAudioPlayer ? 'Hide Audio Player' : 'Listen'}
              </button>
            </div>
          </div>

          {/* Integrated AI Audio Player */}
          {showAudioPlayer && (
            <div className="py-1 animate-fadeIn">
              <BibleAudioPlayer
                bookName={selectedBook}
                chapter={selectedChapter}
                translation={preferredTranslation}
                verses={currentVerses}
                onCurrentVerseChange={(vNum) => setActiveSpokenVerseNumber(vNum)}
                onClose={() => setShowAudioPlayer(false)}
              />
            </div>
          )}

          {/* Verses List */}
          <div className="space-y-3.5 py-1 font-serif text-slate-800 leading-relaxed text-sm">
            {currentVerses.map((verse) => {
              const verseKey = `${selectedBook}-${selectedChapter}-${verse.number}`;
              const isSaved = savedVerseKeys.has(verseKey);
              const highlightColor = getHighlightColor(verse.number);
              const isSpokenVerse = activeSpokenVerseNumber === verse.number;

              return (
                <div
                  key={verse.number}
                  className={`group rounded-2xl p-3 transition-all relative ${
                    isSpokenVerse
                      ? 'bg-amber-100/90 text-slate-900 ring-2 ring-amber-500 shadow-md scale-[1.01]'
                      : highlightColor 
                      ? highlightBgClasses[highlightColor] 
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-lg mt-0.5 select-none shrink-0 ${
                      isSpokenVerse 
                        ? 'bg-amber-500 text-white font-extrabold shadow-2xs' 
                        : 'text-[#1E3A8A] bg-blue-50'
                    }`}>
                      {verse.number}
                    </span>
                    <p className="flex-1 text-slate-900 leading-relaxed">
                      {verse.text}
                    </p>
                  </div>

                  {/* Quick Action Toolbar for Verse */}
                  <div className="mt-2 pt-2 flex items-center justify-between border-t border-slate-100/80 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Highlight Colors */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        {(['gold', 'blue', 'emerald', 'rose'] as const).map((color) => (
                          <button
                            key={color}
                            onClick={() => onToggleHighlight(verseKey, selectedBook, selectedChapter, verse.number, verse.text, color)}
                            className={`w-3.5 h-3.5 rounded-full border ${
                              color === 'gold' ? 'bg-amber-300 border-amber-500' :
                              color === 'blue' ? 'bg-blue-300 border-blue-500' :
                              color === 'emerald' ? 'bg-emerald-300 border-emerald-500' :
                              'bg-rose-300 border-rose-500'
                            }`}
                            title={`Highlight in ${color}`}
                          />
                        ))}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        onClick={() => onSaveVerse({
                          bookName: selectedBook,
                          chapter: selectedChapter,
                          verse: verse.number,
                          text: verse.text
                        })}
                        className={`p-1.5 rounded-lg text-xs flex items-center gap-0.5 font-sans font-semibold ${
                          isSaved ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={isSaved ? 'Saved in bookmarks' : 'Save verse'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
                      </button>

                      {/* Web Share API Direct Trigger */}
                      <button
                        onClick={() => handleNativeShareText(
                          verse.text, 
                          selectedBook, 
                          selectedChapter, 
                          verse.number,
                          {
                            isHighlight: !!highlightColor,
                            highlightColor: highlightColor || undefined,
                            dateSaved: isSaved ? 'Saved' : undefined
                          }
                        )}
                        className="p-1.5 rounded-lg text-xs text-amber-600 hover:bg-amber-50 font-sans flex items-center gap-1 font-bold"
                        title="Share verse directly via Mobile Share Sheet"
                      >
                        <Share2 className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px]">Share</span>
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => {
                          const appUrl = window.location.href;
                          navigator.clipboard.writeText(`"${verse.text}" — ${selectedBook} ${selectedChapter}:${verse.number} (${preferredTranslation})\n\nFaithPath AI: ${appUrl}`);
                          setCopiedVerseNum(verse.number);
                          triggerToast('Copied to clipboard with App Link!');
                          setTimeout(() => setCopiedVerseNum(null), 1500);
                        }}
                        className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 font-sans flex items-center gap-0.5"
                        title="Copy verse text with link"
                      >
                        {copiedVerseNum === verse.number ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Verse Image Card Customizer */}
                      <button
                        onClick={() => setShareModalVerse(verse)}
                        className="p-1.5 rounded-lg text-xs text-blue-700 hover:bg-blue-50 font-sans flex items-center gap-1 font-bold"
                        title="Create & share Verse Card image"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] hidden sm:inline">Card</span>
                      </button>
                    </div>

                    {/* Ask AI Context */}
                    <button
                      onClick={() => onAskAiPrompt(`Explain the spiritual depth and cross-references of ${selectedBook} ${selectedChapter}:${verse.number}`)}
                      className="text-[11px] font-sans font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      Explain Verse
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={selectedChapter <= 1}
              onClick={() => setSelectedChapter(prev => Math.max(1, prev - 1))}
              className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold disabled:opacity-40 flex items-center gap-1 border border-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Chapter
            </button>
            <button
              disabled={selectedChapter >= (currentBookMeta.chapterCount || 50)}
              onClick={() => setSelectedChapter(prev => prev + 1)}
              className="py-2.5 px-4 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-2xl text-xs font-bold disabled:opacity-40 flex items-center gap-1 shadow-md transition-colors"
            >
              Next Chapter <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}

      {/* SHARE VERSE CARD MODAL WITH THEME SELECTOR & IMAGE EXPORT */}
      {shareModalVerse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShareModalVerse(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center font-bold">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Share Verse & App Link</h3>
                <p className="text-[11px] text-slate-500">Pick a theme & share via Web Share API</p>
              </div>
            </div>

            {/* Theme Selector Carousel / Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Select Background Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CARD_THEMES.map((theme) => {
                  const isSelected = selectedCardTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedCardTheme(theme)}
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

            {/* Visual Verse Card Live Canvas Preview */}
            <div 
              className={`bg-gradient-to-br ${selectedCardTheme.gradientCss} p-6 rounded-2xl shadow-lg space-y-4 text-center relative overflow-hidden border transition-all duration-300`}
              style={{ borderColor: selectedCardTheme.borderColor }}
            >
              <div 
                className="w-8 h-8 mx-auto rounded-full border flex items-center justify-center font-bold text-sm"
                style={{ 
                  backgroundColor: `${selectedCardTheme.accentColor}20`,
                  borderColor: selectedCardTheme.accentColor,
                  color: selectedCardTheme.accentColor
                }}
              >
                ✝
              </div>

              <p 
                className="text-sm sm:text-base font-serif italic leading-relaxed px-2"
                style={{ color: selectedCardTheme.textColor }}
              >
                "{shareModalVerse.text}"
              </p>

              <div className="pt-2 border-t" style={{ borderColor: `${selectedCardTheme.accentColor}40` }}>
                <p className="text-xs font-black tracking-wide" style={{ color: selectedCardTheme.accentColor }}>
                  {selectedBook} {selectedChapter}:{shareModalVerse.number} ({preferredTranslation})
                </p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: selectedCardTheme.subTextColor }}>
                  FaithPath AI • Bible Study & Daily Prayer
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              {/* Primary Action 1: Web Share API Image Card */}
              <button
                type="button"
                onClick={handleNativeShareImageCard}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Share2 className="w-4 h-4 text-[#D4AF37]" />
                Share Image Card via Web Share API
              </button>

              <div className="flex gap-2">
                {/* Secondary Action: Native Share Text */}
                <button
                  type="button"
                  onClick={() => {
                    handleNativeShareText(
                      shareModalVerse.text,
                      selectedBook,
                      selectedChapter,
                      shareModalVerse.number,
                      { dateSaved: savedVerseKeys.has(`${selectedBook}-${selectedChapter}-${shareModalVerse.number}`) ? 'Saved' : undefined }
                    );
                  }}
                  className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-amber-200"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-700" />
                  Share Text & Link
                </button>

                {/* Secondary Action: Download PNG */}
                <button
                  type="button"
                  onClick={() => {
                    const ref = `${selectedBook} ${selectedChapter}:${shareModalVerse.number} (${preferredTranslation})`;
                    downloadVerseCardImage(shareModalVerse.text, ref, selectedCardTheme);
                    triggerToast('Image card downloaded!');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Save PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bible Knowledge Quiz Modal */}
      <BibleQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        initialBookName={selectedBook}
        initialChapter={selectedChapter}
        onSelectChapter={(b, c) => {
          setSelectedBook(b);
          setSelectedChapter(c);
          setViewMode('reader');
        }}
      />

      {/* Offline Storage Manager Modal */}
      <OfflineBibleModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        selectedBook={selectedBook}
        selectedChapter={selectedChapter}
        onSelectBookChapter={(b, c) => {
          setSelectedBook(b);
          setSelectedChapter(c);
          setViewMode('reader');
        }}
        onTriggerToast={triggerToast}
      />
    </div>
  );
};
