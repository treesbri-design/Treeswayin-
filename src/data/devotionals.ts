import { DailyDevotional, ReadingPlan, BibleTranslation } from '../types';

export const DAILY_AFFIRMATIONS = [
  {
    quote: "I am fearfully and wonderfully made, created with divine purpose and unconditional love.",
    scripture: "Psalm 139:14",
    theme: "Identity & Value"
  },
  {
    quote: "I walk in confidence, knowing Christ gives me strength to overcome every challenge today.",
    scripture: "Philippians 4:13",
    theme: "Strength & Faith"
  },
  {
    quote: "God has given me a spirit of power, love, and a sound mind—fear has no power over me.",
    scripture: "2 Timothy 1:7",
    theme: "Peace & Power"
  },
  {
    quote: "The Lord goes before me and stands beside me; I will not be shaken or discouraged.",
    scripture: "Deuteronomy 31:8",
    theme: "Courage"
  },
  {
    quote: "I surrender my anxiety to God, receiving His transcendent peace that guards my heart.",
    scripture: "Philippians 4:6-7",
    theme: "Peace"
  },
  {
    quote: "My steps are ordered by the Lord, and His grace is sufficient for everything I face today.",
    scripture: "2 Corinthians 12:9",
    theme: "Grace & Guidance"
  },
  {
    quote: "I am forgiven, redeemed, and filled with the joy of the Lord which is my constant strength.",
    scripture: "Nehemiah 8:10",
    theme: "Joy & Hope"
  }
];

export function getTodayAffirmation() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length];
}

export const RANDOM_SCRIPTURES = [
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you,\" declares the LORD, \"plans to prosper you and not to harm you, plans to give you hope and a future.",
    translation: "NIV",
    theme: "Hope & Future",
    bookName: "Jeremiah",
    chapter: 29,
    verse: 11
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all this through him who gives me strength.",
    translation: "NIV",
    theme: "Strength",
    bookName: "Philippians",
    chapter: 4,
    verse: 13
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    translation: "NIV",
    theme: "Trust & Guidance",
    bookName: "Proverbs",
    chapter: 3,
    verse: 5
  },
  {
    reference: "Psalm 27:1",
    text: "The LORD is my light and my salvation—whom shall I fear? The LORD is the stronghold of my life—of whom shall I be afraid?",
    translation: "NIV",
    theme: "Courage & Protection",
    bookName: "Psalms",
    chapter: 27,
    verse: 1
  },
  {
    reference: "1 Peter 5:7",
    text: "Cast all your anxiety on him because he cares for you.",
    translation: "NIV",
    theme: "Peace & Rest",
    bookName: "1 Peter",
    chapter: 5,
    verse: 7
  },
  {
    reference: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.",
    translation: "NIV",
    theme: "Courage",
    bookName: "Joshua",
    chapter: 1,
    verse: 9
  },
  {
    reference: "John 14:27",
    text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
    translation: "NIV",
    theme: "Peace",
    bookName: "John",
    chapter: 14,
    verse: 27
  },
  {
    reference: "Psalm 23:1-2",
    text: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.",
    translation: "NIV",
    theme: "Comfort",
    bookName: "Psalms",
    chapter: 23,
    verse: 1
  },
  {
    reference: "Matthew 11:28",
    text: "Come to me, all you who are weary and burdened, and I will give you rest.",
    translation: "NIV",
    theme: "Rest & Grace",
    bookName: "Matthew",
    chapter: 11,
    verse: 28
  },
  {
    reference: "Psalm 46:1",
    text: "God is our refuge and strength, an ever-present help in trouble.",
    translation: "NIV",
    theme: "Refuge & Protection",
    bookName: "Psalms",
    chapter: 46,
    verse: 1
  },
  {
    reference: "2 Corinthians 5:17",
    text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    translation: "NIV",
    theme: "Renewal & Identity",
    bookName: "2 Corinthians",
    chapter: 5,
    verse: 17
  },
  {
    reference: "Lamentations 3:22-23",
    text: "Because of the LORD's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.",
    translation: "NIV",
    theme: "Faithfulness",
    bookName: "Lamentations",
    chapter: 3,
    verse: 22
  },
  {
    reference: "Isaiah 41:10",
    text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.",
    translation: "NIV",
    theme: "Strength & Faith",
    bookName: "Isaiah",
    chapter: 41,
    verse: 10
  },
  {
    reference: "Hebrews 11:1",
    text: "Now faith is confidence in what we hope for and assurance about what we do not see.",
    translation: "NIV",
    theme: "Faith",
    bookName: "Hebrews",
    chapter: 11,
    verse: 1
  },
  {
    reference: "Psalm 119:105",
    text: "Your word is a lamp for my feet, a light on my path.",
    translation: "NIV",
    theme: "Guidance",
    bookName: "Psalms",
    chapter: 119,
    verse: 105
  }
];

