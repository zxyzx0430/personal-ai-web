import { test, expect } from '@playwright/test';

// The V2 acquisition layer must not change the original seven-page animation timeline.
test('homepage stays intact and adds only a service description and a problems entry',async({page})=>{
  await page.goto('/about/#page-01');
  await expect(page.locator('.hero h1')).toContainText('先看见');
  await expect(page.locator('.hero-visual .flow-step')).toHaveCount(5);
  await expect(page.locator('.v2-hero-addendum')).toContainText('学习诊断');
  await page.locator('.v2-hero-addendum a').click();
  await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
});

test('the four problems each open a working React detail and support browser URLs',async({page})=>{
  await page.goto('/about/#page-02');
  await expect(page.locator('.v2-card-hit')).toHaveCount(4);
  for(let i=1;i<=4;i++){
    await page.locator('.v2-card-hit').nth(i-1).click();
    await expect(page.locator(`.v2-dialog[data-problem="${i}"]`)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`problem=${i}`));
    await expect(page.locator('.v2-dialog-steps>div')).toHaveCount(3);
    await page.locator('.v2-close').click();
    await expect(page.locator('.v2-dialog')).toHaveCount(0);
  }
});

test('quadratic graph and A/B comparisons are actually interactive',async({page})=>{
  await page.goto('/about/?problem=1#page-02');
  await page.locator('[data-demo="ab"] button').filter({hasText:'学生 B'}).click();
  await expect(page.locator('[data-demo="ab"] button[aria-pressed="true"]')).toContainText('学生 B');
  await expect(page.locator('[data-demo="ab"]')).toContainText('能够解出');
  await page.locator('.v2-dialog-actions').getByRole('button',{name:'下一个困境'}).click();
  await expect(page.locator('.v2-dialog[data-problem="2"]')).toBeVisible();
  const graph=page.locator('svg.v2-plot path[stroke="#0035ba"]');
  const before=await graph.getAttribute('d');
  await page.locator('#v2-parameter-a').fill('-1.6');
  const after=await graph.getAttribute('d');
  expect(after).not.toBe(before);
  await expect(page.locator('.v2-plot')).toHaveAttribute('aria-label',/开口向下/);
});

test('needs-based CTA reaches concrete services and existing contact details',async({page})=>{
  await page.goto('/about/?problem=4#page-02');
  await page.locator('.v2-dialog-actions .v2-cta').click();
  await expect(page.locator('.motion-panel[data-page="7"]')).toBeAttached();
  await expect(page.locator('.v2-services li')).toHaveCount(5);
  await expect(page.locator('.v2-service-copy')).toContainText('咨询信息模板');
  await expect(page.locator('.contact-panel')).toHaveCount(4);
});

test('case, PDF and research modules remain available',async({page})=>{
  await page.goto('/about/#page-03');
  await expect(page.locator('.method-card')).toHaveCount(3);
  await expect(page.locator('.v2-inline-case')).toBeVisible();
  await page.goto('/about/#page-04');
  await expect(page.locator('.growth-card')).toHaveCount(6);
  await page.goto('/about/#page-05');
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(6);
  await page.goto('/about/#page-06');
  await expect(page.locator('.asset')).toHaveCount(2);
  await expect(page.locator('.v2-video-entry')).toBeVisible();
});

test('mobile problem detail uses full viewport and can be dismissed',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/about/?problem=2#page-02');
  const box=await page.locator('.v2-dialog').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(388);
  await page.keyboard.press('Escape');
  await expect(page.locator('.v2-dialog')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
});

test('same functionality appears in the homepage ShadowRoot portal',async({page})=>{
  await page.goto('/?view=about');
  await page.locator('.v2-hero-addendum a').click();
  await page.locator('.v2-card-hit').first().click();
  await expect(page.locator('.v2-dialog')).toBeVisible();
});
