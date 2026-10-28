import { test, expect } from '@playwright/test';

test('seven-page content and requested UI simplification',async({page})=>{
  await page.goto('/about/#page-01');
  await expect(page.locator('.motion-pagination,.motion-read-btn,.motion-tools,.home-morph-control')).toHaveCount(0);
  await expect(page.locator('.hero h1')).toHaveAttribute('data-text-animation','blur-in');
  await expect(page.locator('.hero-intro')).toHaveAttribute('data-text-animation','typewriter');
  await expect(page.locator('.flow-step')).toHaveCount(5);
  for(let i=2;i<=7;i++){
    await page.keyboard.press('PageDown');
    await expect(page.locator(`.motion-panel[data-page="${i}"]`)).toBeAttached();
  }
  await expect(page.locator('#contact .page-footer')).toHaveCount(1);
  await page.keyboard.press('Home');
  await page.keyboard.press('End');
  await expect(page.locator('.contact-panel')).toHaveCount(4);
  await page.goto('/about/#page-05');
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(6);
});

test('reduced motion is immediate, readable and long chapters can scroll',async({page})=>{
  await page.goto('/about/#page-04');
  await expect(page.locator('.motion-panel')).toHaveAttribute('data-phase','3');
  await expect(page.locator('.growth-card')).toHaveCount(6);
  await expect(page.locator('.growth-card').first()).toBeVisible();
  const heading=await page.locator('h2').first().evaluate(el=>getComputedStyle(el).opacity);
  expect(heading).toBe('1');
  await page.goto('/about/#page-06');
  const overflow=await page.locator('.motion-panel').evaluate(el=>getComputedStyle(el).overflowY);
  expect(overflow).toBe('auto');
});

test.describe('scroll and narrative animations',()=>{
  test.use({reducedMotion:'no-preference'});
  test('wait for page to arrive before revealing heading or cards',async({page})=>{
    await page.goto('/about/#page-01');
    // Wait for the React scene and keyboard handler to hydrate before sending synthetic keys.
    await expect(page.locator('.motion-panel[data-page="1"]')).toBeAttached();
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(120);
    const early=await page.locator('.motion-panel[data-page="2"]').evaluate(el=>({top:el.getBoundingClientRect().top,heading:Number(getComputedStyle(el.querySelector('h2')!).opacity),card:Number(getComputedStyle(el.querySelector('.problem')!).opacity),phase:el.getAttribute('data-phase')}));
    expect(early.top).toBeGreaterThan(90);
    expect(early.phase).toBe('0');
    expect(early.heading).toBeLessThan(.2);
    expect(early.card).toBeLessThan(.2);
    await expect(page.locator('.motion-panel')).toHaveCount(1,{timeout:2000});
    const top=await page.locator('.motion-panel').evaluate(el=>el.getBoundingClientRect().top);
    expect(top).toBeCloseTo(63,0);
    await expect.poll(()=>page.locator('.problem').first().evaluate(el=>Number(getComputedStyle(el).opacity)),{timeout:3600}).toBeGreaterThan(.95);
  });
  test('wheel advances one page and browser Back restores exact page',async({page})=>{
    await page.goto('/about/#page-01');
    await page.mouse.move(550,450);
    for(let i=0;i<6;i++){await page.mouse.wheel(0,70);await page.waitForTimeout(18)}
    await expect(page.locator('.motion-panel[data-page="2"]')).toBeAttached();
    await expect(page.locator('.motion-panel')).toHaveCount(1,{timeout:2000});
    await page.goBack();
    await expect(page.locator('.motion-panel[data-page="1"]')).toBeAttached();
  });
});

test('embedded React portal and study/adult/needs intact',async({page})=>{
  await page.goto('/?view=about');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect.poll(()=>page.locator('#presentation').evaluate(el=>!!el.shadowRoot?.querySelector('.hero h1[data-text-animation]'))).toBe(true);
  for(const [path,selector] of [['/study/','#deck .slide'],['/adult/','.stage .slide'],['/needs/','input[data-question]']]){
    await page.goto(path);
    await expect(page.locator(selector).first()).toBeAttached();
  }
});

test.describe('all card entry timings and resource-page boundary',()=>{
  test.use({reducedMotion:'no-preference'});
  test('cards and supplementary text reveal promptly only after full-page arrival',async({page})=>{
    test.setTimeout(60000);
    const chapters:[number,string][]=[[2,'.problem'],[3,'.method-card'],[4,'.growth-card'],[5,'.asset'],[6,'.asset'],[7,'.contact-panel']];
    for(const [target,selector] of chapters){
      await page.goto(`/about/#page-${String(target-1).padStart(2,'0')}`);
      await expect(page.locator(`.motion-panel[data-page="${target-1}"]`)).toBeAttached();
      await page.keyboard.press('PageDown');
      const incoming=page.locator(`.motion-panel[data-page="${target}"]`);
      await expect(incoming).toBeAttached();
      await expect.poll(()=>incoming.evaluate(el=>Math.abs(el.getBoundingClientRect().top-63)),{timeout:1800}).toBeLessThan(2);
      await expect.poll(()=>incoming.locator(selector).first().evaluate(el=>Number(getComputedStyle(el).opacity)),{timeout:2400}).toBeGreaterThan(.96);
    }
  });
  test('page 5 resources are scrollable and lead to exactly one page 6',async({page})=>{
    await page.goto('/about/#page-05');
    const panel=page.locator('.motion-panel[data-page="5"]');
    await panel.evaluate(el=>{el.scrollTop=el.scrollHeight});
    await page.mouse.move(500,400);
    await page.mouse.wheel(0,100);
    await expect(page.locator('.motion-panel[data-page="6"]')).toBeAttached();
    await expect(page.locator('.motion-panel')).toHaveCount(1,{timeout:2200});
    await expect(page.locator('.motion-panel[data-page="6"] .asset')).toHaveCount(2);
    const scrollTop=await page.locator('.motion-panel[data-page="6"]').evaluate(el=>el.scrollTop);
    expect(scrollTop).toBe(0);
  });
});
