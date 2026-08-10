import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Bookmark, 
  Share2, 
  Copy, 
  Check, 
  Printer, 
  Layers, 
  Users, 
  Clock, 
  Palette, 
  GraduationCap, 
  CheckSquare, 
  Square, 
  HeartHandshake, 
  Send, 
  Lightbulb, 
  Trash2, 
  ChevronRight, 
  Flame, 
  Plus, 
  HelpCircle, 
  MessageCircle,
  FileText,
  Smile,
  ShieldAlert,
  Download
} from 'lucide-react';
import { SundaySchoolLesson, AgeGroup } from '../types';
import { generateSundaySchoolLesson } from '../services/apiService';

const SAMPLE_LESSONS: SundaySchoolLesson[] = [
  {
    id: 'sample-1',
    title: 'Giant Faith: David & Goliath',
    passage: '1 Samuel 17:32-50',
    ageGroup: 'Early Elementary (6-8)',
    durationMinutes: 30,
    bigIdea: 'God is bigger than any giant problem or fear we ever face!',
    memoryVerse: {
      reference: '1 Samuel 17:47',
      text: "The battle is the LORD's.",
      gestureOrTip: "Clap hands twice on 'battle' and point up to heaven on 'LORD's'!"
    },
    materialsNeeded: [
      '5 smooth river stones or paper stone cutouts',
      'Crayons or markers',
      'Construction paper shields',
      'Glue sticks',
      'Bibles'
    ],
    icebreaker: {
      title: 'Giant Steps Game',
      instructions: "Line children against the back wall. Ask simple Bible questions. When answered correctly, children take 1 'Giant Step' forward. First to reach the teacher wins!",
      duration: '5 mins'
    },
    storyScript: {
      summary: "Long ago, a young shepherd boy named David visited his older brothers on a battlefield. A huge 9-foot giant named Goliath was shouting scary dares at God's army! While everyone else was terrified, David remembered how God helped him protect his sheep from lions and bears. With just a wooden sling and 5 smooth stones, David trusted God completely. God gave David victory, proving that no problem is too big for our Almighty Father.",
      keyTalkingPoints: [
        'David was small, but his trust in God was huge.',
        'Goliath tried to scare people, but God is always stronger than fear.',
        'When we face scary or hard days, we can pray and ask God for courage.'
      ]
    },
    discussionQuestions: [
      {
        question: "What are some 'giants' (fears or hard situations) that kids face today?",
        suggestedAnswer: "Starting a new school, dark rooms, taking hard tests, or feeling left out."
      },
      {
        question: "How did David know God would help him fight Goliath?",
        suggestedAnswer: "Because God was faithful to David when he saved his sheep from wild animals!"
      },
      {
        question: "What is one promise of God you can remember when you feel afraid?",
        suggestedAnswer: "Deuteronomy 31:6 — 'The LORD your God goes with you; he will never leave you.'"
      }
    ],
    activityOrCraft: {
      title: '5 Smooth Stones Courage Shield Craft',
      description: "Give each child 5 paper stone cutouts. On each stone, write or draw 1 thing God gives us courage for (Family, Friends, School, Faith, Peace). Glue them onto a paper shield.",
      materials: ['Paper stone cutouts', 'Paper shields', 'Glue sticks', 'Markers']
    },
    closingPrayer: "Dear Lord Jesus, thank You that You are bigger and stronger than any giant fear in my life. Help me to trust You every day and step out in faith. Amen!",
    parentNote: "Today in Sunday School, your child learned about David & Goliath (1 Samuel 17) and how God gives us courage. Ask your child to show you their 5 Smooth Stones craft!"
  },
  {
    id: 'sample-2',
    title: 'The Fruit of the Spirit: Love & Kindness',
    passage: 'Galatians 5:22-23 & Luke 10:25-37',
    ageGroup: 'Preschool (3-5)',
    durationMinutes: 20,
    bigIdea: 'When we follow Jesus, His Holy Spirit grows love in our hearts like sweet fruit!',
    memoryVerse: {
      reference: 'Galatians 5:22',
      text: "The fruit of the Spirit is love, joy, peace...",
      gestureOrTip: "Make a heart shape with fingers on 'love', jump up on 'joy', and hug shoulders on 'peace'!"
    },
    materialsNeeded: [
      'Paper fruit cutouts (apples, grapes, bananas)',
      'Fruit scented stickers',
      'Crayons',
      'Real apples or fruit snack treat'
    ],
    icebreaker: {
      title: 'Pass the Fruit Basket',
      instructions: "Sit children in a circle. Pass a toy fruit while singing 'God is so good'. When music stops, child holding the fruit names 1 person they love!",
      duration: '5 mins'
    },
    storyScript: {
      summary: "Just like an apple tree grows tasty apples when it gets sunshine and water, when we love Jesus, His Holy Spirit grows wonderful fruits in our hearts! The very first fruit is LOVE. Jesus showed us love by helping others, listening warmly, and forgiving. When we share our toys, give big hugs, and help a friend, we are showing the Fruit of the Spirit!",
      keyTalkingPoints: [
        'God loves us so much and wants us to share His love.',
        'Kind words and gentle hands show Jesus to our friends.',
        'We can ask the Holy Spirit every day to help us be loving!'
      ]
    },
    discussionQuestions: [
      {
        question: "How can you show love to a classmate who is feeling sad?",
        suggestedAnswer: "Give them a smile, share a toy, or invite them to play together."
      },
      {
        question: "What is your favorite way someone showed kindness to you?",
        suggestedAnswer: "Giving a warm hug, saying thank you, or helping pick up dropped items."
      }
    ],
    activityOrCraft: {
      title: 'Fruit Basket Love Wreath',
      description: "Children glue paper fruits onto a paper plate ring. Color each fruit and place a scented fruit sticker in the center to smell sweetness!",
      materials: ['Paper plate rings', 'Paper fruits', 'Glue sticks', 'Scented stickers']
    },
    closingPrayer: "Dear Jesus, thank You for loving me so much. Please grow love, joy, and peace in my heart today. Amen!",
    parentNote: "Today in Sunday School, your preschooler learned about the Fruit of the Spirit (Galatians 5:22). Ask them to share their Fruit Basket Love craft with you!"
  },
  {
    id: 'sample-3',
    title: 'The Armor of God: Standing Strong',
    passage: 'Ephesians 6:10-18',
    ageGroup: 'Tweens (9-12)',
    durationMinutes: 45,
    bigIdea: 'God equips us with spiritual armor so we can stand firm in truth, faith, and peace!',
    memoryVerse: {
      reference: 'Ephesians 6:11',
      text: "Put on the full armor of God, so that you can take your stand against the devil's schemes.",
      gestureOrTip: "Mime putting on a helmet, chest plate, and taking up a shield!"
    },
    materialsNeeded: [
      'Tin foil or metallic tape',
      'Cardboard cutouts for Belt, Breastplate, Shield, Helmet',
      'Markers',
      'Bibles'
    ],
    icebreaker: {
      title: 'Armor Relay Race',
      instructions: "Split into 2 teams. One runner at a time puts on oversized boots, belt, and helmet, races around a cone, returns, and tags the next teammate!",
      duration: '8 mins'
    },
    storyScript: {
      summary: "In ancient times, Roman soldiers wore heavy armor to protect themselves in battle. Apostle Paul wrote from prison that Christians also need armor — not made of metal, but made of God's truth, righteousness, peace, faith, salvation, and the Word of God! When doubts, mean temptations, or anxieties attack our thoughts, God's Word acts as a sword and shield to protect our hearts.",
      keyTalkingPoints: [
        'Belt of Truth: Living honestly without lies.',
        'Shield of Faith: Extinguishing doubts with God\'s promises.',
        'Sword of the Spirit: Knowing Scripture to defeat negative thoughts.'
      ]
    },
    discussionQuestions: [
      {
        question: "Which piece of armor do you feel you need most at school or home?",
        suggestedAnswer: "Shield of Faith when facing peer pressure, or Belt of Truth when tempted to lie."
      },
      {
        question: "How is the Bible like a 'Sword' in daily life?",
        suggestedAnswer: "Reciting verses helps us push away fears, lies, and anger."
      }
    ],
    activityOrCraft: {
      title: 'Personalized Shield of Faith Design',
      description: "Tweens craft cardboard shields covered in silver foil. On the shield, write key Bible verses (e.g., Philippians 4:13) and personal goals for standing firm in faith.",
      materials: ['Cardboard shields', 'Tin foil', 'Sharpies', 'Ribbon for handle']
    },
    closingPrayer: "Heavenly Father, thank You for giving us Your truth, righteousness, and Word. Help me wear Your full armor every morning as I step into school and life. Amen!",
    parentNote: "Today in Sunday School, your tween learned about the Armor of God (Ephesians 6). Ask them to explain the Shield of Faith!"
  }
];

