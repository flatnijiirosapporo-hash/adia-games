(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.NIJI_SHAPE_CORE=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const SHAPE_EVAL_RULES={
    seeThink:{goodCompletionRate:0.8,goodInvalidRatio:0.25,goodMaxHint:1,okCompletionRate:0.6,okMaxHint:2},
    shapeGrasp:{goodCompletionRate:0.8,goodMaxHint:1,okCompletionRate:0.6,okMaxHint:2},
    perseverance:{goodAttempted:5,okAttempted:3}
  };
  function cellKey(cell){return `${cell[0]},${cell[1]}`}
  function normalizeCells(cells){
    if(!cells.length)return[];
    const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));
    return cells.map(([x,y])=>[x-minX,y-minY]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
  }
  function rotateCells(cells,quarterTurns=0){
    let out=cells.map(([x,y])=>[x,y]);
    const turns=((quarterTurns%4)+4)%4;
    for(let t=0;t<turns;t++)out=out.map(([x,y])=>[y,-x]);
    return normalizeCells(out);
  }
  function translateCells(cells,x,y){return cells.map(([cx,cy])=>[cx+x,cy+y])}
  function isInsideTarget(cells,targetSet){return cells.every(c=>targetSet.has(cellKey(c)))}
  function hasOverlap(cells,occupiedSet){return cells.some(c=>occupiedSet.has(cellKey(c)))}
  function cellsForPlacement(piece,placement){return translateCells(rotateCells(piece.cells,placement.rotation||0),placement.x||0,placement.y||0)}
  function placedCells(puzzle,placed,exceptId){
    const out=[];
    for(const piece of puzzle.pieces){
      if(piece.pieceId===exceptId)continue;
      const pl=placed[piece.pieceId]; if(!pl)continue;
      out.push(...cellsForPlacement(piece,pl));
    }
    return out;
  }
  function canPlace(piece,placement,puzzle,placed={}){
    if(!piece||!placement||!puzzle)return false;
    const cells=cellsForPlacement(piece,placement);
    const targetSet=new Set(puzzle.targetCells.map(cellKey));
    if(!isInsideTarget(cells,targetSet))return false;
    const occupied=new Set(placedCells(puzzle,placed,piece.pieceId).map(cellKey));
    return !hasOverlap(cells,occupied);
  }
  function isSolved(puzzle,placed={}){
    if(!puzzle||puzzle.pieces.some(p=>!placed[p.pieceId]))return false;
    const keys=placedCells(puzzle,placed).map(cellKey);
    const targetKeys=puzzle.targetCells.map(cellKey);
    if(keys.length!==targetKeys.length)return false;
    const set=new Set(keys); if(set.size!==keys.length)return false;
    return targetKeys.every(k=>set.has(k));
  }
  function selectFive(pool,rng=Math.random){
    const sorted=[...pool].sort((a,b)=>a.difficultyIndex-b.difficultyIndex);
    return [0,1,2,3,4].map(band=>{
      const bandItems=sorted.filter(p=>p.difficultyIndex>band*20&&p.difficultyIndex<=(band+1)*20);
      if(!bandItems.length)throw new Error(`missing difficulty band ${band+1}`);
      const raw=Number(rng()); const r=Number.isFinite(raw)?Math.min(Math.max(raw,0),0.999999999):0;
      return bandItems[Math.floor(r*bandItems.length)];
    });
  }
  function createSession(childName,difficulty,pool,rng=Math.random){
    const name=String(childName||'').trim();
    if(!name)throw new Error('name required');
    return {childName:name,difficulty,puzzles:selectFive(pool,rng),currentIndex:0,results:[],finalRatings:null,comment:''};
  }
  function pointToGrid(clientX,clientY,boardRect){
    return [Math.floor((clientX-boardRect.left)/boardRect.cellSize),Math.floor((clientY-boardRect.top)/boardRect.cellSize)];
  }
  function nextHintLevel(currentLevel){return Math.min(3,Math.max(0,Number(currentLevel)||0)+1)}
  function summarizeResults(results=[]){
    const completed=results.filter(r=>r.completed);
    const sum=k=>results.reduce((n,r)=>n+(Number(r[k])||0),0);
    return {
      attempted:results.length,
      completed:completed.length,
      averageCompletedMs:completed.length?Math.round(completed.reduce((n,r)=>n+(Number(r.durationMs)||0),0)/completed.length):null,
      totalMoves:sum('moves'),
      totalRotations:sum('rotations'),
      totalInvalidPlacements:sum('invalidPlacements'),
      totalRecoveredInvalid:sum('recoveredInvalidCount'),
      totalHintUses:sum('hintUses'),
      maxHintLevel:results.reduce((m,r)=>Math.max(m,Number(r.maxHintLevel)||0),0)
    };
  }
  function referenceRatings(summary){
    const attempted=Math.max(1,summary.attempted||0);
    const completionRate=(summary.completed||0)/attempted;
    const invalid=summary.totalInvalidPlacements||0;
    const invalidRatio=invalid/Math.max(1,summary.totalMoves||1);
    const recoveryRate=invalid?(summary.totalRecoveredInvalid||0)/invalid:null;
    const sr=SHAPE_EVAL_RULES.seeThink,gr=SHAPE_EVAL_RULES.shapeGrasp,pr=SHAPE_EVAL_RULES.perseverance;
    const seeThink=completionRate>=sr.goodCompletionRate&&invalidRatio<=sr.goodInvalidRatio&&(summary.maxHintLevel||0)<=sr.goodMaxHint?'◎':completionRate>=sr.okCompletionRate&&(summary.maxHintLevel||0)<=sr.okMaxHint?'○':'△';
    const tryRepair=invalid===0?'○':recoveryRate>=0.7?'◎':recoveryRate>=0.4?'○':'△';
    const shapeGrasp=completionRate>=gr.goodCompletionRate&&(summary.maxHintLevel||0)<=gr.goodMaxHint?'◎':completionRate>=gr.okCompletionRate&&(summary.maxHintLevel||0)<=gr.okMaxHint?'○':'△';
    const perseverance=(summary.attempted||0)>=pr.goodAttempted?'◎':(summary.attempted||0)>=pr.okAttempted?'○':'△';
    return {seeThink,tryRepair,shapeGrasp,perseverance};
  }
  return {SHAPE_EVAL_RULES,cellKey,normalizeCells,rotateCells,translateCells,isInsideTarget,hasOverlap,canPlace,isSolved,selectFive,createSession,pointToGrid,nextHintLevel,summarizeResults,referenceRatings,cellsForPlacement};
});
