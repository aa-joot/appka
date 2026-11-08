# QuizAnki - Setup & Installation Guide

## 🚀 Quick Start

This is a full-stack monorepo application with:
- **Backend**: Express.js + MongoDB
- **Frontend**: React 18 + Tailwind CSS
- **Mobile**: React Native + Expo (iOS/Android)

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas cloud)
- Git

### Step 1: Install Root Dependencies
```bash
cd c:\Users\aljach\appka
npm install
```

### Step 2: Setup Backend

#### 2a. Create .env file
```bash
cd backend
cp .env.example .env
```

#### 2b. Edit .env
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizlet-anki
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
```

**Note:** If you don't have MongoDB locally, use MongoDB Atlas:
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/quizlet-anki`

#### 2c. Install backend dependencies
```bash
npm install
npm run dev
# Server starts on http://localhost:5000
```

### Step 3: Setup Frontend (in new terminal)

```bash
cd frontend
npm install
npm start
# App starts on http://localhost:3000
```

### Step 4: Setup Mobile (optional, in new terminal)

```bash
cd mobile
npm install
npm run dev
# Expo start menu appears
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app
```

## 📋 Development Workflow

### Using VS Code Tasks

1. **Install all dependencies:**
   - Press `Ctrl+Shift+B` → Select "Install Dependencies"

2. **Start Backend:**
   - Press `Ctrl+Shift+D` → Select "Backend - Dev Server"

3. **Start Frontend:**
   - Open new terminal
   - Press `Ctrl+Shift+D` → Select "Frontend - Dev Server"

4. **Start Mobile:**
   - Open new terminal
   - Press `Ctrl+Shift+D` → Select "Mobile - Dev Server"

### Manual Commands

```bash
# Root directory
npm run dev          # Run all dev servers
npm run build        # Build all apps
npm start            # Start backend only

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start

# Mobile
cd mobile && npm run dev
```

## 🌐 API Endpoints Reference

### Authentication
```bash
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
```

### Word Sets
```bash
POST   /api/words/sets                      # Create set
GET    /api/words/sets                      # Get all sets
POST   /api/words/sets/{id}/import          # Import words
GET    /api/words/sets/{id}/words           # Get words
```

### Learning
```bash
GET    /api/learning/sets/{id}/review       # Get review words
POST   /api/learning/results                # Submit result
```

### Statistics
```bash
GET    /api/stats/sets/{id}                 # Set stats
GET    /api/stats/user                      # User stats
```

## 💾 Database Schema

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  notificationPreferences: { emailNotifications, pushNotifications }
}
```

### WordSet
```javascript
{
  userId: ObjectId,
  name: String,
  description: String,
  language: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Word
```javascript
{
  wordSetId: ObjectId,
  word: String,
  translation: String,
  example: String,
  createdAt: Date
}
```

### LearningHistory
```javascript
{
  userId: ObjectId,
  wordId: ObjectId,
  wordSetId: ObjectId,
  interval: Number,           // days until next review
  easeFactor: Number,         // SM-2 difficulty factor
  repetitions: Number,        // review count
  correct: Number,
  incorrect: Number,
  lastReview: Date,
  nextReview: Date,
  status: 'new' | 'learning' | 'learned'
}
```

## 🧪 Testing the App

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

### 2. Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### 3. Create Word Set
```bash
curl -X POST http://localhost:5000/api/words/sets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Spanish Basics","description":"Basic Spanish words"}'
```

### 4. Import Words
```bash
curl -X POST http://localhost:5000/api/words/sets/SET_ID/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"hello - hola\ngoodbye - adiós"}'
```

## 🚨 Troubleshooting

### MongoDB Connection Error
- ✅ Make sure MongoDB is running locally: `mongod`
- ✅ Or use MongoDB Atlas with correct connection string in .env

### Port Already in Use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rmdir /s node_modules
npm install
```

### React App Won't Start
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📱 Mobile Development

### Run on iOS Simulator
```bash
cd mobile
npm run ios
```

### Run on Android Emulator
```bash
cd mobile
npm run android
```

### Build for Production
```bash
eas build --platform all
```

## 🎯 Feature Implementation Progress

- ✅ Backend API structure
- ✅ Database schemas
- ✅ Authentication (JWT)
- ✅ Spaced repetition algorithm (SM-2)
- ✅ Frontend components
- ⏳ Complete frontend integration
- ⏳ Mobile app implementation
- ⏳ Notification system
- ⏳ Testing & QA
- ⏳ Deployment

## 📚 Next Steps

1. **Test the API** - Use the curl commands above
2. **Customize UI** - Edit React components in `frontend/src`
3. **Add notifications** - Implement email/push notifications
4. **Deploy** - Deploy backend to Heroku/Railway, frontend to Vercel
5. **Mobile build** - Build iOS/Android apps with EAS

## 📖 Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Mobile README](./mobile/README.md)
- [Main README](./README.md)

## 🆘 Support

For issues, check:
1. MongoDB connection
2. Environment variables (.env)
3. Node.js version (16+)
4. Port availability
5. Dependencies installed

Good luck! 🎉
