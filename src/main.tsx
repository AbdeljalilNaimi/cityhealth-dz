// CityHealth App Entry Point
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Global error loggers — capture crashes outside React tree
window.addEventListener('error', (event) => {
  console.error('[GLOBAL_ERROR]', event.message, event.filename, event.lineno, event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED_REJECTION]', event.reason);
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Register service worker asynchronously to avoid render-blocking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
}
