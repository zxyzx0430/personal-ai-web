import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { FanCard } from '../animation/SceneMotifs';

export const TALK_URL='https://v.douyin.com/rtKle9ly734/';

const insights=[
  {
    question:'听懂了，为什么换一道题又不会？',
    inference:'讲过与真正掌握之间，可能缺了将知识应用到新题的步骤。',
    story:'演讲用两名函数学习者作对照：有人会求导却不会判断区间，有人能列符号表却不理解几何意义。相似的错误，不应该得到完全相同的讲解。',
    action:'请孩子说明原来的思路，找出具体卡点，再用相近难度的新题独立验证。',
    time:'约 01:40–06:10',
  },
  {
    question:'公式会背，为什么图像还是想不出来？',
    inference:'符号记忆可能已经建立，但变量变化与几何结果还没有关联。',
    story:'你的二次函数演示通过修改 y = ax² 中 a 的数值，让孩子先预测开口，再观察曲线的连续变化，而不是只背“a 决定开口”。',
    action:'让学生先预测参数变化，再比较曲线，最后独立解释新的参数情况。',
    time:'约 06:15–08:10',
  },
  {
    question:'错题已经订正，为什么下一次还错？',
    inference:'抄下正确答案，不等于确认自己究竟在哪个思维环节出错。',
    story:'演讲把错题拆成“具体错因 → 学生确认 → 学习记录 → 下次调取 → 再次验证”，强调留下的是可复用的经验，而不只是完整答案。',
    action:'先问“为什么错”，再用一道新题验证；确认后的错因才进入复习记录。',
    time:'约 08:15–10:20',
  },
  {
    question:'问题只能等讲评，思路已经忘了怎么办？',
    inference:'反馈太晚可能增加重新恢复解题思路的成本，但即时给答案也不是目标。',
    story:'演讲对照“第二天等待讲评”与“当下保留原思路并获得针对性追问”，帮助家长理解为什么反馈应该围绕学生真实思考。',
    action:'保留已经做对的步骤，对卡住的一步提供提示，再由学生独立完成后续部分。',
    time:'约 12:00–13:30',
  },
];

export function ProblemInsightCard({index,phase,off,children,opened,onToggle}:{
 index:number;phase:number;off:boolean;children:ReactNode;opened:boolean;onToggle:()=>void;
}){
 const item=insights[index];
 return <FanCard page={1} index={index} phase={phase} off={off} className={`problem acq-problem ${opened?'is-expanded':''}`}>
   {children}
   <button type="button" className="acq-problem-toggle" aria-expanded={opened} onClick={onToggle}>
     {opened?'收起原因与实例':'拆开看看原因与实例'} <span aria-hidden="true">{opened?'−':'+'}</span>
   </button>
   <AnimatePresence initial={false}>
   {opened&&<motion.div className="acq-problem-detail" key="detail" initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:.42,ease:[.22,1,.36,1]}}>
     <div className="acq-detail-inner">
       <div className="acq-detail-item"><span>可能的原因</span><p>{item.inference}</p></div>
       <div className="acq-detail-item"><span>来自已有讲解</span><p>{item.story}</p></div>
       <div className="acq-detail-item"><span>可以怎样验证</span><p>{item.action}</p></div>
       <a className="acq-video-link" href={TALK_URL} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>
         看作者完整讲解（参考 {item.time}） ↗
       </a>
       <small className="acq-reference-note">时间为完整视频中的参考位置，打开后可能需要手动定位。讲解中的案例是概念示意，不代表已验证的学员成效。</small>
     </div>
   </motion.div>}
   </AnimatePresence>
 </FanCard>;
}

type Student='A'|'B';
const examples:Record<Student,{label:string;already:string;gap:string;support:string;check:string}>={
 A:{label:'学生 A｜会求导，符号表却出错',already:'知道怎样求导，可以写出求导结果。',gap:'没有正确按临界点划分区间，导致增减性判断出错。',support:'把导数的正负分区与函数增减变化对应起来。',check:'换一道类似题，自己列出区间、判断增减，并解释为什么。'},
 B:{label:'学生 B｜会分区，但缺少几何直觉',already:'会机械地做导数符号分析。',gap:'不理解导数的正负如何对应切线斜率和图像的变化。',support:'使用可以连续变化的曲线与切线，观察斜率和函数增减。',check:'看新的函数图像，自行解释斜率、增减与导数之间的关系。'},
};
export function StudentComparison(){
 const [student,setStudent]=useState<Student>('A');
 const e=examples[student];
 return <div className="acq-case-lab" aria-label="函数学习示意比较">
   <div className="acq-case-tabs" role="group" aria-label="选择学生的学习卡点">
     {(['A','B'] as Student[]).map(key=><button type="button" key={key} aria-pressed={student===key} onClick={()=>setStudent(key)}>{examples[key].label}</button>)}
   </div>
   <AnimatePresence mode="wait" initial={false}>
     <motion.div key={student} className="acq-case-body" initial={{opacity:0,y:9,filter:'blur(4px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={{opacity:0,y:-6}} transition={{duration:.35,ease:[.22,1,.36,1]}}>
       <div className="acq-case-line"><span>已经会的</span><p>{e.already}</p></div>
       <div className="acq-case-line is-gap"><span>真正卡住</span><p>{e.gap}</p></div>
       <div className="acq-case-line"><span>针对性支持</span><p>{e.support}</p></div>
       <div className="acq-case-line is-check"><span>独立验证</span><p>{e.check}</p></div>
     </motion.div>
   </AnimatePresence>
   <div className="acq-case-foot"><span>不是学生 A/B 谁更优秀，而是两个人的学习路线不应该完全相同。</span><a href={TALK_URL} target="_blank" rel="noopener noreferrer">观看讲解中的 A/B 分析（约 05:05–06:10） ↗</a></div>
 </div>;
}
