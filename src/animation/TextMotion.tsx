import { motion } from 'motion/react';

const smooth=[0.22,1,0.36,1] as const;

/** Heading is present in its final semantic markup before first paint, but hidden until arrival. */
export function NarrativeHeading({as='h2',children,ready,off,page=0,props={}}:{
  as?:'h1'|'h2';children:React.ReactNode;ready:boolean;off:boolean;page?:number;props?:Record<string,unknown>
}){
  const wipe=as==='h2'&&(page===2||page===5);
  const reveal=wipe?{opacity:0,clipPath:'inset(0 100% 0 0)',y:0,filter:'blur(0px)'}:
    {opacity:0,clipPath:'inset(0 0% 0 0)',y:as==='h1'?28:18,filter:`blur(${as==='h1'?13:9}px)`};
  const shown={opacity:1,clipPath:'inset(0 0% 0 0)',y:0,filter:'blur(0px)'};
  const Component=as==='h1'?motion.h1:motion.h2;
  return <Component {...props} data-text-animation={wipe?'wipe':'blur-in'}
    initial={off?false:reveal} animate={ready||off?shown:reveal}
    transition={off?{duration:0}:{duration:as==='h1'?1.02:.76,delay:as==='h1'?.18:.08,ease:smooth}}>
    {children}
  </Component>;
}

/** Letter-by-letter, but keeps the full text accessible and never mutates the DOM imperatively. */
export function TypewriterParagraph({text,ready,off,className}:{text:string;ready:boolean;off:boolean;className:string}){
  return <p className={className} data-text-animation="typewriter" aria-label={text}>
    <span aria-hidden="true">{Array.from(text).map((char,i)=><motion.span key={i}
      style={{whiteSpace:'pre-wrap'}} initial={off?false:{opacity:0}}
      animate={{opacity:ready||off?1:0}}
      transition={off?{duration:0}:{duration:.13,delay:.42+i*.023}}
    >{char}</motion.span>)}</span>
  </p>;
}

export function NarrativeLine({children,ready,off,kind='eyebrow',props={}}:{
  children:React.ReactNode;ready:boolean;off:boolean;kind?:'eyebrow'|'intro'|'actions'|'foot';props?:Record<string,unknown>
}){
  const base=kind==='intro'?{opacity:0,clipPath:'inset(0 100% 0 0)'}:{opacity:0,y:kind==='actions'?12:6};
  const shown=kind==='intro'?{opacity:1,clipPath:'inset(0 0% 0 0)'}:{opacity:1,y:0};
  const duration=kind==='intro'?.66:.5;
  const delay=kind==='intro'?.13:kind==='actions'?.95:kind==='foot'?.55:.06;
  const Tag=kind==='intro'?motion.p:motion.div;
  return <Tag {...props} data-text-animation={kind==='intro'?'typewriter-reveal':kind}
    initial={off?false:base} animate={ready||off?shown:base}
    transition={off?{duration:0}:{duration,delay,ease:kind==='intro'?'linear':smooth}}>{children}</Tag>;
}
