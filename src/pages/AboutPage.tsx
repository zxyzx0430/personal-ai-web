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
import { InlineABCase, ProblemExplorer, ServiceOffer, problems } from '../components/ProblemExplorer';

const pages=[one,two,three,four,five,six,seven];
const sections=['项目介绍','学习困境','学习方法','成长支持','免费资料','更多探索','联系作者'];
const header=source.slice(0,source.indexOf('</header>')+9);
const anchorPage:Record<string,number>={problems:1,method:2,needs:3,resources:4,explore:5,contact:6,'hero-title':0};
const fanClasses=new Set(['problem','method-card','growth-card','asset','contact-panel']);
const problemFromUrl=()=>{const n=Number(new URLSearchParams(location.search).get('problem'));return n>=1&&n<=4?n-1:null};

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
  const [problem,setProblem]=useState<number|null>(problemFromUrl);
  const openProblem=(id:number)=>{
    const url=new URL(location.href);
    url.searchParams.set('problem',String(id+1));
    url.hash='page-02';
    if(d.page!==1)d.navigate(1);
    history.pushState({},'',url.pathname+url.search+url.hash);
    setProblem(id);
  };
  const closeProblem=()=>{
    const url=new URL(location.href);url.searchParams.delete('problem');
    history.replaceState({},'',url.pathname+url.search+url.hash);
    setProblem(null);
  };
  useEffect(()=>{const sync=()=>setProblem(problemFromUrl());addEventListener('popstate',sync);return()=>removeEventListener('popstate',sync)},[]);
  useEffect(()=>{if(problem!==null && d.page!==1)d.navigate(1)},[problem,d]);

  const stageRef=useRef<HTMLElement>(null);
  const activePanel=useRef<HTMLDivElement>(null);
  const onWheel=d.onWheel;
  useEffect(()=>{
    const stage=stageRef.current;if(!stage)return;
    const handler=(e:WheelEvent)=>onWheel(e);
    stage.addEventListener('wheel',handler,{passive:false});
    return()=>stage.removeEventListener('wheel',handler);
  },[onWheel]);
  useEffect(()=>{if(activePanel.current)activePanel.current.scrollTop=0},[d.page,d.reading]);
  useEffect(()=>{
    document.title='项目介绍 · '+sections[d.page]+'｜Personal AI System';
    const key=(event:KeyboardEvent)=>{
      const el=event.target as HTMLElement|null;
      if(problem!==null){if(event.key==='Escape'){event.preventDefault();closeProblem()}return;}
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
  },[d,problem]);
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
    if(a.class?.split(' ').includes('hero-visual'))return <HeroMorph phase={phase} off={off}>{nodeChildren(node,replace)}</HeroMorph>;
    if(d.page===6&&node.name==='h2'&&inside(node,'contact'))return <NarrativeHeading as="h2" ready={textReady} off={off} page={d.page} props={attrs(node)}>我会怎样<br/><span style={{color:'var(--blue)'}}>帮助你？</span></NarrativeHeading>;
    if(node.name==='h1'||node.name==='h2')return <NarrativeHeading as={node.name} ready={textReady} off={off} page={d.page} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeHeading>;
    if(a.class?.split(' ').includes('actions')&&d.page===0){
      return <><NarrativeLine kind="actions" ready={textReady} off={off} props={attrs(node)}>{nodeChildren(node,replace)}</NarrativeLine>
        <motion.div className="v2-hero-addendum" initial={off?false:{opacity:0}} animate={{opacity:textReady?1:0}} transition={{duration:.5,delay:1.4}}>
          <p>我通过学习诊断、个性化讲解、AI 交互学习与长期学习记录，帮助学生解决具体学习困难，并逐步建立独立学习能力。</p>
          <a href="#problems" onClick={e=>{e.preventDefault();d.navigate(1)}}>看看四个常见的学习困境 ↗</a>
        </motion.div></>;
    }
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
    if(node.name==='article'&&a.class?.split(' ').some(c=>fanClasses.has(c))){
      const idx=fanIndex++;
      const isProblem=d.page===1&&a.class?.split(' ').includes('problem');
      const isPdf=d.page===4&&a.class?.split(' ').includes('asset');
      const isVideo=d.page===5&&a.class?.split(' ').includes('asset')&&idx===0;
      const pdfNotes=['适合：想先发现孩子实际需求的家长。','适合：希望了解服务流程和学习方式的家庭。','适合：想独立核查 AI 教育研究与边界的家长。'];
      return <FanCard {...attrs(node)} page={d.page} index={idx} phase={phase} off={off} className={`${a.class||''}${isProblem?' v2-clickable-card':''}`}>
        {nodeChildren(node,replace)}
        {isProblem&&<button className="v2-card-hit" type="button" aria-label={`查看困境 ${idx+1}：${problems[idx].title} 的解决方案`} onClick={()=>openProblem(idx)}><span>查看我的解决方法 ↗</span></button>}
        {isPdf&&<p className="v2-pdf-note">{pdfNotes[idx]}</p>}
        {isVideo&&<button className="v2-inline-action v2-video-entry" onClick={()=>openProblem(0)}>先体验精选教学演示 ↗</button>}
      </FanCard>;
    }
    if(d.page===2 && a.class?.split(' ').includes('method'))return <><div {...attrs(node)}>{nodeChildren(node,replace)}</div><div className="v2-method-after"><InlineABCase onExplore={()=>openProblem(0)}/></div></>;
    if(d.page===3 && a.class?.split(' ').includes('growth-grid'))return <><p className="v2-growth-context"><strong>核心学习支持：</strong>学科理解、学习方法、AI 工具与知识积累。下列六项属于按学生实际需要选择的<strong>延伸成长支持</strong>，不是统一必修课程。</p><div {...attrs(node)}>{nodeChildren(node,replace)}</div></>;
    if(d.page===6 && node.name==='div' && node.parent && 'attribs' in node.parent && node.parent.attribs?.id==='contact' && node.parent.children.filter(c=>('name' in c)&&c.name==='div').indexOf(node)===0)
      return <div {...attrs(node)}>{nodeChildren(node,replace)}<ServiceOffer/></div>;
    if(a.class?.split(' ').includes('sources'))return <motion.div {...attrs(node)} initial={off?false:{opacity:0}} animate={{opacity:off||phase>=1?1:0}} transition={{duration:.68,delay:.14}}>{nodeChildren(node,replace)}</motion.div>;
    if(node.name==='a'){
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
    <ProblemExplorer selected={problem} onSelect={openProblem} onClose={closeProblem} onContact={()=>{closeProblem();d.navigate(6)}}/>
  </div>;
}
