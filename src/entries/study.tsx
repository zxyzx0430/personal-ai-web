import React from 'react';
import {createRoot} from 'react-dom/client';
import {StudyPage} from '../pages/StudyPage';
import '../styles/study.css';
import '../styles/react-fixes.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><StudyPage/></React.StrictMode>);
