const assert=require('assert');
const {createQuestionBag}=require('../tools/question_bag_runtime');
const mem=new Map();
const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
let seed=0;
const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
const ids=Array.from({length:20},(_,i)=>`q${i+1}`);
const a=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v1',ids,random});
const first=a.draw(10);
const b=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v1',ids,random});
const second=b.draw(10);
assert.strictEqual(new Set([...first,...second]).size,20);
assert.strictEqual(b.remaining(),0);
const third=b.draw(5);
assert.strictEqual(third.length,5);
assert.strictEqual(new Set(third).size,5);

const c=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v2',ids:[...ids,'q21'],random});
const drawn=c.draw(1);
assert.strictEqual(drawn.length,1);
assert.ok([...ids,'q21'].includes(drawn[0]));

const d=createQuestionBag({storage,gameId:'demo',difficulty:'normal',bankVersion:'v1',ids,random});
const normal=d.draw(10);
assert.strictEqual(normal.length,10);
assert.notDeepStrictEqual(normal,first);
console.log('PASS question bag runtime');
