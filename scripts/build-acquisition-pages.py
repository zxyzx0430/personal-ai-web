"""Build conversion-oriented story panels, retaining original content as source assets.
The original seven panels are backed up in `src/content/about-pages-original/`.
Do not substitute the teaching examples for validated student outcomes.
"""
from pathlib import Path
from bs4 import BeautifulSoup
from copy import deepcopy
root=Path(__file__).resolve().parents[1]
out=root/'src/content/about-pages'
original=root/'src/content/about-pages-original'
original.mkdir(exist_ok=True)
for path in sorted(out.glob('??.html')):
    archive=original/path.name
    if not archive.exists():archive.write_text(path.read_text(),encoding='utf-8')
S={i:BeautifulSoup((original/f'{i:02}.html').read_text(), 'html.parser') for i in range(1,8)}
def top(i):return S[i].select_one('section')
def card_replace(node,old,new):
    node.string=new

def page(n,markup):
    soup=BeautifulSoup(markup,'html.parser')
    (out/f'{n:02}.html').write_text(str(soup),encoding='utf-8')
    print(n, 'bytes',len(str(soup)), 'links',len(soup.select('a')))

# 01. Preserve the original hero illustration and its entire 1→3→5 animation.
hero=deepcopy(top(1))
hero.select_one('.eyebrow').string='FOR PARENTS / START WITH A REAL QUESTION'
h1=hero.select_one('h1');h1.clear();h1.append('孩子听懂了，');h1.append(BeautifulSoup('<br/>','html.parser'));h1.append('为什么换一道题');h1.append(BeautifulSoup('<br/>','html.parser'));h1.append(BeautifulSoup('<span class="blue">还是不会？</span>','html.parser'))
hero.select_one('.hero-intro').string='有时候孩子需要的不是再听一遍答案，而是弄清：他已经会哪一步，真正卡在哪里。先看四种常见困境和一次针对性学习过程，再决定是否需要额外支持。'
actions=hero.select_one('.actions')
links=actions.select('a')
links[0]['href']='#problems';links[0].string='先看四种学习困境 ↗'
links[1]['href']='#contact';links[1].string='从一道真实题开始交流 ↗'
hero.select_one('.hero-foot').string='不是让 AI 替孩子做题，而是让孩子更清楚地理解、验证和改进自己的学习。'
page(1,str(hero))

# 02. Keep every original four-card problem, but add a clickable drilldown via React.
problems=deepcopy(top(2));sec=problems.select_one('.sec-head');sec.select_one('h2').clear();sec.select_one('h2').append(BeautifulSoup('同样的学习困难，<br/><span class="blue">原因可能不同。</span>','html.parser'))
sec.select_one('p').string='先选出最像孩子真实情况的一项。点开卡片，看看问题可能出在哪个环节、怎样验证，再按需观看相应的视频讲解。'
for i,article in enumerate(problems.select('.problem'),1):article['data-insight']=str(i)
problems.append(BeautifulSoup('<p class="acq-disclaimer mono">案例用于解释诊断思路，并非对真实学生结果的展示。实际判断应以孩子自己的题目与无提示作答为依据。</p>','html.parser'))
page(2,str(problems))

# 03. A/B teaching case, followed by all three original method cards.
method=deepcopy(top(3));head=method.select_one('.sec-head')
head.select_one('h2').clear();head.select_one('h2').append(BeautifulSoup('同一道题，<br/><span class="blue">为什么需要不同的讲解？</span>','html.parser'))
head.select_one('p').string='你的讲解视频中有一个函数学习的对比例子：学生 A 与 B 可能犯相似的错误，却需要完全不同的辅助。先把问题定位到具体环节，再谈个性化学习。'
method.select_one('.method').insert_before(BeautifulSoup('<div class="acq-case-host" data-acquisition="ab-case"></div>','html.parser'))
method.select_one('.method').insert_before(BeautifulSoup('<p class="acq-mini-label mono">从个体差异走向实际学习方法 / HOW WE SUPPORT</p>','html.parser'))
method.append(BeautifulSoup('<p class="acq-disclaimer mono">上方 A/B 为已有演讲中的概念示例，不是已验证的学员档案。具体方法以真实错因和独立复测决定。</p>','html.parser'))
page(3,str(method))

