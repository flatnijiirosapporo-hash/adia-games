const core=require('../assets/shape_puzzle_core.js');
const easy=require('../assets/shape_puzzle_data/puzzles_easy.js');
const normal=require('../assets/shape_puzzle_data/puzzles_normal.js');
const challenge=require('../assets/shape_puzzle_data/puzzles_challenge.js');
const pools={easy,normal,challenge};
const cfg={easy:{pieces:[2,3],target:[6,10]},normal:{pieces:[3,4],target:[10,16]},challenge:{pieces:[4,6],target:[16,24]}};
function fail(m){throw new Error(m)}
function connected(cells){if(!cells.length)return false;const set=new Set(cells.map(core.cellKey)),seen=new Set([core.cellKey(cells[0])]),q=[cells[0]];while(q.length){const [x,y]=q.shift();for(const n of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=core.cellKey(n);if(set.has(k)&&!seen.has(k)){seen.add(k);q.push(n)}}}return seen.size===set.size}
function sig(p){const t=core.normalizeCells(p.targetCells).map(core.cellKey).join(';');const parts=p.pieces.map(x=>core.normalizeCells(x.cells).map(core.cellKey).join(':')).sort().join('|');return `${t}#${parts}`}
let all=[];
for(const [level,pool] of Object.entries(pools)){
 if(pool.length!==100)fail(`${level}: expected 100`);const seen=new Set();
 pool.forEach((p,i)=>{
   if(p.level!==level)fail(`${p.id}: level`);if(p.difficultyIndex!==i+1)fail(`${p.id}: difficultyIndex`);if(!p.id.match(new RegExp(`^${level}-\\d{3}$`)))fail(`${p.id}: id`);
   const c=cfg[level];if(p.pieces.length<c.pieces[0]||p.pieces.length>c.pieces[1])fail(`${p.id}: piece count`);if(p.targetCells.length<c.target[0]||p.targetCells.length>c.target[1])fail(`${p.id}: target size`);
   const target=new Set(p.targetCells.map(core.cellKey));if(target.size!==p.targetCells.length)fail(`${p.id}: duplicate target cell`);
   for(const [x,y] of p.targetCells)if(x<0||y<0||x>=p.boardWidth||y>=p.boardHeight)fail(`${p.id}: target out of board`);
   const ids=new Set();for(const piece of p.pieces){if(ids.has(piece.pieceId))fail(`${p.id}: duplicate piece id`);ids.add(piece.pieceId);if(piece.cells.length<2||!connected(piece.cells))fail(`${p.id}: disconnected/small piece ${piece.pieceId}`)}
   if(p.solutions.length!==p.pieces.length)fail(`${p.id}: solution count`);const solutionIds=new Set(),occupied=new Set();
   for(const sol of p.solutions){if(solutionIds.has(sol.pieceId))fail(`${p.id}: duplicate solution`);solutionIds.add(sol.pieceId);const piece=p.pieces.find(x=>x.pieceId===sol.pieceId);if(!piece)fail(`${p.id}: missing piece`);const cells=core.translateCells(core.rotateCells(piece.cells,sol.rotation),sol.position[0],sol.position[1]);for(const cell of cells){const k=core.cellKey(cell);if(!target.has(k))fail(`${p.id}: solution outside target`);if(occupied.has(k))fail(`${p.id}: solution overlap`);occupied.add(k)}}
   if(occupied.size!==target.size||[...target].some(k=>!occupied.has(k)))fail(`${p.id}: solution does not cover target`);
   const s=sig(p);if(seen.has(s))fail(`${p.id}: duplicate signature`);seen.add(s);
   const needed=level==='challenge'?2:level==='normal'?1:0;if(p.pieces.filter(x=>x.startRotation!==0).length<needed)fail(`${p.id}: insufficient rotation challenge`);
 });all.push(...pool)
}
if(all.length!==300)fail('expected 300 total');if(new Set(all.map(p=>p.id)).size!==300)fail('duplicate id');console.log('300 puzzles valid');
