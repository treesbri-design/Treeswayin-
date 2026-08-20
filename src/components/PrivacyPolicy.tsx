import React, { useState } from 'react';
import { Shield, Lock, Eye, Database, FileText, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose, isModal = false }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('data-collection');

  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  };

  const content = (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0d4c73] to-[#082f49] text-white p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Shield className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Privacy Policy</h2>
            <p className="text-xs text-blue-200">FaithConnect Application & Services</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-2">
          Last Updated: <strong>August 19, 2026</strong>. Your spiritual reflections, prayers, and personal notes are sacred to us. We are committed to protecting your privacy and ensuring your personal faith journey remains secure.
        </p>
      </div>

      {/* Highlights & Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Private Prayers</h4>
            <p className="text-[11px] text-slate-500 leading-normal">Your prayer requests and journal notes are stored privately and never sold.</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
          <Eye className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Zero Ad Tracking</h4>
            <p className="text-[11px] text-slate-500 leading-normal">We do not sell your personal data or profile to third-party ad networks.</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-start gap-2.5">
          <Database className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">User Data Control</h4>
            <p className="text-[11px] text-slate-500 leading-normal">Export or delete your prayers, highlights, and history at any time.</p>
          </div>
        </div>
      </div>

      {/* Accordion Detailed Sections */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Section 1 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('data-collection')}
            className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d4c73]" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">1. Information We Collect</span>
            </div>
            {expandedSection === 'data-collection' ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {expandedSection === 'data-collection' && (
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-200">
              <p>
                <strong>Account & Profile Data:</strong> When you create an account, we may store your email address, display name, and prayer preferences to synchronize your reading progress across devices.
              </p>
              <p>
                <strong>User-Generated Content:</strong> When you write prayer requests, journal entries, Bible highlights, or chat with the AI spiritual study assistant, this content is processed strictly to provide spiritual reflection features.
              </p>
              <p>
                <strong>Technical & Device Data:</strong> We collect non-identifying telemetry such as operating system version, browser type, and anonymous error logs to maintain app stability.
              </p>
            </div>
          )}
        </div>

        {/* Section 2 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('how-we-use')}
            className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d4c73]" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">2. How We Use Your Information</span>
            </div>
            {expandedSection === 'how-we-use' ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {expandedSection === 'how-we-use' && (
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-200">
              <p>We use the information collected solely to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deliver personalized scripture plans, daily devotionals, and prayer tracking.</li>
                <li>Power AI Bible study reflections and contextual verse explanations through secure server endpoints.</li>
                <li>Send voluntary notifications for daily verses and prayer reminders when enabled by you.</li>
                <li>Improve app performance, fix crashes, and ensure smooth offline reading.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('ai-privacy')}
            className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d4c73]" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">3. AI Spiritual Assistant Privacy</span>
            </div>
            {expandedSection === 'ai-privacy' ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {expandedSection === 'ai-privacy' && (
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-200">
              <p>
                When you ask biblical questions or request prayer assistance, your prompt is securely processed via server-side encrypted connections. We do not use your private personal prayer journals to train public generative AI models without authorization.
              </p>
            </div>
          )}
        </div>

        {/* Section 4 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('data-retention')}
            className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d4c73]" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">4. Data Retention & Deletion</span>
            </div>
            {expandedSection === 'data-retention' ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {expandedSection === 'data-retention' && (
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-200">
              <p>
                You retain complete ownership of your data. You can export a full JSON backup of your notes and prayers anytime from the Profile settings, or use the <strong>Reset Local App Cache</strong> button to erase locally stored content.
              </p>
            </div>
          )}
        </div>

        {/* Section 5 */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('contact')}
            className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d4c73]" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">5. Contact & Support</span>
            </div>
            {expandedSection === 'contact' ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {expandedSection === 'contact' && (
            <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 border-t border-slate-200">
              <p>
                If you have questions or concerns about this Privacy Policy or data protection, please contact us at:
              </p>
              <p className="font-semibold text-slate-900">
                Email: <a href="mailto:support@faithconnect.app" className="text-[#0d4c73] underline">support@faithconnect.app</a>
              </p>
              <p className="text-[11px] text-slate-500">
                FaithConnect Christian Applications & Ministries
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer info for Google Play Compliance */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>This privacy policy is compliant with Google Play Developer Policy and Global Data Protection Standards.</p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
        <div className="relative w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center text-sm font-bold transition-colors"
            >
              ✕
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return content;
};
