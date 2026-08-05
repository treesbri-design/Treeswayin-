import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  RotateCcw, 
  BookOpen, 
  ChevronRight, 
  Trophy, 
  Lightbulb, 
  Share2, 
  Check, 
  ArrowRight,
  BrainCircuit,
  Flame
} from 'lucide-react';
import { offlineStorage } from '../services/offlineStorageService';
import { POPULAR_BIBLE_BOOKS } from '../data/bibleData';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  verseRef: string;
}

interface BibleQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookName: string;
  initialChapter: number;
  onSelectChapter?: (book: string, chapter: number) => void;
}

// Curated question bank for popular chapters
const CURATED_QUIZ_BANK: Record<string, QuizQuestion[]> = {
  'john-3': [
    {
      id: 'j3-1',
      question: 'Who came to visit Jesus at night in John 3?',
      options: ['Nicodemus, a Pharisee and member of the Jewish ruling council', 'Simon Peter, a fisherman from Galilee', 'Zacchaeus, a chief tax collector', 'Joseph of Arimathea'],
      correctIndex: 0,
      explanation: 'Nicodemus was a prominent Pharisee and member of the Sanhedrin who approached Jesus under cover of night to inquire about His teachings.',
      verseRef: 'John 3:1-2'
    },
    {
      id: 'j3-2',
      question: 'What did Jesus tell Nicodemus a person must experience to see the Kingdom of God?',
      options: ['They must give all their wealth to the poor', 'They must be born again (born of water and the Spirit)', 'They must memorize all 613 laws of the Torah', 'They must fast for forty consecutive days'],
      correctIndex: 1,
      explanation: 'Jesus declared: "Very truly I tell you, no one can see the kingdom of God unless they are born again" (born of water and the Spirit).',
      verseRef: 'John 3:3-5'
    },
    {
      id: 'j3-3',
      question: 'In John 3:16, why did God send His one and only Son into the world?',
      options: ['To condemn the nations for their sins', 'Because He so loved the world, that whoever believes in Him shall not perish but have eternal life', 'To establish a physical earthly kingdom in Jerusalem', 'To replace the Roman emperor with a spiritual government'],
      correctIndex: 1,
      explanation: 'John 3:16 states that God’s motivation is His immense love for the world, offering eternal life to all who place their trust in His Son.',
      verseRef: 'John 3:16'
    },
    {
      id: 'j3-4',
      question: 'To what Old Testament event did Jesus compare His upcoming crucifixion on the cross?',
      options: ['Noah building the ark during the flood', 'Moses lifting up the bronze serpent in the wilderness', 'Elijah being taken up to heaven in a chariot of fire', 'Daniel surviving the lions’ den'],
      correctIndex: 1,
      explanation: 'Jesus referenced Numbers 21, explaining: "Just as Moses lifted up the snake in the wilderness, so the Son of Man must be lifted up."',
      verseRef: 'John 3:14-15'
    },
    {
      id: 'j3-5',
      question: 'What famous statement did John the Baptist make regarding Jesus in John 3:30?',
      options: ['"He must become greater; I must become less."', '"Follow me as I follow Christ."', '"I am the voice crying in the desert."', '"Behold the Lamb of God who takes away the sin of the world!"'],
      correctIndex: 0,
      explanation: 'John the Baptist humbly declared His joy in Christ’s exaltation: "He must become greater; I must become less."',
      verseRef: 'John 3:30'
    }
  ],
  'genesis-1': [
    {
      id: 'g1-1',
      question: 'What were the very first words spoken by God recorded in Genesis 1:3?',
      options: ['"Let there be light"', '"Let the earth produce living creatures"', '"Let us make mankind in our image"', '"Let the waters under the sky be gathered"'],
      correctIndex: 0,
      explanation: 'God initiated creation on Day 1 by speaking light into existence: "And God said, \'Let there be light,\' and there was light."',
      verseRef: 'Genesis 1:3'
    },
    {
      id: 'g1-2',
      question: 'On which day of creation did God create the sun, moon, and stars?',
      options: ['First Day', 'Third Day', 'Fourth Day', 'Sixth Day'],
      correctIndex: 2,
      explanation: 'On the Fourth Day, God created the lights in the expanse of the sky to separate day from night and mark seasons, days, and years.',
      verseRef: 'Genesis 1:14-19'
    },
    {
      id: 'g1-3',
      question: 'In whose image did God create mankind in Genesis 1:27?',
      options: ['In the image of the angels', 'In His own image (Imago Dei)', 'In the likeness of the earth', 'In the image of nature'],
      correctIndex: 1,
      explanation: 'Genesis 1:27 teaches that human beings possess unique divine dignity: "So God created mankind in his own image, in the image of God he created them."',
      verseRef: 'Genesis 1:27'
    },
    {
      id: 'g1-4',
      question: 'What mandate did God give to human beings after creating them male and female?',
      options: ['"Be fruitful and increase in number; fill the earth and subdue it"', '"Build a tower reaching to the heavens"', '"Divide the nations into separate languages"', '"Travel to the ends of the sea"'],
      correctIndex: 0,
      explanation: 'God blessed humanity and commissioned them with stewardship over creation: "Be fruitful and increase in number; fill the earth and subdue it."',
      verseRef: 'Genesis 1:28'
    },
    {
      id: 'g1-5',
      question: 'How did God describe all that He had made at the conclusion of the Sixth Day?',
      options: ['It was adequate', 'It was very good', 'It was incomplete', 'It was peaceful'],
      correctIndex: 1,
      explanation: 'Genesis 1:31 records God’s divine evaluation: "God saw all that he had made, and it was very good."',
      verseRef: 'Genesis 1:31'
    }
  ],
  'psalms-23': [
    {
      id: 'p23-1',
      question: 'How does David describe the Lord in the opening verse of Psalm 23?',
      options: ['"The LORD is my fortress"', '"The LORD is my shepherd, I lack nothing"', '"The LORD is my light and my salvation"', '"The LORD is my rock"'],
      correctIndex: 1,
      explanation: 'David opens Psalm 23 with the famous metaphor of divine care: "The LORD is my shepherd, I lack nothing."',
      verseRef: 'Psalm 23:1'
    },
    {
      id: 'p23-2',
      question: 'Where does the Lord make His sheep lie down, according to Psalm 23:2?',
      options: ['On high mountaintops', 'In green pastures and beside quiet waters', 'Inside the walls of Jerusalem', 'By the banks of the Jordan River'],
      correctIndex: 1,
      explanation: 'The Shepherd provides nourishment and rest: "He makes me lie down in green pastures, he leads me beside quiet waters."',
      verseRef: 'Psalm 23:2'
    },
    {
      id: 'p23-3',
      question: 'Why does David declare he will "fear no evil" even when walking through the darkest valley?',
      options: ['Because he carries a heavy sword', 'Because God is with him, and His rod and staff comfort him', 'Because he is surrounded by a vast army', 'Because he is swift on his feet'],
      correctIndex: 1,
      explanation: 'David’s courage rests in God’s presence: "for you are with me; your rod and your staff, they comfort me."',
      verseRef: 'Psalm 23:4'
    },
    {
      id: 'p23-4',
      question: 'What does God prepare before David in the presence of his enemies?',
      options: ['A sanctuary of stone', 'A table overflowing with food', 'A shield of gold', 'A chariot of fire'],
      correctIndex: 1,
      explanation: 'Psalm 23:5 describes God’s lavish hospitality: "You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows."',
      verseRef: 'Psalm 23:5'
    },
    {
      id: 'p23-5',
      question: 'What two divine blessings does David say will follow him all the days of his life?',
      options: ['Gold and wisdom', 'Goodness and love (mercy)', 'Power and prestige', 'Health and long life'],
      correctIndex: 1,
      explanation: 'Psalm 23:6 concludes: "Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever."',
      verseRef: 'Psalm 23:6'
    }
  ],
  'romans-8': [
    {
      id: 'r8-1',
      question: 'What foundational truth is proclaimed in Romans 8:1 for those who are in Christ Jesus?',
      options: ['There is now no condemnation', 'There is no guarantee of earthly wealth', 'There are many trials ahead', 'There is no law that applies'],
      correctIndex: 0,
      explanation: 'Romans 8:1 triumphantly declares: "Therefore, there is now no condemnation for those who are in Christ Jesus."',
      verseRef: 'Romans 8:1'
    },
    {
      id: 'r8-2',
      question: 'According to Romans 8:28, in all things God works for the good of whom?',
      options: ['Those who are wealthy and influential', 'Those who love Him and have been called according to His purpose', 'Only those who never make mistakes', 'Every person regardless of faith'],
      correctIndex: 1,
      explanation: 'Paul reassures believers: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."',
      verseRef: 'Romans 8:28'
    },
    {
      id: 'r8-3',
      question: 'If God is for us, what rhetorical question does Paul ask in Romans 8:31?',
      options: ['"Who can be against us?"', '"Why should we weep?"', '"Where is our reward?"', '"When will Christ return?"'],
      correctIndex: 0,
      explanation: 'Paul highlights God’s sovereign protection: "If God is for us, who can be against us?"',
      verseRef: 'Romans 8:31'
    },
    {
      id: 'r8-4',
      question: 'What does Paul affirm can separate believers from the love of God that is in Christ Jesus?',
      options: ['Hardship and persecution', 'Angels or demons', 'Death or life', 'Nothing in all creation'],
      correctIndex: 3,
      explanation: 'Romans 8:38-39 promises that neither trouble, death, nor any created thing can separate us from God’s love.',
      verseRef: 'Romans 8:38-39'
    }
  ]
};

