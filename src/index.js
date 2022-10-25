import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Index.css';

import Header from './components/Header';
import FSEJobFinder from './components/FSEJobFinder';
import Footer from './components/Footer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Header />
      <FSEJobFinder />
    <Footer />
  </React.StrictMode>
);
