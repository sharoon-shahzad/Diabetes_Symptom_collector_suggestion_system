import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import ThemeReactContext from './themeReactContext';

// Create theme context is moved to themeReactContext.js

// Theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f7fb',
      paper: '#ffffff',
      gradient: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      card: '#ffffff',
      sidebar: '#ffffff',
      header: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#999999',
      hint: '#666666',
    },
    divider: '#e0e0e0',
    border: '#e0e0e0',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#0f172a',
    },
    h2: {
      fontWeight: 600,
      color: '#0f172a',
    },
    h3: {
      fontWeight: 600,
      color: '#0f172a',
    },
    h4: {
      fontWeight: 600,
      color: '#0f172a',
    },
    h5: {
      fontWeight: 600,
      color: '#0f172a',
    },
    h6: {
      fontWeight: 600,
      color: '#0f172a',
    },
    body1: {
      color: '#0f172a',
    },
    body2: {
      color: '#475569',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
    '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.07),0px 1px 5px 0px rgba(0,0,0,0.06)',
    '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.06)',
    '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 5px 8px 0px rgba(0,0,0,0.07),0px 1px 14px 0px rgba(0,0,0,0.06)',
    '0px 3px 5px -1px rgba(0,0,0,0.1),0px 6px 10px 0px rgba(0,0,0,0.07),0px 1px 18px 0px rgba(0,0,0,0.06)',
    '0px 4px 5px -2px rgba(0,0,0,0.1),0px 7px 10px 1px rgba(0,0,0,0.07),0px 2px 16px 1px rgba(0,0,0,0.06)',
    '0px 5px 5px -3px rgba(0,0,0,0.1),0px 8px 10px 1px rgba(0,0,0,0.07),0px 3px 14px 2px rgba(0,0,0,0.06)',
    '0px 5px 6px -3px rgba(0,0,0,0.1),0px 9px 12px 1px rgba(0,0,0,0.07),0px 3px 16px 2px rgba(0,0,0,0.06)',
    '0px 6px 6px -3px rgba(0,0,0,0.1),0px 10px 14px 1px rgba(0,0,0,0.07),0px 4px 18px 3px rgba(0,0,0,0.06)',
    '0px 6px 7px -4px rgba(0,0,0,0.1),0px 11px 15px 1px rgba(0,0,0,0.07),0px 4px 20px 3px rgba(0,0,0,0.06)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 12px 17px 2px rgba(0,0,0,0.07),0px 5px 22px 4px rgba(0,0,0,0.06)',
    '0px 7px 8px -4px rgba(0,0,0,0.1),0px 13px 19px 2px rgba(0,0,0,0.07),0px 5px 24px 4px rgba(0,0,0,0.06)',
    '0px 7px 9px -4px rgba(0,0,0,0.1),0px 14px 21px 2px rgba(0,0,0,0.07),0px 5px 26px 4px rgba(0,0,0,0.06)',
    '0px 8px 9px -5px rgba(0,0,0,0.1),0px 15px 22px 2px rgba(0,0,0,0.07),0px 6px 28px 5px rgba(0,0,0,0.06)',
    '0px 8px 10px -5px rgba(0,0,0,0.1),0px 16px 24px 2px rgba(0,0,0,0.07),0px 6px 30px 5px rgba(0,0,0,0.06)',
    '0px 8px 11px -5px rgba(0,0,0,0.1),0px 17px 26px 2px rgba(0,0,0,0.07),0px 6px 32px 5px rgba(0,0,0,0.06)',
    '0px 9px 11px -5px rgba(0,0,0,0.1),0px 18px 28px 2px rgba(0,0,0,0.07),0px 7px 34px 6px rgba(0,0,0,0.06)',
    '0px 9px 12px -6px rgba(0,0,0,0.1),0px 19px 29px 2px rgba(0,0,0,0.07),0px 7px 36px 6px rgba(0,0,0,0.06)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 20px 31px 3px rgba(0,0,0,0.07),0px 8px 38px 7px rgba(0,0,0,0.06)',
    '0px 10px 13px -6px rgba(0,0,0,0.1),0px 21px 33px 3px rgba(0,0,0,0.07),0px 8px 40px 7px rgba(0,0,0,0.06)',
    '0px 10px 14px -6px rgba(0,0,0,0.1),0px 22px 35px 3px rgba(0,0,0,0.07),0px 8px 42px 7px rgba(0,0,0,0.06)',
    '0px 11px 14px -7px rgba(0,0,0,0.1),0px 23px 36px 3px rgba(0,0,0,0.07),0px 9px 44px 8px rgba(0,0,0,0.06)',
    '0px 11px 15px -7px rgba(0,0,0,0.1),0px 24px 38px 3px rgba(0,0,0,0.07),0px 9px 46px 8px rgba(0,0,0,0.06)',
  ],
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd9',
      dark: '#ec407a',
      contrastText: '#000000',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
      // Subtle linear gradient; avoids strong circular/spotlight visuals
      gradient: 'linear-gradient(180deg, #0b1220 0%, #0a0a0a 100%)',
      card: '#1e1e1e',
      sidebar: '#1a1a1a',
      header: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
      hint: '#b0b0b0',
    },
    divider: '#333333',
    border: '#333333',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    success: {
      main: '#66bb6a',
      light: '#98ee99',
      dark: '#388e3c',
    },
    warning: {
      main: '#ffa726',
      light: '#ffd54f',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#29b6f6',
      light: '#73e8ff',
      dark: '#0288d1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#ffffff',
    },
    h2: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h3: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h5: {
      fontWeight: 600,
      color: '#ffffff',
    },
    h6: {
      fontWeight: 600,
      color: '#ffffff',
    },
    body1: {
      color: '#ffffff',
    },
    body2: {
      color: '#b0b0b0',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.3),0px 1px 1px 0px rgba(0,0,0,0.24),0px 1px 3px 0px rgba(0,0,0,0.22)',
    '0px 3px 1px -2px rgba(0,0,0,0.3),0px 2px 2px 0px rgba(0,0,0,0.24),0px 1px 5px 0px rgba(0,0,0,0.22)',
    '0px 3px 3px -2px rgba(0,0,0,0.3),0px 3px 4px 0px rgba(0,0,0,0.24),0px 1px 8px 0px rgba(0,0,0,0.22)',
    '0px 2px 4px -1px rgba(0,0,0,0.3),0px 4px 5px 0px rgba(0,0,0,0.24),0px 1px 10px 0px rgba(0,0,0,0.22)',
    '0px 3px 5px -1px rgba(0,0,0,0.3),0px 5px 8px 0px rgba(0,0,0,0.24),0px 1px 14px 0px rgba(0,0,0,0.22)',
    '0px 3px 5px -1px rgba(0,0,0,0.3),0px 6px 10px 0px rgba(0,0,0,0.24),0px 1px 18px 0px rgba(0,0,0,0.22)',
    '0px 4px 5px -2px rgba(0,0,0,0.3),0px 7px 10px 1px rgba(0,0,0,0.24),0px 2px 16px 1px rgba(0,0,0,0.22)',
    '0px 5px 5px -3px rgba(0,0,0,0.3),0px 8px 10px 1px rgba(0,0,0,0.24),0px 3px 14px 2px rgba(0,0,0,0.22)',
    '0px 5px 6px -3px rgba(0,0,0,0.3),0px 9px 12px 1px rgba(0,0,0,0.24),0px 3px 16px 2px rgba(0,0,0,0.22)',
    '0px 6px 6px -3px rgba(0,0,0,0.3),0px 10px 14px 1px rgba(0,0,0,0.24),0px 4px 18px 3px rgba(0,0,0,0.22)',
    '0px 6px 7px -4px rgba(0,0,0,0.3),0px 11px 15px 1px rgba(0,0,0,0.24),0px 4px 20px 3px rgba(0,0,0,0.22)',
    '0px 7px 8px -4px rgba(0,0,0,0.3),0px 12px 17px 2px rgba(0,0,0,0.24),0px 5px 22px 4px rgba(0,0,0,0.22)',
    '0px 7px 8px -4px rgba(0,0,0,0.3),0px 13px 19px 2px rgba(0,0,0,0.24),0px 5px 24px 4px rgba(0,0,0,0.22)',
    '0px 7px 9px -4px rgba(0,0,0,0.3),0px 14px 21px 2px rgba(0,0,0,0.24),0px 5px 26px 4px rgba(0,0,0,0.22)',
    '0px 8px 9px -5px rgba(0,0,0,0.3),0px 15px 22px 2px rgba(0,0,0,0.24),0px 6px 28px 5px rgba(0,0,0,0.22)',
    '0px 8px 10px -5px rgba(0,0,0,0.3),0px 16px 24px 2px rgba(0,0,0,0.24),0px 6px 30px 5px rgba(0,0,0,0.22)',
    '0px 8px 11px -5px rgba(0,0,0,0.3),0px 17px 26px 2px rgba(0,0,0,0.24),0px 6px 32px 5px rgba(0,0,0,0.22)',
    '0px 9px 11px -5px rgba(0,0,0,0.3),0px 18px 28px 2px rgba(0,0,0,0.24),0px 7px 34px 6px rgba(0,0,0,0.22)',
    '0px 9px 12px -6px rgba(0,0,0,0.3),0px 19px 29px 2px rgba(0,0,0,0.24),0px 7px 36px 6px rgba(0,0,0,0.22)',
    '0px 10px 13px -6px rgba(0,0,0,0.3),0px 20px 31px 3px rgba(0,0,0,0.24),0px 8px 38px 7px rgba(0,0,0,0.22)',
    '0px 10px 13px -6px rgba(0,0,0,0.3),0px 21px 33px 3px rgba(0,0,0,0.24),0px 8px 40px 7px rgba(0,0,0,0.22)',
    '0px 10px 14px -6px rgba(0,0,0,0.3),0px 22px 35px 3px rgba(0,0,0,0.24),0px 8px 42px 7px rgba(0,0,0,0.22)',
    '0px 11px 14px -7px rgba(0,0,0,0.3),0px 23px 36px 3px rgba(0,0,0,0.24),0px 9px 44px 8px rgba(0,0,0,0.22)',
    '0px 11px 15px -7px rgba(0,0,0,0.3),0px 24px 38px 3px rgba(0,0,0,0.24),0px 9px 46px 8px rgba(0,0,0,0.22)',
  ],
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const setTheme = (mode) => {
    setIsDarkMode(mode === 'dark');
  };

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    toggleTheme,
    setTheme,
    theme,
  };

  return (
    <ThemeReactContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={(t) => ({
            html: {
              backgroundColor: t.palette.background.default,
            },
            'html, body': {
              scrollbarWidth: 'thin',
              scrollbarColor:
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.28) transparent'
                  : 'rgba(0,0,0,0.28) transparent',
            },
            '::-webkit-scrollbar': {
              width: '10px',
              height: '10px',
            },
            '::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '::-webkit-scrollbar-thumb': {
              backgroundColor:
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.22)'
                  : 'rgba(0,0,0,0.22)',
              borderRadius: '8px',
              border:
                t.palette.mode === 'dark' ? '2px solid #0a0a0a' : '2px solid #ffffff',
            },
            '::-webkit-scrollbar-thumb:hover': {
              backgroundColor:
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(0,0,0,0.35)',
            },
          })}
        />
        {children}
      </MuiThemeProvider>
    </ThemeReactContext.Provider>
  );
};

// Note: useTheme hook moved to separate file to avoid fast-refresh warning