// Smart Question Generator for any Bible chapter text
function generateDynamicQuestions(bookName: string, chapter: number): QuizQuestion[] {
  const key = `${bookName.toLowerCase()}-${chapter}`;
  if (CURATED_QUIZ_BANK[key]) {
    return CURATED_QUIZ_BANK[key];
  }

  // Get verses from offline/online storage
  const verses = offlineStorage.getChapter(bookName, chapter);
  if (!verses || verses.length === 0) {
    return CURATED_QUIZ_BANK['john-3']; // Fallback
  }

  const generated: QuizQuestion[] = [];

  // Generate 4-5 questions based on key verses
  verses.forEach((v, idx) => {
    if (idx >= 5) return; // Limit to 5 questions
    const text = v.text;
    const words = text.split(' ');

    if (words.length < 6) return;

    // Pick a key word or concept to turn into a question
    let questionText = `In ${bookName} ${chapter}:${v.number}, what does the scripture state?`;
    let correctOption = text;
    let distractor1 = `The passage commands believers to fast and pray without ceasing in ${bookName} ${chapter}.`;
    let distractor2 = `The chapter primarily discusses the historical boundary lines of ancient Israel.`;
    let distractor3 = `The verse emphasizes solemn silence and repentance before kingly authority.`;

    // Tailor distractors based on testament / category
    if (text.includes('God') || text.includes('LORD') || text.includes('Jesus')) {
      questionText = `According to ${bookName} ${chapter}:${v.number}, how is divine action described in this passage?`;
    }

    const options = [
      correctOption,
      distractor1,
      distractor2,
      distractor3
    ].sort(() => 0.5 - Math.random());

    const correctIndex = options.indexOf(correctOption);

    generated.push({
      id: `dyn-${idx}-${Date.now()}`,
      question: questionText,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanation: `This question tests direct comprehension of ${bookName} ${chapter}:${v.number}. "${text}"`,
      verseRef: `${bookName} ${chapter}:${v.number}`
    });
  });

  return generated;
}

