(()=>{
'use strict';
const $=s=>document.querySelector(s), stage=$('#stage'), actions=$('#actions'), statusEl=$('#status');
const params=new URLSearchParams(location.search), id=params.get('game')||'tensec';
const meta=(window.NIJI_GAMES||[]).find(g=>g.id===id)||(window.NIJI_GAMES||[])[0];
$('#title').textContent=meta?.title||'ゲーム'; $('#desc').textContent=meta?.desc||''; $('#cat').textContent=meta?.cat||''; document.title=(meta?.title||'ゲーム')+'｜にじフラ チャレンジ'; $('#heroIcon').textContent=meta?.icon||'🎮';
const prof=meta?.profile||{}; const mt=$('#metaTags'); if(mt) mt.innerHTML=[
  `<span class="game-meta-pill">⏱ ${prof.minutes||'3〜5分'}</span>`,
  `<span class="game-meta-pill">🎯 ${prof.age||'目安なし'}</span>`,
  `<span class="game-meta-pill">むずかしさ ${'●'.repeat(prof.difficulty||2)}${'○'.repeat(3-(prof.difficulty||2))}</span>`,
  `<span class="game-meta-pill aim">ねらい：${prof.aim||meta?.tags?.join('・')||'見る・考える'}</span>`
].join('');
const FAV_KEY='nijifla_favorites_v24',RECENT_KEY='nijifla_recent_v24';
const readArr=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
const writeArr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let favs=new Set(readArr(FAV_KEY)); const favBtn=$('#favGameBtn');
function paintFav(){if(!favBtn)return;const on=favs.has(id);favBtn.classList.toggle('active',on);favBtn.setAttribute('aria-label',on?'お気に入りから外す':'お気に入りに追加');favBtn.title=on?'お気に入りから外す':'お気に入りに追加'}
if(favBtn){favBtn.onclick=()=>{if(favs.has(id))favs.delete(id);else favs.add(id);writeArr(FAV_KEY,[...favs]);paintFav()};paintFav()}
function markRecent(){let list=readArr(RECENT_KEY).filter(x=>x!==id);list.unshift(id);writeArr(RECENT_KEY,list.slice(0,8))}
markRecent();
let cleanup=()=>{}, running=false, startedAt=0, lastResult=null;
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function fixedDeck(gameId,count){
 const bank=window.NIJI_TKK_FIXED_BANKS?.[gameId]||[];
 if(!bank.length)throw new Error(`問題バンクを読み込めません: ${gameId}`);
 const byId=new Map(bank.map(q=>[String(q.id),q]));
 let ids;
 try{
   const bag=window.NIJI_QUESTION_BAG_RUNTIME.createQuestionBag({storage:localStorage,gameId,difficulty:'all',bankVersion:window.NIJI_QUESTION_BANK_VERSION||'v1',ids:[...byId.keys()]});
   ids=bag.draw(count);
 }catch{ ids=shuffle([...byId.keys()]).slice(0,count); }
 return ids.map(x=>byId.get(String(x))).filter(Boolean);
}
function generatedDeck(gameId,count){
 const gen=window.NIJI_TKK_GENERATORS;
 if(!gen)throw new Error(`問題生成器を読み込めません: ${gameId}`);
 const keys=gen.listProblemKeys(gameId).map(String);let drawn;
 try{
   const bag=window.NIJI_QUESTION_BAG_RUNTIME.createQuestionBag({storage:localStorage,gameId:`generated:${gameId}`,difficulty:'all',bankVersion:(window.NIJI_QUESTION_BANK_VERSION||'v1')+'-generated-v1',ids:keys});
   drawn=bag.draw(count);
 }catch{drawn=shuffle(keys).slice(0,count)}
 return drawn.map(key=>gen.makeProblem(gameId,String(key)));
}
function runFixedChoice(gameId,count,goodText,badText,passRate=.8){
 const deck=fixedDeck(gameId,count);let n=0,score=0;
 function draw(){const q=deck[n],opts=shuffle(q.choices||[]);stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="choice-grid">${opts.map(o=>`<button class="choice-btn" data-a="${String(o).replace(/"/g,'&quot;')}">${o}</button>`).join('')}</div><div id="guide" class="subprompt"></div>`;setStatus(`${n+1}/${deck.length}　せいかい ${score}`);stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const ok=b.dataset.a===String(q.answer);if(ok)score++;$('#guide').textContent=ok?'○ せいかい！':`答え：${q.answer}`;n++;if(n>=deck.length)return setTimeout(()=>finish(`${score}/${deck.length}`,score>=Math.ceil(deck.length*passRate)?goodText:badText,score>=Math.ceil(deck.length*passRate)),260);setTimeout(draw,300)})}
 draw();
}
const setStatus=t=>statusEl.textContent=t;
const btn=(text,cls='secondary')=>`<button class="${cls}">${text}</button>`;
function clearRun(){try{cleanup()}catch{} cleanup=()=>{}; running=false}
function celebrate(){const c=$('#confetti');c.innerHTML='';c.classList.remove('hidden');for(let i=0;i<55;i++){const e=document.createElement('i');e.style.left=Math.random()*100+'%';e.style.setProperty('--h',Math.floor(Math.random()*360));e.style.animationDelay=(Math.random()*.45)+'s';c.appendChild(e)}setTimeout(()=>c.classList.add('hidden'),1900)}
function finish(title,detail='',good=true){clearRun();document.body.classList.remove('is-playing');document.body.classList.add('is-finished');setStatus('終了');const success=typeof good==='boolean'?good:null;const durationSec=startedAt?Math.round((performance.now()-startedAt)/1000):null;if(window.NIJI_RESULT){lastResult=NIJI_RESULT.save({title:meta?.title||'ゲーム',category:meta?.cat||'',score:title,detail,success,durationSec,type:(meta?.cat==='SST'?'sst':'game'),source:'tkk_games.html?game='+id});}const resultClass=success===true?'good-text':success===false?'bad-text':'';const icon=success===false?'↻':'✓';stage.innerHTML=`<div class="game-result-wrap"><div class="result-icon">${icon}</div><div class="result-box"><div class="subprompt">おわり</div><div class="result-big ${resultClass}">${title}</div><div>${detail}</div><div class="subprompt" style="margin-top:10px">点数だけでなく、取り組み方も記録できます。</div></div></div>`;actions.innerHTML=`${btn('結果・評価を印刷','secondary')}${btn('もう1回','primary')}${btn('ゲーム一覧へ','secondary')}`;actions.children[0].onclick=()=>{if(lastResult)location.href=NIJI_RESULT.reportUrl(lastResult)};actions.children[1].onclick=()=>{if(confirm('周りにやりたい友達がいないか確認してね')) reset()};actions.children[2].onclick=()=>location.href='index.html#allGames';if(success===true)celebrate()}
function reset(){clearRun();document.body.classList.remove('is-playing','is-finished');setStatus('準備OK');stage.innerHTML=`<div class="game-ready"><div class="ready-icon">${meta.icon}</div><div class="ready-label">このゲームでやること</div><div class="ready-title">${meta.title}</div><div class="ready-desc">${meta.desc||'画面をよく見て取り組みます。'}</div><div class="ready-profile"><span>⏱ ${prof.minutes||'3〜5分'}</span><span>🎯 ${prof.age||'目安なし'}</span><span>むずかしさ ${'●'.repeat(prof.difficulty||2)}${'○'.repeat(3-(prof.difficulty||2))}</span></div><div class="ready-aim"><b>ねらい</b><span>${prof.aim||meta?.tags?.join('・')||'見る・考える'}</span></div><div class="ready-hint">わからないときは、ゆっくり確認してOK</div></div>`;actions.innerHTML=btn('スタート','primary');actions.firstElementChild.onclick=start}
function start(){clearRun();document.body.classList.remove('is-finished');document.body.classList.add('is-playing');running=true;startedAt=performance.now();lastResult=null;actions.innerHTML='';setStatus('プレイ中');(games[id]||games.tensec)()}
$('#startBtn').onclick=start;

const games={};

games.tensec=()=>{
 let started=performance.now(); stage.innerHTML=`<div class="center col text-center" style="height:100%"><div class="big-emoji">⏱️</div><div class="prompt">10びょうだと思ったらストップ！</div><p class="subprompt">時計は表示しません。心の中で数えてみよう。</p><button id="stop" class="primary" style="font-size:28px;padding:18px 34px">ストップ</button></div>`;
 $('#stop').onclick=()=>{const sec=(performance.now()-started)/1000,d=Math.abs(10-sec),grade=d<=.05?'ぴったり！':d<=.5?'すごい！':d<=1.2?'おしい！':'もう一度挑戦';finish(sec.toFixed(2)+'秒',`${grade}　10.00秒との差：${d.toFixed(2)}秒`,d<=1.2)};
};

games.directions=()=>{
 const names={up:'うえ',down:'した',left:'ひだり',right:'みぎ'},keys=Object.keys(names);let n=0,score=0,target=pick(keys);
 stage.innerHTML=`<div class="prompt" id="p"></div><div class="direction-pad"><button class="dir up" data-d="up">↑</button><button class="dir left" data-d="left">←</button><button class="dir right" data-d="right">→</button><button class="dir down" data-d="down">↓</button></div><div class="subprompt" id="fb">10もんチャレンジ</div>`;
 const next=()=>{target=pick(keys);$('#p').textContent=`「${names[target]}」をタップ！`;setStatus(`${n+1}/10　せいかい ${score}`)};next();
 stage.querySelectorAll('.dir').forEach(b=>b.onclick=()=>{if(b.dataset.d===target){score++;$('#fb').textContent='○ せいかい！'}else $('#fb').textContent=`△ ${names[target]} だったよ`;n++;if(n>=10)return finish(`${score}/10`,score>=8?'方向をしっかり見分けられました':'ゆっくり確認しながらもう一度',score>=8);setTimeout(next,250)});
};

games.janken=()=>{
 stage.innerHTML=`<div class="prompt">どっちで あそぶ？</div><div class="choice-grid"><button class="choice-btn" data-m="learn">📖 がくしゅう<br><span class="small">相手を見て勝つ手を選ぶ</span></button><button class="choice-btn" data-m="battle">⚔️ しょうぶ<br><span class="small">同時に出して勝負</span></button></div>`;
 stage.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>run(b.dataset.m));
 function run(mode){const hands=[['rock','✊','グー'],['scissors','✌️','チョキ'],['paper','✋','パー']],beats={rock:'scissors',scissors:'paper',paper:'rock'};let round=0,score=0,opp=pick(hands);const draw=()=>{opp=pick(hands);stage.innerHTML=`<div class="text-center"><div class="subprompt">あいて</div><div class="big-emoji">${opp[1]}</div><div class="prompt">${mode==='learn'?'勝つ手をえらぼう！':'自分の手をえらぼう！'}</div><div class="rps-grid">${hands.map(h=>`<button class="rps" data-h="${h[0]}">${h[1]}<span>${h[2]}</span></button>`).join('')}</div><div id="fb" class="subprompt"></div></div>`;setStatus(`${round+1}/10　ポイント ${score}`);stage.querySelectorAll('.rps').forEach(b=>b.onclick=()=>answer(b.dataset.h))};
 function answer(me){let ok;if(mode==='learn')ok=beats[me]===opp[0];else ok=beats[me]===opp[0]?true:me===opp[0]?null:false;if(ok===true){score++;$('#fb').textContent='○ かった！'}else if(ok===null)$('#fb').textContent='△ あいこ';else $('#fb').textContent=mode==='learn'?'もう一度ルールを確認しよう':'まけ';round++;if(round>=10)return setTimeout(()=>finish(`${score}ポイント`,mode==='learn'?(score>=8?'勝つ手をよく理解できました':'3つの関係をもう一度練習'): '10回しょうぶしました',mode==='learn'?score>=8:true),320);setTimeout(draw,320)}draw()}
};

games.colorquiz=()=>{
 const deck=fixedDeck('colorquiz',10);let n=0,score=0;
 function draw(){const q=deck[n];stage.innerHTML=`<div class="center col"><div style="width:150px;height:150px;border-radius:28px;background:${q.payload.swatch};box-shadow:0 8px 20px #0002"></div><div class="prompt">${q.prompt}</div><div class="choice-grid">${shuffle(q.choices).map(o=>`<button class="choice-btn" data-a="${o}">${o}</button>`).join('')}</div></div>`;setStatus(`${n+1}/10　せいかい ${score}`);stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const ok=b.dataset.a===q.answer;if(ok)score++;b.classList.add(ok?'good':'bad');n++;if(n>=deck.length)return setTimeout(()=>finish(`${score}/10`,score>=8?'色の名前をよく覚えています':'色と名前をゆっくり結びつけよう',score>=8),250);setTimeout(draw,260)})}draw();
};

games.stick=()=>{
 let y=-160,last=performance.now(),speed=150,raf;stage.innerHTML=`<div class="drop-zone" id="dz"><div class="stick" id="stick"></div><div class="catch-line"></div><button class="catch-area" id="catch" style="border:0;background:transparent">🤲</button></div><div class="subprompt">落ちてきた棒を手の近くでタップ！</div>`;const s=$('#stick'),zone=$('#dz');
 function loop(t){const dt=(t-last)/1000;last=t;y+=speed*dt;s.style.top=y+'px';if(y>zone.clientHeight-40)return finish('キャッチ失敗', '棒が下まで落ちました',false);raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop);cleanup=()=>cancelAnimationFrame(raf);
 const catchIt=()=>{const target=zone.clientHeight-210,d=Math.abs(y-target);const pts=Math.max(0,100-Math.round(d/2));finish(`${pts}点`,d<35?'ナイスキャッチ！':d<80?'おしい！':'もう少し手元まで待ってみよう',pts>=60)};s.onclick=catchIt;$('#catch').onclick=catchIt;
};

function genMaze(n){const W=n,H=n,grid=Array.from({length:H},()=>Array.from({length:W},()=>1));function carve(x,y){grid[y][x]=0;for(const [dx,dy] of shuffle([[2,0],[-2,0],[0,2],[0,-2]])){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<W-1&&ny<H-1&&grid[ny][nx]){grid[y+dy/2][x+dx/2]=0;carve(nx,ny)}}}carve(1,1);grid[H-2][W-2]=0;return grid}
games.maze=()=>{
 let level=1; const run=()=>{const n=Math.min(9+2*Math.floor((level-1)/3),17),g=genMaze(n);let x=1,y=1;const draw=()=>{stage.innerHTML=`<div class="prompt">レベル ${level}</div><div class="maze" id="mz" style="grid-template-columns:repeat(${n},1fr)">${g.flatMap((r,yy)=>r.map((v,xx)=>`<div class="cell ${v?'wall':''} ${xx===x&&yy===y?'player':''} ${xx===n-2&&yy===n-2?'goal':''}"></div>`)).join('')}</div><div class="direction-pad" style="grid-template-columns:repeat(3,58px);grid-template-rows:repeat(3,58px)"><button class="dir up" data-d="0,-1">↑</button><button class="dir left" data-d="-1,0">←</button><button class="dir right" data-d="1,0">→</button><button class="dir down" data-d="0,1">↓</button></div>`;setStatus(`レベル ${level}/15`);stage.querySelectorAll('.dir').forEach(b=>b.onclick=()=>{const [dx,dy]=b.dataset.d.split(',').map(Number),nx=x+dx,ny=y+dy;if(g[ny]?.[nx]===0){x=nx;y=ny;if(x===n-2&&y===n-2){level++;if(level>15)return finish('15レベル クリア！','最後まで迷路を進みました',true);return setTimeout(run,180)}draw()}})};draw()};run();
};

games.bottle=()=>{
 let level=1,phase=0,dir=1,timer;const draw=()=>{const w=Math.max(70,310-level*14);stage.innerHTML=`<div class="bottle-scene"><div class="platform" style="width:${w}px"></div><div class="bottle" id="bot">🧴</div></div><div class="prompt">タイミングを見てフリップ！</div><div style="max-width:520px;height:18px;background:#e8edf4;border-radius:9px;margin:auto;position:relative"><div id="meter" style="position:absolute;left:0;top:0;width:18px;height:18px;border-radius:50%;background:#4f7cf7"></div></div><div class="play-actions"><button id="flip" class="primary">フリップ！</button></div>`;setStatus(`LEVEL ${level}`);const m=$('#meter');timer=setInterval(()=>{phase+=dir*2;if(phase>=100){phase=100;dir=-1}if(phase<=0){phase=0;dir=1}m.style.left=`calc(${phase}% - 9px)`},20);cleanup=()=>clearInterval(timer);$('#flip').onclick=()=>{clearInterval(timer);const success=Math.abs(phase-50)<Math.max(9,28-level);const bot=$('#bot');bot.classList.add('flip');setTimeout(()=>{if(success){level++;if(level>15)return finish('LEVEL 15 クリア！','すごい！最高レベルまで成功しました',true);draw()}else finish(`LEVEL ${level} で失敗`,'真ん中に近いタイミングでフリップすると成功しやすいよ',false)},900)}};draw();
};

games.slide15=()=>{
 let arr=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0],moves=0;for(let k=0;k<160;k++){const z=arr.indexOf(0),r=Math.floor(z/4),c=z%4,ns=[];[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{if(rr>=0&&rr<4&&cc>=0&&cc<4)ns.push(rr*4+cc)});const j=pick(ns);[arr[z],arr[j]]=[arr[j],arr[z]]}
 const draw=()=>{stage.innerHTML=`<div class="prompt">1〜15を順番にそろえよう</div><div class="puzzle">${arr.map((v,i)=>`<button data-i="${i}" class="${v===0?'blank':''}">${v||''}</button>`).join('')}</div><div class="subprompt">うごかした回数：${moves}</div>`;stage.querySelectorAll('.puzzle button:not(.blank)').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,z=arr.indexOf(0),ri=Math.floor(i/4),ci=i%4,rz=Math.floor(z/4),cz=z%4;if(Math.abs(ri-rz)+Math.abs(ci-cz)===1){[arr[i],arr[z]]=[arr[z],arr[i]];moves++;if(arr.every((v,i)=>v===(i<15?i+1:0)))return finish('クリア！',`${moves}回で完成しました`,true);draw()}})};draw();
};

games.girigiri=()=>{
 let x=2,dir=1,last=performance.now(),raf,stopped=false;stage.innerHTML=`<div class="prompt">赤い線のギリギリ手前で止めよう</div><div class="stop-track"><div class="goal-mark"></div><div class="stop-dot" id="dot"></div></div><div class="play-actions"><button id="stop" class="primary" style="font-size:24px">ストップ！</button></div>`;const dot=$('#dot');function loop(t){const dt=(t-last)/1000;last=t;x+=dir*34*dt;if(x>=98){x=98;dir=-1}if(x<=2){x=2;dir=1}dot.style.left=x+'%';raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop);cleanup=()=>cancelAnimationFrame(raf);$('#stop').onclick=()=>{if(stopped)return;stopped=true;cancelAnimationFrame(raf);const d=Math.abs(90-x),score=Math.max(0,100-Math.round(d*7));finish(`${score}点`,x>90?'線をこえました':d<1.5?'ギリギリ！':d<5?'かなり近い！':'もう少し赤線に近づけよう',score>=70)};
};

games.bomb=()=>{
 let score=0,miss=0,left=20,spawn,tick;stage.innerHTML=`<div class="shooter" id="shoot"><div class="reticle">🛡️</div></div><div class="subprompt">落ちてくるターゲットをタップ！</div>`;const sh=$('#shoot');function make(){const e=document.createElement('button');e.className='bomb';e.textContent='🎈';e.style.left=rand(2,90)+'%';e.style.top='-50px';e.style.border='0';e.style.background='transparent';sh.appendChild(e);let y=-50;const iv=setInterval(()=>{y+=5;e.style.top=y+'px';if(y>sh.clientHeight-45){clearInterval(iv);e.remove();miss++}},40);e.onclick=()=>{clearInterval(iv);score++;e.textContent='✨';setTimeout(()=>e.remove(),120)}}spawn=setInterval(make,520);tick=setInterval(()=>{left--;setStatus(`のこり ${left}秒　HIT ${score}`);if(left<=0){clearInterval(spawn);clearInterval(tick);finish(`${score} HIT`,`見逃し ${miss} 個`,score>=15)}},1000);cleanup=()=>{clearInterval(spawn);clearInterval(tick)};make();
};

games.bugfind=()=>{
 let round=0;const targets=['🐞','🦋','🐝','🪲','🐜'];function draw(){const target=pick(targets);stage.innerHTML=`<div class="prompt">「${target}」をさがしてタップ！</div><div class="search-field" id="field"></div>`;const f=$('#field');for(let i=0;i<28;i++){const e=document.createElement(i===0?'button':'span');e.className=i===0?'bug':'distractor';e.textContent=i===0?target:pick(['🍂','🌿','🪨','🌼','◼️','🔸',...targets.filter(x=>x!==target)]);e.style.left=rand(2,91)+'%';e.style.top=rand(4,86)+'%';if(i===0)e.onclick=()=>{round++;if(round>=8)return finish('8/8 見つけた！','選択注意と探索のトレーニング完了',true);draw()};f.appendChild(e)}setStatus(`${round+1}/8`)}draw();
};

games.bugcatch=()=>{
 let score=0,left=20,tick,move;stage.innerHTML=`<div class="prompt">うごく虫をタップ！</div><div class="search-field" id="field"><button id="bug" class="bug" style="font-size:50px">🦋</button></div>`;const f=$('#field'),b=$('#bug');const reposition=()=>{b.style.left=rand(3,86)+'%';b.style.top=rand(4,78)+'%';b.textContent=pick(['🦋','🐞','🐝'])};reposition();move=setInterval(reposition,650);b.onclick=()=>{score++;reposition()};tick=setInterval(()=>{left--;setStatus(`のこり ${left}秒　${score}匹`);if(left<=0){clearInterval(tick);clearInterval(move);finish(`${score}匹`,score>=18?'よく目で追えました':'動きをゆっくり追ってみよう',score>=18)}},1000);cleanup=()=>{clearInterval(tick);clearInterval(move)};
};

function orderedTap(max){let next=1,startT=performance.now();const nums=shuffle(Array.from({length:max},(_,i)=>i+1));stage.innerHTML=`<div class="prompt">1から順番にタップ！</div><div class="number-grid" style="${max>20?'grid-template-columns:repeat(10,1fr);max-width:820px':''}">${nums.map(n=>`<button class="num-tile" data-n="${n}" style="${max>20?'font-size:15px':''}">${n}</button>`).join('')}</div><div id="guide" class="subprompt">つぎは ${next}</div>`;stage.querySelectorAll('.num-tile').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(n!==next){b.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'none'}],{duration:150});return}b.classList.add('done');next++;$('#guide').textContent=next<=max?`つぎは ${next}`:'できた！';if(next>max){const sec=(performance.now()-startT)/1000;finish(`${sec.toFixed(1)}秒`,`${max}まで順番にタップできました`,true)}})}
games.tap10=()=>orderedTap(10);games.tap50=()=>orderedTap(50);

games.make10=()=>{
 const problem=generatedDeck('make10',1)[0];let score=0,sel=null,nums=problem.payload.board.slice(),remain=nums.length/2;
 const draw=()=>{stage.innerHTML=`<div class="prompt">${problem.prompt}</div><div class="block-board">${nums.map((n,i)=>`<button class="block ${n===null?'hidden':''} ${sel===i?'selected':''}" data-i="${i}">${n??''}</button>`).join('')}</div><div class="subprompt">のこりペア ${remain}　スコア ${score}</div>`;stage.querySelectorAll('.block:not(.hidden)').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(sel===null){sel=i;draw()}else{if(sel===i){sel=null;return draw()}const ok=nums[sel]+nums[i]===10;if(ok){nums[sel]=null;nums[i]=null;score+=100;remain--}else score=Math.max(0,score-20);sel=null;if(remain<=0)return finish(`${score}点`,'10になるペアを全部見つけました',true);draw()}})};draw();
};

games.make10drop=()=>{
 const problem=generatedDeck('make10drop',1)[0];let score=0,sel=null,moves=0,nums=problem.payload.board.slice();
 const draw=()=>{stage.innerHTML=`<div class="prompt">${problem.prompt}</div><div class="block-board">${nums.map((n,i)=>`<button class="block ${sel===i?'selected':''}" data-i="${i}">${n}</button>`).join('')}</div><div class="subprompt">スコア ${score}　${moves}/20</div>`;stage.querySelectorAll('.block').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(sel===null){sel=i;return draw()}const a=sel,adj=(Math.abs(a-i)===1&&Math.floor(a/6)===Math.floor(i/6))||Math.abs(a-i)===6;if(adj&&nums[a]+nums[i]===10){score+=100;const refill=1+((moves*3+a+i)%9);nums[a]=refill;nums[i]=10-refill}else score=Math.max(0,score-10);sel=null;moves++;if(moves>=20)return finish(`${score}点`,'20回チャレンジしました',score>=700);draw()})};draw();
};

games.multblock=()=>{
 const problem=generatedDeck('multblock',1)[0],qs=problem.payload.pairs;let cards=shuffle(qs.flatMap((q,i)=>[{t:q.expr,k:i},{t:String(q.answer),k:i}])),open=[],pairs=0;
 const draw=()=>{stage.innerHTML=`<div class="prompt">${problem.prompt}</div><div class="memory-grid">${cards.map((c,i)=>`<button class="memory-card ${c.done?'done':''} ${open.includes(i)?'open':''}" data-i="${i}">${(c.done||open.includes(i))?c.t:'?'}</button>`).join('')}</div><div class="subprompt">${pairs}/12 ペア</div>`;stage.querySelectorAll('.memory-card:not(.done)').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(open.includes(i)||open.length>=2)return;open.push(i);draw();if(open.length===2){const [a,b]=open;if(cards[a].k===cards[b].k){cards[a].done=cards[b].done=true;pairs++;open=[];if(pairs===12)return setTimeout(()=>finish('全ペア クリア！','九九の式と答えをそろえました',true),220);setTimeout(draw,220)}else setTimeout(()=>{open=[];draw()},550)}})};draw();
};

games.primeblock=()=>{
 const problem=generatedDeck('primeblock',1)[0],nums=problem.payload.numbers.slice(),primeSet=new Set(problem.answer),targets=problem.answer.length;let found=0,wrong=0;
 stage.innerHTML=`<div class="prompt">${problem.prompt}</div><div class="number-grid" style="grid-template-columns:repeat(6,1fr)">${nums.map((n,i)=>`<button class="num-tile" data-i="${i}">${n}</button>`).join('')}</div><div id="guide" class="subprompt">素数は ${targets}こ</div>`;stage.querySelectorAll('.num-tile').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,n=nums[i];if(primeSet.has(n)){if(b.classList.contains('done'))return;b.classList.add('done');found++;}else{wrong++;b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),220)}$('#guide').textContent=`みつけた ${found}/${targets}　まちがい ${wrong}`;if(found===targets)finish('全部みつけた！',`まちがい ${wrong}回`,wrong<=3)});
};

games.numorder=()=>orderedTap(100);

games.shapequiz=()=>{
 const deck=fixedDeck('shapequiz',10);let n=0,score=0;
 function draw(){const q=deck[n],rot=q.payload?.rotation||0,sym=q.payload?.symbol||'◇';stage.innerHTML=`<div class="center col"><div style="font-size:150px;line-height:1;transform:rotate(${rot}deg)">${sym}</div><div class="prompt">${q.prompt}</div><div class="choice-grid">${shuffle(q.choices).map(o=>`<button class="choice-btn" data-a="${o}">${o}</button>`).join('')}</div><div id="guide" class="subprompt"></div></div>`;setStatus(`${n+1}/10　せいかい ${score}`);stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const ok=b.dataset.a===q.answer;if(ok)score++;$('#guide').textContent=ok?'○ せいかい！':`答え：${q.answer}`;n++;if(n>=deck.length)return setTimeout(()=>finish(`${score}/10`,score>=8?'図形の特徴をよく見分けられました':'形・辺・角をゆっくり確認しよう',score>=8),250);setTimeout(draw,280)})}draw();
};

function selectAllGame(kind,deck){let round=0,score=0;function make(){const q=deck[round],correct=new Set(q.answer.map(Number)),uniq=q.choices.map(Number).sort((x,y)=>x-y);let chosen=new Set();stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="number-grid" style="grid-template-columns:repeat(4,1fr)">${uniq.map(n=>`<button class="num-tile" data-n="${n}">${n}</button>`).join('')}</div><div class="play-actions"><button id="check" class="primary">こたえあわせ</button></div><div id="guide" class="subprompt"></div>`;stage.querySelectorAll('.num-tile').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(chosen.has(n)){chosen.delete(n);b.classList.remove('selected');b.style.background=''}else{chosen.add(n);b.classList.add('selected');b.style.background='#eef3ff'}});$('#check').onclick=()=>{const ok=correct.size===chosen.size&&[...correct].every(n=>chosen.has(n));if(ok)score++;$('#guide').textContent=ok?'○ せいかい！':`答え：${[...correct].join('、')}`;round++;if(round>=deck.length)return setTimeout(()=>finish(`${score}/${deck.length}`,score>=Math.ceil(deck.length*.8)?'よく見つけられました':'倍数・約数の関係をもう一度確認',score>=Math.ceil(deck.length*.8)),350);setTimeout(make,500)}}make()}
games.divisor=()=>selectAllGame('divisor',generatedDeck('divisor',5));games.commondiv=()=>selectAllGame('commondiv',generatedDeck('commondiv',5));games.commonmult=()=>selectAllGame('commonmult',generatedDeck('commonmult',5));

