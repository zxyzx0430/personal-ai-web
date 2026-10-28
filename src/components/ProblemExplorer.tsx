import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { copyText } from '../utils/clipboard';

export const problems = [
  {title:'听懂了，却做不出来',method:'先找到真正的知识障碍',scene:'同一道函数单调性题目，学生 A、B 都答错了，但他们并不是遇到了同一种困难。',process:'分析学生已有的解题步骤，确定卡点，再针对不同障碍给出讲解和练习。',verify:'换一道函数题，让学生独立说明解题思路和判断依据。'},
  {title:'记住公式，却缺少直觉',method:'让抽象知识变成可以观察的规律',scene:'学生记住了二次函数的结论，却无法解释为什么参数变化会影响图像。',process:'先预测，再调整参数观察图像，最后用自己的语言解释变化。',verify:'更换一个参数，学生先作出预测，再验证。'},
  {title:'订正过的错题，又犯错',method:'把错题变成下一次学习的线索',scene:'抄过正确答案，下次遇到类似题目却还是按原来的错误思路解答。',process:'记录原始思路、错因、相关知识与掌握证据，并在后续学习中调用。',verify:'间隔一段时间再次完成变式题，观察同一种错误是否减少。'},
  {title:'出现疑问，反馈却要等',method:'在思路还清晰时获得针对性提示',scene:'一道题已经做到第三步，但第四步不知道怎么继续，等待解答会打断思路。',process:'保留前三步想法，让 AI 根据卡点提问或提示，不直接替学生完成。',verify:'关掉提示，尝试独立完成第四步，并解释为何这样做。'}
] as const;

function CaseAB(){
  const [student,setStudent]=useState<'A'|'B'>('A');
  const [checked,setChecked]=useState(false);
  return <div className="v2-demo" data-demo="ab">
    <div className="v2-demo-top"><span className="v2-overline">教学演示 / 因人而异</span><span>函数单调性 · 同一道题</span></div>
    <div className="v2-math-problem">已知 f(x) = x² − 2x，判断其单调区间。</div>
    <div className="v2-tab-row" role="group" aria-label="选择学生">{(['A','B'] as const).map(x=><button type="button" className={student===x?'active':''} aria-pressed={student===x} key={x} onClick={()=>{setStudent(x);setChecked(false)}}>学生 {x}</button>)}</div>
    <div className="v2-demo-copy"><strong>学生 {student} 的真实卡点（模拟）</strong>
      <p>{student==='A'?'已经会求导 f′(x) = 2x − 2，但常把 2x − 2 > 0 的符号与解集判断错。':'能够解出 x > 1，却不理解为什么 f′(x) 的正负意味着函数递增或递减。'}</p>
      <strong>我会怎样支持</strong>
      <p>{student==='A'?'先用数轴确认 x = 1 两侧导数的正负，再安排同类不等式的短练习。':'结合函数图像中的切线方向，比较 x = 1 两侧函数随 x 增大时的变化。'}</p>
    </div>
    <button type="button" className="v2-inline-action" onClick={()=>setChecked(v=>!v)}>{checked?'收起独立验证':'查看独立验证任务'} <span aria-hidden="true">↗</span></button>
    {checked&&<p className="v2-result">请独立判断 g(x) = x² − 4x 的单调区间，并说明“为什么”。对照点：x = 2 两侧导数的符号与函数变化是否对应。</p>}
  </div>;
}

function Quadratic(){
  const [a,setA]=useState(1);
  const [prediction,setPrediction]=useState<'up'|'down'|null>(null);
  const [checked,setChecked]=useState(false);
  const path=Array.from({length:101},(_,i)=>{const x=-3+i*.06;return `${i?'L':'M'}${(240+x*57).toFixed(2)} ${(130-a*x*x*10).toFixed(2)}`}).join(' ');
  return <div className="v2-demo" data-demo="quadratic">
    <div className="v2-demo-top"><span className="v2-overline">可操作数学演示</span><span>y = ax²</span></div>
    <p>先预测：把 a 改成负数，开口会怎样变化？</p>
    <div className="v2-tab-row" role="group" aria-label="预测开口方向"><button aria-pressed={prediction==='up'} className={prediction==='up'?'active':''} onClick={()=>{setPrediction('up');setChecked(false)}}>向上</button><button aria-pressed={prediction==='down'} className={prediction==='down'?'active':''} onClick={()=>{setPrediction('down');setChecked(false)}}>向下</button></div>
    <svg className="v2-plot" viewBox="0 0 480 260" role="img" aria-label={`二次函数 y=${a}x² 的曲线，${a<0?'开口向下':a>0?'开口向上':'与横轴重合'}`}>
      <defs><pattern id="v2-math-grid" width="38" height="38" patternUnits="userSpaceOnUse"><path d="M38 0H0V38" stroke="#d9e0ed" fill="none" strokeWidth=".75"/></pattern><clipPath id="v2-math-clip"><rect width="480" height="260"/></clipPath></defs>
      <rect width="480" height="260" fill="url(#v2-math-grid)"/>
      <path d="M0 130H480M240 0V260" stroke="#8794a6" strokeWidth="1.5"/>
      <g clipPath="url(#v2-math-clip)"><path d={path} stroke="#0035ba" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
      <circle cx="240" cy="130" r="4" fill="#0035ba"/><text x="455" y="150" fontSize="13" fill="#6f7b8f">x</text><text x="250" y="18" fontSize="13" fill="#6f7b8f">y</text>
    </svg>
    <label className="v2-range-label" htmlFor="v2-parameter-a">拖动系数 a <strong>{a.toFixed(1)}</strong></label>
    <input id="v2-parameter-a" className="v2-range" type="range" min="-2" max="2" step="0.1" value={a} onChange={e=>{setA(Number(e.target.value));setChecked(false)}}/>
    <button className="v2-inline-action" onClick={()=>setChecked(true)}>验证我的预测</button>
    {checked&&<p className="v2-result" role="status">{prediction===null?'先选择你的预测，再观察参数为负时的图像。':a>=0?'将 a 拖到负数，再检查预测。':prediction==='down'?'预测正确：a < 0 时抛物线开口向下。再试改变 |a|，观察宽窄。':'再观察：a < 0 时开口向下；试着自己解释为什么。'}</p>}
  </div>;
}

