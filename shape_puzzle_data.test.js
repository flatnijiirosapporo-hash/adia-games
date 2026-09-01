const assert=require('assert');
const easy=require('../assets/shape_puzzle_data/puzzles_easy.js');
const normal=require('../assets/shape_puzzle_data/puzzles_normal.js');
const challenge=require('../assets/shape_puzzle_data/puzzles_challenge.js');
const all=[...easy,...normal,...challenge];
assert.equal(all.length,300);
assert.equal(easy.length,100);assert.equal(normal.length,100);assert.equal(challenge.length,100);
assert.equal(new Set(all.map(p=>p.id)).size,300);
for(const [level,pool] of Object.entries({easy,normal,challenge})){
  assert.deepEqual(pool.map(p=>p.difficultyIndex),Array.from({length:100},(_,i)=>i+1));
  assert.ok(pool.every(p=>p.level===level));
}
console.log('PASS shape_puzzle_data');