export function getRandomScripture(currentReference?: string) {
  const candidates = RANDOM_SCRIPTURES.filter(s => s.reference !== currentReference);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || RANDOM_SCRIPTURES[0];
}

export const DAILY_VERSE_TRANSLATIONS: Record<string, { reference: string; text: string; translation: BibleTranslation; context: string; language: string }> = {
  NIV: {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    translation: "NIV",
    language: "English",
    context: "A reminder of divine sovereignty and unwavering love during life's triumphs and trials."
  },
  KJV: {
    reference: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    translation: "KJV",
    language: "English",
    context: "A classic reminder of divine sovereignty and unwavering love."
  },
  ESV: {
    reference: "Romans 8:28",
    text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    translation: "ESV",
    language: "English",
    context: "A reminder of divine sovereignty and unwavering love during life's triumphs and trials."
  },
  WEB: {
    reference: "Romans 8:28",
    text: "We know that all things work together for good for those who love God, to those who are called according to his purpose.",
    translation: "WEB",
    language: "English",
    context: "A reminder of divine sovereignty and unwavering love during life's triumphs and trials."
  },
  RVR1960: {
    reference: "Romanos 8:28",
    text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
    translation: "RVR1960",
    language: "Español (Reina-Valera 1960)",
    context: "Un recordatorio de la soberanía divina y el amor incondicional en todo momento."
  },
  ARC: {
    reference: "Romanos 8:28",
    text: "E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    translation: "ARC",
    language: "Português (Almeida Revista e Corrigida)",
    context: "Um poderoso lembrete da fidelidade e soberania do Senhor para com Seus filhos."
  },
  LSG: {
    reference: "Romains 8:28",
    text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.",
    translation: "LSG",
    language: "Français (Louis Segond 1910)",
    context: "Un rappel de la bonté parfaite de Dieu envers ceux qui marchent selon Sa volonté."
  },
  LUT: {
    reference: "Römer 8:28",
    text: "Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen, denen, die nach seinem Ratschluss berufen sind.",
    translation: "LUT",
    language: "Deutsch (Lutherbibel 2017)",
    context: "Eine ermutigende Zusage von Gottes Treue und vollkommener Fürsorge."
  }
};

export const TRANSLATION_OPTIONS: { id: BibleTranslation; label: string; lang: string; flag: string }[] = [
  { id: 'NIV', label: 'NIV (New International Version)', lang: 'English', flag: '🇺🇸' },
  { id: 'KJV', label: 'KJV (King James Version)', lang: 'English', flag: '🇬🇧' },
  { id: 'ESV', label: 'ESV (English Standard Version)', lang: 'English', flag: '🇺🇸' },
  { id: 'WEB', label: 'WEB (World English Bible)', lang: 'English', flag: '🌐' },
  { id: 'RVR1960', label: 'RVR1960 (Reina-Valera 1960)', lang: 'Español', flag: '🇪🇸' },
  { id: 'ARC', label: 'ARC (Almeida Revista e Corrigida)', lang: 'Português', flag: '🇧🇷' },
  { id: 'LSG', label: 'LSG (Louis Segond 1910)', lang: 'Français', flag: '🇫🇷' },
  { id: 'LUT', label: 'LUT (Lutherbibel 2017)', lang: 'Deutsch', flag: '🇩🇪' }
];

