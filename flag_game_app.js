(function(){
'use strict';
const root=document.getElementById('flagGameRoot');
const master=window.NIJI_FLAG_MASTER||[],core=window.NIJI_FLAG_CORE,sources=window.NIJI_FLAG_SOURCES||{};
const state={screen:'home',mode:null,level:null,questionIndex:0,correctCount:0,hintCount:0,inputLocked:false,results:[],round:null,hintStage:0,soundOn:true,selectedSort:new Set(),pairOpen:[],matchedPairs:0,inactivityTimer:null};
const MODE_LABEL={name:'国名当て',pair:'国旗・国名ペア',compare:'どっちかな？',map:'世界地図で国さがし',sort:'国旗のなかま分け'};
const LEVEL_LABEL={easy:'かんたん',normal:'ふつう',challenge:'チャレンジ'};
function setInputLocked(v){state.inputLocked=!!v;}
function clearInactivity(){if(state.inactivityTimer){clearTimeout(state.inactivityTimer);state.inactivityTimer=null;}}
function flagSvg(symbolId,cls=''){return `<svg class="${cls}" viewBox="0 0 160 120" role="img" aria-label="国旗"><use href="#${symbolId}"></use></svg>`;}
function renderHome(){clearInactivity();state.screen='home';state.mode=null;root.innerHTML=`<section class="flag-screen"><div class="hero"><p class="hero-kicker">🌏 みて・おぼえて・くらべてみよう</p><h1>国旗ゲーム</h1><p>国旗をよく見て、国の名前や場所、特徴を楽しく確かめます。速さを競わず、自分のペースで取り組めます。</p></div><div class="flag-mode-grid"><button class="mode-card mode-name" data-mode="name"><span class="icon">🏳️</span><strong>国旗をみて国名を当てよう</strong><small>国旗を見て4つの国名から選びます</small></button><button class="mode-card mode-pair" data-mode="pair"><span class="icon">🧠</span><strong>国旗と国名をペアにしよう</strong><small>6組・12枚のカードをそろえます</small></button><button class="mode-card mode-compare" data-mode="compare"><span class="icon">⚖️</span><strong>どっちかな？</strong><small>面積や人口を2つの国で比べます</small></button><button class="mode-card mode-map" data-mode="map"><span class="icon">🗺️</span><strong>世界地図で国さがし</strong><small>国名を見て世界地図から探します</small></button><button class="mode-card mode-sort" data-mode="sort"><span class="icon">🔎</span><strong>国旗のなかま分け</strong><small>色や形の特徴をよく見て選びます</small></button></div></section>`;root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>renderDifficulty(b.dataset.mode)));}
function renderDifficulty(mode){state.screen='difficulty';state.mode=mode;root.innerHTML=`<section class="flag-screen"><div class="screen-head"><button id="backHome" class="back-btn">← もどる</button><div><h1>${MODE_LABEL[mode]}</h1><p>むずかしさを えらぼう</p></div></div><div class="level-grid"><button class="level-card" data-level="easy"><strong>★ かんたん</strong><span>40の国・地域から</span></button><button class="level-card" data-level="normal"><strong>★★ ふつう</strong><span>100の国・地域から</span></button><button class="level-card" data-level="challenge"><strong>★★★ チャレンジ</strong><span>201の国・地域から</span></button></div><div class="source-panel">1回10問（ペアは6ペア12枚）。国名・国旗・位置・比較データは学習用参考情報です。</div></section>`;document.getElementById('backHome').onclick=renderHome;root.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>startMode(mode,b.dataset.level)));}
function resetRound(mode,level){clearInactivity();state.mode=mode;state.level=level;state.questionIndex=0;state.correctCount=0;state.hintCount=0;state.results=[];state.hintStage=0;state.inputLocked=false;state.selectedSort=new Set();state.pairOpen=[];state.matchedPairs=0;}
function startMode(mode,level){resetRound(mode,level);if(mode==='name')state.round=core.buildNameQuiz(master,level,10);else if(mode==='pair')state.round=core.buildPairRound(master,level);else if(mode==='compare')state.round=core.buildCompareQuiz(master,level,10);else if(mode==='map')state.round=core.buildMapQuiz(master,level,10);else state.round=core.buildSortQuiz(master,level,10);renderPlay();}
function playShell(body,actions=''){return `<section class="flag-screen"><div class="play-topbar"><button id="playBack" class="back-btn">← もどる</button><div class="mode-title">${MODE_LABEL[state.mode]}｜${LEVEL_LABEL[state.level]}</div><div class="progress-pill">${state.mode==='pair'?`${state.matchedPairs} / 6`:`${state.questionIndex+1} / 10`}</div></div><div class="play-card">${body}</div>${actions}</section>`;}
function armInactivityHint(handler){
  clearInactivity();
  state.inactivityTimer=setTimeout(()=>{
    if(state.screen!=='play'||state.inputLocked)return;
    const old=document.getElementById('flagHintModal');if(old)old.remove();
    document.body.insertAdjacentHTML('beforeend',`<div id="flagHintModal" class="flag-modal"><div class="modal-card"><h2>ヒントをつかう？</h2><p>むずかしいときは、ヒントをつかっていいよ。</p><div class="modal-actions"><button id="hintYes" class="flag-action action-hint">ヒントをつかう</button><button id="hintNo" class="flag-action action-secondary">まだやってみる</button></div></div></div>`);
    document.getElementById('hintYes').onclick=()=>{document.getElementById('flagHintModal')?.remove();handler();};
    document.getElementById('hintNo').onclick=()=>{document.getElementById('flagHintModal')?.remove();armInactivityHint(handler);};
  },15000);
}
function renderNameQuestion(){
  const q=state.round[state.questionIndex];
  root.innerHTML=playShell(`<h2 class="question-title">この国旗は どこの国？</h2><div class="flag-large">${flagSvg(q.flagSymbolId)}</div><div id="nameOptions" class="options-grid">${q.options.map(o=>`<button class="flag-option" data-answer="${o.id}">${o.name}</button>`).join('')}</div><div id="nameHintBox" class="hint-box hidden"></div><div id="flagFeedback" class="feedback"></div>`,`<div class="play-actions"><button id="nameHintBtn" class="flag-action action-hint">💡 ヒント</button></div>`);
  document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answerName(b.dataset.answer));
  document.getElementById('nameHintBtn').onclick=useNameHint;
  armInactivityHint(useNameHint);
}
function useNameHint(){
  if(state.inputLocked)return;
  clearInactivity();
  const q=state.round[state.questionIndex];
  state.hintStage=Math.min(3,state.hintStage+1);state.hintCount++;
  const hint=core.applyNameHint(q,state.hintStage),box=document.getElementById('nameHintBox');
  if(box){box.classList.remove('hidden');box.textContent=hint.text;}
  if(hint.type==='reduce')document.querySelectorAll('[data-answer]').forEach(b=>{if(!hint.visibleOptionIds.includes(b.dataset.answer))b.classList.add('hidden');});
  const btn=document.getElementById('nameHintBtn');if(btn&&state.hintStage>=3)btn.disabled=true;
  if(state.hintStage<3)armInactivityHint(useNameHint);
}
function answerName(id){
  if(state.inputLocked)return;
  const q=state.round[state.questionIndex];
  if(id!==q.answerId){showFeedback({correct:false,text:'もういちど、よく見てみよう。'});armInactivityHint(useNameHint);return;}
  state.correctCount++;state.results.push({mode:'name',answerId:id,hints:state.hintStage});
  showFeedback({correct:true,text:'できた！ よく見つけたね。'});
  document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);
  nextQuestion(650);
}

