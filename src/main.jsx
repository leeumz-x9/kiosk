import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import './universal-responsive.css';
import './styles.css';
import './mobile.css';
import './responsive-fix.css';
import './large-display.css';
import './global-animation-fix.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
