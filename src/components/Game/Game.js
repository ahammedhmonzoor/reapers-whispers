import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import styled, { keyframes } from 'styled-components';
import io from 'socket.io-client';

const bloodDrip = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const flicker = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
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
  background-image: 
    radial-gradient(circle at center, transparent 0%, rgba(255, 0, 0, 0.1) 100%),
    linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.9));
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(transparent, rgba(255, 0, 0, 0.1));
    animation: ${bloodDrip} 10s linear infinite;
  }
`;

const GameCell = styled(Paper)`
  aspect-ratio: 1;
  position: relative;
  background: ${props => props.isActive ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.7)'};
  border: 1px solid rgba(255, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 0, 0, 0.2);
    border-color: rgba(255, 0, 0, 0.5);
  }
  
  ${props => props.isActive && `
    animation: ${pulseAnimation} 2s infinite;
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
      background: #ff0000;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
      animation: ${flicker} 2s infinite;
    }
  `}
`;

const GameContainer = styled(Paper)`
  padding: 2rem;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 16px;
`;

const PlayerList = styled(Paper)`
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  margin-top: 1rem;
`;

const StyledTypography = styled(Typography)`
  font-family: 'Creepster', cursive;
  color: #ff0000;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
`;

const StyledButton = styled(Button)`
  background-color: #ff0000;
  color: white;
  font-family: 'Creepster', cursive;
  font-size: 1.2rem;
  padding: 0.5rem 2rem;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 1px;
  
  &:hover {
    background-color: #cc0000;
    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
  }
`;

function Game() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayer: '',
    board: Array(16).fill(null),
    isGameStarted: false,
    currentTurn: null,
    winner: null
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [gameOverDialog, setGameOverDialog] = useState(false);
  const [powerUpDialog, setPowerUpDialog] = useState(false);
  const [availablePowerUps, setAvailablePowerUps] = useState([]);

  const username = location.state?.username;
  const isReaper = gameState.players.find(p => p.username === username)?.isReaper;

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('joinGame', { gameId, username });

    newSocket.on('gameState', (state) => {
      setGameState(state);
      if (state.winner) {
        setGameOverDialog(true);
      }
    });

    newSocket.on('validMoves', (moves) => {
      setValidMoves(moves);
    });

    newSocket.on('powerUps', (powerUps) => {
      setAvailablePowerUps(powerUps);
    });

    newSocket.on('gameError', (error) => {
      setAlert({ open: true, message: error, severity: 'error' });
    });

    return () => newSocket.disconnect();
  }, [gameId, username]);

  const handleCellClick = useCallback((index) => {
    if (!gameState.isGameStarted || gameState.winner) return;
    
    const currentPlayer = gameState.players.find(p => p.username === username);
    if (!currentPlayer || !currentPlayer.isAlive) return;
    
    if (gameState.currentTurn?.playerId !== currentPlayer.id) {
      setAlert({ open: true, message: "It's not your turn!", severity: 'warning' });
      return;
    }

    if (validMoves.includes(index)) {
      socket.emit('movePlayer', { gameId, position: index });
      setSelectedCell(index);
    } else if (currentPlayer.position === index) {
      socket.emit('requestValidMoves', { gameId });
    } else {
      setAlert({ open: true, message: 'Invalid move!', severity: 'error' });
    }
  }, [gameState, username, validMoves, socket, gameId]);

  const handleStartGame = useCallback(() => {
    socket.emit('startGame', { gameId });
  }, [socket, gameId]);

  const handleUsePowerUp = useCallback((powerUp) => {
    socket.emit('usePowerUp', { gameId, powerUp });
    setPowerUpDialog(false);
  }, [socket, gameId]);

  const renderCell = useCallback((index) => {
    const player = gameState.players.find(p => p.position === index && p.isAlive);
    const isValidMove = validMoves.includes(index);
    
    return (
      <GameCell
        isActive={selectedCell === index || isValidMove}
        isPlayer={!!player}
        onClick={() => handleCellClick(index)}
        sx={{
          cursor: isValidMove ? 'pointer' : 'default',
          '&::after': player && {
            backgroundColor: player.isReaper ? '#ff0000' : '#ffffff',
          }
        }}
      />
    );
  }, [gameState.players, selectedCell, validMoves, handleCellClick]);

  return (
    <>
      <Background />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <GameContainer>
          <StyledTypography variant="h3" align="center" gutterBottom>
            {isReaper ? "Reaper's Hunt" : "Survive the Reaper"}
          </StyledTypography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={1}>
                {Array(16).fill(null).map((_, index) => (
                  <Grid item xs={3} key={index}>
                    {renderCell(index)}
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <PlayerList>
                <StyledTypography variant="h5" gutterBottom>
                  Players
                </StyledTypography>
                <List>
                  {gameState.players.map((player, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={
                          <StyledTypography
                            sx={{
                              color: !player.isAlive ? '#666' : player.isReaper ? '#ff0000' : '#fff',
                              textDecoration: !player.isAlive ? 'line-through' : 'none',
                            }}
                          >
                            {player.username} {!player.isAlive && '(Dead)'}
                          </StyledTypography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </PlayerList>
              
              {gameState.currentTurn && (
                <Box mt={3}>
                  <StyledTypography align="center">
                    {gameState.currentTurn.playerId === gameState.players.find(p => p.username === username)?.id
                      ? "Your Turn!"
                      : `${gameState.players.find(p => p.id === gameState.currentTurn.playerId)?.username}'s Turn`}
                  </StyledTypography>
                </Box>
              )}
              
              {!gameState.isGameStarted && gameState.players[0]?.username === username && (
                <Box mt={3} display="flex" justifyContent="center">
                  <StyledButton
                    variant="contained"
                    onClick={handleStartGame}
                  >
                    Start Game
                  </StyledButton>
                </Box>
              )}
              
              {gameState.isGameStarted && availablePowerUps.length > 0 && (
                <Box mt={3} display="flex" justifyContent="center">
                  <StyledButton
                    variant="contained"
                    onClick={() => setPowerUpDialog(true)}
                  >
                    Use Power-up
                  </StyledButton>
                </Box>
              )}
            </Grid>
          </Grid>
        </GameContainer>
      </Container>

      <Dialog open={gameOverDialog} onClose={() => navigate('/')}>
        <DialogTitle>
          <StyledTypography>
            Game Over!
          </StyledTypography>
        </DialogTitle>
        <DialogContent>
          <StyledTypography>
            {gameState.winner === 'reaper' 
              ? 'The Reaper has won! All survivors have been eliminated.'
              : 'The Survivors have won! They managed to survive the Reaper.'}
          </StyledTypography>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => navigate('/')}>
            Back to Lobby
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={powerUpDialog} onClose={() => setPowerUpDialog(false)}>
        <DialogTitle>
          <StyledTypography>
            Use Power-up
          </StyledTypography>
        </DialogTitle>
        <DialogContent>
          <List>
            {availablePowerUps.map((powerUp, index) => (
              <ListItem key={index} button onClick={() => handleUsePowerUp(powerUp)}>
                <ListItemText
                  primary={
                    <StyledTypography>
                      {powerUp === 'shield' && '🛡️ Shield'}
                      {powerUp === 'reveal' && '👁️ Reveal'}
                      {powerUp === 'speed' && '⚡ Speed Boost'}
                    </StyledTypography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Game;