export function getDailyVerse(translation: BibleTranslation = 'NIV') {
  return DAILY_VERSE_TRANSLATIONS[translation] || DAILY_VERSE_TRANSLATIONS.NIV;
}

export const DAILY_VERSE_OF_THE_DAY = DAILY_VERSE_TRANSLATIONS.NIV;

export const INITIAL_DEVOTIONAL: DailyDevotional = {
  id: 'dev-today',
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  title: 'Anchored in Peace',
  scriptureRef: 'Philippians 4:6-7',
  verseText: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
  author: 'FaithPath Pastoral Team',
  body: `Anxiety often knocks at our door when we attempt to carry tomorrow's burdens with today's strength. Paul reminds us from a prison cell that true peace is not the absence of trials, but the presence of Christ.

When we bring our concerns to God in prayer, accompanied by thanksgiving for His past faithfulness, a divine exchange occurs. We give Him our heavy anxieties, and He gives us His quiet, transcendent peace—a peace that stands guard like a soldier over our minds and emotions.

Take a deep breath today. You do not have to figure out every step ahead. Lay down what you cannot control, and step into the resting place God has prepared for you.`,
  reflection: 'What is one worry you can surrender to God in prayer right now?',
  prayer: 'Heavenly Father, I surrender my worries and fear of the unknown into Your loving hands. Grant me Your supernatural peace that guards my heart. Amen.'
};

export const INITIAL_READING_PLANS: ReadingPlan[] = [
  {
    id: 'plan-1',
    title: 'Psalms of Comfort & Peace',
    description: 'A 7-day devotional walk through the comforting poetry of David and the Psalmists.',
    totalDays: 7,
    currentDay: 3,
    category: 'Peace & Comfort',
    days: [
      { dayNumber: 1, title: 'The Lord is My Shepherd', passage: 'Psalm 23:1-6', summary: 'Resting in God\'s guidance and protection.', isCompleted: true },
      { dayNumber: 2, title: 'Refuge and Fortress', passage: 'Psalm 91:1-16', summary: 'Abiding under the shadow of the Almighty.', isCompleted: true },
      { dayNumber: 3, title: 'A Light Unto My Path', passage: 'Psalm 119:105-112', summary: 'Finding daily direction through Scripture.', isCompleted: false },
      { dayNumber: 4, title: 'My Help Comes From the Lord', passage: 'Psalm 121:1-8', summary: 'The Keeper of Israel never slumbers.', isCompleted: false },
      { dayNumber: 5, title: 'God is Our Refuge', passage: 'Psalm 46:1-11', summary: 'Be still and know that I am God.', isCompleted: false },
      { dayNumber: 6, title: 'A Clean Heart', passage: 'Psalm 51:1-12', summary: 'Experiencing renewal and forgiveness.', isCompleted: false },
      { dayNumber: 7, title: 'Praise the Lord, My Soul', passage: 'Psalm 103:1-22', summary: 'Counting His blessings with gratitude.', isCompleted: false }
    ]
  },
  {
    id: 'plan-2',
    title: 'Walking in Jesus\' Footsteps',
    description: 'Discover the life, miracles, and teachings of Jesus in the Gospel of John.',
    totalDays: 14,
    currentDay: 1,
    category: 'Gospels',
    days: [
      { dayNumber: 1, title: 'The Word Became Flesh', passage: 'John 1:1-18', summary: 'The light that shines in the darkness.', isCompleted: false },
      { dayNumber: 2, title: 'Born Again', passage: 'John 3:1-21', summary: 'God\'s love sent His Son to save the world.', isCompleted: false },
      { dayNumber: 3, title: 'Living Water', passage: 'John 4:1-26', summary: 'Satisfaction that satisfies the thirsty soul.', isCompleted: false }
    ]
  }
];
