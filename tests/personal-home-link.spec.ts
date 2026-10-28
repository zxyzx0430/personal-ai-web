import {test,expect} from '@playwright/test';

const personal='https://zxyzx.me/';

test('personal homepage link is clearly labeled as unfinished on the site and needs guide',async({page})=>{
  for(const route of ['/about/','/needs/']){
    await page.goto(route);
    const link=page.locator('a.personal-home-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href',personal);
    await expect(link).toHaveAttribute('target','_blank');
    await expect(link).toHaveAttribute('rel',/noopener/);
    await expect(link.locator('.personal-home-status')).toHaveText('建设中');
    await expect(link).toHaveAttribute('title',/部分内容尚未完善/);
  }
});

test('the homepage React portal keeps its upper-right personal link',async({page})=>{
  await page.goto('/?view=about');
  const link=page.locator('#presentation .personal-home-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href',personal);
  await expect(link).toContainText('建设中');
});

test('the mobile right-hand link does not overlap the project name',async({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto('/about/');
  const header=page.locator('header.site-top');
  const logo=await header.locator('.mark').boundingBox();
  const link=await header.locator('a.personal-home-link').boundingBox();
  expect(logo).not.toBeNull();expect(link).not.toBeNull();
  expect(link!.x).toBeGreaterThan(logo!.x+logo!.width);
  expect(link!.x+link!.width).toBeLessThanOrEqual(361);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
});
