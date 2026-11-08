#!/bin/bash
# QuizAnki Project Setup and Launch Script

echo "🚀 QuizAnki - Language Learning Application"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check MongoDB
echo -e "${BLUE}Checking MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not found locally${NC}"
    echo -e "${YELLOW}  Using MongoDB Atlas? Set MONGODB_URI in backend/.env${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Setup backend
echo -e "${BLUE}Setting up backend...${NC}"
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠ Created backend/.env - please configure MongoDB URI${NC}"
fi

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Configure MongoDB URI in backend/.env"
echo "2. Start backend: ${YELLOW}cd backend && npm run dev${NC}"
echo "3. Start frontend (new terminal): ${YELLOW}cd frontend && npm start${NC}"
echo "4. Visit: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- Quick Start: ${YELLOW}QUICK-START.md${NC}"
echo "- Full Setup: ${YELLOW}SETUP.md${NC}"
echo "- API Testing: ${YELLOW}QuizAnki-API.postman_collection.json${NC}"
echo ""