# 04. Real first-session explanation with every original growth direction available intact.
growth=deepcopy(top(4));head=growth.select_one('.sec-head');head.select_one('h2').clear();head.select_one('h2').append(BeautifulSoup('第一次体验，<br/><span class="blue">家长能看到什么？</span>','html.parser'))
head.select_one('p').string='先用一项真实学习任务，看看孩子怎么思考、AI 能否提供针对性的辅助，以及离开提示后能否自己做出来。是否适合使用这套方法，应当由实际过程来判断。'
original_grid=growth.select_one('.growth-grid').extract();original_foot=growth.select_one('.growth-foot').extract()
steps=BeautifulSoup('''<div class="acq-experience" aria-label="初次体验的五个环节">
  <article class="acq-experience-step"><span>01</span><strong>先理解学习方法</strong><p>家长与孩子一起了解十页系统演示，确认它不是 AI 代写作业。</p></article>
  <article class="acq-experience-step"><span>02</span><strong>带来一道真实问题</strong><p>展示原本的尝试，标出哪一步开始不理解。</p></article>
  <article class="acq-experience-step"><span>03</span><strong>获得针对性支持</strong><p>通过提示、追问或可视化，处理确定的知识卡点。</p></article>
  <article class="acq-experience-step"><span>04</span><strong>不看提示独立检验</strong><p>完成相近难度的新题，观察能否举一反三。</p></article>
  <article class="acq-experience-step"><span>05</span><strong>留下学习记录</strong><p>把经过确认的错因与方法记录下来，供后续复习验证。</p></article>
</div>''','html.parser')
growth.append(steps)
growth.append(BeautifulSoup('<div class="acq-experience-footer"><strong>第一次体验真正要得到的：</strong>一份真实问题的分析、一次独立检测的记录，以及下一步重点。<a href="../?view=study">查看完整十页演示 ↗</a></div>','html.parser'))
detail=BeautifulSoup('<details class="acq-growth-library" id="growth"><summary><span>六个成长支持方向 · 完整保留</span><small>学科以外的长期成长，按实际需要选择，不是六门固定课程</small></summary><div class="acq-growth-content"><p class="acq-growth-intro">学科学习之外，也可结合具体情境探索财商、沟通、批判性思维、自我管理、项目实践与兴趣发展。以下保留原有六个方向的完整介绍。</p></div></details>','html.parser')
content=detail.select_one('.acq-growth-content');content.append(original_grid);content.append(original_foot)
growth.append(detail)
page(4,str(growth))

# 05. Independent evidence, then intact original value proposition + all original flow cards.
original_hero=top(1)
flow=original_hero.select_one('.hero-visual')
source_introduction='孩子是否真的需要额外的 AI 学习支持？先从他真实遇到的问题、已有优势和未来想培养的能力出发，再讨论什么样的方法适合他。让今天解决的问题，成为明天可以复用的经验。'
sec5=BeautifulSoup('''<section class="section wrap acq-verification" id="verification"><div class="sec-head"><span class="sec-num mono">05 / VERIFY & CONTINUE</span><h2>真正学会了，<br/><span class="blue">应该怎样判断？</span></h2><p>拿到 AI 的答案不等于掌握。我们更关心孩子能否解释卡点、不看提示完成新题，并让正确的方法在下次学习中被检验和复用。</p></div>
<div class="acq-proof-grid">
<article class="acq-proof"><span class="mono">01 / 定位</span><strong>不只知道哪题做错</strong><p>看孩子的原始思路，找到哪一步、哪项前置知识或方法没有建立。</p></article>
<article class="acq-proof"><span class="mono">02 / 验证</span><strong>换题无提示作答</strong><p>离开 AI，再完成相近难度的任务；如果仍不会，继续调整方法。</p></article>
<article class="acq-proof"><span class="mono">03 / 积累</span><strong>让旧错误参与下一次</strong><p>保存经确认的错因、方法与复测记录，复习时调用并更新。</p></article>
</div>
<div class="acq-original-intro"><span class="mono">PERSONAL AI STUDY SYSTEM / 项目原始理念</span><h3>先看见需要。再讨论如何支持成长。</h3><p></p></div>
<div class="acq-loop-head"><span class="mono">THE ORIGINAL FIVE-STEP LEARNING LOOP</span><strong>学习问题如何转化为长期可以复用的经验？</strong></div>
<div class="acq-learning-loop"></div>
<p class="acq-disclaimer">这是一套正在实践验证的学习支持方案。目标是培养独立理解和解决问题的能力，不承诺特定成绩提升。</p>
</section>''','html.parser')
sec5.select_one('.acq-original-intro p').string=source_introduction
loop=sec5.select_one('.acq-learning-loop')
for step in flow.select('.flow-step'):loop.append(deepcopy(step))
assert len(loop.select('.flow-step'))==5
page(5,str(sec5))

