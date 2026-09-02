'use strict';
const assert=require('assert');
const path=require('path');
const corePath=path.join(__dirname,'../tools/tkk_generator_core.js');
let core;
try{core=require(corePath)}catch(err){console.error('RED: generator core missing');process.exit(1)}
const IDS=['make10','make10drop','multblock','primeblock','divisor','commondiv','commonmult','calcmaze','dayword','shopping','dagashi','moneycount','exchange'];
for(const id of IDS){
  const keys=core.listProblemKeys(id);
  assert.ok(Array.isArray(keys),`${id}: keys must be array`);
  const uniq=[...new Set(keys)];
  assert.ok(uniq.length>=500,`${id}: <500 unique keys (${uniq.length})`);
  for(const key of uniq.slice(0,500)){
    const p=core.makeProblem(id,key);
    assert.ok(p&&p.key===key,`${id}: bad problem key ${key}`);
    const errors=core.validateProblem(id,p);
    assert.deepStrictEqual(errors,[],`${id}:${key}: ${errors.join('; ')}`);
    if(Array.isArray(p.choices)) assert.strictEqual(new Set(p.choices.map(x=>JSON.stringify(x))).size,p.choices.length,`${id}:${key}: duplicate choices`);
  }
}
assert.strictEqual(core.isPrime(0),false);
assert.strictEqual(core.isPrime(1),false);
assert.strictEqual(core.isPrime(2),true);
assert.strictEqual(core.isPrime(59),true);
assert.strictEqual(core.isPrime(60),false);
console.log('PASS TKK generators >=500:',IDS.length);
