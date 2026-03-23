import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ToastProvider } from './ToastProvider.jsx';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
        <Analytics />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
);

