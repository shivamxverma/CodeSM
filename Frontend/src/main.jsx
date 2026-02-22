import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from '@/auth/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PostHogProvider } from '@posthog/react';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </PostHogProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
