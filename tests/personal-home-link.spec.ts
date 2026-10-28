import {test,expect} from '@playwright/test';

test('personal homepage looks like a regular nav link, but does not navigate while unfinished',async({page})=>{
 for(const route of ['/about/','/needs/']){
  await page.goto(route);
  const link=page.locator('a.personal-home-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveText('个人主页');
  await expect(link).toHaveAttribute('href','#personal-home');
  let alert='';page.once('dialog',dialog=>{alert=dialog.message();void dialog.accept()});
  await link.click();
  await expect.poll(()=>alert).toBe('在建设中，暂时无法进入');
  await expect(page).toHaveURL(new RegExp(route));
 }
});

test('React homepage portal keeps the personal-home placeholder consistent',async({page})=>{
 await page.goto('/?view=about');
 const link=page.locator('#presentation .personal-home-link');
 await expect(link).toBeVisible();
 await expect(link).toHaveText('个人主页');
 let alert='';page.once('dialog',dialog=>{alert=dialog.message();void dialog.accept()});
 await link.click();await expect.poll(()=>alert).toBe('在建设中，暂时无法进入');
});

test('mobile shows personal-home alongside other three links without overlapping brand',async({page})=>{
 await page.setViewportSize({width:360,height:740});
 await page.goto('/about/');
 const header=page.locator('header.site-top');
 const logo=await header.locator('.mark').boundingBox();
 const link=await header.locator('a.personal-home-link').boundingBox();
 expect(logo).not.toBeNull();expect(link).not.toBeNull();
 expect(link!.x).toBeGreaterThan(logo!.x+logo!.width);
 expect(link!.x+link!.width).toBeLessThanOrEqual(361);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(361);
 await expect(header.locator('.top-links a')).toHaveCount(4);
});
