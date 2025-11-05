import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
    <GoogleOAuthProvider clientId="485611680613-rim7kuqpc9shbn51t6db7a4ig7e6a9oe.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
  
  </StrictMode>,
)
