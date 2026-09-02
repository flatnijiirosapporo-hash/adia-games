'use strict';
const assert=require('assert');
const {FIXED_BANKS,TARGET_IDS}=require('../tools/tkk_bank_export');
const {validateFixedBank}=require('../tools/question_bank_core');
const expected=['colorquiz','shapequiz','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','continents','prefecture','dicetalk','traffic','words','moraread','kanjipuzzle','bushu','palindrome','idiomsearch'];
assert.deepStrictEqual(TARGET_IDS,expected,'target IDs changed');
for(const id of expected){
  const bank=FIXED_BANKS[id];assert.ok(Array.isArray(bank),`${id}: bank missing`);assert.ok(bank.length>=500,`${id}: count ${bank.length}`);
  const objective=id!=='dicetalk';const r=validateFixedBank(bank,{minCount:500,requireChoices:objective});
  assert.deepStrictEqual(r.duplicateIds,[],`${id}: duplicate IDs`);assert.strictEqual(r.semanticDuplicates.length,0,`${id}: semantic duplicates`);assert.deepStrictEqual(r.errors,[],`${id}: ${r.errors.join('; ')}`);
  if(id==='dicetalk') assert.strictEqual(r.difficultyCounts.all,500,`${id}: all count`); else {assert.strictEqual(r.difficultyCounts.easy,200,`${id}: easy`);assert.strictEqual(r.difficultyCounts.normal,200,`${id}: normal`);assert.strictEqual(r.difficultyCounts.challenge,100,`${id}: challenge`);}
  if(['hiraarrange','kataarrange','hirasearch','katasearch','moraread'].includes(id)) assert.ok(bank.every(q=>q.payload&&q.payload.word),`${id}: word payload`);
  if(['idiomarrange','idiomsearch'].includes(id)) assert.ok(bank.every(q=>Array.from(q.payload?.word||'').length===4),`${id}: four-char payload`);
  if(id==='palindrome') assert.ok(bank.every(q=>typeof q.payload?.isPalindrome==='boolean'),`${id}: palindrome flag`);
}
console.log('PASS TKK fixed banks 500:',expected.length);
