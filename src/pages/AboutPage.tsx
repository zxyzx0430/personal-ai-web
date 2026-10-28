import { useEffect, useRef, useState, Fragment as ReactFragment, type ReactNode } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import type { HTMLReactParserOptions, Element as ParserElement } from 'html-react-parser';
import source from '../content/about.html?raw';
import one from '../content/about-pages/01.html?raw';
import two from '../content/about-pages/02.html?raw';
import three from '../content/about-pages/03.html?raw';
import four from '../content/about-pages/04.html?raw';
import five from '../content/about-pages/05.html?raw';
import six from '../content/about-pages/06.html?raw';
import seven from '../content/about-pages/07.html?raw';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import { FanCard, HeroMorph, SupportingReveal } from '../animation/SceneMotifs';
import { NarrativeHeading, NarrativeLine, TypewriterParagraph } from '../animation/TextMotion';
import { useAnimationDirector } from '../animation/AnimationDirector';
import { copyText } from '../utils/clipboard';
import { ProblemInsightCard, StudentComparison } from '../components/AcquisitionStory';

const pages=[one,two,three,four,five,six,seven];
const sections=['家长真实问题','四种学习困境','两种学习卡点','第一次学习体验','验证与五步闭环','视频与免费资料','交流真实问题'];
const header=source.slice(0,source.indexOf('</header>')+9);
const anchorPage:Record<string,number>={problems:1,method:2,needs:3,growth:3,verification:4,loop:4,resources:5,explore:5,contact:6,'hero-title':0};
const fanClasses=new Set(['problem','method-card','growth-card','asset','contact-panel']);

// A full-page vertical glide: accelerate, cruise briefly, then decelerate gently.
// Both panels move simultaneously; all positions remain snapped to exact pages.
const PAGE_EASE=[0.76,0,0.24,1] as const;
const PAGE_DURATION=0.78;
type SlideMotion = {direction:1|-1; instant:boolean};
const slideTransition = (instant:boolean) => instant?{duration:0}:{duration:PAGE_DURATION,ease:PAGE_EASE};
const pageVariants:Variants={
  enter:({direction,instant}:SlideMotion)=>({y:instant?'0%':direction>0?'100%':'-100%',transition:slideTransition(instant)}),
  center:({instant}:SlideMotion)=>({y:'0%',transition:slideTransition(instant)}),
  exit:({direction,instant}:SlideMotion)=>({y:instant?'0%':direction>0?'-100%':'100%',transition:slideTransition(instant)})
};

