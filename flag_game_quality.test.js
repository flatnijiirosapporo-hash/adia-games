const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}};vm.createContext(sandbox);
for(const file of ['assets/flag_game_data/flags_master.js','assets/flag_game_core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
const data=sandbox.window.NIJI_FLAG_MASTER,core=sandbox.window.NIJI_FLAG_CORE;
assert.deepStrictEqual([...data.map(x=>x.difficultyRank)].sort((a,b)=>a-b),Array.from({length:201},(_,i)=>i+1));
const allowedColors=new Set(['black','blue','cyan','green','maroon','orange','red','white','yellow']);
for(const x of data){
  assert.strictEqual(x.flagSymbolId,`flag-${x.id}`,`${x.id}: flag symbol mismatch`);
  assert.strictEqual(x.mapId,x.id,`${x.id}: map id mismatch`);
  assert.ok(Number.isInteger(x.populationYear)&&x.populationYear>=2010&&x.populationYear<=2026,`${x.id}: unexpected reference year`);
  for(const c of x.colors)assert.ok(allowedColors.has(c),`${x.id}: unexpected color ${c}`);
}
function rngFor(seed){let x=seed>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
for(const level of ['easy','normal','challenge']){
  const pool=core.poolForDifficulty(data,level),poolIds=new Set(pool.map(x=>x.id));
  assert.strictEqual(pool.length,level==='easy'?40:level==='normal'?100:201);
  for(let seed=1;seed<=200;seed++){
    const name=core.buildNameQuiz(data,level,10,rngFor(seed));
    assert.strictEqual(name.length,10);for(const q of name){assert.strictEqual(q.options.length,4);assert.strictEqual(new Set(q.options.map(o=>o.id)).size,4);assert.ok(q.options.some(o=>o.id===q.answerId));assert.ok(poolIds.has(q.answerId));}
    const pair=core.buildPairRound(data,level,rngFor(seed+1000));
    assert.strictEqual(pair.countries.length,6);assert.strictEqual(pair.cards.length,12);assert.strictEqual(new Set(pair.cards.map(c=>c.cardId)).size,12);
    const compare=core.buildCompareQuiz(data,level,10,rngFor(seed+2000));
    assert.strictEqual(compare.length,10);assert.ok(compare.some(q=>q.metric==='area'));assert.ok(compare.some(q=>q.metric==='population'));for(const q of compare){assert.notStrictEqual(q.leftId,q.rightId);assert.notStrictEqual(q.leftValue,q.rightValue);assert.ok([q.leftId,q.rightId].includes(q.answerId));}
    const map=core.buildMapQuiz(data,level,10,rngFor(seed+3000));
    assert.strictEqual(map.length,10);assert.strictEqual(new Set(map.map(q=>q.answerId)).size,10);
    const sort=core.buildSortQuiz(data,level,10,rngFor(seed+4000));
    assert.strictEqual(sort.length,10);for(const q of sort){assert.ok(q.options.length>=2&&q.options.length<=8);assert.ok(q.correctIds.length>0&&q.correctIds.length<q.options.length);assert.strictEqual(core.evaluateSort(q,new Set(q.correctIds)),true);}
  }
}
console.log('PASS flag game randomized quality: 600 rounds per mode family');
