import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import FSEJobFinder from './components/FSEJobFinder';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FSEJobFinder />
  </React.StrictMode>
);
