import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState({
    players: [],
    messages: [],
    bannedPlayers: [],
    mutedPlayers: [],
    currentPuzzle: null,
  });

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('playerJoined', ({ players, messages }) => {
      setGameState(prev => ({
        ...prev,
        players,
        messages
      }));
    });

    newSocket.on('playerLeft', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      }));
    });

    newSocket.on('newMessage', (message) => {
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    });

    newSocket.on('puzzleChallenge', ({ puzzle }) => {
      setGameState(prev => ({
        ...prev,
        currentPuzzle: puzzle
      }));
    });

    newSocket.on('playerMoved', ({ playerId, newPosition }) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === playerId ? { ...p, position: newPosition } : p
        )
      }));
    });

    newSocket.on('playerKicked', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId)
      }));
    });

    newSocket.on('playerBanned', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== playerId),
        bannedPlayers: [...prev.bannedPlayers, playerId]
      }));
    });

    newSocket.on('playerUnbanned', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        bannedPlayers: prev.bannedPlayers.filter(id => id !== playerId)
      }));
    });

    newSocket.on('playerMuted', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        mutedPlayers: [...prev.mutedPlayers, playerId]
      }));
    });

    newSocket.on('playerUnmuted', ({ playerId }) => {
      setGameState(prev => ({
        ...prev,
        mutedPlayers: prev.mutedPlayers.filter(id => id !== playerId)
      }));
    });

    newSocket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      // You can add toast notifications here
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const joinGame = (gameId, username) => {
    socket?.emit('joinGame', { gameId, username });
  };

  const sendMessage = (gameId, message) => {
    socket?.emit('sendMessage', { gameId, message });
  };

  const movePlayer = (gameId, direction) => {
    socket?.emit('movementAttempt', { gameId, direction });
  };

  const solvePuzzle = (gameId, position, answer) => {
    socket?.emit('solvePuzzle', { gameId, position, answer });
  };

  const kickPlayer = (gameId, playerId) => {
    socket?.emit('kickPlayer', { gameId, playerId });
  };

  const banPlayer = (gameId, playerId) => {
    socket?.emit('banPlayer', { gameId, playerId });
  };

  const unbanPlayer = (gameId, playerId) => {
    socket?.emit('unbanPlayer', { gameId, playerId });
  };

  const mutePlayer = (gameId, playerId) => {
    socket?.emit('mutePlayer', { gameId, playerId });
  };

  const unmutePlayer = (gameId, playerId) => {
    socket?.emit('unmutePlayer', { gameId, playerId });
  };

  const value = {
    socket,
    gameState,
    joinGame,
    sendMessage,
    movePlayer,
    solvePuzzle,
    kickPlayer,
    banPlayer,
    unbanPlayer,
    mutePlayer,
    unmutePlayer,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
