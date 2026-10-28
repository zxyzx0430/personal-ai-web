import React from 'react';
import { createRoot } from 'react-dom/client';
import { NeedsPage } from '../pages/NeedsPage';
import '../styles/needs.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><NeedsPage/></React.StrictMode>);

import '../styles/react-fixes.css';
