import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Menu,
  MenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import styled, { keyframes } from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const mazeFormation = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
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
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg,
      rgba(114, 9, 183, 0.1) 0%,
      transparent 2px,
      transparent 4px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(114, 9, 183, 0.1) 0%,
      transparent 2px,
      transparent 4px
    );
    animation: ${mazeFormation} 8s ease-in-out infinite;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 2rem;
  background: rgba(26, 22, 37, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(114, 9, 183, 0.2);
  border-radius: 16px;
  height: 100%;
`;

const ChatContainer = styled(Box)`
  height: 300px;
  display: flex;
  flex-direction: column;
  background: rgba(18, 15, 29, 0.5);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const ChatMessages = styled(Box)`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const Message = styled(Box)`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  background: ${props => props.isSystem ? 'rgba(114, 9, 183, 0.2)' : 'rgba(76, 201, 240, 0.1)'};
`;

const Lobby = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to the game lobby!', isSystem: true },
    { id: 2, text: 'Waiting for more players to join...', isSystem: true },
  ]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bannedPlayers, setBannedPlayers] = useState([]);
  
  // Mock players data
  const players = [
    { id: 1, name: 'Host Player', isHost: true },
    { id: 2, name: 'Player 2', isHost: false },
    { id: 3, name: 'Player 3', isHost: false },
  ];

  const handlePlayerMenuOpen = (event, player) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlayer(player);
  };

  const handlePlayerMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlayer(null);
  };

  const handleKickPlayer = () => {
    if (selectedPlayer) {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `${selectedPlayer.name} has been kicked from the game.`, 
        isSystem: true 
      }]);
      handlePlayerMenuClose();
    }
  };

  const handleBanPlayer = () => {
    if (selectedPlayer) {
      setBannedPlayers(prev => [...prev, selectedPlayer.id]);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `${selectedPlayer.name} has been banned from the game.`, 
        isSystem: true 
      }]);
      handlePlayerMenuClose();
    }
  };

  const handleUnbanPlayer = () => {
    if (selectedPlayer) {
      setBannedPlayers(prev => prev.filter(id => id !== selectedPlayer.id));
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: `${selectedPlayer.name} has been unbanned from the game.`, 
        isSystem: true 
      }]);
      handlePlayerMenuClose();
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), text: message, isSystem: false }]);
    setMessage('');
  };

  const handleCopyGameCode = () => {
    navigator.clipboard.writeText(gameId);
  };

  const handleStartGame = () => {
    navigate(`/game/${gameId}`);
  };

  return (
    <>
      <Background />
      <Container maxWidth="lg" sx={{ py: 4, height: '100vh' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3, height: 'calc(100vh - 64px)' }}>
          {/* Left Column - Player List */}
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Players (3/8)</Typography>
              <Tooltip title="Copy Game Code">
                <IconButton onClick={handleCopyGameCode} color="primary">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <List>
              {players.map((player) => (
                <ListItem key={player.id}>
                  {player.isHost && (
                    <ListItemIcon>
                      <StarIcon sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                  )}
                  <ListItemText primary={player.name} />
                  {!player.isHost && (
                    <IconButton
                      edge="end"
                      aria-label="player actions"
                      onClick={(e) => handlePlayerMenuOpen(e, player)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handlePlayerMenuClose}
            >
              <MenuItem onClick={handleKickPlayer}>
                Kick Player
              </MenuItem>
              {bannedPlayers.includes(selectedPlayer?.id) ? (
                <MenuItem onClick={handleUnbanPlayer}>
                  Unban Player
                </MenuItem>
              ) : (
                <MenuItem onClick={handleBanPlayer}>
                  Ban Player
                </MenuItem>
              )}
            </Menu>

            <Box sx={{ mt: 'auto' }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setRulesOpen(true)}
                startIcon={<MenuBookIcon />}
                sx={{ mb: 2 }}
              >
                Rulebook
              </Button>
              
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleStartGame}
              >
                Start Game
              </Button>
            </Box>
          </StyledPaper>

          {/* Right Column - Chat */}
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2 }}>Game Chat</Typography>
            
            <ChatContainer>
              <ChatMessages>
                {messages.map((msg) => (
                  <Message key={msg.id} isSystem={msg.isSystem}>
                    <Typography variant="body2" color={msg.isSystem ? 'primary' : 'textPrimary'}>
                      {msg.text}
                    </Typography>
                  </Message>
                ))}
              </ChatMessages>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton color="primary" onClick={handleSendMessage}>
                  <SendIcon />
                </IconButton>
              </Box>
            </ChatContainer>
          </StyledPaper>
        </Box>
      </Container>

      {/* Rules Dialog */}
      <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} maxWidth="md">
        <DialogTitle>Game Rules</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>How to Play</Typography>
          <Typography paragraph>
            1. Navigate through the maze by solving word puzzles at each door.
          </Typography>
          <Typography paragraph>
            2. You have 10 seconds to solve each puzzle. Failing costs you a life.
          </Typography>
          <Typography paragraph>
            3. Collect power-ups to gain advantages:
            • Extra life
            • Hints for puzzles
            • Double moves
            • Trap detection
          </Typography>
          <Typography paragraph>
            4. Use sabotages strategically:
            • Reverse opponent's progress
            • Place harder puzzles
            • Steal lives
          </Typography>
          <Typography paragraph>
            5. First player to reach the center of the maze wins!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Lobby;
