import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { readSetting, STORAGE_KEYS } from './services/storageService.js';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

try {
  document.body.classList.toggle('dark', readSetting(STORAGE_KEYS.theme, 'light') === 'dark');
} catch { /* Theme preference is optional when browser storage is blocked. */ }

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AuthProvider><App /></AuthProvider></React.StrictMode>,
);
