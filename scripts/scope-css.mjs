import fs from 'node:fs';
import postcss from 'postcss';
for(const name of ['study','adult','about']){
  const path=`src/styles/${name}.css`;
  const root=postcss.parse(fs.readFileSync(path,'utf8'));
  root.walkRules(rule=>{
    rule.selector=rule.selector
      .replace(/:root\b/g,':host')
      .replace(/(^|[\s,>+~])(?:html|body)(?=$|[\s,:.\[>+~])/g,'$1:host');
  });
  fs.writeFileSync(`src/styles/embedded/${name}.css.txt`,`:host{display:block;position:fixed;inset:0;width:100%;height:100%;overflow:auto;box-sizing:border-box}\n${root.toString()}`);
  console.log(name,'scoped CSS bytes',root.toString().length);
}
