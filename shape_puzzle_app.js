(()=>{
'use strict';
const core=window.NIJI_SHAPE_CORE;
const pools=window.NIJI_SHAPE_PUZZLES||{};
const SHAPE_HINT_IDLE_MS=45000;
const $=id=>document.getElementById(id);
const screens={name:$('screenName'),difficulty:$('screenDifficulty'),play:$('screenPlay'),complete:$('screenComplete'),report:$('screenReport')};
const LEVEL_LABELS={easy:'かんたん',normal:'ふつう',challenge:'チャレンジ'};
const PIECE_COLORS=['#4388e8','#4dbb9b','#f08a7a','#8b6ed8','#f2b84b','#4aa6b8'];
const session={childName:'',difficulty:'',puzzles:[],currentIndex:0,results:[],finalRatings:null,comment:''};
let selectedLevel='',currentPuzzle=null,placements={},pieceState={},selectedPieceId='',activeResult=null,hintLevel=0,hintData=null,idleTimer=null,transitionTimer=null,drag=null,soundEnabled=true,invalidFlags={};

function showScreen(name){Object.entries(screens).forEach(([key,el])=>{el.hidden=key!==name});document.body.dataset.shapeScreen=name;window.scrollTo?.(0,0)}
function clearTimers(){if(idleTimer){clearTimeout(idleTimer);idleTimer=null}if(transitionTimer){clearTimeout(transitionTimer);transitionTimer=null}}
function clearSession(){clearTimers();session.childName='';session.difficulty='';session.puzzles=[];session.currentIndex=0;session.results=[];session.finalRatings=null;session.comment='';selectedLevel='';currentPuzzle=null;placements={};pieceState={};selectedPieceId='';activeResult=null;hintLevel=0;hintData=null;invalidFlags={}}
function setMessage(text=''){const el=$('playMessage');if(el)el.textContent=text}
function markMeaningfulAction(){if(!currentPuzzle||screens.play.hidden)return;clearTimeout(idleTimer);idleTimer=setTimeout(showHintModal,SHAPE_HINT_IDLE_MS)}
function showHintModal(){$('hintModal').hidden=false;$('hintModalUse').focus()}
function hideHintModal(){$('hintModal').hidden=true}
function startSession(){
  const name=$('childNameInput').value.trim();
  if(!name){$('nameError').hidden=false;$('childNameInput').focus();return}
  $('nameError').hidden=true;
  if(!selectedLevel){showScreen('difficulty');return}
  try{const fresh=core.createSession(name,selectedLevel,pools[selectedLevel]||[]);Object.assign(session,fresh);beginPuzzle()}catch(err){console.error(err);alert('もんだいを よみこめませんでした。\nTOPにもどって、もういちどためしてください。')}
}
function beginPuzzle(){
  clearTimers();hideHintModal();
  currentPuzzle=session.puzzles[session.currentIndex];if(!currentPuzzle)return;
  placements={};invalidFlags={};hintLevel=0;hintData=null;
  pieceState={};currentPuzzle.pieces.forEach(p=>{pieceState[p.pieceId]={rotation:p.startRotation||0}});
  selectedPieceId=currentPuzzle.pieces[0]?.pieceId||'';
  activeResult={puzzleId:currentPuzzle.id,difficulty:session.difficulty,startedAt:performance.now(),endedAt:0,durationMs:0,completed:false,moves:0,rotations:0,invalidPlacements:0,recoveredInvalidCount:0,hintUses:0,maxHintLevel:0,endState:''};
  $('questionProgress').textContent=`${session.currentIndex+1} / 5`;
  $('successOverlay').hidden=true;setMessage('');showScreen('play');renderPuzzle();markMeaningfulAction();
}
function bounds(cells){return {w:Math.max(...cells.map(c=>c[0]))+1,h:Math.max(...cells.map(c=>c[1]))+1}}
function makeCell(cls,left,top,width,height,color){const d=document.createElement('div');d.className=cls;d.style.left=left;d.style.top=top;d.style.width=width;d.style.height=height;if(color)d.style.setProperty('--piece-color',color);return d}
function pieceFor(id){return currentPuzzle?.pieces.find(p=>p.pieceId===id)}
function pieceIndex(id){return Math.max(0,currentPuzzle?.pieces.findIndex(p=>p.pieceId===id)??0)}
function rotatedFor(id){const p=pieceFor(id);return p?core.rotateCells(p.cells,pieceState[id]?.rotation||0):[]}
function renderBoard(){
  const board=$('shapeBoard'),w=currentPuzzle.boardWidth,h=currentPuzzle.boardHeight;board.innerHTML='';board.style.aspectRatio=`${w}/${h}`;board.style.setProperty('--grid-x',`${100/w}%`);board.style.setProperty('--grid-y',`${100/h}%`);
  currentPuzzle.targetCells.forEach(([x,y])=>board.appendChild(makeCell('target-cell',`${x*100/w}%`,`${y*100/h}%`,`${100/w}%`,`${100/h}%`)));
  if(hintLevel>=2&&hintData?.positionRegion)hintData.positionRegion.forEach(([x,y])=>board.appendChild(makeCell('hint-region-cell',`${x*100/w}%`,`${y*100/h}%`,`${100/w}%`,`${100/h}%`)));
  if(hintLevel>=3&&hintData?.exactPosition){const p=pieceFor(hintData.pieceId);const cells=core.translateCells(core.rotateCells(p.cells,hintData.rotation||0),hintData.exactPosition[0],hintData.exactPosition[1]);cells.forEach(([x,y])=>board.appendChild(makeCell('hint-exact-cell',`${x*100/w}%`,`${y*100/h}%`,`${100/w}%`,`${100/h}%`)))}
  currentPuzzle.pieces.forEach(piece=>{const pl=placements[piece.pieceId];if(!pl)return;const cells=core.rotateCells(piece.cells,pl.rotation),b=bounds(cells),token=document.createElement('div');token.className=`shape-piece-token${selectedPieceId===piece.pieceId?' selected':''}${hintLevel>=1&&hintData?.pieceId===piece.pieceId?' hint-piece':''}`;token.dataset.pieceId=piece.pieceId;token.dataset.source='board';token.tabIndex=0;token.setAttribute('role','button');token.setAttribute('aria-label',`ピース ${piece.pieceId}。タップで回転`);token.style.left=`${pl.x*100/w}%`;token.style.top=`${pl.y*100/h}%`;token.style.width=`${b.w*100/w}%`;token.style.height=`${b.h*100/h}%`;const color=PIECE_COLORS[pieceIndex(piece.pieceId)%PIECE_COLORS.length];cells.forEach(([x,y])=>token.appendChild(makeCell('piece-cell',`${x*100/b.w}%`,`${y*100/b.h}%`,`${100/b.w}%`,`${100/b.h}%`,color)));board.appendChild(token)})
}
function renderTray(){
  const tray=$('pieceTray');tray.innerHTML='';
  currentPuzzle.pieces.forEach(piece=>{if(placements[piece.pieceId])return;const cells=core.rotateCells(piece.cells,pieceState[piece.pieceId]?.rotation||0),b=bounds(cells),token=document.createElement('div');token.className=`shape-piece-token${selectedPieceId===piece.pieceId?' selected':''}${hintLevel>=1&&hintData?.pieceId===piece.pieceId?' hint-piece':''}`;token.dataset.pieceId=piece.pieceId;token.dataset.source='tray';token.tabIndex=0;token.setAttribute('role','button');token.setAttribute('aria-label',`ピース ${piece.pieceId}。ドラッグして置く。タップで回転`);const cell=30;token.style.width=`${b.w*cell}px`;token.style.height=`${b.h*cell}px`;const color=PIECE_COLORS[pieceIndex(piece.pieceId)%PIECE_COLORS.length];cells.forEach(([x,y])=>token.appendChild(makeCell('piece-cell',`${x*cell}px`,`${y*cell}px`,`${cell}px`,`${cell}px`,color)));tray.appendChild(token)})
}
function renderPreview(){const el=$('selectedPiecePreview');el.innerHTML='';if(!selectedPieceId||!pieceFor(selectedPieceId)){el.textContent='ピースをえらんでね';return}const cells=rotatedFor(selectedPieceId),b=bounds(cells),box=document.createElement('div');box.className='preview-shape';const cell=20;box.style.width=`${b.w*cell}px`;box.style.height=`${b.h*cell}px`;const color=PIECE_COLORS[pieceIndex(selectedPieceId)%PIECE_COLORS.length];cells.forEach(([x,y])=>box.appendChild(makeCell('piece-cell',`${x*cell}px`,`${y*cell}px`,`${cell}px`,`${cell}px`,color)));el.appendChild(box)}
function renderPuzzle(){if(!currentPuzzle)return;renderBoard();renderTray();renderPreview();bindPiecePointerHandlers()}
function bindPiecePointerHandlers(){document.querySelectorAll('.shape-piece-token').forEach(token=>{token.addEventListener('pointerdown',onPiecePointerDown);token.addEventListener('keydown',onPieceKeyDown)})}
function onPiecePointerDown(e){if(!activeResult)return;e.preventDefault();const token=e.currentTarget,id=token.dataset.pieceId;selectedPieceId=id;renderPreview();const rect=token.getBoundingClientRect(),cells=rotatedFor(id),b=bounds(cells);drag={id,token,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false,source:token.dataset.source,oldPlacement:placements[id]?{...placements[id]}:null,grabCellX:Math.min(b.w-1,Math.max(0,Math.floor((e.clientX-rect.left)/(rect.width/b.w)))),grabCellY:Math.min(b.h-1,Math.max(0,Math.floor((e.clientY-rect.top)/(rect.height/b.h))))};token.setPointerCapture?.(e.pointerId);token.classList.add('dragging','selected');markMeaningfulAction()}
function onGlobalPointerMove(e){if(!drag||e.pointerId!==drag.pointerId)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.hypot(dx,dy)>8&&!drag.moved){drag.moved=true;activeResult.moves+=1}drag.lastX=e.clientX;drag.lastY=e.clientY;if(drag.moved)drag.token.style.transform=`translate(${dx}px,${dy}px) scale(1.03)`}
function onGlobalPointerUp(e){if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;drag=null;d.token.releasePointerCapture?.(e.pointerId);d.token.classList.remove('dragging');d.token.style.transform='';if(!d.moved){rotateSelectedPiece();return}const board=$('shapeBoard'),br=board.getBoundingClientRect();if(e.clientX>=br.left&&e.clientX<=br.right&&e.clientY>=br.top&&e.clientY<=br.bottom){const cellSize=br.width/currentPuzzle.boardWidth;const [gx,gy]=core.pointToGrid(e.clientX-d.grabCellX*cellSize,e.clientY-d.grabCellY*cellSize,{left:br.left,top:br.top,cellSize});const candidate={x:gx,y:gy,rotation:pieceState[d.id].rotation};const piece=pieceFor(d.id);if(core.canPlace(piece,candidate,currentPuzzle,placements)){placements[d.id]=candidate;if(invalidFlags[d.id]){activeResult.recoveredInvalidCount+=1;invalidFlags[d.id]=false};setMessage('');renderPuzzle();markMeaningfulAction();checkSolved();return}}
  activeResult.invalidPlacements+=1;invalidFlags[d.id]=true;if(d.oldPlacement)placements[d.id]=d.oldPlacement;else delete placements[d.id];setMessage('そこには はいらないみたい。べつのばしょも ためしてみよう！');renderPuzzle();markMeaningfulAction()
}
function rotateSelectedPiece(){
  if(!selectedPieceId||!activeResult)return;const id=selectedPieceId,piece=pieceFor(id),oldRot=pieceState[id].rotation,newRot=(oldRot+1)%4;activeResult.rotations+=1;pieceState[id].rotation=newRot;
  if(placements[id]){const candidate={...placements[id],rotation:newRot};if(core.canPlace(piece,candidate,currentPuzzle,placements)){placements[id]=candidate}else{delete placements[id];activeResult.invalidPlacements+=1;invalidFlags[id]=true;setMessage('むきをかえると ここにははいらないよ。もういちどおいてみよう！')}}
  renderPuzzle();markMeaningfulAction();checkSolved()
}
function findFirstValidPlacement(id){const piece=pieceFor(id),rotation=pieceState[id].rotation;for(let y=0;y<currentPuzzle.boardHeight;y++)for(let x=0;x<currentPuzzle.boardWidth;x++){const c={x,y,rotation};if(core.canPlace(piece,c,currentPuzzle,placements))return c}return null}
function onPieceKeyDown(e){if(!selectedPieceId)return;if(e.key==='Enter'||e.key.toLowerCase()==='r'){e.preventDefault();rotateSelectedPiece();return}const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;e.preventDefault();const id=selectedPieceId,piece=pieceFor(id);let base=placements[id]||findFirstValidPlacement(id);if(!base)return;let candidate={...base,x:base.x+delta[0],y:base.y+delta[1],rotation:pieceState[id].rotation};if(!core.canPlace(piece,candidate,currentPuzzle,placements))candidate=base;if(core.canPlace(piece,candidate,currentPuzzle,placements)){placements[id]=candidate;activeResult.moves+=1;renderPuzzle();markMeaningfulAction();checkSolved()}}
function checkSolved(){if(!core.isSolved(currentPuzzle,placements))return;completeCurrentPuzzle()}
function finalizeCurrent(completed,endState){if(!activeResult)return;activeResult.endedAt=performance.now();activeResult.durationMs=Math.max(0,activeResult.endedAt-activeResult.startedAt);activeResult.completed=completed;activeResult.endState=endState;session.results.push({...activeResult});activeResult=null;clearTimers()}
function completeCurrentPuzzle(){if(!currentPuzzle||!core.isSolved(currentPuzzle,placements)||!activeResult)return;finalizeCurrent(true,'completed');$('successOverlay').hidden=false;playSuccessSound();transitionTimer=setTimeout(()=>{$('successOverlay').hidden=true;advanceAfterResult()},2400)}
function supportEndCurrentPuzzle(){if(!activeResult)return;if(!confirm('この問題は「ここまで」として次へ進みますか？'))return;finalizeCurrent(false,'supporter-ended');setMessage('ここまでできたね。つぎもやってみよう！');transitionTimer=setTimeout(advanceAfterResult,1500)}
function advanceAfterResult(){clearTimers();if(session.currentIndex>=4){showScreen('complete');return}session.currentIndex+=1;beginPuzzle()}
function requestHint(source='supporter'){
  if(!activeResult||!currentPuzzle)return;hideHintModal();hintLevel=core.nextHintLevel(hintLevel);hintData=currentPuzzle.hints.find(h=>h.level===hintLevel)||currentPuzzle.hints[currentPuzzle.hints.length-1];activeResult.hintUses+=1;activeResult.maxHintLevel=Math.max(activeResult.maxHintLevel,hintLevel);if(hintData?.pieceId)selectedPieceId=hintData.pieceId;setMessage(hintLevel===1?'このピースを よくみてみよう！':hintLevel===2?'このへんに おけそうだよ！':'むきと ばしょを よくみてみよう！');renderPuzzle();markMeaningfulAction();return source
}
function playSuccessSound(){if(!soundEnabled)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ctx=new AC(),now=ctx.currentTime;[523.25,659.25].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,now+i*.11);g.gain.exponentialRampToValueAtTime(.09,now+i*.11+.02);g.gain.exponentialRampToValueAtTime(.0001,now+i*.11+.18);o.connect(g);g.connect(ctx.destination);o.start(now+i*.11);o.stop(now+i*.11+.2)});setTimeout(()=>ctx.close(),600)}catch{}}
function formatDuration(ms){if(ms==null)return'—';const s=Math.max(0,Math.round(ms/1000)),m=Math.floor(s/60),r=s%60;return m?`${m}分${String(r).padStart(2,'0')}秒`:`${r}秒`}
function buildReport(){
  const summary=core.summarizeResults(session.results),reference=core.referenceRatings(summary);if(!session.finalRatings)session.finalRatings={...reference};
  $('reportName').textContent=session.childName;$('reportDate').textContent=new Date().toLocaleDateString('ja-JP');$('reportDifficulty').textContent=LEVEL_LABELS[session.difficulty]||session.difficulty;$('reportCompleted').textContent=`${summary.completed} / 5`;$('reportAverage').textContent=formatDuration(summary.averageCompletedMs);$('reportHints').textContent=`${summary.totalHintUses}回`;$('reportInvalid').textContent=`${summary.totalInvalidPlacements}回`;$('reportMoves').textContent=`${summary.totalMoves}回`;$('reportRotations').textContent=`${summary.totalRotations}回`;$('reportMaxHint').textContent=summary.maxHintLevel?`レベル${summary.maxHintLevel}`:'なし';
  $('reportQuestions').innerHTML=session.results.map((r,i)=>`<div class="question-result"><strong>${i+1}問目 ${r.completed?'できた':'ここまで'}</strong><span>${r.completed?formatDuration(r.durationMs):'—'}</span></div>`).join('');
  const defs=[['seeThink','みて かんがえる力'],['tryRepair','ためして なおす力'],['shapeGrasp','かたちを とらえる力'],['perseverance','さいごまで とりくむ力']];
  $('ratingGrid').innerHTML=defs.map(([key,label])=>`<div class="rating-row" data-rating-row="${key}"><strong>${label}</strong><div class="rating-buttons" role="group" aria-label="${label}">${['◎','○','△'].map(v=>`<button type="button" class="rating-btn${session.finalRatings[key]===v?' selected':''}" data-key="${key}" data-rating="${v}" aria-pressed="${session.finalRatings[key]===v}">${v}</button>`).join('')}</div></div>`).join('');
  document.querySelectorAll('.rating-btn').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.key;session.finalRatings[key]=btn.dataset.rating;document.querySelectorAll(`.rating-btn[data-key="${key}"]`).forEach(b=>{const on=b===btn;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))})}));
  $('supportComment').value=session.comment||'';updatePrintCommentSizing();showScreen('report')
}
function updatePrintCommentSizing(){const text=$('supportComment').value||'',len=text.length,size=len<=220?'11pt':len<=400?'10pt':'9pt';document.documentElement.style.setProperty('--print-comment-size',size);$('printOmitNote').hidden=true}
function printReport(mode){session.comment=$('supportComment').value.slice(0,600);updatePrintCommentSizing();if(mode==='pdf')alert('印刷画面の「送信先 / プリンター」で「PDFに保存」を選んでください。');window.print()}
function goTop(confirmIfActive=true){if(confirmIfActive&&session.puzzles.length&&session.results.length<5&&!confirm('5もんの とちゅうです。TOPにもどりますか？'))return;clearSession();location.href='index.html#allGames'}
function selectLevel(level){selectedLevel=level;document.querySelectorAll('.difficulty-card').forEach(b=>b.classList.toggle('selected',b.dataset.level===level));$('difficultyStartBtn').disabled=false}

