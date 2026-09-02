const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const htmlFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html'));
let checked=0;const missing=[];
for(const file of htmlFiles){
  const src=fs.readFileSync(path.join(root,file),'utf8');
  const re=/(?:src|href)=["']([^"']+)["']/gi;let m;
  while((m=re.exec(src))){
    let ref=m[1].trim();
    if(!ref||ref.includes('${')||ref.startsWith('#')||/^(?:https?:|data:|mailto:|tel:|javascript:|blob:)/i.test(ref))continue;
    ref=ref.split('#')[0].split('?')[0];if(!ref)continue;
    if(ref.startsWith('/'))continue;
    const dest=path.resolve(path.dirname(path.join(root,file)),ref);checked++;
    if(!fs.existsSync(dest))missing.push(`${file} -> ${m[1]}`);
  }
}
assert.deepStrictEqual(missing,[],`missing local refs:\n${missing.join('\n')}`);
console.log(`PASS local HTML refs: ${checked} checked, 0 missing`);
