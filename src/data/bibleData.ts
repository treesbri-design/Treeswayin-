import { BibleBook, SavedVerse, VerseHighlight } from '../types';

export const POPULAR_BIBLE_BOOKS: BibleBook[] = [
  {
    id: 'genesis',
    name: 'Genesis',
    testament: 'Old',
    category: 'Law',
    chapterCount: 50,
    chapters: {
      1: [
        { number: 1, text: 'In the beginning God created the heavens and the earth.' },
        { number: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.' },
        { number: 3, text: 'And God said, "Let there be light," and there was light.' },
        { number: 4, text: 'God saw that the light was good, and he separated the light from the darkness.' },
        { number: 5, text: 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.' },
        { number: 26, text: 'Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky."' },
        { number: 27, text: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.' },
        { number: 31, text: 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.' }
      ],
      12: [
        { number: 1, text: 'The LORD had said to Abram, "Go from your country, your people and your father\'s household to the land I will show you.' },
        { number: 2, text: 'I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.' },
        { number: 3, text: 'I will bless those who bless you, and whoever curses you I will curse; and all peoples on earth will be blessed through you."' }
      ]
    }
  },
  {
    id: 'psalms',
    name: 'Psalms',
    testament: 'Old',
    category: 'Poetry',
    chapterCount: 150,
    chapters: {
      23: [
        { number: 1, text: 'The LORD is my shepherd, I lack nothing.' },
        { number: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,' },
        { number: 3, text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.' },
        { number: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
        { number: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
        { number: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.' }
      ],
      91: [
        { number: 1, text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.' },
        { number: 2, text: 'I will say of the LORD, "He is my refuge and my fortress, my God, in whom I trust."' },
        { number: 3, text: 'Surely he will save you from the fowler\'s snare and from the deadly pestilence.' },
        { number: 4, text: 'He will cover you with his feathers, and under his wings you will find refuge; his faithfulness will be your shield and rampart.' },
        { number: 11, text: 'For he will command his angels concerning you to guard you in all your ways.' }
      ],
      119: [
        { number: 105, text: 'Your word is a lamp for my feet, a light on my path.' },
        { number: 114, text: 'You are my refuge and my shield; I have put my hope in your word.' }
      ]
    }
  },
  {
    id: 'proverbs',
    name: 'Proverbs',
    testament: 'Old',
    category: 'Poetry',
    chapterCount: 31,
    chapters: {
      3: [
        { number: 1, text: 'My son, do not forget my teaching, but keep my commands in your heart,' },
        { number: 2, text: 'for they will prolong your life many years and bring you peace and prosperity.' },
        { number: 3, text: 'Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart.' },
        { number: 4, text: 'Then you will win favor and a good name in the sight of God and man.' },
        { number: 5, text: 'Trust in the LORD with all your heart and lean not on your own understanding;' },
        { number: 6, text: 'in all your ways submit to him, and he will make your paths straight.' }
      ],
      16: [
        { number: 3, text: 'Commit to the LORD whatever you do, and he will establish your plans.' },
        { number: 9, text: 'In their hearts humans plan their course, but the LORD establishes their steps.' }
      ]
    }
  },
  {
    id: 'isaiah',
    name: 'Isaiah',
    testament: 'Old',
    category: 'Prophets',
    chapterCount: 66,
    chapters: {
      40: [
        { number: 29, text: 'He gives strength to the weary and increases the power of the weak.' },
        { number: 30, text: 'Even youths grow tired and weary, and young men stumble and fall;' },
        { number: 31, text: 'but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' }
      ],
      41: [
        { number: 10, text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' }
      ],
      53: [
        { number: 5, text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.' }
      ]
    }
  },
  {
    id: 'matthew',
    name: 'Matthew',
    testament: 'New',
    category: 'Gospels',
    chapterCount: 28,
    chapters: {
      5: [
        { number: 3, text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
        { number: 4, text: 'Blessed are those who mourn, for they will be comforted.' },
        { number: 5, text: 'Blessed are the meek, for they will inherit the earth.' },
        { number: 6, text: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.' },
        { number: 14, text: 'You are the light of the world. A town built on a hill cannot be hidden.' },
        { number: 16, text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' }
      ],
      6: [
        { number: 9, text: 'This, then, is how you should pray: "Our Father in heaven, hallowed be your name,' },
        { number: 10, text: 'your kingdom come, your will be done, on earth as it is in heaven.' },
        { number: 11, text: 'Give us today our daily bread.' },
        { number: 12, text: 'And forgive us our debts, as we also have forgiven our debtors.' },
        { number: 13, text: 'And lead us not into temptation, but deliver us from the evil one."' },
        { number: 33, text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
        { number: 34, text: 'Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.' }
      ],
      11: [
        { number: 28, text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
        { number: 29, text: 'Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.' },
        { number: 30, text: 'For my yoke is easy and my burden is light.' }
      ]
    }
  },
  {
    id: 'john',
    name: 'John',
    testament: 'New',
    category: 'Gospels',
    chapterCount: 21,
    chapters: {
      1: [
        { number: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
        { number: 2, text: 'He was with God in the beginning.' },
        { number: 3, text: 'Through him all things were made; without him nothing was made that has been made.' },
        { number: 4, text: 'In him was life, and that life was the light of all mankind.' },
        { number: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.' },
        { number: 14, text: 'The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.' }
      ],
      3: [
        { number: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
        { number: 17, text: 'For God did not send his Son into the world to condemn the world, but to save the world through him.' }
      ],
      14: [
        { number: 1, text: 'Do not let your hearts be troubled. You believe in God; believe also in me.' },
        { number: 6, text: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me.' },
        { number: 27, text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' }
      ]
    }
  },
  {
    id: 'romans',
    name: 'Romans',
    testament: 'New',
    category: 'Epistles',
    chapterCount: 16,
    chapters: {
      8: [
        { number: 1, text: 'Therefore, there is now no condemnation for those who are in Christ Jesus,' },
        { number: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
        { number: 31, text: 'What, then, shall we say in response to these things? If God is for us, who can be against us?' },
        { number: 38, text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers,' },
        { number: 39, text: 'neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.' }
      ],
      12: [
        { number: 2, text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.' },
        { number: 12, text: 'Be joyful in hope, patient in affliction, faithful in prayer.' }
      ]
    }
  },
  {
    id: 'philippians',
    name: 'Philippians',
    testament: 'New',
    category: 'Epistles',
    chapterCount: 4,
    chapters: {
      4: [
        { number: 4, text: 'Rejoice in the Lord always. I will say it again: Rejoice!' },
        { number: 6, text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
        { number: 7, text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
        { number: 13, text: 'I can do all this through him who gives me strength.' },
        { number: 19, text: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.' }
      ]
    }
  },
  {
    id: 'revelation',
    name: 'Revelation',
    testament: 'New',
    category: 'Apocalyptic',
    chapterCount: 22,
    chapters: {
      21: [
        { number: 1, text: 'Then I saw "a new heaven and a new earth," for the first heaven and the first earth had passed away.' },
        { number: 4, text: '\'He will wipe every tear from their eyes. There will be no more death\' or mourning or crying or pain, for the old order of things has passed away."' },
        { number: 5, text: 'He who was seated on the throne said, "I am making everything new!" Then he said, "Write this down, for these words are trustworthy and true."' }
      ]
    }
  }
];

export const ALL_BIBLE_BOOKS_NAMES = [
  // OT
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
  "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel",
  "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  // NT
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

// Fallback dynamic verse generator for chapters not pre-loaded in memory
export function getVersesForChapter(bookName: string, chapter: number): { number: number; text: string }[] {
  const foundBook = POPULAR_BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (foundBook && foundBook.chapters[chapter]) {
    return foundBook.chapters[chapter];
  }

  // Generates clean biblical verse placeholders if chapter isn't in mock JSON seed
  return Array.from({ length: 12 }, (_, i) => {
    const vNum = i + 1;
    if (vNum === 1) return { number: 1, text: `The word of the Lord came to His people in ${bookName} Chapter ${chapter}, guiding their steps in wisdom and truth.` };
    if (vNum === 2) return { number: 2, text: `Trust in His unfailing grace, for His covenant endures through all generations.` };
    if (vNum === 3) return { number: 3, text: `Blessed are those who seek righteousness with an upright heart and walk in His pathways.` };
    if (vNum === 4) return { number: 4, text: `He is a stronghold in times of trouble and a beacon of hope in darkness.` };
    return { number: vNum, text: `In ${bookName} ${chapter}:${vNum}, we are called to hold fast to hope, loving one another as Christ loved us.` };
  });
}
