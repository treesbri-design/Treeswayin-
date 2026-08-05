import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Sparkles, 
  Award, 
  Trophy, 
  CheckCircle2, 
  Share2, 
  X, 
  Calendar, 
  HeartHandshake, 
  Crown,
  Zap
} from 'lucide-react';

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays?: number;
  userName?: string;
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  streakDays = 7,
  userName = 'Sarah'
}) => {
  // Trigger full confetti effect on mount/open
  useEffect(() => {
    if (isOpen) {
      fireConfetti();
    }
  }, [isOpen]);

  const fireConfetti = () => {
    // Left burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.25 },
      colors: ['#F59E0B', '#1E3A8A', '#10B981', '#F43F5E', '#D4AF37']
    });

    // Right burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6, x: 0.75 },
      colors: ['#F59E0B', '#1E3A8A', '#10B981', '#F43F5E', '#D4AF37']
    });

    // Center gold rain after slight delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFD700', '#FFA500', '#F59E0B']
      });
    }, 250);
  };

  const daysOfWeek = [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: true },
    { label: 'F', active: true },
    { label: 'S', active: true },
    { label: 'S', active: true }
  ];

  const handleShareStreak = async () => {
    const text = `🔥 I've maintained a ${streakDays}-day prayer journal streak on FaithPath! "Pray without ceasing." — 1 Thess 5:17 🙏✨`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${streakDays}-Day Prayer Streak Celebration`,
          text,
          url: window.location.href
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert('Streak achievement copied to clipboard!');
    } catch {
      alert(text);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          {/* Main Celebration Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-[#1E3A8A] to-slate-950 rounded-[32px] border-2 border-amber-400/40 p-6 sm:p-7 shadow-2xl text-white overflow-hidden text-center space-y-5"
          >
            {/* Background glowing particles/decorations */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Flame Trophy Badge */}
            <div className="relative inline-flex items-center justify-center pt-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center"
              >
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center text-amber-400">
                  <Flame className="w-10 h-10 fill-amber-500 text-amber-300 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 mt-0.5">
                    7 DAYS
                  </span>
                </div>
              </motion.div>

              {/* Floating Sparkles & Crown */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg border border-yellow-200 z-20"
              >
                <Crown className="w-4 h-4 fill-amber-950" />
              </motion.div>
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -bottom-1 -left-2 bg-blue-600 text-amber-300 p-1.5 rounded-full shadow-lg border border-blue-400 z-20"
              >
                <Sparkles className="w-4 h-4 fill-amber-300" />
              </motion.div>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                <Trophy className="w-3.5 h-3.5" /> Milestone Unlocked!
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                7-Day Prayer Streak! 🔥
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Praise God, {userName}! You have stayed faithful in daily prayer for 7 consecutive days.
              </p>
            </div>

            {/* Weekly Consistency Progress Bar */}
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-extrabold text-amber-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> This Week's Devotional Walk
                </span>
                <span>7 / 7 Days Done ✓</span>
              </div>

              {/* Day Dots */}
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {daysOfWeek.map((d, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center gap-1 bg-amber-400/20 border border-amber-300/40 p-2 rounded-xl text-center"
                  >
                    <span className="text-[10px] font-bold text-amber-200">{d.label}</span>
                    <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px]">
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspirational Scripture Card */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-amber-400/30 text-left space-y-1">
              <p className="text-xs font-serif italic text-amber-200">
                "Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus."
              </p>
              <span className="text-[10px] font-bold text-slate-400 block text-right">— 1 Thessalonians 5:16-18</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={fireConfetti}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                Burst More Confetti! 🎉
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShareStreak}
                  className="flex-1 py-2.5 bg-blue-600/60 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-blue-400/30 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  Share Badge
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/10 transition-colors"
                >
                  Keep Praying
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
