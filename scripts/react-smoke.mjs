import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});page.setDefaultTimeout(3500);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/about/','/needs/','/adult/#01','/study/#01','/?view=about','/?view=study','/?view=adult']){
 try{await page.goto('http://127.0.0.1:4188'+route,{waitUntil:'domcontentloaded',timeout:10000});await page.waitForTimeout(200);const r=await page.evaluate(()=>({text:document.body.innerText.slice(0,130),total:document.body.innerText.length,root:document.getElementById('root')?.children.length,shadow:!!document.getElementById('presentation')?.shadowRoot,slides:document.querySelectorAll('.slide').length,buttons:document.querySelectorAll('button').length,hash:location.hash}));
 console.log('ROUTE',route,JSON.stringify(r));}
 catch(e){console.log('ERROR_ROUTE',route,String(e).slice(0,270));}
}
console.log('JS ERRORS',JSON.stringify(errors.slice(0,20)));await browser.close();
