#!/usr/bin/env python3
"""Read-only source parity check. Compare React content fragments to main's originals.

Only static fidelity is covered: dynamic behavior requires separate browser tests.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import base64, hashlib, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
PAGES={'home':'index.html','about':'about/index.html','needs':'needs/index.html','study':'study/index.html','adult':'adult/index.html'}
SLIDES={'study':10,'adult':11}
REPL=re.compile(r'<div data-slide-placeholder="(\d+)"></div>')
class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True);self.skip=0;self.tokens=[];self.tags=[];self.hrefs=[];self.inputs=[];self.ids=[];self.data_attrs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag in ('script','style'):self.skip+=1;return
        if self.skip:return
        self.tags.append(tag)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='a':self.hrefs.append(a.get('href',''))
        if tag=='input':self.inputs.append((a.get('type',''),a.get('data-question',''),a.get('data-topic','')))
        for k,v in attrs:
            if k.startswith('data-'):self.data_attrs.append((tag,k,v))
    def handle_endtag(self,tag):
        if tag in ('script','style') and self.skip:self.skip-=1
    def handle_data(self,data):
        if not self.skip:
            clean=' '.join(data.split())
            if clean:self.tokens.append(clean)
    def handle_entityref(self,name):
        if not self.skip:self.tokens.append('&'+name+';')

def inspect(body):
    c=Collector();c.feed(body);return c

def body(source):
    m=re.search(r'<body\b[^>]*>(.*?)</body>',source,re.I|re.S)
    if not m:raise ValueError('No body')
    return m.group(1)

def run():
    results=[];failed=[]
    for page,original in PAGES.items():
        old=subprocess.check_output(['git','show','main:'+original],cwd=ROOT).decode('utf-8')
        text=(ROOT/'src/content'/f'{page}.html').read_text()
        if page in SLIDES:
            def insert(m):return (ROOT/f'src/content/{page}/slide-{int(m.group(1)):02d}.html').read_text()
            text=REPL.sub(insert,text)
        a,b=inspect(body(old)),inspect(text)
        checks={'text':a.tokens==b.tokens,'tags':a.tags==b.tags,'ids':a.ids==b.ids,'links':a.hrefs==b.hrefs,'questions':a.inputs==b.inputs,'data_attributes':a.data_attrs==b.data_attrs}
        orig_css='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',old,re.I|re.S))
        checks['css']=orig_css==(ROOT/f'src/styles/{page}.css').read_text()
        results.append((page,checks,len(a.tokens),len(a.tags),len(a.hrefs),len(a.ids)))
        if not all(checks.values()):
            failed.append(page)
            for key,good in checks.items():
                if not good:
                    left=getattr(a,{'text':'tokens','tags':'tags','ids':'ids','links':'hrefs','questions':'inputs','data_attributes':'data_attrs'}.get(key,'tokens'),None)
                    right=getattr(b,{'text':'tokens','tags':'tags','ids':'ids','links':'hrefs','questions':'inputs','data_attributes':'data_attrs'}.get(key,'tokens'),None)
                    if left is not None:
                        for i,(x,y) in enumerate(zip(left,right)):
                            if x!=y:print('DIFF',page,key,i,str(x)[:100],str(y)[:100]);break
                        print('COUNTS',page,key,len(left),len(right))
        print(f'{page:6}: '+','.join(k+'='+('PASS' if v else 'FAIL') for k,v in checks.items())+f' text_chunks={len(a.tokens)} nodes={len(a.tags)} anchors={len(a.hrefs)} ids={len(a.ids)}')
    for f in (ROOT/'resources').glob('*.pdf'):
        target=ROOT/'public/resources'/f.name
        ok=target.is_file() and hashlib.sha256(f.read_bytes()).digest()==hashlib.sha256(target.read_bytes()).digest()
        print('PDF',f.name,'PASS' if ok else 'FAIL')
        if not ok:failed.append(f.name)
    old=subprocess.check_output(['git','show','main:study/index.html'],cwd=ROOT).decode('utf8')
    media=re.findall(r'data:(image|video|audio)/([\w+.-]+);base64,([A-Za-z0-9+/=]+)',old)
    for i,(_,typ,b64) in enumerate(media,1):
        ext=typ.replace('svg+xml','svg').replace('jpeg','jpg');f=ROOT/'public/media'/f'study-embedded-{i}.{ext}'
        ok=f.is_file() and hashlib.sha256(f.read_bytes()).digest()==hashlib.sha256(base64.b64decode(b64)).digest()
        print('MEDIA',f.name,'PASS' if ok else 'FAIL')
        if not ok:failed.append(f.name)
    print('SUMMARY', 'STATIC CONTENT PARITY PASS' if not failed else 'STATIC CONTENT PARITY FAILED: '+','.join(failed))
    return 1 if failed else 0
if __name__=='__main__':sys.exit(run())
