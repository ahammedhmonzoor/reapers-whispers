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
    box-shadow: 0 0 0 0 rgba(139, 0, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(139, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 0, 0, 0);
  }
`;

const StyledPaper = styled(Paper)`
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background-color: rgba(24, 24, 31, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 400px;
`;

const StyledLogo = styled(Typography)`
  color: #B22222;
  font-family: 'Creepster', cursive;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    &:hover fieldset {
      border-color: rgba(178, 34, 34, 0.5);
    }
    
    &.Mui-focused fieldset {
      border-color: #B22222;
    }
  }
  
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  & .MuiOutlinedInput-input {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const StyledButton = styled(Button)`
  background-color: #B22222;
  color: white;
  height: 48px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1rem;
  text-transform: none;
  animation: ${pulseAnimation} 2s infinite;
  
  &:hover {
    background-color: #8B0000;
  }
`;

const StyledText = styled(Typography)`
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: color 0.3s ease;
  
  &:hover {
    color: #B22222;
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
    <Container 
      maxWidth={false} 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)'
      }}
    >
      <StyledPaper elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <StyledLogo variant="h1">
            👻 REAPER'S WHISPER
          </StyledLogo>
        </Box>

        <StyledTextField
          fullWidth
          label="Your Name"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        {!isJoining ? (
          <>
            <StyledButton fullWidth onClick={handleCreateGame}>
              Create Game
            </StyledButton>
            <StyledText onClick={() => setIsJoining(true)}>
              HAVE A GAME CODE?
            </StyledText>
          </>
        ) : (
          <>
            <StyledTextField
              fullWidth
              label="Enter 6-character code"
              variant="outlined"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              sx={{ mb: 2 }}
            />
            <StyledButton fullWidth onClick={handleJoinGame}>
              Join Game
            </StyledButton>
            <StyledText onClick={() => setIsJoining(false)}>
              Back to Create Game
            </StyledText>
          </>
        )}
      </StyledPaper>
    </Container>
  );
}

export default Login;
