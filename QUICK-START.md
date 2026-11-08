# 🎯 QuizAnki - Quick Reference Guide

## 📁 Project Structure

```
appka/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   └── tasks.json                 # VS Code development tasks
├── backend/                        # Node.js API server
│   ├── src/
│   │   ├── models/                # MongoDB schemas
│   │   ├── routes/                # REST API endpoints
│   │   ├── middleware/            # Auth & utilities
│   │   ├── utils/                 # Helper functions
│   │   └── index.js               # Server entry point
│   ├── .env.example               # Environment template
│   └── package.json
├── frontend/                       # React web app
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
├── mobile/                         # React Native app
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── app.json                   # Expo config
│   └── package.json
├── shared/                         # Shared utilities
│   └── src/
│       └── constants.js
├── README.md                       # Main documentation
├── SETUP.md                        # Setup instructions
└── QuizAnki-API.postman_collection.json

```

## 🚀 Getting Started (5 minutes)

### 1. Install Dependencies
```bash
cd c:\Users\aljach\appka
npm install
```

### 2. Setup MongoDB
- **Option A:** Local MongoDB
  ```bash
  mongod
  ```
- **Option B:** MongoDB Atlas (cloud)
  - Create account at mongodb.com/cloud/atlas
  - Create free cluster
  - Get connection string

### 3. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 4. Start Backend
```bash
npm run dev
# Runs on http://localhost:5000
```

### 5. Start Frontend (new terminal)
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### 6. Test Login
- Register: Create account with email/password
- Login: Use credentials to login
- Dashboard: See stats dashboard

## 🔑 Key Features

### 📚 Word Management
- Import words from text files
- Format: `word - translation` (one per line)
- Organize into word sets
- Track learning progress

### 🎴 Learning Modes
1. **Flip Card** - Classic flashcard
2. **Typing** - Type the translation
3. **Multiple Choice** - Pick from 4 options

### 🧠 Spaced Repetition (SM-2)
- Automatic review scheduling
- Difficulty factor adjustment
- Interval calculation
- Status: new → learning → learned

### 📊 Statistics
- Total words learned
- Accuracy percentage
- Words reviewed today
- Progress per word set

## 💻 Development Commands

### Root Level
```bash
npm install      # Install all dependencies
npm run dev      # Run all dev servers
npm run build    # Build all apps
npm start        # Start backend only
```

### Backend
```bash
cd backend
npm run dev      # Dev server with hot reload
npm start        # Production server
```

### Frontend
```bash
cd frontend
npm start        # Dev server with React
npm run build    # Production build
```

### Mobile
```bash
cd mobile
npm run dev      # Expo dev server
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## 🔌 API Endpoints Quick Reference

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (returns token)

### Words
- `POST /api/words/sets` - Create word set
- `GET /api/words/sets` - List word sets
- `POST /api/words/sets/{id}/import` - Import words
- `GET /api/words/sets/{id}/words` - Get words with stats

### Learning
- `GET /api/learning/sets/{id}/review` - Get words to review
- `POST /api/learning/results` - Submit result (quality 0-5)

### Stats
- `GET /api/stats/sets/{id}` - Set statistics
- `GET /api/stats/user` - Overall user statistics

### Notifications
- `GET /api/notifications/preferences` - Get settings
- `PUT /api/notifications/preferences` - Update settings

## 🧪 Quick Test Workflow

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123"}'

# Save the returned token
TOKEN="your_token_here"
```

### 2. Create & Import Words
```bash
# Create set
curl -X POST http://localhost:5000/api/words/sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Spanish","description":"Basic Spanish"}'

# Save the returned SET_ID
SET_ID="your_set_id_here"

# Import words
curl -X POST http://localhost:5000/api/words/sets/$SET_ID/import \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"hello - hola\ngoodbye - adiós"}'
```

### 3. Review & Submit Results
```bash
# Get words to review
curl http://localhost:5000/api/learning/sets/$SET_ID/review \
  -H "Authorization: Bearer $TOKEN"

# Submit result (quality 0-5)
curl -X POST http://localhost:5000/api/learning/results \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"historyId":"history_id","quality":5,"mode":"typing"}'
```

## 📱 Mobile App

### Setup for iOS
```bash
cd mobile
npm install
npm run ios
```

### Setup for Android
```bash
cd mobile
npm install
npm run android
```

### Build for Distribution
```bash
eas build --platform all
eas submit
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check `.env` URI, ensure MongoDB is running |
| Port 5000 in use | Change `PORT` in `.env` |
| Dependencies fail | `npm cache clean --force` then `npm install` |
| Frontend won't start | Delete `node_modules`, reinstall |
| Cannot import modules | Check file paths and import statements |

## 📦 Dependencies Overview

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `node-cron` - Scheduled notifications

### Frontend
- `react` - UI framework
- `react-router-dom` - Navigation
- `axios` - HTTP client
- `tailwindcss` - Styling
- `recharts` - Charts/graphs

### Mobile
- `react-native` - Mobile framework
- `expo` - Development platform
- `expo-notifications` - Push notifications
- `@react-navigation` - Navigation

## 🎓 Learning Resources

- [Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)
- [SM-2 Algorithm](https://www.super-memory.com/english/ol/2011/16.html)
- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Native Docs](https://reactnative.dev/)

## 📝 Environment Variables (.env)

```env
PORT=5000                                              # Server port
MONGODB_URI=mongodb://localhost:27017/quizlet-anki    # Database
JWT_SECRET=your-secret-key                            # Auth secret
NODE_ENV=development                                  # Environment
```

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Configure MongoDB
3. ✅ Start backend & frontend
4. ✅ Create account & login
5. ⏳ Import words and start learning
6. ⏳ Deploy to production
7. ⏳ Add notification system
8. ⏳ Build mobile app

---

**Last Updated:** March 30, 2026
**Status:** Core features implemented, ready for deployment
