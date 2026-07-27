import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Book, 
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
  Image as ImageIcon
} from 'lucide-react';
import { BibleBook, BibleTranslation, SavedVerse, VerseHighlight } from '../types';
import { POPULAR_BIBLE_BOOKS, ALL_BIBLE_BOOKS_NAMES, getVersesForChapter } from '../data/bibleData';
import { offlineStorage } from '../services/offlineStorageService';
import { CARD_THEMES, downloadVerseCardImage, CardTheme } from '../utils/cardGenerator';

interface BibleTabProps {
  onSaveVerse: (verse: { bookName: string; chapter: number; verse: number; text: string }) => void;
  savedVerseKeys: Set<string>;
  highlights: VerseHighlight[];
  onToggleHighlight: (verseId: string, bookName: string, chapter: number, verse: number, text: string, color?: VerseHighlight['color']) => void;
  onAskAiPrompt: (promptText: string) => void;
  preferredTranslation: BibleTranslation;
  onChangeTranslation: (t: BibleTranslation) => void;
}

export const BibleTab: React.FC<BibleTabProps> = ({
  onSaveVerse,
  savedVerseKeys,
  highlights,
  onToggleHighlight,
  onAskAiPrompt,
  preferredTranslation,
  onChangeTranslation
}) => {
  // State
  const [selectedBook, setSelectedBook] = useState<string>('John');
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testamentFilter, setTestamentFilter] = useState<'All' | 'Old' | 'New'>('All');
  const [isReadingAudio, setIsReadingAudio] = useState<boolean>(false);
  const [activeHighlightVerse, setActiveHighlightVerse] = useState<number | null>(null);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [shareModalVerse, setShareModalVerse] = useState<{ number: number; text: string } | null>(null);
  const [selectedCardTheme, setSelectedCardTheme] = useState<CardTheme>(CARD_THEMES[0]);

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

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { bookName: string; chapter: number; verseNumber: number; text: string }[] = [];

    // Search inside seed books
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

  // Handle Audio Speech Synthesis
  const handleToggleAudio = () => {
    if (isReadingAudio) {
      window.speechSynthesis?.cancel();
      setIsReadingAudio(false);
    } else {
      if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported in this browser.');
        return;
      }
      const textToRead = `${selectedBook} Chapter ${selectedChapter}. ` + currentVerses.map(v => `Verse ${v.number}. ${v.text}`).join(' ');
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
    }
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
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Top Bible Controls & Search Bar */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Scriptures, topics, or verses..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Translation Selector & Book Selectors */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Book Selector */}
            <select
              value={selectedBook}
              onChange={(e) => {
                setSelectedBook(e.target.value);
                setSelectedChapter(1);
              }}
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1E3A8A] focus:outline-none"
            >
              {ALL_BIBLE_BOOKS_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>

            {/* Chapter Selector */}
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#1E3A8A] focus:outline-none"
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
          </div>
        )}
      </div>

      {/* SEARCH RESULTS MODE */}
      {searchQuery ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#1E3A8A] font-bold hover:underline"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 text-center space-y-2 border border-slate-100 shadow-md">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No verses found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-500">Try searching for keywords like "Love", "Peace", "Faith", or book names.</p>
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
                  onClick={() => {
                    setSelectedBook(res.bookName);
                    setSelectedChapter(res.chapter);
                    setSearchQuery('');
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-blue-300 cursor-pointer shadow-xs space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E3A8A]">
                      {res.bookName} {res.chapter}:{res.verseNumber} ({preferredTranslation})
                    </span>
                    <span className="text-[10px] text-slate-400">Tap to read chapter</span>
                  </div>
                  <p className="text-xs font-serif text-slate-800 italic">"{res.text}"</p>
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

            {/* Audio Reader Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                isReadingAudio
                  ? 'bg-amber-500 text-white shadow-sm animate-pulse'
                  : 'bg-blue-50 text-[#1E3A8A] hover:bg-blue-100'
              }`}
            >
              {isReadingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isReadingAudio ? 'Stop Audio' : 'Listen'}
            </button>
          </div>

          {/* Verses List */}
          <div className="space-y-3.5 py-1 font-serif text-slate-800 leading-relaxed text-sm">
            {currentVerses.map((verse) => {
              const verseKey = `${selectedBook}-${selectedChapter}-${verse.number}`;
              const isSaved = savedVerseKeys.has(verseKey);
              const highlightColor = getHighlightColor(verse.number);

              return (
                <div
                  key={verse.number}
                  className={`group rounded-2xl p-3 transition-all relative ${
                    highlightColor ? highlightBgClasses[highlightColor] : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-sans font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-lg mt-0.5 select-none shrink-0">
                      {verse.number}
                    </span>
                    <p className="flex-1 text-slate-900 leading-relaxed">
                      {verse.text}
                    </p>
                  </div>

                  {/* Quick Action Toolbar for Verse */}
                  <div className="mt-2 pt-2 flex items-center justify-between border-t border-slate-100/80 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5">
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
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-600' : ''}`} />
                      </button>

                      {/* Copy Button */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`"${verse.text}" — ${selectedBook} ${selectedChapter}:${verse.number} (${preferredTranslation})`);
                          setCopiedVerseNum(verse.number);
                          setTimeout(() => setCopiedVerseNum(null), 1500);
                        }}
                        className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 font-sans flex items-center gap-0.5"
                      >
                        {copiedVerseNum === verse.number ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Share Card Modal Trigger */}
                      <button
                        onClick={() => setShareModalVerse(verse)}
                        className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 font-sans"
                        title="Share Verse Card"
                      >
                        <Share2 className="w-3.5 h-3.5" />
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
                <h3 className="text-sm font-extrabold text-slate-900">Share Verse as Image</h3>
                <p className="text-[11px] text-slate-500">Pick a theme & download or share verse card</p>
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
              <button
                type="button"
                onClick={() => {
                  const ref = `${selectedBook} ${selectedChapter}:${shareModalVerse.number} (${preferredTranslation})`;
                  downloadVerseCardImage(shareModalVerse.text, ref, selectedCardTheme);
                }}
                className="w-full py-3 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4 text-[#1E3A8A]" />
                Download High-Res Card (.PNG)
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`"${shareModalVerse.text}" — ${selectedBook} ${selectedChapter}:${shareModalVerse.number} (${preferredTranslation})`);
                    alert('Verse text copied!');
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${selectedBook} ${selectedChapter}:${shareModalVerse.number}`,
                        text: `"${shareModalVerse.text}" — ${selectedBook} ${selectedChapter}:${shareModalVerse.number}`
                      });
                    } else {
                      alert('Text copied! Use image download above to post as a story or image card.');
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Share Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
