const assert = require('assert');
const core = require('../assets/shape_puzzle_core.js');

assert.deepEqual(core.normalizeCells(core.rotateCells([[0,0],[1,0],[0,1]],1)), [[0,0],[0,1],[1,1]]);
assert.deepEqual(core.translateCells([[0,0],[1,1]],2,3), [[2,3],[3,4]]);
const target = new Set(['0,0','1,0','0,1']);
assert.equal(core.isInsideTarget([[0,0],[1,0]],target), true);
assert.equal(core.isInsideTarget([[0,0],[2,0]],target), false);
const occupied = new Set(['1,1']);
assert.equal(core.hasOverlap([[0,0],[1,1]],occupied), true);
assert.equal(core.hasOverlap([[0,0]],occupied), false);

const puzzle={
 id:'p1',level:'easy',difficultyIndex:1,boardWidth:3,boardHeight:2,
 targetCells:[[0,0],[1,0],[0,1],[1,1]],
 pieces:[{pieceId:'a',cells:[[0,0],[1,0]]},{pieceId:'b',cells:[[0,0],[1,0]]}]
};
const placed={a:{x:0,y:0,rotation:0},b:{x:0,y:1,rotation:0}};
assert.equal(core.canPlace(puzzle.pieces[0],placed.a,puzzle,{}),true);
assert.equal(core.canPlace(puzzle.pieces[1],{x:0,y:0,rotation:0},puzzle,{a:placed.a}),false);
assert.equal(core.isSolved(puzzle,placed),true);
assert.equal(core.isSolved(puzzle,{a:placed.a}),false);

const pool=Array.from({length:100},(_,i)=>({id:`e${i+1}`,difficultyIndex:i+1}));
const five=core.selectFive(pool,()=>0.42);
assert.equal(five.length,5);
assert.equal(new Set(five.map(x=>x.id)).size,5);
assert.deepEqual(five.map(x=>Math.ceil(x.difficultyIndex/20)),[1,2,3,4,5]);

assert.deepEqual(core.pointToGrid(145,95,{left:100,top:50,cellSize:40}),[1,1]);
assert.equal(core.nextHintLevel(0),1); assert.equal(core.nextHintLevel(1),2); assert.equal(core.nextHintLevel(2),3); assert.equal(core.nextHintLevel(3),3);

const session=core.createSession('山田 太郎','easy',pool,()=>0.5);
assert.equal(session.childName,'山田 太郎'); assert.equal(session.puzzles.length,5);

const results=[
 {completed:true,durationMs:60000,moves:5,rotations:1,invalidPlacements:1,recoveredInvalidCount:1,hintUses:0,maxHintLevel:0},
 {completed:true,durationMs:80000,moves:7,rotations:2,invalidPlacements:1,recoveredInvalidCount:1,hintUses:1,maxHintLevel:1},
 {completed:true,durationMs:100000,moves:9,rotations:3,invalidPlacements:2,recoveredInvalidCount:1,hintUses:0,maxHintLevel:0},
 {completed:true,durationMs:90000,moves:8,rotations:1,invalidPlacements:0,recoveredInvalidCount:0,hintUses:0,maxHintLevel:0},
 {completed:false,durationMs:120000,moves:12,rotations:5,invalidPlacements:3,recoveredInvalidCount:2,hintUses:1,maxHintLevel:2}
];
const summary=core.summarizeResults(results);
assert.equal(summary.attempted,5); assert.equal(summary.completed,4); assert.equal(summary.averageCompletedMs,82500);
assert.equal(summary.totalMoves,41); assert.equal(summary.totalRotations,12); assert.equal(summary.totalInvalidPlacements,7); assert.equal(summary.totalRecoveredInvalid,5); assert.equal(summary.totalHintUses,2); assert.equal(summary.maxHintLevel,2);
const ratings=core.referenceRatings(summary);
assert.ok(['◎','○','△'].includes(ratings.seeThink));
assert.equal(ratings.tryRepair,'◎');
assert.equal(ratings.perseverance,'◎');

const noComplete=core.summarizeResults([{completed:false,durationMs:5000,moves:1,rotations:0,invalidPlacements:0,recoveredInvalidCount:0,hintUses:0,maxHintLevel:0}]);
assert.equal(noComplete.averageCompletedMs,null);
console.log('PASS shape_puzzle_core');
