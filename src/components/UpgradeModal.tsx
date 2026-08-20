import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  ShieldCheck,
  Star
} from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  const features = [
    { title: "Unlimited AI Chats & Bible Q&A", desc: "No daily question limits with FaithConnect AI.", icon: MessageSquare },
    { title: "Personalized AI Bible Study Plans", desc: "Tailored 7-day or 30-day topical plans.", icon: BookOpen },
    { title: "AI-Generated Devotionals", desc: "Customized daily devotionals for your current season.", icon: Sparkles },
    { title: "Sermon & Lecture Summaries", desc: "Turn sermon notes into actionable takeaways.", icon: FileText },
    { title: "Voice AI Bible Study & Audio Reader", desc: "Listen to natural synthesized narration.", icon: Volume2 },
  ];

  const handleSubscribe = () => {
    onUpgradeSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-fadeIn max-h-[92vh] overflow-y-auto border border-amber-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#1E3A8A] via-[#2A4AA5] to-[#D4AF37] p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-[#1E3A8A] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
              <Crown className="w-7 h-7" />
            </div>
          </div>

          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900 px-3.5 py-1 rounded-full border border-amber-400/60 shadow-xs">
            🎉 30-DAY FREE PREMIUM TRIAL
          </span>

          <h2 className="text-xl font-black text-slate-900">
            Deepen Your Spiritual Journey
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Enjoy 30 days of full complimentary access to AI Bible study, voice prayer recording, and custom study plans.
          </p>
        </div>

        {/* Billing Selector Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly ($4.99/mo after trial)
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
              billingCycle === 'yearly'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Yearly ($39.99/yr after trial)
            <span className="absolute -top-2 -right-1 bg-[#D4AF37] text-[#1E3A8A] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
              Save 33%
            </span>
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-2.5 pt-1">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                <div className="p-2 rounded-xl bg-[#1E3A8A] text-[#D4AF37] shrink-0 mt-0.5 shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Price & Subscribe Button */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-center">
            <span className="text-2xl font-extrabold text-[#1E3A8A]">
              $0.00
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {' '}for first 30 days ({billingCycle === 'yearly' ? '$39.99/yr' : '$4.99/mo'} after)
            </span>
            <p className="text-[11px] text-emerald-700 font-bold mt-1 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200">
              🎁 100% Free First 30 Days • Cancel Anytime
            </p>
          </div>

          <button
            onClick={handleSubscribe}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#C29F2F] to-[#1E3A8A] hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-white" />
            Claim 30-Day Free Premium Trial
          </button>

          <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Secure instant activation • No commitments
          </p>
        </div>
      </div>
    </div>
  );
};
