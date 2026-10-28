import { useCallback, useEffect, useRef, useState } from 'react';

export type MotionMode = 'auto' | 'step' | 'off';
const pageFromHash = ():number => {
  const hash = decodeURIComponent(location.hash.slice(1));
  const routes: Record<string,number> = { problems:1, method:2, needs:3, resources:4, 'more-resources':5, contact:6, 'hero-title':0 };
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
  const [mode,setMode] = useState<MotionMode>(initialMode);
  const [reduced,setReduced] = useState(initialReduced);
  const [paused,setPaused] = useState(false);
  const [reading,setReading] = useState(false);
  const [phase,setPhase] = useState(()=>initialReduced()||initialMode()==='off'?3:0);
  const [revision,setRevision] = useState(0);
  const wheel = useRef({sum:0,locked:false,idle:0 as ReturnType<typeof setTimeout>|0});
  const touch = useRef<{x:number;y:number}|null>(null);
  const activeMode:MotionMode = reduced ? 'off' : mode;
  const setPreference = useCallback((next:MotionMode)=>{
    setMode(next); setPaused(false);setPhase(next==='off'||reduced?3:0);setRevision(r=>r+1);
    try{sessionStorage.setItem('personal-ai-motion-mode',next)}catch{/* unavailable */}
  },[reduced]);
  const navigate = useCallback((target:number, push=true)=>{
    const next=Math.max(0,Math.min(6,target));
    setPage(next);setPhase(activeMode==='off'?3:0);setPaused(false);setReading(false);
    if(push){
      const url=new URL(location.href);
      url.hash='page-'+String(next+1).padStart(2,'0');
      history.pushState({aboutPage:next},'',url.pathname+url.search+url.hash);
    }
  },[activeMode]);
  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const onChange=()=>{setReduced(mq.matches);if(mq.matches)setPhase(3);};
    mq.addEventListener('change',onChange);
    return()=>mq.removeEventListener('change',onChange);
  },[]);
  useEffect(()=>{
    if(activeMode!=='auto'||paused||phase>=3)return;
    // Fidelity to HTML V6.1: hero holds its 1→3→5 state for 6.25s;
    // inner pages fan out their original content in one decisive motion.
    const delay=page===0?[1500,2000,2750][phase]:[510,760,10][phase];
    const timeout=setTimeout(()=>setPhase(p=>Math.min(3,p+1)),delay);
    return()=>clearTimeout(timeout);
  },[activeMode,paused,phase,page,revision]);
  useEffect(()=>{
    const onHistory=()=>navigate(pageFromHash(),false);
    addEventListener('popstate',onHistory);addEventListener('hashchange',onHistory);
    return()=>{removeEventListener('popstate',onHistory);removeEventListener('hashchange',onHistory)};
  },[navigate]);
  const replay=useCallback(()=>{
    if(reduced)return;
    if(mode==='off')setPreference('auto');
    setPhase(0);setPaused(false);setRevision(r=>r+1);
  },[reduced,mode,setPreference]);
  const onWheel=useCallback((event:WheelEvent)=>{
    if(reading||event.ctrlKey||event.metaKey)return;
    // Always consume the gesture; never leave the reader at an in-between scroll offset.
    event.preventDefault();
    const state=wheel.current;
    if(state.idle)clearTimeout(state.idle);
    state.idle=setTimeout(()=>{state.sum=0;state.locked=false;state.idle=0},210);
    if(state.locked)return;
    const multiplier=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
    state.sum+=event.deltaY*multiplier;
    if(Math.abs(state.sum)<30)return;
    state.locked=true;
    navigate(page+(state.sum>0?1:-1));
  },[reading,page,navigate]);
  const onTouchStart=useCallback((event:React.TouchEvent)=>{
    if(reading)return;
    const t=event.touches[0];if(t)touch.current={x:t.clientX,y:t.clientY};
  },[reading]);
  const onTouchEnd=useCallback((event:React.TouchEvent)=>{
    if(reading||!touch.current)return;
    const t=event.changedTouches[0];const dx=t.clientX-touch.current.x,dy=t.clientY-touch.current.y;
    touch.current=null;
    if(Math.abs(dy)>48&&Math.abs(dy)>Math.abs(dx)*1.25)navigate(page+(dy<0?1:-1));
  },[reading,page,navigate]);
  useEffect(()=>()=>{if(wheel.current.idle)clearTimeout(wheel.current.idle)},[]);
  const step=()=>setPhase(p=>Math.min(3,p+1));
  const skip=()=>setPhase(3);
  return {page,phase,mode:activeMode,paused,reading,reduced,revision,navigate,replay,step,skip,setPreference,setPaused,setReading,onWheel,onTouchStart,onTouchEnd};
}
