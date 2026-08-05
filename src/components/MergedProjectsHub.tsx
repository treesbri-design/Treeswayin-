import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitMerge, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Calendar, 
  Users, 
  BookOpen, 
  Share2, 
  Globe, 
  Layers, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

export interface ChurchProject {
  id: string;
  name: string;
  denomination: string;
  location: string;
  memberCount: number;
  activeCampaign: string;
  isMerged: boolean;
  jointEventsCount: number;
  sharedPrayersCount: number;
  bannerImage: string;
}

const INITIAL_PROJECTS: ChurchProject[] = [
  {
    id: 'proj-1',
    name: 'Grace Community Fellowship',
    denomination: 'Non-Denominational',
    location: 'Austin, TX',
    memberCount: 2450,
    activeCampaign: '21 Days of Prayer & Fasting',
    isMerged: true,
    jointEventsCount: 4,
    sharedPrayersCount: 128,
    bannerImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'proj-2',
    name: 'Redeemer City Outreach',
    denomination: 'Anglican / Evangelical',
    location: 'Chicago, IL',
    memberCount: 1820,
    activeCampaign: 'Urban Youth & Food Pantry Drive',
    isMerged: true,
    jointEventsCount: 2,
    sharedPrayersCount: 84,
    bannerImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'proj-3',
    name: 'Global Mission Alliance',
    denomination: 'Inter-Church Network',
    location: 'International (32 Countries)',
    memberCount: 14200,
    activeCampaign: 'World Hope Bible Distribution',
    isMerged: false,
    jointEventsCount: 6,
    sharedPrayersCount: 450,
    bannerImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'proj-4',
    name: 'Hope Harbor Young Adults',
    denomination: 'Baptist / Contemporary',
    location: 'Atlanta, GA',
    memberCount: 950,
    activeCampaign: 'Summer Bible Study & Worship Nights',
    isMerged: false,
    jointEventsCount: 3,
    sharedPrayersCount: 62,
    bannerImage: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600'
  }
];

export const MergedProjectsHub: React.FC = () => {
  const [projects, setProjects] = useState<ChurchProject[]>(() => {
    try {
      const saved = localStorage.getItem('faithpath_merged_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const saveProjects = (updated: ChurchProject[]) => {
    setProjects(updated);
    localStorage.setItem('faithpath_merged_projects', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleMergeProject = (id: string) => {
    const updated = projects.map(p => {
      if (p.id === id) {
        const nextState = !p.isMerged;
        if (nextState) {
          triggerToast(`Merged ${p.name} into your active FaithPath feed!`);
        } else {
          triggerToast(`Unmerged ${p.name}`);
        }
        return { ...p, isMerged: nextState };
      }
      return p;
    });
    saveProjects(updated);
  };

  const mergedCount = projects.filter(p => p.isMerged).length;
  const totalJointEvents = projects.filter(p => p.isMerged).reduce((acc, curr) => acc + curr.jointEventsCount, 0);
  const totalSharedPrayers = projects.filter(p => p.isMerged).reduce((acc, curr) => acc + curr.sharedPrayersCount, 0);

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <GitMerge className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#1E3A8A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
            <GitMerge className="w-3.5 h-3.5 text-blue-600" />
            Project Merger Center (Option 1)
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            Merged Church & Ministry Projects
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mt-0.5">
            Combine prayer networks, joint worship events, and group devotionals across partner churches into your unified FaithPath workspace.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-[#1E3A8A] text-white px-4 py-2.5 rounded-2xl shadow-md border border-blue-800 flex items-center gap-3 shrink-0">
          <Layers className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Merged Active</div>
            <div className="text-sm font-black text-white">{mergedCount} Partner Ministries</div>
          </div>
        </div>
      </div>

      {/* Merged Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Merged Networks</span>
          <span className="text-base sm:text-lg font-black text-[#1E3A8A]">{mergedCount} Active</span>
        </div>
        <div className="text-center border-x border-slate-200">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Joint Events</span>
          <span className="text-base sm:text-lg font-black text-emerald-600">{totalJointEvents} Scheduled</span>
        </div>
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Synced Prayers</span>
          <span className="text-base sm:text-lg font-black text-amber-600">+{totalSharedPrayers} Streamed</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.map((proj) => (
          <motion.div
            key={proj.id}
            layout
            className={`rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              proj.isMerged 
                ? 'bg-gradient-to-r from-blue-50/80 via-white to-amber-50/40 border-blue-200 shadow-sm' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Left Content */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative shrink-0">
                <img 
                  src={proj.bannerImage} 
                  alt={proj.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                />
                {proj.isMerged && (
                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">{proj.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {proj.denomination}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {proj.location}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {proj.memberCount.toLocaleString()} members
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E3A8A]">
                  <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
                  <span>Campaign: {proj.activeCampaign}</span>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => toggleMergeProject(proj.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 ${
                  proj.isMerged
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-[#1E3A8A] hover:bg-blue-900 text-white shadow-xs'
                }`}
              >
                {proj.isMerged ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Merged ✓
                  </>
                ) : (
                  <>
                    <GitMerge className="w-4 h-4 text-amber-400" />
                    Merge Project
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
