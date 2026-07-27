import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Award, 
  Trophy, 
  TrendingUp, 
  Heart, 
  BookOpen,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';

interface StreakCalendarProps {
  user: UserProfile;
  onUpdateStreak?: (newStreak: number) => void;
}

const LOCAL_STREAK_LOG_KEY = 'faithpath_streak_history_v1';

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ user, onUpdateStreak }) => {
  // Get days of current week (Mon-Sun)
  const getWeekDays = () => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sun
    const distanceToMon = (currentDayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMon);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const isoStr = dayDate.toISOString().split('T')[0];
      const isToday = isoStr === now.toISOString().split('T')[0];
      const isPast = dayDate < now && !isToday;

      days.push({
        name: dayNames[i],
        dateNum: dayDate.getDate(),
        isoDate: isoStr,
        isToday,
        isPast,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayIso = new Date().toISOString().split('T')[0];

  // Completed dates state stored in localStorage
  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STREAK_LOG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default pre-fill past 6 days of current week for a healthy streak visual
    const defaults: string[] = [];
    const now = new Date();
    for (let i = 0; i < (user.streakDays || 7); i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      defaults.push(d.toISOString().split('T')[0]);
    }
    return defaults;
  });

  const [currentStreak, setCurrentStreak] = useState<number>(user.streakDays || 7);
  const isTodayCompleted = completedDates.includes(todayIso);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STREAK_LOG_KEY, JSON.stringify(completedDates));
    } catch (e) {}
  }, [completedDates]);

  const handleLogTodayEngagement = () => {
    if (!isTodayCompleted) {
      const updated = [...completedDates, todayIso];
      setCompletedDates(updated);
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (onUpdateStreak) {
        onUpdateStreak(newStreak);
      }
    }
  };

  // Milestone Badges logic
  const milestones = [
    { days: 3, title: '3-Day Spark', icon: '⚡', unlocked: currentStreak >= 3 },
    { days: 7, title: '7-Day Devoted', icon: '🔥', unlocked: currentStreak >= 7 },
    { days: 14, title: '14-Day Seeker', icon: '🕊️', unlocked: currentStreak >= 14 },
    { days: 30, title: '30-Day Faithful', icon: '👑', unlocked: currentStreak >= 30 },
  ];

  const getEncouragementQuote = () => {
    if (currentStreak >= 30) {
      return '"Well done, good and faithful servant!" — Matthew 25:21';
    }
    if (currentStreak >= 14) {
      return '"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." — Galatians 6:9';
    }
    if (currentStreak >= 7) {
      return '"Commit to the Lord whatever you do, and he will establish your plans." — Proverbs 16:3';
    }
    return '"Draw near to God and He will draw near to you." — James 4:8';
  };

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 shadow-sm border border-slate-200/80 space-y-4 relative overflow-hidden">
      {/* Top Streak Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                {currentStreak}-Day Spiritual Streak
              </h3>
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Consecutive days reading scripture & praying
            </p>
          </div>
        </div>

        {!isTodayCompleted ? (
          <button
            onClick={handleLogTodayEngagement}
            className="py-2.5 px-4 bg-gradient-to-r from-[#1E3A8A] to-blue-700 hover:from-blue-900 hover:to-blue-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Check-in Today (+1 Day)</span>
          </button>
        ) : (
          <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            <span>Today's Engagement Complete!</span>
          </div>
        )}
      </div>

      {/* Encouragement Banner */}
      <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-500/10 rounded-2xl border border-amber-200/80 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
        <div className="text-xs">
          <span className="font-extrabold text-amber-900 block">
            {isTodayCompleted ? '🎉 Daily Goal Achieved!' : '🔥 Keep Your Streak Alive!'}
          </span>
          <p className="text-[11px] font-serif italic text-amber-800 mt-0.5">
            {getEncouragementQuote()}
          </p>
        </div>
      </div>

      {/* 7-Day Visual Calendar Row */}
      <div>
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#1E3A8A]" />
            This Week's Activity
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {completedDates.length} total active days logged
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {weekDays.map((day) => {
            const isCompleted = completedDates.includes(day.isoDate);
            return (
              <div
                key={day.isoDate}
                className={`p-2 rounded-2xl border transition-all flex flex-col items-center justify-between h-20 ${
                  day.isToday
                    ? isCompleted
                      ? 'bg-amber-500 text-white border-amber-400 shadow-md ring-2 ring-amber-300'
                      : 'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A] font-extrabold ring-2 ring-blue-200'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-300 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-tight opacity-80">
                  {day.name}
                </span>

                <span className="text-xs font-black">
                  {day.dateNum}
                </span>

                <div className="mt-1">
                  {isCompleted ? (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      day.isToday ? 'bg-white text-amber-600' : 'bg-emerald-500 text-white'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : day.isToday ? (
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center animate-bounce">
                      <Flame className="w-3 h-3 fill-[#1E3A8A]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Badges Strip */}
      <div className="pt-2 border-t border-slate-100">
        <span className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          Streak Milestones
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {milestones.map((m) => (
            <div
              key={m.days}
              className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                m.unlocked
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 text-amber-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <span className="text-xl shrink-0">{m.icon}</span>
              <div className="min-w-0">
                <span className="block text-xs font-extrabold truncate">
                  {m.title}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {m.unlocked ? 'Unlocked!' : `${m.days} Days Goal`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
