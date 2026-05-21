import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global API settings
window.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
window.BASE_URL = window.API_URL.endsWith('/api') ? window.API_URL.slice(0, -4) : window.API_URL;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

