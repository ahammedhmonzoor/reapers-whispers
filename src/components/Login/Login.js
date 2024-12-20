import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  SvgIcon,
} from '@mui/material';
import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0% {
    opacity: 1;
  }
  2% {
    opacity: 0.6;
  }
  4% {
    opacity: 0.9;
  }
  6% {
    opacity: 0.2;
  }
  8% {
    opacity: 0.8;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
`;

const stutter = keyframes`
  0% {
    transform: translate(0);
  }
  1% {
    transform: translate(-2px, 1px);
  }
  2% {
    transform: translate(2px, -1px);
  }
  3% {
    transform: translate(-1px, -1px);
  }
  4% {
    transform: translate(1px, 2px);
  }
  5% {
    transform: translate(0);
  }
  100% {
    transform: translate(0);
  }
`;

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
`;

const ReaperIcon = () => (
  <SvgIcon sx={{ fontSize: 40, animation: `${stutter} 5s infinite` }}>
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.78 0 1.41-.63 1.41-1.41S8.78 9.18 8 9.18s-1.41.63-1.41 1.41.63 1.41 1.41 1.41zm8 0c.78 0 1.41-.63 1.41-1.41s-.63-1.41-1.41-1.41-1.41.63-1.41 1.41.63 1.41 1.41 1.41zM12 14c-2.33 0-4.29 1.59-4.84 3.75-.1.39.39.75.74.55C8.96 17.55 10.41 17 12 17c1.59 0 3.04.55 4.09 1.3.36.2.84-.16.74-.55C16.29 15.59 14.33 14 12 14z"
      fill="currentColor"
    />
  </SvgIcon>
);

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: -1;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(255, 0, 0, 0.05) 0%, transparent 30%),
      radial-gradient(circle at 70% 60%, rgba(255, 0, 0, 0.05) 0%, transparent 30%);
    animation: ${flicker} 8s infinite;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background-color: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  position: relative;
  animation: ${stutter} 10s infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 8px;
    border: 1px solid rgba(255, 0, 0, 0.2);
    animation: ${flicker} 4s infinite;
  }
`;

const StyledLogo = styled(Typography)`
  font-family: 'Creepster', cursive;
  color: #ff0000;
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: ${stutter} 5s infinite;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    transition: all 0.3s ease;
    
    & fieldset {
      border-color: rgba(255, 0, 0, 0.3);
    }
    
    &:hover fieldset {
      border-color: rgba(255, 0, 0, 0.5);
    }
    
    &.Mui-focused fieldset {
      border-color: #ff0000;
    }
  }
  
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
    font-family: 'Creepster', cursive;
  }
  
  & .MuiOutlinedInput-input {
    color: #ffffff;
    font-family: 'Creepster', cursive;
  }
`;

const StyledButton = styled(Button)`
  background-color: #ff0000;
  color: white;
  font-family: 'Creepster', cursive;
  font-size: 1.2rem;
  padding: 0.5rem 2rem;
  border-radius: 4px;
  text-transform: none;
  animation: ${pulseAnimation} 2s infinite;
  
  &:hover {
    background-color: #cc0000;
  }
`;

const StyledText = styled(Typography)`
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-family: 'Creepster', cursive;
  
  &:hover {
    color: #ff0000;
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
    navigate(`/lobby/${newGameId}`, { state: { username, isHost: true } });
  };

  const handleJoinGame = () => {
    if (!username.trim() || !gameId.trim()) return;
    navigate(`/lobby/${gameId.toUpperCase()}`, { state: { username, isHost: false } });
  };

  return (
    <>
      <Background />
      <Container 
        maxWidth={false} 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <StyledPaper elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1 }}>
            <ReaperIcon sx={{ color: '#ff0000', fontSize: 60 }} />
            <StyledLogo variant="h1">
              REAPER'S WHISPERS
            </StyledLogo>
          </Box>

          <StyledTextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {!isJoining ? (
            <>
              <StyledButton fullWidth onClick={handleCreateGame}>
                Create Game
              </StyledButton>
              <StyledText onClick={() => setIsJoining(true)}>
                Join Existing Game
              </StyledText>
            </>
          ) : (
            <>
              <StyledTextField
                fullWidth
                label="Game Code"
                variant="outlined"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
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
    </>
  );
}

export default Login;
