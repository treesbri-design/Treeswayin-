import React, { useState } from 'react';
import { X, Calendar, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { generateAIStudyPlan } from '../services/apiService';
import { ReadingPlan } from '../types';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReadingPlan: (plan: ReadingPlan) => void;
  onOpenUpgrade: () => void;
  isPremium: boolean;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  onAddReadingPlan,
  onOpenUpgrade,
  isPremium
}) => {
  const [goal, setGoal] = useState<string>('Overcoming Anxiety & Building Peace');
  const [daysCount, setDaysCount] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    if (!goal.trim() || loading) return;
    if (!isPremium) {
      onOpenUpgrade();
      return;
    }

    setLoading(true);
    try {
      const res = await generateAIStudyPlan(goal, daysCount);
      setGeneratedPlan(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanToProfile = () => {
    if (!generatedPlan) return;
    const newPlan: ReadingPlan = {
      id: `ai-plan-${Date.now()}`,
      title: generatedPlan.title || goal,
      description: generatedPlan.description || 'Custom FaithPath AI Study Plan',
      totalDays: daysCount,
      currentDay: 1,
      category: 'AI Personalized',
      isCustomAI: true,
      days: (generatedPlan.days || []).map((d: any) => ({
        dayNumber: d.day || 1,
        title: d.title || `Day ${d.day}`,
        passage: d.passage || 'Psalm 23:1',
        summary: d.summary || 'Daily reflection',
        isCompleted: false
      }))
    };

    onAddReadingPlan(newPlan);
    onClose();
    alert('Plan added to your Profile Reading Plans!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1E3A8A] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Personalized AI Study Plan</h3>
            <p className="text-xs text-slate-500">Create a custom Bible reading journey</p>
          </div>
        </div>

        {!generatedPlan ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                What topic or goal do you want to focus on?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Trusting God, Forgiveness, Marriage, Purpose..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Plan Duration</label>
              <div className="flex gap-2">
                {[7, 14, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDaysCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      daysCount === num
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num} Days
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGeneratePlan}
              disabled={!goal.trim() || loading}
              className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  Generate AI Study Plan
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2">
              <h4 className="text-sm font-extrabold text-[#1E3A8A]">{generatedPlan.title}</h4>
              <p className="text-xs text-slate-600">{generatedPlan.description}</p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(generatedPlan.days || []).map((day: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-[#1E3A8A]">
                    <span>Day {day.day}: {day.title}</span>
                    <span>{day.passage}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{day.summary}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setGeneratedPlan(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl"
              >
                Re-generate
              </button>
              <button
                onClick={handleSavePlanToProfile}
                className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save to Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
