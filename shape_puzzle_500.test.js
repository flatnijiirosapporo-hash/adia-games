'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const core=require('../assets/shape_puzzle_core.js');
const pools={
 easy:require('../assets/shape_puzzle_data/puzzles_easy.js'),
 normal:require('../assets/shape_puzzle_data/puzzles_normal.js'),
 challenge:require('../assets/shape_puzzle_data/puzzles_challenge.js')
};
const expected={easy:200,normal:200,challenge:100};
const globalSigs=new Set(),ids=new Set();
function connected(cells){if(!cells.length)return false;const set=new Set(cells.map(core.cellKey)),seen=new Set([core.cellKey(cells[0])]),q=[cells[0]];while(q.length){const [x,y]=q.shift();for(const n of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=core.cellKey(n);if(set.has(k)&&!seen.has(k)){seen.add(k);q.push(n)}}}return seen.size===set.size}
function sig(p){const t=core.normalizeCells(p.targetCells).map(core.cellKey).join(';');const parts=p.pieces.map(x=>core.normalizeCells(x.cells).map(core.cellKey).join(':')).sort().join('|');return `${t}#${parts}`}
for(const [level,pool] of Object.entries(pools)){
 assert.strictEqual(pool.length,expected[level],`${level}: count`);
 pool.forEach((p,i)=>{
   assert.strictEqual(p.level,level,`${p.id}: level`);
   assert.strictEqual(p.difficultyIndex,i+1,`${p.id}: index`);
   assert.ok(!ids.has(p.id),`${p.id}: duplicate id`);ids.add(p.id);
   const target=new Set(p.targetCells.map(core.cellKey));assert.strictEqual(target.size,p.targetCells.length,`${p.id}: duplicate target`);
   const occupied=new Set();
   for(const piece of p.pieces)assert.ok(connected(piece.cells),`${p.id}:${piece.pieceId}: disconnected`);
   for(const sol of p.solutions){const piece=p.pieces.find(x=>x.pieceId===sol.pieceId);assert.ok(piece,`${p.id}: solution piece`);for(const cell of core.translateCells(core.rotateCells(piece.cells,sol.rotation),sol.position[0],sol.position[1])){const k=core.cellKey(cell);assert.ok(target.has(k),`${p.id}: solution outside`);assert.ok(!occupied.has(k),`${p.id}: overlap`);occupied.add(k)}}
   assert.strictEqual(occupied.size,target.size,`${p.id}: coverage`);
   const k=sig(p);assert.ok(!globalSigs.has(k),`${p.id}: semantic duplicate`);globalSigs.add(k);
 });
 const five=core.selectFive(pool,()=>0.25);assert.strictEqual(five.length,5,`${level}: selectFive`);assert.strictEqual(new Set(five.map(x=>x.id)).size,5,`${level}: selectFive unique`);
}
assert.strictEqual(ids.size,500,'total puzzle count');
const html=fs.readFileSync(path.join(__dirname,'../shape_puzzle.html'),'utf8');
assert.ok(html.includes('NIJI_QUESTION_BAG_RUNTIME'),'shape page must embed question bag runtime');
assert.ok(html.includes('shapePuzzlePersistentFive'),'shape app must use persistent five selection');
console.log('PASS shape puzzle 500:',ids.size);
