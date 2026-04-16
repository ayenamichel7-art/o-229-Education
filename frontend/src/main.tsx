import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import './i18n'
import { Toaster, toast } from 'react-hot-toast'
import * as Sentry from '@sentry/react'
import { registerSW } from 'virtual:pwa-register'

// ─── PWA Service Worker (Mode Hors-Ligne) ────────────────
registerSW({
  onNeedRefresh() {
    toast('Une mise à jour de o-229 est disponible. Cliquez pour rafraîchir.', { duration: 8000 });
  },
  onOfflineReady() {
    toast.success('L\'application est prête à fonctionner hors-ligne !');
  },
})

// ─── Sentry Error Monitoring & Tracing ──────────────────
Sentry.init({
  // The DSN provided by Sentry Dashboard
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions (reduce in prod)
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
