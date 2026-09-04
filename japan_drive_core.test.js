const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
function makeSandbox(){
  const store={};
  const noop=()=>{};
  const ctx=new Proxy({}, {get:(t,p)=>t[p]||(t[p]=noop),set:(t,p,v)=>(t[p]=v,true)});
  const canvas={width:900,height:1400,style:{},getContext:()=>ctx,addEventListener:noop,setPointerCapture:noop,getBoundingClientRect:()=>({left:0,top:0,width:900,height:1400})};
  const nodes=new Proxy({}, {get:(t,p)=>t[p]||(t[p]={style:{},hidden:false,textContent:'',innerHTML:'',classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,querySelector:()=>null,querySelectorAll:()=>[]})});
  const document={getElementById:id=>id==='gameCanvas'?canvas:nodes[id],querySelector:()=>null,querySelectorAll:()=>[],addEventListener:noop};
  const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
  class Image{constructor(){this.complete=true;this.naturalWidth=1;} set src(v){this._src=v;if(this.onload)this.onload();} get src(){return this._src;}}
  const window={devicePixelRatio:1,innerWidth:900,innerHeight:1400,addEventListener:noop,location:{href:''},localStorage};
  window.window=window; window.document=document;
  return {window,document,localStorage,Image,console,Math,Date,performance:{now:()=>0},requestAnimationFrame:()=>0,cancelAnimationFrame:noop,setTimeout:()=>0,clearTimeout:noop};
}
const html=fs.readFileSync('japan_drive.html','utf8');
const m=html.match(/<script id="japanDriveGame">([\s\S]*?)<\/script>/);
assert(m,'japanDriveGame script missing');
const sandbox=makeSandbox();
vm.createContext(sandbox);
vm.runInContext(m[1],sandbox,{filename:'japan_drive.html'});
const T=sandbox.window.__NIJI_JAPAN_DRIVE_TEST__;
assert(T,'test API missing');
assert.equal(T.TOTAL_SECONDS,180);
assert.equal(T.TOTAL_KM,3000);
assert.equal(T.progressAtSeconds(0),0);
assert.equal(T.progressAtSeconds(180),1);
assert.equal(T.kmAtSeconds(180),3000);
assert.deepEqual(Array.from(T.ROUTE,x=>x.id),['hokkaido-start','tohoku-out','kanto-out','chubu-out','kansai-out','chugoku-out','shikoku','kyushu','chugoku-back','kansai-back','chubu-back','kanto-back','tohoku-back','hokkaido-goal']);
assert.equal(T.ROUTE[0].name,'宗谷岬');
assert.equal(T.ROUTE[T.ROUTE.length-1].nextName,'札幌・大通公園');
assert.equal(T.clampLane(-1),0); assert.equal(T.clampLane(1),1); assert.equal(T.clampLane(3),2);
assert(T.speedFactorAtSeconds(170)>T.speedFactorAtSeconds(20));
assert.deepEqual(T.resolveSwipe(200,120,1,40),{lane:0,changed:true,direction:'left'});
assert.deepEqual(T.resolveSwipe(120,200,1,40),{lane:2,changed:true,direction:'right'});
assert.deepEqual(T.resolveSwipe(200,190,1,40),{lane:1,changed:false,direction:'none'});
for(let i=0;i<5000;i++){
  const p=T.buildSpawnPattern({seed:i},i/5000,{lanes:3,event:'none'});
  assert(p.safeLanes.length>=1,'no safe lane '+i);
  assert(p.blockedLanes.every(l=>l>=0&&l<=2));
}
const early=T.buildSpawnPattern({seed:11},.05,{lanes:3,event:'none'});
const late=T.buildSpawnPattern({seed:11},.92,{lanes:3,event:'none'});
assert(late.nextDelay<=early.nextDelay);
assert.equal(T.betterRecord({km:1200},{km:900}).km,1200);
assert.equal(T.betterRecord({km:1200},{km:1300}).km,1300);
console.log('japan_drive_core: PASS');
