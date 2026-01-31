import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ProgressProvider } from './lib/progress.tsx';
import { createStorageService } from './config/storage';
import settingsService from './services/settingsService';

const storage = createStorageService();

// Initialize settings asynchronously after render
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    settingsService.initialize().catch(console.error);
  }, { timeout: 2000 });
} else {
  setTimeout(() => {
    settingsService.initialize().catch(console.error);
  }, 500);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider storage={storage}>
      <App />
    </ProgressProvider>
  </StrictMode>
);
