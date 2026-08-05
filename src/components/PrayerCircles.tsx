import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  Lock, 
  MessageSquare, 
  HeartHandshake, 
  Sparkles, 
  ArrowLeft, 
  UserPlus, 
  Shield, 
  Clock, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Trash2, 
  Globe,
  Key,
  ChevronRight,
  Smile,
  X
} from 'lucide-react';
import { 
  PrayerCircle, 
  PrayerCircleRequest, 
  PrayerCircleMember, 
  PrayerCircleComment, 
  UserProfile 
} from '../types';

interface PrayerCirclesProps {
  user: UserProfile;
}

const DEFAULT_CIRCLES: PrayerCircle[] = [
  {
    id: 'circle-1',
    name: 'Johnson Family Grace Circle',
    description: 'Private family prayer altar for sharing petitions, health updates, and praising God for His goodness.',
    inviteCode: 'FAMILY-7729',
    category: 'Family',
    coverGradient: 'from-blue-700 via-indigo-800 to-slate-900',
    createdAt: '2026-01-15T08:00:00.000Z',
    isPrivate: true,
    members: [
      { id: 'm1', name: 'You (Owner)', role: 'owner', joinedAt: '2026-01-15', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { id: 'm2', name: 'Eleanor Johnson (Mom)', role: 'member', joinedAt: '2026-01-16', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
      { id: 'm3', name: 'Robert Johnson (Dad)', role: 'member', joinedAt: '2026-01-16', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { id: 'm4', name: 'Mark (Brother)', role: 'member', joinedAt: '2026-01-18', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
    ],
    requests: [
      {
        id: 'p-req-1',
        circleId: 'circle-1',
        authorName: 'Eleanor Johnson (Mom)',
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        title: 'Upcoming Knee Surgery & Speedy Recovery',
        content: 'Please pray for wisdom for surgeon Dr. Miller this Thursday morning, and that peace guards my heart before surgery.',
        category: 'Healing',
        isUrgent: true,
        isAnswered: false,
        createdAt: '2026-07-26T14:30:00.000Z',
        prayedUserIds: ['m1', 'm3', 'm4'],
        comments: [
          {
            id: 'c1',
            authorName: 'You',
            content: 'Praying Philippians 4:6-7 over you today, Mom! We love you so much.',
            createdAt: '2026-07-26T15:10:00.000Z'
          },
          {
            id: 'c2',
            authorName: 'Robert Johnson',
            content: 'Standing in faith with you my sweet wife!',
            createdAt: '2026-07-26T16:00:00.000Z'
          }
        ]
      },
      {
        id: 'p-req-2',
        circleId: 'circle-1',
        authorName: 'Mark (Brother)',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        title: 'Guidance on New Career Step',
        content: 'Final interview round for the Senior Project Lead position on Friday. Praying for clarity and favor.',
        category: 'Guidance',
        isUrgent: false,
        isAnswered: false,
        createdAt: '2026-07-25T10:00:00.000Z',
        prayedUserIds: ['m1', 'm2'],
        comments: [
          {
            id: 'c3',
            authorName: 'Eleanor Johnson',
            content: 'God has prepared your path, son! Trust Him completely.',
            createdAt: '2026-07-25T11:20:00.000Z'
          }
        ]
      },
      {
        id: 'p-req-3',
        circleId: 'circle-1',
        authorName: 'You',
        title: 'Dad’s Health Checkup Results',
        content: 'Please join me in praying for clear test results from Dad’s routine screening last week.',
        category: 'Healing',
        isUrgent: false,
        isAnswered: true,
        testimony: 'Praise God! The doctor called back today and all blood tests and scans came back 100% clean and clear!',
        createdAt: '2026-07-20T09:15:00.000Z',
        prayedUserIds: ['m2', 'm3', 'm4'],
        comments: [
          {
            id: 'c4',
            authorName: 'Robert Johnson',
            content: 'God is so faithful! Thank you family for holding my arms up in prayer!',
            createdAt: '2026-07-22T12:00:00.000Z'
          }
        ]
      }
    ]
  },
  {
    id: 'circle-2',
    name: 'Thursday Fellowship Group',
    description: 'Weekly small group prayer circle focusing on spiritual growth, life challenges, and community outreach.',
    inviteCode: 'GRACE-2026',
    category: 'Small Group',
    coverGradient: 'from-amber-600 via-orange-700 to-stone-900',
    createdAt: '2026-02-01T10:00:00.000Z',
    isPrivate: true,
    members: [
      { id: 'm1', name: 'You', role: 'member', joinedAt: '2026-02-01' },
      { id: 'm5', name: 'Pastor James', role: 'owner', joinedAt: '2026-02-01', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
      { id: 'm6', name: 'Rebecca L.', role: 'member', joinedAt: '2026-02-03', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
      { id: 'm7', name: 'David K.', role: 'member', joinedAt: '2026-02-05', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' }
    ],
    requests: [
      {
        id: 'p-req-4',
        circleId: 'circle-2',
        authorName: 'Rebecca L.',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        title: 'Peace & Rest during busy work season',
        content: 'Feeling overwhelmed with deadline pressures this month. Asking for God’s supernatural peace and energy.',
        category: 'Peace',
        isUrgent: false,
        isAnswered: false,
        createdAt: '2026-07-27T08:00:00.000Z',
        prayedUserIds: ['m1', 'm5', 'm7'],
        comments: [
          {
            id: 'c5',
            authorName: 'Pastor James',
            content: 'Remember Jesus’ promise in Matthew 11:28: Come to Me, all who are weary, and I will give you rest.',
            createdAt: '2026-07-27T09:30:00.000Z'
          }
        ]
      }
    ]
  }
];

export const PrayerCircles: React.FC<PrayerCirclesProps> = ({ user }) => {
  const [circles, setCircles] = useState<PrayerCircle[]>(() => {
    try {
      const stored = localStorage.getItem('faithpath_prayer_circles');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse prayer circles from localStorage', e);
    }
    return DEFAULT_CIRCLES;
  });

  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showPostRequestModal, setShowPostRequestModal] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<PrayerCircle['category']>('Family');
  const [newCircleTheme, setNewCircleTheme] = useState('from-blue-700 via-indigo-800 to-slate-900');

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const [reqTitle, setReqTitle] = useState('');
  const [reqContent, setReqContent] = useState('');
  const [reqCategory, setReqCategory] = useState<PrayerCircleRequest['category']>('General');
  const [reqIsUrgent, setReqIsUrgent] = useState(false);
  const [reqIsAnonymous, setReqIsAnonymous] = useState(false);

  // Filter inside circle view
  const [circleFilter, setCircleFilter] = useState<'All' | 'Active' | 'Answered' | 'Urgent'>('All');

  // Comment input per request
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Answered Modal state
  const [answeringReqId, setAnsweringReqId] = useState<string | null>(null);
  const [testimonyInput, setTestimonyInput] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('faithpath_prayer_circles', JSON.stringify(circles));
    } catch (e) {
      console.error('Failed to save prayer circles to localStorage', e);
    }
  }, [circles]);

  const activeCircle = circles.find(c => c.id === selectedCircleId);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Create new circle handler
  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const codePrefix = newCircleName.trim().slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'HOPE');
    const inviteCode = `${codePrefix}-${randomSuffix}`;

    const newCircle: PrayerCircle = {
      id: `circle-${Date.now()}`,
      name: newCircleName.trim(),
      description: newCircleDesc.trim() || 'Invite-only prayer circle.',
      inviteCode,
      category: newCircleCategory,
      coverGradient: newCircleTheme,
      createdAt: new Date().toISOString(),
      isPrivate: true,
      members: [
        {
          id: 'user-self',
          name: `${user.name} (Owner)`,
          role: 'owner',
          joinedAt: new Date().toISOString().split('T')[0],
          avatarUrl: user.photoUrl
        }
      ],
      requests: []
    };

    setCircles(prev => [newCircle, ...prev]);
    setSelectedCircleId(newCircle.id);
    setNewCircleName('');
    setNewCircleDesc('');
    setShowCreateModal(false);
  };

  // Join circle handler
  const handleJoinCircle = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const cleanCode = joinCodeInput.trim().toUpperCase();

    if (!cleanCode) {
      setJoinError('Please enter a valid invite code.');
      return;
    }

    const target = circles.find(c => c.inviteCode.toUpperCase() === cleanCode);

    if (!target) {
      setJoinError(`Circle with code "${cleanCode}" was not found. Please check with your group member.`);
      return;
    }

    // Check if already a member
    const alreadyMember = target.members.some(m => m.id === 'user-self' || m.name.includes(user.name));
    if (alreadyMember) {
      setSelectedCircleId(target.id);
      setShowJoinModal(false);
      setJoinCodeInput('');
      return;
    }

    // Add user as member
    const updatedCircles = circles.map(c => {
      if (c.id === target.id) {
        return {
          ...c,
          members: [
            ...c.members,
            {
              id: 'user-self',
              name: user.name,
              role: 'member' as const,
              joinedAt: new Date().toISOString().split('T')[0],
              avatarUrl: user.photoUrl
            }
          ]
        };
      }
      return c;
    });

    setCircles(updatedCircles);
    setSelectedCircleId(target.id);
    setShowJoinModal(false);
    setJoinCodeInput('');
  };

  // Add Request to Circle
  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircleId || (!reqTitle.trim() && !reqContent.trim())) return;

    const newReq: PrayerCircleRequest = {
      id: `p-req-${Date.now()}`,
      circleId: selectedCircleId,
      authorName: reqIsAnonymous ? 'Anonymous Circle Member' : user.name,
      authorAvatar: reqIsAnonymous ? undefined : user.photoUrl,
      title: reqTitle.trim() || 'Prayer Request',
      content: reqContent.trim(),
      category: reqCategory,
      isUrgent: reqIsUrgent,
      isAnswered: false,
      createdAt: new Date().toISOString(),
      prayedUserIds: ['user-self'], // Auto-prayed by creator
      comments: [],
      isAnonymous: reqIsAnonymous
    };

    setCircles(prev => prev.map(c => {
      if (c.id === selectedCircleId) {
        return {
          ...c,
          requests: [newReq, ...c.requests]
        };
      }
      return c;
    }));

    setReqTitle('');
    setReqContent('');
    setReqCategory('General');
    setReqIsUrgent(false);
    setReqIsAnonymous(false);
    setShowPostRequestModal(false);
  };

  // Toggle "I Prayed For This"
  const handleTogglePrayed = (circleId: string, reqId: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return {
          ...c,
          requests: c.requests.map(r => {
            if (r.id === reqId) {
              const hasPrayed = r.prayedUserIds.includes('user-self');
              const newPrayedUserIds = hasPrayed
                ? r.prayedUserIds.filter(id => id !== 'user-self')
                : [...r.prayedUserIds, 'user-self'];
              return { ...r, prayedUserIds: newPrayedUserIds };
            }
            return r;
          })
        };
      }
      return c;
    }));
  };

  // Add comment to request
  const handleAddComment = (circleId: string, reqId: string) => {
    const text = commentInputs[reqId]?.trim();
    if (!text) return;

    const newComment: PrayerCircleComment = {
      id: `comm-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.photoUrl,
      content: text,
      createdAt: new Date().toISOString()
    };

    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return {
          ...c,
          requests: c.requests.map(r => {
            if (r.id === reqId) {
              return {
                ...r,
                comments: [...r.comments, newComment]
              };
            }
            return r;
          })
        };
      }
      return c;
    }));

    setCommentInputs(prev => ({ ...prev, [reqId]: '' }));
  };

  // Submit Testimony (Mark Answered)
  const handleMarkAnswered = (circleId: string, reqId: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return {
          ...c,
          requests: c.requests.map(r => {
            if (r.id === reqId) {
              return {
                ...r,
                isAnswered: true,
                testimony: testimonyInput.trim() || 'God answered this prayer request!'
              };
            }
            return r;
          })
        };
      }
      return c;
    }));

    setAnsweringReqId(null);
    setTestimonyInput('');
  };

  // Delete Request
  const handleDeleteRequest = (circleId: string, reqId: string) => {
    setCircles(prev => prev.map(c => {
      if (c.id === circleId) {
        return {
          ...c,
          requests: c.requests.filter(r => r.id !== reqId)
        };
      }
      return c;
    }));
  };

  // Filter requests inside selected circle
  const filteredRequests = activeCircle ? activeCircle.requests.filter(r => {
    if (circleFilter === 'Active' && r.isAnswered) return false;
    if (circleFilter === 'Answered' && !r.isAnswered) return false;
    if (circleFilter === 'Urgent' && !r.isUrgent) return false;
    return true;
  }) : [];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* SECTION HEADER & QUICK ACTIONS */}
      {!selectedCircleId ? (
        <>
          <div className="bg-gradient-to-br from-[#1E3A8A] via-[#2A4AA5] to-[#122452] text-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-xl border border-blue-700/60 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#D4AF37] text-[#1E3A8A] px-3 py-1 rounded-full shadow-xs">
                  <Lock className="w-3 h-3" /> Invite-Only Groups
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#D4AF37]" />
                  Prayer Circles
                </h2>
                <p className="text-xs text-blue-100 max-w-md mt-1">
                  Share prayer requests safely with specific family members, close friends, or small groups. Track answers and encourage one another.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Key className="w-3.5 h-3.5 text-amber-300" />
                  Join Circle
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="py-2.5 px-4 bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1E3A8A] font-black text-xs rounded-2xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Circle
                </button>
              </div>
            </div>
          </div>

          {/* CIRCLES GRID OVERVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                Your Active Prayer Circles
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {circles.length}
                </span>
              </h3>
            </div>

            {circles.length === 0 ? (
              <div className="bg-white rounded-[28px] p-8 text-center border border-slate-100 shadow-md space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-sm">No Prayer Circles Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Create your first family or small group prayer circle to share private requests with loved ones.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="py-2 px-4 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Create Circle
                  </button>
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="py-2 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200"
                  >
                    Enter Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {circles.map(circle => {
                  const activeCount = circle.requests.filter(r => !r.isAnswered).length;
                  const answeredCount = circle.requests.filter(r => r.isAnswered).length;

                  return (
                    <div
                      key={circle.id}
                      className="bg-white rounded-[28px] border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-xl transition-all group flex flex-col justify-between"
                    >
                      {/* Gradient Header */}
                      <div className={`bg-gradient-to-r ${circle.coverGradient || 'from-blue-700 to-indigo-900'} p-4 text-white relative`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/20">
                            {circle.category}
                          </span>
                          <span className="text-[11px] text-blue-100 flex items-center gap-1 font-mono bg-black/20 px-2 py-0.5 rounded-lg border border-white/10">
                            <Lock className="w-2.5 h-2.5" />
                            {circle.inviteCode}
                          </span>
                        </div>

                        <h4 className="font-black text-base text-white group-hover:text-amber-200 transition-colors">
                          {circle.name}
                        </h4>
                        <p className="text-xs text-blue-100 line-clamp-2 mt-1">
                          {circle.description}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3.5 bg-white">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          {/* Member Avatars Stack */}
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 overflow-hidden">
                              {circle.members.slice(0, 4).map((m, idx) => (
                                <div
                                  key={m.id || idx}
                                  className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center font-bold text-[10px] text-blue-800 overflow-hidden shrink-0 shadow-xs"
                                  title={m.name}
                                >
                                  {m.avatarUrl ? (
                                    <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                                  ) : (
                                    m.name.charAt(0)
                                  )}
                                </div>
                              ))}
                            </div>
                            <span className="text-slate-500 font-bold text-[11px]">
                              {circle.members.length} {circle.members.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>

                          {/* Request counts */}
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200/60">
                              {activeCount} Active
                            </span>
                            {answeredCount > 0 && (
                              <span className="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200/60">
                                {answeredCount} Answered
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Bottom Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleCopyCode(circle.inviteCode)}
                            className="text-[11px] font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                          >
                            {copiedCode === circle.inviteCode ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Code Copied!
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                Copy Code: <span className="font-mono text-slate-700">{circle.inviteCode}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedCircleId(circle.id)}
                            className="py-1.5 px-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                          >
                            Enter Circle
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* INSIDE SELECTED CIRCLE VIEW */
        <div className="space-y-4 animate-fadeIn">
          {/* Top Navigation Back Bar */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedCircleId(null)}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200 shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#1E3A8A]" />
              All Prayer Circles
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMembersModal(true)}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 shadow-xs inline-flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-700" />
                Members ({activeCircle?.members.length})
              </button>

              <button
                onClick={() => handleCopyCode(activeCircle?.inviteCode || '')}
                className="py-2 px-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#1E3A8A] font-bold text-xs rounded-2xl border border-[#D4AF37]/40 inline-flex items-center gap-1.5"
              >
                {copiedCode === activeCircle?.inviteCode ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
                    <Check className="w-3.5 h-3.5" /> Copied Code!
                  </span>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#1E3A8A]" />
                    Invite Code: <span className="font-mono">{activeCircle?.inviteCode}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CIRCLE HERO HEADER CARD */}
          {activeCircle && (
            <div className={`bg-gradient-to-br ${activeCircle.coverGradient || 'from-blue-800 to-indigo-950'} text-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-xl border border-blue-700/60 relative overflow-hidden`}>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-0.5 rounded-full border border-white/20">
                    {activeCircle.category} Circle
                  </span>
                  <span className="text-xs text-blue-200 flex items-center gap-1 font-mono bg-black/20 px-2.5 py-0.5 rounded-lg border border-white/10">
                    <Lock className="w-3 h-3 text-amber-300" />
                    Private Invite-Only
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">{activeCircle.name}</h2>
                  <p className="text-xs text-blue-100 max-w-xl mt-1 leading-relaxed">
                    {activeCircle.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {activeCircle.members.slice(0, 5).map(m => (
                        <div key={m.id} className="w-7 h-7 rounded-full bg-blue-200 border-2 border-blue-900 flex items-center justify-center font-extrabold text-[10px] text-blue-900 overflow-hidden shadow-xs" title={m.name}>
                          {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-blue-100 font-semibold">
                      {activeCircle.members.length} members sharing prayers
                    </span>
                  </div>

                  <button
                    onClick={() => setShowPostRequestModal(true)}
                    className="py-2.5 px-4 bg-[#D4AF37] hover:bg-[#C29F2F] text-[#1E3A8A] font-black text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Post Prayer Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FEED FILTER TABS */}
          <div className="bg-white p-2.5 rounded-[24px] shadow-md border border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              {(['All', 'Active', 'Answered', 'Urgent'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCircleFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    circleFilter === tab
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-500 pr-2">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>

          {/* REQUESTS FEED IN CIRCLE */}
          <div className="space-y-3.5">
            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-[28px] p-8 text-center border border-slate-100 shadow-md space-y-3">
                <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-slate-800 text-sm">No Prayer Requests Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Be the first to share a prayer request or praise report with your circle members!
                </p>
                <button
                  onClick={() => setShowPostRequestModal(true)}
                  className="py-2.5 px-4 bg-[#1E3A8A] text-white font-bold text-xs rounded-2xl shadow-md"
                >
                  Post Request Now
                </button>
              </div>
            ) : (
              filteredRequests.map(req => {
                const hasUserPrayed = req.prayedUserIds.includes('user-self');
                const isAuthor = req.authorName.includes(user.name) || req.authorName === 'You';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-[28px] p-5 shadow-lg shadow-slate-200/40 border transition-all ${
                      req.isAnswered
                        ? 'border-emerald-300 bg-emerald-50/10'
                        : req.isUrgent
                        ? 'border-rose-200 bg-rose-50/10'
                        : 'border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-900 overflow-hidden shrink-0">
                          {req.authorAvatar ? (
                            <img src={req.authorAvatar} alt={req.authorName} className="w-full h-full object-cover" />
                          ) : (
                            req.authorName.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900">{req.authorName}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              {req.category}
                            </span>
                            {req.isUrgent && (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Answered / Delete Buttons */}
                      <div className="flex items-center gap-1">
                        {!req.isAnswered && isAuthor && (
                          <button
                            onClick={() => {
                              setAnsweringReqId(req.id);
                              setTestimonyInput('');
                            }}
                            className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Mark Answered
                          </button>
                        )}
                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteRequest(activeCircle.id, req.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Answered Testimony Banner */}
                    {req.isAnswered && (
                      <div className="mb-3 p-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-sm border border-emerald-400">
                        <div className="flex items-center gap-1.5 mb-1 text-xs font-black uppercase tracking-wider text-amber-200">
                          <Sparkles className="w-4 h-4" />
                          Praise Report & Answered Prayer!
                        </div>
                        <p className="text-xs text-emerald-50 font-medium leading-relaxed italic">
                          "{req.testimony || 'God answered our collective prayers!'}"
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    <h4 className="font-extrabold text-sm text-slate-900 mb-1">{req.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed mb-3.5">{req.content}</p>

                    {/* Interactive Prayed Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleTogglePrayed(activeCircle.id, req.id)}
                        className={`py-2 px-3.5 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 shadow-xs ${
                          hasUserPrayed
                            ? 'bg-[#1E3A8A] text-white ring-2 ring-blue-300'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200'
                        }`}
                      >
                        <HeartHandshake className={`w-4 h-4 ${hasUserPrayed ? 'text-amber-300' : 'text-slate-500'}`} />
                        {hasUserPrayed ? '✓ You Prayed' : 'I Prayed For This'}
                        <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${hasUserPrayed ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'}`}>
                          {req.prayedUserIds.length}
                        </span>
                      </button>

                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        {req.comments.length} {req.comments.length === 1 ? 'Message' : 'Messages'}
                      </span>
                    </div>

                    {/* Comments / Encouragement List */}
                    <div className="mt-3 pt-3 bg-slate-50/70 p-3 rounded-2xl space-y-2 border border-slate-100">
                      {req.comments.map(c => (
                        <div key={c.id} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-extrabold text-[#1E3A8A] text-[11px]">{c.authorName}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">{c.content}</p>
                        </div>
                      ))}

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          placeholder="Send an encouraging note or scripture..."
                          value={commentInputs[req.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [req.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(activeCircle.id, req.id);
                          }}
                          className="flex-1 py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(activeCircle.id, req.id)}
                          className="py-1.5 px-3 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl hover:bg-blue-900 transition-colors shrink-0 flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE CIRCLE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="font-black text-lg text-slate-900">Create Prayer Circle</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Circle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Smith Family Prayer Altar"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Category</label>
                <select
                  value={newCircleCategory}
                  onChange={(e) => setNewCircleCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Small Group">Small Group</option>
                  <option value="Church">Church</option>
                  <option value="Ministry">Ministry</option>
                  <option value="Work">Work</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Circle Description</label>
                <textarea
                  rows={2}
                  placeholder="What is the purpose of this group?"
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">Color Banner Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Royal Blue', gradient: 'from-blue-700 via-indigo-800 to-slate-900' },
                    { label: 'Grace Gold', gradient: 'from-amber-600 via-orange-700 to-stone-900' },
                    { label: 'Peace Emerald', gradient: 'from-emerald-700 via-teal-800 to-slate-900' },
                    { label: 'Deep Purple', gradient: 'from-purple-800 via-indigo-900 to-slate-950' }
                  ].map((theme) => (
                    <button
                      key={theme.label}
                      type="button"
                      onClick={() => setNewCircleTheme(theme.gradient)}
                      className={`h-10 rounded-2xl bg-gradient-to-r ${theme.gradient} border-2 transition-all ${
                        newCircleTheme === theme.gradient ? 'border-amber-400 scale-105 shadow-md' : 'border-transparent'
                      }`}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1 text-[#1E3A8A]">
                  <Shield className="w-3.5 h-3.5" /> Invite-Only & Secure
                </span>
                <p className="text-[11px] text-blue-800">
                  A unique invite code will be generated automatically. Only members with the code can view or post requests.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-black text-xs rounded-2xl shadow-md"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN CIRCLE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-black text-lg text-slate-900">Join a Prayer Circle</h3>
              </div>
              <button onClick={() => setShowJoinModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinCircle} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Enter Invite Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., FAMILY-7729 or GRACE-2026"
                  value={joinCodeInput}
                  onChange={(e) => {
                    setJoinCodeInput(e.target.value);
                    setJoinError(null);
                  }}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm uppercase tracking-wider font-extrabold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {joinError && (
                <p className="text-xs font-extrabold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {joinError}
                </p>
              )}

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-extrabold flex items-center gap-1 text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Demo Sample Codes:
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setJoinCodeInput('FAMILY-7729')}
                    className="py-1 px-2 bg-white text-slate-800 font-mono text-[11px] font-extrabold rounded-lg border border-amber-300 hover:bg-amber-100"
                  >
                    FAMILY-7729
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinCodeInput('GRACE-2026')}
                    className="py-1 px-2 bg-white text-slate-800 font-mono text-[11px] font-extrabold rounded-lg border border-amber-300 hover:bg-amber-100"
                  >
                    GRACE-2026
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#1E3A8A] text-white font-black text-xs rounded-2xl shadow-md"
                >
                  Join Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST REQUEST MODAL */}
      {showPostRequestModal && activeCircle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-lg text-slate-900">Post Request to {activeCircle.name}</h3>
                <p className="text-xs text-slate-500">Only members of this circle can see this prayer petition.</p>
              </div>
              <button onClick={() => setShowPostRequestModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Peace & Clarity for Job Interview"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Category</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Healing">Healing</option>
                  <option value="Family">Family</option>
                  <option value="Peace">Peace</option>
                  <option value="Guidance">Guidance</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Praise">Praise</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Prayer Request Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details so circle members know how to specifically pray for you..."
                  value={reqContent}
                  onChange={(e) => setReqContent(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqIsUrgent}
                    onChange={(e) => setReqIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Mark as Urgent Request
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqIsAnonymous}
                    onChange={(e) => setReqIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Post Anonymously within Circle
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostRequestModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-[#1E3A8A] text-white font-black text-xs rounded-2xl shadow-md"
                >
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANSWERED / TESTIMONY MODAL */}
      {answeringReqId && activeCircle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-lg text-slate-900">Mark Prayer as Answered</h3>
              </div>
              <button onClick={() => setAnsweringReqId(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Praise God! Share a short praise report or testimony so circle members can celebrate with you.
              </p>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">Testimony / Praise Update</label>
                <textarea
                  rows={3}
                  placeholder="e.g., God answered our prayer! The doctor gave us clear results today!"
                  value={testimonyInput}
                  onChange={(e) => setTestimonyInput(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnsweringReqId(null)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkAnswered(activeCircle.id, answeringReqId)}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md"
                >
                  Publish Praise Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS MODAL */}
      {showMembersModal && activeCircle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="font-black text-lg text-slate-900">Circle Members</h3>
              </div>
              <button onClick={() => setShowMembersModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-800">Circle Invite Code</span>
                  <p className="font-mono font-black text-sm text-[#1E3A8A]">{activeCircle.inviteCode}</p>
                </div>
                <button
                  onClick={() => handleCopyCode(activeCircle.inviteCode)}
                  className="py-1.5 px-3 bg-[#1E3A8A] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {copiedCode === activeCircle.inviteCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {activeCircle.members.map(m => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-900 overflow-hidden">
                        {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-slate-900">{m.name}</p>
                        <span className="text-[10px] text-slate-400">Joined {m.joinedAt}</span>
                      </div>
                    </div>
                    {m.role === 'owner' && (
                      <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                        Owner
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-2xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
