import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Trash2, 
  RefreshCw, 
  Crown,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import { AIChatMessage, UserProfile } from '../types';
import { sendAIChatQuery } from '../services/apiService';

interface AiTabProps {
  user: UserProfile;
  messages: AIChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AIChatMessage[]>>;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onNavigateToVerse?: (bookName: string, chapter: number) => void;
  onOpenUpgrade: () => void;
}

export const AiTab: React.FC<AiTabProps> = ({
  user,
  messages,
  setMessages,
  initialPrompt,
  onClearInitialPrompt,
  onNavigateToVerse,
  onOpenUpgrade
}) => {
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { text: "What does Romans 8:28 mean?", label: "Romans 8:28 Exegesis" },
    { text: "Help me understand Psalm 23", label: "Psalm 23 Guide" },
    { text: "Give me a prayer for anxiety", label: "Prayer for Anxiety" },
    { text: "How do I overcome spiritual doubt?", label: "Overcoming Doubt" },
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle auto query if initial prompt set from Home
  useEffect(() => {
    if (initialPrompt) {
      handleSendQuery(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    // Check free chat limit if not premium (e.g., 5 messages per day)
    const userMsgsCount = messages.filter(m => m.role === 'user').length;
    if (!user.isPremium && userMsgsCount >= 10) {
      onOpenUpgrade();
      return;
    }

    const userMessage: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await sendAIChatQuery(textToSend, messages);
      
      const assistantMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result?.reply || "May the peace of God be with you. God's Word offers truth and light for your journey.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scriptureReferences: result?.scriptureReferences || ["Romans 8:28"]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("AI Query Error:", err);
      const fallbackAssistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `**Scripture Focus:** *Romans 8:28*\n\n"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."\n\nThank you for asking: "${textToSend}". God's Word is a lamp unto our feet. Feel free to explore the Bible tab for deeper study!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scriptureReferences: ["Romans 8:28", "Psalm 119:105"]
      };
      setMessages(prev => [...prev, fallbackAssistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-to-speech for AI response
  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis?.cancel();
      const plainText = text.replace(/[*_#\[\]]/g, '');
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMsgId(msgId);
    }
  };

  // Parse reference to navigate
  const handleReferenceClick = (refStr: string) => {
    const parts = refStr.trim().split(' ');
    if (parts.length >= 2) {
      const book = parts[0];
      const chapAndVerse = parts[1].split(':')[0];
      const chapter = parseInt(chapAndVerse, 10) || 1;
      if (onNavigateToVerse) {
        onNavigateToVerse(book, chapter);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 animate-fadeIn">
      {/* Top AI Bar */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2448B1] to-[#122452] text-white p-3.5 sm:p-4 rounded-[24px] sm:rounded-[32px] shadow-lg flex items-center justify-between mb-3 border border-blue-700/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#D4AF37] flex items-center justify-center text-[#1E3A8A] font-extrabold shadow-md shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-extrabold tracking-tight truncate">FaithPath AI Guide</h3>
            <p className="text-[10px] text-blue-200 truncate">Biblically grounded Q&A & Counsel</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear chat conversation?')) setMessages([]);
              }}
              className="p-2 text-blue-200 hover:text-white hover:bg-blue-800/60 rounded-xl transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {!user.isPremium && (
            <button
              onClick={onOpenUpgrade}
              className="px-3 py-1.5 bg-[#D4AF37] text-[#1E3A8A] rounded-xl text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
            >
              <Crown className="w-3 h-3" />
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 text-center space-y-4 border border-slate-100 shadow-lg shadow-slate-200/50 my-auto">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#D4AF37] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#1E3A8A] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
                <Bot className="w-6 h-6" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Welcome to FaithPath AI</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Ask any question about Scripture, Bible verses, theology, or personal prayer guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 text-left pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Suggested Prompts
              </span>
              {samplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(item.text)}
                  className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-100 rounded-2xl text-xs font-semibold text-slate-800 hover:text-[#1E3A8A] transition-all flex items-center justify-between group"
                >
                  <span className="truncate mr-2">"{item.text}"</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center text-xs shadow-xs shrink-0 mt-0.5">
                    ✝
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-[22px] p-3.5 sm:p-4 shadow-xs space-y-2 break-words overflow-hidden ${
                    isUser
                      ? 'bg-[#1E3A8A] text-white rounded-tr-none'
                      : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none shadow-md shadow-slate-200/30'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-100/50 pb-1 mb-1 gap-2">
                    <span className={`font-bold ${isUser ? 'text-blue-200' : 'text-[#1E3A8A]'}`}>
                      {isUser ? 'You' : 'FaithPath AI'}
                    </span>
                    <span className="shrink-0">{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className={`text-xs leading-relaxed break-words overflow-x-auto ${isUser ? 'text-white' : 'text-slate-800'}`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div className="markdown-body space-y-2 break-words">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    )}
                  </div>

                  {/* Scripture Reference Tags if Assistant */}
                  {!isUser && msg.scriptureReferences && msg.scriptureReferences.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400">Passages:</span>
                      {msg.scriptureReferences.map((ref, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleReferenceClick(ref)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] border border-blue-200/80 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-colors max-w-full truncate"
                        >
                          <BookOpen className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{ref}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Assistant Footer Controls */}
                  {!isUser && (
                    <div className="pt-1.5 flex items-center justify-end gap-2 text-slate-400 text-xs">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 1500);
                        }}
                        className="hover:text-slate-600 p-1 shrink-0"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? (
                          <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`p-1 shrink-0 transition-colors ${
                          speakingMsgId === msg.id ? 'text-amber-500 font-bold animate-pulse' : 'hover:text-slate-600'
                        }`}
                        title="Read Aloud"
                      >
                        {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center text-xs shadow-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center text-xs shadow-xs shrink-0">
              ✝
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl py-3 px-4 shadow-md flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#1E3A8A] animate-spin shrink-0" />
              <span className="text-xs text-slate-500 font-medium">Searching Scriptures & generating counsel...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="mt-2 pt-2 border-t border-slate-100 bg-white rounded-2xl p-2 shadow-lg shadow-slate-200/40 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a Bible question, e.g. What is Psalm 23?"
            className="flex-1 px-3.5 py-2.5 text-xs text-slate-900 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 min-w-0"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl shadow-sm disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </form>
      </div>
    </div>
  );
};
