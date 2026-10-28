import { useState } from 'react';
import type { HTMLReactParserOptions } from 'html-react-parser';
import source from '../content/about.html?raw';
import { attrs, htmlMarkup, isElement, nodeChildren } from '../components/markup';
import { copyText } from '../utils/clipboard';

export function AboutPage() {
  const [feedback,setFeedback] = useState<Record<string,string>>({});
  const replace: NonNullable<HTMLReactParserOptions['replace']> = node => {
    if (!isElement(node) || node.name !== 'button' || !node.attribs['data-copy']) return;
    const value=node.attribs['data-copy'];
    const label=feedback[value];
    return <button {...attrs(node)} onClick={async()=>{
      const ok=await copyText(value);
      setFeedback(p=>({...p,[value]:ok?(node.attribs['data-success']||'已复制'):'请手动复制'}));
      window.setTimeout(()=>setFeedback(p=>{const n={...p};delete n[value];return n;}),2100);
      if(!ok) window.prompt(node.attribs['data-prompt']||'请复制以下内容：',value);
    }}>{label || nodeChildren(node,replace)}</button>;
  };
  return <>{htmlMarkup(source,replace)}</>;
}
