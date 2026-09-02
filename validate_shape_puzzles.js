'use strict';
const core=require('../assets/shape_puzzle_core.js');
const easy=require('../assets/shape_puzzle_data/puzzles_easy.js');
const normal=require('../assets/shape_puzzle_data/puzzles_normal.js');
const challenge=require('../assets/shape_puzzle_data/puzzles_challenge.js');
const pools={easy,normal,challenge},expected={easy:200,normal:200,challenge:100};
const cfg={easy:{pieces:[2,3],target:[6,11]},normal:{pieces:[3,4],target:[10,17]},challenge:{pieces:[4,6],target:[16,24]}};
function fail(m){throw new Error(m)}
function connected(cells){if(!cells.length)return false;const set=new Set(cells.map(core.cellKey)),seen=new Set([core.cellKey(cells[0])]),q=[cells[0]];while(q.length){const [x,y]=q.shift();for(const n of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=core.cellKey(n);if(set.has(k)&&!seen.has(k)){seen.add(k);q.push(n)}}}return seen.size===set.size}
function sig(p){const t=core.normalizeCells(p.targetCells).map(core.cellKey).join(';');const parts=p.pieces.map(x=>core.normalizeCells(x.cells).map(core.cellKey).join(':')).sort().join('|');return `${t}#${parts}`}
const globalSeen=new Set(),ids=new Set();let total=0;
for(const [level,pool] of Object.entries(pools)){
 if(pool.length!==expected[level])fail(`${level}: expected ${expected[level]}`);
 pool.forEach((p,i)=>{if(p.level!==level)fail(`${p.id}: level`);if(p.difficultyIndex!==i+1)fail(`${p.id}: difficultyIndex`);if(ids.has(p.id))fail(`${p.id}: duplicate id`);ids.add(p.id);const c=cfg[level];if(p.pieces.length<c.pieces[0]||p.pieces.length>c.pieces[1])fail(`${p.id}: piece count`);if(p.targetCells.length<c.target[0]||p.targetCells.length>c.target[1])fail(`${p.id}: target size`);const target=new Set(p.targetCells.map(core.cellKey));if(target.size!==p.targetCells.length)fail(`${p.id}: duplicate target cell`);for(const [x,y] of p.targetCells)if(x<0||y<0||x>=p.boardWidth||y>=p.boardHeight)fail(`${p.id}: target out of board`);const pieceIds=new Set();for(const piece of p.pieces){if(pieceIds.has(piece.pieceId))fail(`${p.id}: duplicate piece id`);pieceIds.add(piece.pieceId);if(piece.cells.length<2||!connected(piece.cells))fail(`${p.id}: disconnected/small piece ${piece.pieceId}`)}if(p.solutions.length!==p.pieces.length)fail(`${p.id}: solution count`);const occupied=new Set();for(const sol of p.solutions){const piece=p.pieces.find(x=>x.pieceId===sol.pieceId);if(!piece)fail(`${p.id}: missing piece`);for(const cell of core.translateCells(core.rotateCells(piece.cells,sol.rotation),sol.position[0],sol.position[1])){const k=core.cellKey(cell);if(!target.has(k))fail(`${p.id}: solution outside target`);if(occupied.has(k))fail(`${p.id}: solution overlap`);occupied.add(k)}}if(occupied.size!==target.size||[...target].some(k=>!occupied.has(k)))fail(`${p.id}: solution does not cover target`);const k=sig(p);if(globalSeen.has(k))fail(`${p.id}: duplicate signature`);globalSeen.add(k);const needed=level==='challenge'?2:level==='normal'?1:0;if(p.pieces.filter(x=>x.startRotation!==0).length<needed)fail(`${p.id}: insufficient rotation challenge`)});total+=pool.length;
}
if(total!==500)fail(`expected 500 total, got ${total}`);console.log('500 puzzles valid');
