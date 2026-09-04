const assert=require('assert'),fs=require('fs');
const index=fs.readFileSync('index.html','utf8');
const catalog=fs.readFileSync('assets/game_catalog.js','utf8');
for(const text of [index,catalog]){
  assert(text.includes('train_driver.html?v=20260904-trainfix1'),'new train cache version missing');
  assert(!text.includes('train_driver.html?v=20260904-train1'),'old train cache version remains');
}
console.log('train_cache_fix: PASS');
