import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardDriveDownload, 
  CheckCircle2, 
  Trash2, 
  X, 
  BookOpen, 
  Sparkles, 
  WifiOff, 
  Database,
  ArrowDownToLine,
  RefreshCw,
  FolderDown
} from 'lucide-react';
import { POPULAR_BIBLE_BOOKS } from '../data/bibleData';
import { offlineStorage, CacheStats } from '../services/offlineStorageService';

interface OfflineBibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook: string;
  selectedChapter: number;
  onSelectBookChapter: (bookName: string, chapter: number) => void;
  onTriggerToast: (msg: string) => void;
}

export const OfflineBibleModal: React.FC<OfflineBibleModalProps> = ({
  isOpen,
  onClose,
  selectedBook,
  selectedChapter,
  onSelectBookChapter,
  onTriggerToast
}) => {
  const [cacheStats, setCacheStats] = useState<CacheStats>(() => offlineStorage.getStats());

  if (!isOpen) return null;

  const refreshStats = () => {
    setCacheStats(offlineStorage.getStats());
  };

  const handleDownloadSingleChapter = (bookName: string, ch: number) => {
    const res = offlineStorage.downloadChapterOffline(bookName, ch);
    onTriggerToast(`Downloaded ${bookName} Chapter ${ch} (${res.versesCount} verses) for offline reading! 📥`);
    refreshStats();
  };

  const handleDownloadFullBook = (bookName: string, chapterCount: number) => {
    const res = offlineStorage.downloadFullBookOffline(bookName, chapterCount);
    onTriggerToast(`Saved all ${res.chaptersDownloaded} chapters of ${bookName} to local storage! 📱`);
    refreshStats();
  };

  const handleClearOfflineCache = () => {
    if (confirm('Are you sure you want to clear your local Bible offline cache?')) {
      offlineStorage.clearCache();
      onTriggerToast('Offline Bible cache cleared and reset.');
      refreshStats();
    }
  };

  const downloadedChaptersList = offlineStorage.getDownloadedChaptersList();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 text-slate-900 space-y-5 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-blue-800 text-white flex items-center justify-center shadow-md shadow-blue-900/20">
                <HardDriveDownload className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                  Offline Bible Storage
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Read scriptures anytime without an internet connection
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Storage Usage Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-[#1E3A8A] to-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-blue-200">Local Storage Status</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" /> Offline Ready
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-blue-800/80 text-center">
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-200 uppercase block">Cached Chapters</span>
                  <span className="text-base font-black text-amber-300">{cacheStats.cachedChaptersCount}</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-200 uppercase block">Storage Space</span>
                  <span className="text-base font-black text-emerald-300">~{cacheStats.estimatedStorageKb} KB</span>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-blue-200 uppercase block">Saved Verses</span>
                  <span className="text-base font-black text-white">{cacheStats.totalSavedVerses}</span>
                </div>
              </div>
            </div>

            {/* Quick Action: Download Current Chapter & Book */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    Current Selection: {selectedBook} {selectedChapter}
                  </h3>
                  <p className="text-[11px] text-amber-900 font-medium">
                    Store this chapter or book locally in your browser
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSingleChapter(selectedBook, selectedChapter)}
                  className="flex-1 py-2 px-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-amber-400" />
                  Download Ch. {selectedChapter}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadFullBook(selectedBook, 28)}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <FolderDown className="w-3.5 h-3.5 text-slate-950" />
                  Download Full {selectedBook}
                </button>
              </div>
            </div>

            {/* Download Popular Books 1-Click List */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                1-Click Download Popular Books
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_BIBLE_BOOKS.map((book) => {
                  const isDownloaded = offlineStorage.isBookDownloaded(book.name, book.chapterCount);
                  return (
                    <div
                      key={book.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{book.name}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {book.chapterCount} Chapters • {book.testament}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadFullBook(book.name, book.chapterCount)}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all ${
                          isDownloaded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-white hover:bg-blue-50 text-[#1E3A8A] border border-slate-200 shadow-2xs'
                        }`}
                      >
                        {isDownloaded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Saved
                          </>
                        ) : (
                          <>
                            <HardDriveDownload className="w-3 h-3 text-amber-600" /> Download
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Offline Cached Chapters */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Cached Chapters ({downloadedChaptersList.length})
                </h3>
                <button
                  type="button"
                  onClick={handleClearOfflineCache}
                  className="text-[10px] font-extrabold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear Cache
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {downloadedChaptersList.slice(0, 20).map((ch, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onSelectBookChapter(ch.bookName, ch.chapter);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 hover:border-blue-300 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <span className="font-bold text-[#1E3A8A]">
                      {ch.bookName} Chapter {ch.chapter}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ch.verses.length} verses • Tap to read
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
            >
              Done Reading Offline
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
