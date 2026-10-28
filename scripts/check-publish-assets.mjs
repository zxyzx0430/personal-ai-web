import {existsSync,readFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist');
const assets=resolve(root,'assets');
assert(existsSync(root+'/index.html'),'missing dist/index.html');
assert(existsSync(root+'/.nojekyll'),'missing dist/.nojekyll');
assert(existsSync(assets),'missing assets: blank screen risk');
const routes=['index.html','about/index.html','needs/index.html','study/index.html','adult/index.html'];
let linked=0;
for(const route of routes){
 const html=readFileSync(resolve(root,route),'utf8');
 assert(html.includes('id="root"'),`Missing root div in ${route}`);
 assert(!html.includes('/src/entries/'),`Uncompiled HTML found in ${route}`);
 const matches=[...html.matchAll(/(?:src|href)="(\.{1,2}\/assets\/[^\"]+)"/g)];
 assert(matches.length>=2,`Missing relative assets in ${route}`);
 for(const [,url] of matches){
   const target=resolve(dirname(resolve(root,route)),url.split('?')[0]);
   assert(target.startsWith(root+sep)&&existsSync(target),`Broken asset ${route}: ${url}`);
   linked++;
 }
}
for(const file of ['media/study-embedded-1.jpg','media/study-embedded-2.mp4',
 'resources/ai-parent-research-guide-2026.pdf','resources/parent-needs-and-growth-guide-2026.pdf',
 'resources/personal-ai-study-introduction-2026.pdf']){
 const target=resolve(root,file);
 assert(existsSync(target)&&statSync(target).size>10000,`Missing media or PDF: ${file}`);
}
assert(readdirSync(assets).length>10,'Not enough assets');
console.log(`Publish artifact verified: ${routes.length} routes, ${linked} relative asset links, 3 PDFs and 2 media files`);
