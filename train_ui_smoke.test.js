const assert=require('assert'),fs=require('fs'),vm=require('vm');
const html=fs.readFileSync('train_driver.html','utf8');
const m=html.match(/<script id="trainDriverGame">([\s\S]*?)<\/script>/);assert(m);
let now=1000, rafQueue=[], drawCalls=0;
function classList(initial=''){const s=new Set(initial.split(/\s+/).filter(Boolean));return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x),toggle(x,force){if(force===undefined){if(s.has(x))s.delete(x);else s.add(x)}else if(force)s.add(x);else s.delete(x);return s.has(x)}}}
const elements={};
function el(id,classes=''){if(elements[id])return elements[id];const o={id,style:{},classList:classList(classes),textContent:'',value:'',dataset:{},children:[],onclick:null,oninput:null,appendChild(x){this.children.push(x)},addEventListener(){},setPointerCapture(){},getBoundingClientRect(){return {width:1024,height:700}},getContext(){return ctx}};let inner='';Object.defineProperty(o,'innerHTML',{get(){return inner},set(v){inner=String(v);this.children=[];if(inner.includes('id="departStartBtn"'))el('departStartBtn')}});elements[id]=o;return o}
const ctx=new Proxy({createLinearGradient(){return {addColorStop(){}}},measureText(){return {width:20}}},{get(t,p){if(p in t)return t[p];return (...a)=>{drawCalls++}},set(t,p,v){t[p]=v;return true}});
for(const [id,cls] of [['selectScreen','screen'],['gameScreen','hidden'],['diaModal','hidden'],['resultModal','hidden'],['regionMap',''],['courseGrid',''],['vehicleGrid',''],['homeBtn',''],['showDiaBtn',''],['prepareBtn',''],['diaBody',''],['diaCloseBtn',''],['gameDiaBtn',''],['volumeBtn',''],['retryBtn',''],['courseBtn',''],['resultHomeBtn',''],['powerBtn',''],['brakeBtn',''],['easyControls',''],['expertControls','hidden'],['notchRange',''],['notchNow',''],['doorOpenBtn',''],['doorCloseBtn',''],['trainCanvas',''],['announcement',''],['liveStatus',''],['warningBox','hidden'],['speedHud',''],['limitHud',''],['stationHud',''],['arriveHud',''],['departHud',''],['clockHud',''],['scoreHud',''],['recoveryHud',''],['signalLabel',''],['advisoryLabel',''],['signalLamp','']])el(id,cls);
const modeEasy=el('modeEasy');modeEasy.dataset.mode='easy';modeEasy.classList=classList('modeBtn active');const modeExpert=el('modeExpert');modeExpert.dataset.mode='expert';modeExpert.classList=classList('modeBtn');
const document={getElementById:id=>elements[id]||null,createElement:tag=>el('dyn'+Math.random()),querySelectorAll(sel){if(sel==='.modeBtn')return [modeEasy,modeExpert];return []}};
const store={};const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v)};
function Image(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
function Audio(){this.currentTime=0;this.play=()=>Promise.resolve();}
const window={localStorage,devicePixelRatio:1,location:{href:''},speechSynthesis:null,addEventListener(){}};
const sandbox={window,document,localStorage,Image,Audio,SpeechSynthesisUtterance:function(){},console,Math,Date,JSON,performance:{now:()=>now},requestAnimationFrame:cb=>{rafQueue.push(cb);return rafQueue.length},cancelAnimationFrame(){},setTimeout:cb=>{cb();return 1},clearTimeout(){}};window.window=window;window.document=document;window.Image=Image;window.Audio=Audio;window.performance=sandbox.performance;window.requestAnimationFrame=sandbox.requestAnimationFrame;window.cancelAnimationFrame=sandbox.cancelAnimationFrame;window.setTimeout=sandbox.setTimeout;
vm.runInNewContext(m[1],sandbox,{filename:'train_driver.html'});
assert.equal(elements.regionMap.children.length,8,'regions rendered');
assert.equal(elements.courseGrid.children.length,3,'courses rendered');
assert.equal(elements.vehicleGrid.children.length,6,'vehicles rendered');
elements.prepareBtn.onclick();assert(elements.departStartBtn&&typeof elements.departStartBtn.onclick==='function','depart button wired');
elements.departStartBtn.onclick();assert.equal(elements.gameScreen.classList.contains('hidden'),false,'game screen shown');assert.equal(elements.selectScreen.classList.contains('hidden'),true,'select hidden');const initialClock=elements.clockHud.textContent;
elements.powerBtn.onclick();assert.equal(elements.powerBtn.textContent,'加速中','tap enters power state');
for(let i=0;i<600;i++){const cb=rafQueue.shift();assert(cb,'raf callback exists');now+=1000/60;cb(now)}
const speed=parseFloat(elements.speedHud.textContent);assert(speed>5,'speed rises after tap, got '+speed);assert.notEqual(elements.clockHud.textContent,initialClock,'game clock must advance');assert(drawCalls>100,'canvas drawing occurred');
console.log('train_ui_smoke: PASS speed='+speed+' clock='+elements.clockHud.textContent+' drawCalls='+drawCalls);
