# 🧠 Visualize.AI

> An AI-powered multimodal learning assistant that understands real-world images and teaches users how things work, how to fix them, and how to improve them through interactive visual reasoning.

![Visualize.AI Banner](https://via.placeholder.com/1200x400/0ea5e9/ffffff?text=Visualize.AI+-+Learn+How+Things+Work)

## 🌟 Features

### 🖼️ Image Understanding
Upload any image of a machine, device, or system. The AI analyzes and identifies all visible components in context.

### 👆 Tap-to-Explain
Click on any part of the image to get focused, detailed explanations about that specific component.

### 💡 What-If Mode
Explore hypothetical scenarios: "What if this component fails?" or "What happens if I skip this step?"

### 📊 Difficulty Slider
Adaptive explanations from Novice to Expert - the same image explained at your level.

### 🧠 Context Memory
Ask follow-up questions without re-uploading. The AI remembers your conversation context.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **AI Model** | Gemini 1.5 Flash Multimodal API |
| **Frontend** | React 18 + Tailwind CSS |
| **Image Interaction** | HTML Canvas / SVG Overlays |
| **Backend** | Node.js + Express |
| **State Management** | In-memory Session Store (Redis-ready) |
| **Hosting** | Vercel (Frontend) + Render/Railway (Backend) |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/visualize-ai.git
cd visualize-ai
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install

# Create .env file (optional - defaults to localhost:3001)
cp .env.example .env

# Start the development server
npm start
```

### 4. Open Your Browser

Navigate to `http://localhost:3000` and start exploring!

## 📁 Project Structure

```
visualize.ai/
├── frontend/                 # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js         # App header
│   │   │   ├── ImageUploader.js  # Drag & drop upload
│   │   │   ├── ImageCanvas.js    # Interactive canvas
│   │   │   ├── ChatPanel.js      # AI chat interface
│   │   │   ├── DifficultySlider.js
│   │   │   └── WhatIfMode.js
│   │   ├── services/
│   │   │   └── api.js           # Backend API calls
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                  # Express Backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── analyze.js       # Image upload & analysis
│   │   │   ├── ask.js           # Follow-up questions
│   │   │   └── session.js       # Session management
│   │   ├── services/
│   │   │   ├── gemini.js        # Gemini API integration
│   │   │   └── sessionStore.js  # In-memory session store
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🎯 Use Cases

| Use Case | Description |
|----------|-------------|
| 📚 **Visual Learning** | Understand how real-world objects work by tapping on parts |
| 🔧 **DIY & Repair** | Diagnose issues and learn how to fix appliances visually |
| 🎓 **Skill Training** | Interactive onboarding for students, technicians, engineers |
| 📖 **Education** | Multi-level explanations from the same real-world image |
| ♿ **Accessibility** | Learn complex systems without manuals |
| 🤔 **Problem Solving** | Ask "What if?" questions to explore cause-and-effect |

## 🔧 API Endpoints

### POST `/api/analyze`
Upload and analyze an image.

**Request:** `multipart/form-data`
- `image`: Image file (JPEG, PNG, WebP, GIF)
- `difficulty`: String (Novice, Beginner, Intermediate, Advanced, Expert)

**Response:**
```json
{
  "sessionId": "uuid",
  "analysis": "AI analysis text...",
  "components": [{"name": "Component", "x": 50, "y": 30}]
}
```

### POST `/api/ask`
Ask a follow-up question.

**Request:**
```json
{
  "sessionId": "uuid",
  "question": "How does this work?",
  "tapPoint": {"x": 50, "y": 30},
  "difficulty": "Beginner"
}
```

### POST `/api/what-if`
Ask a hypothetical question.

**Request:**
```json
{
  "sessionId": "uuid",
  "scenario": "What if this component fails?",
  "difficulty": "Beginner"
}
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel
vercel --prod
```

### Backend (Render/Railway)

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `GEMINI_API_KEY`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

Built for [Hackathon Name] - an AI-powered multimodal learning assistant that transforms how people understand and interact with the physical world.

---

<p align="center">
  Made with ❤️ and AI
  <br>
  <a href="https://devpost.com">View on Devpost</a>
</p>
