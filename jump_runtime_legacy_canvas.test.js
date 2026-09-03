'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

function makeClassList(){
  const s=new Set();
  return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x)};
}
function runGame(file, coreName){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
  const handlers={};
  const ctx2d={
    setTransform(){},fillRect(){},clearRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},closePath(){},save(){},restore(){},translate(){},rotate(){},scale(){},setLineDash(){},quadraticCurveTo(){},fillText(){},
    createLinearGradient(){return {addColorStop(){}};},
    // Intentionally NO roundRect(): emulate older Safari/iPad canvas API.
  };
  const elements={};
  function elem(id){
    if(elements[id]) return elements[id];
    const e={id,textContent:'',innerHTML:'',style:{},classList:makeClassList(),
      addEventListener(type,fn){(handlers[id]||(handlers[id]={}))[type]=fn;},
      getBoundingClientRect(){return {width:720,height:560};}
    };
    if(id==='gameCanvas') e.getContext=()=>ctx2d;
    elements[id]=e; return e;
  }
  const sandbox={console,Math,Number,String,Array,Object,Date,Intl,performance:{now:()=>1000},
    requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout(){},clearTimeout(){},
    document:{getElementById:elem,addEventListener(){},hidden:false},devicePixelRatio:1,
    addEventListener(){},
  };
  sandbox.window=sandbox;
  vm.createContext(sandbox);
  for(const code of scripts) vm.runInContext(code,sandbox,{filename:file});
  assert(sandbox[coreName],`${file}: inline core must load`);
  assert(handlers.gameShell && handlers.gameShell.click,`${file}: click handler must register`);
  handlers.gameShell.click({preventDefault(){}});
  assert(elements.overlay.classList.contains('hidden'),`${file}: tap/click must start game and hide overlay`);
}
runGame('moon_jump.html','MoonJumpCore');
runGame('world_trip_jump.html','WorldTripCore');
console.log('jump_runtime_legacy_canvas: PASS');
