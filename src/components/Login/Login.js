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

const StyledPaper = styled(Paper)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background-color: rgba(18, 15, 29, 0.9);
  border-radius: 15px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
`;

const StyledButton = styled(Button)`
  background: linear-gradient(45deg, #9c27b0 30%, #f50057 90%);
  border-radius: 8px;
  border: 0;
  color: white;
  height: 48px;
  padding: 0 30px;
  box-shadow: 0 3px 5px 2px rgba(156, 39, 176, .3);
  animation: ${pulseAnimation} 2s infinite;
  
  &:hover {
    background: linear-gradient(45deg, #f50057 30%, #9c27b0 90%);
  }
`;

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [gameId, setGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = () => {
    if (!username.trim()) return;
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/lobby/${newGameId}`);
  };

  const handleJoinGame = () => {
    if (!username.trim() || !gameId.trim()) return;
    navigate(`/lobby/${gameId.toUpperCase()}`);
  };

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <StyledPaper elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
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
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              sx={{ mb: 2 }}
            />
            <StyledButton fullWidth onClick={handleJoinGame}>
              Join Game
            </StyledButton>
            <Button 
              variant="text" 
              onClick={() => setIsJoining(false)}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
          </>
        ) : (
          <>
            <StyledButton fullWidth onClick={handleCreateGame}>
              Create Game
            </StyledButton>
            <Button 
              variant="text" 
              onClick={() => setIsJoining(true)}
              sx={{ color: 'text.secondary' }}
            >
              Join Existing Game
            </Button>
          </>
        )}
      </StyledPaper>
    </Container>
  );
}

export default Login;