function pairFace(card){return card.type==='flag'?flagSvg(card.flagSymbolId):`<span>${card.label}</span>`;}
function renderPairBoard(){
  const cards=state.round.cards;
  root.innerHTML=playShell(`<h2 class="question-title">国旗と国名のペアを みつけよう</h2><p class="question-sub">カードを2まいずつ ひらいてね</p><div class="pair-grid">${cards.map(c=>`<button class="pair-card" data-card-id="${c.cardId}" aria-label="カード">？</button>`).join('')}</div><div id="flagFeedback" class="feedback"></div>`);
  root.querySelectorAll('[data-card-id]').forEach(b=>b.onclick=()=>flipPairCard(b.dataset.cardId));
}
function flipPairCard(cardId){
  if(state.inputLocked||state.pairOpen.some(x=>x.cardId===cardId))return;
  const card=state.round.cards.find(x=>x.cardId===cardId),btn=root.querySelector(`[data-card-id="${cardId}"]`);
  if(!card||!btn||btn.classList.contains('is-matched'))return;
  btn.classList.add('is-open');btn.innerHTML=pairFace(card);state.pairOpen.push(card);
  if(state.pairOpen.length===2)resolvePairSelection();
}
function resolvePairSelection(){
  if(state.pairOpen.length!==2)return;
  const [a,b]=state.pairOpen,match=a.countryId===b.countryId&&a.type!==b.type;
  setInputLocked(true);
  if(match){
    state.matchedPairs++;
    for(const c of state.pairOpen){const el=root.querySelector(`[data-card-id="${c.cardId}"]`);if(el){el.classList.remove('is-open');el.classList.add('is-matched');el.disabled=true;}}
    showFeedback({correct:true,text:'ペアになったね！'});state.pairOpen=[];setInputLocked(false);
    const p=root.querySelector('.progress-pill');if(p)p.textContent=`${state.matchedPairs} / 6`;
    if(state.matchedPairs>=6)setTimeout(renderResult,500);
  }else{
    showFeedback({correct:false,text:'ちがうペアだったね。もういちど見てみよう。'});
    const closing=state.pairOpen.slice();
    setTimeout(()=>{for(const c of closing){const el=root.querySelector(`[data-card-id="${c.cardId}"]`);if(el&&!el.classList.contains('is-matched')){el.classList.remove('is-open');el.textContent='？';}}state.pairOpen=[];setInputLocked(false);},700);
  }
}