function WrongNote(){
  const [mode,setMode]=useState<'ordinary'|'record'>('ordinary');const [revisit,setRevisit]=useState(false);
  return <div className="v2-demo" data-demo="note">
    <div className="v2-demo-top"><span className="v2-overline">错题长期记录 / 模拟</span><span>记录不是抄答案</span></div>
    <div className="v2-tab-row" role="group" aria-label="比较记录方式"><button aria-pressed={mode==='ordinary'} className={mode==='ordinary'?'active':''} onClick={()=>setMode('ordinary')}>普通错题本</button><button aria-pressed={mode==='record'} className={mode==='record'?'active':''} onClick={()=>setMode('record')}>个人 AI 学习记录</button></div>
    <div className="v2-demo-copy">{mode==='ordinary'?<><strong>题目：f(x) = x² − 2x 的单调区间</strong><p>答案：(-∞, 1] 递减；[1, +∞) 递增。</p><p className="v2-muted">只有结果，下次可能仍不知道自己错在哪里。</p></>:<><strong>原始思路</strong><p>能求导，但误把导数为正的区间当作递减区间。</p><strong>具体错因与关联</strong><p>导数符号与单调方向未建立联系；关联「导数」「数轴」「图像」。</p><strong>复习线索</strong><p>用变式题检查自己能否解释导数正负；掌握情况需以再次独立作答确认。</p></>}</div>
    <button className="v2-inline-action" onClick={()=>setRevisit(v=>!v)}>{revisit?'收起复习任务':'看下一次如何复习'}</button>
    {revisit&&<p className="v2-result">下次先不看答案：试判断 h(x) = x² − 6x 在哪里递增，并说明导数符号。再根据作答结果更新记录。</p>}
  </div>;
}

function ImmediateFeedback(){
  const [step,setStep]=useState(0);
  return <div className="v2-demo" data-demo="feedback">
    <div className="v2-demo-top"><span className="v2-overline">即时追问 / 流程模拟</span><span>保留已有思考</span></div>
    <div className="v2-demo-copy"><strong>学生已经做到的三步</strong><p>① 写出函数 f(x) = x² − 2x</p><p>② 求导 f′(x) = 2x − 2</p><p>③ 找到导数为零的位置 x = 1</p><strong>第四步：怎样判断单调性？</strong>
      {step>=1&&<p className="v2-assistant">提示：试把 x = 0 与 x = 2 分别代入 f′(x)。你观察到了什么？</p>}
      {step>=2&&<p className="v2-assistant">再追问：导数为负的那一侧，函数值随着 x 增大会怎样变化？你能自己总结吗？</p>}
      {step>=3&&<p className="v2-result">独立验证：不看提示，判断 g(x) = x² − 4x 的单调区间，并解释过程。</p>}
    </div>
    <div className="v2-tab-row"><button className="active" onClick={()=>setStep(v=>Math.min(v+1,3))} disabled={step===3}>{['获取第一条提示','再追问一步','进入独立验证','演示已完成'][step]}</button><button onClick={()=>setStep(0)}>重新开始</button></div>
    <p className="v2-muted">以上是预设教学流程演示，不是正在连接的实时 AI 服务。</p>
  </div>;
}

const demos=[CaseAB,Quadratic,WrongNote,ImmediateFeedback];

