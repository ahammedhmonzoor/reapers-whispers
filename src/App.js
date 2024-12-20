import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Login from './components/Login/Login';
import Lobby from './components/Lobby/Lobby';
import Game from './components/Game/Game';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/lobby/:gameId" element={<Lobby />} />
          <Route path="/game/:gameId" element={<Game />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
