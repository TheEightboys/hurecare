import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/serviceWorker";

// Register service worker for offline support
if (import.meta.env.PROD) {
  registerServiceWorker({
    onSuccess: () => {
      console.log('App ready for offline use');
    },
    onUpdate: () => {
      // Show update notification to user
      if (confirm('New version available! Reload to update?')) {
        window.location.reload();
      }
    },
    onOffline: () => {
      console.log('App is offline - showing cached content');
    },
    onOnline: () => {
      console.log('App is back online');
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
