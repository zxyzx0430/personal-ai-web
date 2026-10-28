/* Isolated HTML animation prototype. Never deploy on the production website. */
(function () {
'use strict';
var type = location.pathname.includes('/study/') ? 'study' : location.pathname.includes('/adult/') ? 'adult' : location.pathname.includes('/about/') ? 'about' : '';
if (!type) return;
var plans = {
 about: {
  hero: [['标题','.hero h1'],['副标题','.hero-intro'],['五步学习流程','.flow-step'],['进入下一步','.hero .actions']],
  problems: [['引出问题','.sec-head'],['四个问题','.problem']],
  method: [['方法选择','.sec-head'],['支持路径','.method-card']],
  needs: [['需求思考','.sec-head'],['需求卡片','.growth-card']],
  resources: [['免费资源','.sec-head'],['资料入口','.asset']],
  contact: [['从真实问题开始','.contact h2'],['联系方式','.contact-panel']]
 },
 study: {
  1:[['主张','.cover-copy'],['角色协作','.cover-art']],
  2:[['提出困境','.section-head'],['四个不同困境','.four-cards > *'],['问题总结','.question-banner']],
  3:[['个性化学习','.section-head'],['对比机制','.duo-compare > *'],['诊断路径','.route-step'],['反馈结论','.feedback-band']],
  4:[['知识可视化','.demo-split'],['交互提示','.note-line']],
  5:[['长期记忆','.section-head'],['记录步骤','.archive-step'],['形成经验','.note-sheet']],
  6:[['知识网络','.knowledge-head'],['关系生长','.graph-links path, .graph-links line'],['知识节点','.knowledge-node']],
  7:[['学习场景','.timeline-heading'],['时间线','.day-node'],['总结','.routine-note']],
  8:[['长期成长','.page-content > *']],
  9:[['三方分工','.section-head'],['角色进入','.stack-row'],['协作机制','.system-process']],
  10:[['体系总结','.section-head'],['核心优势','.three-forces > *'],['成长方向','.advancement-grid > *']]
 },
 adult: {
  1:[['开场','.cover-hero'],['系统流程','.workflow-fragment'],['核心表达','.cover-bottom']],
  2:[['四个问题','.problem-intro'],['不同困扰','.problem']],
  3:[['先诊断再解决','.story-intro'],['五步拆解','.process-step'],['诊断反馈','.inspector']],
  4:[['重复工作','.explainer'],['重复流程','.repeat-row'],['复用结论','.repeat-quote']],
  5:[['信息复用','.memory-copy'],['历史文件','.vault-file'],['关系连接','.graph-pane svg line'],['知识节点','.graph-node'],['说明','.node-info']],
  6:[['提出想法','.idea-head'],['自然语言输入','#idea-request'],['行动步骤','.idea-steps button'],['原型形成','#idea-preview > *']],
  7:[['工具协作','.system-intro'],['流程推进','.system-flow > *'],['结果展示','.system-demo > *']],
  8:[['真实需求','.scene-top'],['不同人群','.scene-menu > *'],['解决路径','.case-segment']],
  9:[['长期积累','.cycle-copy'],['循环过程','.cycle-node'],['新增经验','.cycle-note']],
  10:[['核心能力','.cap-copy'],['能力阶梯','.cap-item'],['学习选择','.delivery-choice']],
  11:[['邀请行动','.ending-copy'],['真实问题','.question-card'],['最后说明','.ending-foot']]
 }
};
var host=document.createElement('aside');
host.id='motion-lab-ui';
host.setAttribute('aria-label','动画实验室控制器');
host.innerHTML='<div class="motion-lab-top"><span>● MOTION LAB <small>HTML 实验版</small></span><button id="motion-lab-fold" aria-expanded="true" title="折叠控制器">−</button></div>'+
'<div class="motion-lab-content"><div class="motion-lab-modes" role="group" aria-label="动画模式">'+
'<button data-lab-mode="auto" aria-pressed="true">自动</button><button data-lab-mode="step" aria-pressed="false">逐步</button><button data-lab-mode="off" aria-pressed="false">关闭</button></div>'+
'<div class="motion-lab-actions"><button id="motion-lab-replay">↺ 重播</button><button id="motion-lab-next" disabled>下一拍 →</button></div>'+
'<div class="motion-lab-status" role="status" aria-live="polite">动画准备就绪</div><a href="/motion-spec.html" target="_blank" rel="noopener">查看动画设计规范 ↗</a></div>';
document.body.appendChild(host);
// On phones, start with only a compact handle so the lab panel does not obstruct slides.
if (matchMedia('(max-width:700px)').matches) {
 host.classList.add('motion-lab-folded');
 var foldButton=host.querySelector('#motion-lab-fold');
 foldButton.textContent='+'; foldButton.setAttribute('aria-expanded','false');
}
var mode='auto',key='',groups=[],step=-1,active=[],timers=[],hidden=[],original=new Map(),frame=0;
var reduced=matchMedia('(prefers-reduced-motion: reduce)');
var next=host.querySelector('#motion-lab-next'), status=host.querySelector('.motion-lab-status');
var q=function(s,r){return Array.from((r||document).querySelectorAll(s));};
var later=function(fn,n){timers.push(setTimeout(fn,n));};
function reset(){
 timers.forEach(clearTimeout);timers=[];
 if(frame)cancelAnimationFrame(frame);frame=0;
 active.forEach(function(a){try{a.cancel();}catch(e){}});active=[];
 hidden.forEach(function(el){el.style.visibility='';});hidden=[];
 original.forEach(function(v,el){if(el.isConnected)el.textContent=v;});original.clear();
}
function selected(){
 if(type==='about'){
   var sections=[document.querySelector('.hero')].concat(q('section.section')).filter(Boolean);
   var y=innerHeight*.38;
   var nearest=sections.reduce(function(best,el){var r=el.getBoundingClientRect(),d=y<r.top?r.top-y:y>r.bottom?y-r.bottom:0;return(!best||d<best.dist)?{el:el,dist:d}:best;},null);
   var area=nearest&&nearest.el;var id=area&&(area.classList.contains('hero')?'hero':area.id);
   return area?{id:'about:'+id,el:area,plan:plans.about[id]||[]}:null;
 }
 var el=document.querySelector(type==='study'?'.slide.is-active':'.slide.active');if(!el)return null;
 var n=q('.slide').indexOf(el)+1;
 return {id:type+':'+n,el:el,plan:plans[type][n]||[]};
}
function build(info){
 var result=[];
 info.plan.forEach(function(pair){
  var els=q(pair[1],info.el);if(!els.length)return;
  var separate=/(\.flow-step$|\.problem$|\.process-step$|\.repeat-row$|\.workflow-fragment$|\.day-node$|\.cap-item$|\.graph-node$|\.knowledge-node$|\.route-step$|\.four-cards > \*$)/.test(pair[1]);
  if(separate)els.forEach(function(el,i){result.push({name:pair[0]+' '+(i+1),els:[el]});});
  else result.push({name:pair[0],els:els});
 });
 return result;
}
function typewrite(el,delay){
 var content=el.textContent||'';if(!content||original.has(el))return;
 original.set(el,content);
 later(function(){
  var chars=Array.from(content),start=performance.now(),duration=Math.max(650,Math.min(2300,chars.length*46));
  el.textContent='';
  function update(now){
   var ratio=Math.min(1,(now-start)/duration);
   el.textContent=chars.slice(0,Math.floor(chars.length*ratio)).join('')+(ratio<1?'▏':'');
   if(ratio<1)frame=requestAnimationFrame(update);
  }
  frame=requestAnimationFrame(update);
 },delay);
}
function animate(el,delay){
 if(!el.isConnected)return;
 var line=el instanceof SVGElement&&/^(line|path|polyline)$/i.test(el.tagName)&&typeof el.getTotalLength==='function';
 var k;
 if(line){
  var len=el.getTotalLength()||200;
  k=[{opacity:.1,strokeDasharray:String(len),strokeDashoffset:len},{opacity:1,strokeDasharray:String(len),strokeDashoffset:0}];
 }else k=[{opacity:0,translate:'0 24px',filter:'blur(3px)'},{opacity:1,translate:'0 0',filter:'blur(0px)'}];
 active.push(el.animate(k,{duration:line?880:580,delay:delay,easing:line?'ease-in-out':'cubic-bezier(.18,.85,.24,1)',fill:'both'}));
 if(el.id==='idea-request')typewrite(el,delay+170);
}
function advance(){
 if(mode!=='step'||step>=groups.length-1)return;
 step++;
 var g=groups[step];
 g.els.forEach(function(el,i){el.style.visibility='visible';animate(el,i*95);});
 next.disabled=step>=groups.length-1;
 status.textContent=(step+1)+' / '+groups.length+' · '+g.name;
}
function play(force){
 var info=selected();if(!info||(!force&&info.id===key))return;
 reset();key=info.id;groups=build(info);step=-1;
 next.disabled=mode!=='step'||!groups.length;
 if(reduced.matches||mode==='off'){status.textContent=reduced.matches?'已遵循系统减少动态效果设置':'动画已关闭 · 原有内容保留';return;}
 if(!groups.length){status.textContent='当前区域没有实验动画';return;}
 if(mode==='step'){
  groups.forEach(function(g){g.els.forEach(function(el){if(!hidden.includes(el)){el.style.visibility='hidden';hidden.push(el);}});});
  advance();
 }else{
  groups.forEach(function(g,i){g.els.forEach(function(el,j){animate(el,i*345+j*95);});});
  status.textContent='自动播放 · '+groups.length+' 拍 · '+info.id;
 }
}
host.querySelectorAll('[data-lab-mode]').forEach(function(b){
 b.addEventListener('click',function(){
  mode=b.getAttribute('data-lab-mode');
  host.querySelectorAll('[data-lab-mode]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
  play(true);
 });
});
host.querySelector('#motion-lab-replay').addEventListener('click',function(){play(true);});
next.addEventListener('click',advance);
host.querySelector('#motion-lab-fold').addEventListener('click',function(){
 var closed=host.classList.toggle('motion-lab-folded');
 this.textContent=closed?'+':'−';this.setAttribute('aria-expanded',String(!closed));
});
if(type==='about'){
 var ticking=false;
 window.addEventListener('scroll',function(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;play(false);});},{passive:true});
}else{
 var stage=document.querySelector(type==='study'?'#deck':'.stage');
 if(stage)new MutationObserver(function(changes){
  if(changes.some(function(m){return m.target.classList&&m.target.classList.contains('slide');}))play(false);
 }).observe(stage,{subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-process],[data-repeat],[data-idea],[data-cycle],[data-case]');
  if(b&&mode!=='off')later(function(){play(true);},70);
 });
}
window.addEventListener('pagehide',reset);
reduced.addEventListener('change',function(){play(true);});
play(true);
})();