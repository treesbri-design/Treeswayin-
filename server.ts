import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI SDK server-side
  const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", aiEnabled: !!process.env.GEMINI_API_KEY });
  });

  // AI Chat Endpoint for FaithPath AI Bible Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const ai = getGenAI();

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not set
        return res.json({
          reply: `**Scripture Focus:** *${getFallbackVerse(message)}*\n\nThank you for reaching out with your question: "${message}". FaithPath AI is here to encourage you! God's Word offers eternal comfort and wisdom for every circumstance. Please explore the Bible tab to read the complete context of these passages.`,
          scriptureReferences: ["Romans 8:28", "Psalm 23:1-3"],
        });
      }

      const systemInstruction = `You are FaithPath AI, a compassionate, biblically grounded Christian spiritual guide and Bible study assistant.
Key instructions:
1. Always base your answers on sound biblical theology and scripture.
2. Reference relevant Bible passages clearly using brackets e.g. [Romans 8:28] or [Psalm 23:1-3].
3. Clearly distinguish Holy Scripture from commentary and practical explanations.
4. Encourage users to open their Bible and read the full context surrounding the passages.
5. Offer warm, gentle, empathetic encouragement, ending with a brief 1-sentence prayer or reflection question.`;

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push(`${msg.role === 'user' ? 'User' : 'FaithPath AI'}: ${msg.content}`);
        }
      }
      contents.push(`User: ${message}`);

      let replyText = "";
      let scriptureReferences: string[] = [];

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: contents.join("\n"),
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        replyText = response.text || "May the peace of Christ be with you today as you seek His truth.";
        const verseMatches = replyText.match(/\[([1-3]?\s?[A-Za-z]+\s+\d+:\d+(?:-\d+)?)\]/g) || [];
        scriptureReferences = verseMatches.map(v => v.replace(/[\[\]]/g, ''));
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, using graceful scripture response:", geminiError);
        replyText = `**Scripture Focus:** *${getFallbackVerse(message)}*\n\nThank you for reaching out with your question: "${message}". FaithPath AI is here to encourage you! God's Word offers eternal comfort and wisdom for every circumstance. Please explore the Bible tab to read the complete context of these passages.`;
        scriptureReferences = ["Romans 8:28", "Psalm 23:1-3"];
      }

      res.json({
        reply: replyText,
        scriptureReferences,
      });
    } catch (error: any) {
      console.error("Error in /api/ai/chat:", error);
      res.json({
        reply: `**Scripture Focus:** *Romans 8:28*\n\n"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."\n\nThank you for asking: "${req.body?.message || 'your question'}". God's Word provides hope and light for our journey.`,
        scriptureReferences: ["Romans 8:28", "Psalm 119:105"]
      });
    }
  });

  // AI Devotional Generator Endpoint
  app.post("/api/ai/devotional", async (req, res) => {
    try {
      const { topic, userMood } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          title: "Walking in Hope & Faith",
          scripture: "Jeremiah 29:11",
          verseText: "For I know the plans I have for you,” declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future.",
          devotional: "No matter what season of life you are currently navigating, God's promise remains unshakable. When uncertainties arise, anchor your thoughts on His everlasting love and sovereign guidance.",
          reflectionQuestion: "What promise of God can you rest in today?",
          prayer: "Heavenly Father, thank You for holding my future in Your faithful hands. Amen."
        });
      }

      const prompt = `Generate a daily devotional for a Christian user who is feeling ${userMood || 'seeking peace'} and interested in the topic "${topic || 'Trusting God in Daily Life'}".
Return a JSON object matching this exact format:
{
  "title": "Inspiring Title",
  "scripture": "Book Chapter:Verse",
  "verseText": "Exact scripture text",
  "devotional": "A 2-3 paragraph uplifting devotional message with practical biblical wisdom.",
  "reflectionQuestion": "Thoughtful question for personal reflection",
  "prayer": "A short, heartfelt prayer"
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const data = JSON.parse(response.text || "{}");
        res.json(data);
      } catch (geminiError) {
        res.json({
          title: `Finding Peace in ${topic || 'Daily Life'}`,
          scripture: "Proverbs 3:5-6",
          verseText: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
          devotional: "When faced with choices and feelings of anxiety or uncertainty, God invites us to step into faith rather than self-reliance. His guidance is sure and His love endures forever.",
          reflectionQuestion: "How can you surrender this concern to God today?",
          prayer: "Lord Jesus, I surrender my path to You and place my total trust in Your divine love. Amen."
        });
      }
    } catch (error: any) {
      console.error("Error in /api/ai/devotional:", error);
      res.status(500).json({ error: "Failed to generate devotional" });
    }
  });

  // AI Bible Study Plan Generator (Premium Feature)
  app.post("/api/ai/study-plan", async (req, res) => {
    try {
      const { goal, durationDays } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          title: `${goal || 'Deeper Faith'} - ${durationDays || 7} Day Guide`,
          description: "A guided journey through foundational Scriptures to build daily habits of worship and understanding.",
          days: [
            { day: 1, title: "Foundations of Grace", passage: "Ephesians 2:1-10", summary: "Understand how salvation is God's gift of grace." },
            { day: 2, title: "Walking in Truth", passage: "Psalm 119:105-112", summary: "God's word as a lamp unto your feet." },
            { day: 3, title: "Peace Over Anxiety", passage: "Philippians 4:4-9", summary: "Replacing worries with prayer and thanksgiving." }
          ]
        });
      }

      const prompt = `Create a ${durationDays || 7}-day Bible study plan focused on: "${goal || 'Growing closer to God'}".
