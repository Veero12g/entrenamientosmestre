import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import EntrenamientosMestre from './App.jsx';

// window.storage polyfill using localStorage
window.storage = {
  get: async (key) => {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : null;
  },
  set: async (key, value) => {
    localStorage.setItem(key, value);
  },
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EntrenamientosMestre />
  </React.StrictMode>
);
