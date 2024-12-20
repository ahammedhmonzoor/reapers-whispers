import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import styled, { keyframes } from 'styled-components';

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(114, 9, 183, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(114, 9, 183, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(114, 9, 183, 0);
  }
`;

const mazeAnimation = keyframes`
  0% {
    transform: rotate(0deg);
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.1;
  }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, #1a1625 0%, #120f1d 100%);
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.83zM32 0l-9.9 9.9 1.414 1.414L34.828 0H32zM0 0c0 3.314 2.686 6 6 6 3.314 0 6-2.686 6-6h2c0 4.418-3.582 8-8 8-4.418 0-8-3.582-8-8H0zm0 0c0 3.314 2.686 6 6 6 3.314 0 6-2.686 6-6h2c0 4.418-3.582 8-8 8-4.418 0-8-3.582-8-8H0zm24 0h2v2h-2V0zm0 4h2v2h-2V4zm0 4h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-16h2v2h-2V4zm0 8h2v2h-2v-2zm0 8h2v2h-2v-2zm0-4h2v2h-2v-2zm0-8h2v2h-2V8zm8 0h2v2h-2V8zm8 0h2v2h-2V8zm-4 0h2v2h-2V8zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0-8h2v2h-2V4zm0-4h2v2h-2V0zm0 8h2v2h-2V8zm0 8h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-8h2v2h-2v-2zm0 8h2v2h-2v-2z' fill='rgba(114, 9, 183, 0.1)' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    animation: ${mazeAnimation} 240s linear infinite;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 2rem;
  background: rgba(26, 22, 37, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(114, 9, 183, 0.2);
  border-radius: 16px;
`;

const PulseButton = styled(Button)`
  animation: ${pulseAnimation} 2s infinite;
`;

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = () => {
    if (!username) return;
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(\`/lobby/\${gameId}\`);
  };

  const handleJoinGame = () => {
    if (!username || !gameCode) return;
    navigate(\`/lobby/\${gameCode}\`);
  };

  return (
    <>
      <Background />
      <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <StyledPaper elevation={24}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h1" align="center" sx={{ mb: 4, fontSize: '2.5rem' }}>
              Reaper's Whispers
            </Typography>
            
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />

            {isJoining ? (
              <>
                <TextField
                  fullWidth
                  label="Game Code"
                  variant="outlined"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                  sx={{ mb: 2 }}
                />
                <PulseButton
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleJoinGame}
                  disabled={!username || !gameCode}
                >
                  Join Game
                </PulseButton>
              </>
            ) : (
              <PulseButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleCreateGame}
                disabled={!username}
              >
                Create Game
              </PulseButton>
            )}

            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => setIsJoining(!isJoining)}
            >
              {isJoining ? 'Create a New Game Instead' : 'Join Existing Game'}
            </Button>
          </Box>
        </StyledPaper>
      </Container>
    </>
  );
};

export default Login;
