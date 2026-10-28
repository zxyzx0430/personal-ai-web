import {test,expect} from '@playwright/test';

test('first page links directly to parent discovery questionnaire',async({page})=>{
 await page.goto('/about/#page-01');
 await expect(page.locator('.hero .hero-needs-link')).toBeVisible();
 await page.locator('.hero-needs-link').click();
 await expect(page).toHaveURL(/\/needs\//);
 await expect(page.locator('input[data-question]')).toHaveCount(52);
});

test('top three navigation links work and personal-home shows non-navigating message',async({page})=>{
 await page.goto('/about/#page-01');
 await page.locator('.top-links a[data-direct-nav="resources"]').click();
 await expect(page.locator('.motion-panel[data-page="6"]')).toBeAttached();
 await page.locator('.top-links a[data-direct-nav="contact"]').click();
 await expect(page.locator('.motion-panel[data-page="7"]')).toBeAttached();
 await page.locator('.top-links a[data-questionnaire]').click();
 await expect(page).toHaveURL(/\/needs\//);
 let message='';page.once('dialog',dialog=>{message=dialog.message();void dialog.accept()});
 await page.locator('.top nav .personal-home-link').click();
 await expect.poll(()=>message).toBe('在建设中，暂时无法进入');
 await expect(page).toHaveURL(/\/needs\//);
});

test.describe('animated hero learning controls',()=>{
 test.use({reducedMotion:'no-preference'});
 test('preserves 1 -> 3 -> 5 morph with slow read time, then manual mode',async({page})=>{
  test.setTimeout(30000);
  await page.goto('/about/#page-01');
  const hero=page.locator('.home-morph-stage');
  await expect(hero).toHaveAttribute('data-phase','0');
  await page.waitForTimeout(1500);
  await expect(hero).toHaveAttribute('data-phase','0');
  await expect(hero).toHaveAttribute('data-phase','1',{timeout:2800});
  await expect(hero).toHaveAttribute('data-phase','2',{timeout:4500});
  await expect(page.locator('.home-morph-stepbar button')).toHaveCount(7);
  await expect(hero).toHaveAttribute('data-active-step','1');
  await page.locator('.home-morph-stepbar button[aria-label="第 3 步：独立验证"]').click();
  await expect(hero).toHaveAttribute('data-active-step','3');
  await expect(hero).toHaveAttribute('data-manual','true');
  await page.waitForTimeout(3350);
  await expect(hero).toHaveAttribute('data-active-step','3');
  await page.keyboard.press('ArrowRight');
  await expect(hero).toHaveAttribute('data-active-step','4');
  await page.keyboard.press('ArrowLeft');
  await expect(hero).toHaveAttribute('data-active-step','3');
  await page.locator('.home-morph-stepbar button[aria-label="下一步"]').click();
  await expect(hero).toHaveAttribute('data-active-step','4');
 });
});

test('mobile header keeps all four links visible and no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:360,height:740});await page.goto('/about/#page-01');
 for(const label of ['家长需求','免费资源','联系作者','个人主页']){
  await expect(page.locator('.site-top .top-links a').filter({hasText:label})).toBeVisible();
 }
 const data=await page.evaluate(()=>({width:innerWidth,docWidth:document.documentElement.scrollWidth,nav:document.querySelector('.site-top .top-links')!.getBoundingClientRect().toJSON()}));
 expect(data.docWidth).toBeLessThanOrEqual(data.width+2);
 expect(data.nav.right).toBeLessThanOrEqual(data.width+2);
});

test.describe('mobile delayed hero visibility',()=>{
 test.use({reducedMotion:'no-preference'});
 test('mobile 1→3→5 waits until the user scrolls to the picture',async({page})=>{
  test.setTimeout(18000);await page.setViewportSize({width:390,height:844});await page.goto('/about/#page-01');
  const stage=page.locator('.home-morph-stage');await expect(stage).toHaveAttribute('data-phase','0');
  await page.waitForTimeout(3100);await expect(stage).toHaveAttribute('data-phase','0');
  await page.locator('.motion-panel').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(stage).toHaveAttribute('data-phase','1',{timeout:5000});
 });
});

test('embedded home route uses functioning header links and questionnaire button',async({page})=>{
 await page.goto('/?view=about');
 const root=page.locator('#presentation');
 await root.locator('.top-links a[data-direct-nav="resources"]').click();
 await expect(page).toHaveURL(/\/about\/#page-06/);
 await expect(page.locator('.motion-panel[data-page="6"]')).toBeAttached();
 await page.locator('.top-links a[data-direct-nav="contact"]').click();
 await expect(page).toHaveURL(/\/about\/#page-07/);
 await expect(page.locator('.motion-panel[data-page="7"]')).toBeAttached();
 await page.locator('.top-links a[data-questionnaire]').click();
 await expect(page).toHaveURL(/\/needs\//);
});

test.describe('real pointer hit targets, not synthetic button events',()=>{
 test.use({reducedMotion:'no-preference'});
 test('any click in right half advances the visible diagram; left half returns, stopping autoplay',async({page})=>{
  test.setTimeout(20000);
  await page.goto('/about/#page-01');
  const overlay=page.locator('.home-morph-stage');
  const bounds=await overlay.boundingBox();expect(bounds).not.toBeNull();
  const right=()=>page.mouse.click(bounds!.x+bounds!.width*.85,bounds!.y+bounds!.height*.52);
  const left=()=>page.mouse.click(bounds!.x+bounds!.width*.15,bounds!.y+bounds!.height*.52);
  expect(await page.evaluate(([x,y])=>document.elementFromPoint(x,y)?.getAttribute('aria-label'),[bounds!.x+bounds!.width*.85,bounds!.y+bounds!.height*.52])).toBe('右侧：下一个内容');
  await right();await expect(overlay).toHaveAttribute('data-phase','1');
  await page.waitForTimeout(3400);await expect(overlay).toHaveAttribute('data-phase','1');
  await right();await expect(overlay).toHaveAttribute('data-phase','2');
  await expect(overlay).toHaveAttribute('data-active-step','1');
  await right();await expect(overlay).toHaveAttribute('data-active-step','2');
  await left();await expect(overlay).toHaveAttribute('data-active-step','1');
  await left();await expect(overlay).toHaveAttribute('data-phase','1');
  await left();await expect(overlay).toHaveAttribute('data-phase','0');
  await right();await expect(overlay).toHaveAttribute('data-phase','1');
 });
 test('the pointer hit targets work on narrow mobile sized viewports',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/about/#page-01');
  await page.locator('.motion-panel').evaluate(el=>el.scrollTop=el.scrollHeight);
  const overlay=page.locator('.home-morph-stage');const bounds=await overlay.boundingBox();expect(bounds).not.toBeNull();
  const x=bounds!.x+bounds!.width*.89, y=Math.min(800,bounds!.y+bounds!.height*.48);
  await page.mouse.click(x,y);await expect(overlay).toHaveAttribute('data-phase','1');
  await page.mouse.click(x,y);await expect(overlay).toHaveAttribute('data-phase','2');
 });
});

test('header links respond to actual cursor clicks from both portal and standalone page',async({page})=>{
 for(const path of ['/about/#page-01','/?view=about']){
  for(const [name,target] of [['resources','6'],['contact','7'],['questionnaire','needs']] as const){
   await page.goto(path);
   const selector=name==='questionnaire'?'.top-links a[data-questionnaire]':`.top-links a[data-direct-nav="${name}"]`;
   const a=page.locator(selector);await expect(a).toBeVisible();
   const b=await a.boundingBox();expect(b).not.toBeNull();
   await page.mouse.click(b!.x+b!.width/2,b!.y+b!.height/2);
   if(name==='questionnaire'){await expect(page).toHaveURL(/\/needs\//);await expect(page.locator('input[data-question]')).toHaveCount(52);}
   else{await expect(page).toHaveURL(new RegExp('page-0'+target));await expect(page.locator(`.motion-panel[data-page="${target}"]`)).toBeAttached();}
  }
 }
 let msg='';await page.goto('/about/');page.once('dialog',d=>{msg=d.message();void d.accept()});
 const a=page.locator('.top-links a.personal-home-link');const b=await a.boundingBox();expect(b).not.toBeNull();
 await page.mouse.click(b!.x+b!.width/2,b!.y+b!.height/2);await expect.poll(()=>msg).toContain('在建设中');
});