games.calcmaze=()=>{
 const problem=generatedDeck('calcmaze',1)[0],steps=problem.payload.steps;let step=0,score=0;function draw(){const q=steps[step],opts=shuffle(q.choices);stage.innerHTML=`<div class="prompt">${q.a} ${q.op} ${q.b} = ?</div><div style="display:flex;gap:8px;justify-content:center;align-items:center;margin:18px 0">${Array.from({length:10},(_,i)=>`<span style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:${i<step?'#c9f4d9':i===step?'#ffe49b':'#e8edf4'}">${i===9?'🏁':i+1}</span>`).join('')}</div><div class="choice-grid">${opts.map(n=>`<button class="choice-btn" data-a="${n}">${n}</button>`).join('')}</div>`;stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(+b.dataset.a===q.answer){score++;step++;if(step>=steps.length)return finish('ゴール！',`10問中 ${score}問せいかい`,score>=8);draw()}else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),220)}});setStatus(`すすみ ${step}/${steps.length}`)}draw();
};

games.hiramemory=()=>{
 const chars=shuffle(['あ','い','う','え','お','か','き','く','け','こ','さ','し']).slice(0,8);let cards=shuffle(chars.flatMap((c,i)=>[{t:c,k:i},{t:c,k:i}])),open=[],pairs=0;
 function draw(){stage.innerHTML=`<div class="prompt">同じひらがなを2まいそろえよう</div><div class="memory-grid">${cards.map((c,i)=>`<button class="memory-card ${c.done?'done':''} ${open.includes(i)?'open':''}" data-i="${i}">${c.done||open.includes(i)?c.t:'?'}</button>`).join('')}</div><div class="subprompt">${pairs}/${chars.length} ペア</div>`;stage.querySelectorAll('.memory-card:not(.done)').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(open.includes(i)||open.length===2)return;open.push(i);draw();if(open.length===2){const [a,b]=open;if(cards[a].k===cards[b].k){cards[a].done=cards[b].done=true;pairs++;open=[];if(pairs===chars.length)return setTimeout(()=>finish('ぜんぶそろった！','ひらがなの神経衰弱クリア',true),250);setTimeout(draw,220)}else setTimeout(()=>{open=[];draw()},600)}})}draw();
};

