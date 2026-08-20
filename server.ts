import express from "express";
import path from "path";
import fs from "fs";
import JSZip from "jszip";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory cache to prevent burning API quota on repeated widget loads
  const prayerPromptCache = new Map<string, { data: any; expiresAt: number }>();
  const devotionalCache = new Map<string, { data: any; expiresAt: number }>();

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

  // Serve real binary PNG icons & screenshots with explicit image/png Content-Type
  const publicDir = path.join(process.cwd(), "public");

  // Manifest endpoint with proper application/manifest+json MIME type & CORS
  app.get(["/manifest.json", "/manifest.webmanifest"], (_req, res) => {
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.sendFile(path.join(publicDir, "manifest.json"));
  });

  // Digital Asset Links for Android TWA verification (removes browser URL bar)
  app.get(["/.well-known/assetlinks.json", "/.well-known/assetlinks"], (_req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=3600");
    const assetlinksFile = path.join(publicDir, ".well-known", "assetlinks.json");
    if (fs.existsSync(assetlinksFile)) {
      res.sendFile(assetlinksFile);
    } else {
      res.json([
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: "com.faithconnectapp.live",
            sha256_cert_fingerprints: [
              "AB:63:68:9D:76:40:F9:F3:AE:B3:1F:AF:E0:8F:FC:65:E7:0D:A8:92:48:04:D1:B8:79:0E:6C:9A:90:C7:42:E3"
            ]
          }
        }
      ]);
    }
  });

  // Service worker endpoint with correct application/javascript and Service-Worker-Allowed header
  app.get(["/sw.js", "/service-worker.js"], (_req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.join(publicDir, "sw.js"));
  });

  // Permissive CORS and asset headers for all public and image routes
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    next();
  });

  // Serve static files from /public with proper headers
  app.use(express.static(publicDir, {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      if (filePath.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (filePath.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      } else if (filePath.endsWith(".json") || filePath.endsWith(".webmanifest")) {
        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      }
    }
  }));

  // Explicit handlers for icons & screenshots with cross-origin headers
  app.get([
    "/favicon-192x192.png", 
    "/favicon-512x512.png", 
    "/icon-192.png", 
    "/icon-512.png",
    "/screenshot-1.png",
    "/screenshot-2.png",
    "/screenshot-3.png",
    "/screenshot-4.png"
  ], (req, res) => {
    const filename = path.basename(req.path);
    const filePath = path.join(publicDir, filename);
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(filePath);
  });

  // Dynamic PWA Screenshots for Google Play / PWABuilder App Store Listing
  app.get("/screenshots/:name", (req, res) => {
    const { name } = req.params;
    let title = "FaithPath AI - Bible & Prayer";
    let subtitle = "Grow closer to God every day";
    let badge = "HOME & DEVOTIONALS";
    let color1 = "#0d4c73";
    let color2 = "#1E3A8A";

    if (name.includes("1") || name.includes("home")) {
      title = "Daily Verse & Spiritual Community";
      subtitle = "Encouraging scripture, community fellowship & prayer wall";
      badge = "SCREENSHOT 1 • HOME";
    } else if (name.includes("2") || name.includes("prayer") || name.includes("journal")) {
      title = "Prayer Journal & Analytics";
      subtitle = "Track answered prayers, active requests & monthly growth";
      badge = "SCREENSHOT 2 • PRAYER JOURNAL";
      color1 = "#1E3A8A";
      color2 = "#064e3b";
    } else if (name.includes("3") || name.includes("bible") || name.includes("reader")) {
      title = "Multi-Language Bible Reader";
      subtitle = "NIV, KJV, ESV, WEB, Spanish RVR1960, Portuguese ARC & more";
      badge = "SCREENSHOT 3 • SCRIPTURE READER";
      color1 = "#0f172a";
      color2 = "#1e293b";
    } else if (name.includes("4") || name.includes("ai") || name.includes("lessons")) {
      title = "FaithAI Spiritual Guide & Lessons";
      subtitle = "Biblical commentary, Sunday school curricula & audio prayers";
      badge = "SCREENSHOT 4 • FAITH AI & LESSONS";
      color1 = "#1e1b4b";
      color2 = "#312e81";
    }

    const svgScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="60%" stop-color="${color2}"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
        <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#D4AF37"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="1080" height="1920" fill="url(#bgGrad)"/>
      
      <!-- Top App Bar -->
      <rect x="60" y="80" width="960" height="110" rx="32" fill="white" fill-opacity="0.1" stroke="white" stroke-opacity="0.2"/>
      <text x="120" y="150" fill="#D4AF37" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900">✝ FaithPath AI</text>
      <rect x="760" y="105" width="220" height="60" rx="20" fill="#F59E0B" fill-opacity="0.2"/>
      <text x="800" y="146" fill="#FDE68A" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">🔥 7d Streak</text>

      <!-- Badge -->
      <rect x="60" y="240" width="520" height="60" rx="30" fill="white" fill-opacity="0.15" stroke="white" stroke-opacity="0.3"/>
      <text x="90" y="280" fill="#FDE68A" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" letter-spacing="2">${badge}</text>

      <!-- Main Headline -->
      <text x="60" y="380" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900">${title}</text>
      <text x="60" y="445" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="500">${subtitle}</text>

      <!-- Hero Card Representation -->
      <rect x="60" y="520" width="960" height="1240" rx="48" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="4"/>
      
      <!-- Inner Card Top -->
      <rect x="110" y="580" width="860" height="320" rx="36" fill="#1E3A8A"/>
      <text x="160" y="660" fill="#D4AF37" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="bold" letter-spacing="2">VERSE OF THE DAY</text>
      <text x="160" y="730" fill="white" font-family="Georgia, serif" font-size="36" font-style="italic">"And we know that in all things God works</text>
      <text x="160" y="780" fill="white" font-family="Georgia, serif" font-size="36" font-style="italic">for the good of those who love Him..."</text>
      <text x="160" y="850" fill="#93C5FD" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">— Romans 8:28 (NIV / RVR1960 / ARC / LSG / LUT)</text>

      <!-- Feature Blocks -->
      <rect x="110" y="940" width="410" height="340" rx="32" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="3"/>
      <text x="150" y="1010" fill="#166534" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900">✓ Answered Prayers</text>
      <text x="150" y="1120" fill="#15803D" font-family="system-ui, -apple-system, sans-serif" font-size="84" font-weight="900">50%</text>
      <text x="150" y="1220" fill="#166534" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">Fulfillment Rate Tracked</text>

      <rect x="560" y="940" width="410" height="340" rx="32" fill="#FEF3C7" stroke="#FDE68A" stroke-width="3"/>
      <text x="600" y="1010" fill="#92400E" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900">🎧 Audio Narrator</text>
      <text x="600" y="1120" fill="#B45309" font-family="system-ui, -apple-system, sans-serif" font-size="84" font-weight="900">TTS</text>
      <text x="600" y="1220" fill="#92400E" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="bold">Voice Narration & Chants</text>

      <!-- Bottom Scripture Box -->
      <rect x="110" y="1320" width="860" height="380" rx="36" fill="white" stroke="#E2E8F0" stroke-width="3"/>
      <text x="160" y="1400" fill="#1E3A8A" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold">📖 Multi-Language Holy Bible</text>
      <text x="160" y="1460" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="26">Read Scripture in English, Spanish (Reina-Valera 1960),</text>
      <text x="160" y="1505" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="26">Portuguese (ARC), French (LSG), and German (Lutherbibel).</text>
      <rect x="160" y="1560" width="300" height="80" rx="24" fill="#1E3A8A"/>
      <text x="210" y="1610" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">Read Chapter →</text>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svgScreenshot);
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
      const chosenCategory = category || "Gratitude & Peace";
      const cacheKey = `${chosenCategory}_${userFocus || 'default'}`;

      // Check cache (1-hour cache per category to conserve API quota)
      const cached = prayerPromptCache.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return res.json(cached.data);
      }

      const ai = getGenAI();

      if (!ai) {
        const fallback = getFallbackDailyPrayerPrompt(chosenCategory);
        prayerPromptCache.set(cacheKey, { data: fallback, expiresAt: Date.now() + 3600000 });
        return res.json(fallback);
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

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.theme && parsed.prayerStarter) {
          prayerPromptCache.set(cacheKey, { data: parsed, expiresAt: Date.now() + 3600000 });
          return res.json(parsed);
        }
        throw new Error("Invalid format from model");
      } catch (geminiError) {
        // Gracefully return rich pastor-curated daily prompt on quota or API rate limits
        const fallback = getFallbackDailyPrayerPrompt(chosenCategory);
        prayerPromptCache.set(cacheKey, { data: fallback, expiresAt: Date.now() + 600000 });
        res.json(fallback);
      }
    } catch (error: any) {
      console.error("Error in /api/ai/daily-prayer-prompt:", error);
      res.json(getFallbackDailyPrayerPrompt("Gratitude & Peace"));
    }
  });

  // Dedicated Privacy Policy Route (compliant with Google Play Developer Policy)
  app.get(["/privacy", "/privacy-policy", "/privacy.html"], (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - FaithConnect</title>
  <meta name="description" content="Privacy Policy for FaithConnect Christian Mobile & Web Application. Learn how we protect your personal faith data and prayers.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="icon" href="/favicon-192x192.png" type="image/png">
</head>
<body class="bg-slate-50 text-slate-800 antialiased font-sans min-h-screen py-10 px-4 sm:px-6">
  <div class="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
    
    <!-- Hero Header -->
    <div class="bg-gradient-to-r from-[#0d4c73] to-[#082f49] p-8 text-white">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <svg class="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p class="text-xs text-blue-200 uppercase tracking-widest font-bold">FaithConnect Application</p>
        </div>
      </div>
      <p class="text-sm text-slate-200 leading-relaxed">
        Last Revised: <strong>August 19, 2026</strong>. Your spiritual reflections, prayers, and personal faith notes are sacred to us. We are committed to protecting your privacy.
      </p>
    </div>

    <!-- Content Sections -->
    <div class="p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
      <section>
        <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">1. Information We Collect</h2>
        <p class="mb-2"><strong>Account & Profile Information:</strong> When you register or sign in, we collect your name and email address to preserve your Bible study streaks, saved verses, and reading plans.</p>
        <p class="mb-2"><strong>User Generated Spiritual Content:</strong> We store your personal prayer entries, prayer requests, highlighted scriptures, and journal reflections solely to display them within your personal account.</p>
        <p><strong>Anonymous Device Data:</strong> We may collect non-identifiable diagnostics (such as app crash logs and device type) to ensure stability across Android and web browsers.</p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">2. How We Use Your Information</h2>
        <ul class="list-disc pl-5 space-y-2">
          <li>To personalize your daily devotional schedule and synchronize Bible reading plans.</li>
          <li>To power server-side AI study assistants and provide contextual scripture explanations.</li>
          <li>To deliver push notifications for your daily verse and prayer reminders if you enable them.</li>
          <li>We <strong>NEVER</strong> sell or rent your personal information to third-party advertisers.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">3. AI Assistant & Chat Privacy</h2>
        <p>
          FaithConnect features an AI-powered Bible study assistant powered by Google Gemini via secure server-side proxy. Your prayer journal entries and notes are not used to train public generative AI models without your consent.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">4. Data Ownership & Deletion</h2>
        <p>
          You retain complete ownership of your data. You may export a full backup of your notes and prayers at any time via the Profile screen, or request full account deletion by emailing our privacy team or using the in-app Reset Cache tool.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">5. Contact Information</h2>
        <p>If you have any questions about this Privacy Policy or how your data is handled, please contact:</p>
        <div class="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm">
          <p class="font-bold text-slate-900">FaithConnect Support Team</p>
          <p class="text-slate-600">Email: <a href="mailto:support@faithconnect.app" class="text-[#0d4c73] font-semibold underline">support@faithconnect.app</a></p>
          <p class="text-slate-500 mt-1">Website: <a href="/" class="text-[#0d4c73] underline">https://ais-pre-xgy7vrppv6jcgzzx5irpdk-387736714323.us-west2.run.app</a></p>
        </div>
      </section>

      <div class="pt-6 border-t border-slate-200 text-center">
        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-[#0d4c73] hover:bg-[#082f49] text-white font-bold rounded-2xl shadow-md transition-all text-sm">
          ← Return to FaithConnect App
        </a>
      </div>
    </div>
  </div>
</body>
</html>`);
  });

  // Downloadable ready-to-build Android TWA Studio & Gradle Project
  app.get(["/api/download-android-project", "/api/download-twa-zip"], async (_req, res) => {
    try {
      const zip = new JSZip();
      const host = "ais-pre-xgy7vrppv6jcgzzx5irpdk-387736714323.us-west2.run.app";
      const pkgName = "com.faithconnectapp.live";

      // 1. Root settings.gradle
      zip.file("settings.gradle", `include ':app'\nrootProject.name = "FaithConnect"\n`);

      // 2. Root build.gradle
      zip.file("build.gradle", `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`);

      // 3. gradle.properties
      zip.file("gradle.properties", `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`);

      // 4. app/build.gradle
      zip.file("app/build.gradle", `plugins {
    id 'com.android.application'
}

android {
    namespace '${pkgName}'
    compileSdk 34

    defaultConfig {
        applicationId "${pkgName}"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders = [
            hostName: "${host}",
            defaultUrl: "https://${host}/?tab=home",
            launcherName: "@string/app_name",
            assetStatements: '[{ "relation": ["delegate_permission/common.handle_all_urls"], "target": {"namespace": "android_app", "package_name": "${pkgName}", "sha256_cert_fingerprints": ["FA:IT:HC:ON:NE:CT:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"]}}]'
        ]
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
`);

      // 5. app/proguard-rules.pro
      zip.file("app/proguard-rules.pro", `# Proguard rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @org.chromium.base.annotations.CalledByNative <methods>;
}
`);

      // 6. app/src/main/AndroidManifest.xml
      zip.file("app/src/main/AndroidManifest.xml", `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkgName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.FaithConnect">

        <meta-data
            android:name="asset_statements"
            android:value="\${assetStatements}" />

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:theme="@style/Theme.FaithConnect"
            android:exported="true">

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="\${defaultUrl}" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="\${hostName}" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`);

      // 7. app/src/main/res/values/strings.xml, colors.xml, styles.xml
      zip.file("app/src/main/res/values/strings.xml", `<resources>
    <string name="app_name">FaithConnect</string>
</resources>
`);

      zip.file("app/src/main/res/values/colors.xml", `<resources>
    <color name="colorPrimary">#0D4C73</color>
    <color name="colorPrimaryDark">#082F49</color>
    <color name="colorAccent">#F59E0B</color>
</resources>
`);

      zip.file("app/src/main/res/values/styles.xml", `<resources>
    <style name="Theme.FaithConnect" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:windowBackground">@color/colorPrimaryDark</item>
        <item name="android:navigationBarColor">@color/colorPrimaryDark</item>
        <item name="android:statusBarColor">@color/colorPrimary</item>
    </style>
</resources>
`);

      // 8. Add app icons
      const iconPath512 = path.join(publicDir, "favicon-512x512.png");
      const iconPath192 = path.join(publicDir, "favicon-192x192.png");

      if (fs.existsSync(iconPath512)) {
        const iconBuf512 = fs.readFileSync(iconPath512);
        zip.file("app/src/main/res/mipmap-xxxhdpi/ic_launcher.png", iconBuf512);
        zip.file("app/src/main/res/mipmap-xxhdpi/ic_launcher.png", iconBuf512);
      }
      if (fs.existsSync(iconPath192)) {
        const iconBuf192 = fs.readFileSync(iconPath192);
        zip.file("app/src/main/res/mipmap-xhdpi/ic_launcher.png", iconBuf192);
        zip.file("app/src/main/res/mipmap-hdpi/ic_launcher.png", iconBuf192);
        zip.file("app/src/main/res/mipmap-mdpi/ic_launcher.png", iconBuf192);
      }

      // 9. twa-manifest.json
      const twaManifest = {
        packageId: pkgName,
        host: host,
        name: "FaithConnect - Bible & Prayer",
        launcherName: "FaithConnect",
        themeColor: "#0D4C73",
        navigationColor: "#082F49",
        backgroundColor: "#0F172A",
        enableNotifications: true,
        startUrl: "/?tab=home",
        iconUrl: `https://${host}/favicon-512x512.png`,
        maskableIconUrl: `https://${host}/favicon-512x512.png`,
        shortcuts: [],
        generatorApp: "bubblewrap-cli",
        webManifestUrl: `https://${host}/manifest.json`,
        fallbackType: "customtabs",
        features: {
          locationDelegation: { enabled: false },
          playBilling: { enabled: false }
        },
        alphaDependencies: { enabled: false }
      };
      zip.file("twa-manifest.json", JSON.stringify(twaManifest, null, 2));

      // 10. assetlinks.json
      const assetlinks = [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: pkgName,
            sha256_cert_fingerprints: [
              "AB:63:68:9D:76:40:F9:F3:AE:B3:1F:AF:E0:8F:FC:65:E7:0D:A8:92:48:04:D1:B8:79:0E:6C:9A:90:C7:42:E3"
            ]
          }
        }
      ];
      zip.file("assetlinks.json", JSON.stringify(assetlinks, null, 2));

      // 11. README Instructions
      zip.file("README.md", `# FaithConnect Android App Project
Package Name: ${pkgName}
Host: https://${host}

## How to Build 'app-release-bundle.aab' for Google Play:

### Option A: Using Command Line (Gradle)
1. Unzip this package.
2. In your terminal, navigate to the unzipped folder.
3. Run:
   \`\`\`bash
   ./gradlew bundleRelease
   \`\`\`
   *(On Windows Command Prompt: \`gradlew.bat bundleRelease\`)*
4. Your Google Play bundle will be created at:
   \`app/build/outputs/bundle/release/app-release.aab\`

### Option B: Using Android Studio (Visual GUI)
1. Open Android Studio.
2. Click **File > Open** and select this unzipped folder.
3. Wait for Gradle sync to finish.
4. Click **Build > Generate Signed Bundle / APK...**
5. Select **Android App Bundle (.aab)** > Next.
6. Choose or create your keystore key and click **Finish**.
7. Upload the generated \`.aab\` bundle to the Google Play Console!
`);

      const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="faithconnect-android-package.zip"');
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(buffer);
    } catch (err: any) {
      console.error("Error generating zip:", err);
      res.status(500).json({ error: "Failed to generate zip package", details: err?.message });
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
