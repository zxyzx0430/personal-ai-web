
(function(){
  'use strict';
  var frame=document.getElementById('presentation');
  var drawer=document.getElementById('switchDrawer');
  var opener=document.getElementById('openSwitch');
  var closer=document.getElementById('closeSwitch');
  var tabNumber=document.getElementById('tabNumber');
  var standalone=document.getElementById('openStandalone');
  var options=Array.from(document.querySelectorAll('[data-view]'));
  var mobileHint=document.getElementById('mobileHint');
  try{mobileHint.hidden=sessionStorage.getItem('personal-ai-desktop-hint-dismissed')==='1'}catch(e){mobileHint.hidden=false}
  document.getElementById('dismissMobileHint').addEventListener('click',function(){mobileHint.hidden=true;try{sessionStorage.setItem('personal-ai-desktop-hint-dismissed','1')}catch(e){}});
  var current='about';
  var closeTimer=null;
  function hideLauncher(){
    opener.classList.add('is-tucked');
    try{localStorage.setItem('personal-ai-switcher-used','1')}catch(e){}
  }

  var replayAfterSwitch=false;
  var modes={
    about:{url:'./about/',name:'项目介绍｜个人 AI 系统',number:'00'},
    study:{url:'./study/',name:'在学中扩展｜学生版',number:'01'},
    adult:{url:'./adult/',name:'在做中扩展｜成人版',number:'02'}
  };
  function setMode(mode,push){
    if(!modes[mode])mode='about';
    var info=modes[mode];
    current=mode;
    if(push && mode==='study')replayAfterSwitch=true;
    options.forEach(function(button){
      var selected=button.dataset.view===mode;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
      button.querySelector('.option-arrow').textContent=selected?'✓':'↗';
    });
    if(frame.getAttribute('src')!==info.url){frame.src=info.url;}
    frame.title=info.name;
    document.title=info.name+'｜Personal AI System';
    opener.title='当前：'+info.name+'；点击切换';
    tabNumber.textContent=info.number;
    standalone.href=info.url;
    try{sessionStorage.setItem('personal-ai-view',mode)}catch(e){}
    if(push){
      hideLauncher();
      var url=new URL(location.href);
      url.searchParams.set('view',mode);
      history.pushState({view:mode},'',url.pathname+url.search+url.hash);
    }
  }
  // Inner presentations live in a same-origin iframe. Keep keyboard focus in
  // that presentation, not on the small outer switcher button.
  function focusPresentation(){
    try {frame.contentWindow.focus();frame.focus({preventScroll:true});}
    catch(e) {try {frame.focus();}catch(_) {}}
  }
  function replayVisibleStudent(){
    if(!replayAfterSwitch || current!=='study' || drawer.open)return;
    try {
      var doc=frame.contentDocument;
      if(!doc || doc.readyState!=='complete')return;
      var replay=doc.getElementById('replay-motion');
      if(replay){replayAfterSwitch=false;replay.click();}
    }catch(e){}
  }
  function enableEdgeSwipe(){
    try{
      var doc=frame.contentDocument;
      if(!doc || doc.__edgeSwipeEnabled)return;
      doc.__edgeSwipeEnabled=true;
      var start=null;
      doc.addEventListener('touchstart',function(e){
        if(drawer.open || !e.touches || e.touches.length!==1)return;
        var t=e.touches[0];
        start=t.clientX<=26?{x:t.clientX,y:t.clientY}:null;
      },{passive:true});
      doc.addEventListener('touchend',function(e){
        if(!start || !e.changedTouches.length)return;
        var t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;
        start=null;
        if(dx>75 && Math.abs(dy)<55)openDrawer();
      },{passive:true});
      doc.addEventListener('touchcancel',function(){start=null},{passive:true});
    }catch(e){}
  }
  frame.addEventListener('load',function(){
    enableEdgeSwipe();
    if(!drawer.open){focusPresentation();replayVisibleStudent();}
  });
  function openDrawer(){
    if(closeTimer){clearTimeout(closeTimer);closeTimer=null;drawer.classList.remove('closing');}
    if(!drawer.open){drawer.showModal();}
    opener.setAttribute('aria-expanded','true');
    var selected=drawer.querySelector('.mode-option.selected');
    if(selected)selected.focus();
  }
  function finishClose(){
    drawer.classList.remove('closing');
    if(drawer.open)drawer.close();
    opener.setAttribute('aria-expanded','false');
    focusPresentation();
    replayVisibleStudent();
    closeTimer=null;
  }
  function closeDrawer(){
    if(!drawer.open || closeTimer)return;
    if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){finishClose();return;}
    drawer.classList.add('closing');
    closeTimer=setTimeout(finishClose,190);
  }
  opener.addEventListener('click',openDrawer);
  closer.addEventListener('click',closeDrawer);
  options.forEach(function(button){button.addEventListener('click',function(){setMode(button.dataset.view,true);closeDrawer();});});
  drawer.addEventListener('click',function(e){
    if(e.target===drawer){
      var box=drawer.getBoundingClientRect();
      if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)closeDrawer();
    }
  });
  drawer.addEventListener('cancel',function(e){e.preventDefault();closeDrawer();});
  drawer.addEventListener('close',function(){opener.setAttribute('aria-expanded','false');});
  // The outer document can still receive keys after closing a modal or
  // when the user clicks outside the embedded presentation. Forward to
  // the child BODY (not document: student handlers expect target.closest()).
  document.addEventListener('keydown',function(e){
    if(drawer.open || e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey)return;
    if(e.target && e.target.closest && e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    var keys=['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'];
    if(!keys.includes(e.key))return;
    try{
      var win=frame.contentWindow;
      var doc=win.document;
      if(!doc || !doc.body)return;
      var keyEvent=new win.KeyboardEvent('keydown',{key:e.key,code:e.code || e.key,bubbles:true,cancelable:true});
      doc.body.dispatchEvent(keyEvent);
      e.preventDefault();
    }catch(err){focusPresentation();}
  });
  window.addEventListener('popstate',function(){
    var view=new URLSearchParams(location.search).get('view');
    if(!modes[view])view='about';
    setMode(view,false);
    closeDrawer();
  });
  var fromUrl=new URLSearchParams(location.search).get('view');
  var remembered=null;
  try{remembered=sessionStorage.getItem('personal-ai-view')}catch(e){}
  var wasUsed=false;
  try{wasUsed=localStorage.getItem('personal-ai-switcher-used')==='1'}catch(e){}
  if(!modes[fromUrl] && !modes[remembered] && !wasUsed)opener.classList.remove('is-tucked');
  setMode(modes[fromUrl]?fromUrl:(modes[remembered]?remembered:'about'),false);
})();