function arrangeFromDeck(deck,label){let round=0,score=0;function draw(){const q=deck[round],word=q.payload.word,letters=shuffle([...word]);let answer=[];stage.innerHTML=`<div class="prompt">${q.prompt||`ならべかえて「${label}」を作ろう`}</div><div class="word-slots" id="slots">${[...word].map(()=>'<div class="slot"></div>').join('')}</div><div class="word-bank">${letters.map((c,i)=>`<button class="letter" data-i="${i}">${c}</button>`).join('')}</div><div class="play-actions"><button id="resetWord" class="secondary">もどす</button><button id="checkWord" class="primary">こたえあわせ</button></div><div id="guide" class="subprompt"></div>`;function paint(){stage.querySelectorAll('.slot').forEach((x,i)=>x.textContent=answer[i]||'')};stage.querySelectorAll('.letter').forEach(b=>b.onclick=()=>{if(b.disabled)return;b.disabled=true;b.style.opacity=.25;answer.push(b.textContent);paint()});$('#resetWord').onclick=()=>{answer=[];stage.querySelectorAll('.letter').forEach(b=>{b.disabled=false;b.style.opacity=1});paint()};$('#checkWord').onclick=()=>{const ok=answer.join('')===word;if(ok)score++;$('#guide').textContent=ok?'○ せいかい！':`答え：${word}`;round++;if(round>=deck.length)return setTimeout(()=>finish(`${score}/${deck.length}`,score>=Math.ceil(deck.length*.8)?'よく並べられました':'文字の順番をゆっくり見よう',score>=Math.ceil(deck.length*.8)),400);setTimeout(draw,500)}}draw()}
games.hiraarrange=()=>arrangeFromDeck(fixedDeck('hiraarrange',5),'ことば');
games.kataarrange=()=>arrangeFromDeck(fixedDeck('kataarrange',5),'ことば');
games.idiomarrange=()=>arrangeFromDeck(fixedDeck('idiomarrange',5),'四字熟語');
function searchFromDeck(deck,kata=false,idiom=false){let round=0;function draw(){const q=deck[round],word=q.payload.word,N=idiom?6:8,chars=idiom?'山川空海日月木火水土人心大小上下左右春夏秋冬白黒赤青':kata?'アイウエオカキクケコサシスタチツテトナニヌネノハヒフヘホマミムメモラリルレロワン':'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもらりるれろわん',grid=Array.from({length:N*N},()=>pick([...chars]));const horiz=Math.random()<.5,row=rand(0,N-1),col=rand(0,N-word.length);for(let i=0;i<word.length;i++)grid[horiz?row*N+col+i:(col+i)*N+row]=word[i];let picked=[];stage.innerHTML=`<div class="prompt">「${word}」をさがそう</div><div class="word-search" style="grid-template-columns:repeat(${N},1fr)">${grid.map((c,i)=>`<button data-i="${i}">${c}</button>`).join('')}</div><div class="play-actions"><button id="checkSel" class="primary">こたえあわせ</button><button id="clearSel" class="secondary">えらびなおす</button></div><div id="guide" class="subprompt">文字を順番にタップ</div>`;stage.querySelectorAll('.word-search button').forEach(b=>b.onclick=()=>{if(picked.includes(+b.dataset.i))return;picked.push(+b.dataset.i);b.classList.add('sel')});$('#clearSel').onclick=()=>{picked=[];stage.querySelectorAll('.word-search button').forEach(b=>b.classList.remove('sel'))};$('#checkSel').onclick=()=>{const str=picked.map(i=>grid[i]).join('');if(str===word){round++;if(round>=deck.length)return finish(`${deck.length}ことば発見！`,'文字の中から言葉を見つけられました',true);draw()}else{$('#guide').textContent='ちがうよ。順番も確認しよう';picked=[];stage.querySelectorAll('.word-search button').forEach(b=>b.classList.remove('sel'))}}}draw()}
games.hirasearch=()=>searchFromDeck(fixedDeck('hirasearch',5),false,false);
games.katasearch=()=>searchFromDeck(fixedDeck('katasearch',5),true,false);


