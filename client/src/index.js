import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// React 18 way to mount the app onto the <div id="root"> in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
