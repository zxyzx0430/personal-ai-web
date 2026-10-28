import { createElement, useState } from 'react';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/needs.html?raw';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import { copyText } from '../utils/clipboard';

type Question = {topic:string;question:string};
export function NeedsPage() {
  const [selected,setSelected] = useState<Question[]>([]);
  const [feedback,setFeedback] = useState<Record<string,string>>({});
  async function copy(key:string,value:string) {
    const ok=await copyText(value);
    setFeedback(p=>({...p,[key]:ok?'已复制':'请长按复制'}));
    window.setTimeout(()=>setFeedback(p=>{const n={...p};delete n[key];return n}),2200);
    if(!ok) window.prompt('请长按复制以下内容：',value);
  }
  const replace: NonNullable<HTMLReactParserOptions['replace']> = node => {
    if(!isElement(node))return;
    if(node.name==='input' && node.attribs['data-question']) {
      const topic=node.attribs['data-topic'];const question=node.attribs['data-question'];
      return <input {...attrs(node)} checked={selected.some(i=>i.question===question)} onChange={e=>setSelected(p=>e.target.checked?[...p,{topic,question}]:p.filter(i=>i.question!==question))}/>;
    }
    if(node.attribs.id==='chosen')return createElement(node.name,attrs(node),selected.length?`已选择 ${selected.length} 项。建议优先讨论 1—2 个真实情境；复制后可按需删减。`:'尚未选择。可以勾选上方最相关的情境，复制问题清单，仅保存在当前浏览器中，不会自动发送给作者。');
    if(node.name==='a'&&node.attribs['data-under-construction']==='true')return <a {...attrs(node)} onClick={e=>{e.preventDefault();window.alert('在建设中，暂时无法进入');}}>{nodeChildren(node,replace)}</a>;
    if(node.name==='button') {
      const id=node.attribs.id;
      if(!['copy-summary','copy-wechat','clear'].includes(id)&&!node.attribs.onclick)return;
      return <button {...attrs(node)} onClick={()=>{
        if(id==='clear'){setSelected([]);return;}
        if(id==='copy-wechat'){void copy(id,'18043054632');return;}
        if(id==='copy-summary'){
          const msg=selected.length?'我想进一步了解以下学习与成长问题：\n'+selected.map((q,i)=>`${i+1}. 【${q.topic}】${q.question}`).join('\n')+'\n（先交流需求，再判断合适的支持方式。）':'想先聊聊孩子目前的一个具体学习或成长问题。';
          void copy(id,msg);return;
        }
        if(node.attribs.onclick?.includes('print'))window.print();
      }}>{feedback[id]||nodeChildren(node,replace)}</button>;
    }
  };
  return <>{htmlMarkup(source,replace)}</>;
}
