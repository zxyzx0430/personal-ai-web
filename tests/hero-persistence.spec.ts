import {expect,test} from '@playwright/test';

test.describe('first-page hero progress survives navigation',()=>{
 test.use({reducedMotion:'no-preference'});
 test('completed manual experience never replays on returning or reloading',async({page})=>{
   test.setTimeout(25000);
   await page.goto('/about/#page-01');
   const hero=page.locator('.home-morph-stage');
   const right=hero.locator('.home-morph-side-next');
   await right.click(); // 1 -> 3
   await right.click(); // 3 -> 5, step 1
   for(let i=0;i<4;i++)await right.click();
   await expect(hero).toHaveAttribute('data-phase','2');
   await expect(hero).toHaveAttribute('data-active-step','5');
   await expect(hero).toHaveAttribute('data-manual','true');
   const storage=await page.evaluate(()=>JSON.parse(localStorage.getItem('personal-ai-hero-progress-v1')||'{}'));
   expect(storage).toMatchObject({stage:2,step:4,manual:true,completed:true});
   await page.keyboard.press('PageDown');
   await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
   await page.keyboard.press('PageUp');
   await expect(hero).toHaveAttribute('data-phase','2');
   await expect(hero).toHaveAttribute('data-active-step','5');
   await expect(hero).toHaveAttribute('data-manual','true');
   await expect.poll(()=>page.locator('.motion-panel[data-page="1"] h1').evaluate(e=>Number(getComputedStyle(e).opacity))).toBeGreaterThan(.98);
   await page.waitForTimeout(3200);
   await expect(hero).toHaveAttribute('data-active-step','5');
   await page.reload();
   await expect(hero).toHaveAttribute('data-phase','2');
   await expect(hero).toHaveAttribute('data-active-step','5');
   await expect(hero).toHaveAttribute('data-manual','true');
 });
 test('an unfinished manually selected stage is resumed exactly',async({page})=>{
   test.setTimeout(20000);
   await page.goto('/about/#page-01');
   const hero=page.locator('.home-morph-stage');
   await hero.locator('.home-morph-side-next').click();
   await expect(hero).toHaveAttribute('data-phase','1');
   await page.keyboard.press('PageDown');
   await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
   await page.keyboard.press('PageUp');
   await expect(hero).toHaveAttribute('data-phase','1');
   await expect(hero).toHaveAttribute('data-manual','true');
   await page.waitForTimeout(3200);
   await expect(hero).toHaveAttribute('data-phase','1');
 });
 test('a completed autoplay sequence is not restarted after going away and back',async({page})=>{
   test.setTimeout(40000);
   await page.goto('/about/#page-01');
   const hero=page.locator('.home-morph-stage');
   await expect(hero).toHaveAttribute('data-phase','2',{timeout:11000});
   await expect(hero).toHaveAttribute('data-active-step','5',{timeout:17000});
   await page.keyboard.press('PageDown');await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
   await page.keyboard.press('PageUp');
   await expect(hero).toHaveAttribute('data-phase','2');
   await expect(hero).toHaveAttribute('data-active-step','5');
   await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('personal-ai-hero-progress-v1')||'{}').completed)).toBe(true);
   await page.reload();
   await expect(hero).toHaveAttribute('data-active-step','5');
   await page.waitForTimeout(3200);
   await expect(hero).toHaveAttribute('data-active-step','5');
 });
});
