import { createElement, useCallback, useEffect, useRef, useState, } from 'react';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/study.html?raw';
import categories from '../data/study-categories.json';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import { copyText } from '../utils/clipboard';

// Resolve from the hashed JS bundle: works on the official root domain and GitHub Pages project subpath.
const mediaBase = import.meta.env.DEV ? '/media/' : new URL('../media/', import.meta.url).pathname;

const slideSources=import.meta.glob('../content/study/slide-*.html',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
const slideHTML=Object.entries(slideSources).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v);
const titles=slideHTML.map(s=>s.match(/data-title="([^"]+)"/)?.[1]||'');
function startIndex(){const n=Number(location.hash.slice(1));return Number.isInteger(n)&&n>=1&&n<=10?n-1:0;}
function initialStatic(){try{const v=localStorage.getItem('learning-system-static');if(v!==null)return v==='1';}catch{}return matchMedia('(prefers-reduced-motion: reduce)').matches}

/** Animations remain native Web Animations and Canvas; they are owned/cleaned by React effects. */
function useStudyAnimation(root:React.RefObject<HTMLElement|null>,page:number,staticMode:boolean,paused:boolean,replay:number){
  const effects=useRef<Animation[]>([]);
  useEffect(()=>{
    const r=root.current,slide=r?.querySelectorAll<HTMLElement>('#deck > .slide')[page];
    effects.current.forEach(a=>a.cancel());effects.current=[];
    if(!slide||staticMode)return;
    const animate=(el:Element|null|undefined,frames:Keyframe[],opts:KeyframeAnimationOptions={})=>{
      if(!el||!('animate'in el))return;
      const animation=el.animate(frames,{duration:650,easing:'cubic-bezier(.16,1,.3,1)',fill:'both',...opts});
      effects.current.push(animation);if(paused||document.hidden)animation.pause();
    };
    slide.querySelectorAll('[data-reveal]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(23px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(i*85,650),duration:750}));
    if(page===0){
      animate(slide.querySelector('.path'),[{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:2000,delay:350});
      animate(slide.querySelector('.travel-points'),[{transform:'translate(0px,0px)'},{transform:'translate(-160px,265px)'},{transform:'translate(160px,265px)'},{transform:'translate(0px,0px)'}],{duration:9000,iterations:Infinity,easing:'linear'});
    }
    if(page===2)slide.querySelectorAll('[data-route]').forEach((route,i)=>route.querySelectorAll('[data-route-step]').forEach((el,j)=>animate(el,[{opacity:.05,transform:'translateX(-22px)'},{opacity:1,transform:'translateX(0)'}],{delay:650+i*160+j*340,duration:600})));
    if(page===4){
      slide.querySelectorAll('[data-archive-step]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateX(-25px)'},{opacity:1,transform:'translateX(0)'}],{delay:250+i*170}));
      animate(slide.querySelector('[data-archive-note]'),[{opacity:0,transform:'translate(35px,25px) rotate(2deg)'},{opacity:1,transform:'translate(0,0) rotate(0)'}],{delay:600,duration:1100});
      slide.querySelectorAll('.note-rows > *').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateX(14px)'},{opacity:1,transform:'translateX(0)'}],{delay:1000+Math.floor(i/2)*170,duration:550}));
      slide.querySelectorAll('.archive-links span').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{delay:1650+i*120}));
    }
    if(page===5){
      slide.querySelectorAll('.graph-links path').forEach((el,i)=>animate(el,[{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:2200,delay:450+i*300}));
      slide.querySelectorAll('[data-node]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translate(-50%,-50%) scale(.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{delay:300+i*160,duration:850}));
    }
    if(page===6)slide.querySelectorAll('[data-day] .day-label').forEach((el,i)=>animate(el,[{opacity:0,transform:`translateY(${i%2?20:-20}px)`},{opacity:1,transform:'translateY(0)'}],{delay:350+i*210,duration:850}));
    if(slide.classList.contains('summary')){
      slide.querySelectorAll('[data-summary-block]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{delay:350+i*200,duration:850}));
      slide.querySelectorAll('[data-system-step]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateX(-15px)'},{opacity:1,transform:'translateX(0)'}],{delay:1000+i*180,duration:650}));
    }
    if(slide.classList.contains('advancement')){
      animate(slide.querySelector('[data-advance-hero]'),[{opacity:0,transform:'translateX(-30px)'},{opacity:1,transform:'translateX(0)'}],{delay:250,duration:950});
      slide.querySelectorAll('[data-advance-card]').forEach((el,i)=>animate(el,[{opacity:0,transform:'translateX(32px)'},{opacity:1,transform:'translateX(0)'}],{delay:500+i*240,duration:850}));
    }
    animate(slide,[{opacity:.2,transform:'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],{duration:600});
    return()=>{effects.current.forEach(a=>a.cancel());effects.current=[]};
  // Pause/resume is handled by a separate effect; it must not restart the sequence.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[root,page,staticMode,replay]);
  useEffect(()=>{effects.current.forEach(a=>{if(a.playState==='finished')return;if(paused||document.hidden)a.pause();else a.play()})},[paused]);
  return ()=>{effects.current.forEach(a=>a.cancel());effects.current=[]};
}
function useStudyCanvas(root:React.RefObject<HTMLElement|null>,page:number,staticMode:boolean,paused:boolean,replay:number){
  useEffect(()=>{
    const el=root.current, slide=el?.querySelectorAll<HTMLElement>('#deck > .slide')[page],canvas=slide?.querySelector<HTMLCanvasElement>('.ascii-bg');
    if(!canvas||staticMode||paused)return;
    let raf=0,lastFrame=0;
    const size=()=>{const r=canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);return {w:r.width,h:r.height,dpr}};
    let dimensions=size();
    const draw=(time:number)=>{
      if(time-lastFrame>=60){lastFrame=time;const {w,h,dpr}=dimensions,ctx=canvas.getContext('2d');if(ctx){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const tick=time*.00022;
        for(let x=10;x<w;x+=20)for(let y=10;y<h;y+=20){const wave=Math.sin(x*.012+tick)*Math.cos(y*.014-tick);const center=Math.hypot((x-w*.72)/w,(y-h*.5)/h);const alpha=Math.max(.05,(wave+.8)*.2)*(center<.42?1:.35);ctx.fillStyle=`rgba(0,47,167,${alpha})`;const a=wave>.55?2.3:1;ctx.fillRect(x,y,a,a)}
      }}raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);const resize=()=>{dimensions=size()};addEventListener('resize',resize);
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize)};
  },[root,page,staticMode,paused,replay]);
}
export function StudyPage(){
  const [page,setPage]=useState(startIndex);
  const [overview,setOverview]=useState(false);
  const [staticMode,setStaticMode]=useState(initialStatic);
  const [paused,setPaused]=useState(false);
  const [replay,setReplay]=useState(0);
  const [toast,setToast]=useState('');
  const [videoStatus,setVideoStatus]=useState('');
  const [videoChapter,setVideoChapter]=useState(0);
  const [fullscreen,setFullscreen]=useState(false);
  const rootRef=useRef<HTMLDivElement>(null),deckRef=useRef<HTMLElement>(null),dialogRef=useRef<HTMLDialogElement>(null),videoRef=useRef<HTMLVideoElement>(null),touch=useRef<{x:number;y:number}|null>(null),lastWheel=useRef(0),wheel=useRef(0),toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useStudyAnimation(rootRef,page,staticMode,paused,replay);
  useStudyCanvas(rootRef,page,staticMode,paused,replay);
  const notify=(msg:string)=>{setToast(msg);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),3200)};
  const go=useCallback((n:number,focus=false)=>{
    const next=Math.max(0,Math.min(9,Number(n)));if(!Number.isInteger(next))return;
    videoRef.current?.pause();setOverview(false);setPage(next);
    try{history.replaceState(null,'',`#${String(next+1).padStart(2,'0')}`)}catch{}
    if(deckRef.current){const target=deckRef.current.querySelectorAll<HTMLElement>('.slide')[next];if(target)target.scrollTop=0;if(focus)deckRef.current.focus({preventScroll:true})}
  },[]);
  const toggleStatic=()=>{setStaticMode(v=>{try{localStorage.setItem('learning-system-static',v?'0':'1')}catch{};notify(v?'已恢复动画。':'已切换为静态模式，内容完整保留。');return !v})};
  const replayMotion=()=>{if(staticMode){notify('当前为静态模式。按 B 恢复动效后可以重播。');return;}setPaused(false);setReplay(x=>x+1)};
  const toggleFullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{notify('当前浏览器不支持全屏，可以使用浏览器的全屏功能。')}};
  useEffect(()=>{const d=dialogRef.current;if(!d)return;if(overview&&!d.open){videoRef.current?.pause();d.showModal()}else if(!overview&&d.open)d.close()},[overview]);
  useEffect(()=>{const root=rootRef.current;if(!root)return;const host=root.getRootNode() instanceof ShadowRoot?(root.getRootNode() as ShadowRoot).host:document.body;
    host.classList.toggle('low-power',staticMode);host.classList.toggle('motion-enabled',!staticMode);host.classList.toggle('paused',paused);host.setAttribute('data-theme',root.querySelectorAll('.slide')[page]?.getAttribute('data-theme')||'');
    document.documentElement.dataset.ready='true';return()=>{host.classList.remove('low-power','motion-enabled','paused')};
  },[staticMode,paused,page]);
  useEffect(()=>{const onChange=()=>setFullscreen(!!document.fullscreenElement);document.addEventListener('fullscreenchange',onChange);return()=>document.removeEventListener('fullscreenchange',onChange)},[]);
  useEffect(()=>{const onVisibility=()=>{if(document.hidden)videoRef.current?.pause()};document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility)},[]);
  useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)');const onChange=()=>{try{if(localStorage.getItem('learning-system-static')===null)setStaticMode(mq.matches)}catch{setStaticMode(mq.matches)}};mq.addEventListener('change',onChange);return()=>mq.removeEventListener('change',onChange)},[]);
  useEffect(()=>{const onHash=()=>{const n=Number(location.hash.slice(1));if(n>=1&&n<=10)go(n-1)};addEventListener('hashchange',onHash);return()=>removeEventListener('hashchange',onHash)},[go]);
  useEffect(()=>{const handle=(e:KeyboardEvent)=>{
      if(overview||e.ctrlKey||e.metaKey||e.altKey||(e.target as HTMLElement)?.closest?.('input,textarea,select,video,.recording-chapters,[contenteditable="true"],[role="tablist"]'))return;
      if(e.code==='ArrowRight'||e.code==='PageDown'){e.preventDefault();go(page+1)}
      else if(e.code==='ArrowLeft'||e.code==='PageUp'){e.preventDefault();go(page-1)}
      else if(e.code==='Home'){e.preventDefault();go(0)}
      else if(e.code==='End'){e.preventDefault();go(9)}
      else if(e.code==='Escape'){e.preventDefault();setOverview(true)}
      else if(e.code==='KeyB'){e.preventDefault();toggleStatic()}
      else if(e.code==='KeyR'){e.preventDefault();replayMotion()}
      else if(e.code==='KeyF'){e.preventDefault();void toggleFullscreen()}
    };
    const parent=(rootRef.current?.getRootNode() instanceof ShadowRoot?rootRef.current?.getRootNode():document) as Document|ShadowRoot;
    parent.addEventListener('keydown',handle as EventListener);return()=>parent.removeEventListener('keydown',handle as EventListener);
  // Keyboard callbacks are reattached when relevant state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page,staticMode,overview,go]);
  const copyPrompt=async()=>{
    const prompt=rootRef.current?.querySelector('#prompt-preview')?.textContent?.trim()||'';
    if(await copyText(prompt))notify('提示词已复制。粘贴到 Codex 即可运行。');
    else{const el=rootRef.current?.querySelector('#prompt-preview');if(el){const range=document.createRange();range.selectNodeContents(el);getSelection()?.removeAllRanges();getSelection()?.addRange(range)}notify('请按 Ctrl+C 复制已选中的演示提问。')}
  };
  const jumpVideo=async(time:number)=>{const video=videoRef.current;if(!video)return;if(!video.readyState){video.load();try{await new Promise<void>((resolve,reject)=>{video.addEventListener('loadedmetadata',()=>resolve(),{once:true});video.addEventListener('error',()=>reject(),{once:true})})}catch{return}}
    video.currentTime=time;try{await video.play()}catch{setVideoStatus('已定位到这一步，请使用视频播放按钮。')}
  };
  const replace:NonNullable<HTMLReactParserOptions['replace']>=node=>{
    if(!isElement(node))return;if(node.name==='noscript')return <></>;const a=node.attribs,id=a.id;
    if(a['data-slide-placeholder']){const i=Number(a['data-slide-placeholder'])-1;return htmlMarkup(slideHTML[i],replace) as React.ReactElement}
    if(node.name==='section'&&a.class?.split(' ').includes('slide')){
      const index=slideHTML.findIndex(s=>s.includes(`data-title="${a['data-title']}"`));
      return <section {...attrs(node)} key={index} hidden={index!==page} inert={index!==page} aria-hidden={index!==page} className={`${a.class.split(' ').filter(x=>x!=='is-active').join(' ')} ${index===page?'is-active':''}`}>{nodeChildren(node,replace)}</section>;
    }
    if(id==='deck')return <main {...attrs(node)} ref={deckRef} onWheel={e=>{
      if(overview||e.ctrlKey||innerWidth<=800||(e.target as HTMLElement).closest('video,.recording-chapters'))return;
      const current=deckRef.current?.querySelectorAll<HTMLElement>('.slide')[page];if(current&&current.scrollHeight>current.clientHeight+4)return;
      const now=performance.now();if(now-lastWheel.current<1050)return;wheel.current+=e.deltaY;if(Math.abs(wheel.current)>65){go(page+(wheel.current>0?1:-1));wheel.current=0;lastWheel.current=now}
    }} onTouchStart={e=>{const target=e.target as HTMLElement;if(e.touches.length!==1||target.closest('button,a,input,video,[role="tablist"]')){touch.current=null;return;}touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!touch.current)return;const t=e.changedTouches[0],dx=t.clientX-touch.current.x,dy=t.clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.5)go(page+(dx<0?1:-1))}}>{nodeChildren(node,replace)}</main>;
    if(id==='overview')return <dialog {...attrs(node)} ref={dialogRef} onClose={()=>setOverview(false)} onClick={e=>{if(e.target===e.currentTarget)setOverview(false)}}>{nodeChildren(node,replace)}</dialog>;
    if(id==='page-nav')return <nav {...attrs(node)}>{titles.map((name,i)=><button key={i} className="nav-dot" aria-label={`第 ${i+1} 页：${name}`} aria-current={i===page?'page':undefined} onClick={()=>go(i)}><span aria-hidden="true"/></button>)}</nav>;
    if(id==='overview-grid')return createElement(node.name,attrs(node),titles.map((name,i)=><button key={i} className="overview-item" aria-current={i===page?'page':undefined} onClick={()=>go(i,true)}><span className="n">{String(i+1).padStart(2,'0')}</span><strong>{name}</strong><small>{categories[i]}</small></button>));
    if(id==='current-number')return createElement(node.name,attrs(node),String(page+1).padStart(2,'0'));
    if(id==='page-label')return createElement(node.name,attrs(node),titles[page]);
    if(id==='progress-fill')return <div {...attrs(node)} style={{transform:`scaleX(${(page+1)/10})`}}/>;
    if(id==='toast')return <div {...attrs(node)} className={`toast ${toast?'show':''}`}>{toast}</div>;
    if(id==='video-status')return createElement(node.name,attrs(node),videoStatus||nodeChildren(node,replace));
    if(id==='learning-demo')return <video {...attrs(node)} poster={`${mediaBase}study-embedded-1.jpg`} ref={videoRef} onTimeUpdate={e=>setVideoChapter(e.currentTarget.currentTime>=11?2:e.currentTarget.currentTime>=3.2?1:0)} onPlay={()=>setVideoStatus('正在播放真实录屏。')} onPause={e=>setVideoStatus(e.currentTarget.ended?'录屏结束，可选择步骤重看。':'已暂停，可继续播放或选择步骤。')} onEnded={()=>setVideoStatus('录屏结束，可选择步骤重看。')} onError={()=>setVideoStatus('录屏暂时无法播放，请使用支持 MP4 的浏览器打开。')}>{nodeChildren(node,replace)}</video>;
    if(node.name==='source'&&a.src?.includes('media/'))return <source {...attrs(node)} src={`${mediaBase}${a.src.split('media/').pop()}`}/>;
    if(node.name==='img'&&a.src?.includes('media/'))return <img {...attrs(node)} src={`${mediaBase}${a.src.split('media/').pop()}`}/>;
    if(node.name==='button'&&a['data-video-time']){const time=Number(a['data-video-time']);return <button {...attrs(node)} aria-current={[0,3.2,11][videoChapter]===time?'step':undefined} onClick={()=>void jumpVideo(time)}>{nodeChildren(node,replace)}</button>}
    if(node.name==='button'&&a['data-go'])return <button {...attrs(node)} onClick={()=>go(Number(a['data-go'])-1,true)}>{nodeChildren(node,replace)}</button>;
    if(id==='motion-mode')return <button {...attrs(node)} aria-pressed={staticMode} title={staticMode?'B：恢复动画':'B：切换静态模式'} onClick={toggleStatic}><span className="key">B</span><span className="mode-label">{staticMode?'动效':'静态'}</span></button>;
    const actions:Record<string,()=>void>={
      'open-overview':()=>setOverview(true),'close-overview':()=>setOverview(false),
      'pause-motion':()=>setPaused(v=>!v),'replay-motion':replayMotion,'fullscreen':()=>{void toggleFullscreen()},
      'prev-page':()=>go(page-1),'next-page':()=>go(page+1),'copy-prompt':()=>{void copyPrompt()},
      'expand-video':()=>{const video=videoRef.current;if(video?.requestFullscreen)void video.requestFullscreen().catch(()=>setVideoStatus('请使用视频播放器中的全屏按钮。'));else (video as HTMLVideoElement & {webkitEnterFullscreen?:()=>void}|null)?.webkitEnterFullscreen?.()},
    };
    if(id&&actions[id]&&node.name==='button'){
      const label=id==='pause-motion'?(paused?'继续动画':'暂停动画'):id==='fullscreen'?(fullscreen?'退出全屏':'进入全屏'):undefined;
      return <button {...attrs(node)} onClick={actions[id]} disabled={id==='prev-page'&&page===0||id==='next-page'&&page===9} aria-label={label||a['aria-label']} aria-pressed={id==='pause-motion'?paused:undefined}>{id==='pause-motion'?(paused?'▷':'Ⅱ'):nodeChildren(node,replace)}</button>;
    }
    if(node.name==='a'&&a.class?.split(' ').includes('brand'))return <a {...attrs(node)} onClick={e=>{e.preventDefault();go(0,true)}}>{nodeChildren(node,replace)}</a>;
  };
  // DOM refs are only accessed inside the parsed controls’ event callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const result=htmlMarkup(source,replace);
  return <div ref={rootRef} style={{display:'contents'}}>{result}</div>;
}
