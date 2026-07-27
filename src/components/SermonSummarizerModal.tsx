import React, { useState } from 'react';
import { X, FileText, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { summarizeSermonNotes } from '../services/apiService';

interface SermonSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade: () => void;
  isPremium: boolean;
}

export const SermonSummarizerModal: React.FC<SermonSummarizerModalProps> = ({
  isOpen,
  onClose,
  onOpenUpgrade,
  isPremium
}) => {
  const [sermonText, setSermonText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<any>(null);

  if (!isOpen) return null;

  const handleSummarize = async () => {
    if (!sermonText.trim() || loading) return;
    if (!isPremium) {
      onOpenUpgrade();
      return;
    }

    setLoading(true);
    try {
      const res = await summarizeSermonNotes(sermonText);
      setSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">AI Sermon Summarizer</h3>
            <p className="text-xs text-slate-500">Transform Sunday notes into practical insights</p>
          </div>
        </div>

        {!summary ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Paste Sermon Notes or Audio Transcript
              </label>
              <textarea
                rows={6}
                value={sermonText}
                onChange={(e) => setSermonText(e.target.value)}
                placeholder="Paste pastor's sermon points, scripture references, or sermon transcript here..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={!sermonText.trim() || loading}
              className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  Summarizing Sermon...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  Summarize Sermon Notes
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80">
            <h4 className="text-base font-extrabold text-purple-950">{summary.title}</h4>
            <p className="text-xs text-purple-900 font-medium">Main Theme: {summary.mainTheme}</p>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Key Takeaways</span>
              <ul className="space-y-1 text-xs text-slate-800 list-disc pl-4">
                {summary.keyTakeaways?.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-3 rounded-xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase">Weekly Action Step</span>
              <p className="text-xs text-slate-800 font-semibold">{summary.applicationStep}</p>
            </div>

            <button
              onClick={() => setSummary(null)}
              className="w-full py-2 bg-purple-200 text-purple-900 font-bold text-xs rounded-xl"
            >
              Summarize Another Sermon
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
