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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents.join("\n"),
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "May the peace of Christ be with you today as you seek His truth.";
      
      // Extract verse references in brackets
      const verseMatches = replyText.match(/\[([1-3]?\s?[A-Za-z]+\s+\d+:\d+(?:-\d+)?)\]/g) || [];
      const scriptureReferences = verseMatches.map(v => v.replace(/[\[\]]/g, ''));

      res.json({
        reply: replyText,
        scriptureReferences,
      });
    } catch (error: any) {
      console.error("Error in /api/ai/chat:", error);
      res.status(500).json({
        error: "Failed to process AI chat query",
        details: error.message || String(error),
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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      res.json(JSON.parse(response.text || "{}"));
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

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Error in /api/ai/sermon-summary:", error);
      res.status(500).json({ error: "Failed to summarize sermon" });
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

startServer();