$('nameNextBtn').addEventListener('click',()=>{const name=$('childNameInput').value.trim();if(!name){$('nameError').hidden=false;$('childNameInput').focus();return}$('nameError').hidden=true;showScreen('difficulty')});
$('childNameInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('nameNextBtn').click()});
$('difficultyBackBtn').addEventListener('click',()=>showScreen('name'));document.querySelectorAll('.difficulty-card').forEach(b=>b.addEventListener('click',()=>selectLevel(b.dataset.level)));$('difficultyStartBtn').addEventListener('click',startSession);
$('rotatePieceBtn').addEventListener('click',rotateSelectedPiece);$('hintBtn').addEventListener('click',()=>requestHint('supporter'));$('supportEndBtn').addEventListener('click',supportEndCurrentPuzzle);$('hintModalUse').addEventListener('click',()=>requestHint('inactivity'));$('hintModalContinue').addEventListener('click',()=>{hideHintModal();markMeaningfulAction()});
$('viewReportBtn').addEventListener('click',buildReport);$('supportComment').addEventListener('input',()=>{session.comment=$('supportComment').value;updatePrintCommentSizing()});$('pdfBtn').addEventListener('click',()=>printReport('pdf'));$('printBtn').addEventListener('click',()=>printReport('print'));
$('playAgainBtn').addEventListener('click',()=>{if(confirm('周りにやりたい友達がいないか確認してね')){clearSession();$('childNameInput').value='';document.querySelectorAll('.difficulty-card').forEach(b=>b.classList.remove('selected'));$('difficultyStartBtn').disabled=true;showScreen('name');$('childNameInput').focus()}});$('reportTopBtn').addEventListener('click',()=>goTop(false));$('playTopBtn').addEventListener('click',()=>goTop(true));$('headerTopLink').addEventListener('click',e=>{if(session.puzzles.length&&session.results.length<5){e.preventDefault();goTop(true)}});
$('soundToggle').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('soundToggle').setAttribute('aria-pressed',String(soundEnabled));$('soundToggle').textContent=soundEnabled?'🔊 おと ON':'🔇 おと OFF'});
document.addEventListener('pointermove',onGlobalPointerMove,{passive:false});document.addEventListener('pointerup',onGlobalPointerUp,{passive:false});document.addEventListener('pointercancel',onGlobalPointerUp,{passive:false});window.addEventListener('resize',()=>{if(currentPuzzle&&!screens.play.hidden)renderPuzzle()});window.addEventListener('orientationchange',()=>setTimeout(()=>{if(currentPuzzle&&!screens.play.hidden)renderPuzzle()},120));
showScreen('name');
window.NIJI_SHAPE_APP={showScreen,clearSession,startSession,beginPuzzle,rotateSelectedPiece,requestHint,completeCurrentPuzzle,buildReport,printReport,getSession:()=>session,SHAPE_HINT_IDLE_MS};
})();
