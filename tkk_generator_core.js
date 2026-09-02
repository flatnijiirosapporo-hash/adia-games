(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NIJI_TKK_GENERATORS=api;
})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const IDS=['make10','make10drop','multblock','primeblock','divisor','commondiv','commonmult','calcmaze','dayword','shopping','dagashi','moneycount','exchange'];
const COINS=[500,100,50,10,5,1];
function hashString(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function rngFor(key){return mulberry32(hashString(key))}
function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function gcd(a,b){while(b){[a,b]=[b,a%b]}return Math.abs(a)}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b)}
function divisors(n,max=Infinity){const a=[];for(let i=1;i<=Math.min(n,max);i++)if(n%i===0)a.push(i);return a}
function isPrime(n){if(!Number.isInteger(n)||n<2)return false;if(n===2)return true;if(n%2===0)return false;for(let d=3;d*d<=n;d+=2)if(n%d===0)return false;return true}
function uniq(a){return [...new Set(a)]}
function dateUTC(s){const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d))}
function isoDate(d){return d.toISOString().slice(0,10)}
function addDays(s,n){const d=dateUTC(s);d.setUTCDate(d.getUTCDate()+n);return isoDate(d)}
function formatJP(s){const d=dateUTC(s);return `${d.getUTCMonth()+1}月${d.getUTCDate()}日`}
function greedyCoins(amount){const out=[];for(const c of COINS){while(amount>=c){out.push(c);amount-=c}}return out}
function coinSum(a){return a.reduce((s,n)=>s+n,0)}
function seededInts(key,count,min,max,uniqueOnly=false){const rng=rngFor(key),out=[];let guard=0;while(out.length<count&&guard++<10000){const n=min+Math.floor(rng()*(max-min+1));if(!uniqueOnly||!out.includes(n))out.push(n)}return out}

