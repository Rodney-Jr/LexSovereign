
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Clean up SES console noise
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('SES Removing unpermitted intrinsics')) return;
  originalWarn(...args);
};

import { BrowserRouter } from 'react-router-dom';
import { SovereignProvider } from './contexts/SovereignContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SovereignProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SovereignProvider>
  </React.StrictMode>
);
