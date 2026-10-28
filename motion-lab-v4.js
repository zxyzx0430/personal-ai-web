/* Personal AI System / MOTION LAB V4
 * Macro-storytelling prototype. Isolated HTML branch only.
 * No dependency on V3; do not copy this DOM imperative code to React.
 */
(() => {
'use strict';
const kind=location.pathname.includes('/study/')?'study':location.pathname.includes('/adult/')?'adult':'';
if(!kind)return;
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const host=document.createElement('aside');
host.id='v4-console';
host.innerHTML='<button class="v4-toggle" type="button" aria-expanded="false">MOTION V4 <b>+</b></button><div class="v4-console-inner" hidden>'+
'<div class="v4-console-title">叙事结构演示</div>'+
'<div class="v4-modes"><button data-mode="auto" aria-pressed="true">自动</button><button data-mode="step" aria-pressed="false">逐步</button><button data-mode="off" aria-pressed="false">原版</button></div>'+
'<div class="v4-commands"><button data-action="restart">重新播放</button><button data-action="next">下一阶段 →</button></div>'+
'<div class="v4-counter" aria-live="polite">进入实验场景后开始</div></div>';
document.body.appendChild(host);
const toggle=$('.v4-toggle',host),panel=$('.v4-console-inner',host),counter=$('.v4-counter',host);
const compactNext=document.createElement('button');
compactNext.className='v4-compact-next';compactNext.type='button';compactNext.textContent='下一幕 →';compactNext.hidden=true;
host.insertBefore(compactNext,panel);
let mode='auto',key='',at=-1,timers=[],running=[],originalStyles=new Map(),extras=[],generation=0,internalClick=false,scene=null;
const save=(el,prop,val)=>{if(!el)return;if(!originalStyles.has(el))originalStyles.set(el,{});let obj=originalStyles.get(el);if(!(prop in obj))obj[prop]=el.style[prop];el.style[prop]=val;};
const animate=(el,frames,ms=700,delay=0)=>{
 if(!el||reduced.matches||typeof el.animate!=='function')return null;
 const a=el.animate(frames,{duration:ms,delay,easing:'cubic-bezier(.2,.72,.18,1)',fill:'both'});
 running.push(a);return a;
};
function later(fn,delay){const v=generation;const t=setTimeout(()=>{if(generation===v)fn();},delay);timers.push(t);}
function cleanup(){
 generation++;timers.forEach(clearTimeout);timers=[];
 running.forEach(a=>{try{a.cancel();}catch(e){}});running=[];
 originalStyles.forEach((map,el)=>{if(el.isConnected)Object.entries(map).forEach(([k,v])=>{el.style[k]=v;});});
 originalStyles.clear();
 extras.forEach(el=>el.remove());extras=[];
 document.body.classList.remove('v4-scene-repeat','v4-scene-prototype','v4-scene-graph');
}
function nativeClick(selector){
 const el=$(selector);if(!el)return;
 internalClick=true;try{el.click();}finally{internalClick=false;}
}
function currentScene(){
 const slide=$(kind==='study'?'.slide.is-active':'.slide.active');
 if(!slide)return null;
 const number=$$('.slide').indexOf(slide)+1;
 if(kind==='study'&&number===6)return {id:'graph',root:slide};
 if(kind==='adult'&&number===4)return {id:'repeat',root:slide};
 if(kind==='adult'&&number===6)return {id:'prototype',root:slide};
 return null;
}
const make=(tag,cls,html)=>{const node=document.createElement(tag);node.className=cls;node.innerHTML=html;return node;};
function setScene(id){
 if(id==='repeat')initRepeat();
 if(id==='prototype')initPrototype();
 if(id==='graph')initGraph();
}
function register(el){extras.push(el);return el;}
function initRepeat(){
 const demo=$('.repeat-demo',scene.root),tabs=$('.repeat-tabs',demo),lane=$('.repeat-lane',demo),quote=$('.repeat-quote',demo);
 if(!demo||!tabs||!lane)return;
 document.body.classList.add('v4-scene-repeat');
 const frame=make('div','v4-workflow-stage','<div class="v4-stage-top"><span>WORK / TRANSFORMATION</span><b id="v4-repeat-epoch">01 — EXECUTE</b></div><div class="v4-stage-content"></div><div class="v4-stage-bottom"><span id="v4-repeat-thesis">第一次：完成工作，但还没有沉淀方法</span><span class="v4-stage-arrow">↗</span></div>');
 tabs.insertAdjacentElement('afterend',frame);register(frame);
 save(lane,'display','none');if(quote)save(quote,'display','none');
 save(demo,'gap','9px');
 // Native state is the source of truth: stage items use the existing row labels.
 nativeClick('[data-repeat="0"]');
}
function labelsFromNative(){
 const rows=$$('.slide.active .repeat-lane .repeat-row');
 return rows.map(x=>x.querySelector('span,strong')?.textContent.trim()||x.textContent.trim()).map(x=>x.replace(/^\d+\s*[\/.-]?\s*/,''));
}
function repeatMarkup(phase){
 nativeClick('[data-repeat="'+phase+'"]');
 const labels=labelsFromNative();
 const shared=labels.slice(0,Math.max(0,labels.length-1)),special=labels[labels.length-1]||'继续本次任务';
 const list=(arr,mode='')=>arr.map((l,i)=>'<div class="v4-task '+mode+'"><span>'+String(i+1).padStart(2,'0')+'</span><b>'+escapeHTML(l)+'</b></div>').join('');
 const count=labels.length;
 if(phase===0)return '<div class="v4-single-stream"><div class="v4-big-label">01 <span>第一次</span></div><div class="v4-stream-items">'+list(labels)+'</div></div>';
 if(phase===1)return '<div class="v4-duplicate"><div class="v4-mini-stream"><div class="v4-mini-title">第一次 <b>从头做</b></div>'+list(labels)+'</div><div class="v4-repeat-glyph" aria-hidden="true">＝</div><div class="v4-mini-stream"><div class="v4-mini-title">第二次 <b>再次做</b></div>'+list(labels)+'</div></div>';
 return '<div class="v4-condensed"><div class="v4-reuse-file"><div class="v4-file-header"><span>METHOD / REUSE</span><strong>可复用的方法</strong></div><div class="v4-reusable-items">'+list(shared,'v4-shared')+'</div></div><div class="v4-large-connector" aria-hidden="true"><div></div><span>→</span></div><div class="v4-new-task"><small>NEXT / APPLY</small><strong>下次直接使用</strong><p>'+escapeHTML(special)+'</p></div></div>';
}
function escapeHTML(str){return String(str||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function slideContent(frame,markup){
 const content=$('.v4-stage-content',frame);
 if(!content)return;
 const old=content.firstElementChild;
 const node=make('div','v4-composition',markup);
 content.appendChild(node);
 animate(node,[{opacity:0,transform:'translateX(42px) scale(.94)',clipPath:'inset(0 0 0 45%)'},{opacity:1,transform:'translateX(0) scale(1)',clipPath:'inset(0 0 0 0)'}],850);
 if(old){
   const leave=old.animate([{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(-50px) scale(.88)'}],{duration:550,easing:'ease-in',fill:'forwards'});
   running.push(leave);
   const v=generation;leave.finished.then(()=>{if(generation===v)old.remove();}).catch(()=>{});
 }
}
function phaseRepeat(phase){
 const frame=$('.v4-workflow-stage',scene.root);if(!frame)return;
 const headings=['01 — EXECUTE','02 — REPEAT','03 — REUSE'];
 const ideas=['第一次：每个环节都需要重新完成','第二次：相同的步骤又执行了一遍','把可重复的方法留下，下一次直接使用'];
 $('#v4-repeat-epoch',frame).textContent=headings[phase];
 $('#v4-repeat-thesis',frame).textContent=ideas[phase];
 slideContent(frame,repeatMarkup(phase));
}
function initPrototype(){
 const room=$('.idea-room',scene.root),win=$('.idea-window',room),preview=$('#idea-preview',win);
 if(!room||!win||!preview)return;
 document.body.classList.add('v4-scene-prototype');
 save(room,'gridTemplateColumns','43% 57%');
 const stage=make('div','v4-proto-stage','<div class="v4-proto-scene"></div>');
 preview.insertAdjacentElement('beforebegin',stage);register(stage);
}
function phasePrototype(phase){
 nativeClick('[data-idea="'+phase+'"]');
 const room=$('.idea-room',scene.root),win=$('.idea-window',room),preview=$('#idea-preview',win),stage=$('.v4-proto-stage',win);
 if(!stage||!preview)return;
 const prompt=$('#idea-request',scene.root)?.textContent||'';
 const desc=phase===0?
  '<div class="v4-large-prompt"><div class="v4-label">IDEA / FROM REAL LIFE</div><div class="v4-idea-figure"><span>“</span><strong>一个真实需求</strong><p>把你希望完成的事情说清楚</p></div><div class="v4-prompt-target"><span>↓</span><b>确定目标，再寻找方法</b></div></div>':
  '<div class="v4-plan"><div class="v4-label">PLAN / THREE PARTS</div><div class="v4-plan-nodes"><div><small>01</small><strong>输入</strong><em>你提供什么</em></div><span>→</span><div><small>02</small><strong>处理</strong><em>规则与步骤</em></div><span>→</span><div><small>03</small><strong>结果</strong><em>得到什么</em></div></div><p>把一个想法拆成可执行的结构。</p></div>';
 const cols=['43% 57%','32% 68%','36% 64%'];
 save(room,'gridTemplateColumns',cols[phase]);
 if(phase<2){
   save(preview,'visibility','hidden');
   save(stage,'display','flex');
   slideContentPrototype($('.v4-proto-scene',stage),desc);
 }else{
   save(stage,'display','none');
   save(preview,'visibility','visible');
   animate(preview,[{opacity:0,transform:'scale(.83)',clipPath:'inset(22% 16% 22% 16%)'},{opacity:1,transform:'scale(1)',clipPath:'inset(0 0 0 0)'}],1250);
 }
}
function slideContentPrototype(parent,html){
 const node=make('div','v4-proto-composition',html);
 const old=parent.firstElementChild;parent.appendChild(node);
 animate(node,[{opacity:0,transform:'scale(.75)',clipPath:'inset(15% 15% 15% 15%)'},{opacity:1,transform:'scale(1)',clipPath:'inset(0 0 0 0)'}],900);
 if(old){const a=animate(old,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.72)'}],520);const v=generation;a?.finished.then(()=>{if(generation===v)old.remove();}).catch(()=>{});}
}
function initGraph(){
 const graph=$('.network',scene.root);
 if(!graph)return;
 document.body.classList.add('v4-scene-graph');
 scene.root.getAnimations({subtree:true}).forEach(a=>{try{a.cancel();}catch(e){}});
 const halo=make('div','v4-halo','<div></div>');graph.insertBefore(halo,graph.firstChild);register(halo);
 $$('.graph-links path',graph).forEach(p=>{save(p,'opacity','0');save(p,'strokeWidth','2.0');});
 $$('.knowledge-node:not(.core)',graph).forEach(n=>save(n,'opacity','0'));
 const core=$('.knowledge-node.core',graph);if(core)animate(core,[{transform:'translate(-50%,-50%) scale(1.5)'},{transform:'translate(-50%,-50%) scale(1)'}],1000);
 animate(halo,[{opacity:0,transform:'translate(-50%,-50%) scale(.15)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],1100);
}
function expandNodes(nodes){
 const graph=$('.network',scene.root);if(!graph)return;
 const G=graph.getBoundingClientRect(),cx=G.left+G.width/2,cy=G.top+G.height/2;
 nodes.forEach((n,i)=>{
   const b=n.getBoundingClientRect(),dx=cx-b.left-b.width/2,dy=cy-b.top-b.height/2;
   save(n,'opacity','1');
   animate(n,[{opacity:0,transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px)) scale(.42)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],1150,i*110);
 });
}
function pathDraw(sel,ms){
 const el=$(sel,scene.root);if(!el||typeof el.getTotalLength!=='function')return;
 const len=el.getTotalLength();save(el,'opacity','1');save(el,'strokeDasharray',String(len));
 animate(el,[{strokeDashoffset:len,opacity:.15},{strokeDashoffset:0,opacity:1}],ms);
}
function phaseGraph(phase){
 const graph=$('.network',scene.root);if(!graph)return;
 const nodes=$$('.knowledge-node',graph);
 if(phase===0)return;
 if(phase===1){pathDraw('.graph-links .strong-link',1400);expandNodes(nodes.slice(1,6));}
 if(phase===2){pathDraw('.graph-links .mesh',1500);expandNodes(nodes.slice(6));const halo=$('.v4-halo',graph);animate(halo,[{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-50%) scale(1.8)',opacity:.22}],1800);}
}
const stories={
 graph:{title:'从一个知识点 → 生长为知识网络',names:['知识起点','建立主要关联','扩展为完整知识网络'],intervals:[1300,2200,2100],render:phaseGraph},
 repeat:{title:'从重复劳动 → 转化为可复用流程',names:['第一次执行','第二次重复','保留方法，压缩重复劳动'],intervals:[1950,2600,2400],render:phaseRepeat},
 prototype:{title:'从一句需求 → 生成工具结构',names:['自然语言需求','拆解成可执行结构','结构变成可试用的界面'],intervals:[1900,2300,2200],render:phasePrototype}
};
function stepTo(idx){
 if(!scene||idx>=stories[scene.id].names.length)return;
 at=idx;stories[scene.id].render(idx);
 counter.textContent=(idx+1)+' / '+stories[scene.id].names.length+' · '+stories[scene.id].names[idx];
 $('[data-action="next"]',host).disabled=mode!=='step'||idx>=stories[scene.id].names.length-1;
 compactNext.hidden=mode!=='step'||idx>=stories[scene.id].names.length-1;
}
function refresh(force=false){
 const nextScene=currentScene();
 if(!force && nextScene?.id===key)return;
 cleanup();scene=nextScene;key=nextScene?.id||'';at=-1;compactNext.hidden=true;
 if(!scene){counter.textContent='非重点场景，保留原版';return;}
 $('.v4-console-title',host).textContent=stories[scene.id].title;
 if(mode==='off'||reduced.matches){counter.textContent=reduced.matches?'已遵循减少动态效果设置':'原版 · 不加动画';return;}
 setScene(scene.id);
 if(mode==='auto'){
   let delay=280;
   stories[scene.id].names.forEach((_,i)=>{later(()=>stepTo(i),delay);delay+=stories[scene.id].intervals[i];});
 }else{stepTo(0);}
}
function fold(){panel.hidden=true;toggle.setAttribute('aria-expanded','false');$('b',toggle).textContent='+';}
toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));$('b',toggle).textContent=panel.hidden?'+':'−';});
$$('[data-mode]',host).forEach(b=>b.addEventListener('click',()=>{
 mode=b.dataset.mode;$$('[data-mode]',host).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 refresh(true);fold();
}));
$('[data-action="restart"]',host).addEventListener('click',()=>{refresh(true);fold();});
$('[data-action="next"]',host).addEventListener('click',()=>{if(mode==='step')stepTo(at+1);});
compactNext.addEventListener('click',()=>{if(mode==='step')stepTo(at+1);});
document.addEventListener('click',e=>{
 if(internalClick||e.target.closest('#v4-console'))return;
 const button=e.target.closest('[data-repeat],[data-idea],[data-node]');
 if(!button||!scene||mode==='off')return;
 // Manual interaction cancels queued autoplay immediately.
 generation++;timers.forEach(clearTimeout);timers=[];
 const active=scene.id;
 if(active==='repeat'&&button.matches('[data-repeat]'))later(()=>{stepTo(Number(button.dataset.repeat));},65);
 if(active==='prototype'&&button.matches('[data-idea]'))later(()=>{stepTo(Number(button.dataset.idea));},65);
},true);
const stage=$(kind==='study'?'#deck':'.stage');
if(stage)new MutationObserver(changes=>{
 if(changes.some(change=>change.target.classList?.contains('slide')))refresh();
}).observe(stage,{attributes:true,attributeFilter:['class'],subtree:true});
reduced.addEventListener('change',()=>refresh(true));
window.addEventListener('pagehide',cleanup);
refresh(true);
})();