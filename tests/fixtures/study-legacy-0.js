
(() => {
  'use strict';
  const slides = [...document.querySelectorAll('#deck > .slide')];
  const $ = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const overview = $('overview');
  const names = slides.map(slide => slide.dataset.title);
  const categories = ['THE LEARNING SYSTEM','THE LEARNING GAP','PERSONALIZED TEACHING','MAKE KNOWLEDGE VISIBLE','LONG-TERM MEMORY','CONNECTED KNOWLEDGE','YOUR EVERYDAY LEARNING','LEARNING THAT STAYS','THE COMPLETE PICTURE','WHY THE SYSTEM IS ADVANCED'];
  document.querySelector('.pages-total').textContent = `/ ${String(slides.length).padStart(2,'0')}`;
  let current = -1;
  let animations = [];
  let paused = false;
  let staticMode = reducedMotion.matches;
  let explicitMotionPreference = false;
  let toastTimer;
  let raf = 0;
  let lastFrame = 0;
  try { const saved = localStorage.getItem('learning-system-static'); if(saved !== null) {staticMode = saved === '1';explicitMotionPreference = true;} } catch {}

  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('show');
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 3200);
  }
  function animate(element, frames, options = {}) {
    if(!element || staticMode) return null;
    const a = element.animate(frames, {duration:650, easing:'cubic-bezier(.16,1,.3,1)', fill:'both', ...options});
    animations.push(a);
    if(paused || document.hidden) a.pause();
    return a;
  }
  function cancelAnimations() {
    for(const a of animations) a.cancel();
    animations = [];
  }
  function playSlide() {
    cancelAnimations();
    const s = slides[current];
    if(!s || staticMode) return;
    const elements = [...s.querySelectorAll('[data-reveal]')];
    elements.forEach((el,i) => animate(el,[{opacity:0,transform:'translateY(23px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(i*85,650),duration:750}));
    if(current === 0) {
      const triangle = s.querySelector('.path');
      animate(triangle,[{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:2000,delay:350});
      animate(s.querySelector('.travel-points'),[{transform:'translate(0px,0px)'},{transform:'translate(-160px,265px)'},{transform:'translate(160px,265px)'},{transform:'translate(0px,0px)'}],{duration:9000,iterations:Infinity,easing:'linear'});
    }
    if(current === 2) {
      s.querySelectorAll('[data-route]').forEach((route,r) => route.querySelectorAll('[data-route-step]').forEach((el,i) => animate(el,[{opacity:.05,transform:'translateX(-22px)'},{opacity:1,transform:'translateX(0)'}],{delay:650+r*160+i*340,duration:700})));
    }
    if(current === 4) {
      s.querySelectorAll('[data-archive-step]').forEach((el,i) => animate(el,[{opacity:0,transform:'translateX(-25px)'},{opacity:1,transform:'translateX(0)'}],{delay:250+i*170}));
      animate(s.querySelector('[data-archive-note]'),[{opacity:0,transform:'translate(35px,25px) rotate(2deg)'},{opacity:1,transform:'translate(0,0) rotate(0)'}],{delay:600,duration:1100});
      s.querySelectorAll('.note-rows > *').forEach((el,i) => animate(el,[{opacity:0,transform:'translateX(14px)'},{opacity:1,transform:'translateX(0)'}],{delay:1000+Math.floor(i/2)*170,duration:550}));
      s.querySelectorAll('.archive-links span').forEach((el,i) => animate(el,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{delay:1650+i*120}));
    }
    if(current === 5) {
      s.querySelectorAll('.graph-links path').forEach((el,i) => animate(el,[{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:2200,delay:450+i*300}));
      s.querySelectorAll('[data-node]').forEach((el,i) => animate(el,[{opacity:0,transform:'translate(-50%,-50%) scale(.8)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{delay:300+i*160,duration:850}));
    }
    if(current === 6) {
      s.querySelectorAll('[data-day] .day-label').forEach((el,i) => animate(el,[{opacity:0,transform:`translateY(${i%2 ? 20 : -20}px)`},{opacity:1,transform:'translateY(0)'}],{delay:350+i*210,duration:850}));
    }
    if(s.classList.contains('summary')) {
      s.querySelectorAll('[data-summary-block]').forEach((el,i) => animate(el,[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{delay:350+i*200,duration:850}));
      s.querySelectorAll('[data-system-step]').forEach((el,i) => animate(el,[{opacity:0,transform:'translateX(-15px)'},{opacity:1,transform:'translateX(0)'}],{delay:1000+i*180,duration:650}));
    }
    if(s.classList.contains('advancement')) {
      animate(s.querySelector('[data-advance-hero]'),[{opacity:0,transform:'translateX(-30px)'},{opacity:1,transform:'translateX(0)'}],{delay:250,duration:950});
      s.querySelectorAll('[data-advance-card]').forEach((el,i) => animate(el,[{opacity:0,transform:'translateX(32px)'},{opacity:1,transform:'translateX(0)'}],{delay:500+i*240,duration:850}));
    }
  }
  function go(index, options = {}) {
    const n = Math.max(0,Math.min(slides.length-1,Number(index)));
    if(!Number.isInteger(n)) return;
    if(overview.open) overview.close();
    if(n === current && !options.force) return;
    const prior = slides[current];
    prior?.querySelectorAll('video').forEach(video => video.pause());
    if(prior?.contains(document.activeElement)) $('deck').focus({preventScroll:true});
    cancelAnimations();
    slides.forEach((s,i) => {
      const active = i === n;
      s.classList.toggle('is-active',active);
      s.hidden = !active;
      s.inert = !active;
      s.setAttribute('aria-hidden',String(!active));
    });
    const direction = current < n ? 1 : -1;
    current = n;
    slides[current].scrollTop = 0;
    document.body.dataset.theme = slides[current].dataset.theme;
    $('current-number').textContent = String(n+1).padStart(2,'0');
    $('page-label').textContent = names[n];
    $('prev-page').disabled = n === 0;
    $('next-page').disabled = n === slides.length-1;
    $('page-nav').querySelectorAll('button').forEach((b,i) => { if(i===n)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current'); });
    $('overview-grid').querySelectorAll('button').forEach((b,i) => { if(i===n)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current'); });
    $('progress-fill').style.transform = `scaleX(${(n+1)/slides.length})`;
    try { history.replaceState(null,'',`#${String(n+1).padStart(2,'0')}`); } catch {}
    playSlide();
    animate(slides[current],[{opacity:.2,transform:`translateX(${direction*42}px)`},{opacity:1,transform:'translateX(0)'}],{duration:600});
    restartCanvas();
    if(options.focus) $('deck').focus({preventScroll:true});
  }

  slides.forEach((slide,i) => {
    const dot = document.createElement('button');
    dot.className = 'nav-dot';
    dot.setAttribute('aria-label',`第 ${i+1} 页：${names[i]}`);
    dot.innerHTML = '<span aria-hidden="true"></span>';
    dot.addEventListener('click',() => go(i));
    $('page-nav').append(dot);
    const tile = document.createElement('button');
    tile.className = 'overview-item';
    tile.innerHTML = `<span class="n">${String(i+1).padStart(2,'0')}</span><strong>${names[i]}</strong><small>${categories[i]}</small>`;
    tile.addEventListener('click',() => go(i,{focus:true}));
    $('overview-grid').append(tile);
  });
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click',() => go(b.dataset.go,{focus:true})));
  $('prev-page').addEventListener('click',() => go(current-1));
  $('next-page').addEventListener('click',() => go(current+1));
  document.querySelector('.brand').addEventListener('click',e => {e.preventDefault();go(0,{focus:true});});

  function openOverview() { $('learning-demo').pause(); overview.showModal(); }
  $('open-overview').addEventListener('click',openOverview);
  $('close-overview').addEventListener('click',() => overview.close());
  overview.addEventListener('click',e => { if(e.target === overview){const r=overview.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)overview.close();} });
  function applyStatic(announce=true) {
    document.body.classList.toggle('low-power',staticMode);
    document.body.classList.toggle('motion-enabled',!staticMode);
    $('motion-mode').setAttribute('aria-pressed',String(staticMode));
    $('motion-mode').querySelector('.mode-label').textContent = staticMode ? '动效' : '静态';
    $('motion-mode').title = staticMode ? 'B：恢复动画' : 'B：切换静态模式';
    if(staticMode) cancelAnimations(); else playSlide();
    restartCanvas();
    if(announce) notify(staticMode ? '已切换为静态模式，内容完整保留。' : '已恢复动画。');
  }
  function toggleStatic() { staticMode=!staticMode;explicitMotionPreference=true;try{localStorage.setItem('learning-system-static',staticMode?'1':'0');}catch{}applyStatic(); }
  $('motion-mode').addEventListener('click',toggleStatic);
  function applyPause() {
    const stop = paused || document.hidden;
    document.body.classList.toggle('paused',stop);
    animations.forEach(a => {if(a.playState==='finished')return;stop?a.pause():a.play();});
    $('pause-motion').textContent = paused ? '▷' : 'Ⅱ';
    $('pause-motion').setAttribute('aria-label',paused?'继续动画':'暂停动画');
    $('pause-motion').setAttribute('aria-pressed',String(paused));
    restartCanvas();
  }
  $('pause-motion').addEventListener('click',() => {paused=!paused;applyPause();});
  $('replay-motion').addEventListener('click',() => {if(staticMode){notify('当前为静态模式。按 B 恢复动效后可以重播。');return;}paused=false;applyPause();playSlide();});
  async function toggleFullscreen() { try { if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen(); } catch {notify('当前浏览器不支持全屏，可以使用浏览器的全屏功能。');} }
  $('fullscreen').addEventListener('click',toggleFullscreen);
  document.addEventListener('fullscreenchange',()=>$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'退出全屏':'进入全屏'));
  document.addEventListener('visibilitychange',()=>{applyPause();if(document.hidden)$('learning-demo').pause();});

  document.addEventListener('keydown',e => {
    if(overview.open) return;
    if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,video,.recording-chapters,[contenteditable="true"],[role="tablist"]'))return;
    if(e.code==='ArrowRight'||e.code==='PageDown'){e.preventDefault();go(current+1);}
    else if(e.code==='ArrowLeft'||e.code==='PageUp'){e.preventDefault();go(current-1);}
    else if(e.code==='Home'){e.preventDefault();go(0);}
    else if(e.code==='End'){e.preventDefault();go(slides.length-1);}
    else if(e.code==='Escape'){e.preventDefault();openOverview();}
    else if(e.code==='KeyB'){e.preventDefault();toggleStatic();}
    else if(e.code==='KeyR'){e.preventDefault();$('replay-motion').click();}
    else if(e.code==='KeyF'){e.preventDefault();toggleFullscreen();}
  });
  window.addEventListener('hashchange',() => {const n=Number(location.hash.slice(1));if(n>=1&&n<=slides.length)go(n-1);});
  let wheelSum=0, wheelAt=0, wheelLast=0;
  $('deck').addEventListener('wheel',e => {
    if(overview.open||e.target.closest('video,.recording-chapters')||e.ctrlKey||matchMedia('(max-width:800px)').matches)return;
    const s=slides[current];
    if(s.scrollHeight>s.clientHeight+4)return;
    const now=performance.now();
    if(now-wheelAt<1050)return;
    if(now-wheelLast>180)wheelSum=0;
    wheelLast=now;
    wheelSum+=e.deltaY;
    if(Math.abs(wheelSum)>65){go(current+(wheelSum>0?1:-1));wheelSum=0;wheelAt=now;}
  },{passive:true});
  let touch=null;
  $('deck').addEventListener('touchstart',e=>{if(e.touches.length===1&&!e.target.closest('button,a,input,video,[role="tablist"]'))touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;},{passive:true});
  $('deck').addEventListener('touchend',e=>{if(!touch||!e.changedTouches[0])return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));},{passive:true});

  // The visible prompt is the single source for copying into Codex.
  const demoPrompt = $('prompt-preview').textContent.trim();
  $('copy-prompt').addEventListener('click',async()=>{
    try{
      let copied=false;
      if(navigator.clipboard && window.isSecureContext){try{await navigator.clipboard.writeText(demoPrompt);copied=true;}catch{}}
      if(!copied){const t=document.createElement('textarea');t.value=demoPrompt;t.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(t);t.select();copied=document.execCommand('copy');t.remove();$('copy-prompt').focus();}
      if(!copied)throw new Error('copy unavailable');
      notify('提示词已复制。粘贴到 Codex 即可运行。');
    }catch{const range=document.createRange();range.selectNodeContents($('prompt-preview'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);notify('请按 Ctrl+C 复制已选中的演示提问。');}
  });
  const demoVideo = $('learning-demo');
  const chapterButtons = [...document.querySelectorAll('[data-video-time]')];
  chapterButtons.forEach(button=>button.addEventListener('click',async()=>{
    if(demoVideo.readyState===0){
      demoVideo.load();
      try{await new Promise((resolve,reject)=>{demoVideo.addEventListener('loadedmetadata',resolve,{once:true});demoVideo.addEventListener('error',reject,{once:true});});}catch{return;}
    }
    demoVideo.currentTime = Number(button.dataset.videoTime);
    try{await demoVideo.play();}catch{$('video-status').textContent='已定位到这一步，请使用视频播放按钮。';}
  }));
  demoVideo.addEventListener('timeupdate',()=>{
    const index = demoVideo.currentTime>=11?2:demoVideo.currentTime>=3.2?1:0;
    chapterButtons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  });
  demoVideo.addEventListener('play',()=>{$('video-status').textContent='正在播放真实录屏。';});
  demoVideo.addEventListener('pause',()=>{$('video-status').textContent=demoVideo.ended?'录屏结束，可选择步骤重看。':'已暂停，可继续播放或选择步骤。';});
  demoVideo.addEventListener('ended',()=>{$('video-status').textContent='录屏结束，可选择步骤重看。';});
  demoVideo.addEventListener('error',()=>{$('video-status').textContent='录屏暂时无法播放，请使用支持 MP4 的浏览器打开。';});
  $('expand-video').addEventListener('click',async()=>{
    try{if(demoVideo.requestFullscreen)await demoVideo.requestFullscreen();else if(demoVideo.webkitEnterFullscreen)demoVideo.webkitEnterFullscreen();else throw new Error('fullscreen unavailable');}
    catch{$('video-status').textContent='请使用视频播放器中的全屏按钮。';}
  });

  // A low-cost point field for the blue opening and closing. No WebGL, no CDN.
  const canvases=[...document.querySelectorAll('.ascii-bg')];
  let sizes=new WeakMap();
  function resizeCanvases(){canvases.forEach(c=>{const r=c.getBoundingClientRect();if(r.width<1||r.height<1)return;const dpr=Math.min(devicePixelRatio||1,1.5);c.width=Math.round(r.width*dpr);c.height=Math.round(r.height*dpr);sizes.set(c,{w:r.width,h:r.height,dpr});});}
  function drawField(time){
    if(time-lastFrame<60){raf=requestAnimationFrame(drawField);return;}
    lastFrame=time;
    const c=slides[current]?.querySelector('.ascii-bg');
    const size=c&&sizes.get(c);
    if(c&&size){const {w,h,dpr}=size,ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const tick=time*.00022;for(let x=10;x<w;x+=20){for(let y=10;y<h;y+=20){const wave=Math.sin(x*.012+tick)*Math.cos(y*.014-tick);const center=Math.hypot((x-w*.72)/w,(y-h*.5)/h);const alpha=Math.max(.05,(wave+.8)*.2)*(center<.42?1:.35);ctx.fillStyle=`rgba(0,47,167,${alpha})`;const a=wave>.55?2.3:1;ctx.fillRect(x,y,a,a);}}}
    raf=requestAnimationFrame(drawField);
  }
  function restartCanvas(){cancelAnimationFrame(raf);raf=0;resizeCanvases();if(!staticMode&&!paused&&!document.hidden&&slides[current]?.querySelector('.ascii-bg'))raf=requestAnimationFrame(drawField);}
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(restartCanvas,120);});
  reducedMotion.addEventListener('change',()=>{if(!explicitMotionPreference){staticMode=reducedMotion.matches;applyStatic(false);}restartCanvas();});
  applyStatic(false);
  const requested=Number(location.hash.slice(1));
  go(Number.isInteger(requested)&&requested>=1&&requested<=slides.length?requested-1:0,{force:true});
  document.documentElement.dataset.ready='true';
})();

