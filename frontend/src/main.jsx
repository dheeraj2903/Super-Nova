import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// index.css superseded by src/styles/global.scss imported in App.jsx

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
