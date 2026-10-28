/** The reader should never watch the completed opening narrative again by accident. */
const KEY='personal-ai-hero-progress-v1';
export type HeroProgress={stage:0|1|2;step:number;manual:boolean;completed:boolean};
export function readHeroProgress():HeroProgress|null{
 try{
   const data=JSON.parse(localStorage.getItem(KEY)||'null') as Partial<HeroProgress>|null;
   if(!data||![0,1,2].includes(data.stage??-1)||typeof data.step!=='number'||!Number.isInteger(data.step)||data.step<0||data.step>4||typeof data.manual!=='boolean'||typeof data.completed!=='boolean')return null;
   return {stage:data.stage as 0|1|2,step:data.step,manual:data.manual,completed:data.completed};
 }catch{return null;}
}
export function saveHeroProgress(next:Omit<HeroProgress,'completed'>){
 try{
   const before=readHeroProgress();
   const completed=Boolean(before?.completed||(next.stage===2&&next.step===4));
   localStorage.setItem(KEY,JSON.stringify({...next,completed} satisfies HeroProgress));
 }catch{/* private browsing / storage restrictions: in-memory animation still works */}
}
export function clearHeroProgress(){try{localStorage.removeItem(KEY)}catch{}}
