import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  HeartHandshake, 
  Sparkles, 
  Filter, 
  Calendar, 
  Smile, 
  Trash2, 
  Edit3, 
  X,
  Share2,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Volume2,
  Radio,
  FileAudio,
  RefreshCw,
  Tag,
  Hash,
  Flame,
  Trophy
} from 'lucide-react';
import { PrayerEntry, UserProfile } from '../types';
import { PrayerCircles } from './PrayerCircles';
import { PrayerAnalyticsWidget } from './PrayerAnalyticsWidget';
import { StreakCelebrationModal } from './StreakCelebrationModal';
import { Users, BookMarked } from 'lucide-react';
import { ttsService } from '../services/ttsService';

interface PrayerTabProps {
  user?: UserProfile;
  prayers: PrayerEntry[];
  onAddPrayer: (entry: Omit<PrayerEntry, 'id' | 'createdAt' | 'isAnswered'>) => void;
  onToggleAnswered: (id: string, testimonyNote?: string) => void;
  onDeletePrayer: (id: string) => void;
}

export const PrayerTab: React.FC<PrayerTabProps> = ({
  user,
  prayers,
  onAddPrayer,
  onToggleAnswered,
  onDeletePrayer
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'journal' | 'circles'>('journal');
  const [showAddModal, setShowAddModal] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const action = urlParams.get('action');
      return action === 'new_note' || action === 'new_prayer';
    } catch (e) {
      return false;
    }
  });
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Answered'>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [ttsSpeakingId, setTtsSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ttsService.subscribe((id) => setTtsSpeakingId(id));
    return unsub;
  }, []);

  // New Prayer Form state
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<PrayerEntry['category']>('General');
  const [mood, setMood] = useState<PrayerEntry['mood']>('Hopeful');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  const SUGGESTED_TAGS = [
    '#Health',
    '#Family',
    '#Gratitude',
    '#Guidance',
    '#Peace',
    '#Work',
    '#Finances',
    '#Spiritual',
    '#Relationships',
    '#Praise'
  ];

  const handleAddFormTag = (rawTag: string) => {
    let clean = rawTag.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) {
      clean = `#${clean}`;
    }
    if (!formTags.includes(clean)) {
      setFormTags(prev => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveFormTag = (tagToRemove: string) => {
    setFormTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    prayers.forEach(p => {
      p.tags?.forEach(t => tagSet.add(t));
    });
    SUGGESTED_TAGS.forEach(st => {
      if (tagSet.size < 6) tagSet.add(st);
    });
    return Array.from(tagSet);
  }, [prayers]);

  // Microphone Audio Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Audio Playback state for cards
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Answered Modal state
  const [answeringPrayerId, setAnsweringPrayerId] = useState<string | null>(null);
  const [testimonyNote, setTestimonyNote] = useState<string>('');

  const moodEmojis: Record<PrayerEntry['mood'], string> = {
    Blessed: '✨',
    Anxious: '🕊️',
    Hopeful: '🌅',
    Thankful: '🙌',
    Seeking: '🔍',
    Peaceful: '🌿'
  };

  const categoryColors: Record<PrayerEntry['category'], string> = {
    Family: 'bg-blue-50 text-blue-800 border-blue-200',
    Healing: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    Guidance: 'bg-purple-50 text-purple-800 border-purple-200',
    Peace: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    Gratitude: 'bg-amber-50 text-amber-800 border-amber-200',
    General: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const filteredPrayers = prayers.filter(p => {
    if (filterStatus === 'Active' && p.isAnswered) return false;
    if (filterStatus === 'Answered' && !p.isAnswered) return false;
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    if (selectedTag !== 'All' && (!p.tags || !p.tags.includes(selectedTag))) return false;
    return true;
  });

  // Start Audio Recording using getUserMedia
  const startRecording = async () => {
    setRecordingError(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
        };

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Optional Web Speech API auto-transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setContent(prev => (prev ? prev + ' ' : '') + transcript);
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      }
    } catch (err: any) {
      console.error('Microphone error:', err);
      setRecordingError(err.message || 'Could not access microphone. Please allow microphone permissions.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
    setRecordedDuration(recordingDuration);
  };

  const handleResetRecording = () => {
    stopRecording();
    setAudioUrl(null);
    setRecordingDuration(0);
    setRecordedDuration(0);
  };

  const handleSubmitNewPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !audioUrl && !content.trim()) return;

    onAddPrayer({
      title: title.trim() || (audioUrl ? 'Voice Prayer Recording' : 'Prayer Entry'),
      content: content.trim() || (audioUrl ? 'Audio Prayer entry attached.' : ''),
      category,
      mood,
      audioUrl: audioUrl || undefined,
      audioDuration: recordedDuration || undefined,
      tags: formTags.length > 0 ? formTags : undefined
    });

    // Reset Form
    setTitle('');
    setContent('');
    setCategory('General');
    setMood('Hopeful');
    setFormTags([]);
    setCustomTagInput('');
    handleResetRecording();
    setShowAddModal(false);

    // Trigger 7-Day Streak celebration modal on prayer submission
    if ((user?.streakDays || 7) >= 7) {
      setTimeout(() => {
        setShowStreakModal(true);
      }, 300);
    }
  };

  const handleConfirmAnswered = () => {
    if (answeringPrayerId) {
      onToggleAnswered(answeringPrayerId, testimonyNote);
      setAnsweringPrayerId(null);
      setTestimonyNote('');
    }
  };

  // Audio Playback handler
  const togglePlayAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      const audio = audioElementsRef.current[id];
      if (audio) {
        audio.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Pause any existing playing audio
      if (playingAudioId && audioElementsRef.current[playingAudioId]) {
        audioElementsRef.current[playingAudioId].pause();
      }

      if (!audioElementsRef.current[id]) {
        const audio = new Audio(url);
        audio.onended = () => setPlayingAudioId(null);
        audioElementsRef.current[id] = audio;
      }

      audioElementsRef.current[id].play();
      setPlayingAudioId(id);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Subtab Navigation Bar */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/80">
        <button
          onClick={() => setActiveSubTab('journal')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'journal'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          Personal Prayer Journal
        </button>
        <button
          onClick={() => setActiveSubTab('circles')}
          className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'circles'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          Private Prayer Circles
        </button>
      </div>

      {activeSubTab === 'circles' ? (
        <PrayerCircles
          user={user || {
            id: 'guest',
            name: 'Believer',
            email: 'user@example.com',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            isPremium: false,
            streakDays: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            preferredTranslation: 'NIV',
            readingProgressCount: 0,
            joinedDate: new Date().toISOString().split('T')[0]
          }}
        />
      ) : (
        <>
          {/* Prayer Journal Header */}
          <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2A4AA5] to-[#122452] text-white p-6 rounded-[28px] sm:rounded-[32px] shadow-lg border border-blue-700/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#1E3A8A] px-2.5 py-0.5 rounded-full">
                Spiritual Journal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Prayer & Gratitude</h2>
              <p className="text-xs text-blue-200 mt-1">Cast all your anxiety on Him, because He cares for you. — 1 Peter 5:7</p>
            </div>

            <button
              onClick={() => {
                setShowAddModal(true);
                handleResetRecording();
              }}
              className="py-2.5 px-4 bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1E3A8A] font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>

          {/* 7-Day Streak Active Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-yellow-500/15 border border-amber-300/70 p-3.5 rounded-[22px] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                <Flame className="w-5 h-5 fill-slate-950 animate-pulse text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-amber-950">
                    {user?.streakDays || 7}-Day Prayer Streak Active! 🔥
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md shadow-2xs">
                    7+ DAYS
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 font-medium leading-tight">
                  You've logged consecutive daily prayers. Tap to celebrate!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition-transform active:scale-95 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              Celebrate 🎉
            </button>
          </div>

          {/* Prayer Analytics & Data Visualization */}
          <PrayerAnalyticsWidget prayers={prayers} />

      {/* Filter Tabs & Tags */}
      <div className="bg-white p-3.5 rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            {(['All', 'Active', 'Answered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Family">Family</option>
            <option value="Healing">Healing</option>
            <option value="Guidance">Guidance</option>
            <option value="Peace">Peace</option>
            <option value="Gratitude">Gratitude</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Tag Filtering Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              Filter by Tag
            </span>
            {selectedTag !== 'All' && (
              <button
                onClick={() => setSelectedTag('All')}
                className="text-[10px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Clear Tag ({selectedTag})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedTag('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all border ${
                selectedTag === 'All'
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Tags
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'All' : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 border ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50/70 text-amber-900 border-amber-200/80 hover:bg-amber-100'
                }`}
              >
                <Hash className="w-3 h-3 opacity-70" />
                <span>{tag.replace(/^#/, '')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prayer Entries List */}
      <div className="space-y-3">
        {filteredPrayers.length === 0 ? (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] p-8 text-center space-y-3 border border-slate-100 shadow-lg shadow-slate-200/50">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No prayer entries found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Start recording or writing your prayers, gratitude list, or petitions today to track God's faithfulness.
            </p>
            <button
              onClick={() => {
                setShowAddModal(true);
                handleResetRecording();
              }}
              className="py-2.5 px-4 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md"
            >
              <Mic className="w-4 h-4 text-[#D4AF37]" />
              Record First Audio Prayer
            </button>
          </div>
        ) : (
          filteredPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className={`bg-white rounded-[24px] sm:rounded-[28px] p-5 shadow-lg shadow-slate-200/40 border transition-all ${
                prayer.isAnswered
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-100 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{moodEmojis[prayer.mood]}</span>
                  <div>
                    <h3 className={`text-sm font-extrabold flex items-center gap-2 ${prayer.isAnswered ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      <span>{prayer.title}</span>
                      {prayer.audioUrl && (
                        <span className="text-[10px] font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-rose-500 animate-pulse" />
                          Voice
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">{prayer.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {prayer.content && !prayer.audioUrl && (
                    <button
                      onClick={() => {
                        const narrationText = `Prayer: ${prayer.title}. ${prayer.content}`;
                        ttsService.toggle(prayer.id, narrationText);
                      }}
                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[10px] font-bold ${
                        ttsSpeakingId === prayer.id
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] animate-pulse'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-600 border-slate-200'
                      }`}
                      title={ttsSpeakingId === prayer.id ? 'Stop Narration' : 'Narrate prayer'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      {ttsSpeakingId === prayer.id && <span>Listening</span>}
                    </button>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryColors[prayer.category]}`}>
                    {prayer.category}
                  </span>
                  <button
                    onClick={() => onDeletePrayer(prayer.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Prayer Tags */}
              {prayer.tags && prayer.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  {prayer.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(selectedTag === tag ? 'All' : tag);
                      }}
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-all flex items-center gap-0.5 ${
                        selectedTag === tag
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-2xs'
                          : 'bg-amber-50/90 text-amber-900 border-amber-200/90 hover:bg-amber-100 hover:border-amber-300'
                      }`}
                      title={`Filter journal by ${tag}`}
                    >
                      <Hash className="w-2.5 h-2.5 opacity-70" />
                      {tag.replace(/^#/, '')}
                    </button>
                  ))}
                </div>
              )}

              {/* Audio Player Card Section if audio URL exists */}
              {prayer.audioUrl && (
                <div className="my-3 p-3 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl flex items-center gap-3">
                  <button
                    onClick={() => togglePlayAudio(prayer.id, prayer.audioUrl!)}
                    className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-md hover:bg-blue-900 transition-transform active:scale-95 shrink-0"
                  >
                    {playingAudioId === prayer.id ? (
                      <Pause className="w-5 h-5 text-[#D4AF37]" />
                    ) : (
                      <Play className="w-5 h-5 text-[#D4AF37] ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-xs font-extrabold text-[#1E3A8A]">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        Audio Prayer Entry
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {prayer.audioDuration ? formatTime(prayer.audioDuration) : 'Voice'}
                      </span>
                    </div>

                    {/* Animated Audio Wave Simulation */}
                    <div className="flex items-center gap-1 h-3 overflow-hidden">
                      {[40, 70, 30, 90, 50, 80, 40, 60, 100, 40, 70, 30, 80, 50, 90, 40].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            playingAudioId === prayer.id
                              ? 'bg-[#1E3A8A] animate-pulse'
                              : 'bg-slate-300'
                          }`}
                          style={{
                            height: `${playingAudioId === prayer.id ? Math.max(20, (h * Math.random()) + 20) : h}%`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {prayer.content && (
                <p className="text-xs text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">
                  {prayer.content}
                </p>
              )}

              {/* Testimony / Answered Banner */}
              {prayer.isAnswered ? (
                <div className="bg-emerald-100/80 border border-emerald-300 rounded-2xl p-3 space-y-1 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Answered Prayer! ({prayer.answeredDate})
                  </div>
                  {prayer.testimonyNote && (
                    <p className="text-xs text-emerald-900 italic font-medium">
                      "{prayer.testimonyNote}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setAnsweringPrayerId(prayer.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200"
                  >
                    <Circle className="w-3.5 h-3.5" />
                    Mark as Answered
                  </button>

                  <span className="text-[10px] font-semibold text-slate-400">
                    Mood: {prayer.mood}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* NEW PRAYER MODAL WITH MICROPHONE RECORDING */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                handleResetRecording();
                setShowAddModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-[#1E3A8A] text-[#D4AF37] flex items-center justify-center font-bold shadow-md">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">New Prayer & Gratitude</h3>
                <p className="text-xs text-slate-500">Record a spoken prayer or type your thoughts</p>
              </div>
            </div>

            {/* Microphone Recording Section */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-500" />
                  Voice Prayer Recording
                </span>
                {isRecording && (
                  <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    {formatTime(recordingDuration)}
                  </span>
                )}
              </div>

              {recordingError && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-xl border border-rose-200">
                  {recordingError}
                </p>
              )}

              {/* Active Recording or Audio Preview Controls */}
              {!isRecording && !audioUrl && (
                <button
                  type="button"
                  onClick={startRecording}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>Tap to Record Voice Prayer</span>
                </button>
              )}

              {isRecording && (
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1 h-8">
                    {[30, 60, 90, 40, 80, 100, 50, 70, 90, 60, 40, 80].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.max(20, Math.sin(recordingDuration + i) * 100)}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-full py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    <Square className="w-4 h-4 text-rose-400 fill-rose-400" />
                    <span>Stop & Save Voice Recording</span>
                  </button>
                </div>
              )}

              {audioUrl && !isRecording && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <FileAudio className="w-4 h-4 text-emerald-600" />
                      Voice Recording Ready ({formatTime(recordedDuration)})
                    </span>
                    <button
                      type="button"
                      onClick={handleResetRecording}
                      className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-record
                    </button>
                  </div>

                  <audio src={audioUrl} controls className="w-full h-8 rounded-lg" />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitNewPrayer} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Peace for family, Wisdom for new job..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PrayerEntry['category'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Family">Family</option>
                    <option value="Healing">Healing</option>
                    <option value="Guidance">Guidance</option>
                    <option value="Peace">Peace</option>
                    <option value="Gratitude">Gratitude</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mood</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as PrayerEntry['mood'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Blessed">✨ Blessed</option>
                    <option value="Anxious">🕊️ Anxious</option>
                    <option value="Hopeful">🌅 Hopeful</option>
                    <option value="Thankful">🙌 Thankful</option>
                    <option value="Seeking">🔍 Seeking</option>
                    <option value="Peaceful">🌿 Peaceful</option>
                  </select>
                </div>
              </div>

              {/* Tags Selection & Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Tags & Labels (e.g. #Health, #Family)
                </label>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {formTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-[#1E3A8A] text-amber-300 border border-blue-900 shadow-2xs"
                      >
                        <Hash className="w-3 h-3 opacity-80" />
                        {t.replace(/^#/, '')}
                        <button
                          type="button"
                          onClick={() => handleRemoveFormTag(t)}
                          className="hover:text-white p-0.5 text-slate-300 transition-colors ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">#</span>
                    <input
                      type="text"
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddFormTag(customTagInput);
                        }
                      }}
                      placeholder="Type custom tag & press Enter"
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddFormTag(customTagInput)}
                    disabled={!customTagInput.trim()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl shrink-0"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Suggestions:</span>
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_TAGS.map((st) => {
                      const isSelected = formTags.includes(st);
                      return (
                        <button
                          type="button"
                          key={st}
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveFormTag(st);
                            } else {
                              handleAddFormTag(st);
                            }
                          }}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all flex items-center gap-0.5 ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <Hash className="w-2.5 h-2.5 opacity-60" />
                          {st.replace(/^#/, '')}
                          {isSelected ? ' ✓' : ' +'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prayer / Transcript Notes
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Dear Heavenly Father... (spoken words auto-transcribe here if supported)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleResetRecording();
                    setShowAddModal(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MARK ANSWERED MODAL */}
      {answeringPrayerId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setAnsweringPrayerId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                🙌
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Praise God! Mark as Answered</h3>
              <p className="text-xs text-slate-500">Record a brief note of God's testimony and how He answered.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Testimony Note (Optional)</label>
              <textarea
                rows={3}
                value={testimonyNote}
                onChange={(e) => setTestimonyNote(e.target.value)}
                placeholder="How did God answer this prayer?"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAnsweringPrayerId(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAnswered}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save Testimony
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* 7-Day Streak Celebration Overlay Modal */}
      <StreakCelebrationModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        streakDays={user?.streakDays || 7}
        userName={user?.name || 'Sarah'}
      />
    </div>
  );
};
