/** Ensure JS-generated study/adult content remains stored for future React migration. */
const fs=require('node:fs');
const vm=require('node:vm');
const cp=require('node:child_process');
function original(path){return cp.execFileSync('git',['show',`main:${path}`],{encoding:'utf8',maxBuffer:20*1024*1024});}
function scripts(source){return [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);}
let errors=0;
function check(label,expected,actual){const ok=JSON.stringify(expected)===JSON.stringify(actual);console.log((ok?'PASS ':'FAIL ')+label);if(!ok)errors++;}
const adult=original('adult/index.html');
const js=scripts(adult).find(s=>s.includes('let state='));
if(!js)throw new Error('Adult control script missing in main');
const prefix=js.slice(0,js.indexOf('let state='));
const content=vm.runInNewContext(prefix+';({NAMES,EN,MODE,KEYS})',Object.create(null),{timeout:3000});
const flow=js.match(/const FLOW=(\[.*?\]);/);
if(!flow)throw new Error('FLOW missing');
content.FLOW=vm.runInNewContext(flow[1],Object.create(null),{timeout:3000});
const rendered=JSON.parse(fs.readFileSync('src/data/adult-content.json','utf8'));
check('adult audience names + entire MODE data + FLOW',JSON.parse(JSON.stringify(content)),rendered);
const noteMatch=adult.match(/<script\b[^>]*id=["']speaker-notes["'][^>]*>([\s\S]*?)<\/script>/);
if(!noteMatch)throw new Error('speaker-notes missing');
const notes=JSON.parse(noteMatch[1]);
check('adult 11 speaker scripts',notes,JSON.parse(fs.readFileSync('src/content/adult-notes.json','utf8')));
const study=scripts(original('study/index.html')).find(s=>s.includes('const categories'));
if(!study)throw new Error('Student control script missing in main');
const cats=study.match(/const categories\s*=\s*(\[[^;]+\]);/);
if(!cats)throw new Error('Student page categories missing');
const studyCats=vm.runInNewContext(cats[1],Object.create(null),{timeout:3000});
check('study 10 page category labels',JSON.parse(JSON.stringify(studyCats)),JSON.parse(fs.readFileSync('src/data/study-categories.json','utf8')));
process.exit(errors?1:0);