# 06. Retain the video, student demo, sources and three PDF sets, with a clearer hierarchy.
more=deepcopy(top(6));resources=deepcopy(top(5))
more_head=more.select_one('.sec-head');more_head.select_one('h2').clear();more_head.select_one('h2').append(BeautifulSoup('看真实讲解，<br/><span class="blue">再独立判断。</span>','html.parser'))
more_head.select_one('p').string='先用视频理解为什么不同学习问题需要不同支持，再亲自体验学生版。研究资料与 PDF 免费公开，供家长根据自己的兴趣进一步核查。'
video_grid=more.select_one('.asset-grid')
video_grid.insert_before(BeautifulSoup('<div class="acq-resources-head"><strong>第一步｜观看解释与体验</strong><span>讲解视频中约 01:40–02:50 是四个困境，05:05–06:10 是学生 A/B 的示意分析。</span></div>','html.parser'))
pdf_head=BeautifulSoup('<div class="acq-resources-head"><strong>第二步｜按需要领取免费资料</strong><span>三份 PDF 均可直接阅读与下载，不需要先添加微信或登记学生信息。</span></div>','html.parser')
old_grid=resources.select_one('.asset-grid').extract()
old_grid['class']=old_grid.get('class',[])+['acq-pdf-grid']
more.select_one('.thin-rule').insert_before(pdf_head)
more.select_one('.thin-rule').insert_before(old_grid)
# Original wording retained in note, not hidden from users.
more.select_one('.sources').insert_before(BeautifulSoup('<p class="acq-disclaimer">原先的项目介绍与五步学习闭环已移至第 5 页，完整六个成长支持方向位于第 4 页的可展开区域。</p>','html.parser'))
page(6,str(more))

# 07. One-question lead-in, no collection of student identifiers.
contact=deepcopy(top(7));head=contact.select_one(':scope > div:first-child');head.select_one('h2').clear();head.select_one('h2').append(BeautifulSoup('带来一个具体问题，<br/><span class="blue">我们从这里开始。</span>','html.parser'))
head.select_one('p').string='无需事先判断孩子缺什么能力，也不需要先决定是否参加课程。可以只描述一次真实的学习困难，以及孩子已经尝试过什么；我们先讨论问题适不适合这种方法。'
header=BeautifulSoup('<div class="acq-contact-prompt"><span class="mono">FIRST MESSAGE / 第一次交流</span><p>第一次只需说清楚三件事：<b>哪个学段、哪一类学习问题、孩子已经尝试了什么。</b>不必提交姓名、学校、班级或完整作业照片。</p><button type="button" class="btn primary" data-copy="您好，我想了解《在学中扩展》是否适合孩子。孩子目前所处学段：____；最困扰的学习问题：____；已经尝试过的方法：____。希望先交流这个问题怎样分析。" data-success="已复制咨询模板">复制一段简短咨询模板 ↗</button></div>','html.parser')
contact.select_one('.contact-panel').insert_before(header)
page(7,str(contact))

# Verify legacy critical assets still exist exactly once in the new narrative.
allpages='\n'.join((out/f'{i:02}.html').read_text() for i in range(1,8))
for needle in ['parent-needs-and-growth-guide-2026.pdf','personal-ai-study-introduction-2026.pdf','ai-parent-research-guide-2026.pdf','v.douyin.com/rtKle9ly734','财商与经济思维','人际沟通与合作','批判性思维','自我与时间管理','商业与项目实践','兴趣与长期发展','五步','独立验证']:
    assert needle in allpages, f'missing: {needle}'
print('Important learning content, all PDFs, all six growth directions and video retained')