function formatArea(n){return `${Math.round(Number(n)).toLocaleString('ja-JP')} km²`;}
function formatPopulation(n){const v=Math.round(Number(n));return `${v.toLocaleString('ja-JP')}人`;}
function renderCompareQuestion(){
  const q=state.round[state.questionIndex],isArea=q.metric==='area';
  root.innerHTML=playShell(`<h2 class="question-title">${isArea?'どちらの国の面積が大きい？':'どちらの国の人口が多い？'}</h2><div class="compare-grid"><button class="compare-choice" data-compare="${q.leftId}">${flagSvg(q.leftFlag)}<strong>${q.leftName}</strong></button><div class="versus">VS</div><button class="compare-choice" data-compare="${q.rightId}">${flagSvg(q.rightFlag)}<strong>${q.rightName}</strong></button></div><div id="compareValues" class="compare-values hidden"></div><div id="flagFeedback" class="feedback"></div><div class="source-panel">${isArea?'面積':'人口'}は学習用の参考値です。${isArea?'':'人口は最新人口ではありません。'}</div>`);
  root.querySelectorAll('[data-compare]').forEach(b=>b.onclick=()=>answerCompare(b.dataset.compare));
}
function answerCompare(id){
  if(state.inputLocked)return;
  setInputLocked(true);
  const q=state.round[state.questionIndex],correct=id===q.answerId,isArea=q.metric==='area';
  if(correct)state.correctCount++;
  const leftText=isArea?formatArea(q.leftValue):`${formatPopulation(q.leftValue)}（${q.leftYear}年参考）`;
  const rightText=isArea?formatArea(q.rightValue):`${formatPopulation(q.rightValue)}（${q.rightYear}年参考）`;
  const values=document.getElementById('compareValues');if(values){values.classList.remove('hidden');values.innerHTML=`${q.leftName}：${leftText}<br>${q.rightName}：${rightText}`;}
  showFeedback({correct,text:correct?'そのとおり！ よくくらべたね。':'くらべてみると、ちがいが見えてくるね。'});
  state.results.push({mode:'compare',metric:q.metric,selectedId:id,answerId:q.answerId,correct});
  root.querySelectorAll('[data-compare]').forEach(b=>b.disabled=true);
  setTimeout(()=>{state.questionIndex++;if(state.questionIndex>=10)renderResult();else renderPlay();},900);
}