Return JSON format:
{
  "title": "Study Plan Title",
  "description": "Brief 2-sentence plan overview",
  "days": [
    {
      "day": 1,
      "title": "Day Title",
      "passage": "Book Chapter:Verse",
      "summary": "Key takeaway and daily application point"
    }
  ]
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        res.json(JSON.parse(response.text || "{}"));
      } catch (geminiError) {
        res.json({
          title: `${goal || 'Scripture Guidance'} - 7 Day Walk`,
          description: "A structured 7-day scripture path designed to encourage your spirit and build your faith.",
          days: Array.from({ length: durationDays || 7 }, (_, i) => ({
            day: i + 1,
            title: `Day ${i + 1}: Trust & Faithfulness`,
            passage: i % 2 === 0 ? "Psalm 23:1-6" : "Romans 8:28-39",
            summary: "Reflect on God's steadfast promises and daily presence."
          }))
        });
      }
    } catch (error: any) {
      console.error("Error in /api/ai/study-plan:", error);
      res.status(500).json({ error: "Failed to generate study plan" });
    }
  });

  // AI Sermon Summarizer Endpoint
  app.post("/api/ai/sermon-summary", async (req, res) => {
    try {
      const { notes } = req.body;
      const ai = getGenAI();

      if (!ai) {
        return res.json({
          title: "Sermon Summary",
          mainTheme: "Trusting God in Times of Transition",
          keyVerses: ["Proverbs 3:5-6", "Isaiah 43:19"],
          keyTakeaways: [
            "God is working behind the scenes even when unseen.",
            "Surrender control through intentional prayer.",
            "Step forward in faith one day at a time."
          ],
          applicationStep: "Spend 5 minutes each morning reflecting on God's faithfulness in past seasons."
        });
      }

      const prompt = `Summarize these sermon notes or transcript into actionable Christian spiritual insights:
"${notes}"

Return JSON format:
{
  "title": "Catchy Sermon Title",
  "mainTheme": "Central Message",
  "keyVerses": ["Verse 1", "Verse 2"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "applicationStep": "Specific practical step for the week"
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        res.json(JSON.parse(response.text || "{}"));
      } catch (geminiError) {
        res.json({
          title: "Sermon Key Insights",
          mainTheme: "Living by Faith",
          keyVerses: ["Philippians 4:13", "Hebrews 11:1"],
          keyTakeaways: [
            "Faith is active trust in God's promises.",
            "Prayer aligns our heart with God's will.",
            "Encouraging fellow believers strengthens the church."
          ],
          applicationStep: "Take one concrete step of faith this week in prayer and love."
        });
      }
    } catch (error: any) {
      console.error("Error in /api/ai/sermon-summary:", error);
      res.status(500).json({ error: "Failed to summarize sermon" });
    }
  });

  // AI Sunday School Lesson Generator Endpoint
  app.post("/api/ai/sunday-school-lesson", async (req, res) => {
    try {
      const { topic, ageGroup, durationMinutes, classSize, specialFocus } = req.body;
      const ai = getGenAI();

      const topicText = topic || "David and Goliath (1 Samuel 17)";
      const targetAge = ageGroup || "Early Elementary (6-8)";
      const duration = durationMinutes || 30;

      if (!ai) {
        return res.json(getFallbackSundaySchoolLesson(topicText, targetAge, duration));
      }

      const prompt = `You are a professional Christian Children's Ministry director and Sunday school teacher trainer.
Generate a comprehensive, simplified, easy-to-teach Sunday school lesson plan.
Topic / Bible Passage: "${topicText}"
Target Age Group: "${targetAge}"
Class Duration: ${duration} minutes
Class Size: "${classSize || 'Medium (6-15)'}"
Special Focus: "${specialFocus || 'Interactive story with craft and object lesson'}"

Return JSON format:
{
  "title": "Catchy Kid-Friendly Lesson Title",
  "passage": "Specific Bible passage reference e.g. 1 Samuel 17:32-50",
  "ageGroup": "${targetAge}",
  "durationMinutes": ${duration},
  "bigIdea": "1-sentence central takeaway for kids",
  "memoryVerse": {
    "reference": "Book Chapter:Verse",
    "text": "Short verse text",
    "gestureOrTip": "Action gesture or motion chant for kids"
  },
  "materialsNeeded": ["Material 1", "Material 2", "Material 3"],
  "icebreaker": {
    "title": "Icebreaker Game Title",
    "instructions": "Clear step-by-step game rules",
    "duration": "5 mins"
  },
  "storyScript": {
    "summary": "Kid-friendly narrative paragraph for the teacher to speak.",
    "keyTalkingPoints": [
      "Point 1",
      "Point 2",
      "Point 3"
    ]
  },
  "discussionQuestions": [
    {
      "question": "Age-appropriate question 1?",
      "suggestedAnswer": "Sample answer 1"
    },
    {
      "question": "Age-appropriate question 2?",
      "suggestedAnswer": "Sample answer 2"
    },
    {
      "question": "Age-appropriate question 3?",
      "suggestedAnswer": "Sample answer 3"
    }
  ],
  "activityOrCraft": {
    "title": "Craft/Activity Title",
    "description": "Step by step craft or game instructions.",
    "materials": ["Craft material 1", "Craft material 2"]
  },
  "closingPrayer": "Short repeating prayer for kids to say after the teacher line-by-line.",
  "parentNote": "2-sentence takeaway summary for parents when picking up their child."
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        res.json(JSON.parse(response.text || "{}"));
      } catch (geminiError) {
        console.warn("Gemini API error in lesson plan, returning structured fallback:", geminiError);
        res.json(getFallbackSundaySchoolLesson(topicText, targetAge, duration));
      }
    } catch (error: any) {
      console.error("Error in /api/ai/sunday-school-lesson:", error);
      res.status(500).json({ error: "Failed to generate lesson plan" });
    }
  });

  // AI Daily Prayer Prompt Endpoint
  app.post("/api/ai/daily-prayer-prompt", async (req, res) => {
    try {
      const { category, userFocus } = req.body;
      const ai = getGenAI();

      const chosenCategory = category || "Gratitude & Peace";

      if (!ai) {
        return res.json(getFallbackDailyPrayerPrompt(chosenCategory));
      }

      const prompt = `You are a compassionate Christian pastor and prayer leader.
Generate an inspiring, fresh Daily Prayer Prompt for a believer to start their quiet time today.
Category / Focus: "${chosenCategory}"
User Focus: "${userFocus || 'General daily prayer starter'}"

Return JSON format:
{
  "theme": "Inspiring Title (e.g. Resting in Unshakable Peace)",
  "category": "${chosenCategory}",
  "scriptureAnchor": {
    "reference": "Book Chapter:Verse",
    "text": "Scripture passage text that anchors this prayer prompt"
  },
  "prayerStarter": "A warm, 3-4 sentence open-ended prayer starter written in first person ('Heavenly Father, as I enter this moment of quiet...').",
  "guidedPoints": [
    "Pause & Thank: Name 2 specific ways God showed up for you recently.",
    "Surrender & Rest: Cast any anxiety, fear, or pressing deadline into His capable hands.",
    "Intercede: Pray for a family member, friend, or neighbor needing encouragement today."
  ]
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });

        res.json(JSON.parse(response.text || "{}"));
      } catch (geminiError) {
        console.warn("Gemini API error in prayer prompt, returning fallback:", geminiError);
        res.json(getFallbackDailyPrayerPrompt(chosenCategory));
      }
    } catch (error: any) {
      console.error("Error in /api/ai/daily-prayer-prompt:", error);
      res.status(500).json({ error: "Failed to generate daily prayer prompt" });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FaithPath AI Server running on http://0.0.0.0:${PORT}`);
  });
}

