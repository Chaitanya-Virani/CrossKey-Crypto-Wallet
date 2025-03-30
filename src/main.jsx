// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Wallet from './components/Wallet';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Wallet walletCreated={false} setWalletCreated={() => {}} />
  </React.StrictMode>
);