const keyCache={};
function make10Keys(prefix,count=640){return Array.from({length:count},(_,i)=>`${prefix}:${i}`)}
function multKeys(){const a=[];for(let x=2;x<=9;x++)for(let y=2;y<=9;y++)for(let v=0;v<10;v++)a.push(`${x}x${y}:v${v}`);return a}
function primeKeys(){const steps=[1,2,3,5,7,11,13,17,19,23,29,31];const a=[];for(let start=1;start<=100;start++)for(const step of steps)a.push(`${start}:${step}`);return a}
function divisorKeys(){const a=[];for(let n=2;n<=300;n++)for(let v=0;v<3;v++)a.push(`${n}:v${v}`);return a}
function commonDivKeys(){const a=[];for(let x=4;x<=80;x++)for(let y=x+1;y<=90;y++)if(gcd(x,y)>=2){a.push(`${x}:${y}:v0`);a.push(`${x}:${y}:v1`)}return a}
function commonMultKeys(){const a=[];for(let x=2;x<=25;x++)for(let y=2;y<=25;y++)a.push(`${x}:${y}`);return a}
function calcKeys(){return Array.from({length:700},(_,i)=>`maze:${i}`)}
function dayKeys(){const out=[];let d=dateUTC('2024-01-01'),end=dateUTC('2030-12-31');while(d<=end){const s=isoDate(d);for(const rel of [-1,0,1])out.push(`${s}:${rel}`);d=new Date(d.getTime()+86400000)}return out}
function shoppingKeys(){return Array.from({length:981},(_,i)=>String(i+20))}
const DAGASHI_ITEMS=[['ラムネ',30,'🍬'],['グミ',50,'🍭'],['チョコ',40,'🍫'],['せんべい',60,'🍘'],['ジュース',80,'🧃'],['アイス',100,'🍦'],['ビスケット',70,'🍪'],['ゼリー',90,'🥄']];
function dagashiKeys(){const a=[];for(let budget=100;budget<=500;budget+=10){for(let mask=1;mask<(1<<DAGASHI_ITEMS.length);mask++){let total=0;for(let i=0;i<DAGASHI_ITEMS.length;i++)if(mask&(1<<i))total+=DAGASHI_ITEMS[i][1];if(total<=budget)a.push(`${budget}:m${mask}`)}}return a}
function moneyCountKeys(){const out=[];for(let c500=0;c500<=1;c500++)for(let c100=0;c100<=3;c100++)for(let c50=0;c50<=2;c50++)for(let c10=0;c10<=4;c10++)for(let c5=0;c5<=2;c5++)for(let c1=0;c1<=4;c1++){const counts=[c500,c100,c50,c10,c5,c1],qty=counts.reduce((a,b)=>a+b,0);if(qty>=3&&qty<=9)out.push(counts.join('-'))}return out}
function exchangeKeys(){return Array.from({length:991},(_,i)=>String(i+10))}
function listProblemKeys(id){
 if(keyCache[id])return keyCache[id].slice();
 let keys;
 switch(id){
  case'make10':keys=make10Keys('make10');break;case'make10drop':keys=make10Keys('make10drop');break;case'multblock':keys=multKeys();break;case'primeblock':keys=primeKeys();break;case'divisor':keys=divisorKeys();break;case'commondiv':keys=commonDivKeys();break;case'commonmult':keys=commonMultKeys();break;case'calcmaze':keys=calcKeys();break;case'dayword':keys=dayKeys();break;case'shopping':keys=shoppingKeys();break;case'dagashi':keys=dagashiKeys();break;case'moneycount':keys=moneyCountKeys();break;case'exchange':keys=exchangeKeys();break;default:throw new Error(`unknown generator game: ${id}`)
 }
 keyCache[id]=keys;return keys.slice();
}
function make10Problem(id,key,size){
 const rng=rngFor(key),pairs=[];for(let i=0;i<size/2;i++){const a=1+Math.floor(rng()*9);pairs.push(a,10-a)}const board=shuffle(pairs,rng);return{key,prompt:id==='make10'?'2つえらんで「10」をつくろう':'となり合う2つで10を作ろう',answer:10,payload:{board}};
}
function makeProblem(id,key){
 if(!listProblemKeys(id).includes(key))throw new Error(`${id}: unknown key ${key}`);
 const rng=rngFor(`${id}|${key}`);
 switch(id){
  case'make10':return make10Problem(id,key,24);
  case'make10drop':{const p=make10Problem(id,key,36);const row=6,idx=(hashString(key)%30);const safe=idx%row===row-1?idx-1:idx,a=1+(hashString(key+'a')%9);p.payload.board[safe]=a;p.payload.board[safe+1]=10-a;p.payload.guaranteedPair=[safe,safe+1];return p;}
  case'multblock':{const m=key.match(/^(\d+)x(\d+):v(\d+)$/),baseA=+m[1],baseB=+m[2],variant=+m[3],pairs=[];for(let i=0;i<12;i++){const a=2+((baseA-2+i+variant)%8),b=2+((baseB-2+i*3+variant)%8);pairs.push({a,b,expr:`${a}×${b}`,answer:a*b})}pairs[0]={a:baseA,b:baseB,expr:`${baseA}×${baseB}`,answer:baseA*baseB};return{key,prompt:'式と答えのペアを見つけよう',answer:null,payload:{pairs,variant}};}
  case'primeblock':{const [startS,stepS]=key.split(':'),start=+startS,step=+stepS,nums=[];let n=start;while(nums.length<30){const v=((n-1)%100)+1;if(!nums.includes(v))nums.push(v);n+=step;if(n>10000)n=(n%100)+1}return{key,prompt:'素数だけをタップ！',answer:nums.filter(isPrime),payload:{numbers:nums}};}
  case'divisor':{const [nS,vS]=key.split(':v'),n=+nS,v=+vS,correct=divisors(n,60),pool=Array.from({length:60},(_,i)=>i+1),rot=pool.slice(v*7).concat(pool.slice(0,v*7)),choices=uniq([...correct,...rot.filter(x=>!correct.includes(x))]).slice(0,Math.max(16,correct.length));return{key,prompt:`${n} の約数をぜんぶ選ぼう`,answer:choices.filter(x=>n%x===0),choices,payload:{a:n,max:60}};}
  case'commondiv':{const [aS,bS,vRaw]=key.split(':'),a=+aS,b=+bS,v=+(vRaw||'v0').replace('v',''),correct=Array.from({length:30},(_,i)=>i+1).filter(n=>a%n===0&&b%n===0),pool=Array.from({length:30},(_,i)=>i+1),rot=pool.slice(v*9).concat(pool.slice(0,v*9)),choices=uniq([...correct,...rot.filter(x=>!correct.includes(x))]).slice(0,Math.max(16,correct.length));return{key,prompt:`${a} と ${b} の公約数をぜんぶ選ぼう`,answer:choices.filter(n=>a%n===0&&b%n===0),choices,payload:{a,b,max:30}};}
  case'commonmult':{const [aS,bS]=key.split(':'),a=+aS,b=+bS,max=Math.max(120,lcm(a,b)*2),correct=Array.from({length:max},(_,i)=>i+1).filter(n=>n%a===0&&n%b===0),pool=Array.from({length:max},(_,i)=>i+1),offset=hashString(key)%max,rot=pool.slice(offset).concat(pool.slice(0,offset)),choices=uniq([...correct.slice(0,6),...rot.filter(x=>!correct.includes(x))]).slice(0,16);return{key,prompt:`${a} と ${b} の公倍数を選ぼう（${max}まで）`,answer:choices.filter(n=>n%a===0&&n%b===0),choices,payload:{a,b,max}};}
  case'calcmaze':{const seed=+key.split(':')[1],steps=[];for(let i=0;i<10;i++){const a=1+((seed*7+i*11)%30),b=1+((seed*13+i*5)%20),op=(seed+i)%2===0?'+':'−',aa=op==='+'?a:Math.max(a,b),bb=op==='+'?b:Math.min(a,b),ans=op==='+'?aa+bb:aa-bb;let choices=uniq([ans,ans+1+(seed+i)%4,Math.max(0,ans-(1+((seed+i*2)%4))),ans+5+((seed+i)%3)]);if(choices.length<3)choices.push(ans+9);steps.push({a:aa,b:bb,op,answer:ans,choices:choices.slice(0,3)})}return{key,prompt:'正しい計算答えを選びながらゴールへ進もう',answer:null,payload:{steps}};}
  case'dayword':{const m=key.match(/^(\d{4}-\d{2}-\d{2}):(-?\d)$/),base=m[1],rel=+m[2],labels={[-1]:'きのう',[0]:'きょう',[1]:'あした'},target=addDays(base,rel),choices=[-1,0,1].map(x=>addDays(base,x));return{key,prompt:`${formatJP(base)} が「きょう」なら「${labels[rel]}」はいつ？`,answer:formatJP(target),choices:choices.map(formatJP),payload:{base,relation:rel,target}};}
  case'shopping':{const price=+key,solution=greedyCoins(price);return{key,prompt:`${price}円 ぴったり はらおう`,answer:price,payload:{price,availableCoins:COINS.slice(),exampleSolution:solution}};}
  case'dagashi':{const m=key.match(/^(\d+):m(\d+)$/),budget=+m[1],mask=+m[2],items=DAGASHI_ITEMS.filter((_,i)=>mask&(1<<i)).map(x=>({name:x[0],price:x[1],emoji:x[2]})),total=items.reduce((s,x)=>s+x.price,0),change=budget-total,choices=uniq([change,change+10,Math.max(0,change-10),change+20]).slice(0,3);return{key,prompt:`${budget}円で ${items.map(x=>x.name).join('・')} を買うと、おつりはいくら？`,answer:change,choices,payload:{budget,items,total,change}};}
  case'moneycount':{const counts=key.split('-').map(Number),coins=[];counts.forEach((c,i)=>{for(let k=0;k<c;k++)coins.push(COINS[i])});const sum=coinSum(coins),d1=10+(hashString(key)%5)*10,d2=50+(hashString(key+'x')%4)*50,choices=uniq([sum,sum+d1,Math.max(1,sum-d1),sum+d2]).slice(0,3);return{key,prompt:'ぜんぶで いくら？',answer:sum,choices,payload:{coins}};}
  case'exchange':{const target=+key,correct=greedyCoins(target),wrong1=greedyCoins(target+5+(target%7)),wrong2=greedyCoins(target+40+(target%11)),choices=[correct,wrong1,wrong2];return{key,prompt:`${target}円と同じ金額はどれ？`,answer:correct,choices,payload:{target}};}
  default:throw new Error(`unknown generator game: ${id}`)
 }
}
function validateProblem(id,p){const e=[];if(!p||!p.key)e.push('missing key');
 try{
 switch(id){
  case'make10':{const b=p.payload.board;if(!Array.isArray(b)||b.length!==24)e.push('board length');let ok=false;for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)if(b[i]+b[j]===10)ok=true;if(!ok)e.push('no pair summing 10');break;}
  case'make10drop':{const b=p.payload.board;if(!Array.isArray(b)||b.length!==36)e.push('board length');let ok=false;for(let i=0;i<b.length;i++){for(const j of [i+1,i+6])if(j<b.length&&(j===i+6||Math.floor(j/6)===Math.floor(i/6))&&b[i]+b[j]===10)ok=true}if(!ok)e.push('no adjacent pair summing 10');break;}
  case'multblock':for(const q of p.payload.pairs||[])if(q.answer!==q.a*q.b||q.expr!==`${q.a}×${q.b}`)e.push('bad multiplication pair');if((p.payload.pairs||[]).length!==12)e.push('pair count');break;
  case'primeblock':{const nums=p.payload.numbers||[],ans=p.answer||[];if(nums.length!==30||new Set(nums).size!==30)e.push('number set');const exp=nums.filter(isPrime);if(JSON.stringify(exp)!==JSON.stringify(ans))e.push('prime answer');if(ans.includes(0)||ans.includes(1))e.push('0/1 prime');break;}
  case'divisor':{const {a}=p.payload,exp=(p.choices||[]).filter(n=>a%n===0);if(JSON.stringify(exp)!==JSON.stringify(p.answer))e.push('divisor answer');break;}
  case'commondiv':{const {a,b}=p.payload,exp=(p.choices||[]).filter(n=>a%n===0&&b%n===0);if(JSON.stringify(exp)!==JSON.stringify(p.answer))e.push('common divisor answer');if(gcd(a,b)<2)e.push('gcd too small');break;}
  case'commonmult':{const {a,b,max}=p.payload,exp=(p.choices||[]).filter(n=>n<=max&&n%a===0&&n%b===0);if(JSON.stringify(exp)!==JSON.stringify(p.answer))e.push('common multiple answer');if(!p.answer.length)e.push('no shown correct multiple');break;}
  case'calcmaze':{const s=p.payload.steps||[];if(s.length!==10)e.push('step count');for(const q of s){const exp=q.op==='+'?q.a+q.b:q.a-q.b;if(exp!==q.answer)e.push('calculation');if((q.choices||[]).filter(x=>x===q.answer).length!==1)e.push('choice correctness')}break;}
  case'dayword':{const {base,relation,target}=p.payload,exp=addDays(base,relation);if(exp!==target)e.push('date target');if(p.answer!==formatJP(exp))e.push('date answer');break;}
  case'shopping':{const {price,exampleSolution}=p.payload;if(coinSum(exampleSolution)!==price)e.push('coin solution');if(p.answer!==price)e.push('price answer');break;}
  case'dagashi':{const {budget,items,total,change}=p.payload,expTotal=items.reduce((s,x)=>s+x.price,0);if(total!==expTotal)e.push('cart total');if(change!==budget-total||change<0)e.push('change');if(p.answer!==change)e.push('answer');if((p.choices||[]).filter(x=>x===change).length!==1)e.push('choice correctness');break;}
  case'moneycount':{const sum=coinSum(p.payload.coins||[]);if(sum!==p.answer)e.push('coin sum');if((p.choices||[]).filter(x=>x===sum).length!==1)e.push('choice correctness');break;}
  case'exchange':{const target=p.payload.target,sums=(p.choices||[]).map(coinSum);if(sums.filter(x=>x===target).length!==1)e.push('exchange correct count');if(coinSum(p.answer||[])!==target)e.push('exchange answer');break;}
 }
 }catch(err){e.push(`exception:${err.message}`)}
 if(Array.isArray(p.choices)&&new Set(p.choices.map(x=>JSON.stringify(x))).size!==p.choices.length)e.push('duplicate choices');return e;
}
return{IDS,listProblemKeys,makeProblem,validateProblem,isPrime,gcd,lcm,divisors,formatJP,addDays};
});
