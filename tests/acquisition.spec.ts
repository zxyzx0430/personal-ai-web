import {expect,test} from '@playwright/test';

test('four expandable real-problem interpretations with real video links',async({page})=>{
 await page.goto('/about/#page-02');
 await expect(page.locator('.acq-problem-toggle')).toHaveCount(4);
 await expect(page.locator('.acq-problem-detail')).toHaveCount(4);
 await expect(page.locator('.acq-problem-toggle[aria-expanded="true"]')).toHaveCount(4);
 await expect(page.locator('.acq-problem-detail').first()).toContainText('举个例子');
 await expect(page.locator('.acq-video-link')).toHaveCount(4);
 await page.locator('.acq-problem-toggle').first().click();
 await expect(page.locator('.acq-problem-detail')).toHaveCount(3,{timeout:2000});
 await expect(page.locator('.acq-problem-toggle[aria-expanded="true"]')).toHaveCount(3);
 await page.locator('.acq-problem-toggle').first().click();
 await expect(page.locator('.acq-problem-detail')).toHaveCount(4,{timeout:2000});
 await expect(page.locator('.acq-problem-detail').nth(1)).toContainText('二次函数');
});

test('interactive A/B example and original method guidance',async({page})=>{
 await page.goto('/about/#page-03');
 await expect(page.locator('.acq-case-tabs button')).toHaveCount(2);
 await page.locator('.acq-case-tabs button').nth(1).click();
 await expect(page.locator('.acq-case-body')).toContainText('切线');
 await expect(page.locator('.method-card')).toHaveCount(3);
});

test('six original growth supports retained and initial experience explained',async({page})=>{
 await page.goto('/about/#page-04');
 await expect(page.locator('.acq-experience-step')).toHaveCount(5);
 await expect(page.locator('.acq-growth-library > h3')).toHaveText('6 个成长方向');
 await expect(page.locator('.acq-growth-library > summary')).toHaveCount(0);
 await expect(page.locator('.growth-card')).toHaveCount(6);
 await expect(page.locator('.growth-card').first()).toBeVisible();
 await expect(page.locator('.acq-growth-library')).toContainText('兴趣与长期发展');
});

test('original complete project explanation and five learning-loop steps moved, not lost',async({page})=>{
 await page.goto('/about/#page-05');
 await expect(page.locator('.acq-original-intro')).toContainText('先看见需要');
 await expect(page.locator('.acq-learning-loop .flow-step')).toHaveCount(5);
 await expect(page.locator('.acq-proof')).toHaveCount(3);
});

test('all three free PDFs, original video and source links remain accessible',async({page,request})=>{
 await page.goto('/about/#page-06');
 await expect(page.locator('.asset')).toHaveCount(5);
 await expect(page.locator('a[href$=".pdf"]')).toHaveCount(6);
 await expect(page.locator('.sources a')).toHaveCount(4);
 for(const path of ['parent-needs-and-growth-guide-2026.pdf','personal-ai-study-introduction-2026.pdf','ai-parent-research-guide-2026.pdf']){
  const response=await request.get('/resources/'+path);
  expect(response.ok()).toBeTruthy();expect(response.headers()['content-type']).toContain('pdf');
 }
});

test('first message can start with one concrete learning issue',async({page})=>{
 await page.goto('/about/#page-07');
 await expect(page.locator('.acq-contact-prompt button[data-copy]')).toHaveCount(1);
 await expect(page.locator('.contact-panel')).toHaveCount(4);
 await expect(page.locator('.page-footer')).toContainText('2026');
});

test.describe('arrival and responsive safety',()=>{
 test.use({reducedMotion:'no-preference'});
 test('animated gliding retained between newly grouped sections',async({page})=>{
  await page.goto('/about/#page-01');
  await expect(page.locator('.motion-panel')).toHaveCount(1);
  await page.waitForTimeout(140);
  await page.keyboard.press('PageDown');
  await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
  await page.waitForTimeout(140);
  await expect(page.locator('.motion-panel')).toHaveCount(2);
  await expect(page.locator('.motion-panel')).toHaveCount(1,{timeout:1800});
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-page','2');
 });
 test('headline and support cards wait until the slide arrives',async({page})=>{
  await page.goto('/about/#page-01');
  await expect(page.locator('.motion-panel')).toHaveCount(1);
  await page.waitForTimeout(140);
  await page.keyboard.press('PageDown');await page.waitForTimeout(120);
  const early=await page.locator('.motion-panel[data-page="2"]').evaluate(el=>({phase:el.getAttribute('data-phase'),heading:Number(getComputedStyle(el.querySelector('h2')!).opacity),card:Number(getComputedStyle(el.querySelector('.problem')!).opacity)}));
  expect(early.phase).toBe('0');expect(early.heading).toBeLessThan(.2);expect(early.card).toBeLessThan(.2);
  await expect(page.locator('.motion-panel')).toHaveCount(1,{timeout:2000});
  await expect.poll(()=>page.locator('.problem').first().evaluate(el=>Number(getComputedStyle(el).opacity)),{timeout:4000}).toBeGreaterThan(.95);
 });
});