games.story=()=>{
 const data={when:['きょう','あさ','きのうのよる','夏休み','100年後','雨の日'],where:['こうえんで','学校で','宇宙で','スーパーで','海の中で','おうちで'],who:['先生が','ねこが','ぼくが','ロボットが','おばあちゃんが','忍者が'],did:['おどった','カレーを作った','大笑いした','空を飛んだ','かくれんぼした','歌をうたった']};let hist=[];function drawSentence(){const s=[pick(data.when),pick(data.where),pick(data.who),pick(data.did)];stage.innerHTML=`<div class="prompt">カードをタップして文をつくろう</div><div class="choice-grid" style="grid-template-columns:repeat(2,1fr)">${[['⏰ いつ',0],['📍 どこで',1],['🧑 だれが',2],['✨ どうした',3]].map(([lab,i])=>`<button class="choice-btn storyCard" data-i="${i}">${lab}<br><strong>${s[i]}</strong></button>`).join('')}</div><div class="play-actions"><button id="nextStory" class="primary">つぎの文</button><button id="historyStory" class="secondary">れきし</button></div><div id="storyOut" class="result-box">${s.join(' ')}</div>`;stage.querySelectorAll('.storyCard').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,keys=['when','where','who','did'];s[i]=pick(data[keys[i]]);b.querySelector('strong').textContent=s[i];$('#storyOut').textContent=s.join(' ')});$('#nextStory').onclick=()=>{hist.unshift(s.join(' '));if(hist.length>=5)return finish('5つの文ができた！',hist.map((x,i)=>`${i+1}. ${x}`).join('<br>'),true);drawSentence()};$('#historyStory').onclick=()=>alert(hist.length?hist.join('\n'):'まだれきしはありません')};drawSentence();
};