function getWorldMapMarkup(){
  const tpl=document.getElementById('flagWorldMapTemplate');
  if(tpl)return tpl.innerHTML;
  return '<div class="map-note">世界地図を準備しています。</div>';
}
function renderMapQuestion(){
  const q=state.round[state.questionIndex];
  root.innerHTML=playShell(`<h2 class="question-title">「${q.name}」は どこにある？</h2><p class="question-sub">世界地図から さがしてタップしてね</p><div id="flagMapWrap" class="map-wrap">${getWorldMapMarkup()}</div><div id="mapHintBox" class="hint-box hidden"></div><div id="flagFeedback" class="feedback"></div>`,`<div class="play-actions"><button id="mapHintBtn" class="flag-action action-hint">💡 ヒント</button></div>`);
  root.querySelectorAll('[data-country-id]').forEach(el=>{el.onclick=()=>answerMap(el.dataset.countryId);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();answerMap(el.dataset.countryId);}};});
  document.getElementById('mapHintBtn').onclick=useMapHint;
  armInactivityHint(useMapHint);
}
function setMapRegionHighlight(region){
  root.querySelectorAll('[data-region]').forEach(el=>el.classList.toggle('is-region-hint',el.dataset.region===region));
}
function setMapTargetHighlight(targetId){
  root.querySelectorAll('[data-country-id]').forEach(el=>el.classList.toggle('is-target-hint',el.dataset.countryId===targetId));
}
function useMapHint(){
  if(state.inputLocked)return;
  clearInactivity();
  const q=state.round[state.questionIndex],box=document.getElementById('mapHintBox');
  state.hintStage=Math.min(3,state.hintStage+1);state.hintCount++;
  if(box){box.classList.remove('hidden');box.textContent=state.hintStage===1?`${q.region}にあるよ`:state.hintStage===2?'この色の地域をさがしてみよう':'ここだよ。黄色く光っている場所を見てね。';}
  if(state.hintStage===2)setMapRegionHighlight(q.region);
  if(state.hintStage===3){setMapRegionHighlight(q.region);setMapTargetHighlight(q.mapId);const b=document.getElementById('mapHintBtn');if(b)b.disabled=true;}
  if(state.hintStage<3)armInactivityHint(useMapHint);
}
function answerMap(id){
  if(state.inputLocked)return;
  const q=state.round[state.questionIndex];
  if(id!==q.mapId){showFeedback({correct:false,text:'もういちど地図をよく見てみよう。'});armInactivityHint(useMapHint);return;}
  state.correctCount++;state.results.push({mode:'map',answerId:q.answerId,hints:state.hintStage});setMapTargetHighlight(q.mapId);
  showFeedback({correct:true,text:`みつけた！ ${q.name}だね。`});
  nextQuestion(800);
}

