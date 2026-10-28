/* PERSONAL AI SYSTEM / MOTION LAB V2
   Independent, reversible HTML motion storyboard. Do not copy DOM mutation into React.
   Visual vocabulary: ink, mask, scanner, kinetic path, retrieval, typewriter, progress, focus.
*/
(function () {
  'use strict';
  var type = location.pathname.includes('/study/') ? 'study'
    : location.pathname.includes('/adult/') ? 'adult'
    : location.pathname.includes('/about/') ? 'about' : '';
  if (!type) return;

  var $all = function(selector, root) {return Array.from((root || document).querySelectorAll(selector));};
  function beat(name, selector, effect, every, duration) {
    return {name:name, selector:selector, effect:effect, every:!!every, duration:duration || 720};
  }
  var B = beat;
  var storyboard = {
    about: {
      hero: [
        B('用蓝色揭示主张','.hero h1','ink',false,1050),
        B('通过遮罩揭示解释','.hero-intro','curtain',false,740),
        B('学习链路 · 五个节点','.hero .flow-step','flow',true,650),
        B('行动入口收束','.hero .actions','film',false,660)
      ],
      problems: [
        B('四种困难 · 聚焦扫描','.problem','scan',true,1020)
      ],
      method: [B('逐层翻开方法','.method-card','flip',true,740)],
      needs: [B('需求逐区扫描','.growth-card','scan',true,750)],
      resources: [B('资料抽屉揭示','.asset','curtain',true,620)]
    },
    study: {
      1: [
        B('题目遮罩揭示','.cover-copy','ink',false,950),
        B('角色关系入画','.cover-art','iris',false,1000)
      ],
      2: [
        B('困境的核心问题','.section-head','curtain',false,850),
        B('横向翻开四种学习问题','.four-cards > *','panel',true,780),
        B('重点陈述突出','.question-banner','underline',false,860)
      ],
      3: [
        B('个性化命题','.section-head','underline',false,900),
        B('比较不同的学习状态','.duo-compare','split',false,1150),
        B('检查与反馈路径','.route-step','scan',true,750),
        B('形成结论','.feedback-band','curtain',false,800)
      ],
      4: [
        B('观察抽象关系','.demo-split','iris',false,1100)
      ],
      5: [
        B('学习历史的价值','.section-head','ink',false,900),
        B('记录步骤依次展开','.archive-step','fold',true,720),
        B('知识再次参与学习','.note-sheet','draw-box',false,950)
      ],
      6: [
        B('揭示知识结构','.knowledge-head','iris',false,760),
        B('知识关联线逐条绘制','.graph-links path','draw-line',true,1000),
        B('知识节点由中心扩散','.knowledge-node','orbit',true,680)
      ],
      7: [
        B('学习的一天','.timeline-heading','underline',false,750),
        B('沿着时间线移动','.day-node','timeline',true,860),
        B('一天的反馈与积累','.routine-note','curtain',false,760)
      ],
      8: [B('远景渐进展开','.page-content','iris',false,1100)],
      9: [
        B('协作原则','.section-head','ink',false,850),
        B('不同角色逐个聚焦','.stack-row','scan',true,650),
        B('系统性流程连结','.system-process','draw-box',false,900)
      ],
      10: [
        B('核心方法的归纳','.section-head','ink',false,850),
        B('三种支持机制逐层翻开','.three-forces > *','flip',true,760),
        B('成长方向','.advancement-grid','curtain',false,850)
      ]
    },
    adult: {
      1: [
        B('开场观点','.cover-hero','ink',false,950),
        B('任务持续积累','.workflow-fragment','flow',true,700),
        B('核心方法','.cover-bottom','underline',false,750)
      ],
      2: [
        B('提出四个问题','.problem-intro','ink',false,850),
        B('问题聚焦扫描','.problem','scan',true,850)
      ],
      3: [
        B('从结果寻找根因','.story-intro','curtain',false,900),
        B('诊断工作流逐段点亮','.process-step','scan',true,880),
        B('检查后形成判断','.inspector','shutter',false,1000)
      ],
      4: [
        B('重复劳动的困境','.explainer','split',false,850),
        B('旧流程逐条描摹','.repeat-row','draw-box',true,730),
        B('流程复用形成差异','.repeat-quote','film',false,850)
      ],
      5: [
        B('从保存信息到使用信息','.memory-copy','iris',false,870),
        B('历史档案逐条检索','.vault-file','file',true,600),
        B('关联关系生成','.graph-pane svg line','draw-line',true,840),
        B('知识节点联动','.graph-node','orbit',true,750),
        B('说明信息可被复用','.node-info','shutter',false,750)
      ],
      6: [
        B('从想法到原型','.idea-head','ink',false,900),
        B('自然语言真实输入','#idea-request','type',false,1750),
        B('任务路径逐项指示','.idea-steps button','progress',true,540),
        B('原型结果展开','#idea-preview','shutter',false,1080)
      ],
      7: [
        B('两个工具的分工','.system-intro','split',false,850),
        B('协作路线绘出','.system-flow','draw-box',false,1020),
        B('成果左右切换','.system-demo','split',false,950)
      ],
      8: [
        B('不同的人不同需求','.scene-top','curtain',false,810),
        B('受众轮流聚焦','.scene-menu > *','focus',true,670),
        B('从问题看到方案','.case-segment','curtain',true,690)
      ],
      9: [
        B('从一次到长期','.cycle-copy','underline',false,930),
        B('任务与经验之间建立联系','.cycle-node','charge',true,1100),
        B('经验价值随时间增加','.cycle-note','shutter',false,1080)
      ],
      10: [
        B('工具只是起点','.cap-copy','curtain',false,840),
        B('能力成长阶梯','.cap-item','ladder',true,770),
        B('不同的学习路径','.delivery-choice','fold',true,640)
      ],
      11: [
        B('收束主题','.ending-copy','iris',false,930),
        B('最终行动邀请','.question-card','iris',false,1050)
      ]
    }
  };

  var lab = document.createElement('aside');
  lab.id = 'motion-lab-ui';
  lab.setAttribute('aria-label', 'HTML 独立动效实验室');
  lab.innerHTML =
    '<div class="motion-lab-top"><span>● MOTION LAB <small>V2 · 叙事动效</small></span><button type="button" id="motion-lab-fold" title="折叠动画面板" aria-expanded="true">−</button></div>' +
    '<div class="motion-lab-content"><div class="motion-lab-family">正在选择动效语言</div>' +
    '<div class="motion-lab-modes"><button type="button" data-lab-mode="auto" aria-pressed="true">自动演示</button><button type="button" data-lab-mode="step" aria-pressed="false">逐步讲解</button><button type="button" data-lab-mode="off" aria-pressed="false">关闭</button></div>' +
    '<div class="motion-lab-progress"><i id="lab-progress-bar"></i></div>' +
    '<div class="motion-lab-actions"><button type="button" id="motion-lab-replay">↺ 重新播放</button><button type="button" id="motion-lab-next" disabled>下一幕 →</button></div>' +
    '<div class="motion-lab-status" role="status" aria-live="polite">准备就绪</div>' +
    '<a href="/motion-spec.html" target="_blank" rel="noopener">打开逐场景动效目录 ↗</a></div>';
  document.body.appendChild(lab);
  // The floating controls are a debugging tool. Fold them on ALL screens by default,
  // so the educational presentation itself remains unobstructed until the user expands them.
  lab.classList.add('motion-lab-folded');
  lab.querySelector('#motion-lab-fold').textContent = '+';
  lab.querySelector('#motion-lab-fold').setAttribute('aria-expanded', 'false');
  var status = lab.querySelector('.motion-lab-status');
  var family = lab.querySelector('.motion-lab-family');
  var next = lab.querySelector('#motion-lab-next');
  var progress = lab.querySelector('#lab-progress-bar');
  var reduced = matchMedia('(prefers-reduced-motion:reduce)');
  var mode = 'auto', activeScene = '', cues = [], at = -1;
  var animations = [], timers = [], restores = new Map(), extras = [], types = new Map();
  var epoch = 0;

  function later(fn, n) {
    var version = epoch;
    timers.push(setTimeout(function () {if(version === epoch) fn();}, n));
  }
  function remember(el, prop, val) {
    if (!restores.has(el)) restores.set(el, {});
    var obj = restores.get(el);
    if (!(prop in obj)) obj[prop] = el.style[prop];
    el.style[prop] = val;
  }
  function cleanup() {
    epoch++;
    timers.forEach(clearTimeout); timers=[];
    animations.forEach(function (a) {try{a.cancel();}catch(e){}}); animations=[];
    extras.forEach(function (el) {el.remove();}); extras=[];
    restores.forEach(function (vals,el) {
      if (!el.isConnected) return;
      Object.keys(vals).forEach(function (p) {el.style[p]=vals[p];});
    });
    restores.clear();
    types.forEach(function (rec,el) {
      if (el.isConnected && el.textContent === rec.latest) el.textContent=rec.original;
    });
    types.clear();
  }
  function animate(el, frames, duration, delay, easing, done) {
    if(!el || !el.isConnected || typeof el.animate !== 'function') return;
    var a=el.animate(frames,{duration:duration,delay:delay||0,easing:easing||'cubic-bezier(.2,.7,.2,1)',fill:'both'});
    animations.push(a);
    if(done)a.finished.then(function(){if(a.playState==='finished')done();}).catch(function(){});
    return a;
  }
  function overlay(el, className) {
    if (!el || !el.isConnected) return null;
    if (getComputedStyle(el).position === 'static') remember(el,'position','relative');
    var item=document.createElement('i');
    item.className=className;
    item.setAttribute('aria-hidden','true');
    el.appendChild(item);
    extras.push(item);
    return item;
  }
  function label(info) {
    var n=info.plan.length, active=at+1;
    progress.style.width=(n?Math.min(100,Math.max(0,active/n*100)):0)+'%';
    next.disabled=mode!=='step' || active>=cues.length;
  }
  function scene() {
    if(type==='about') {
      var parts=[document.querySelector('.hero')].concat($all('section.section')).filter(Boolean);
      var target=innerHeight*.37, best=null;
      parts.forEach(function(el) {
        var b=el.getBoundingClientRect(), distance=target < b.top?b.top-target:target > b.bottom?target-b.bottom:0;
        if (!best || distance < best.distance) best={el:el,distance:distance};
      });
      var root=best&&best.el, name=root&&(root.classList.contains('hero')?'hero':root.id);
      return root?{id:'about:'+name,root:root,plan:storyboard.about[name]||[]}:null;
    }
    var root=document.querySelector(type==='study'?'.slide.is-active':'.slide.active');
    if(!root)return null;
    var index=$all('.slide').indexOf(root)+1;
    return {id:type+':'+index,root:root,plan:storyboard[type][index]||[]};
  }
  function makeCues(info) {
    var all=[];
    info.plan.forEach(function(p) {
      var els=$all(p.selector,info.root);
      if(!els.length)return;
      if(p.every)els.forEach(function(el,i) {
        all.push({name:p.name+(els.length>1?' 0'+(i+1):''),effect:p.effect,elements:[el],duration:p.duration,index:i,total:els.length});
      });
      else all.push({name:p.name,effect:p.effect,elements:els,duration:p.duration,index:0,total:els.length});
    });
    return all;
  }
  function drawSVG(el,duration) {
    if(!(el instanceof SVGElement) || typeof el.getTotalLength !== 'function')return false;
    var length=0;
    try {length=el.getTotalLength();} catch(e){return false;}
    if(length<1)return false;
    remember(el,'strokeDasharray',String(length));
    animate(el,[{strokeDashoffset:length,opacity:.05},{strokeDashoffset:0,opacity:1}],duration,0,'ease-in-out');
    return true;
  }
  function textType(el,duration) {
    var original=el.textContent||'';
    if(!original)return;
    var obj={original:original,latest:original};
    types.set(el,obj);
    // This effect is a timed visual representation only; it never creates a real AI result.
    var pieces=Array.from(original), version=epoch, steps=Math.min(1800,duration), start=performance.now();
    obj.latest='';
    el.textContent='';
    function frame(now) {
      if(version!==epoch || !el.isConnected)return;
      var pct=Math.max(0,Math.min(1,(now-start)/steps));
      var n=Math.floor(pieces.length*pct);
      obj.latest=pieces.slice(0,n).join('')+(pct<1?'▏':'');
      el.textContent=obj.latest;
      if(pct<1)requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function effect(el, fx, duration, idx, total) {
    if(!el || !el.isConnected) return;
    if(fx==='ink') {
      animate(el,[{clipPath:'inset(0 100% 0 0)',opacity:.45},{clipPath:'inset(0 0% 0 0)',opacity:1}],duration,0,'cubic-bezier(.2,.7,.1,1)');
    } else if(fx==='curtain') {
      animate(el,[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0 0 0 0)'}],duration);
    } else if(fx==='panel') {
      var side=idx%2===0?'100% 0 0 0':'0 0 0 100%';
      animate(el,[{clipPath:'inset(0 '+(idx%2===0?'100% 0 0':'0 0 100%')+')'},{clipPath:'inset(0 0 0 0)'}],duration,0,'cubic-bezier(.12,.82,.27,1)');
      var svg=el.querySelector('svg path');
      if(svg)drawSVG(svg,Math.round(duration*.8));
    } else if(fx==='scan' || fx==='file' || fx==='focus') {
      var band=overlay(el,'lab-scanner');
      if(band)animate(band,[{transform:'translateX(-125%)',opacity:0},{transform:'translateX(190%)',opacity:1},{transform:'translateX(730%)',opacity:0}],duration,0,'ease-in-out');
      animate(el,[{filter:'saturate(.45)',boxShadow:'inset 0 0 0 0 rgba(0,47,167,0)'},{filter:'saturate(1.15)',boxShadow:'inset 0 0 0 2px rgba(0,47,167,.40)'},{filter:'none',boxShadow:'inset 0 0 0 0 rgba(0,47,167,0)'}],duration,0,'ease-in-out');
    } else if(fx==='flow') {
      var bar=overlay(el,'lab-flow-bar');
      if(bar)animate(bar,[{height:'0%'},{height:'100%'}],duration);
      animate(el,[{clipPath:'inset(0 100% 0 0)',filter:'grayscale(.6)'},{clipPath:'inset(0 0 0 0)',filter:'none'}],duration);
    } else if(fx==='draw-line') {
      if(!drawSVG(el,duration)) animate(el,[{opacity:.2},{opacity:1}],duration);
    } else if(fx==='orbit') {
      animate(el,[{transform:'scale(.6)',opacity:0,filter:'blur(8px)'},{transform:'scale(1.09)',opacity:1,filter:'blur(0)'},{transform:'scale(1)',opacity:1,filter:'blur(0)'}],duration,0,'cubic-bezier(.18,.78,.3,1)');
      remember(el,'transformOrigin','center center');
      // SVG text does not need its own destructive DOM mutation.
    } else if(fx==='iris') {
      animate(el,[{clipPath:'circle(1% at 50% 50%)',filter:'blur(2px)'},{clipPath:'circle(90% at 50% 50%)',filter:'blur(0px)'}],duration,0,'ease-in-out');
    } else if(fx==='split') {
      animate(el,[{clipPath:'inset(0 50% 0 50%)',filter:'contrast(.65)'},{clipPath:'inset(0 0 0 0)',filter:'contrast(1)'}],duration,0,'cubic-bezier(.2,.75,.25,1)');
    } else if(fx==='film' || fx==='flip') {
      animate(el,[{transform:'perspective(1000px) rotateY(-76deg)',opacity:.25},{transform:'perspective(1000px) rotateY(0deg)',opacity:1}],duration,0,'cubic-bezier(.15,.8,.15,1)');
      remember(el,'transformOrigin','left center');
    } else if(fx==='shutter') {
      animate(el,[{clipPath:'inset(0 0 100% 0)',filter:'blur(2px)'},{clipPath:'inset(0 0 0 0)',filter:'none'}],duration,0,'cubic-bezier(.1,.7,.2,1)');
      var stripe=overlay(el,'lab-shutter-stripe');
      if(stripe)animate(stripe,[{top:'0%',opacity:1},{top:'100%',opacity:0}],duration);
    } else if(fx==='fold') {
      animate(el,[{clipPath:'inset(0 0 85% 0)',transform:'scaleY(.89)'},{clipPath:'inset(0 0 0% 0)',transform:'scaleY(1)'}],duration);
    } else if(fx==='draw-box' || fx==='underline') {
      var mark=overlay(el,fx==='underline'?'lab-underline':'lab-frame');
      if(mark)animate(mark,fx==='underline'?[{transform:'scaleX(0)'},{transform:'scaleX(1)'}]:
          [{clipPath:'inset(0 100% 0 0)',opacity:.35},{clipPath:'inset(0 0 0 0)',opacity:1}],duration);
      animate(el,[{opacity:.5},{opacity:1}],duration);
    } else if(fx==='type') {
      textType(el,duration);
      var caret=overlay(el,'lab-type-caret');
      if(caret)animate(caret,[{opacity:0},{opacity:1},{opacity:0},{opacity:1}],duration);
    } else if(fx==='progress' || fx==='timeline' || fx==='ladder' || fx==='charge') {
      var pulse=overlay(el,'lab-progress-sweep');
      if(pulse)animate(pulse,[{transform:'scaleX(0)',opacity:.2},{transform:'scaleX(1)',opacity:1}],duration);
      animate(el,[{filter:'brightness(.85)'},{filter:'brightness(1.07)'},{filter:'brightness(1)'}],duration);
    }
  }
  function showCue(cue) {
    at++;
    cue.elements.forEach(function(el,i) {
      if(mode==='step')remember(el,'visibility','visible');
      effect(el,cue.effect,cue.duration,cue.index+i,cue.total);
    });
    progress.style.width=((at+1)/cues.length*100)+'%';
    status.textContent=(at+1)+' / '+cues.length+' · '+cue.name;
    next.disabled=mode!=='step'||at>=cues.length-1;
  }
  function nextCue(){if(mode==='step'&&at+1<cues.length)showCue(cues[at+1]);}
  function play(force) {
    var now=scene();
    if(!now || (!force&&activeScene===now.id))return;
    cleanup();
    activeScene=now.id;cues=makeCues(now);at=-1;
    next.disabled=mode!=='step'||!cues.length; progress.style.width='0%';
    var unique=Array.from(new Set(cues.map(function(c){return c.effect;})));
    family.textContent='动效类型 · '+unique.join(' / ');
    if(reduced.matches || mode==='off') {
      status.textContent=reduced.matches?'系统已选择减少动态效果':'静态模式 · 内容完整显示';
      progress.style.width='100%';return;
    }
    if(!cues.length) {status.textContent='此区域留给下一批定制动效';return;}
    if(mode==='step') {
      cues.forEach(function(c) {c.elements.forEach(function(el){remember(el,'visibility','hidden');});});
      nextCue();
      return;
    }
    var offset=0;
    cues.forEach(function(c,i){
      later(function(){showCue(c);},offset);
      offset+=c.effect==='type'?Math.min(1750,c.duration)+180:
        c.effect==='draw-line'||c.effect==='scan'?470:510;
    });
    status.textContent='自动编排 · '+cues.length+' 幕';
  }
  function foldControls() {
    lab.classList.add('motion-lab-folded');
    var button=lab.querySelector('#motion-lab-fold');
    button.textContent='+';
    button.setAttribute('aria-expanded','false');
  }
  lab.querySelectorAll('[data-lab-mode]').forEach(function(b) {
    b.addEventListener('click',function(){
      mode=b.dataset.labMode;
      lab.querySelectorAll('[data-lab-mode]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});
      play(true);
      // In auto/off modes the controller MUST leave the page unobstructed.
      // Step stays expanded for sequential presentation; it can be folded manually.
      if (mode!=='step') foldControls();
    });
  });
  lab.querySelector('#motion-lab-replay').addEventListener('click',function(){
    play(true);
    if(mode!=='step') foldControls();
  });
  next.addEventListener('click',nextCue);
  lab.querySelector('#motion-lab-fold').addEventListener('click',function(){
    var closed=lab.classList.toggle('motion-lab-folded');
    this.textContent=closed?'+':'−';
    this.setAttribute('aria-expanded',String(!closed));
  });
  if(type==='about'){
    var scrollTick=false;
    addEventListener('scroll',function(){
      if(scrollTick)return;scrollTick=true;
      requestAnimationFrame(function(){scrollTick=false;play(false);});
    },{passive:true});
  } else {
    var target=document.querySelector(type==='study'?'#deck':'.stage');
    if(target)new MutationObserver(function(muts){
      if(muts.some(function(x){return x.target.classList&&x.target.classList.contains('slide');}))play(false);
    }).observe(target,{subtree:true,attributes:true,attributeFilter:['class']});
    document.addEventListener('click',function(e){
      var trigger=e.target.closest&&e.target.closest('[data-process],[data-repeat],[data-idea],[data-cycle],[data-node],[data-case],[data-file]');
      if(!trigger || mode==='off' || reduced.matches)return;
      // Retain native click handlers. The motion only responds to the already rendered new state.
      later(function(){
        var d=trigger.dataset;
        if(Object.prototype.hasOwnProperty.call(d,'process')){
          var step=document.querySelector('.process-step.active');
          if(step)effect(step,'scan',680,0,1);
          var inspector=document.querySelector('.inspector');
          if(inspector)effect(inspector,'shutter',620,0,1);
        } else if(Object.prototype.hasOwnProperty.call(d,'repeat')){
          var tab=document.querySelector('.repeat-tabs button.active');
          if(tab)effect(tab,'progress',400,0,1);
          $all('.repeat-row.done').forEach(function(row){
            var cross=overlay(row,'lab-crossout');
            if(cross)animate(cross,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],620,0,'ease-out');
          });
          var quote=document.querySelector('.repeat-quote');
          if(quote)effect(quote,'film',680,0,1);
        } else if(Object.prototype.hasOwnProperty.call(d,'idea')){
          var idea=document.querySelector('#idea-preview');
          if(idea)effect(idea,'shutter',740,0,1);
        } else if(Object.prototype.hasOwnProperty.call(d,'cycle')){
          $all('.cycle-node').forEach(function(node){effect(node,'charge',740,0,1);});
          var note=document.querySelector('.cycle-note');
          if(note)effect(note,'shutter',650,0,1);
        } else if(Object.prototype.hasOwnProperty.call(d,'node') || Object.prototype.hasOwnProperty.call(d,'file')){
          var node=document.querySelector('.graph-node.active');
          if(node)effect(node,'orbit',600,0,1);
          var info=document.querySelector('.node-info');
          if(info)effect(info,'shutter',600,0,1);
        } else if(Object.prototype.hasOwnProperty.call(d,'case')){
          var story=document.querySelector('.scene-story');
          if(story)effect(story,'split',720,0,1);
        }
      },85);
    });
  }
  addEventListener('pagehide',cleanup);
  reduced.addEventListener('change',function(){play(true);});
  play(true);
})();
