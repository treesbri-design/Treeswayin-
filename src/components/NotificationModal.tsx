import React from 'react';
import { X, Bell, CheckCircle2, Sparkles, BookOpen, HeartHandshake } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  if (!isOpen) return null;

  const notificationsList = [
    {
      id: 1,
      title: "Verse of the Day is Ready",
      time: "8:00 AM",
      desc: "Romans 8:28 — 'In all things God works for the good...'",
      tab: 'home',
      icon: BookOpen,
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 2,
      title: "Evening Prayer Reminder",
      time: "Yesterday",
      desc: "Take 2 minutes to log your prayers and gratitude entries.",
      tab: 'prayer',
      icon: HeartHandshake,
      iconBg: 'bg-blue-100 text-[#1E3A8A]'
    },
    {
      id: 3,
      title: "Daily Streak Maintained!",
      time: "2 days ago",
      desc: "You have completed 7 consecutive days of Scripture reading.",
      tab: 'profile',
      icon: Sparkles,
      iconBg: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Notifications</h3>
            <p className="text-xs text-slate-500">Daily spiritual updates & reminders</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {notificationsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onNavigateToTab(item.tab);
                  onClose();
                }}
                className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-2xl border border-slate-200/80 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg text-xs ${item.iconBg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <p className="text-xs text-slate-600 pl-8">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