function renderSortQuestion(){
  const q=state.round[state.questionIndex];state.selectedSort=new Set();
  root.innerHTML=playShell(`<h2 class="question-title">${q.label}</h2><p class="question-sub">あてはまる国旗を ぜんぶえらんでね</p><div class="sort-grid">${q.options.map(o=>`<button class="sort-flag" data-sort-id="${o.id}" aria-pressed="false">${flagSvg(o.flagSymbolId)}<strong>${o.name}</strong></button>`).join('')}</div><div id="flagFeedback" class="feedback"></div>`,`<div class="play-actions"><button id="sortSubmit" class="flag-action action-primary">これでOK</button></div>`);
  root.querySelectorAll('[data-sort-id]').forEach(b=>b.onclick=()=>toggleSortFlag(b.dataset.sortId));
  document.getElementById('sortSubmit').onclick=submitSortAnswer;
}
function toggleSortFlag(id){
  if(state.inputLocked)return;
  if(state.selectedSort.has(id))state.selectedSort.delete(id);else state.selectedSort.add(id);
  const b=root.querySelector(`[data-sort-id="${id}"]`);if(b)b.setAttribute('aria-pressed',String(state.selectedSort.has(id)));
}
function submitSortAnswer(){
  if(state.inputLocked)return;
  const q=state.round[state.questionIndex];
  if(!core.evaluateSort(q,state.selectedSort)){showFeedback({correct:false,text:'よく見て、もういちど選んでみよう。'});return;}
  state.correctCount++;state.results.push({mode:'sort',ruleKey:q.ruleKey,selected:[...state.selectedSort]});
  showFeedback({correct:true,text:'できた！ 特徴をよく見つけたね。'});
  root.querySelectorAll('[data-sort-id]').forEach(b=>b.disabled=true);const s=document.getElementById('sortSubmit');if(s)s.disabled=true;
  nextQuestion(750);
}

function renderPlay(){state.screen='play';setInputLocked(false);state.hintStage=0;if(state.mode==='name'&&typeof renderNameQuestion==='function')renderNameQuestion();else if(state.mode==='pair'&&typeof renderPairBoard==='function')renderPairBoard();else if(state.mode==='compare'&&typeof renderCompareQuestion==='function')renderCompareQuestion();else if(state.mode==='map'&&typeof renderMapQuestion==='function')renderMapQuestion();else if(state.mode==='sort'&&typeof renderSortQuestion==='function')renderSortQuestion();else root.innerHTML=playShell(`<h2 class="question-title">準備中です</h2>`);const b=document.getElementById('playBack');if(b)b.onclick=()=>renderDifficulty(state.mode);}
function showFeedback({correct,text}){const el=document.getElementById('flagFeedback');if(!el)return;el.className='feedback '+(correct?'correct':'try');el.textContent=text;}
function nextQuestion(delay=550){setInputLocked(true);clearInactivity();setTimeout(()=>{state.questionIndex++;if(state.questionIndex>=10)renderResult();else renderPlay();},delay);}
function renderResult(){clearInactivity();state.screen='result';const countText=state.mode==='pair'?`6ペア そろったね！`:`${state.correctCount} / 10`;root.innerHTML=`<section class="flag-screen"><div class="result-card"><div style="font-size:52px">🌟</div><h1>おつかれさま！</h1><p>さいごまでできたね！</p><div class="big">${countText}</div><div class="result-meta"><span>${MODE_LABEL[state.mode]}</span><span>${LEVEL_LABEL[state.level]}</span><span>ヒント ${state.hintCount}回</span></div><div class="reference-list"><div>👀 よく見て選べた</div><div>🧠 覚えて答えられた</div><div>🌱 最後まで取り組めた</div></div><div class="play-actions"><button id="retryBtn" class="flag-action action-primary">もう1回</button><button id="flagTopBtn" class="flag-action action-secondary">国旗ゲームTOP</button><a class="flag-action action-secondary" style="text-decoration:none" href="index.html#allGames">全ゲームTOP</a></div><div class="source-panel"><strong>データについて</strong><br>人口は比較学習用の参考値で、最新人口ではありません。${sources.population?.note||''}<br>出典: ${sources.population?.name||''} / ${sources.area?.name||''}</div></div></section>`;document.getElementById('retryBtn').onclick=()=>startMode(state.mode,state.level);document.getElementById('flagTopBtn').onclick=renderHome;}
function toggleSound(){state.soundOn=!state.soundOn;const b=document.getElementById('soundToggle');if(b){b.setAttribute('aria-pressed',String(state.soundOn));b.textContent=state.soundOn?'🔊 おと ON':'🔇 おと OFF';}}
const soundBtn=document.getElementById('soundToggle');if(soundBtn)soundBtn.addEventListener('click',toggleSound);
window.NIJI_FLAG_APP={state,renderHome,renderDifficulty,startMode,renderResult,setInputLocked,showFeedback,toggleSound};
renderHome();
})();
