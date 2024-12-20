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
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  
  &:hover {
    background: ${props => props.isClickable ? 'rgba(255, 0, 0, 0.2)' : props.isActive ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.7)'};
    border-color: ${props => props.isClickable ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.3)'};
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
      background: ${props.isReaper ? '#ff0000' : '#ffffff'};
      border-radius: 50%;
      box-shadow: 0 0 10px ${props.isReaper ? 'rgba(255, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'};
      animation: ${flicker} 2s infinite;
    }
  `}

  ${props => props.hasPowerUp && `
    &::before {
      content: '⭐';
      position: absolute;
      top: 5px;
      right: 5px;
      color: #ffff00;
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
  color: ${props => props.color || '#ff0000'};
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

  &:disabled {
    background-color: #660000;
    color: rgba(255, 255, 255, 0.5);
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
    winner: null,
    gameOver: false,
    powerUps: []
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [gameOverDialog, setGameOverDialog] = useState(false);
  const [powerUpDialog, setPowerUpDialog] = useState(false);
  const [availablePowerUps, setAvailablePowerUps] = useState([]);
  const [isHost] = useState(location.state?.isHost || false);

  const username = location.state?.username;
  const currentPlayer = gameState.players.find(p => p.username === username);
  const isReaper = currentPlayer?.isReaper;
  const isCurrentTurn = gameState.currentTurn === username;

  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.emit('joinGame', { gameId, username });

    newSocket.on('gameState', (state) => {
      setGameState(state);
      if (state.gameOver) {
        setGameOverDialog(true);
      }
    });

    newSocket.on('validMoves', (moves) => {
      setValidMoves(moves);
    });

    newSocket.on('powerUps', (powerUps) => {
      setAvailablePowerUps(powerUps);
    });

    newSocket.on('error', (error) => {
      setAlert({
        open: true,
        message: error.message,
        severity: 'error'
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameId, username]);

  const handleCellClick = useCallback((index) => {
    if (!isCurrentTurn || !validMoves.includes(index)) return;

    socket.emit('movePlayer', {
      gameId,
      username,
      position: index
    });

    setSelectedCell(null);
    setValidMoves([]);
  }, [gameId, username, isCurrentTurn, validMoves, socket]);

  const handlePowerUpUse = useCallback((powerUp) => {
    if (!isCurrentTurn) return;

    socket.emit('usePowerUp', {
      gameId,
      username,
      powerUp
    });

    setPowerUpDialog(false);
  }, [gameId, username, isCurrentTurn, socket]);

  const handleReturnToLobby = useCallback(() => {
    if (isHost) {
      socket.emit('resetGame', { gameId });
    }
    navigate(`/lobby/${gameId}`, { 
      state: { 
        username,
        isHost
      } 
    });
  }, [gameId, username, isHost, navigate, socket]);

  const handleNewGame = useCallback(() => {
    if (isHost) {
      socket.emit('startNewGame', { gameId });
      setGameOverDialog(false);
    }
  }, [gameId, isHost, socket]);

  return (
    <>
      <Background />
      <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
        <GameContainer>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <StyledTypography variant="h4">
              {isReaper ? "You are the Reaper!" : "Survive the Night!"}
            </StyledTypography>
            <StyledTypography variant="h5">
              {isCurrentTurn ? "Your Turn!" : `${gameState.currentTurn}'s Turn`}
            </StyledTypography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={1}>
                {gameState.board.map((cell, index) => (
                  <Grid item xs={3} key={index}>
                    <GameCell
                      isActive={selectedCell === index}
                      isClickable={isCurrentTurn && validMoves.includes(index)}
                      isPlayer={cell !== null}
                      isReaper={cell?.isReaper}
                      hasPowerUp={gameState.powerUps.includes(index)}
                      onClick={() => handleCellClick(index)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <PlayerList>
                <StyledTypography variant="h6" gutterBottom>
                  Players
                </StyledTypography>
                <List>
                  {gameState.players.map((player) => (
                    <ListItem key={player.username}>
                      <ListItemText
                        primary={
                          <StyledTypography color={player.isReaper ? '#ff0000' : '#ffffff'}>
                            {player.username}
                            {player.isReaper ? ' (Reaper)' : ''}
                            {gameState.currentTurn === player.username ? ' (Current Turn)' : ''}
                          </StyledTypography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </PlayerList>

              {currentPlayer?.powerUps?.length > 0 && (
                <Box mt={2}>
                  <StyledButton
                    fullWidth
                    onClick={() => setPowerUpDialog(true)}
                    disabled={!isCurrentTurn}
                  >
                    Use Power-Up
                  </StyledButton>
                </Box>
              )}
            </Grid>
          </Grid>
        </GameContainer>
      </Container>

      {/* Game Over Dialog */}
      <Dialog
        open={gameOverDialog}
        onClose={() => {}}
        PaperProps={{
          style: {
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle>
          <StyledTypography variant="h5">
            Game Over!
          </StyledTypography>
        </DialogTitle>
        <DialogContent>
          <StyledTypography color="#fff" gutterBottom>
            {gameState.winner === 'reaper' 
              ? "The Reaper has claimed all souls!" 
              : "The survivors have escaped the Reaper's grasp!"}
          </StyledTypography>
          <StyledTypography color="#fff">
            Winner: {gameState.winner === 'reaper' ? 'The Reaper' : 'The Survivors'}
          </StyledTypography>
        </DialogContent>
        <DialogActions>
          {isHost && (
            <StyledButton onClick={handleNewGame}>
              Start New Game
            </StyledButton>
          )}
          <StyledButton onClick={handleReturnToLobby}>
            Return to Lobby
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Power-Up Dialog */}
      <Dialog
        open={powerUpDialog}
        onClose={() => setPowerUpDialog(false)}
        PaperProps={{
          style: {
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 0, 0, 0.2)',
          }
        }}
      >
        <DialogTitle>
          <StyledTypography variant="h5">
            Use Power-Up
          </StyledTypography>
        </DialogTitle>
        <DialogContent>
          <List>
            {currentPlayer?.powerUps?.map((powerUp) => (
              <ListItem key={powerUp}>
                <StyledButton
                  fullWidth
                  onClick={() => handlePowerUpUse(powerUp)}
                >
                  {powerUp}
                </StyledButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert 
          severity={alert.severity}
          sx={{ 
            backgroundColor: '#000000',
            color: '#ff0000',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            fontFamily: 'Creepster, cursive'
          }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Game;
