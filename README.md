# QuizAnki - Language Learning with Spaced Repetition

A full-stack application combining Quizlet's beautiful UI with Anki's powerful spaced repetition algorithm.

## Features

✨ **Core Features**
- 📚 Import words from text files (format: word - translation)
- 🎴 Multiple learning modes:
  - Flip cards (classic flashcard)
  - Typing mode (type the correct translation)
  - Multiple choice (4 random options, 1 correct)
- 🔁 Spaced repetition using SM-2 algorithm
- 📊 Learning statistics and progress tracking
- 💾 Learn on web and mobile (iPhone compatible)
- 🔔 Push notifications for review reminders

## Project Structure

```
appka/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Authentication & utilities
│   │   └── utils/        # Spaced repetition algorithm
│   └── package.json
├── frontend/             # React web application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   └── hooks/        # Custom React hooks
│   └── package.json
├── mobile/               # React Native app
│   ├── src/
│   └── package.json
├── shared/               # Shared types and utilities
└── package.json          # Monorepo configuration
```

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + bcryptjs
- **Notifications:** Node Cron + Email/Push services

### Frontend (Web)
- **Framework:** React 18
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Charts:** Recharts

### Mobile
- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **Notifications:** Expo Notifications
- **State Management:** Zustand

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd appka
npm install
```

2. **Setup backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

3. **Setup frontend (in another terminal):**
```bash
cd frontend
npm install
npm start
```

4. **Setup mobile (in another terminal):**
```bash
cd mobile
npm install
npm run dev  # or npm run ios / npm run android
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Word Sets
- `POST /api/words/sets` - Create word set
- `GET /api/words/sets` - Get user's word sets
- `POST /api/words/sets/:setId/import` - Import words from text
- `GET /api/words/sets/:setId/words` - Get words with learning stats

### Learning
- `GET /api/learning/sets/:setId/review` - Get words to review
- `POST /api/learning/results` - Submit learning result (quality 0-5)

### Statistics
- `GET /api/stats/sets/:setId` - Get set statistics
- `GET /api/stats/user` - Get overall user statistics

## Import Format

Words are imported in the format: `word - translation`

Example:
```
hello - cześć
goodbye - do widzenia
world - świat
thank you - dziękuję
```

## Spaced Repetition Algorithm

This app uses the **SM-2 algorithm** popularized by Anki:

- Each word has an `easeFactor` (difficulty multiplier)
- Review intervals increase with correct answers
- Incorrect answers reset the interval
- `nextReview` date is automatically calculated
- Status changes: new → learning → learned

## Statistics Tracked

- Total words in each set
- Words learned (permanent mastery)
- Words in learning phase
- New words not yet reviewed
- Overall accuracy percentage
- Words reviewed today
- Correct/incorrect answer counts

## Notifications

- Push notifications remind users when words are due for review
- Email notifications optional
- Mobile app uses Expo Notifications for iOS/Android

## Development

### Run all services:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Run tests:
```bash
npm test
```

## Deployment

### Backend (Heroku/Railway)
```bash
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Mobile (EAS)
```bash
eas build --platform all
```

## Future Enhancements

- 🎤 Audio pronunciation
- 🌐 Multiple language pairs
- 📝 Notes and examples per word
- 👥 Study groups and sharing
- 🏆 Gamification and streaks
- 📱 Offline sync capabilities
- 🎨 Custom themes

## License

MIT

## Support

For issues and feature requests, please open an issue in the repository.
