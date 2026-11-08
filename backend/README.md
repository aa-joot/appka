# Backend

Backend API server built with Express.js and MongoDB.

## Features
- JWT authentication
- RESTful API for word management
- Spaced repetition algorithm
- User statistics and progress tracking
- Word import from text files

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Run development server: `npm run dev`

Server runs on `http://localhost:5000`

## Environment Variables
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NODE_ENV` - Environment (development/production)
