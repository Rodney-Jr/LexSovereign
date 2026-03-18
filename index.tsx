
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

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
