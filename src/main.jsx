import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import EntrenamientosMestre from '../entrenamientos-mestre.jsx';

// Polyfill para window.storage usando localStorage
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      const value = localStorage.getItem(key);
      return value !== null ? { value } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EntrenamientosMestre />
  </React.StrictMode>
);
