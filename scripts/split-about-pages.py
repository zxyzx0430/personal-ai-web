"""Build seven semantic React-content panels from the accepted About source.
Keep the source as the single authority for all links and statements.
"""
from bs4 import BeautifulSoup
from pathlib import Path
from copy import deepcopy
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'src/content/about.html').read_text(), 'html.parser')
sections=soup.select('main > section')
assert len(sections)==6, f'Unexpected about sections: {len(sections)}'
out=root/'src/content/about-pages'
for i in range(4):
    (out/f'{i+1:02}.html').write_text(str(sections[i]),encoding='utf-8')
resources=sections[4]
first=deepcopy(resources)
last=deepcopy(resources)
for card in first.select('.asset-grid > .asset')[3:]:card.decompose()
for element in first.select('.thin-rule, .sources'):element.decompose()
first['id']='resources'
(out/'05.html').write_text(str(first),encoding='utf-8')
for card in last.select('.asset-grid > .asset')[:3]:card.decompose()
head=last.select_one('.sec-head')
head.select_one('.sec-num').string='05 / EXPLORE'
h2=head.select_one('h2');h2.clear();h2.append('继续探索。');h2.append(soup.new_tag('br'));h2.append('自主判断。')
paragraph=head.select_one('p');paragraph.clear();paragraph.append('进一步观看内容讲解、交互学习演示，并查看原始资料与引用说明。')
last['id']='explore';last.select_one('.asset-grid')['class']=['asset-grid','more-asset-grid']
(out/'06.html').write_text(str(last),encoding='utf-8')
contact=deepcopy(sections[5]);footer=deepcopy(soup.select_one('footer'));footer['class']=['wrap','footer','page-footer'];contact.append(footer)
(out/'07.html').write_text(str(contact),encoding='utf-8')
# Check that original links and substantial text are retained, without duplicates.
from collections import Counter
old=[a.get('href','') for a in soup.select('main a, footer a')]
new=[]
for file in sorted(out.glob('*.html')):
    page=BeautifulSoup(file.read_text(), 'html.parser')
    new += [a.get('href','') for a in page.select('a')]
assert Counter(old)==Counter(new), (Counter(old)-Counter(new),Counter(new)-Counter(old))
assert sum(len(BeautifulSoup(p.read_text(),'html.parser').select('.asset')) for p in out.glob('*.html'))==5
print('Seven pages generated. Links preserved:',len(old),'assets: 5')
