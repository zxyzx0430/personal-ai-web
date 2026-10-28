import { useCallback, useEffect, useRef, useState } from 'react';

export type MotionMode = 'auto' | 'step' | 'off';
const pageFromHash = ():number => {
  const hash = decodeURIComponent(location.hash.slice(1));
  const routes: Record<string,number> = { problems:1, method:2, needs:3, resources:4, 'more-resources':5, explore:5, contact:6, 'hero-title':0 };
  if(hash in routes) return routes[hash];
  const match = /^page-0?([1-7])$/.exec(hash);
  return match ? Number(match[1])-1 : 0;
};
const initialReduced = () => typeof matchMedia==='function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const initialMode = (): MotionMode => {
  try { const mode = sessionStorage.getItem('personal-ai-motion-mode'); if(mode==='auto'||mode==='step'||mode==='off')return mode; } catch { /* unavailable */ }
  return 'auto';
};

/** One page per wheel/touch gesture. Visual beats are React state, never DOM polling. */
export function useAnimationDirector() {
  const [page,setPage] = useState(pageFromHash);
  const pageRef = useRef(page);
  const [direction,setDirection] = useState<1|-1>(1);
  const [arrived,setArrived] = useState(true);
  const [mode,setMode] = useState<MotionMode>(initialMode);
  const [reduced,setReduced] = useState(initialReduced);
  const [paused,setPaused] = useState(false);
  const [reading,setReading] = useState(false);
  const [phase,setPhase] = useState(()=>initialReduced()||initialMode()==='off'?3:0);
  const [revision,setRevision] = useState(0);
  const wheel = useRef({sum:0,locked:false,unlockAt:0,idle:0 as ReturnType<typeof setTimeout>|0});
  const touchUnlockAt = useRef(0);
  const touch = useRef<{x:number;y:number;scrollTop:number;scrollMax:number}|null>(null);
  const activeMode:MotionMode = reduced ? 'off' : mode;
  const setPreference = useCallback((next:MotionMode)=>{
    setMode(next); setPaused(false);setPhase(next==='off'||reduced?3:0);setRevision(r=>r+1);
    try{sessionStorage.setItem('personal-ai-motion-mode',next)}catch{/* unavailable */}
  },[reduced]);
  const navigate = useCallback((target:number, push=true)=>{
    const next=Math.max(0,Math.min(6,target));
    const previous=pageRef.current;
    if(next===previous)return;
    pageRef.current=next;
    setDirection(next>previous?1:-1);
    setPage(next);
    // The new panel must settle at y:0 before any of its narrative animation begins.
    setArrived(activeMode==='off');
    setPhase(activeMode==='off'?3:0);setPaused(false);setReading(false);
    if(push){
      const url=new URL(location.href);
      url.hash='page-'+String(next+1).padStart(2,'0');
      history.pushState({aboutPage:next},'',url.pathname+url.search+url.hash);
    }
  },[activeMode]);
  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const onChange=()=>{setReduced(mq.matches);if(mq.matches){setArrived(true);setPhase(3);}};
    mq.addEventListener('change',onChange);
    return()=>mq.removeEventListener('change',onChange);
  },[]);
  useEffect(()=>{
    if(!arrived||activeMode!=='auto'||paused||phase>=3)return;
    // Fidelity to HTML V6.1: hero holds its 1→3→5 state for 6.25s;
    // inner pages fan out their original content in one decisive motion.
    const delay=page===0?[850,1100,1400][phase]:[35,710,10][phase];
    const timeout=setTimeout(()=>setPhase(p=>Math.min(3,p+1)),delay);
    return()=>clearTimeout(timeout);
  },[activeMode,arrived,paused,phase,page,revision]);
  useEffect(()=>{
    const onHistory=()=>navigate(pageFromHash(),false);
    addEventListener('popstate',onHistory);addEventListener('hashchange',onHistory);
    return()=>{removeEventListener('popstate',onHistory);removeEventListener('hashchange',onHistory)};
  },[navigate]);
  const arrive=useCallback((target:number)=>{
    if(pageRef.current===target)setArrived(true);
  },[]);
  const replay=useCallback(()=>{
    if(reduced)return;
    if(mode==='off')setPreference('auto');
    setPhase(0);setPaused(false);setRevision(r=>r+1);
  },[reduced,mode,setPreference]);
  const onWheel=useCallback((event:WheelEvent)=>{
    if(reading||event.ctrlKey||event.metaKey)return;
    // Always consume the gesture; never leave the reader at an in-between scroll offset.
    const host=event.currentTarget as HTMLElement;
    const panel=host.querySelector<HTMLElement>(`.motion-panel[data-page="${pageRef.current+1}"]`);
    if(panel&&panel.scrollHeight>panel.clientHeight+12){
      const max=panel.scrollHeight-panel.clientHeight;
      if((event.deltaY>0&&panel.scrollTop<max-3)||(event.deltaY<0&&panel.scrollTop>3))return;
    }
    event.preventDefault();
    const state=wheel.current;
    if(state.idle)clearTimeout(state.idle);
    state.idle=setTimeout(()=>{
      state.sum=0;state.idle=0;
      const remaining=state.unlockAt-performance.now();
      if(remaining>0)state.idle=setTimeout(()=>{state.locked=false;state.idle=0},remaining);
      else state.locked=false;
    },220);
    if(state.locked)return;
    const multiplier=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
    state.sum+=event.deltaY*multiplier;
    if(Math.abs(state.sum)<30)return;
    state.locked=true;
    state.unlockAt=performance.now()+790;
    navigate(pageRef.current+(state.sum>0?1:-1));
  },[reading,navigate]);
  const onTouchStart=useCallback((event:React.TouchEvent)=>{
    if(reading)return;
    const t=event.touches[0];
    const panel=(event.currentTarget as HTMLElement).querySelector<HTMLElement>(`.motion-panel[data-page="${pageRef.current+1}"]`);
    if(t)touch.current={x:t.clientX,y:t.clientY,scrollTop:panel?.scrollTop||0,scrollMax:Math.max(0,(panel?.scrollHeight||0)-(panel?.clientHeight||0))};
  },[reading]);
  const onTouchEnd=useCallback((event:React.TouchEvent)=>{
    if(reading||!touch.current)return;
    const t=event.changedTouches[0];const initial=touch.current;const dx=t.clientX-initial.x,dy=t.clientY-initial.y;
    touch.current=null;
    // Finish reading long chapters before a NEW gesture advances the page.
    if((dy<0&&initial.scrollTop<initial.scrollMax-5)||(dy>0&&initial.scrollTop>5))return;
    if(performance.now()<touchUnlockAt.current)return;
    if(Math.abs(dy)>48&&Math.abs(dy)>Math.abs(dx)*1.25){
      touchUnlockAt.current=performance.now()+790;
      navigate(pageRef.current+(dy<0?1:-1));
    }
  },[reading,navigate]);
  useEffect(()=>()=>{if(wheel.current.idle)clearTimeout(wheel.current.idle)},[]);
  const step=()=>setPhase(p=>Math.min(3,p+1));
  const skip=()=>setPhase(3);
  return {page,direction,arrived,arrive,phase,mode:activeMode,paused,reading,reduced,revision,navigate,replay,step,skip,setPreference,setPaused,setReading,onWheel,onTouchStart,onTouchEnd};
}
