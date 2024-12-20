# Reaper's Whispers

A multiplayer word maze game where players navigate through a mysterious maze, solving word puzzles and competing against each other.

## Live Demo

Frontend: [https://reapers-whispers.netlify.app](https://reapers-whispers.netlify.app)
Backend: [https://reapers-whispers-backend.onrender.com](https://reapers-whispers-backend.onrender.com)

## Features

- Real-time multiplayer gameplay
- Dynamic word puzzle generation
- Player moderation (kick, ban, mute)
- Chat system
- Power-ups and sabotages

## Tech Stack

- Frontend: React, Material-UI, Socket.IO Client
- Backend: Node.js, Express, Socket.IO
- Deployment: Netlify (Frontend), Render (Backend)

## Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reapers-whispers.git
cd reapers-whispers
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

3. Create .env files:
```bash
# Frontend (.env)
REACT_APP_SERVER_URL=http://localhost:4001

# Backend (.env)
PORT=4001
CLIENT_URL=http://localhost:3000
```

4. Start the development servers:
```bash
# Start frontend
npm start

# Start backend
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License