function getFallbackVerse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("anxiety") || q.includes("peace") || q.includes("worry")) {
    return "Philippians 4:6-7 — Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God.";
  }
  if (q.includes("love") || q.includes("grace")) {
    return "1 John 4:19 — We love because He first loved us.";
  }
  if (q.includes("strength") || q.includes("hard") || q.includes("help")) {
    return "Isaiah 41:10 — Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you.";
  }
  return "Romans 8:28 — And we know that in all things God works for the good of those who love Him, who have been called according to His purpose.";
}

function getFallbackSundaySchoolLesson(topic: string, ageGroup: string, durationMinutes: number) {
  return {
    title: `Giant Faith: Understanding ${topic || 'David & Goliath'}`,
    passage: "1 Samuel 17:32-50",
    ageGroup: ageGroup || "Early Elementary (6-8)",
    durationMinutes: durationMinutes || 30,
    bigIdea: "God is bigger than any giant problem or fear we ever face!",
    memoryVerse: {
      reference: "1 Samuel 17:47",
      text: "The battle is the LORD's.",
      gestureOrTip: "Clap hands twice on 'battle' and point up to the sky on 'LORD's'!"
    },
    materialsNeeded: [
      "5 smooth stones or paper cutouts",
      "Crayons or markers",
      "Construction paper",
      "Tape or glue",
      "Bibles"
    ],
    icebreaker: {
      title: "Giant Steps Game",
      instructions: "Line kids up against the wall. Ask simple Bible questions. When answered correctly, kids take 1 'Giant Step' forward. First to reach the teacher wins!",
      duration: "5 mins"
    },
    storyScript: {
      summary: "Long ago, a young shepherd boy named David visited his brothers on a battlefield. A huge 9-foot giant named Goliath was shouting scares at God's army. While everyone else was terrified, David remembered how God helped him protect his sheep from lions and bears! With just a sling and 5 smooth stones, David trusted God completely. God gave David victory, proving that no problem is too big for our Almighty Father.",
      keyTalkingPoints: [
        "David was small, but his trust in God was huge.",
        "Goliath tried to scare people, but God is always stronger than fear.",
        "When we face hard days, we can pray and ask God for courage."
      ]
    },
    discussionQuestions: [
      {
        question: "What are some 'giants' (fears or hard things) that kids face today?",
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
      title: "5 Smooth Stones Courage Craft",
      description: "Give each child 5 paper stone cutouts. On each stone, have them write or draw 1 thing God helps them with (Family, Friends, School, Courage, Peace). Glue them onto a paper shield.",
      materials: ["Paper stone cutouts", "Paper shields", "Glue sticks", "Markers"]
    },
    closingPrayer: "Dear Lord Jesus, thank You that You are bigger and stronger than any giant fear in my life. Help me to trust You every day and step out in faith. Amen!",
    parentNote: "Today in Sunday School, your child learned about David & Goliath (1 Samuel 17) and how God gives us courage. Ask your child to share their 5 Smooth Stones craft with you!"
  };
}

function getFallbackDailyPrayerPrompt(category: string) {
  const prompts: Record<string, any> = {
    'Gratitude & Peace': {
      theme: "Anchoring Your Heart in Quiet Gratitude",
      category: "Gratitude & Peace",
      scriptureAnchor: {
        reference: "Philippians 4:6-7",
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and minds in Christ Jesus."
      },
      prayerStarter: "Heavenly Father, as I enter this moment of quiet fellowship with You today, I pause to breathe in Your unshakeable peace. When my mind feels pulled toward stress or rushing, remind me that You are in complete control of every detail of my life...",
      guidedPoints: [
        "Pause & Praise: Name 3 specific blessings God provided for you this week.",
        "Surrender Anxiety: Name one pressing worry and consciously release it into God's hands.",
        "Seek Wisdom: Ask for gentleness and clarity in your interactions today."
      ]
    },
    'Strength & Courage': {
      theme: "Stepping Forward in Divine Courage",
      category: "Strength & Courage",
      scriptureAnchor: {
        reference: "Isaiah 41:10",
        text: "Fear not, for I am with you; be not dismayed, for I am your God. I will strengthen you, yes, I will help you, I will uphold you with My righteous right hand."
      },
      prayerStarter: "Lord God, You are my fortress and my strength. When challenges feel intimidating or heavy today, help me remember that I do not walk alone. Fill my spirit with boldness, patience, and confidence in Your promise...",
      guidedPoints: [
        "Acknowledge Weakness: Tell God where you feel exhausted or uncertain.",
        "Claim His Strength: Pray for perseverance and courage to face today's tasks.",
        "Intercede for Others: Pray for someone in your family or community needing spiritual strength."
      ]
    },
    'Guidance & Wisdom': {
      theme: "Seeking the Holy Spirit's Direction",
      category: "Guidance & Wisdom",
      scriptureAnchor: {
        reference: "Proverbs 3:5-6",
        text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight."
      },
      prayerStarter: "Father in Heaven, I yield my plans and decisions to Your divine wisdom today. Grant me spiritual discernment to hear Your soft voice guiding my steps, and give me a willing heart to follow where You lead...",
      guidedPoints: [
        "Submit Decisions: Present a specific choice or direction to the Lord.",
        "Ask for Discernment: Pray for eyes to see opportunities to love and serve others.",
        "Walk in Obedience: Ask for a quiet heart that trusts God's perfect timing."
      ]
    },
    'Family & Healing': {
      theme: "Covering Loved Ones in God's Grace",
      category: "Family & Healing",
      scriptureAnchor: {
        reference: "Psalm 103:2-3",
        text: "Praise the LORD, my soul, and forget not all His benefits—who forgives all your sins and heals all your diseases."
      },
      prayerStarter: "Dear Jesus, I bring my family, friends, and loved ones before Your throne of grace today. You are Jehovah Rapha, the Lord who heals and restores. Cover our home with Your protection and fill our hearts with unity...",
      guidedPoints: [
        "Pray for Healing: Lift up anyone facing physical, emotional, or spiritual pain.",
        "Forgive & Reconcile: Ask God for grace to forgive and bring restoration in relationships.",
        "Protective Shield: Pray for God's angels to guard your home and community."
      ]
    }
  };

  return prompts[category] || prompts['Gratitude & Peace'];
}

startServer();