games.continents=()=>runFixedChoice('continents',10,'世界の大陸・海洋をよく確認できました','大陸と海洋をもう一度確認',.8);
games.prefecture=()=>runFixedChoice('prefecture',15,'都道府県の関係をよく確認できました','地図と一緒に確認してみよう',.8);


games.dice=()=>{
 let rolls=0;stage.innerHTML=`<div class="prompt">サイコロをふろう</div><div class="center row gap12 wrap" id="diceOut" style="font-size:72px"></div><div class="center row gap12 wrap"><label>こすう <select id="diceCount">${Array.from({length:9},(_,i)=>`<option>${i+1}</option>`).join('')}</select></label><button id="roll" class="primary">ふる</button><button id="recordDice" class="secondary">結果・評価を記録</button></div>`;const faces=['⚀','⚁','⚂','⚃','⚄','⚅'];$('#roll').onclick=()=>{rolls++;$('#diceOut').innerHTML=Array.from({length:+$('#diceCount').value},()=>`<span>${pick(faces)}</span>`).join('');setStatus(`サイコロ ${rolls}回`) };$('#recordDice').onclick=()=>finish('活動記録',`サイコロを ${rolls}回ふりました。`,null);$('#roll').click();
};

games.roulette=()=>{
 let spins=0,last='';stage.innerHTML=`<div class="prompt">ルーレット</div><textarea id="items" rows="6" style="width:min(620px,95%);display:block;margin:auto;border:1px solid #dce5f0;border-radius:16px;padding:12px">あか\nあお\nきいろ\nみどり</textarea><div class="play-actions"><button id="spin" class="primary">まわす</button><button id="recordRoulette" class="secondary">結果・評価を記録</button></div><div id="rouletteOut" class="result-box"><div class="result-big">？</div></div>`;let iv;$('#spin').onclick=()=>{const a=$('#items').value.split(/\n|,/).map(x=>x.trim()).filter(Boolean);if(!a.length)return;spins++;let k=0;clearInterval(iv);iv=setInterval(()=>{last=pick(a);$('#rouletteOut .result-big').textContent=last;if(++k>18){clearInterval(iv);setStatus(`抽選 ${spins}回`)}} ,85);cleanup=()=>clearInterval(iv)};$('#recordRoulette').onclick=()=>finish('活動記録',`ルーレットを ${spins}回実施。最後の結果：${last||'未抽選'}。`,null);setStatus('項目を自由に変更できます');
};

