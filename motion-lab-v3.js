/* Motion Lab V3 — curated narrative scenes, HTML prototype only.
   Do not reuse direct DOM manipulation in the future React implementation.
   Native site layout, content and business interactions remain authoritative. */
(() => {
  'use strict';
  const kind=location.pathname.includes('/study/')?'study':location.pathname.includes('/adult/')?'adult':location.pathname.includes('/about/')?'about':'';
  if(!kind)return;
  const q=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const one=(s,r=document)=>r.querySelector(s);
  const low=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.createElement('aside');
  root.id='lab-v3';
  root.setAttribute('aria-label','动效叙事实验 V3');
  root.innerHTML='<button type="button" class="lab-v3-handle" aria-expanded="false">MOTION / V3 <span>+</span></button>'+
    '<div class="lab-v3-controls" hidden>'+
    '<div class="lab-v3-name" aria-live="polite">请选择一个演示场景</div>'+
    '<div class="lab-v3-modes"><button data-mode="auto" aria-pressed="true">自动</button><button data-mode="step" aria-pressed="false">逐步</button><button data-mode="off" aria-pressed="false">静态</button></div>'+
    '<div class="lab-v3-progress"><span></span></div>'+
    '<div class="lab-v3-actions"><button data-action="replay">重新演示 ↺</button><button data-action="next">下一步 →</button></div>'+
    '<div class="lab-v3-caption" role="status" aria-live="polite">动画是说明工具，不改变原网页操作</div>'+
    '<a href="/motion-spec.html" target="_blank" rel="noopener">查看场景和版本说明</a></div>';
  document.body.appendChild(root);
  const handle=one('.lab-v3-handle',root), controls=one('.lab-v3-controls',root), title=one('.lab-v3-name',root), caption=one('.lab-v3-caption',root), bar=one('.lab-v3-progress span',root), next=one('[data-action="next"]',root);
  function fold(val){controls.hidden=!!val;handle.setAttribute('aria-expanded',String(!val));one('span',handle).textContent=val?'+':'−';}
  handle.addEventListener('click',()=>fold(!controls.hidden));
  let mode='auto',sceneId='',steps=[],step=-1, timers=[],animations=[],added=[],saved=new Map(), rafs=[],synthetic=false, userInterrupted=false, revision=0, typing=null;
  const timeline={};
  const task=(fn,ms)=>{const epoch=revision;timers.push(setTimeout(()=>{if(epoch===revision)fn();},ms));};
  function save(el,k,value){if(!el)return;if(!saved.has(el))saved.set(el,{});const v=saved.get(el);if(!(k in v))v[k]=el.style[k];el.style[k]=value;}
  function clean(){
    if(typing && typing.el.isConnected && typing.el.textContent===typing.last){typing.el.textContent=typing.original;}
    typing=null;
    revision++;timers.forEach(clearTimeout);timers=[];
    rafs.forEach(cancelAnimationFrame);rafs=[];
    animations.forEach(a=>{try{a.cancel();}catch(e){}});animations=[];
    added.forEach(el=>el.remove());added=[];
    saved.forEach((value,el)=>{if(el.isConnected)for(const [k,v] of Object.entries(value))el.style[k]=v;});saved.clear();
    q('.labv3-focus,.labv3-node-hot,.labv3-done').forEach(el=>el.classList.remove('labv3-focus','labv3-node-hot','labv3-done'));
  }
  function anim(el,frames,ms=550,delay=0,ease='cubic-bezier(.18,.75,.22,1)'){
    if(!el||!el.isConnected||low.matches)return;
    const a=el.animate(frames,{duration:ms,delay,easing:ease,fill:'both'});
    animations.push(a);
    return a;
  }
  function linesDraw(path,ms=1000) {
    if(!path||typeof path.getTotalLength!=='function')return;
    const len=path.getTotalLength();
    if(!(len>0))return;
    save(path,'strokeDasharray',String(len));
    save(path,'strokeDashoffset',String(len));
    save(path,'opacity','1');
    anim(path,[{strokeDashoffset:len,opacity:.1},{strokeDashoffset:0,opacity:1}],ms,0,'ease-in-out');
  }
  function focus(el,ms=500){
    q('.labv3-focus').forEach(x=>x.classList.remove('labv3-focus'));
    if(!el)return;
    el.classList.add('labv3-focus');
    // Transient illumination only; never leave a painted rectangle behind.
    if(!low.matches){
      const pulse=el.animate([{backgroundColor:'rgba(0,47,167,0)'},{backgroundColor:'rgba(0,47,167,.045)'},{backgroundColor:'rgba(0,47,167,0)'}],{duration:ms,fill:'none',easing:'ease-out'});
      animations.push(pulse);
    }
  }
  function rail(container,ratio){
    if(!container)return;
    save(container,'position','relative');
    let track=one(':scope > .labv3-rail',container);
    if(!track){track=document.createElement('span');track.className='labv3-rail';track.setAttribute('aria-hidden','true');container.appendChild(track);added.push(track);}
    const old=Number(track.dataset.progress||0);
    track.dataset.progress=String(ratio);
    anim(track,[{transform:'scaleX('+old+')'},{transform:'scaleX('+ratio+')'}],500);
    track.style.transform='scaleX('+ratio+')';
  }
  function clickNative(selector) {
    const button=one(selector);if(!button)return;
    synthetic=true;try{button.click();}finally{synthetic=false;}
  }
  function reveal(el){
    if(!el)return;
    anim(el,[{opacity:.58,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0px)'}],380);
  }
  function paintSVG(el){if(!el)return;q('path',el).forEach(p=>linesDraw(p,600));}
  function illustrateLearningGap(card,index){
    const svg=one('.pain-figure svg',card);if(!svg)return;
    const paths=q('path',svg);
    if(index===0){
      // Understanding check passes, but application progress stops before the solid block.
      linesDraw(paths[0],650);
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');
      dot.setAttribute('cx','89');dot.setAttribute('cy','50');dot.setAttribute('r','3');dot.setAttribute('fill','#002fa7');
      svg.appendChild(dot);added.push(dot);
      anim(dot,[{transform:'translateX(0px)',opacity:0},{transform:'translateX(12px)',opacity:1},{transform:'translateX(25px)',opacity:0}],950,160,'ease-out');
    } else if(index===1){
      // The curve itself is constructed, rather than the entire card appearing.
      linesDraw(paths[1],930);
      const p=svg.querySelector('rect');
      anim(p,[{opacity:.2},{opacity:1},{opacity:1}],970);
    } else if(index===2){
      // Draw the circular repetition before illuminating the unchanged error X.
      linesDraw(paths[0],980);
      anim(paths[2],[{opacity:1},{opacity:.15},{opacity:1},{opacity:.2},{opacity:1}],1000);
    } else if(index===3){
      // Move the clock hands to visualize lost time waiting for feedback.
      const hands=paths[0];
      if(hands){save(hands,'transformOrigin','72px 50px');save(hands,'transformBox','view-box');
        anim(hands,[{transform:'rotate(0deg)'},{transform:'rotate(96deg)'},{transform:'rotate(96deg)'},{transform:'rotate(0deg)'}],1100,0,'ease-in-out');}
    }
  }
  function typePrompt(){
    const el=one('#idea-request');if(!el)return;
    const original=el.textContent||'';
    if(!original)return;
    // Type into the existing text node for this HTML-only prototype. Always restore
    // the complete sentence before any next stage, navigation or manual interruption.
    const chars=Array.from(original),epoch=revision,duration=Math.min(2300,Math.max(1000,chars.length*62));
    typing={el:el,original:original,last:''};
    el.textContent='';
    const start=performance.now();
    function frame(t){
      if(epoch!==revision || !el.isConnected || !typing || typing.el!==el)return;
      if(el.textContent!==typing.last){typing=null;return;} // Native app updated the content.
      const p=Math.min(1,(t-start)/duration);
      const latest=chars.slice(0,Math.floor(chars.length*p)).join('')+(p<1?'▏':'');
      typing.last=latest;el.textContent=latest;
      if(p<1)rafs.push(requestAnimationFrame(frame));
      else {el.textContent=original;typing=null;}
    }
    rafs.push(requestAnimationFrame(frame));
  }
  function primeNetwork() {
    const graph=one('.slide.is-active .network');if(!graph)return;
    const slide=graph.closest('.slide');
    slide?.getAnimations({subtree:true}).forEach(a=>{try{a.cancel();}catch(e){}});
    q('.graph-links path',graph).forEach(p=>save(p,'opacity','0'));
    q('.knowledge-node:not(.core)',graph).forEach(n=>save(n,'opacity','0'));
  }
  function revealNodes(nodes) {
    nodes.forEach((n,i)=>{
      save(n,'opacity','1');
      anim(n,[{opacity:0,transform:'translate(-50%,-50%) scale(.93)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],520,i*90);
      n.classList.add('labv3-node-hot');
      task(()=>n.classList.remove('labv3-node-hot'),750+i*90);
    });
  }
  const plans={
    'about:hero': {
      name:'项目介绍 · 学习闭环',
      cues:[
        {name:'先从真实需求理解系统',ms:500,run(){reveal(one('.hero h1'));}},
        ...[0,1,2,3,4].map(i=>({name:'把学习流程推进至第 '+(i+1)+' 步',ms:750,run(){const steps=q('.hero .flow-step');focus(steps[i]);const list=steps[0]?.parentElement;rail(list,(i+1)/5);}})),
        {name:'由问题进入行动',ms:650,run(){const action=one('.hero .actions a, .hero .actions button');if(action)reveal(action);}}
      ]
    },
    'study:2': {
      name:'学生 · 四种不同的学习卡点',
      cues:[
        {name:'先观察：同样努力，卡点可能不同',ms:650,run(){reveal(one('.slide.is-active .section-head h2'));}},
        ...[0,1,2,3].map(i=>({name:['理解不是等于会做','有公式却没有直觉','纠错不等于掌握','当下疑问需要及时反馈'][i],ms:1050,run(){
          const card=q('.slide.is-active .four-cards > *')[i];focus(card,650);illustrateLearningGap(card,i);
        }})),
        {name:'回到真正的问题：需要知道卡在哪里',ms:800,run(){reveal(one('.slide.is-active .question-banner'));}}
      ]
    },
    'study:6': {
      name:'学生 · 知识如何连接为网络',
      init(){primeNetwork();},
      cues:[
        {name:'从一个知识点开始',ms:750,run(){const node=one('.slide.is-active .knowledge-node.core');node?.classList.add('labv3-node-hot');}},
        {name:'建立与相邻知识的主要联系',ms:1300,run(){const p=one('.slide.is-active .graph-links .strong-link');linesDraw(p,1150);}},
        {name:'相关知识节点被激活',ms:1050,run(){const v=q('.slide.is-active .knowledge-node');revealNodes(v.slice(1,6));}},
        {name:'连接向更远的知识扩散',ms:1300,run(){const p=one('.slide.is-active .graph-links .mesh');linesDraw(p,1150);}},
        {name:'形成可以迁移的知识结构',ms:1050,run(){const v=q('.slide.is-active .knowledge-node');revealNodes(v.slice(6));}}
      ]
    },
    'adult:3': {
      name:'成人 · 找出问题所在的环节',
      init(){clickNative('[data-process="0"]');},
      cues:[0,1,2,3,4].map(i=>({name:'检查工作链第 '+(i+1)+' 个环节',ms:1000,run(){
        clickNative('[data-process="'+i+'"]');
        const el=one('.slide.active .process-step.active');focus(el,480);rail(one('.slide.active #process-band'),(i+1)/5);
        reveal(one('.slide.active .inspector'));
      }}))
    },
    'adult:4': {
      name:'成人 · 从重复开始到真正复用',
      init(){clickNative('[data-repeat="0"]');},
      cues:[
        {name:'第一次：把任务按步骤完成',ms:1700,run(){clickNative('[data-repeat="0"]');rail(one('.slide.active .repeat-tabs'),1/3);reveal(one('.slide.active .repeat-lane'));}},
        {name:'第二次：如果只保存结果，仍会重复',ms:1900,run(){clickNative('[data-repeat="1"]');rail(one('.slide.active .repeat-tabs'),2/3);focus(one('.slide.active .repeat-lane'));reveal(one('.slide.active .repeat-quote'));}},
        {name:'第三次：保留方法，重复步骤不再全部从头来',ms:2000,run(){
          clickNative('[data-repeat="2"]');rail(one('.slide.active .repeat-tabs'),1);
          q('.slide.active .repeat-row.done').forEach((el,i)=>{el.classList.add('labv3-done');anim(el,[{opacity:1},{opacity:.7},{opacity:1}],600,i*115);});
          reveal(one('.slide.active .repeat-row:last-child'));focus(one('.slide.active .repeat-row:last-child'));
        }}
      ]
    },
    'adult:5': {
      name:'成人 · 历史信息重新参与任务',
      cues:[
        {name:'先找到一份历史资料',ms:900,run(){const el=one('.slide.active .vault-file');if(el){synthetic=true;try{el.click();}finally{synthetic=false;}}focus(el);}},
        {name:'资料与当前问题建立关系',ms:1200,run(){q('.slide.active .graph-pane svg line').forEach((l,i)=>{task(()=>linesDraw(l,650),i*120);});}},
        {name:'在知识网络中找到关键节点',ms:1100,run(){const el=q('.slide.active .graph-node')[2];if(el){synthetic=true;try{el.dispatchEvent(new MouseEvent('click',{bubbles:true}));}finally{synthetic=false;}el.classList.add('labv3-node-hot');}reveal(one('.slide.active .node-info'));}}
      ]
    },
    'adult:6': {
      name:'成人 · 一个想法如何变成原型',
      init(){clickNative('[data-idea="0"]');},
      cues:[
        {name:'先用自然语言说清楚想做什么',ms:2900,run(){typePrompt();}},
        {name:'明确需求：输入什么、想得到什么',ms:1300,run(){clickNative('[data-idea="0"]');reveal(one('.slide.active #idea-preview'));rail(one('.slide.active .idea-steps'),1/3);}},
        {name:'拆出可执行的制作步骤',ms:1500,run(){clickNative('[data-idea="1"]');reveal(one('.slide.active #idea-preview'));rail(one('.slide.active .idea-steps'),2/3);}},
        {name:'看到可以试用的原型，而不只是答案',ms:1600,run(){clickNative('[data-idea="2"]');rail(one('.slide.active .idea-steps'),1);reveal(one('.slide.active #idea-preview'));}}
      ]
    }
  };
  function current(){
    if(kind==='about'){
      const hero=one('.hero');if(!hero)return null;
      const r=hero.getBoundingClientRect();
      return (r.bottom>80&&r.top<innerHeight*.8)?'about:hero':'about:other';
    }
    const slide=one(kind==='study'?'.slide.is-active':'.slide.active');
    if(!slide)return null;
    return kind+':'+(q('.slide').indexOf(slide)+1);
  }
  function prepare(force=false) {
    const id=current();if(!id||(!force&&id===sceneId))return;
    clean();
    sceneId=id;
    const plan=plans[id];
    steps=plan?.cues||[];step=-1;userInterrupted=false;bar.style.width='0%';
    title.textContent=plan?.name||'原版动画 · 未做 V3 改动';
    caption.textContent=plan?'每一步都对应实际内容变化':'这个章节暂时保留原有 HTML 效果';
    if(!plan||low.matches||mode==='off'){
      if(low.matches)caption.textContent='已尊重系统减少动态效果设置';
      next.disabled=true;return;
    }
    if(plan.init)plan.init();
    next.disabled=mode!=='step';
    if(mode==='auto'){
      let wait=240;
      plan.cues.forEach((cue,i)=>{task(()=>run(i),wait);wait+=cue.ms;});
    }
  }
  function run(i) {
    if(i>=steps.length)return;
    step=i;
    const cue=steps[i];
    cue.run();
    caption.textContent=(i+1)+' / '+steps.length+' · '+cue.name;
    bar.style.width=(((i+1)/steps.length)*100)+'%';
    next.disabled=mode!=='step'||step===steps.length-1;
  }
  next.addEventListener('click',()=>{if(mode==='step')run(step+1);});
  root.querySelector('[data-action="replay"]').addEventListener('click',()=>{prepare(true);if(mode!=='step')fold(true);});
  q('[data-mode]',root).forEach(button=>{
    button.addEventListener('click',()=>{
      mode=button.dataset.mode;
      q('[data-mode]',root).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      prepare(true);
      if(mode!=='step')fold(true);
    });
  });
  // If the visitor interacts directly, the animation yields control immediately.
  document.addEventListener('click',e=>{
    if(synthetic||e.target.closest('#lab-v3'))return;
    const b=e.target.closest('[data-process],[data-repeat],[data-idea],[data-node],[data-file]');
    if(!b)return;
    timers.forEach(clearTimeout);timers=[];revision++;userInterrupted=true;
    task(()=>{
      if(b.matches('[data-process]')){focus(one('.slide.active .process-step.active'));const n=Number(b.dataset.process);rail(one('.slide.active #process-band'),(n+1)/5);reveal(one('.slide.active .inspector'));}
      if(b.matches('[data-repeat]')){rail(one('.slide.active .repeat-tabs'),(Number(b.dataset.repeat)+1)/3);focus(one('.slide.active .repeat-lane'));reveal(one('.slide.active .repeat-quote'));}
      if(b.matches('[data-idea]')){rail(one('.slide.active .idea-steps'),(Number(b.dataset.idea)+1)/3);reveal(one('.slide.active #idea-preview'));}
      if(b.matches('[data-node],[data-file]'))reveal(one('.slide.active .node-info'));
    },80);
  },true);
  if(kind==='about'){
    let busy=false;
    addEventListener('scroll',()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;prepare();});},{passive:true});
  } else {
    const stage=one(kind==='study'?'#deck':'.stage');
    if(stage)new MutationObserver(items=>{
      if(items.some(m=>m.target.classList?.contains('slide')))prepare();
    }).observe(stage,{subtree:true,attributes:true,attributeFilter:['class']});
  }
  low.addEventListener('change',()=>prepare(true));
  addEventListener('pagehide',clean);
  prepare(true);
})();