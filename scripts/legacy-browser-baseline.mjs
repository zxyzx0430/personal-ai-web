/** Legacy browser behavior/screenshot audit. Read-only; runs on local extracted main. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const base=process.env.AUDIT_BASE || 'http://127.0.0.1:4187';
const output=process.env.AUDIT_OUTPUT || '../legacy-screens';
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const results=[];
const check=(group,key,passed,detail='')=>{const item={group,key,status:passed?'PASS':'FAIL',detail};results.push(item);console.log(item.status,group,key,item.detail);};
async function pageAt(path,width=1440,height=900){
  const context=await browser.newContext({viewport:{width,height},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(3500);
  page.on('pageerror',e=>(results.push({group:path,key:'uncaught JS error',status:'ERROR',detail:String(e).slice(0,250)}),console.log('ERROR',path,String(e).slice(0,250))));
  await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForTimeout(450);
  return {page,context};
}
async function tryStep(group,key,callback){try{const detail=await callback();check(group,key,detail!==false,String(detail??'').slice(0,160))}catch(e){check(group,key,false,String(e).slice(0,190))}}
let {page,context}=await pageAt('/?view=about');
await tryStep('home','view=about',async()=>await page.locator('#presentation').getAttribute('src')==='./about/');
await tryStep('home','drawer open',async()=>{await page.locator('#openSwitch').evaluate(e=>e.click());return await page.locator('#switchDrawer').evaluate(e=>e.open)});
await tryStep('home','switch to study with URL',async()=>{await page.locator('[data-view="study"]').click();await page.waitForTimeout(350);return page.url().includes('view=study')&&(await page.locator('#presentation').getAttribute('src'))==='./study/'});
await tryStep('home','browser back restores about',async()=>{await page.goBack();await page.waitForTimeout(500);return (await page.locator('#presentation').getAttribute('src'))==='./about/'});
await context.close();
({page,context}=await pageAt('/about/'));
await tryStep('about','resource anchors',async()=>await page.locator('a[href*="resources/"]').count());
await tryStep('about','copy feedback',async()=>{const b=page.locator('button[data-copy]').first();await b.click();return (await b.innerText()).includes('已复制')});
await context.close();
({page,context}=await pageAt('/needs/'));
await tryStep('needs','number of questions',async()=>await page.locator('input[data-question]').count());
await tryStep('needs','checkbox summary',async()=>{await page.locator('input[data-question]').first().check();return (await page.locator('#chosen').innerText()).includes('1 项')});
await tryStep('needs','copy selected text feedback',async()=>{await page.locator('#copy-summary').click();return (await page.locator('#copy-summary').innerText()).includes('已复制')});
await tryStep('needs','clear selection',async()=>{await page.locator('#clear').click();return (await page.locator('input:checked').count())===0});
await context.close();
({page,context}=await pageAt('/study/#01'));
await tryStep('study','ten slide count',async()=>await page.locator('#deck > .slide').count()===10);
await tryStep('study','next page arrow control',async()=>{await page.locator('#next-page').click();return (await page.locator('#current-number').innerText())==='02'});
await tryStep('study','keyboard End navigation',async()=>{await page.keyboard.press('End');return (await page.locator('#current-number').innerText())==='10'});
await tryStep('study','keyboard Home navigation',async()=>{await page.keyboard.press('Home');return (await page.locator('#current-number').innerText())==='01'});
await tryStep('study','overview dialog',async()=>{await page.locator('#open-overview').click();const open=await page.locator('#overview').evaluate(e=>e.open);await page.locator('#close-overview').click();return open});
await tryStep('study','static mode toggle',async()=>{const initial=await page.locator('#motion-mode').getAttribute('aria-pressed');await page.locator('#motion-mode').click();return (await page.locator('#motion-mode').getAttribute('aria-pressed'))!==initial});
await tryStep('study','copy demo prompt',async()=>{await page.locator('#copy-prompt').click();return await page.locator('#toast').innerText()});
await tryStep('study','media chapters',async()=>await page.locator('[data-video-time]').count()===3);
await tryStep('study','deep link #07',async()=>{await page.goto(base+'/study/#07',{waitUntil:'domcontentloaded'});return (await page.locator('#current-number').innerText())==='07'});
await context.close();
({page,context}=await pageAt('/adult/#01'));
await tryStep('adult','eleven slide count',async()=>await page.locator('.stage .slide').count()===11);
await tryStep('adult','next control',async()=>{await page.locator('#next').click();return (await page.locator('#footer-counter').innerText()).includes('02')});
await tryStep('adult','keyboard ArrowRight',async()=>{await page.keyboard.press('ArrowRight');return (await page.locator('#footer-counter').innerText()).includes('03')});
await tryStep('adult','persona dialog 5 cards',async()=>{await page.locator('#persona-picker').click();const count=await page.locator('#personas .persona-card').count();await page.locator('#persona-dialog [data-close]').click();return count===5});
await tryStep('adult','speaker notes dynamic',async()=>{await page.locator('#notes-toggle').click();return (await page.locator('#notes-scroll').innerText()).length>50});
await tryStep('adult','auto switch',async()=>{const before=await page.locator('#auto-toggle').innerText();await page.locator('#auto-toggle').click();return (await page.locator('#auto-toggle').innerText())!==before});
await tryStep('adult','deep link #05',async()=>{await page.goto(base+'/adult/#05',{waitUntil:'domcontentloaded'});return (await page.locator('#footer-counter').innerText()).includes('05')});
await context.close();
for(const [w,h] of [[1440,900],[1024,768],[390,844],[360,800]]){
  for(const path of ['about/','needs/','study/','adult/']){
    const {page,context}=await pageAt('/'+path,w,h);
    const key=path.replace('/','');
    try{
      const metrics=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth,height:document.documentElement.scrollHeight,buttons:document.querySelectorAll('button').length,visibleText:document.body.innerText.length}));
      await page.screenshot({path:`${output}/legacy-${key}-${w}.png`,animations:'disabled',timeout:16000});
      check('layout',`${key}/${w}`,true,`scrollW:${metrics.width} vw:${metrics.viewport} text:${metrics.visibleText}`);
    }catch(e){check('layout',`${key}/${w}`,false,String(e))}
    await context.close();
  }
}
await browser.close();
fs.writeFileSync(`${output}/baseline-results.json`,JSON.stringify(results,null,2));
for(const result of results)console.log(`${result.status.padEnd(5)} ${result.group.padEnd(9)} ${result.key.padEnd(29)} ${result.detail}`);
console.log('TOTAL',results.length,'FAIL',results.filter(x=>x.status==='FAIL').length,'JS ERRORS',results.filter(x=>x.status==='ERROR').length);