games.bingo=()=>{
 let left=Array.from({length:75},(_,i)=>i+1),drawn=[];stage.innerHTML=`<div class="prompt">ビンゴマシン</div><div id="bingoNow" class="result-box"><div class="result-big">-</div></div><div class="bingo" id="bingoGrid">${left.map(n=>`<div data-n="${n}">${n}</div>`).join('')}</div><div class="play-actions"><button id="drawBingo" class="primary">抽選</button><button id="resetBingo" class="secondary">リセット</button><button id="recordBingo" class="secondary">結果・評価を記録</button></div>`;$('#drawBingo').onclick=()=>{if(!left.length)return;const n=pick(left);left=left.filter(x=>x!==n);drawn.push(n);$('#bingoNow .result-big').textContent=n;stage.querySelector(`[data-n="${n}"]`).classList.add('hit');setStatus(`抽選済み ${drawn.length}/75`)};$('#resetBingo').onclick=()=>{if(confirm('ビンゴをリセットしますか？'))games.bingo()};$('#recordBingo').onclick=()=>finish('活動記録',`ビンゴ抽選を ${drawn.length}回実施。${drawn.length?'抽選番号：'+drawn.join('、'):'まだ抽選していません。'}`,null);
};

games.dicetalk=()=>{
 let turns=0,last='';stage.innerHTML=`<div class="prompt">サイコロをふって話してみよう</div><div class="result-box"><div class="result-big" id="talkNum">🎲</div><div id="talkQ">ボタンを押してね</div></div><div class="play-actions"><button id="rollTalk" class="primary">ふる</button><button id="recordTalk" class="secondary">結果・評価を記録</button></div>`;$('#rollTalk').onclick=()=>{const q=fixedDeck('dicetalk',1)[0],n=rand(1,6);turns++;last=q.prompt;$('#talkNum').textContent=n;$('#talkQ').textContent=q.prompt;setStatus(`会話 ${turns}回`)};$('#recordTalk').onclick=()=>finish('活動記録',`サイコロトークを ${turns}回実施。最後のテーマ：${last||'未実施'}。`,null);
};
games.traffic=()=>runFixedChoice('traffic',10,'安全な行動をよく考えられました','止まる・見る・待つを確認しよう',.8);
games.words=()=>runFixedChoice('words',10,'相手と自分を大切にする伝え方を考えられました','短く具体的な伝え方を確認しよう',.8);


