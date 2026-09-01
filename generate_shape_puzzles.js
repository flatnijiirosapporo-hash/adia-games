const fs=require('fs');
const path=require('path');

function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function key([x,y]){return `${x},${y}`}
function normalize(cells){const minX=Math.min(...cells.map(c=>c[0])),minY=Math.min(...cells.map(c=>c[1]));return cells.map(([x,y])=>[x-minX,y-minY]).sort((a,b)=>a[1]-b[1]||a[0]-b[0])}
function dims(cells){const n=normalize(cells);return [Math.max(...n.map(c=>c[0]))+1,Math.max(...n.map(c=>c[1]))+1]}
function connected(cells){if(!cells.length)return false;const s=new Set(cells.map(key)),seen=new Set([key(cells[0])]),q=[cells[0]];while(q.length){const [x,y]=q.shift();for(const n of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){const k=key(n);if(s.has(k)&&!seen.has(k)){seen.add(k);q.push(n)}}}return seen.size===s.size}
function randomPath(width,height,length,rng){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(let attempt=0;attempt<120;attempt++){
    const start=[Math.floor(rng()*width),Math.floor(rng()*height)],used=new Set([key(start)]),path=[start];let visits=0;
    function dfs(x,y){
      if(path.length===length)return true;
      if(++visits>120000)return false;
      let candidates=dirs.map(([dx,dy])=>[x+dx,y+dy]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<width&&ny<height&&!used.has(`${nx},${ny}`));
      candidates=shuffle(candidates,rng).sort((a,b)=>freeDegree(a)-freeDegree(b));
      for(const n of candidates){const k=key(n);used.add(k);path.push(n);if(dfs(n[0],n[1]))return true;path.pop();used.delete(k)}
      return false;
    }
    function freeDegree([x,y]){return dirs.reduce((n,[dx,dy])=>{const nx=x+dx,ny=y+dy;return n+(nx>=0&&ny>=0&&nx<width&&ny<height&&!used.has(`${nx},${ny}`)?1:0)},0)}
    if(dfs(start[0],start[1]))return path;
  }
  throw new Error(`could not create path ${width}x${height} len=${length}`);
}
function splitSizes(total,count,rng){const sizes=Array(count).fill(2);let rem=total-count*2;while(rem-->0)sizes[Math.floor(rng()*count)]++;return sizes}
function puzzleSignature(p){const t=normalize(p.targetCells).map(key).join(';');const parts=p.pieces.map(x=>normalize(x.cells).map(key).join(':')).sort().join('|');return `${t}#${parts}`}
const configs={
 easy:{boards:[[4,4],[5,4]],size:[6,10],pieces:[2,3],minRot:0},
 normal:{boards:[[5,5]],size:[10,16],pieces:[3,4],minRot:1},
 challenge:{boards:[[6,5],[6,6]],size:[16,24],pieces:[4,6],minRot:2}
};
function createPuzzle(level,index,rng,used){
  const cfg=configs[level],progress=(index-1)/99;
  for(let attempt=0;attempt<600;attempt++){
    const board=cfg.boards[Math.min(cfg.boards.length-1,Math.floor((progress+attempt*.01)*cfg.boards.length)%cfg.boards.length)];
    const [w,h]=board;
    const targetSize=Math.min(cfg.size[1],cfg.size[0]+Math.floor(progress*(cfg.size[1]-cfg.size[0]+1))+(attempt%3===0?1:0));
    const maxPieces=Math.min(cfg.pieces[1],Math.floor(targetSize/2));
    const pieceCount=Math.min(maxPieces,cfg.pieces[0]+Math.floor(progress*(cfg.pieces[1]-cfg.pieces[0]+1)));
    const walk=randomPath(w,h,targetSize,rng),sizes=splitSizes(targetSize,pieceCount,rng);
    let cursor=0;const pieces=[],solutions=[];
    const requiredRot=Math.min(pieceCount,cfg.minRot+(level==='easy'&&progress>.55?1:level==='normal'&&progress>.75?1:0));
    for(let i=0;i<pieceCount;i++){
      const segment=walk.slice(cursor,cursor+sizes[i]);cursor+=sizes[i];
      const minX=Math.min(...segment.map(c=>c[0])),minY=Math.min(...segment.map(c=>c[1]));
      const cells=normalize(segment),pieceId=String.fromCharCode(97+i);
      const startRotation=i<requiredRot?(rng()<.5?1:3):0;
      pieces.push({pieceId,cells,startRotation});
      solutions.push({pieceId,position:[minX,minY],rotation:0});
    }
    if(!pieces.every(p=>p.cells.length>=2&&connected(p.cells)))continue;
    const targetCells=[...walk].sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
    const hintPiece=pieces[0],hintSolution=solutions[0];
    const region=hintPiece.cells.map(([x,y])=>[x+hintSolution.position[0],y+hintSolution.position[1]]);
    const p={id:`${level}-${String(index).padStart(3,'0')}`,level,difficultyIndex:index,boardWidth:w,boardHeight:h,targetCells,pieces,solutions,hints:[{level:1,pieceId:hintPiece.pieceId},{level:2,pieceId:hintPiece.pieceId,positionRegion:region},{level:3,pieceId:hintPiece.pieceId,exactPosition:hintSolution.position,rotation:0}]};
    const sig=puzzleSignature(p);if(used.has(sig))continue;used.add(sig);return p;
  }
  throw new Error(`unique puzzle failed ${level} ${index}`);
}
function emit(level,puzzles){
 const body=JSON.stringify(puzzles,null,2);
 return `(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;if(root){root.NIJI_SHAPE_PUZZLES=root.NIJI_SHAPE_PUZZLES||{};root.NIJI_SHAPE_PUZZLES.${level}=data;}})(typeof window!=='undefined'?window:globalThis,function(){return ${body};});\n`;
}
const rng=mulberry32(20260901),outDir=path.join(__dirname,'..','assets','shape_puzzle_data');fs.mkdirSync(outDir,{recursive:true});
for(const level of ['easy','normal','challenge']){const used=new Set(),puzzles=[];for(let i=1;i<=100;i++)puzzles.push(createPuzzle(level,i,rng,used));fs.writeFileSync(path.join(outDir,`puzzles_${level}.js`),emit(level,puzzles));console.log(`wrote 100 ${level} puzzles`)}
