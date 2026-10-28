import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/about.html?raw';
import one from '../content/about-pages/01.html?raw';
import two from '../content/about-pages/02.html?raw';
import three from '../content/about-pages/03.html?raw';
import four from '../content/about-pages/04.html?raw';
import five from '../content/about-pages/05.html?raw';
import six from '../content/about-pages/06.html?raw';
import seven from '../content/about-pages/07.html?raw';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import { FanCard, HeroMorph } from '../animation/SceneMotifs';
import { useAnimationDirector } from '../animation/AnimationDirector';
import { copyText } from '../utils/clipboard';

const pages=[one,two,three,four,five,six,seven];
const sections=['项目介绍','学习困境','学习方法','成长支持','免费资料','更多探索','联系作者'];
const header=source.slice(0,source.indexOf('</header>')+9);
const anchorPage:Record<string,number>={problems:1,method:2,needs:3,resources:4,explore:5,contact:6,'hero-title':0};
const fanClasses=new Set(['problem','method-card','growth-card','asset','contact-panel']);

export function AboutPage({embedded=false}:{embedded?:boolean}){
  const d=useAnimationDirector();
  const [feedback,setFeedback]=useState<Record<string,string>>({});
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
      if(el?.closest('input,textarea,select,[contenteditable="true"],dialog')||event.ctrlKey||event.metaKey||event.altKey)return;
      if(d.reading&&['ArrowDown','ArrowUp','PageDown','PageUp',' '].includes(event.key))return;
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
  const replace:NonNullable<HTMLReactParserOptions['replace']>=node=>{
    if(!isElement(node))return;
    const a=node.attribs;
    if(a.class?.split(' ').includes('hero-visual'))return <HeroMorph phase={phase} off={off} onSkip={d.skip} onReplay={d.replay}>{nodeChildren(node,replace)}</HeroMorph>;
    if(node.name==='article'&&a.class?.split(' ').some(c=>fanClasses.has(c))){
      return <FanCard {...attrs(node)} page={d.page} index={fanIndex++} phase={phase} off={off} className={a.class||''}>{nodeChildren(node,replace)}</FanCard>;
    }
    if(a.class?.split(' ').includes('sources'))return <motion.div {...attrs(node)} initial={off?false:{opacity:0}} animate={{opacity:off||phase>=1?1:0}} transition={{duration:.85,delay:.65}}>{nodeChildren(node,replace)}</motion.div>;
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
      <div key={`${d.page}-${d.revision}`} ref={activePanel} className={`motion-panel ${d.reading?'is-reading':''}`} data-page={d.page+1} data-phase={phase} aria-label={`第 ${d.page+1} 页：${sections[d.page]}`}>
        {htmlMarkup(pages[d.page],replace)}
      </div>
    </main>
    <nav className="motion-pagination" aria-label="首页分页导航">
      <div className="motion-page-list">{sections.map((title,i)=><button key={title} title={`第 ${i+1} 页：${title}`} aria-label={`第 ${i+1} 页：${title}`}
        aria-current={d.page===i?'page':undefined} className={d.page===i?'current':''} onClick={()=>d.navigate(i)}><span>{String(i+1).padStart(2,'0')}</span></button>)}</div>
      <div className="motion-page-actions"><button aria-label="上一页" disabled={d.page===0} onClick={()=>d.navigate(d.page-1)}>↑</button><span className="mono">{String(d.page+1).padStart(2,'0')} / 07</span><button aria-label="下一页" disabled={d.page===6} onClick={()=>d.navigate(d.page+1)}>↓</button></div>
    </nav>
    <button className="motion-read-btn" aria-pressed={d.reading} onClick={()=>d.setReading(!d.reading)}>{d.reading?'结束本页阅读 ✓':'阅读本页完整内容 ↓'}</button>
    <div className="motion-tools" aria-label="动画控制"><label htmlFor="motion-mode">动画</label><select id="motion-mode" value={d.mode} disabled={d.reduced} onChange={e=>d.setPreference(e.target.value as 'auto'|'step'|'off')}><option value="auto">自动</option><option value="step">逐步</option><option value="off">静态</option></select>
      {d.mode==='auto'&&<button onClick={()=>d.setPaused(!d.paused)}>{d.paused?'继续':'暂停'}</button>}
      {d.mode==='step'&&<button onClick={d.step} disabled={phase>=3}>下一幕</button>}
      <button onClick={d.replay} disabled={d.reduced}>重播</button>
    </div>
  </div>;
}
