import React from 'react';
import { Sparkles, Bell, Smartphone, Monitor, Flame, ShieldAlert, CheckCircle2, Wifi, WifiOff, Database } from 'lucide-react';
import { UserProfile, NavTab } from '../types';
import { useOfflineStatus } from '../registerServiceWorker';

interface HeaderProps {
  user: UserProfile;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadNotifications: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isPhoneFrame,
  setIsPhoneFrame,
  onOpenAuth,
  onOpenNotifications,
  activeTab,
  setActiveTab,
  unreadNotifications
}) => {
  const isOnline = useOfflineStatus();

  return (
    <header className="sticky top-0 z-30 bg-[#1E3A8A] text-white shadow-md border-b border-[#2A4AA5]">
      {/* Offline Status Bar if offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-[#1E3A8A] px-4 py-1 text-[11px] font-extrabold flex items-center justify-center gap-2 text-center animate-pulse">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active • Core Bible Chapters & Devotionals Saved Locally</span>
        </div>
      )}

      <div className={`mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between ${isPhoneFrame ? 'max-w-md' : 'max-w-3xl'}`}>
        {/* Brand logo & tagline */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38F24] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-[#1E3A8A] rounded-[10px] flex items-center justify-center">
              <span className="text-lg font-bold text-[#D4AF37] tracking-tighter">✝</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight text-white leading-none">FaithPath</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1E3A8A] px-1.5 py-0.5 rounded-full shadow-sm">AI</span>
            </div>
            <p className="text-[11px] text-blue-200 font-medium leading-tight flex items-center gap-1">
              <span>Grow closer to God</span>
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-400" title="Offline Scriptures Cached" />
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Offline Ready Badge */}
          <div
            onClick={() => setActiveTab('profile')}
            className={`hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isOnline
                ? 'bg-blue-900/40 border-blue-700/40 text-blue-200'
                : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
            }`}
            title={isOnline ? "Bible & Devotionals Cached Offline" : "Offline Mode Active"}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
            <span>{isOnline ? "Offline Ready" : "Offline"}</span>
          </div>

          {/* Streak badge */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-blue-900/80 transition-colors"
            title="Daily Bible streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{user.streakDays}d</span>
          </div>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800/60 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#1E3A8A]" />
            )}
          </button>

          {/* Phone Frame Toggle */}
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="hidden sm:flex items-center gap-1 p-2 rounded-xl text-blue-200 hover:text-white hover:bg-blue-800/60 transition-colors"
            title={isPhoneFrame ? "Switch to Fullscreen" : "Switch to Mobile Frame"}
          >
            {isPhoneFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* User Avatar */}
          <button
            onClick={onOpenAuth}
            className="relative w-8 h-8 rounded-full border-2 border-[#D4AF37] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            title={user.email ? user.name : "Sign In"}
          >
            <img 
              src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
