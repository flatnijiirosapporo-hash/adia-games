'use strict';
const assert=require('assert');
const {FIXED_BANKS,IDIOMS}=require('../tools/tkk_bank_export');

for(const id of ['continents','prefecture','words','bushu']){
  const bad=FIXED_BANKS[id].filter(q=>/[（(](?:確認|地理|場面|見方)\s*\d+/.test(q.prompt));
  assert.strictEqual(bad.length,0,`${id}: 番号だけで問題を区別してはいけない`);
}
assert.ok(!IDIOMS.includes('有限実行'),'誤記「有限実行」を含めない');
assert.ok(IDIOMS.includes('有言実行'),'「有言実行」を保持する');
for(const q of FIXED_BANKS.palindrome){
  const text=q.payload.text;
  const actual=text===[...text].reverse().join('');
  assert.strictEqual(q.payload.isPalindrome,actual,`回文判定不一致: ${text}`);
  assert.strictEqual(q.answer,actual?'回文':'回文ではない',`回文の正解不一致: ${text}`);
}
console.log('PASS TKK fixed content quality');
