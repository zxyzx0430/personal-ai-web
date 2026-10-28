/* Outer index homepage — one system branching into two product pathways. */
(() => {
'use strict';
const drawer=document.getElementById('switchDrawer');
const options=drawer?.querySelector('.options');
if(!drawer||!options)return;
const tree=document.createElement('div');
tree.className='home-route-tree';
tree.setAttribute('aria-label','一套个人 AI 系统，分为学生学习系统与成人工作系统');
tree.innerHTML='<div class="home-route-root">PERSONAL AI SYSTEM <span>一套长期成长系统</span></div>'+
'<div class="home-route-branch" aria-hidden="true"><i></i><span></span><i></i></div>'+
'<div class="home-route-paths"><div><b>STUDY</b><span>学习 · 反馈 · 积累</span></div><div><b>WORK</b><span>任务 · 方法 · 复用</span></div></div>';
options.before(tree);
const low=matchMedia('(prefers-reduced-motion: reduce)');
const ob=new MutationObserver(()=>{
 if(drawer.open){
  tree.classList.remove('is-open');
  if(low.matches){tree.classList.add('is-open');return;}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(drawer.open)tree.classList.add('is-open');}));
 }else tree.classList.remove('is-open');
});
ob.observe(drawer,{attributes:true,attributeFilter:['open']});
drawer.addEventListener('close',()=>tree.classList.remove('is-open'));
if(drawer.open)tree.classList.add('is-open');
})();