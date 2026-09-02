'use strict';
const assert=require('assert');
const fs=require('fs');
const os=require('os');
const path=require('path');
const cp=require('child_process');
const vm=require('vm');
const out=path.join(os.tmpdir(),'nijifla-tkk-selfcontained-test.html');
try{fs.unlinkSync(out)}catch{}
cp.execFileSync(process.execPath,[path.join(__dirname,'../tools/build_tkk_selfcontained.js'),'--output',out],{stdio:'pipe'});
const html=fs.readFileSync(out,'utf8');
for(const ref of ['assets/tkk_games.js','assets/game_catalog.js','assets/game_profile_v24.js','assets/result_store.js']){
  assert.ok(!html.includes(`<script src="${ref}"></script>`),`external dependency remains: ${ref}`);
}
const ids=['colorquiz','shapequiz','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','continents','prefecture','dicetalk','traffic','words','moraread','kanjipuzzle','bushu','palindrome','idiomsearch'];
for(const id of ids) assert.ok(html.includes(`NIJI_BANK:${id}:START`),`${id}: inline bank marker missing`);
assert.ok(html.includes('NIJI_QUESTION_BAG_RUNTIME'),'question bag runtime must be inline');
assert.ok(html.includes('INLINE:tkk_generator_core.js:START'),'generator core must be inline');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(x=>x.trim());
assert.ok(scripts.length>=5,'expected inline scripts');
for(let i=0;i<scripts.length;i++) new vm.Script(scripts[i],{filename:`inline-${i}.js`});
console.log('PASS TKK self-contained build');
