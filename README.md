# FaithPath AI

A modern, faith-based Christian mobile application that combines biblical wisdom with AI-powered spiritual guidance.

## 🙏 Overview

**FaithPath AI** is your personal Christian AI spiritual companion designed to deepen your faith journey through:

- **AI-Powered Bible Study** - Ask FaithPath AI any biblical question and receive scripture-grounded responses with relevant passages
- **Daily Devotionals** - Personalized daily devotions based on your mood and spiritual interests
- **Prayer Journal** - Document your prayers, track answered prayers, and build a record of God's faithfulness
- **Prayer Circles** - Connect with community for intercessory prayer and spiritual accountability
- **Bible Study Plans** - AI-generated or pre-built reading plans tailored to your spiritual goals
- **Sermon Summarizer** - Capture key insights from sermons and apply them to your daily life
- **Multiple Bible Translations** - Study Scripture in NIV, KJV, ESV, or WEB translations
- **Offline Bible Access** - Study God's Word even without internet connection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Google Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/treesbri-design/Treeswayin-.git
cd Treeswayin-

# Install dependencies
npm install
# or
bun install

# Create environment file
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📋 Features

### Core Features ✅
- **Bible Study** - Browse, search, highlight, and save verses across multiple translations
- **AI Chat** - Talk to FaithPath AI about Scripture, theology, and spiritual questions
- **Prayer Journal** - Create, categorize, and track your prayers with mood tracking
- **Reading Plans** - Follow structured Bible reading plans or create custom AI-generated plans
- **Daily Devotionals** - Receive daily inspirational messages grounded in Scripture
- **Streak Tracking** - Build consistent spiritual habits with daily engagement streaks
- **User Profiles** - Track your spiritual progress and preferences

### Premium Features 🌟
- **Sermon Summarizer** - Summarize sermon notes into actionable insights
- **AI Study Plans** - Generate custom Bible study plans based on your goals
- **Prayer Analytics** - Visualize your prayer patterns and answered prayers
- **Prayer Circles** - Create or join prayer circles for community intercession
- **Community Prayer Wall** - Share prayer requests and pray for others anonymously
- **Bible Quiz** - Test your biblical knowledge and learn

### Technical Features
- **Offline Bible** - Download and access Bible offline
- **Service Worker** - PWA support for app-like experience
- **Mobile-Optimized** - Fully responsive design with phone frame UI option
- **Local Storage** - All user data persists locally for privacy
- **Real-time Gemini AI** - Powered by Google's latest AI models

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Express.js, Node.js
- **AI**: Google Gemini API (gemini-2.5-flash)
- **Build**: Vite, esbuild
- **Package Manager**: npm/Bun

### Project Structure

```
src/
├── components/          # React components
│   ├── HomeTab.tsx     # Home tab
│   ├── BibleTab.tsx    # Bible browsing & study
│   ├── AiTab.tsx       # AI chat interface
│   ├── PrayerTab.tsx   # Prayer journal & circles
│   ├── ProfileTab.tsx  # User profile & settings
│   └── [Modals]/       # Modal dialogs
├── data/               # Static data & devotionals
├── utils/              # Utility functions
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main app component
└── main.tsx            # React entry point

server.ts              # Express backend server
```

### API Endpoints

#### AI Endpoints
- `POST /api/ai/chat` - Bible study assistant chat
- `POST /api/ai/devotional` - Generate daily devotional
- `POST /api/ai/study-plan` - Create Bible study plan
- `POST /api/ai/sermon-summary` - Summarize sermon notes

#### Health Check
- `GET /api/health` - Server health and AI enablement status

## 🔐 Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
NODE_ENV=production
PORT=3000
```

See `.env.example` for all available configuration options.

## 🎯 User Experience

### Navigation
- **Bottom Tab Bar** - Easy navigation between 5 main sections
- **Mobile Frame** - Optional phone device frame for desktop preview
- **Responsive Design** - Works seamlessly on phones, tablets, and desktops

### Data Persistence
All user data (prayers, saved verses, highlights, reading plans) is stored locally in the browser using localStorage. Your data stays with you and never leaves your device.

## 🧪 Testing

```bash
# Run type checking
npm run lint

# Build for production
npm run build
```

## 📦 Deployment

### Vercel / Netlify
1. Connect your GitHub repository
2. Set environment variables: `GEMINI_API_KEY`
3. Build command: `npm run build`
4. Start command: `npm start`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

### Self-Hosted
1. Build: `npm run build`
2. Deploy `dist/` folder as static files
3. Run `npm start` for backend server

## 🤝 Contributing

We welcome contributions to FaithPath AI! Please ensure:
- Changes preserve existing features
- All TypeScript types are correct
- Code follows the existing style
- Features are thoroughly tested

## 📄 License

This project is based on the Google AI Studio template and enhanced for Christian spiritual guidance.

## 🙌 Support

For issues, questions, or feature requests, please open an issue on GitHub.

## 🎓 Scripture References

> "Your word is a lamp to my feet and a light to my path." - Psalm 119:105

> "Come to me, all you who are weary and burdened, and I will give you rest." - Matthew 11:28

> "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own." - Matthew 6:34

---

**FaithPath AI** - *Seeking God's wisdom, one verse at a time* 🙏
