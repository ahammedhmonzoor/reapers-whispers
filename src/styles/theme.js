import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7209b7',
      light: '#9d4edd',
      dark: '#480ca8',
    },
    secondary: {
      main: '#4cc9f0',
      light: '#72efdd',
      dark: '#3a0ca3',
    },
    background: {
      default: '#120f1d',
      paper: '#1a1625',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b5b5b5',
    },
  },
  typography: {
    fontFamily: '"Cinzel", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#ffffff',
    },
    button: {
      fontFamily: '"Cinzel", serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '12px 24px',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 5%, rgba(255,255,255,0.1) 50%, transparent 95%)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
          },
          '&:hover::after': {
            transform: 'translateX(100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
              borderRadius: 8,
            },
            '&:hover fieldset': {
              borderColor: '#7209b7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9d4edd',
            },
          },
        },
      },
    },
  },
});
