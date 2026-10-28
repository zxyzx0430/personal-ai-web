/* Personal AI System / About presentation V6
   Seven fully aligned pages. Only a few large, semantic transitions.
   Wheel, touch, keyboard, anchors and original interactive content coexist.
*/
(() => {
'use strict';
const main=document.querySelector('body > main');
if(!main||!document.querySelector('#problems')||window.__aboutV6)return;
window.__aboutV6=true;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const resources=$('#resources'),originalWrap=$(':scope > .wrap',resources),grid=$('.asset-grid',resources),source=$('.sources',resources),rule=$('.thin-rule',resources);
if(grid&&source){
 const extra=document.createElement('section');extra.id='explore';extra.className='section';
 const wrap=document.createElement('div');wrap.className='wrap';
 wrap.innerHTML='<div class="sec-head"><div class="sec-num mono">05 / EXPLORE</div><div><h2>继续探索。<br>自主判断。</h2><p>进一步观看内容讲解、交互学习演示，并查看原始资料与引用说明。</p></div></div>';
 extra.appendChild(wrap);
 const grid2=document.createElement('div');grid2.className='asset-grid more-asset-grid';
 $$('.asset',grid).slice(3).forEach(el=>grid2.appendChild(el));
 wrap.appendChild(grid2);
 if(rule)wrap.appendChild(rule);
 wrap.appendChild(source);
 resources.after(extra);
}
const footer=document.querySelector('body > footer');
if(footer){const contact=$('#contact');if(contact){contact.appendChild(footer);footer.classList.add('page-footer');}}
const slides=$$('main > section');
const names=['项目介绍','学习困境','学习方法','成长支持','免费资料','更多探索','联系作者'];
slides.forEach((s,i)=>{s.classList.add('v6-page');s.dataset.page=String(i);s.setAttribute('aria-label','第 '+(i+1)+' 页：'+names[i]);});
document.body.classList.add('about-v6');
const pager=document.createElement('nav');pager.className='v6-pager';pager.setAttribute('aria-label','首页分页导航');
pager.innerHTML='<div class="v6-page-list">'+names.map((name,i)=>'<button type="button" data-page="'+i+'" title="第 '+(i+1)+' 页：'+name+'" aria-label="第 '+(i+1)+' 页：'+name+'"><span>'+String(i+1).padStart(2,'0')+'</span><small>'+name+'</small></button>').join('')+'</div><div class="v6-page-actions"><button type="button" data-dir="-1" aria-label="上一页">↑</button><span class="v6-page-state" aria-live="polite">01 / 07</span><button type="button" data-dir="1" aria-label="下一页">↓</button></div>';
document.body.appendChild(pager);
const controls=$$('button[data-page]',pager),state=$('.v6-page-state',pager);
const readBtn=document.createElement('button');readBtn.type='button';readBtn.className='v6-read-btn';readBtn.textContent='阅读本页完整内容 ↓';readBtn.hidden=true;
document.body.appendChild(readBtn);
function updateReading(){
 const section=slides[current],tooLong=section.scrollHeight>section.clientHeight+8;
 readBtn.hidden=!tooLong;
 readBtn.textContent=readMode?'结束本页阅读 ✓':'阅读本页完整内容 ↓';
 readBtn.setAttribute('aria-pressed',String(readMode));
}
readBtn.addEventListener('click',()=>{readMode=!readMode;if(!readMode)slides[current].scrollTop=0;updateReading();});
let current=0,lockedUntil=0,timer=0,sceneAnimations=[],seeds=[],sceneTimers=[],sceneEpoch=0,readMode=false;
function cancelScene(){
 sceneEpoch++;sceneTimers.forEach(clearTimeout);sceneTimers=[];
 sceneAnimations.forEach(a=>{try{a.cancel();}catch(e){}});sceneAnimations=[];
 seeds.forEach(el=>el.remove());seeds=[];
 // A canceled transition must never leave a page's content hidden.
 slides.forEach(s=>s.classList.remove('v6-entry-pending'));
}
function armScene(i){
 if(!reduced.matches&&i>0)slides[i].classList.add('v6-entry-pending');
}
function releaseScene(i){
 slides[i].classList.remove('v6-entry-pending');
}
function delay(fn,ms){const v=sceneEpoch;sceneTimers.push(setTimeout(()=>{if(v===sceneEpoch)fn();},ms));}
function animate(el,frames,duration=850,delayMs=0){
 if(!el||reduced.matches)return;
 const a=el.animate(frames,{duration,delay:delayMs,easing:'cubic-bezier(.18,.78,.23,1)',fill:'both'});
 sceneAnimations.push(a);a.finished.then(()=>{try{a.cancel();}catch(e){}}).catch(()=>{});
 return a;
}
function seed(text,region){
 const el=document.createElement('div');el.className='v6-seed';el.textContent=text;region.appendChild(el);seeds.push(el);return el;
}
function fanOut(elements,region,phrase,{duration=760,stagger=65}={}){
 if(!region||!elements.length)return;
 region.classList.add('v6-stage-relative');
 // Use the real content cards themselves for the transformation, no opaque overlay.
 const c=region.getBoundingClientRect();
 elements.forEach((node,i)=>{
  const r=node.getBoundingClientRect();if(r.width<1)return;
  const dx=(c.x+c.width/2-r.x-r.width/2)*.43,dy=(c.y+c.height/2-r.y-r.height/2)*.43;
  animate(node,[{transform:'translate('+dx+'px,'+dy+'px) scale(.76)',opacity:0},
    {transform:'translate(0,0) scale(1)',opacity:1}],duration,i*stagger);
 });
}
function drawPath(region,nodes){
 if(!region)return;
 const line=document.createElement('i');line.className='v6-causal-track';region.appendChild(line);seeds.push(line);
 animate(line,[{transform:'scaleX(0)',opacity:.3},{transform:'scaleX(1)',opacity:1}],1450);
 nodes.forEach((n,i)=>animate(n,[{opacity:.55},{opacity:1}],480,i*420));
 delay(()=>line.remove(),2850);
}
function runScene(i){
 cancelScene();
 if(reduced.matches)return;
 // Start Web Animations while the original cards are still hidden.
 // The class is removed only AFTER animations with fill:both have been created.
 // This prevents the normal layout appearing for ~510ms before animation.
 armScene(i);
 const section=slides[i];
 try{switch(i){
 case 0:{
  // The first page's full 1→3→5 narrative is owned by home-morph.js.
  const b=$('.home-morph-control',section);
  if(b&&b.textContent.includes('重播'))b.click();
  break;
 }
 case 1:fanOut($$('.problem',section),$('.problem-grid',section),'同一个表面问题，可能有不同原因。',{duration:750,stagger:75});break;
 case 2:{
  const cards=$$('.method-card',section);
  fanOut(cards,$('.method',section),'先确认需要，再选择方法。',{duration:720,stagger:85});
  delay(()=>drawPath($('.method',section),cards),440);
  break;
 }
 case 3:fanOut($$('.growth-card',section),$('.growth-grid',section),'成长，不只有成绩。',{duration:780,stagger:75});break;
 case 4:{
  const cards=$$('.asset',section);
  fanOut(cards,$('.asset-grid',section),'真实问题 → 支持方案 → 研究判断',{duration:750,stagger:90});
  break;
 }
 case 5:{
  const cards=$$('.asset',section);
  fanOut(cards,$('.asset-grid',section),'观察 → 体验 → 独立判断',{duration:740,stagger:90});
  const refs=$('.sources',section);delay(()=>animate(refs,[{opacity:.3},{opacity:1}],850),650);
  break;
 }
 case 6:{
  const contact=$('.contact',section),panels=$$('.contact-panel',section);
  if(contact){const copy=contact.firstElementChild;animate(copy,[{opacity:.65,transform:'translateX(-30px)'},{opacity:1,transform:'translateX(0)'}],900);}
  if(panels.length){const parent=panels[0].parentElement;fanOut(panels,parent,'从真实问题开始交流',{duration:750,stagger:90});}
  break;
 }
 }}finally{
  // CSS hiding preserves card geometry. WAAPI now controls opacity/position.
  releaseScene(i);
 }
}
function updateNav(i){
 controls.forEach((b,j)=>{const yes=i===j;b.classList.toggle('is-active',yes);b.setAttribute('aria-current',yes?'page':'false');});
 state.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
 $('[data-dir="-1"]',pager).disabled=i<=0;
 $('[data-dir="1"]',pager).disabled=i>=slides.length-1;
}
function yOf(i){return slides[i].getBoundingClientRect().top-main.getBoundingClientRect().top+main.scrollTop;}
function pageTo(index,source='program'){
 const i=Math.min(slides.length-1,Math.max(0,index));
 if(source!=='force'&&i===current)return;
 current=i;readMode=false;slides[i].scrollTop=0;updateNav(i);updateReading();cancelScene();armScene(i);
 const top=yOf(i);
 main.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});
 clearTimeout(timer);
 timer=setTimeout(()=>{main.scrollTop=yOf(i);runScene(i);},reduced.matches?10:510);
 lockedUntil=performance.now()+760;
 if(i>0){const btn=$('.home-morph-control',slides[0]);if(btn&&btn.textContent.includes('跳过'))btn.click();}
}
function canReadWithin(slide,dy){
 if(slide.scrollHeight<=slide.clientHeight+8)return false;
 if(dy>0 && slide.scrollTop<slide.scrollHeight-slide.clientHeight-3)return true;
 if(dy<0 && slide.scrollTop>3)return true;
 return false;
}
main.addEventListener('wheel',e=>{
 if(e.ctrlKey||!e.deltaY||e.target.closest('dialog,[role="dialog"]'))return;
 const dy=e.deltaY;
 if(readMode && canReadWithin(slides[current],dy))return;
 e.preventDefault();
 if(performance.now()<lockedUntil)return;
 pageTo(current+Math.sign(dy),'wheel');
},{passive:false});
let touch=null;
main.addEventListener('touchstart',e=>{
 if(e.touches.length!==1)return;
 touch={x:e.touches[0].clientX,y:e.touches[0].clientY,sectionScroll:slides[current].scrollTop};
},{passive:true});
main.addEventListener('touchmove',e=>{
 if(!touch||readMode||e.touches.length!==1)return;
 const dx=e.touches[0].clientX-touch.x,dy=e.touches[0].clientY-touch.y;
 if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)*1.2)e.preventDefault();
},{passive:false});
main.addEventListener('touchend',e=>{
 if(!touch||e.changedTouches.length!==1)return;
 const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
 const old=touch;touch=null;
 if(Math.abs(dy)<70||Math.abs(dy)<Math.abs(dx)*1.2)return;
 const dir=dy<0?1:-1;
 if(readMode && canReadWithin(slides[current],dir))return;
 if(performance.now()>=lockedUntil)pageTo(current+dir,'touch');
},{passive:true});
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable],dialog'))return;
 const next=['ArrowDown','PageDown'],previous=['ArrowUp','PageUp'];
 if(!next.includes(e.key)&&!previous.includes(e.key)&&e.key!=='Home'&&e.key!=='End')return;
 e.preventDefault();
 if(performance.now()<lockedUntil)return;
 pageTo(e.key==='Home'?0:e.key==='End'?slides.length-1:current+(next.includes(e.key)?1:-1),'key');
},{capture:true});
controls.forEach((b,i)=>b.addEventListener('click',()=>pageTo(i,'navigation')));
$$('button[data-dir]',pager).forEach(b=>b.addEventListener('click',()=>pageTo(current+Number(b.dataset.dir),'navigation')));
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const id=a.getAttribute('href').slice(1),idx=slides.findIndex(s=>s.id===id);
 if(idx<0)return;
 e.preventDefault();pageTo(idx,'anchor');history.replaceState(null,'','#'+id);
}));
function alignFromScroll(){
 if(performance.now()<lockedUntil)return;
 const pos=main.scrollTop;
 let n=0,best=Infinity;
 slides.forEach((s,i)=>{const d=Math.abs(yOf(i)-pos);if(d<best){best=d;n=i;}});
 if(n!==current){current=n;readMode=false;updateReading();updateNav(n);runScene(n);}
}
main.addEventListener('scroll',()=>{requestAnimationFrame(alignFromScroll);},{passive:true});
window.addEventListener('resize',()=>{clearTimeout(timer);main.scrollTop=yOf(current);updateReading();},{passive:true});
reduced.addEventListener('change',()=>{cancelScene();main.scrollTop=yOf(current);});
let initial=slides.findIndex(s=>s.id===location.hash.slice(1));if(initial<0)initial=0;
current=initial;updateNav(initial);armScene(initial);main.scrollTop=yOf(initial);updateReading();
// The first visible state is now armed; release the early head-level paint guard.
document.documentElement.classList.remove('v6-boot-pending');
delay(()=>runScene(initial),240);
})();