export function AboutPage({embedded=false}:{embedded?:boolean}){
  const d=useAnimationDirector();
  const [feedback,setFeedback]=useState<Record<string,string>>({});
  // Each question starts open and can be closed independently; no single-selection accordion.
  const [expandedProblems,setExpandedProblems]=useState<Set<number>>(()=>new Set([0,1,2,3]));
  const stageRef=useRef<HTMLElement>(null);
  const activePanel=useRef<HTMLDivElement>(null);
  const onWheel=d.onWheel;
  const setPaused=d.setPaused;
  useEffect(()=>{
    const stage=stageRef.current;if(!stage)return;
    const handler=(e:WheelEvent)=>onWheel(e);
    stage.addEventListener('wheel',handler,{passive:false});
    return()=>stage.removeEventListener('wheel',handler);
  },[onWheel]);
  useEffect(()=>{if(activePanel.current)activePanel.current.scrollTop=0},[d.page,d.reading]);
  // On stacked mobile layouts the hero visualization is below the text fold.
  // Do not play it before the parent can actually see the right-hand explanation.
  useEffect(()=>{
    if(d.page!==0||d.mode==='off'||!matchMedia('(max-width:900px)').matches)return;
    const panel=activePanel.current;
    const visual=panel?.querySelector('.hero-visual');
    if(!panel||!visual)return;
    setPaused(true);
    const observer=new IntersectionObserver(([entry])=>setPaused(!entry.isIntersecting),{root:panel,threshold:.55});
    observer.observe(visual);
    return()=>observer.disconnect();
  },[d.page,d.mode,setPaused]);

  useEffect(()=>{
    document.title='项目介绍 · '+sections[d.page]+'｜Personal AI System';
    const key=(event:KeyboardEvent)=>{
      const el=event.target as HTMLElement|null;
      if(el?.closest('input,textarea,select,[contenteditable="true"],dialog')||event.ctrlKey||event.metaKey||event.altKey)return;
      if(d.reading&&['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
      if(event.repeat)return;
      const n=event.key;
      if(n==='ArrowDown'||n==='PageDown'){event.preventDefault();d.navigate(d.page+1)}
      else if(n==='ArrowUp'||n==='PageUp'){event.preventDefault();d.navigate(d.page-1)}
      else if(n==='Home'){event.preventDefault();d.navigate(0)}
      else if(n==='End'){event.preventDefault();d.navigate(6)}
      else if(n==='Escape'&&d.reading){d.setReading(false)}
    };
    addEventListener('keydown',key);return()=>removeEventListener('keydown',key);
  },[d]);
  const off=d.mode==='off';
  const phase=off?3:d.phase;
  let fanIndex=0;
  const inside=(node:ParserElement,name:string):boolean=>{
    let parent=node.parent;
    while(parent){
      if('attribs' in parent && typeof parent.attribs?.class==='string' && parent.attribs.class.split(' ').includes(name))return true;
      parent=parent.parent;
    }
    return false;
  };
  const textReady=d.arrived || off;
  const replace:NonNullable<HTMLReactParserOptions['replace']>=node=>{
    if(!isElement(node))return;
    const a=node.attribs;
    if(a.class?.split(' ').includes('hero-visual'))return <HeroMorph phase={phase} off={off} paused={d.paused} onManual={()=>d.setPaused(true)}>{nodeChildren(node,replace)}</HeroMorph>;
    if(a['data-acquisition']==='ab-case')return <SupportingReveal kind="aside" className="acq-case-host" phase={phase} off={off}><StudentComparison/></SupportingReveal>;
    if(node.name==='h1'||node.name==='h2')return <NarrativeHeading as={node.name} ready={textReady} off={off} page={d.page} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeHeading>;
    if(a.class?.split(' ').includes('hero-intro')&&node.name==='p'){
      const text=node.children.map(child=>'data' in child?child.data:'').join('');
      return <TypewriterParagraph text={text} ready={textReady} off={off} className={a.class}/>;
    }
    if(node.name==='p' && (inside(node,'sec-head')||inside(node,'contact')&&!inside(node,'contact-panel')))
      return <NarrativeLine kind="intro" ready={textReady} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>;
    if(a.class?.split(' ').includes('eyebrow')||a.class?.split(' ').includes('sec-num'))
      return <NarrativeLine ready={textReady} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>;
    if(a.class?.split(' ').includes('actions'))
      return <NarrativeLine kind="actions" ready={textReady} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>;
    if(a.class?.split(' ').includes('hero-foot'))
      return <NarrativeLine kind="foot" ready={textReady} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>;
    // Contact panels and section footnotes used to appear instantly while the narrative was hidden.
    // Preserve their actual DOM semantics and let them reveal only after page arrival.
    if(a.class?.split(' ').some(c=>['acq-experience','acq-proof-grid','acq-original-intro','acq-learning-loop','acq-contact-prompt'].includes(c)))
      return <SupportingReveal kind="aside" className={a.class||''} phase={phase} off={off}>{nodeChildren(node,replace)}</SupportingReveal>;
    if(a.class?.split(' ').includes('contact-panel'))
      return <SupportingReveal kind="contact" className={a.class} phase={phase} off={off}>{nodeChildren(node,replace)}</SupportingReveal>;
    if(a.class?.split(' ').includes('growth-foot'))
      return <SupportingReveal className={a.class} phase={phase} off={off}>{nodeChildren(node,replace)}</SupportingReveal>;
    if(a.class?.split(' ').includes('thin-rule'))
      return <SupportingReveal kind="divider" className={a.class} phase={phase} off={off}>{nodeChildren(node,replace)}</SupportingReveal>;
    if(node.name==='footer'&&a.class?.split(' ').includes('page-footer'))
      return <SupportingReveal kind="footer" className={a.class} phase={phase} off={off}>{nodeChildren(node,replace)}</SupportingReveal>;
    if(node.name==='p'&&d.page===2&&a.style?.includes('font-size:12px')&&!inside(node,'method-card'))
      return <NarrativeLine kind="intro" ready={phase>=1 || off} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>;
    if(node.name==='article'&&a['data-insight']){
      const index=Math.max(0,Math.min(3,Number(a['data-insight'])-1));
      return <ProblemInsightCard index={index} phase={phase} off={off} opened={expandedProblems.has(index)} onToggle={()=>setExpandedProblems(prev=>{const next=new Set(prev);if(next.has(index))next.delete(index);else next.add(index);return next;})}>{nodeChildren(node,replace)}</ProblemInsightCard>;
    }
    if(node.name==='article'&&a.class?.split(' ').some(c=>fanClasses.has(c))){
      return <FanCard {...attrs(node)} page={d.page} index={fanIndex++} phase={phase} off={off} className={a.class||''}>{nodeChildren(node,replace)}</FanCard>;
    }
    if(a.class?.split(' ').includes('sources'))return <motion.div {...attrs(node)} initial={off?false:{opacity:0}} animate={{opacity:off||phase>=1?1:0}} transition={{duration:.68,delay:.14}}>{nodeChildren(node,replace)}</motion.div>;
    if(node.name==='a'){
      if(a['data-under-construction']==='true')return <a {...attrs(node)} href="#personal-home" onClick={e=>{e.preventDefault();window.alert('在建设中，暂时无法进入');}}>{nodeChildren(node,replace)}</a>;
      if(a['data-questionnaire']==='true')return <a {...attrs(node)} href={embedded?'needs/':'../needs/'}>{nodeChildren(node,replace)}</a>;
      const href=a.href||'';
      if(href.startsWith('#'))return <a {...attrs(node)} href={href} onClick={e=>{
        const page=anchorPage[href.slice(1)];if(page===undefined)return;
        e.preventDefault();d.navigate(page);
      }}>{nodeChildren(node,replace)}</a>;
      if(embedded&&href.startsWith('../'))return <a {...attrs(node)} href={`${import.meta.env.BASE_URL}${href.slice(3)}`}>{nodeChildren(node,replace)}</a>;
    }
    if(node.name!=='button'||!a['data-copy'])return;
    const value=a['data-copy'];
    const label=feedback[value];
    return <button {...attrs(node)} onClick={async()=>{
      const ok=await copyText(value);
      setFeedback(p=>({...p,[value]:ok?(a['data-success']||'已复制'):'请手动复制'}));
      window.setTimeout(()=>setFeedback(p=>{const n={...p};delete n[value];return n;}),2100);
      if(!ok)window.prompt(a['data-prompt']||'请复制以下内容：',value);
    }}>{label||nodeChildren(node,replace)}</button>;
  };
  const headerNode:ReactNode=htmlMarkup(header,replace);
  return <div className="motion-about" data-mode={d.mode}>
    {headerNode}
    <main className="motion-stage" ref={stageRef} onTouchStart={d.onTouchStart} onTouchEnd={d.onTouchEnd}>
      <AnimatePresence initial={false} custom={{direction:d.direction,instant:off} satisfies SlideMotion} mode="sync">
        <motion.div key={d.page} ref={activePanel} custom={{direction:d.direction,instant:off} satisfies SlideMotion} variants={pageVariants}
          initial={off?'center':'enter'} animate="center" exit="exit"
          onAnimationComplete={definition=>{if(definition==='center')d.arrive(d.page);}}
          className="motion-panel" data-page={d.page+1} data-phase={phase}
          aria-label={`第 ${d.page+1} 页：${sections[d.page]}`}>
          <ReactFragment key={d.revision}>{htmlMarkup(pages[d.page],replace)}</ReactFragment>
        </motion.div>
      </AnimatePresence>
    </main>
  </div>;
}
