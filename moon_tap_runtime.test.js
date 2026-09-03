'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

const html=fs.readFileSync(path.join(__dirname,'..','moon_jump.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
const handlers={};
const timers=new Map(); let nextTimer=1;
function setTimeoutFake(fn){const id=nextTimer++;timers.set(id,fn);return id;}
function clearTimeoutFake(id){timers.delete(id);}
function flushTimers(){const pending=[...timers.entries()];timers.clear();for(const [,fn] of pending)fn();}
function makeClassList(){const s=new Set();return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x)};}
const ctx={setTransform(){},fillRect(){},clearRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},translate(){},rotate(){},scale(){},setLineDash(){},quadraticCurveTo(){},fillText(){},createLinearGradient(){return {addColorStop(){}};}};
const els={};
function elem(id){if(els[id])return els[id];const e={id,textContent:'',innerHTML:'',style:{},classList:makeClassList(),addEventListener(type,fn){(handlers[id]||(handlers[id]={}))[type]=fn;},getBoundingClientRect(){return {width:720,height:600};}};if(id==='gameCanvas')e.getContext=()=>ctx;els[id]=e;return e;}
const sandbox={console,Math,Number,String,Array,Object,Date,Intl,performance:{now:()=>1000},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout:setTimeoutFake,clearTimeout:clearTimeoutFake,document:{getElementById:elem,addEventListener(){},hidden:false},devicePixelRatio:1,addEventListener(){}};
sandbox.window=sandbox;
vm.createContext(sandbox);
for(const code of scripts)vm.runInContext(code,sandbox,{filename:'moon_jump.html'});
const click=handlers.gameShell.click;
assert(click,'click handler registered');
click({preventDefault(){}}); // start only
assert(els.overlay.classList.contains('hidden'),'first tap starts game');
click({preventDefault(){}}); // single tap candidate
assert.notStrictEqual(els.liveStatus.textContent,'左へ進みます','single tap waits for double-tap window');
flushTimers();
assert.strictEqual(els.liveStatus.textContent,'左へ進みます','one tap reverses direction after tap window');
click({preventDefault(){}});
click({preventDefault(){}});
assert.strictEqual(els.liveStatus.textContent,'ジャンプ','two quick taps jump');
flushTimers();
assert.strictEqual(els.liveStatus.textContent,'ジャンプ','double tap cancels delayed single-tap direction change');
console.log('moon_tap_runtime: PASS');
