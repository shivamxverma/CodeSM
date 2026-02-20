import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from '@/auth/AuthContext';
import { PostHogProvider } from '@posthog/react';
createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)
