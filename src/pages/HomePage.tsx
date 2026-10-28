import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {createPortal} from 'react-dom';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/home.html?raw';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import {AboutPage} from './AboutPage';
import {StudyPage} from './StudyPage';
import {AdultPage} from './AdultPage';
import aboutStyle from '../styles/embedded/about.css.txt?raw';
import aboutMotionStyle from '../styles/about-motion.css?raw';
import studyStyle from '../styles/embedded/study.css.txt?raw';
import adultStyle from '../styles/embedded/adult.css.txt?raw';

type Mode='about'|'study'|'adult';
const modes:Record<Mode,{url:string,name:string,number:string,style:string}>={
  about:{url:'./about/',name:'项目介绍｜个人 AI 系统',number:'00',style:aboutStyle},
  study:{url:'./study/',name:'在学中扩展｜学生版',number:'01',style:studyStyle},
  adult:{url:'./adult/',name:'在做中扩展｜成人版',number:'02',style:adultStyle},
};
function currentUrlMode():Mode|undefined{const name=new URLSearchParams(location.search).get('view');if(name==='about'||name==='study'||name==='adult')return name}
function initialMode():Mode {const direct=currentUrlMode();if(direct)return direct;try{const m=sessionStorage.getItem('personal-ai-view');if(m==='about'||m==='study'||m==='adult')return m}catch{}return 'about'}
function InnerPresentation({mode,shadow}: {mode:Mode;shadow:ShadowRoot|null}){
  if(!shadow)return null;
  const element:ReactNode=mode==='about'?<AboutPage embedded/>:mode==='study'?<StudyPage/>:<AdultPage/>;
  return createPortal(<><style>{modes[mode].style}</style>{mode==='about'&&<style>{aboutMotionStyle}</style>}{element}</>,shadow);
}
export function HomePage(){
  const [mode,setMode]=useState<Mode>(initialMode);
  const [drawerOpen,setDrawerOpen]=useState(false);
  const [hintHidden,setHintHidden]=useState(()=>{try{return sessionStorage.getItem('personal-ai-desktop-hint-dismissed')==='1'}catch{return false}});
  const [wasUsed,setWasUsed]=useState(()=>{try{return localStorage.getItem('personal-ai-switcher-used')==='1'}catch{return false}});
  const [shadow,setShadow]=useState<ShadowRoot|null>(null);
  const drawer=useRef<HTMLDialogElement>(null);
  const innerHost=useRef<HTMLDivElement>(null);
  const swipe=useRef<{x:number;y:number}|null>(null);
  const current=modes[mode];
  useEffect(()=>{const el=innerHost.current;if(el&&!el.shadowRoot)setShadow(el.attachShadow({mode:'open'}));else if(el)setShadow(el.shadowRoot)},[]);
  useEffect(()=>{const d=drawer.current;if(!d)return;if(drawerOpen&&!d.open)d.showModal();else if(!drawerOpen&&d.open)d.close()},[drawerOpen]);
  const closeDrawer=()=>{setDrawerOpen(false)};
  const changeMode=useCallback((next:Mode,push:boolean)=>{
    setMode(next);setWasUsed(true);try{sessionStorage.setItem('personal-ai-view',next);localStorage.setItem('personal-ai-switcher-used','1')}catch{}
    if(push){const url=new URL(location.href);url.searchParams.set('view',next);url.hash='';history.pushState({view:next},'',url.pathname+url.search+url.hash)}
  },[]);
  useEffect(()=>{document.title=current.name+'｜Personal AI System'},[current.name]);
  useEffect(()=>{const onPop=()=>{setMode(currentUrlMode()||'about');setDrawerOpen(false)};addEventListener('popstate',onPop);return()=>removeEventListener('popstate',onPop)},[]);
  const replace:NonNullable<HTMLReactParserOptions['replace']>=node=>{
    if(!isElement(node))return;
    const a=node.attribs,id=a.id;
    if(node.name==='iframe'&&id==='presentation')return <div id="presentation" ref={innerHost} aria-label={current.name} role="region" onTouchStart={e=>{const t=e.touches[0];swipe.current=t.clientX<=26?{x:t.clientX,y:t.clientY}:null}} onTouchEnd={e=>{if(!swipe.current)return;const t=e.changedTouches[0];if(t.clientX-swipe.current.x>75&&Math.abs(t.clientY-swipe.current.y)<55)setDrawerOpen(true);swipe.current=null}}><InnerPresentation key={mode} mode={mode} shadow={shadow}/></div>;
    if(id==='mobileHint')return <div {...attrs(node)} hidden={hintHidden}>{nodeChildren(node,replace)}</div>;
    if(id==='dismissMobileHint')return <button {...attrs(node)} onClick={()=>{setHintHidden(true);try{sessionStorage.setItem('personal-ai-desktop-hint-dismissed','1')}catch{}}}>{nodeChildren(node,replace)}</button>;
    if(id==='openSwitch')return <button {...attrs(node)} className={`side-tab ${wasUsed?'is-tucked':''}`} aria-expanded={drawerOpen} title={`当前：${current.name}；点击切换`} onClick={()=>setDrawerOpen(true)}>{nodeChildren(node,replace)}</button>;
    if(id==='tabNumber')return <span {...attrs(node)}>{current.number}</span>;
    if(id==='openStandalone')return <a {...attrs(node)} href={current.url}>{nodeChildren(node,replace)}</a>;
    if(id==='closeSwitch')return <button {...attrs(node)} onClick={closeDrawer}>{nodeChildren(node,replace)}</button>;
    if(node.name==='button'&&a['data-view']){
      const target=a['data-view'] as Mode;
      return <button {...attrs(node)} className={`mode-option ${mode===target?'selected':''}`} aria-pressed={mode===target} onClick={()=>{changeMode(target,true);closeDrawer()}}>{nodeChildren(node,replace)}</button>;
    }
    if(a.class?.includes('option-arrow'))return <span {...attrs(node)}>{mode===((node.parent as {parent?:{attribs?:Record<string,string>}})?.parent?.attribs?.['data-view'])?'✓':'↗'}</span>;
    if(id==='switchDrawer')return <dialog {...attrs(node)} ref={drawer} onClose={()=>setDrawerOpen(false)} onCancel={e=>{e.preventDefault();closeDrawer()}} onClick={e=>{if(e.target===e.currentTarget)closeDrawer()}}>{nodeChildren(node,replace)}</dialog>;
  };
  return <>{htmlMarkup(source,replace)}</>;
}
