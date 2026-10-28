import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';

const flow = [
 ['发现真实问题','学生先留下自己的思考与卡点'],
 ['针对性理解','AI 辅助解释、追问与交互演示'],
 ['独立验证','离开 AI，完成新的练习与解释'],
 ['整理学习经验','经学生确认后，保存错因与联系'],
 ['下一次继续使用','旧经验参与新一次学习与复习'],
] as const;
const causes = [
 ['知识理解','听懂了，是否真正掌握？'],
 ['学习方法','有努力，是否形成有效路径？'],
 ['反馈节奏','出错之后，能否及时改进？'],
] as const;
const headings = [
 ['从一个真实问题出发。','先不要急着寻找工具，而是判断究竟发生了什么。'],
 ['表面相似，原因可能不同。','知识理解、学习方法、反馈节奏，需要不同的支持。'],
 ['把支持组织成可持续的系统。','从发现问题，到让经验参与下一次学习。'],
];
const phases = ['01 / 03 · 看见问题','02 / 03 · 分辨原因','03 / 03 · 建立系统'];

/** Recreates the approved V6.1 visual composition in React; no DOM insertion, timers or WAAPI. */
export function HeroMorph({phase,off,children,onReplay,onSkip}:{
 phase:number;off:boolean;children:ReactNode;onReplay:()=>void;onSkip:()=>void;
}){
 const stage=Math.min(2,phase);
 const items=stage===0?[['?','学习遇到了困难。','真正的问题在哪里？']]:
  stage===1?causes.map((v,i)=>[String(i+1).padStart(2,'0'),...v]):
  flow.map((v,i)=>[String(i+1).padStart(2,'0'),...v]);
 return <div className={`hero-visual react-hero-visual ${!off&&phase<3?'is-morphing':''}`}>
   {children}
   <AnimatePresence initial={false}>
    {!off&&phase<3&&<motion.div className="home-morph-stage" data-phase={stage} key="hero-overlay"
      initial={{opacity:1}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.45}} aria-label="从真实问题到五步学习闭环的因果演示">
      <div className="home-morph-intro">
        <div className="home-morph-kicker">FROM A QUESTION TO A LEARNING SYSTEM</div>
        <h2 className="home-morph-title">{headings[stage][0]}</h2>
        <p className="home-morph-sub">{headings[stage][1]}</p>
      </div>
      <div className="home-morph-nodes">
        {Array.from({length:5},(_,i)=>{
          const item=items[i];
          return <motion.div layout key={i} data-index={i} className={`home-morph-node ${item?'':'home-morph-empty'}`}
            initial={false} animate={{opacity:item?1:0}}
            transition={{layout:{duration:.95,ease:[.18,.84,.22,1]},opacity:{duration:.65,delay:i*.08}}}>
            <b>{item?.[0]||''}</b>
            <div><strong>{item?.[1]||''}</strong><small>{item?.[2]||''}</small></div>
            <span className="home-morph-index" aria-hidden="true">{stage===2&&i===4?'↻':'↘'}</span>
          </motion.div>;
        })}
      </div>
      <div className="home-morph-footer"><span>{phases[stage]}</span><div className="home-morph-track"><span style={{width:`${(stage+1)/3*100}%`}}/></div></div>
    </motion.div>}
   </AnimatePresence>
   {!off&&<button type="button" className="home-morph-control" onClick={phase>=3?onReplay:onSkip}>{phase>=3?'重播开场 ↺':'跳过开场 ↗'}</button>}
 </div>;
}

/** Animate the REAL existing cards, as in the HTML visual, rather than inserting extra summary cards. */
export function FanCard({page,index,phase,off,children,className,...rest}:{
 page:number;index:number;phase:number;off:boolean;children:ReactNode;className:string;[key:string]:unknown;
}){
 const mobile=typeof window!=='undefined'&&window.innerWidth<=600;
 const count:Record<number,number>={1:4,2:3,3:6,4:3,5:2,6:4};
 const row=page===1?Math.floor(index/2):page===3?Math.floor(index/3):page===6?index:0;
 const col=page===1?index%2:page===3?index%3:index;
 const x=mobile?0:(page===1?(0.5-col)*260:page===3?(1-col)*175:page===6?0:(page===5?(0.5-col)*240:(1-col)*185));
 const y=mobile?((count[page]||3)/2-index-.5)*43:(page===1?(0.5-row)*68:page===3?(0.5-row)*70:page===6?(1.5-row)*36:0);
 return <motion.article {...rest} className={className}
   initial={off?false:{opacity:0,x,y,scale:.76}}
   animate={off||phase>=1?{opacity:1,x:0,y:0,scale:1}:{opacity:0,x,y,scale:.76}}
   transition={off||phase>=3?{duration:0}:{duration:.76,delay:index*.075,ease:[.18,.78,.23,1]}}
 >{children}</motion.article>;
}
