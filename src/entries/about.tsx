import React from 'react';
import { createRoot } from 'react-dom/client';
import { AboutPage } from '../pages/AboutPage';
import '../styles/about.css';
import '../styles/about-motion.css';
import '../styles/about-v2.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><AboutPage/></React.StrictMode>);

import '../styles/react-fixes.css';
