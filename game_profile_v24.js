(()=>{
'use strict';
const games=window.NIJI_GAMES||[];
const high=new Set(['divisor','commondiv','commonmult','idiomarrange','idiomsearch','bushu','kanjipuzzle','exchange']);
const mid=new Set(['make10','make10drop','multblock','primeblock','numorder','calcmaze','prefecture','continents','shopping','dagashi','moneycount','hiraarrange','kataarrange','hirasearch','katasearch','palindrome']);
const easy=new Set(['tensec','directions','colorquiz','stick','bottle','girigiri','bomb','bugfind','bugcatch','tap10','dice','roulette','bingo','traffic','words','dayword','stamp','shapeDrop','threepoint','moraread']);
const longish=new Set(['maze','slide15','tap50','numorder','make10drop','multblock','calcmaze','hiramemory','idiomsearch','bingo']);
const veryshort=new Set(['tensec','stick','girigiri','dice','roulette','stamp','shapeDrop']);
const catAim={
 'じかん・抑制':'待つ・タイミング・自己調整',
 'ビジョン':'見る・探す・目と手の協応',
 'SST':'相手理解・ことば・ルール',
 '認知':'注意・記憶・判断',
 '息抜き':'気分転換・タイミング',
 '算数':'数・計算・数量理解',
 '国語':'文字・語彙・ことば',
 '社会':'地理・知識・選択',
 'レク':'順番・参加・楽しむ',
 '生活':'お金・買い物・生活スキル'
};
for(const g of games){
  if(g.profile && Number.isInteger(g.profile.difficulty)) continue;
  let difficulty=easy.has(g.id)?1:high.has(g.id)?3:2;
  let age=high.has(g.id)?'高学年〜':mid.has(g.id)?'中学年〜':'低学年〜';
  if(['dice','roulette','bingo','dicetalk','stamp','shapeDrop','story'].includes(g.id)) age='全学年';
  let minutes=veryshort.has(g.id)?'1〜3分':longish.has(g.id)?'5〜10分':'3〜5分';
  g.profile={difficulty,age,minutes,aim:catAim[g.cat]||'見る・考える・取り組む'};
}
})();
