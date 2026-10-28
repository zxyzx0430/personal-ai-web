import { createElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/adult.html?raw';
import notes from '../content/adult-notes.json';
import allData from '../data/adult-content.json';
import { htmlMarkup, isElement, attrs, nodeChildren } from '../components/markup';
import { copyText } from '../utils/clipboard';

const rawSlides=import.meta.glob('../content/adult/slide-*.html',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
const slideHTML=Object.entries(rawSlides).sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v);
const titles=slideHTML.map(s=>s.match(/data-title="([^"]+)"/)?.[1]||'');
const { NAMES, EN, KEYS, MODE, FLOW }=allData;
type Persona=keyof typeof MODE;
type State={page:number;persona:number;step:number;repeat:number;idea:number;node:number;system:number;case:number;cycle:number;auto:boolean;delivery:number;notes:boolean};
function initialPage(){const n=Number(location.hash.replace('#',''));return n>=1&&n<=11?n-1:0;}
function initialPersona(){try{const stored=sessionStorage.getItem('personal-ai-persona');if(stored===null)return 1;const n=Number(stored);return Number.isInteger(n)&&n>=0&&n<=4?n:1;}catch{return 1;}}
export function AdultPage(){
  const [state,setState]=useState<State>(()=>({page:initialPage(),persona:initialPersona(),step:0,repeat:0,idea:0,node:0,system:0,case:0,cycle:0,auto:false,delivery:1,notes:false}));
  const [dialog,setDialog]=useState<null|'persona'|'overview'>(null);
  const [question,setQuestion]=useState('');
  const [copyStatus,setCopyStatus]=useState('');
  const rootRef=useRef<HTMLDivElement>(null),personaDialog=useRef<HTMLDialogElement>(null),overviewDialog=useRef<HTMLDialogElement>(null),notesScroll=useRef<HTMLDivElement>(null);
  const stageRef=useRef<HTMLElement>(null);
  const touch=useRef({x:0,y:0});
  const p=MODE[KEYS[state.persona] as Persona];
  const set=useCallback((patch:Partial<State>)=>setState(s=>({...s,...patch})),[]);
  const go=useCallback((n:number)=>{const next=Math.min(10,Math.max(0,Number(n)));if(!Number.isInteger(next))return;
    setState(s=>({...s,page:next}));try{history.replaceState(null,'',`#${String(next+1).padStart(2,'0')}`)}catch{}
    const slide=stageRef.current?.querySelectorAll<HTMLElement>('.slide')[next];if(slide)slide.scrollTop=0;
    if(notesScroll.current)notesScroll.current.scrollTop=0;
  },[]);
  const choosePersona=useCallback((i:number)=>{setState(s=>({...s,persona:i,step:0,repeat:0,idea:0,node:0,case:0,cycle:0}));try{sessionStorage.setItem('personal-ai-persona',String(i))}catch{};setDialog(null)},[]);
  const openDialog=(kind:'persona'|'overview')=>setDialog(kind);
  useEffect(()=>{for(const [kind,ref] of [['persona',personaDialog],['overview',overviewDialog]] as const){const d=ref.current;if(!d)continue;if(dialog===kind&&!d.open)d.showModal();else if(dialog!==kind&&d.open)d.close();}},[dialog]);
  useEffect(()=>{const root=rootRef.current;if(!root)return;const container=root.getRootNode();const el=container instanceof ShadowRoot?container.host:document.body;el.classList.toggle('auto-on',state.auto);return()=>el.classList.remove('auto-on')},[state.auto]);
  useEffect(()=>{const handle=(ev:KeyboardEvent)=>{if(dialog || (ev.target as Element)?.closest?.('textarea,input,select,[contenteditable="true"]'))return;
    if(ev.key==='Escape'&&state.notes){set({notes:false});return;}
    if(ev.key==='ArrowRight'||ev.key==='PageDown'){ev.preventDefault();go(state.page+1)}
    if(ev.key==='ArrowLeft'||ev.key==='PageUp'){ev.preventDefault();go(state.page-1)}
    if(ev.key.toLowerCase()==='n'&&!ev.ctrlKey&&!ev.metaKey){ev.preventDefault();set({notes:!state.notes})}
  };const parent=(rootRef.current?.getRootNode() instanceof ShadowRoot?rootRef.current?.getRootNode():document) as Document|ShadowRoot;
    parent.addEventListener('keydown',handle as EventListener);return()=>parent.removeEventListener('keydown',handle as EventListener);
  },[dialog,state.notes,state.page,go,set]);
  useEffect(()=>{if(notesScroll.current)notesScroll.current.scrollTop=0},[state.page]);
  useEffect(()=>{const onHash=()=>{const n=Number(location.hash.slice(1));if(n>=1&&n<=11)go(n-1)};addEventListener('hashchange',onHash);return()=>removeEventListener('hashchange',onHash)},[go]);
  const goAndClose=(n:number)=>{setDialog(null);go(n)};
  const repeatQuote=[`第一次：你可能需要逐步完成“${p.repeat[0]}、${p.repeat[1]}”等工作。`,'第二次：如果只留下结果，同一套步骤可能还得再来一遍。',`可复用：${p.repeatFresh}`][state.repeat];
  const copyProblem=async()=>{if(!question.trim()){setCopyStatus('先填写你想解决的事情。');rootRef.current?.querySelector<HTMLTextAreaElement>('#my-problem')?.focus();return;}
    const ok=await copyText(`我希望用个人 AI 系统解决这个真实问题：${question.trim()}\n我想先讨论适合的处理方式和需要准备的资料。`);
    setCopyStatus(ok?'已复制问题描述；可粘贴到微信或其他沟通窗口。':'无法自动复制，请选中文字手动复制。');
    if(!ok){const t=rootRef.current?.querySelector<HTMLTextAreaElement>('#my-problem');t?.focus();t?.select();}
  };
  const replace:NonNullable<HTMLReactParserOptions['replace']>=node=>{
    if(!isElement(node))return;
    const a=node.attribs,id=a.id;
    if(a['data-slide-placeholder']){const i=Number(a['data-slide-placeholder'])-1;return htmlMarkup(slideHTML[i],replace) as React.ReactElement}
    if(node.name==='section'&&a.class?.split(' ').includes('slide')){
      const i=Number(a.id?.replace('slide-',''))-1;return <section {...attrs(node)} key={a.id} className={a.class.split(' ').filter(x=>x!=='active').join(' ')+(i===state.page?' active':'')} aria-hidden={i!==state.page}>{nodeChildren(node,replace)}</section>;
    }
    const dynamic:Record<string,()=>ReactNode>={
      'footer-counter':()=>`${String(state.page+1).padStart(2,'0')} / 11`,
      'footer-topic':()=>titles[state.page],
      'progress-fill':()=>null,
      'process-band':()=>p.steps.map((a,i)=><button key={i} className={`process-step ${i===state.step?'active':''}`} data-process={i} onClick={()=>set({step:i})}><span className="step-no">STEP / 0{i+1}</span><strong>{a[0]}</strong><span>↗</span></button>),
      'process-title':()=>`0${state.step+1} / ${p.steps[state.step][0]}`,
      'process-detail':()=>p.steps[state.step][1],
      'problem-list':()=>p.questions.map((a,i)=><button key={i} className="problem" data-issue={i} onClick={()=>go([2,3,4,5][i])}><span className="problem-num">0{i+1} /</span><div><strong>{a[0]}</strong><small>{a[1]}</small></div><span className="arr">↗</span></button>),
      'repeat-lane':()=>p.repeat.map((x,i)=><div key={i} className={`repeat-row ${state.repeat===2&&i<3?'done':''}`}><b>0{i+1}</b><span>{state.repeat===2&&i<3?['从历史中找到资料','复用已确认的处理规则','专注本次新增变化'][i]:x}</span><span>{state.repeat===2&&i<3?'✓':'↗'}</span></div>),
      'repeat-quote':()=>repeatQuote,
      'vault-files':()=>p.files.map((x,i)=><button key={i} className={`vault-file ${i===Math.max(0,state.node-1)?'active':''}`} data-file={i} onClick={()=>set({node:i+1})}>◈ {x}</button>),
      'node-title':()=>['当前任务','项目背景','处理规则','历史结果','下一次复用'][state.node],
      'node-desc':()=>p.nodeDesc[state.node],
      'idea-request':()=>`“${p.idea}”`,
      'idea-window-status':()=>['01 / UNDERSTAND THE IDEA','02 / DESIGN THE STEPS','03 / TRY THE PROTOTYPE'][state.idea],
      'idea-preview':()=> <><div className="smallcaps">CODEX × IDEA / {String(state.idea+1).padStart(2,'0')}</div><div className="preview-title">{p.preview[state.idea]}</div>{state.idea===0?<><p className="preview-desc">不必从代码开始。先告诉 AI：你遇到什么问题，希望得到怎样的结果。</p><div className="preview-bar" style={{'--fill':'22%'} as React.CSSProperties}/></>:state.idea===1?<><p className="preview-desc">把输入、需要处理的内容和最终输出拆开，让一个模糊想法逐步变成可执行的方案。</p><div className="preview-bar" style={{'--fill':'61%'} as React.CSSProperties}/></>:<><div className="preview-metric">{p.metricValue}</div><p className="preview-desc">{p.metric} · 示例预览</p><div className="preview-bar" style={{'--fill':'88%'} as React.CSSProperties}/></>}</>,
      'system-flow':()=>FLOW.map((_,i)=><button key={i} className={`sys-step ${i===state.system?'active':''}`} data-system={i} onClick={()=>set({system:i})}><b>0{i+1} / {['YOU','CODEX','YOU','OBSIDIAN','NEXT'][i]}</b><strong>{['提出问题','辅助执行','理解结果','保存经验','再次复用'][i]}</strong></button>),
      'system-role':()=>`0${state.system+1} / ${['YOU','CODEX','YOU','OBSIDIAN','REUSE'][state.system]}`,
      'system-heading':()=>FLOW[state.system][1],
      'system-detail':()=>FLOW[state.system][2],
      'system-example':()=>p.examples[[0,0,0,1,2][state.system]],
      'scene-menu':()=>NAMES.map((name,i)=><button key={i} className={`scene-item ${state.persona===i?'active':''}`} data-scene={i} onClick={()=>choosePersona(i)}><b>0{i+1}</b>{name}<span style={{marginLeft:'auto',color:'var(--blue)'}}>↗</span></button>),
      'case-label':()=>`0${state.persona+1} / ${EN[state.persona]} · ${p.desc}`,
      'case-title':()=>p.cases[state.case][0],
      'case-problem':()=>p.cases[state.case][1],
      'case-codex':()=>p.cases[state.case][2],
      'case-memory':()=>p.cases[state.case][3],
      'cycle-left':()=>p.cycle[state.cycle][0],
      'cycle-right':()=>p.cycle[state.cycle][1],
      'cycle-text':()=>p.cycle[state.cycle][2],
      'cycle-index':()=>`0${state.cycle+1}`,
      'cycle-lead':()=>['第一份成果当然重要。但如果方法没有留下来，下一次可能仍然从头开始。','第二次开始，相关经验就有机会成为新的起点。','随着重复实践，方法逐步完善，形成自己的长期积累。'][state.cycle],
      'delivery-description':()=>['从零学习和亲手搭建，逐渐掌握日常维护能力。','在指导下参与关键操作，逐渐建立独立使用的能力。','按照实际需求交付可使用的系统，再学习必要的操作。'][state.delivery],
      'personas':()=>NAMES.map((name,i)=><button key={i} className={`persona-card ${state.persona===i?'chosen':''}`} data-pick-id={i} onClick={()=>choosePersona(i)}><b>0{i+1} / {name}</b><span>{MODE[KEYS[i] as Persona].desc} · 以你熟悉的问题理解 AI</span></button>),
      'overview-items':()=>titles.map((title,i)=><button key={i} data-goto={i} onClick={()=>goAndClose(i)}><span>{String(i+1).padStart(2,'0')}</span>{title}</button>),
      'notes-scroll':()=>htmlMarkup(notes[state.page]),
      'copy-status':()=>copyStatus,
    };
    if(id==='notes-scroll')return <div {...attrs(node)} ref={notesScroll}>{htmlMarkup(notes[state.page])}</div>;
    if(id==='progress-fill')return <div {...attrs(node)} style={{width:`${(state.page+1)/11*100}%`}}/>;
    if(id==='persona-dialog'||id==='overview-dialog')return <dialog {...attrs(node)} ref={id==='persona-dialog'?personaDialog:overviewDialog} onClose={()=>setDialog(null)}>{nodeChildren(node,replace)}</dialog>;
    if(id==='notes-panel')return <aside {...attrs(node)} className={`notes-panel ${state.notes?'open':''}`}>{nodeChildren(node,replace)}</aside>;
    if(id==='main')return <main {...attrs(node)} ref={stageRef} onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(innerWidth<=720)return;const t=e.changedTouches[0],dx=t.clientX-touch.current.x,dy=t.clientY-touch.current.y;if(Math.abs(dx)>90&&Math.abs(dx)>Math.abs(dy)*1.5)go(state.page+(dx<0?1:-1))}}>{nodeChildren(node,replace)}</main>;
    if(id==='my-problem')return <textarea {...attrs(node)} value={question} onChange={e=>setQuestion(e.target.value)}/>;
    if(id==='auto-toggle')return <button {...attrs(node)} aria-pressed={state.auto} onClick={()=>set({auto:!state.auto})}>AUTO / {state.auto?'ON':'OFF'}</button>;
    if(id==='notes-toggle')return <button {...attrs(node)} aria-pressed={state.notes} onClick={()=>set({notes:!state.notes})}>{nodeChildren(node,replace)}</button>;
    if(id==='copy-problem')return <button {...attrs(node)} onClick={()=>void copyProblem()}>{nodeChildren(node,replace)}</button>;
    if(id==='prev'||id==='next')return <button {...attrs(node)} disabled={id==='prev'?state.page===0:state.page===10} onClick={()=>go(state.page+(id==='prev'?-1:1))}>{nodeChildren(node,replace)}</button>;
    if(id==='brand-home')return <a {...attrs(node)} onClick={e=>{e.preventDefault();go(0)}}>{nodeChildren(node,replace)}</a>;
    if(id==='persona-picker')return <button {...attrs(node)} onClick={()=>openDialog('persona')}>SCENE / <span className="persona-label">{NAMES[state.persona]}</span>⌄</button>;
    if(id==='overview-toggle')return <button {...attrs(node)} onClick={()=>openDialog('overview')}>{nodeChildren(node,replace)}</button>;
    if(id==='close-notes')return <button {...attrs(node)} onClick={()=>set({notes:false})}>{nodeChildren(node,replace)}</button>;
    if(a.class?.includes('persona-label'))return createElement(node.name,attrs(node),NAMES[state.persona]);
    if(id&&Object.prototype.hasOwnProperty.call(dynamic,id))return createElement(node.name,attrs(node),dynamic[id]());
    if(node.name==='button'){
      const index=Number(a['data-jump']||'');
      if(a['data-jump'])return <button {...attrs(node)} onClick={()=>go(index-1)}>{nodeChildren(node,replace)}</button>;
      if(a['data-pick'])return <button {...attrs(node)} onClick={()=>openDialog('persona')}>{nodeChildren(node,replace)}</button>;
      if(a['data-repeat'])return <button {...attrs(node)} className={`${a.class||''} ${state.repeat===Number(a['data-repeat'])?'active':''}`} onClick={()=>set({repeat:Number(a['data-repeat'])})}>{nodeChildren(node,replace)}</button>;
      if(a['data-idea'])return <button {...attrs(node)} className={`${a.class||''} ${state.idea===Number(a['data-idea'])?'active':''}`} onClick={()=>set({idea:Number(a['data-idea'])})}>{nodeChildren(node,replace)}</button>;
      if(a['data-case'])return <button {...attrs(node)} className={`${a.class||''} ${state.case===Number(a['data-case'])?'active':''}`} onClick={()=>set({case:Number(a['data-case'])})}>{nodeChildren(node,replace)}</button>;
      if(a['data-cycle'])return <button {...attrs(node)} className={`${a.class||''} ${state.cycle===Number(a['data-cycle'])?'active':''}`} onClick={()=>set({cycle:Number(a['data-cycle'])})}>{nodeChildren(node,replace)}</button>;
      if(a['data-delivery'])return <button {...attrs(node)} className={`${a.class||''} ${state.delivery===Number(a['data-delivery'])?'active':''}`} onClick={()=>set({delivery:Number(a['data-delivery'])})}>{nodeChildren(node,replace)}</button>;
      if(a['data-close'])return <button {...attrs(node)} onClick={()=>setDialog(null)}>{nodeChildren(node,replace)}</button>;
    }
    if(a.class?.split(' ').includes('graph-node'))return createElement(node.name,{...attrs(node),className:`${a.class} ${state.node===Number(a['data-node'])?'active':''}`,onClick:()=>set({node:Number(a['data-node'])}),onKeyDown:(e:React.KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();set({node:Number(a['data-node'])})}}},nodeChildren(node,replace));
  };
  return <div ref={rootRef} style={{display:'contents'}}>{htmlMarkup(source,replace)}</div>;
}
