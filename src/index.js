import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ this matches the default export above
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Global handlers to convert thrown objects into readable errors and avoid uncaught [object Object]
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (reason && typeof reason === 'object' && !(reason instanceof Error)) {
    const msg = reason.message || JSON.stringify(reason);
    console.error('Unhandled promise rejection (converted):', msg, reason);
    // prevent default overlay in some environments by marking handled
    event.preventDefault?.();
    alert('Error: ' + (msg || 'Unhandled rejection'));
  }
});

window.addEventListener('error', (event) => {
  // normalize ErrorEvent with object error
  const err = event.error;
  if (err && typeof err === 'object' && !(err instanceof Error)) {
    const msg = err.message || JSON.stringify(err);
    console.error('Global error (converted):', msg, err);
    alert('Error: ' + (msg || 'An error occurred'));
    event.preventDefault?.();
  }
});
