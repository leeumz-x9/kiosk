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
        '--primary-color': '#00FF41',
        '--secondary-color': '#39FF14',
        '--accent-color': '#00FFFF',
        '--error-color': '#FF0080',
        '--bg-dark': '#000000',
        '--bg-card': '#0A0A0A',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#00FF41',
      }
    },
    ocean: {
      name: '🌊 Ocean',
      colors: {
        '--primary-color': '#00D9FF',
        '--secondary-color': '#1E90FF',
        '--accent-color': '#4169E1',
        '--error-color': '#FF6B9D',
        '--bg-dark': '#001B2E',
        '--bg-card': '#003459',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#00D9FF',
      }
    },
    sunset: {
      name: '🌅 Sunset',
      colors: {
        '--primary-color': '#FF6B35',
        '--secondary-color': '#FFB347',
        '--accent-color': '#FF1744',
        '--error-color': '#D32F2F',
        '--bg-dark': '#1A0F0F',
        '--bg-card': '#2D1515',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#FFB347',
      }
    },
    forest: {
      name: '🌲 Forest',
      colors: {
        '--primary-color': '#2ECC71',
        '--secondary-color': '#27AE60',
        '--accent-color': '#F39C12',
        '--error-color': '#E74C3C',
        '--bg-dark': '#0F1C14',
        '--bg-card': '#1A2F21',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#2ECC71',
      }
    },
    purple: {
      name: '💜 Purple Dream',
      colors: {
        '--primary-color': '#9B59B6',
        '--secondary-color': '#8E44AD',
        '--accent-color': '#E91E63',
        '--error-color': '#F44336',
        '--bg-dark': '#1A0F21',
        '--bg-card': '#2D1B3D',
        '--text-primary': '#FFFFFF',
        '--text-secondary': '#9B59B6',
      }
    },
    golden: {
      name: '✨ Golden',
      colors: {
        '--primary-color': '#FFD700',
        '--secondary-color': '#FFA500',
        '--accent-color': '#FF6347',
        '--error-color': '#DC143C',
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
