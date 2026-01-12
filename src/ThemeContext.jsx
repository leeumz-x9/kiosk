import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');

  const themes = {
    cyberpunk: {
      name: '🌃 Cyberpunk',
      colors: {
        '--primary-green': '#00FF41',
        '--primary-yellow': '#39FF14',
        '--primary-blue': '#00FFFF',
        '--accent-red': '#FF0080',
        '--bg-dark': '#000000',
        '--bg-card': '#0A0A0A',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#A0A0A0',
      }
    },
    ocean: {
      name: '🌊 Ocean',
      colors: {
        '--primary-green': '#00D9FF',
        '--primary-yellow': '#1E90FF',
        '--primary-blue': '#4169E1',
        '--accent-red': '#FF6B9D',
        '--bg-dark': '#001B2E',
        '--bg-card': '#003459',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#00D9FF',
      }
    },
    sunset: {
      name: '🌅 Sunset',
      colors: {
        '--primary-green': '#FF6B35',
        '--primary-yellow': '#FFB347',
        '--primary-blue': '#FF1744',
        '--accent-red': '#D32F2F',
        '--bg-dark': '#1A0F0F',
        '--bg-card': '#2D1515',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#FFB347',
      }
    },
    forest: {
      name: '🌲 Forest',
      colors: {
        '--primary-green': '#2ECC71',
        '--primary-yellow': '#27AE60',
        '--primary-blue': '#F39C12',
        '--accent-red': '#E74C3C',
        '--bg-dark': '#0F1C14',
        '--bg-card': '#1A2F21',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#2ECC71',
      }
    },
    purple: {
      name: '💜 Purple Dream',
      colors: {
        '--primary-green': '#9B59B6',
        '--primary-yellow': '#8E44AD',
        '--primary-blue': '#E91E63',
        '--accent-red': '#F44336',
        '--bg-dark': '#1A0F21',
        '--bg-card': '#2D1B3D',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#9B59B6',
      }
    },
    golden: {
      name: '✨ Golden',
      colors: {
        '--primary-green': '#FFD700',
        '--primary-yellow': '#FFA500',
        '--primary-blue': '#FF6347',
        '--accent-red': '#DC143C',
        '--bg-dark': '#1C1810',
        '--bg-card': '#2D2418',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#FFD700',
      }
    },
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('kioskTheme') || 'cyberpunk';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    console.log('🎨 Theme applied:', theme.name);
  };

  const changeTheme = (themeName) => {
    if (!themes[themeName]) {
      console.warn('Theme not found:', themeName);
      return;
    }

    setCurrentTheme(themeName);
    localStorage.setItem('kioskTheme', themeName);
    applyTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themes, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