const QUICK_TOPICS = [
  { label: 'David & Goliath', icon: '🛡️', passage: '1 Samuel 17' },
  { label: "Noah's Ark", icon: '🌊', passage: 'Genesis 6-9' },
  { label: 'Fruit of the Spirit', icon: '🍇', passage: 'Galatians 5:22-23' },
  { label: 'The Good Samaritan', icon: '🤝', passage: 'Luke 10:25-37' },
  { label: "Daniel in Lions' Den", icon: '🦁', passage: 'Daniel 6' },
  { label: 'Jesus Feeds 5,000', icon: '🍞', passage: 'John 6:1-14' },
  { label: 'Armor of God', icon: '⚔️', passage: 'Ephesians 6:10-18' },
  { label: 'Prodigal Son', icon: '❤️', passage: 'Luke 15:11-32' },
];

export const SundaySchoolTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'library' | 'saved'>('generator');
  
  // Form State
  const [topicInput, setTopicInput] = useState<string>('');
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('Early Elementary (6-8)');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [classSize, setClassSize] = useState<string>('Medium (6-15)');
  const [includeCraft, setIncludeCraft] = useState<boolean>(true);
  const [includeObjectLesson, setIncludeObjectLesson] = useState<boolean>(true);
  
  // UI Loading / Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentLesson, setCurrentLesson] = useState<SundaySchoolLesson | null>(SAMPLE_LESSONS[0]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Checklist State for Supply Prep
  const [checkedSupplies, setCheckedSupplies] = useState<Record<string, boolean>>({});

  // Saved Lessons State
  const [savedLessons, setSavedLessons] = useState<SundaySchoolLesson[]>(() => {
    const saved = localStorage.getItem('faithpath_saved_lessons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [SAMPLE_LESSONS[0]];
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleSaveLesson = (lesson: SundaySchoolLesson) => {
    const exists = savedLessons.some(l => l.id === lesson.id || l.title === lesson.title);
    let updated: SundaySchoolLesson[];
    if (exists) {
      updated = savedLessons.filter(l => l.id !== lesson.id && l.title !== lesson.title);
      triggerToast('Removed from Saved Lessons');
    } else {
      updated = [{ ...lesson, id: `saved-${Date.now()}` }, ...savedLessons];
      triggerToast('Saved to My Lesson Plans! 💾');
    }
    setSavedLessons(updated);
    localStorage.setItem('faithpath_saved_lessons', JSON.stringify(updated));
  };

  const isCurrentSaved = useMemo(() => {
    if (!currentLesson) return false;
    return savedLessons.some(l => l.id === currentLesson.id || l.title === currentLesson.title);
  }, [currentLesson, savedLessons]);

  const handleGenerate = async (topicToUse?: string) => {
    const finalTopic = topicToUse || topicInput.trim() || 'David and Goliath (1 Samuel 17)';
    setIsGenerating(true);
    setCheckedSupplies({});

    try {
      const result = await generateSundaySchoolLesson({
        topic: finalTopic,
        ageGroup: selectedAge,
        durationMinutes: durationMinutes,
        classSize: classSize,
        specialFocus: `${includeCraft ? 'Include hands-on craft' : ''} ${includeObjectLesson ? 'Include object lesson' : ''}`
      });

      const newLesson: SundaySchoolLesson = {
        ...result,
        id: `gen-${Date.now()}`,
        createdAt: new Date().toLocaleDateString()
      };

      setCurrentLesson(newLesson);
      triggerToast('Simplified Sunday school lesson plan generated! ✨');
    } catch (err) {
      triggerToast('Error generating lesson. Displaying structured plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareLesson = async () => {
    if (!currentLesson) return;
    const shareText = ` Sunday School Lesson Plan: ${currentLesson.title}
 Passage: ${currentLesson.passage} (${currentLesson.ageGroup})
 Key Idea: "${currentLesson.bigIdea}"
 Memory Verse: ${currentLesson.memoryVerse.reference} - "${currentLesson.memoryVerse.text}"

 Generated with FaithPath AI Sunday School Teacher Hub!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentLesson.title,
          text: shareText,
          url: window.location.href
        });
        triggerToast('Lesson plan shared! 📤');
        return;
      } catch (e: any) {
        if (e.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      triggerToast('Lesson summary copied to clipboard! 📋');
    } catch {
      triggerToast('Copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSupplyCheck = (mat: string) => {
    setCheckedSupplies(prev => ({
      ...prev,
      [mat]: !prev[mat]
    }));
  };

  return (
    <div className="space-y-4 pb-24 animate-fadeIn relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Banner Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2546A5] to-[#1E3A8A] rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
          <GraduationCap className="w-48 h-48 text-amber-300" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-bold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Sunday School Teacher Hub</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Simplified Sunday School Lesson Plans
          </h1>

          <p className="text-xs text-blue-100 font-medium max-w-md leading-relaxed">
            Create age-tailored, engaging Bible lessons complete with icebreakers, simplified stories, discussion Q&As, crafts, and parent notes in seconds.
          </p>

          {/* Sub-tab Switcher */}
          <div className="pt-3 flex items-center gap-1.5">
            <button
              onClick={() => setActiveSubTab('generator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'generator'
                  ? 'bg-amber-400 text-[#1E3A8A] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Builder</span>
            </button>

            <button
              onClick={() => setActiveSubTab('library')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'library'
                  ? 'bg-amber-400 text-[#1E3A8A] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lesson Library</span>
            </button>

            <button
              onClick={() => setActiveSubTab('saved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'saved'
                  ? 'bg-amber-400 text-[#1E3A8A] shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-blue-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedLessons.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: LESSON GENERATOR FORM */}
      {activeSubTab === 'generator' && (
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Build Custom Lesson Plan
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Select your age group and topic to generate a simplified teaching guide
              </p>
            </div>
          </div>

          {/* Quick Popular Topics */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Quick Pick Bible Topics
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TOPICS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setTopicInput(`${item.label} (${item.passage})`);
                    handleGenerate(`${item.label} (${item.passage})`);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-800 hover:text-[#1E3A8A] border border-slate-200 hover:border-blue-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Or Enter Custom Topic or Bible Verse
            </label>
            <div className="relative">
              <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g., Jesus Walks on Water (Matthew 14), Kindness at School..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
              />
            </div>
          </div>

          {/* Target Age Group Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#1E3A8A]" />
              Target Age Group
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
              {[
                { label: 'Preschool (3-5)', icon: '🎨' },
                { label: 'Early Elementary (6-8)', icon: '🎒' },
                { label: 'Tweens (9-12)', icon: '🧩' },
                { label: 'Teens (13-17)', icon: '🎓' }
              ].map((age) => (
                <button
                  key={age.label}
                  type="button"
                  onClick={() => setSelectedAge(age.label as AgeGroup)}
                  className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all flex flex-col justify-between h-16 ${
                    selectedAge === age.label
                      ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-base">{age.icon}</span>
                  <span className="text-[11px] leading-tight font-extrabold">{age.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Class Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Lesson Duration
              </label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value={15}>15 Minutes (Short)</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={45}>45 Minutes (Extended)</option>
                <option value={60}>60 Minutes (Full Class)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Class Size
              </label>
              <select
                value={classSize}
                onChange={(e) => setClassSize(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="Small (1-5)">Small (1-5 kids)</option>
                <option value="Medium (6-15)">Medium (6-15 kids)</option>
                <option value="Large (16+)">Large (16+ kids)</option>
              </select>
            </div>
          </div>

          {/* Special Preferences Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCraft}
                onChange={(e) => setIncludeCraft(e.target.checked)}
                className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
              <span>Include Hands-On Craft</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeObjectLesson}
                onChange={(e) => setIncludeObjectLesson(e.target.checked)}
                className="w-4 h-4 rounded text-[#1E3A8A] focus:ring-[#1E3A8A]"
              />
              <span>Include Visual Object Lesson</span>
            </label>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => handleGenerate()}
            className="w-full py-3.5 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>Creating Simplified Lesson Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Generate Sunday School Lesson Plan</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* SUB-TAB 2: PRE-LOADED LESSON LIBRARY */}
      {activeSubTab === 'library' && (
        <div className="space-y-3">
          <div className="px-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ready-to-Teach Sunday School Lessons ({SAMPLE_LESSONS.length})
            </h3>
            <p className="text-[11px] text-slate-500">Pick a pre-designed lesson to teach immediately or print</p>
          </div>

          {SAMPLE_LESSONS.map((sample) => (
            <div
              key={sample.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-blue-300 shadow-md transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-extrabold text-[#1E3A8A] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      {sample.passage}
                    </span>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {sample.ageGroup}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sample.durationMinutes}m
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#1E3A8A]">
                    {sample.title}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    setCurrentLesson(sample);
                    setActiveSubTab('generator');
                  }}
                  className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold shrink-0 shadow-xs hover:bg-blue-900 transition-colors"
                >
                  Open Lesson
                </button>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs font-serif italic text-slate-800">
                "{sample.bigIdea}"
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                <span>Craft: {sample.activityOrCraft.title}</span>
                <button
                  onClick={() => handleToggleSaveLesson(sample)}
                  className="text-[#1E3A8A] font-bold hover:underline flex items-center gap-1"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Save Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: SAVED LESSONS */}
      {activeSubTab === 'saved' && (
        <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                Saved Sunday School Lessons ({savedLessons.length})
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Your bookmarked lesson plans ready for class preparation & printing
              </p>
            </div>
          </div>

          {savedLessons.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No saved lessons yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Generate or pick a lesson from the library and click "Save Lesson" to keep it here for future classes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedLessons.map((l) => (
                <div
                  key={l.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-extrabold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          {l.passage}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {l.ageGroup}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{l.title}</h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setCurrentLesson(l);
                          setActiveSubTab('generator');
                        }}
                        className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold"
                      >
                        View Plan
                      </button>
                      <button
                        onClick={() => handleToggleSaveLesson(l)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                        title="Remove lesson"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-serif italic text-slate-700">
                    "{l.bigIdea}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* GENERATED / ACTIVE LESSON PLAN VIEW */}
      {currentLesson && (
        <div id="printable-lesson-plan" className="bg-white rounded-[28px] sm:rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-200 space-y-6 animate-fadeIn">
          {/* Plan Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-extrabold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {currentLesson.passage}
                </span>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {currentLesson.ageGroup}
                </span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {currentLesson.durationMinutes} Minutes
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {currentLesson.title}
              </h2>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleToggleSaveLesson(currentLesson)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  isCurrentSaved
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isCurrentSaved ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>{isCurrentSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareLesson}
                className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Print Lesson Plan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Big Idea Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-2xl border border-amber-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Core Big Idea (Lesson Focus)</span>
            </div>
            <p className="text-sm font-serif font-bold text-slate-900 leading-relaxed">
              "{currentLesson.bigIdea}"
            </p>
          </div>

          {/* Memory Verse Box */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                Memory Verse: {currentLesson.memoryVerse.reference}
              </span>
            </div>
            <p className="text-sm font-serif italic font-bold text-slate-900">
              "{currentLesson.memoryVerse.text}"
            </p>
            {currentLesson.memoryVerse.gestureOrTip && (
              <p className="text-xs font-sans font-semibold text-blue-900 bg-white/80 p-2 rounded-xl border border-blue-200/50 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span><strong>Kids Motion Tip:</strong> {currentLesson.memoryVerse.gestureOrTip}</span>
              </p>
            )}
          </div>

          {/* Interactive Supply Checklist */}
          {currentLesson.materialsNeeded && currentLesson.materialsNeeded.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#1E3A8A]" />
                Teacher Supply Prep Checklist ({currentLesson.materialsNeeded.length} items)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentLesson.materialsNeeded.map((mat, idx) => {
                  const isChecked = !!checkedSupplies[mat];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleSupplyCheck(mat)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isChecked
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300 line-through opacity-80'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{mat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Icebreaker / Hook */}
          {currentLesson.icebreaker && (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                  Icebreaker & Opening Hook ({currentLesson.icebreaker.duration})
                </h3>
                <span className="text-[11px] font-bold text-slate-600">{currentLesson.icebreaker.title}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                {currentLesson.icebreaker.instructions}
              </div>
            </div>
          )}

          {/* Step 2: Simplified Bible Story Script */}
          {currentLesson.storyScript && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                  Simplified Bible Story Narrative
                </h3>
                <span className="text-[11px] font-bold text-[#1E3A8A]">Teacher Script</span>
              </div>

              <div className="p-4 bg-blue-50/30 rounded-2xl border border-blue-100/80 space-y-3">
                <p className="text-xs font-serif text-slate-900 leading-relaxed">
                  {currentLesson.storyScript.summary}
                </p>

                {currentLesson.storyScript.keyTalkingPoints && currentLesson.storyScript.keyTalkingPoints.length > 0 && (
                  <div className="pt-2 border-t border-blue-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider">Key Teaching Points:</span>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-slate-800 font-medium">
                      {currentLesson.storyScript.keyTalkingPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Discussion Questions & Answers */}
          {currentLesson.discussionQuestions && currentLesson.discussionQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="bg-slate-100 p-2.5 rounded-xl">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                  Guided Class Discussion Q&A
                </h3>
              </div>

              <div className="space-y-2">
                {currentLesson.discussionQuestions.map((dq, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                    <p className="text-xs font-extrabold text-slate-900 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0 mt-0.5" />
                      <span>Q{idx + 1}: {dq.question}</span>
                    </p>
                    {dq.suggestedAnswer && (
                      <p className="text-[11px] font-medium text-slate-600 bg-white p-2 rounded-xl border border-slate-100 italic">
                        <strong>Suggested Answer:</strong> {dq.suggestedAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Hands-On Craft / Activity */}
          {currentLesson.activityOrCraft && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded-xl">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white text-[11px] font-bold flex items-center justify-center">4</span>
                  Hands-On Craft & Activity
                </h3>
                <span className="text-[11px] font-bold text-amber-900">{currentLesson.activityOrCraft.title}</span>
              </div>

              <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/70 space-y-2">
                <p className="text-xs font-medium text-slate-900 leading-relaxed">
                  {currentLesson.activityOrCraft.description}
                </p>

                {currentLesson.activityOrCraft.materials && currentLesson.activityOrCraft.materials.length > 0 && (
                  <div className="pt-2 border-t border-amber-200/50 text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <span>Craft Supplies:</span>
                    <span className="font-normal text-slate-700">{currentLesson.activityOrCraft.materials.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Closing Prayer */}
          {currentLesson.closingPrayer && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1.5">
              <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-700" />
                Closing Prayer (Repeat Line-by-Line)
              </h3>
              <p className="text-xs font-serif font-bold italic text-slate-900 leading-relaxed">
                "{currentLesson.closingPrayer}"
              </p>
            </div>
          )}

          {/* Step 6: Parent Note */}
          {currentLesson.parentNote && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  Parent Takeaway Handout Note
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentLesson.parentNote);
                    triggerToast('Parent note copied!');
                  }}
                  className="text-[10px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-0.5"
                >
                  <Copy className="w-3 h-3" />
                  Copy Note
                </button>
              </div>
              <p className="text-xs font-sans text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 italic">
                "{currentLesson.parentNote}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
