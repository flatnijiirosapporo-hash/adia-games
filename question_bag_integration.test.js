'use strict';
const assert=require('assert'),path=require('path');
const {createQuestionBag}=require('../tools/question_bag_runtime.js');
const {FIXED_BANKS}=require('../tools/tkk_bank_export.js');
const {extractInlineBank}=require('../tools/extract_inline_bank.js');
const shape=[...require('../assets/shape_puzzle_data/puzzles_easy.js'),...require('../assets/shape_puzzle_data/puzzles_normal.js'),...require('../assets/shape_puzzle_data/puzzles_challenge.js')];
function memoryStorage(){const m=new Map();return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}}
function first500Unique(gameId,ids,difficulty='all'){const storage=memoryStorage(),bag=createQuestionBag({storage,gameId,difficulty,bankVersion:'q500-v1',ids,random:()=>0.314159});const draws=[];for(let i=0;i<50;i++)draws.push(...bag.draw(10));assert.strictEqual(draws.length,500,`${gameId}: draw count`);assert.strictEqual(new Set(draws).size,500,`${gameId}: repeated before first 500 exhausted`)}
const danger=extractInlineBank(path.join(__dirname,'../danger_game.html'),'danger');
const sst=extractInlineBank(path.join(__dirname,'../sst_quiz.html'),'sstQuiz');
first500Unique('danger',danger.map(x=>x.id));first500Unique('sstQuiz',sst.map(x=>x.id));first500Unique('colorquiz',FIXED_BANKS.colorquiz.map(x=>x.id));first500Unique('shapePuzzle',shape.map(x=>x.id));
// difficulty histories are independent
{
 const storage=memoryStorage(),ids=Array.from({length:500},(_,i)=>String(i+1));const a=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v1',ids,random:()=>0.1}),b=createQuestionBag({storage,gameId:'demo',difficulty:'normal',bankVersion:'v1',ids,random:()=>0.1});assert.deepStrictEqual(a.draw(5),b.draw(5),'separate difficulty bags should start independently with same deterministic shuffle');assert.notStrictEqual(a.key,b.key,'difficulty keys must differ');
}
// bank version reconciliation keeps valid history, admits new IDs, drops deleted IDs
{
 const storage=memoryStorage(),base=Array.from({length:20},(_,i)=>`q${i+1}`),bag1=createQuestionBag({storage,gameId:'versioned',difficulty:'all',bankVersion:'v1',ids:base,random:()=>0.2}),used=bag1.draw(5);const nextIds=[...base.filter(x=>x!=='q20'),'q21'],bag2=createQuestionBag({storage,gameId:'versioned',difficulty:'all',bankVersion:'v2',ids:nextIds,random:()=>0.2}),rest=bag2.draw(15);assert.ok(rest.includes('q21'),'new id not admitted');assert.ok(!rest.includes('q20'),'deleted id resurrected');assert.strictEqual(new Set([...used,...rest]).size,20,'reconciliation duplicated valid IDs');
}
console.log('PASS question bag integration');