export function ProblemExplorer({selected,onSelect,onClose,onContact}:{selected:number|null;onSelect:(id:number)=>void;onClose:()=>void;onContact:()=>void}){
  const closeRef=useRef<HTMLButtonElement>(null);const lastFocus=useRef<HTMLElement|null>(null);
  useEffect(()=>{if(selected!==null){lastFocus.current=document.activeElement as HTMLElement|null;closeRef.current?.focus();return ()=>lastFocus.current?.focus()}},[selected]);
  const index=selected??0;const data=problems[index];const Demo=demos[index];
  return <AnimatePresence initial={false}>{selected!==null&&<motion.div className="v2-overlay" role="presentation" key="problem-explorer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.22}}>
    <section className="v2-dialog" role="dialog" aria-modal="true" aria-label={`${data.title}的解决方法`} data-problem={index+1}>
      <div className="v2-dialog-head"><span className="v2-overline">LEARNING PROBLEM / {String(index+1).padStart(2,'0')} OF 04</span><button type="button" ref={closeRef} className="v2-close" onClick={onClose} aria-label="返回四个学习困境">返回四个困境 ×</button></div>
      <div className="v2-dialog-body"><div className="v2-dialog-intro"><span className="v2-overline">学习困境</span><h2>{data.title}</h2><h3>{data.method}</h3><p>{data.scene}</p><div className="v2-dialog-steps"><div><b>01 / 识别问题</b><p>{data.scene}</p></div><div><b>02 / 我怎样处理</b><p>{data.process}</p></div><div><b>03 / 怎样验证</b><p>{data.verify}</p></div></div></div>
      <div className="v2-dialog-demo"><Demo/><p className="v2-disclaimer">教学场景与学生 A/B 均为说明方法的模拟案例，并非真实客户成果或成绩承诺。</p></div></div>
      <footer className="v2-dialog-footer"><div><strong>想用自己的问题体验？</strong><p>可以带一道最近不会的题，先从具体困难谈起。</p></div><div className="v2-dialog-actions"><button onClick={()=>onSelect((index+3)%4)}>上一个困境</button><button onClick={()=>onSelect((index+1)%4)}>下一个困境</button><button className="v2-cta" onClick={onContact}>带着真实问题联系我 ↗</button></div></footer>
    </section>
  </motion.div>}</AnimatePresence>;
}

export const consultationTemplate='年级与学科：\n目前遇到的具体困难：\n已经尝试的方法：\n希望获得的帮助：\n（不需要提供学生姓名、班级或其他敏感信息）';
export function ServiceOffer(){
  const [copied,setCopied]=useState(false);
  const services=[
    ['找到真正的学习障碍','分析一道具体题目和学生已有思路，区分知识理解、学习方法与反馈障碍。'],
    ['设计针对性的学习方法','按实际卡点选择讲解、可视化、AI 追问和练习，不直接套用同一套课程。'],
    ['带领完成一段学习过程','让学生从理解问题到尝试练习主动参与，而不是只观看答案。'],
    ['检验是否真正理解','通过变式题、独立解释和实际作答判断方法是否有效。'],
    ['积累可长期复用的经验','按需整理错因、知识关联和复习建议，为个人 AI 学习系统建立基础。']
  ];
  return <div className="v2-services"><div className="v2-overline">WHAT I WILL DO / 我会提供什么</div><h3>从一个真实问题开始，我会提供五项支持</h3><ol>{services.map(([title,desc],i)=><li key={title}><b>{String(i+1).padStart(2,'0')} · {title}</b><p>{desc}</p></li>)}</ol><div className="v2-service-result"><strong>首次沟通可以得到什么？</strong><p>对具体困难的初步分析、适合的学习方式展示、独立理解的检验思路，以及是否需要进一步支持的建议。具体安排在沟通时确认。</p></div><button className="v2-cta v2-service-copy" onClick={async()=>{const ok=await copyText(consultationTemplate);setCopied(ok);if(!ok)window.prompt('请复制以下咨询模板：',consultationTemplate);}}>{copied?'咨询信息模板已复制 ✓':'复制咨询信息模板 ↗'}</button><p className="v2-muted">无需填写全部 52 项需求问卷；提供年级、学科和一个真实困难即可。请勿发送学生敏感信息。</p></div>;
}

export function InlineABCase({onExplore}:{onExplore:()=>void}){
  const [student,setStudent]=useState<'A'|'B'>('A');
  return <div className="v2-inline-case"><div className="v2-overline">CLASSROOM SCENARIO / 教学演示案例</div><h3>同一道函数题，两个学生为什么需要不同的讲解？</h3><div className="v2-tab-row">{(['A','B'] as const).map(x=><button aria-pressed={student===x} className={student===x?'active':''} key={x} onClick={()=>setStudent(x)}>学生 {x}</button>)}</div><p>{student==='A'?'已经会求导，但容易判断错不等式的符号。我会先回到数轴和符号分析。':'能解不等式，却不理解导数正负与函数单调性的关系。我会先用函数图像建立直觉。'}</p><button className="v2-inline-action" onClick={onExplore}>查看完整教学过程 ↗</button></div>;
}
