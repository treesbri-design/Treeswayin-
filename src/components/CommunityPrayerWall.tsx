import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  Plus, 
  ShieldAlert, 
  Users, 
  Send, 
  X, 
  CheckCircle2, 
  Flame, 
  Globe2, 
  Heart,
  Filter,
  MessageCircle,
  Clock
} from 'lucide-react';
import { CommunityPrayerRequest } from '../types';

const INITIAL_COMMUNITY_PRAYERS: CommunityPrayerRequest[] = [
  {
    id: 'comm-1',
    authorAlias: 'Sister in Grace',
    location: 'California, USA',
    category: 'Healing',
    requestText: 'Please pray for my mother undergoing surgery tomorrow morning. Praying for peace for our family and wisdom for the medical team.',
    prayerCount: 142,
    timeAgo: '12m ago',
    isUrgent: true,
    hasUserPrayed: false
  },
  {
    id: 'comm-2',
    authorAlias: 'Brother in Faith',
    location: 'London, UK',
    category: 'Guidance',
    requestText: 'Trusting God for career direction and financial provision after losing my job last month. Seeking His clear wisdom and open doors.',
    prayerCount: 98,
    timeAgo: '45m ago',
    isUrgent: false,
    hasUserPrayed: false
  },
  {
    id: 'comm-3',
    authorAlias: 'Anonymous Believer',
    location: 'Texas, USA',
    category: 'Family',
    requestText: 'Asking for reconciliation and forgiveness in our marriage. Praying for heart softeners and peace in our home.',
    prayerCount: 215,
    timeAgo: '2h ago',
    isUrgent: true,
    hasUserPrayed: false
  },
  {
    id: 'comm-4',
    authorAlias: 'Faithful Servant',
    location: 'Toronto, Canada',
    category: 'Praise',
    requestText: 'Praise report! My son passed his medical board exams after 3 years of trusting God. Thanking God for His unwavering faithfulness!',
    prayerCount: 310,
    timeAgo: '3h ago',
    isUrgent: false,
    hasUserPrayed: true
  },
  {
    id: 'comm-5',
    authorAlias: 'Quiet Seeker',
    location: 'Sydney, Australia',
    category: 'Peace',
    requestText: 'Battling severe anxiety and heavy insomnia lately. Asking for God’s surrounding presence and still peace over my mind tonight.',
    prayerCount: 176,
    timeAgo: '5h ago',
    isUrgent: false,
    hasUserPrayed: false
  }
];

const LOCAL_STORAGE_KEY = 'faithpath_community_prayers_v1';

