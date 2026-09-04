const fs=require('fs'),vm=require('vm');
function fakeEl(){return {style:{},classList:{add(){},remove(){},contains(){return false}},hidden:false,textContent:'',innerHTML:'',value:'',dataset:{},addEventListener(){},removeEventListener(){},appendChild(){},querySelector(){return fakeEl()},querySelectorAll(){return []},getContext(){return fakeCtx()},getBoundingClientRect(){return {width:1280,height:720}},setPointerCapture(){}}}
function fakeCtx(){const f=()=>{};return {save:f,restore:f,translate:f,scale:f,rotate:f,beginPath:f,closePath:f,moveTo:f,lineTo:f,quadraticCurveTo:f,arc:f,ellipse:f,fill:f,stroke:f,fillRect:f,strokeRect:f,clearRect:f,drawImage:f,fillText:f,strokeText:f,setTransform:f,createLinearGradient(){return {addColorStop:f}},createRadialGradient(){return {addColorStop:f}},measureText(){return {width:20}},setLineDash:f,globalAlpha:1,font:'',fillStyle:'',strokeStyle:'',lineWidth:1,textAlign:'left',textBaseline:'alphabetic'}}
function load(){
 const html=fs.readFileSync('train_driver.html','utf8');
 const m=html.match(/<script id="trainDriverGame">([\s\S]*?)<\/script>/); if(!m) throw new Error('trainDriverGame script missing');
 const store={}; const elements=new Proxy({}, {get(o,k){if(!o[k])o[k]=fakeEl();return o[k]}});
 const document={getElementById:id=>elements[id],querySelector:()=>fakeEl(),querySelectorAll:()=>[],createElement:()=>fakeEl()};
 const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
 const sandbox={window:{localStorage,devicePixelRatio:1,addEventListener(){},location:{href:''},speechSynthesis:null},document,localStorage,console,Image:function(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;},Audio:function(){this.play=()=>Promise.resolve();this.pause=()=>{};},SpeechSynthesisUtterance:function(t){this.text=t},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},Math,Date,JSON};
 sandbox.window.window=sandbox.window;sandbox.window.document=document;sandbox.window.Image=sandbox.Image;sandbox.window.Audio=sandbox.Audio;sandbox.window.requestAnimationFrame=sandbox.requestAnimationFrame;sandbox.window.cancelAnimationFrame=sandbox.cancelAnimationFrame;sandbox.window.setTimeout=sandbox.setTimeout;sandbox.window.clearTimeout=sandbox.clearTimeout;sandbox.window.performance=sandbox.performance;
 vm.runInNewContext(m[1],sandbox,{filename:'train_driver.html'});
 return {T:sandbox.window.__NIJI_TRAIN_TEST__,html,sandbox};
}
module.exports={load};
