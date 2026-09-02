'use strict';
const assert=require('assert');
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'../assets/tkk_games.js'),'utf8');
assert.ok(src.includes('function generatedDeck('),'generatedDeck helper missing');
const ids=['make10','make10drop','multblock','primeblock','divisor','commondiv','commonmult','calcmaze','dayword','shopping','dagashi','moneycount','exchange'];
for(const id of ids){
  const re=new RegExp(`generatedDeck\\(['\"]${id}['\"]`);
  assert.ok(re.test(src),`${id}: generated deck not used at runtime`);
}
console.log('PASS TKK generator runtime usage:',ids.length);
