/* Home Motion V5 — HTML experiment. One question -> different causes -> learning loop. */
(() => {
'use strict';
const visual=document.querySelector('.hero-visual'),hero=document.querySelector('.hero');
if(!visual||!hero||document.querySelector('.home-morph-stage'))return;
const flow=Array.from(visual.querySelectorAll('.flow-step'));
const low=matchMedia('(prefers-reduced-motion:reduce)');
if(flow.length!==5||low.matches)return;
const original=flow.map((el,i)=>({n:String(i+1).padStart(2,'0'),t:el.querySelector('strong')?.textContent?.trim()||'',d:el.querySelector('small')?.textContent?.trim()||''}));
const stages=[
 {heading:'从一个真实问题出发。',sub:'先不要急着寻找工具，而是判断究竟发生了什么。',items:[{n:'?',t:'学习遇到了困难。',d:'真正的问题在哪里？'}]},
 {heading:'表面相似，原因可能不同。',sub:'知识理解、学习方法、反馈节奏，需要不同的支持。',items:[
 {n:'01',t:'知识理解',d:'听懂了，是否真正掌握？'},
 {n:'02',t:'学习方法',d:'有努力，是否形成有效路径？'},
 {n:'03',t:'反馈节奏',d:'出错之后，能否及时改进？'}]},
 {heading:'把支持组织成可持续的系统。',sub:'从发现问题，到让经验参与下一次学习。',items:original}
];
const overlay=document.createElement('div');
overlay.className='home-morph-stage';overlay.dataset.phase='0';
overlay.setAttribute('aria-label','从真实问题到五步学习闭环的叙事演示');
overlay.innerHTML='<div class="home-morph-intro"><div class="home-morph-kicker">FROM A QUESTION TO A LEARNING SYSTEM</div>'+
'<h2 class="home-morph-title"></h2><p class="home-morph-sub"></p></div><div class="home-morph-nodes"></div>'+
'<div class="home-morph-footer"><span class="home-morph-phase">01 / 03 · 看见问题</span><div class="home-morph-track"><span></span></div></div>';
const region=overlay.querySelector('.home-morph-nodes');
const nodes=Array.from({length:5},(_,i)=>{
 const n=document.createElement('div');n.className='home-morph-node';n.dataset.index=i;
 n.innerHTML='<b></b><div><strong></strong><small></small></div><span class="home-morph-index"></span>';
 region.appendChild(n);return n;
});
visual.appendChild(overlay);
const control=document.createElement('button');control.className='home-morph-control';control.type='button';control.textContent='跳过开场 ↗';visual.appendChild(control);
let running=false,finished=false,started=false,version=0,timers=[],anims=[];
const title=overlay.querySelector('.home-morph-title'),sub=overlay.querySelector('.home-morph-sub');
const phaseText=['01 / 03 · 看见问题','02 / 03 · 分辨原因','03 / 03 · 建立系统'];
function later(fn,ms){const v=version;timers.push(setTimeout(()=>{if(v===version)fn();},ms));}
function clear(){version++;timers.forEach(clearTimeout);timers=[];anims.forEach(a=>{try{a.cancel();}catch(e){}});anims=[];}
function show(step,doAnimate){
 const state=stages[step],prior=nodes.map(n=>n.getBoundingClientRect());
 overlay.dataset.phase=String(step);title.textContent=state.heading;sub.textContent=state.sub;
 overlay.querySelector('.home-morph-phase').textContent=phaseText[step];
 overlay.querySelector('.home-morph-track span').style.width=((step+1)/3*100)+'%';
 nodes.forEach((node,i)=>{
  const it=state.items[i];node.classList.toggle('home-morph-empty',!it);
  node.querySelector('b').textContent=it?.n||'';
  node.querySelector('strong').textContent=it?.t||'';
  node.querySelector('small').textContent=it?.d||'';
  node.querySelector('.home-morph-index').textContent=step===2&&i===4?'↻':'↘';
 });
 if(!doAnimate)return;
 nodes.forEach((node,i)=>{
  const p=prior[i],r=node.getBoundingClientRect();
  if(!r.width||!p.width)return;
  const dx=p.x-r.x,dy=p.y-r.y,sx=p.width/r.width,sy=p.height/r.height;
  const presentPreviously=i<stages[step-1].items.length,nowVisible=i<state.items.length;
  const a=node.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+sx+','+sy+')',opacity:presentPreviously?1:0},{transform:'translate(0,0) scale(1)',opacity:nowVisible?1:0}],{duration:950,delay:i*80,easing:'cubic-bezier(.18,.84,.22,1)',fill:'both'});
  anims.push(a);a.finished.then(()=>{try{a.cancel();}catch(e){}}).catch(()=>{});
 });
 const a=title.animate([{opacity:.3,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:450,easing:'ease-out'});anims.push(a);
}
function finish(){
 if(finished)return;
 clear();running=false;finished=true;
 hero.classList.remove('home-morph-running');
 overlay.classList.add('home-morph-done');
 control.textContent='重播开场 ↺';control.setAttribute('aria-label','重播首页开场动画');
 later(()=>{overlay.hidden=true;},500);
}
function play(){
 clear();finished=false;running=true;overlay.hidden=false;overlay.classList.remove('home-morph-done');hero.classList.add('home-morph-running');
 control.textContent='跳过开场 ↗';control.setAttribute('aria-label','跳过首页开场动画');
 show(0,false);later(()=>show(1,true),1500);later(()=>show(2,true),3500);later(finish,6250);
}
control.addEventListener('click',()=>{if(running)finish();else play();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)finish();});
const observer=new IntersectionObserver(es=>{
 if(es.some(e=>e.isIntersecting&&e.intersectionRatio>=.22)&&!started){started=true;play();observer.disconnect();}
},{threshold:[.22,.3,.5]});
hero.classList.add('home-morph-running');show(0,false);observer.observe(visual);
addEventListener('pagehide',()=>{clear();observer.disconnect();hero.classList.remove('home-morph-running');});
low.addEventListener('change',()=>{if(low.matches){finish();control.hidden=true;}});
})();