games.dayword=()=>{
 const deck=generatedDeck('dayword',10);let n=0,score=0;function draw(){const q=deck[n],opts=shuffle(q.choices);stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="choice-grid">${opts.map(o=>`<button class="choice-btn" data-a="${o}">${o}</button>`).join('')}</div>`;stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(b.dataset.a===String(q.answer))score++;n++;if(n>=deck.length)return finish(`${score}/${deck.length}`,score>=8?'日付の前後関係を理解できました':'カレンダーで前後を確認してみよう',score>=8);draw()})}draw();
};

games.shopping=()=>{
 const deck=generatedDeck('shopping',8),coins=[500,100,50,10,5,1];let round=0,score=0,total=0;function draw(){const q=deck[round],price=q.payload.price;total=0;stage.innerHTML=`<div class="big-emoji text-center">🛒</div><div class="prompt">${q.prompt}</div><div class="shop-coins">${coins.map(v=>`<button class="coin ${v===500?'yen500':''} ${v===10?'yen10':''}" data-v="${v}">${v}</button>`).join('')}</div><div class="result-box">いま <strong id="sum">0</strong>円</div><div class="play-actions"><button id="pay" class="primary">はらう</button><button id="clearPay" class="secondary">0円にもどす</button></div>`;stage.querySelectorAll('.coin').forEach(b=>b.onclick=()=>{total+=+b.dataset.v;$('#sum').textContent=total});$('#clearPay').onclick=()=>{total=0;$('#sum').textContent=0};$('#pay').onclick=()=>{if(total===price)score++;round++;if(round>=deck.length)return finish(`${score}/${deck.length}`,score>=6?'お金を上手に組み合わせられました':'少ない枚数から考えてみよう',score>=6);draw()}}draw();
};

games.stamp=()=>{
 let count=0;stage.innerHTML=`<div class="prompt">すきなところをタップ！</div><div class="stamp-field" id="stampField"></div><div class="subprompt">タップするたび肉球が増えます</div><div class="play-actions"><button id="clearStamp" class="secondary">ぜんぶけす</button><button id="recordStamp" class="secondary">結果・評価を記録</button></div>`;const f=$('#stampField');f.onclick=e=>{if(e.target!==f)return;count++;const r=f.getBoundingClientRect(),p=document.createElement('span');p.className='paw';p.textContent=pick(['🐾','🐾','🐾','🌟']);p.style.left=e.clientX-r.left-20+'px';p.style.top=e.clientY-r.top-20+'px';p.style.transform=`rotate(${rand(-35,35)}deg)`;f.appendChild(p);setStatus(`スタンプ ${count}こ`)};$('#clearStamp').onclick=()=>{f.innerHTML='';count=0;setStatus('スタンプ 0こ')};$('#recordStamp').onclick=()=>finish('活動記録',`スタンプを ${count}こ置きました。`,null);setStatus('自由に遊べます');
};

games.shapeDrop=()=>{
 let count=0;stage.innerHTML=`<div class="prompt">タップすると図形があふれるよ</div><div class="stamp-field" id="shapeField" style="background:#f2f7ff"></div><div class="play-actions"><button id="clearShape" class="secondary">ぜんぶけす</button><button id="recordShape" class="secondary">結果・評価を記録</button></div>`;const f=$('#shapeField'),shapes=['●','■','▲','◆','★'];f.onclick=e=>{if(e.target!==f)return;count++;const r=f.getBoundingClientRect(),p=document.createElement('span');p.textContent=pick(shapes);p.style.position='absolute';p.style.left=e.clientX-r.left-16+'px';p.style.top=e.clientY-r.top-16+'px';p.style.fontSize=rand(28,54)+'px';p.style.color=`hsl(${rand(0,360)} 70% 55%)`;p.animate([{transform:'translateY(-20px) rotate(0)'},{transform:`translateY(${rand(120,300)}px) rotate(${rand(180,720)}deg)`,opacity:.2}],{duration:rand(900,1800),fill:'forwards',easing:'cubic-bezier(.2,.7,.2,1)'});f.appendChild(p);setStatus(`図形 ${count}こ`)};$('#clearShape').onclick=()=>{f.innerHTML='';count=0;setStatus('図形 0こ')};$('#recordShape').onclick=()=>finish('活動記録',`図形を ${count}こ出しました。`,null);setStatus('自由に遊べます');
};

games.threepoint=()=>{
 let shots=0,score=0,phase=0,dir=1,iv;function draw(){stage.innerHTML=`<div class="big-emoji text-center">🏀　　🏀</div><div class="prompt">真ん中でシュート！</div><div style="height:22px;max-width:650px;margin:30px auto;background:linear-gradient(90deg,#e7edf5 0 38%,#b8efca 38% 62%,#e7edf5 62%);border-radius:12px;position:relative"><div id="ballDot" style="width:22px;height:22px;border-radius:50%;background:#f28b28;position:absolute;left:0"></div></div><div class="play-actions"><button id="shoot3" class="primary">シュート！</button></div><div class="subprompt">${shots}/10　成功 ${score}</div>`;const d=$('#ballDot');clearInterval(iv);iv=setInterval(()=>{phase+=dir*2.4;if(phase>=100){phase=100;dir=-1}if(phase<=0){phase=0;dir=1}d.style.left=`calc(${phase}% - 11px)`},18);cleanup=()=>clearInterval(iv);$('#shoot3').onclick=()=>{clearInterval(iv);const ok=Math.abs(50-phase)<=12;if(ok)score++;shots++;if(shots>=10)return finish(`${score}/10 シュート`,score>=7?'ナイスシュート！':'真ん中のゾーンをねらおう',score>=7);phase=rand(0,20);draw()}}draw();
};


games.moraread=()=>{
 const deck=fixedDeck('moraread',6);let round=0,score=0;function draw(){const q=deck[round],word=q.payload.word,chars=[...word];let next=0;stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="word-bank">${chars.map((c,i)=>`<button class="letter" data-i="${i}" style="font-size:38px">${c}</button>`).join('')}</div><div id="guide" class="subprompt">「${word}」をゆっくり読もう</div>`;stage.querySelectorAll('.letter').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(i!==next){b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),180);return}b.classList.add('good');b.disabled=true;next++;if(next===chars.length){score++;round++;if(round>=deck.length)return setTimeout(()=>finish(`${score}/${deck.length}`,'文字を順番に確かめながら読めました',true),250);setTimeout(draw,350)}})}draw();
};
games.kanjipuzzle=()=>{
 const deck=fixedDeck('kanjipuzzle',6);let round=0,score=0;function draw(){const q=deck[round],kanji=q.payload.kanji,parts=q.payload.parts,allParts=window.NIJI_TKK_FIXED_BANKS.kanjipuzzle.flatMap(x=>x.payload.parts),opts=shuffle([...parts,...shuffle([...new Set(allParts)].filter(x=>!parts.includes(x))).slice(0,2)]);let sel=[];stage.innerHTML=`<div class="result-box"><div class="result-big">${kanji}</div></div><div class="prompt">この漢字をつくる2つのパーツは？</div><div class="word-bank">${opts.map(c=>`<button class="letter" data-c="${c}">${c}</button>`).join('')}</div><div class="play-actions"><button id="checkK" class="primary">こたえあわせ</button></div><div id="guide" class="subprompt"></div>`;stage.querySelectorAll('.letter').forEach(b=>b.onclick=()=>{if(sel.includes(b))return;sel.push(b);b.style.background='#eef3ff';if(sel.length>2){sel.shift().style.background=''}});$('#checkK').onclick=()=>{const chosen=sel.map(b=>b.dataset.c).sort().join(''),ans=[...parts].sort().join(''),ok=chosen===ans;if(ok)score++;$('#guide').textContent=ok?'○ せいかい！':`答え：${parts.join(' ＋ ')}`;round++;if(round>=deck.length)return setTimeout(()=>finish(`${score}/${deck.length}`,score>=5?'漢字の形をよく見分けられました':'パーツに分けて形を見てみよう',score>=5),350);setTimeout(draw,450)}}draw();
};
games.bushu=()=>runFixedChoice('bushu',10,'部首をよく確認できました','漢字のどの部分が部首か確認しよう',.8);
games.palindrome=()=>{
 const deck=fixedDeck('palindrome',10);let n=0,score=0;function draw(){const q=deck[n],w=q.payload.text,a=q.payload.isPalindrome;stage.innerHTML=`<div class="result-box"><div class="result-big" style="font-size:40px">${w}</div></div><div class="prompt">前から読んでも後ろから読んでも同じ？</div><div class="choice-grid"><button class="choice-btn" data-a="1">○ 回文</button><button class="choice-btn" data-a="0">× 回文ではない</button></div>`;stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if((b.dataset.a==='1')===a)score++;n++;if(n>=deck.length)return finish(`${score}/${deck.length}`,score>=8?'文字の並びをよく見られました':'後ろから1文字ずつ読んで比べよう',score>=8);draw()})}draw();
};
games.idiomsearch=()=>searchFromDeck(fixedDeck('idiomsearch',5),false,true);


