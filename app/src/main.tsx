import { openDatabase } from '@vitapact/core/storage';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App openDatabase={openDatabase} />
  </StrictMode>,
);
