const assert=require('assert');
const fs=require('fs');
const src=fs.readFileSync('number_highlow.html','utf8');
for(const d of ['easy','normal','challenge']) assert.ok(src.includes(`data-difficulty="${d}"`),`missing difficulty button ${d}`);
const m=src.match(/\/\* HIGHLOW_CORE_START \*\/([\s\S]*?)\/\* HIGHLOW_CORE_END \*\//);
assert.ok(m,'missing highlow pure core markers');
const core=new Function(`${m[1]}; return {RANGES,buildRounds};`)();
assert.deepStrictEqual(core.RANGES.easy,[1,10]);
assert.deepStrictEqual(core.RANGES.normal,[1,50]);
assert.deepStrictEqual(core.RANGES.challenge,[1,100]);
let seed=123456789;
const random=()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
for(const [difficulty,[min,max]] of Object.entries(core.RANGES)){
  let sawMin=false,sawMax=false;
  for(let run=0;run<2000;run++){
    const rounds=core.buildRounds(difficulty,random);
    assert.strictEqual(rounds.length,10);
    rounds.forEach((r,i)=>{
      assert.ok(r.current>=min&&r.current<=max,`${difficulty} current out of range`);
      assert.ok(r.next>=min&&r.next<=max,`${difficulty} next out of range`);
      assert.notStrictEqual(r.current,r.next,`${difficulty} equal pair`);
      assert.ok(r.current!==min&&r.current!==max,`${difficulty} edge used as question base`);
      if(r.next===min) sawMin=true;
      if(r.next===max) sawMax=true;
      if(i>0){
        const prev=rounds[i-1];
        if(prev.next===min||prev.next===max) assert.notStrictEqual(r.current,prev.next,'edge must reset before next question');
        else assert.strictEqual(r.current,prev.next,'non-edge result must continue as next base');
      }
    });
  }
  assert.ok(sawMin,`${difficulty} never generated minimum`);
  assert.ok(sawMax,`${difficulty} never generated maximum`);
}
console.log('PASS number highlow difficulty ranges and edge reset');
