'use strict';
const assert=require('assert');
const path=require('path');
const {extractInlineBank}=require('../tools/extract_inline_bank');
const {validateFixedBank}=require('../tools/question_bank_core');
const root=path.resolve(__dirname,'..');
const targets=[
 ['danger_game.html','danger',true,true],
 ['cognitive_check_10min.html','cognitive',true,false],
 ['sst_quiz.html','sstQuiz',true,true],
 ['sst_roleplay.html','sstRoleplay',false,false],
 ['sst_skills.html','help',true,true],['sst_skills.html','refuse',true,true],['sst_skills.html','feel',true,true],
 ['sst_skills.html','listen',true,true],['sst_skills.html','repair',true,true],['sst_skills.html','perspective',true,true],
 ['feeling_choice.html','feelingChoice',true,true],
 ['turn_waiting.html','turnWaiting',true,true],
 ['trouble_response.html','troubleResponse',true,true]
];
const cats=['school','nijifla','home','park','transport','public','friends','group','study','rules','emotion','help'];
const only=process.env.PHASE2_TARGET||'';
let checked=0;
for(const [file,marker,objective,balance] of targets){
  if(only && marker!==only) continue;
  const bank=extractInlineBank(path.join(root,file),marker);
  assert.ok(bank.length>=500,`${marker}: count ${bank.length}`);
  const r=validateFixedBank(bank,{minCount:500,requireChoices:objective});
  assert.deepStrictEqual(r.duplicateIds,[],`${marker}: duplicate IDs`);
  assert.strictEqual(r.semanticDuplicates.length,0,`${marker}: semantic duplicates`);
  assert.deepStrictEqual(r.errors,[],`${marker}: ${r.errors.join('; ')}`);
  if(marker==='sstRoleplay'){
    assert.strictEqual(r.difficultyCounts.all,500,`${marker}: all difficulty count`);
  }else{
    assert.strictEqual(r.difficultyCounts.easy,200,`${marker}: easy count`);
    assert.strictEqual(r.difficultyCounts.normal,200,`${marker}: normal count`);
    assert.strictEqual(r.difficultyCounts.challenge,100,`${marker}: challenge count`);
  }
  if(balance){
    for(const c of cats) assert.ok((r.categoryCounts[c]||0)>0,`${marker}: missing category ${c}`);
    const max=Math.ceil(bank.length*.20);
    for(const [c,n] of Object.entries(r.categoryCounts)) assert.ok(n<=max,`${marker}: category ${c} too large ${n}`);
  }
  checked++;
}
assert.ok(checked>0,'no targets checked');
console.log(`PASS SST/safety 500 quality: ${checked} banks`);