games.dagashi=()=>{
 const deck=generatedDeck('dagashi',8);let n=0,score=0;function draw(){const q=deck[n],{budget,items,total}=q.payload,opts=shuffle(q.choices);stage.innerHTML=`<div class="prompt">${budget}円でこのお買いもの</div><div class="game-grid" style="grid-template-columns:repeat(3,1fr)">${items.map(x=>`<div class="choice-btn" style="pointer-events:none">${x.emoji}<br>${x.name} ${x.price}円</div>`).join('')}</div><div class="subprompt">合計 ${total}円。おつりはいくら？</div><div class="choice-grid">${opts.map(v=>`<button class="choice-btn" data-a="${v}">${v}円</button>`).join('')}</div>`;stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(+b.dataset.a===q.answer)score++;n++;if(n>=deck.length)return finish(`${score}/${deck.length}`,score>=6?'予算とおつりをよく考えられました':'合計と予算の差を確認しよう',score>=6);draw()})}draw();
};

games.moneycount=()=>{
 const deck=generatedDeck('moneycount',10);let n=0,score=0;function draw(){const q=deck[n],list=q.payload.coins,opts=shuffle(q.choices);stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="shop-coins">${list.map(v=>`<span class="coin ${v===500?'yen500':''} ${v===10?'yen10':''}" style="display:grid;place-items:center">${v}</span>`).join('')}</div><div class="choice-grid">${opts.map(o=>`<button class="choice-btn" data-a="${o}">${o}円</button>`).join('')}</div>`;stage.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(+b.dataset.a===q.answer)score++;n++;if(n>=deck.length)return finish(`${score}/${deck.length}`,score>=8?'硬貨を上手に数えられました':'大きい硬貨から足してみよう',score>=8);draw()})}draw();
};

games.exchange=()=>{
 const deck=generatedDeck('exchange',8);let n=0,score=0;function draw(){const q=deck[n],target=q.payload.target,opts=shuffle(q.choices);stage.innerHTML=`<div class="prompt">${q.prompt}</div><div class="choice-grid">${opts.map(arr=>`<button class="choice-btn" data-sum="${arr.reduce((a,b)=>a+b,0)}">${arr.map(v=>v+'円').join(' + ')||'0円'}</button>`).join('')}</div>`;stage.querySelectorAll('[data-sum]').forEach(b=>b.onclick=()=>{if(+b.dataset.sum===target)score++;n++;if(n>=deck.length)return finish(`${score}/${deck.length}`,score>=7?'同じ金額への両替ができました':'硬貨を足した合計を確認しよう',score>=7);draw()})}draw();
};

reset();
})();