export const CommunityPrayerWall: React.FC = () => {
  const [prayers, setPrayers] = useState<CommunityPrayerRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_PRAYERS;
    } catch {
      return INITIAL_COMMUNITY_PRAYERS;
    }
  });

  const [activeFilter, setActiveFilter] = useState<'All' | 'Urgent' | 'Healing' | 'Family' | 'Praise'>('All');
  const [showPostModal, setShowPostModal] = useState(false);

  // New Request Form State
  const [newRequestText, setNewRequestText] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPrayerRequest['category']>('Healing');
  const [newAlias, setNewAlias] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [prayedAnimationId, setPrayedAnimationId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prayers));
    } catch (err) {
      console.warn('Could not save community prayers to localStorage:', err);
    }
  }, [prayers]);

  const handleTogglePray = (id: string) => {
    setPrayers(prev => prev.map(p => {
      if (p.id === id) {
        const nextPrayed = !p.hasUserPrayed;
        return {
          ...p,
          hasUserPrayed: nextPrayed,
          prayerCount: nextPrayed ? p.prayerCount + 1 : Math.max(0, p.prayerCount - 1)
        };
      }
      return p;
    }));

    setPrayedAnimationId(id);
    setTimeout(() => setPrayedAnimationId(null), 1000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestText.trim()) return;

    const newEntry: CommunityPrayerRequest = {
      id: `comm-user-${Date.now()}`,
      authorAlias: newAlias.trim() || 'Anonymous Believer',
      location: newLocation.trim() || 'Global Christian Body',
      category: newCategory,
      requestText: newRequestText.trim(),
      prayerCount: 1,
      timeAgo: 'Just now',
      isUrgent,
      hasUserPrayed: true
    };

    setPrayers([newEntry, ...prayers]);
    setNewRequestText('');
    setNewAlias('');
    setNewLocation('');
    setIsUrgent(false);
    setShowPostModal(false);
  };

  const filteredPrayers = prayers.filter(p => {
    if (activeFilter === 'Urgent') return p.isUrgent;
    if (activeFilter !== 'All') return p.category === activeFilter;
    return true;
  });

  const totalPrayersCount = prayers.reduce((acc, p) => acc + p.prayerCount, 0);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#1E3A8A] to-blue-950 text-white rounded-[28px] sm:rounded-[32px] p-5 border border-blue-700/60 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-2xl bg-amber-500/20 text-[#D4AF37] border border-amber-400/40 flex items-center justify-center font-bold">
              <Globe2 className="w-4 h-4 text-[#D4AF37]" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>Community Prayer Wall</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Support
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-blue-200 leading-tight">
            Lift up anonymous prayer requests from believers around the world.
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="py-2 px-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#1E3A8A]" />
          <span>Post Anonymous Prayer</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-blue-950/70 p-3 rounded-2xl border border-blue-800/60 text-center relative z-10">
        <div>
          <span className="block text-sm font-black text-[#D4AF37]">
            {totalPrayersCount.toLocaleString()}
          </span>
          <span className="text-[10px] text-blue-200 font-bold">Total Prayers Lifted</span>
        </div>
        <div>
          <span className="block text-sm font-black text-emerald-300">
            {prayers.length}
          </span>
          <span className="text-[10px] text-blue-200 font-bold">Active Requests</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="block text-sm font-black text-rose-300 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
            2,480+
          </span>
          <span className="text-[10px] text-blue-200 font-bold">Believers Online</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none relative z-10 text-xs">
        <span className="text-[10px] font-bold text-blue-300 shrink-0 flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(['All', 'Urgent', 'Healing', 'Family', 'Praise'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border ${
              activeFilter === f
                ? 'bg-[#D4AF37] text-[#1E3A8A] border-[#D4AF37] shadow-xs'
                : 'bg-blue-900/50 hover:bg-blue-800/60 text-blue-200 border-blue-700/50'
            }`}
          >
            {f === 'Urgent' ? '🚨 Urgent Needs' : f}
          </button>
        ))}
      </div>

      {/* Prayer Request Cards List */}
      <div className="space-y-3 relative z-10 max-h-[420px] overflow-y-auto pr-1">
        {filteredPrayers.map((prayer) => (
          <div
            key={prayer.id}
            className={`p-4 rounded-2xl border transition-all duration-300 space-y-2.5 ${
              prayer.isUrgent
                ? 'bg-gradient-to-r from-rose-950/60 via-blue-950/80 to-slate-950/80 border-rose-500/50 shadow-md'
                : 'bg-blue-950/60 hover:bg-blue-900/50 border-blue-800/60'
            }`}
          >
            {/* Author & Category Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-800 text-amber-300 flex items-center justify-center font-extrabold text-[10px] border border-blue-600">
                  {prayer.authorAlias[0] || 'A'}
                </span>
                <div>
                  <span className="font-extrabold text-blue-100">{prayer.authorAlias}</span>
                  {prayer.location && (
                    <span className="text-[10px] text-blue-300/80 block leading-none">
                      {prayer.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {prayer.isUrgent && (
                  <span className="text-[10px] font-black text-rose-300 bg-rose-900/80 border border-rose-500/60 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                    Urgent
                  </span>
                )}
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-full">
                  {prayer.category}
                </span>
              </div>
            </div>

            {/* Prayer Text */}
            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed font-sans">
              "{prayer.requestText}"
            </p>

            {/* Footer & Pray Button */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-800/60 text-xs">
              <span className="text-[10px] font-medium text-blue-300/70 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {prayer.timeAgo}
              </span>

              <button
                onClick={() => handleTogglePray(prayer.id)}
                className={`py-1.5 px-3.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 border transition-all active:scale-95 ${
                  prayer.hasUserPrayed
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                    : 'bg-blue-900/80 hover:bg-blue-800 text-blue-100 border-blue-700'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    prayer.hasUserPrayed ? 'fill-white text-white' : 'text-rose-400'
                  } ${prayedAnimationId === prayer.id ? 'animate-ping' : ''}`}
                />
                <span>{prayer.hasUserPrayed ? 'Prayed!' : 'I Prayed'}</span>
                <span className="ml-1 text-[11px] px-1.5 py-0.2 bg-black/20 rounded-md font-mono">
                  {prayer.prayerCount}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* POST ANONYMOUS PRAYER MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 text-slate-900">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center font-bold shadow-md">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Post Community Prayer Request</h3>
                <p className="text-xs text-slate-500">Shared anonymously with believers globally</p>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Prayer Request
                </label>
                <textarea
                  rows={4}
                  value={newRequestText}
                  onChange={(e) => setNewRequestText(e.target.value)}
                  placeholder="Share your prayer need, health concern, family petition, or praise report..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="Healing">Healing</option>
                    <option value="Family">Family</option>
                    <option value="Peace">Peace</option>
                    <option value="Guidance">Guidance</option>
                    <option value="Comfort">Comfort</option>
                    <option value="Praise">Praise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Alias (Optional)
                  </label>
                  <input
                    type="text"
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="e.g. Sister in Grace"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location Tag (Optional)
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Texas, USA or London, UK"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="urgentCheck" className="text-xs font-bold text-rose-700 cursor-pointer flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Mark as Urgent Prayer Request
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Post Anonymously
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
