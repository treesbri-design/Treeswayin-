import React from 'react';
import { Home, BookOpen, GraduationCap, Sparkles, BookHeart, User } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'bible' as NavTab, label: 'Bible', icon: BookOpen },
    { id: 'lessons' as NavTab, label: 'Lessons', icon: GraduationCap },
    { id: 'ai' as NavTab, label: 'FaithAI', icon: Sparkles, isHighlight: true },
    { id: 'prayer' as NavTab, label: 'Prayer', icon: BookHeart },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full p-0.5 shadow-lg transition-transform duration-200 ${
                  isActive ? 'scale-110 ring-2 ring-[#D4AF37]' : 'hover:scale-105'
                } bg-gradient-to-tr from-[#1E3A8A] via-[#2A4AA5] to-[#D4AF37]`}>
                  <div className="w-full h-full bg-[#1E3A8A] rounded-full flex items-center justify-center text-[#D4AF37]">
                    <Icon className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${
                  isActive ? 'text-[#1E3A8A]' : 'text-slate-500'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-xl transition-all duration-150 ${
                isActive ? 'text-[#1E3A8A] font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#1E3A8A]' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#D4AF37]" />
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? 'text-[#1E3A8A] font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
