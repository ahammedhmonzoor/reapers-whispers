import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CrownIcon from '@mui/icons-material/Crown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SendIcon from '@mui/icons-material/Send';
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
  padding: 2rem;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  height: 100%;
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

const ChatContainer = styled(Box)`
  height: 300px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const ChatMessages = styled(Box)`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: #ff0000;
    border-radius: 4px;
  }
`;

const Message = styled(Box)`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  background: ${props => props.isSystem ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
  border: 1px solid ${props => props.isSystem ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.1)'};
  color: ${props => props.isSystem ? '#ff0000' : '#fff'};
  font-family: 'Creepster', cursive;
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    
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

  &:disabled {
    background-color: #660000;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StyledTypography = styled(Typography)`
  font-family: 'Creepster', cursive;
  color: ${props => props.color || '#ff0000'};
`;

function Lobby() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the Reaper\'s domain...', isSystem: true },
    { id: 2, text: 'Waiting for more souls to join...', isSystem: true },
  ]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [players, setPlayers] = useState([
    { id: 1, username: location.state?.username, isHost: location.state?.isHost }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { 
      id: Date.now(), 
      text: message, 
      isSystem: false,
      sender: location.state?.username
    }]);
    setMessage('');
  };

  const handleCopyGameCode = () => {
    navigator.clipboard.writeText(gameId);
    setSnackbar({ 
      open: true, 
      message: 'Game code copied to clipboard!', 
      severity: 'success' 
    });
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      setSnackbar({
        open: true,
        message: 'Need at least 2 players to start!',
        severity: 'error'
      });
      return;
    }
    navigate(`/game/${gameId}`);
  };

  return (
    <>
      <Background />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3, height: 'calc(100vh - 64px)' }}>
          {/* Left Column - Player List */}
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <StyledTypography variant="h5">
                Players ({players.length}/6)
              </StyledTypography>
              <Box>
                <Tooltip title="Copy Game Code">
                  <IconButton onClick={handleCopyGameCode} sx={{ color: '#ff0000' }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Rules">
                  <IconButton onClick={() => setRulesOpen(true)} sx={{ color: '#ff0000' }}>
                    <MenuBookIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <List>
              {players.map((player) => (
                <ListItem key={player.id}>
                  <ListItemIcon>
                    {player.isHost ? (
                      <CrownIcon sx={{ color: '#ff0000' }} />
                    ) : (
                      <PersonIcon sx={{ color: '#ff0000' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <StyledTypography color="#fff">
                        {player.username} {player.isHost && '(Host)'}
                      </StyledTypography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {location.state?.isHost && (
              <Box mt={3}>
                <StyledButton 
                  fullWidth 
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                >
                  Start Game
                </StyledButton>
              </Box>
            )}
          </StyledPaper>

          {/* Right Column - Chat */}
          <StyledPaper>
            <StyledTypography variant="h5" gutterBottom>
              Game Code: {gameId}
            </StyledTypography>

            <ChatContainer>
              <ChatMessages>
                {messages.map((msg) => (
                  <Message key={msg.id} isSystem={msg.isSystem}>
                    {msg.isSystem ? (
                      msg.text
                    ) : (
                      <><strong>{msg.sender}:</strong> {msg.text}</>
                    )}
                  </Message>
                ))}
                <div ref={messagesEndRef} />
              </ChatMessages>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <StyledTextField
                  fullWidth
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton onClick={handleSendMessage} sx={{ color: '#ff0000' }}>
                  <SendIcon />
                </IconButton>
              </Box>
            </ChatContainer>
          </StyledPaper>
        </Box>
      </Container>

      {/* Rules Dialog */}
      <Dialog 
        open={rulesOpen} 
        onClose={() => setRulesOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle>
          <StyledTypography variant="h5">
            Rules of the Game
          </StyledTypography>
        </DialogTitle>
        <DialogContent>
          <StyledTypography color="#fff" gutterBottom>
            1. One player will be randomly chosen as the Reaper
          </StyledTypography>
          <StyledTypography color="#fff" gutterBottom>
            2. The Reaper must hunt down and eliminate all survivors
          </StyledTypography>
          <StyledTypography color="#fff" gutterBottom>
            3. Survivors must avoid the Reaper and try to survive
          </StyledTypography>
          <StyledTypography color="#fff" gutterBottom>
            4. Players can move one space at a time
          </StyledTypography>
          <StyledTypography color="#fff" gutterBottom>
            5. Power-ups can be collected to gain advantages
          </StyledTypography>
          <StyledTypography color="#fff">
            6. The game ends when either all survivors are eliminated or they survive long enough
          </StyledTypography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setRulesOpen(false)}>
            Close
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            backgroundColor: '#000000',
            color: '#ff0000',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            fontFamily: 'Creepster, cursive'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Lobby;
