import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/tokens.css';
import './styles/base.css';
import { Gallery } from './gallery/Gallery';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');

createRoot(root).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
