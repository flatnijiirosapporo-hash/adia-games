const assert=require('assert');
const {validateFixedBank,semanticKey}=require('../tools/question_bank_core');

const bank=[
  {id:'g-e-001',difficulty:'easy',prompt:'3より大きい数は？',answer:'4',choices:['2','3','4'],category:'数'},
  {id:'g-e-001',difficulty:'easy',prompt:'3 より 大きい 数は？',answer:'4',choices:['2','3','4'],category:'数'}
];
const r=validateFixedBank(bank,{minCount:2,requireChoices:true});
assert.deepStrictEqual(r.duplicateIds,['g-e-001']);
assert.strictEqual(r.semanticDuplicates.length,1);
assert.ok(r.errors.length>=2);
assert.strictEqual(semanticKey(bank[0]),semanticKey(bank[1]));

const invalid=[
  {id:'x1',difficulty:'normal',prompt:'',answer:'A',choices:['A','A'],category:'テスト'},
  {id:'x2',difficulty:'challenge',prompt:'Q',answer:'Z',choices:['A','B'],category:'テスト'}
];
const bad=validateFixedBank(invalid,{minCount:3,requireChoices:true});
assert.ok(bad.errors.some(x=>x.includes('minCount')));
assert.ok(bad.errors.some(x=>x.includes('empty prompt')));
assert.ok(bad.errors.some(x=>x.includes('duplicate choices')));
assert.ok(bad.errors.some(x=>x.includes('answer missing')));
console.log('PASS question bank core');

const visualA={id:'v1',difficulty:'easy',prompt:'この色の名前は？',answer:'あか',choices:['あか','あお'],stimulusKey:'hsl(0 70% 45%)'};
const visualB={id:'v2',difficulty:'easy',prompt:'この色の名前は？',answer:'あか',choices:['あか','あお'],stimulusKey:'hsl(2 75% 50%)'};
assert.notStrictEqual(semanticKey(visualA),semanticKey(visualB),'異なる表示刺激は別問題として扱う');
