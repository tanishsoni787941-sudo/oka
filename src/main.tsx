import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error listener to catch the specific DOMException
window.addEventListener('error', (event) => {
  if (event.error instanceof DOMException && event.error.message.includes('The string did not match the expected pattern')) {
    console.error('Caught specific DOMException:', event.error);
    console.error('Error stack:', event.error.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason instanceof DOMException && event.reason.message.includes('The string did not match the expected pattern')) {
    console.error('Caught unhandled rejection DOMException:', event.reason);
    console.error('Error stack:', event.reason.stack);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
