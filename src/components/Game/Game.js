import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import styled, { keyframes } from 'styled-components';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOffIcon from '@mui/icons-material/PersonOff';

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px #7209b7;
  }
  50% {
    box-shadow: 0 0 20px #7209b7, 0 0 30px #4cc9f0;
  }
  100% {
    box-shadow: 0 0 5px #7209b7;
  }
`;

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #120f1d;
  z-index: -1;
`;

const MazeCell = styled(Paper)`
  aspect-ratio: 1;
  position: relative;
  background: ${props => props.isPath ? 'rgba(26, 22, 37, 0.8)' : 'transparent'};
  border: ${props => props.isPath ? '1px solid rgba(114, 9, 183, 0.3)' : 'none'};
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  ${props => props.isActive && `
    animation: ${glowAnimation} 2s infinite;
    background: rgba(76, 201, 240, 0.2);
  `}
  
  ${props => props.isPlayer && `
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: ${props.playerColor};
      border-radius: 50%;
      box-shadow: 0 0 10px ${props.playerColor};
    }
  `}
`;

const Timer = styled(Box)`
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PuzzleContainer = styled(Paper)`
  padding: 2rem;
  background: rgba(26, 22, 37, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(114, 9, 183, 0.2);
  border-radius: 16px;
`;

const PlayerList = styled(Paper)`
  padding: 1rem;
  background: rgba(26, 22, 37, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(114, 9, 183, 0.2);
  border-radius: 16px;
  margin-bottom: 1rem;
`;

const Game = () => {
  const { gameId } = useParams();
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentPuzzle, setCurrentPuzzle] = useState({
    type: 'wordChain',
    prompt: 'Start with: GHOST',
    answer: '',
  });
  const [mazeSize] = useState(8);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [bannedPlayers, setBannedPlayers] = useState([]);
  const [showPlayerList, setShowPlayerList] = useState(false);
  
  // Mock player positions and data
  const players = [
    { id: 1, name: 'Host Player', position: { x: 0, y: 0 }, color: '#7209b7', isHost: true },
    { id: 2, name: 'Player 2', position: { x: 1, y: 1 }, color: '#4cc9f0', isHost: false },
  ];

  // Mock maze path (1 represents valid path)
  const mazePath = Array(mazeSize).fill().map(() => Array(mazeSize).fill(0));
  // Set some example paths
  [[0,0], [0,1], [1,1], [1,2], [2,2], [2,3], [3,3], [3,4]].forEach(([x,y]) => {
    mazePath[x][y] = 1;
  });

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
      // Implement kick logic here
      handlePlayerMenuClose();
    }
  };

  const handleBanPlayer = () => {
    if (selectedPlayer) {
      setBannedPlayers(prev => [...prev, selectedPlayer.id]);
      handlePlayerMenuClose();
    }
  };

  const handleUnbanPlayer = () => {
    if (selectedPlayer) {
      setBannedPlayers(prev => prev.filter(id => id !== selectedPlayer.id));
      handlePlayerMenuClose();
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const handleSubmitAnswer = () => {
    // Implement puzzle validation logic here
    setTimeLeft(10);
    setCurrentPuzzle({
      type: 'anagram',
      prompt: 'Unscramble: ERPEA',
      answer: '',
    });
  };

  const renderMaze = () => {
    return (
      <Grid container spacing={1}>
        {mazePath.map((row, x) => (
          <Grid item xs={12} key={x}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {row.map((cell, y) => {
                const player = players.find(p => p.position.x === x && p.position.y === y);
                return (
                  <MazeCell
                    key={`${x}-${y}`}
                    isPath={cell === 1}
                    isActive={x === 3 && y === 4}
                    isPlayer={!!player}
                    playerColor={player?.color}
                    elevation={cell === 1 ? 3 : 0}
                  />
                );
              })}
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Background />
      <Container maxWidth="lg" sx={{ py: 4, height: '100vh' }}>
        <Grid container spacing={3}>
          {/* Left side - Maze */}
          <Grid item xs={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonOffIcon />}
                onClick={() => setShowPlayerList(true)}
              >
                Manage Players
              </Button>
            </Box>
            {renderMaze()}
          </Grid>

          {/* Player Management Dialog */}
          <Dialog 
            open={showPlayerList} 
            onClose={() => setShowPlayerList(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Manage Players</DialogTitle>
            <DialogContent>
              <List>
                {players.map((player) => (
                  <ListItem key={player.id}>
                    <ListItemText 
                      primary={player.name}
                      secondary={bannedPlayers.includes(player.id) ? '(Banned)' : null}
                    />
                    {!player.isHost && (
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => handlePlayerMenuOpen(e, player)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPlayerList(false)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Player Action Menu */}
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

          {/* Right side - Puzzle and Controls */}
          <Grid item xs={4}>
            <PuzzleContainer>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Current Puzzle
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {currentPuzzle.prompt}
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={currentPuzzle.answer}
                  onChange={(e) => setCurrentPuzzle(prev => ({ ...prev, answer: e.target.value }))}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Timer>
                    <CircularProgress
                      variant="determinate"
                      value={timeLeft * 10}
                      size={60}
                      thickness={4}
                      sx={{ position: 'absolute' }}
                    />
                    <Typography variant="h6">
                      {timeLeft}
                    </Typography>
                  </Timer>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitAnswer}
                    fullWidth
                  >
                    Submit
                  </Button>
                </Box>
              </Box>

              {/* Power-ups and Sabotages */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Power-ups
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Tooltip title="Extra Life">
                    <Button variant="outlined" color="secondary">❤️</Button>
                  </Tooltip>
                  <Tooltip title="Hint">
                    <Button variant="outlined" color="secondary">💡</Button>
                  </Tooltip>
                  <Tooltip title="Double Move">
                    <Button variant="outlined" color="secondary">⚡</Button>
                  </Tooltip>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Sabotages
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Reverse Progress">
                    <Button variant="outlined" color="error">↩️</Button>
                  </Tooltip>
                  <Tooltip title="Hard Puzzle">
                    <Button variant="outlined" color="error">🎯</Button>
                  </Tooltip>
                  <Tooltip title="Steal Life">
                    <Button variant="outlined" color="error">💔</Button>
                  </Tooltip>
                </Box>
              </Box>
            </PuzzleContainer>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Game;
