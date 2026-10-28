import {test,expect} from '@playwright/test';

test('home: in-page React presentation, mode switch, browser back and side drawer',async({page})=>{
 await page.goto('/?view=about');
 await expect(page.locator('iframe')).toHaveCount(0);
 const host=page.locator('#presentation');
 await expect(host.locator('.site-top')).toBeVisible();
 await page.locator('#openSwitch').evaluate((e:HTMLElement)=>e.click());
 await expect(page.locator('#switchDrawer')).toHaveJSProperty('open',true);
 await page.locator('[data-view="study"]').click();
 await expect(page).toHaveURL(/view=study/);
 await expect(host.locator('#deck > .slide')).toHaveCount(10);
 await expect(host.locator('#current-number')).toContainText('01');
 await page.locator('#openSwitch').evaluate((e:HTMLElement)=>e.click());
 await page.locator('[data-view="adult"]').click();
 await expect(host.locator('.stage .slide')).toHaveCount(11);
 await page.goBack({waitUntil:'domcontentloaded'});
 await expect(host.locator('#deck > .slide')).toHaveCount(10);
});

test('about: original resources and working copy feedback',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/about/#page-06');
 await expect(page.locator('a[href*="resources/"]')).toHaveCount(6);
 await page.goto('/about/#page-07');
 const button=page.locator('button[data-copy]').first();await button.click();
 await expect(button).toContainText('已复制');
 const pdf=await page.request.get('/resources/ai-parent-research-guide-2026.pdf');expect(pdf.ok()).toBeTruthy();
 expect((pdf.headers()['content-type']||'').toLowerCase()).toContain('pdf');
});

test('needs: 52 questions, count, clipboard, clear, and print button',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/needs/');
 await expect(page.locator('input[data-question]')).toHaveCount(52);
 await page.locator('input[data-question]').first().check();
 await page.locator('input[data-question]').nth(10).check();
 await expect(page.locator('#chosen')).toContainText('2 项');
 await page.locator('#copy-summary').click();await expect(page.locator('#copy-summary')).toContainText('已复制');
 const clipboard=await page.evaluate(()=>navigator.clipboard.readText());expect(clipboard).toContain('【学科学习与学习方法】');
 await page.locator('#clear').click();await expect(page.locator('input[data-question]:checked')).toHaveCount(0);
 await expect(page.locator('#chosen')).toContainText('尚未选择');
 await expect(page.getByRole('button',{name:/打印/})).toBeVisible();
});

test('adult: eleven slides, notes, persona state, interactive steps, deep link',async({page})=>{
 await page.goto('/adult/#01');
 await expect(page.locator('.stage .slide')).toHaveCount(11);
 await expect(page.locator('#persona-picker')).toContainText('职场办公');
 await page.locator('#next').click();await expect(page.locator('#footer-counter')).toContainText('02 / 11');
 await page.locator('#notes-toggle').click();await expect(page.locator('#notes-panel')).toHaveClass(/open/);
 expect((await page.locator('#notes-scroll').innerText()).length).toBeGreaterThan(50);
 await page.locator('#persona-picker').click();await expect(page.locator('#personas .persona-card')).toHaveCount(5);
 await page.locator('#personas .persona-card').nth(2).click();await expect(page.locator('#persona-picker')).toContainText('经营商业');
 await page.goto('/adult/#03');await expect(page.locator('#process-band [data-process]')).toHaveCount(5);
 const before=await page.locator('#process-detail').innerText();await page.locator('[data-process="1"]').click();expect(await page.locator('#process-detail').innerText()).not.toBe(before);
 await page.locator('#auto-toggle').click();await expect(page.locator('#auto-toggle')).toContainText('ON');
 await page.locator('#close-notes').click();await page.goto('/adult/#11');await page.locator('#copy-problem').click();await expect(page.locator('#copy-status')).toContainText('先填写');
 await page.locator('#my-problem').fill('希望整理客户跟进记录');await page.locator('#copy-problem').click();await expect(page.locator('#copy-status')).toContainText('已复制');
});

test('adult dynamic: idea, case, delivery, repeat and note shortcut',async({page})=>{
 await page.goto('/adult/#04');await page.locator('[data-repeat="2"]').click();await expect(page.locator('#repeat-lane .done')).toHaveCount(3);
 await page.goto('/adult/#06');await page.locator('[data-idea="1"]').click();await expect(page.locator('#idea-window-status')).toContainText('02 /');
 await page.goto('/adult/#08');await page.locator('[data-case="2"]').click();await expect(page.locator('[data-case="2"]')).toHaveClass(/active/);
 await page.goto('/adult/#10');await page.locator('[data-delivery="2"]').click();await expect(page.locator('[data-delivery="2"]')).toHaveClass(/active/);
 await page.goto('/adult/#01');await page.keyboard.press('n');await expect(page.locator('#notes-panel')).toHaveClass(/open/);
 await page.keyboard.press('Escape');await expect(page.locator('#notes-panel')).not.toHaveClass(/open/);
});

test('study: ten slides, keyboard, overview, static/replay, media chapters, hashes',async({page})=>{
 await page.goto('/study/#01');await expect(page.locator('#deck > .slide')).toHaveCount(10);
 await page.locator('#next-page').click();await expect(page.locator('#current-number')).toHaveText('02');
 await page.keyboard.press('End');await expect(page.locator('#current-number')).toHaveText('10');
 await page.keyboard.press('Home');await expect(page.locator('#current-number')).toHaveText('01');
 await page.locator('#open-overview').click();await expect(page.locator('#overview')).toHaveJSProperty('open',true);
 await expect(page.locator('#overview-grid button')).toHaveCount(10);
 await page.locator('#overview-grid button').nth(6).click();await expect(page.locator('#current-number')).toHaveText('07');
 const old=await page.locator('#motion-mode').getAttribute('aria-pressed');await page.locator('#motion-mode').click();expect(await page.locator('#motion-mode').getAttribute('aria-pressed')).not.toBe(old);
 await page.goto('/study/#04');await expect(page.locator('[data-video-time]')).toHaveCount(3);
 await expect(page.locator('#learning-demo')).toHaveAttribute('controls',/.*/);
 await page.goto('/study/#08');await expect(page.locator('#current-number')).toHaveText('08');
});

test('study: copy prompt, page navigation and no broken HTML iframe',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/study/#04');
 await page.locator('#copy-prompt').click();await expect(page.locator('#toast')).toContainText('已复制');
 expect((await page.evaluate(()=>navigator.clipboard.readText())).length).toBeGreaterThan(50);
 await page.locator('#page-nav button').nth(8).click();await expect(page.locator('#current-number')).toHaveText('09');
 await expect(page.locator('iframe')).toHaveCount(0);
});

test('responsive layouts: all five routes at 360/390/1024/1440',async({page})=>{
 test.setTimeout(150000);
 for(const width of [360,390,1024,1440]){
  await page.setViewportSize({width,height:width<=390?800:900});
  for(const path of ['/about/','/needs/','/adult/#03','/study/#04','/?view=about']){
   await page.goto(path);
   await expect(page.locator('#root')).not.toBeEmpty();
   if(width===390 || width===1440){const key=path.replace(/[^a-z0-9]+/gi,'_');await page.screenshot({path:`test-results/${key}-${width}.png`,animations:'disabled',timeout:10000})}
  }
 }
});
