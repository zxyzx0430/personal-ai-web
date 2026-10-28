import { test, expect } from '@playwright/test';

const pages=['项目介绍','学习困境','学习方法','成长支持','免费资料','更多探索','联系作者'];

test('V6 seven sections, complete resources and original cards', async ({page})=>{
  await page.goto('/about/#page-01');
  await expect(page.locator('.motion-page-list button')).toHaveCount(7);
  await expect(page.locator('.flow-step')).toHaveCount(5);
  for (let i=0;i<7;i++){
    await page.locator('.motion-page-list button').nth(i).click();
    await expect(page.locator('.motion-panel')).toHaveAttribute('data-page',String(i+1));
    await expect(page.locator('.motion-panel')).toHaveAttribute('aria-label', new RegExp(pages[i]));
  }
  await expect(page.locator('#contact .page-footer')).toHaveCount(1);
  await page.locator('.motion-page-list button').nth(4).click();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(6);
});

test('wheel navigates one whole page; browser back restores it', async ({page})=>{
  await page.goto('/about/#page-01');
  await page.mouse.move(550,450);
  for(let i=0;i<6;i++){await page.mouse.wheel(0,70);await page.waitForTimeout(15)}
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-page','2');
  await page.keyboard.press('PageDown');
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-page','3');
  await page.goBack();
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-page','2');
});

test('reduced-motion and static modes never hide source content',async({page})=>{
  await page.goto('/about/#page-04');
  await expect(page.locator('.growth-card')).toHaveCount(6);
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-phase','3');
  await expect(page.locator('.growth-card').first()).toBeVisible();
  await page.goto('/about/#page-01');
  await expect(page.locator('.flow-step')).toHaveCount(5);
  await expect(page.locator('.home-morph-stage')).toHaveCount(0);
});

test('read full chapter, embedded React homepage and preserved subroutes',async({page})=>{
  await page.goto('/about/#page-05');
  await page.locator('.motion-read-btn').click();
  await expect(page.locator('.motion-panel')).toHaveClass(/is-reading/);
  await page.goto('/?view=about');
  await expect(page.locator('#presentation')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect.poll(()=>page.locator('#presentation').evaluate(el=>el.shadowRoot?.querySelectorAll('.motion-page-list button').length||0)).toBe(7);
  for(const [url,sel] of [['/study/','#deck .slide'],['/adult/','.stage .slide'],['/needs/','input[data-question]']]){
    await page.goto(url);
    await expect(page.locator(sel).first()).toBeAttached();
  }
});
