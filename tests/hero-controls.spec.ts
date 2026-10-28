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
 await page.locator('.top-links a[href="#resources"]').click();
 await expect(page.locator('.motion-panel[data-page="6"]')).toBeAttached();
 await page.locator('.top-links a[href="#contact"]').click();
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
 await root.locator('.top-links a[href="#resources"]').click();
 await expect(root.locator('.motion-panel[data-page="6"]')).toBeAttached();
 await root.locator('.top-links a[href="#contact"]').click();
 await expect(root.locator('.motion-panel[data-page="7"]')).toBeAttached();
 await root.locator('.top-links a[data-questionnaire]').click();
 await expect(page).toHaveURL(/\/needs\//);
});