export const BibleQuizModal: React.FC<BibleQuizModalProps> = ({
  isOpen,
  onClose,
  initialBookName,
  initialChapter,
  onSelectChapter
}) => {
  const [currentBook, setCurrentBook] = useState<string>(initialBookName);
  const [currentChapter, setCurrentChapter] = useState<number>(initialChapter);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<{ questionId: string; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [copiedScore, setCopiedScore] = useState<boolean>(false);

  // Initialize or reload quiz when chapter changes
  useEffect(() => {
    if (isOpen) {
      setCurrentBook(initialBookName);
      setCurrentChapter(initialChapter);
      const q = generateDynamicQuestions(initialBookName, initialChapter);
      setQuestions(q);
      setCurrentQuestionIndex(0);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
      setUserAnswers([]);
      setIsCompleted(false);
    }
  }, [isOpen, initialBookName, initialChapter]);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex];
  const score = userAnswers.filter(a => a.isCorrect).length;
  const totalQ = questions.length;
  const percentage = Math.round((score / (totalQ || 1)) * 100);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || !currentQ) return;
    const isCorrect = selectedOptionIndex === currentQ.correctIndex;
    setIsAnswerSubmitted(true);

    setUserAnswers(prev => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedIndex: selectedOptionIndex,
        isCorrect
      }
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsCompleted(true);
      // Save high score to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('faithpath_quiz_history') || '[]');
        history.unshift({
          book: currentBook,
          chapter: currentChapter,
          score,
          total: totalQ,
          date: new Date().toISOString()
        });
        localStorage.setItem('faithpath_quiz_history', JSON.stringify(history.slice(0, 20)));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRestartQuiz = () => {
    const q = generateDynamicQuestions(currentBook, currentChapter);
    setQuestions(q);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsCompleted(false);
  };

  const handleChangeChapterQuiz = (newBook: string, newChap: number) => {
    setCurrentBook(newBook);
    setCurrentChapter(newChap);
    const q = generateDynamicQuestions(newBook, newChap);
    setQuestions(q);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setIsCompleted(false);
    if (onSelectChapter) {
      onSelectChapter(newBook, newChap);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#122452] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 font-bold">
              <BrainCircuit className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3 h-3" /> AI Scripture Knowledge Challenge
              </div>
              <h3 className="font-black text-lg text-white">
                {currentBook} Chapter {currentChapter} Quiz
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!isCompleted ? (
            <>
              {/* Progress & Chapter Switcher */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Question {currentQuestionIndex + 1} of {totalQ}
                  </span>
                  <span className="text-slate-500 font-bold">
                    Score: {score}/{userAnswers.length}
                  </span>
                </div>

                {/* Chapter Select dropdown */}
                <select
                  value={`${currentBook}|${currentChapter}`}
                  onChange={(e) => {
                    const [b, c] = e.target.value.split('|');
                    handleChangeChapterQuiz(b, Number(c));
                  }}
                  className="py-1 px-2.5 bg-blue-50 border border-blue-200 rounded-xl font-bold text-xs text-blue-900 focus:outline-none"
                >
                  <option value="John|3">John 3 (Gospel)</option>
                  <option value="Genesis|1">Genesis 1 (Creation)</option>
                  <option value="Psalms|23">Psalms 23 (Shepherd)</option>
                  <option value="Romans|8">Romans 8 (No Condemnation)</option>
                  <option value={`${initialBookName}|${initialChapter}`}>
                    {initialBookName} {initialChapter} (Current Chapter)
                  </option>
                </select>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1E3A8A] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQ) * 100}%` }}
                />
              </div>

              {/* QUESTION CARD */}
              {currentQ && (
                <div className="space-y-4 pt-1">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md inline-block mb-1.5">
                      {currentQ.verseRef}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                      {currentQ.question}
                    </h4>
                  </div>

                  {/* OPTIONS LIST */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = selectedOptionIndex === idx;
                      const isCorrectOpt = idx === currentQ.correctIndex;

                      let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-blue-50/50";
                      let badgeLetterStyle = "bg-slate-100 text-slate-700";

                      if (isAnswerSubmitted) {
                        if (isCorrectOpt) {
                          btnStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-extrabold shadow-sm";
                          badgeLetterStyle = "bg-emerald-500 text-white";
                        } else if (isSelected && !isCorrectOpt) {
                          btnStyle = "bg-rose-50 border-rose-300 text-rose-900 font-bold";
                          badgeLetterStyle = "bg-rose-500 text-white";
                        } else {
                          btnStyle = "bg-white border-slate-200 opacity-60 text-slate-500";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-blue-50 border-[#1E3A8A] text-[#1E3A8A] font-extrabold ring-2 ring-blue-200";
                        badgeLetterStyle = "bg-[#1E3A8A] text-white";
                      }

                      const optionLetters = ['A', 'B', 'C', 'D'];

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${badgeLetterStyle}`}>
                              {optionLetters[idx]}
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>

                          {isAnswerSubmitted && isCorrectOpt && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && !isCorrectOpt && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* SUBMIT OR NEXT ACTION */}
                  {!isAnswerSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOptionIndex === null}
                      onClick={handleSubmitAnswer}
                      className="w-full py-3.5 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      Check Answer
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                      {/* EXPLANATION BOX */}
                      <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        selectedOptionIndex === currentQ.correctIndex 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50 border-amber-200 text-amber-950'
                      }`}>
                        <div className="flex items-center gap-1.5 font-extrabold uppercase text-[10px]">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                          Scripture Explanation ({currentQ.verseRef})
                        </div>
                        <p className="leading-relaxed font-medium">
                          {currentQ.explanation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="w-full py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#1E3A8A] font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {currentQuestionIndex + 1 < totalQ ? 'Next Question' : 'View Final Score'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* COMPLETION SCORE SUMMARY SCREEN */
            <div className="text-center py-4 space-y-5 animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-amber-200/80 text-[#1E3A8A]">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Quiz Completed!
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  {score} / {totalQ} Correct
                </h3>
                <p className="text-sm font-extrabold text-blue-700 mt-0.5">
                  {percentage}% Scripture Mastery
                </p>
              </div>

              {/* Spiritual Encouragement Badge */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1E3A8A]">
                  <Flame className="w-4 h-4 text-amber-500" />
                  {percentage >= 80 ? '🌟 Scripture Scholar!' : percentage >= 60 ? '📖 Faithful Student!' : '🌱 Growing in Grace'}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {percentage >= 80 
                    ? 'Wonderful job! You demonstrated deep comprehension of this scripture chapter.'
                    : 'Great effort! Re-reading the chapter will help lock these truths deeper into your heart.'}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={handleRestartQuiz}
                  className="flex-1 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`I scored ${percentage}% on the FaithPath AI Bible Knowledge Quiz for ${currentBook} ${currentChapter}! 📖✝`);
                    setCopiedScore(true);
                    setTimeout(() => setCopiedScore(false), 2000);
                  }}
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-[#1E3A8A] font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {copiedScore ? (
                    <>
                      <Check className="w-4 h-4 text-[#1E3A8A]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#1E3A8A]" /> Share Score
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
