import React from 'react';
import { createRoot } from 'react-dom/client';
import {AdultPage} from '../pages/AdultPage';
import '../styles/adult.css';
import '../styles/react-fixes.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><AdultPage/></React.StrictMode>);
