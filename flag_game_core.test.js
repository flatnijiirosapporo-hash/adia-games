const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const sandbox={window:{}}; vm.createContext(sandbox);
for(const f of ['assets/flag_game_data/flags_master.js','assets/flag_game_core.js']) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const data=sandbox.window.NIJI_FLAG_MASTER, core=sandbox.window.NIJI_FLAG_CORE;
assert.strictEqual(core.poolForDifficulty(data,'easy').length,40);
assert.strictEqual(core.poolForDifficulty(data,'normal').length,100);
assert.strictEqual(core.poolForDifficulty(data,'challenge').length,201);
const nameQuiz=core.buildNameQuiz(data,'easy',10,()=>0.37); assert.strictEqual(nameQuiz.length,10);
for(const q of nameQuiz){ assert.strictEqual(q.options.length,4); assert.strictEqual(q.options.filter(x=>x.id===q.answerId).length,1); }
const h1=core.applyNameHint(nameQuiz[0],1),h2=core.applyNameHint(nameQuiz[0],2),h3=core.applyNameHint(nameQuiz[0],3);
assert.strictEqual(h1.type,'region'); assert.strictEqual(h2.type,'firstChar'); assert.strictEqual(h3.type,'reduce'); assert.strictEqual(h3.visibleOptionIds.length,2); assert.ok(h3.visibleOptionIds.includes(nameQuiz[0].answerId));
const pair=core.buildPairRound(data,'normal',()=>0.51); assert.strictEqual(pair.countries.length,6); assert.strictEqual(pair.cards.length,12); assert.strictEqual(new Set(pair.countries.map(x=>x.id)).size,6);
const compare=core.buildCompareQuiz(data,'challenge',10,()=>0.63); assert.strictEqual(compare.length,10); assert.ok(compare.some(q=>q.metric==='area')); assert.ok(compare.some(q=>q.metric==='population')); assert.ok(compare.every(q=>q.leftId!==q.rightId)); assert.ok(compare.every(q=>q.leftValue!==q.rightValue));
const map=core.buildMapQuiz(data,'challenge',10,()=>0.41); assert.strictEqual(map.length,10); assert.strictEqual(new Set(map.map(q=>q.answerId)).size,10);
const sortQuiz=core.buildSortQuiz(data,'normal',10,()=>0.29); assert.strictEqual(sortQuiz.length,10); assert.ok(sortQuiz.every(q=>q.correctIds.length>0)); assert.ok(sortQuiz.every(q=>q.correctIds.length<q.optionIds.length));
for(const q of sortQuiz){ assert.strictEqual(core.evaluateSort(q,q.correctIds),true); }
console.log('PASS flag game core');
