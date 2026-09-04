const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync(__dirname+'/../train_driver.html','utf8');
function extractFunction(name){const start=html.indexOf(`function ${name}`);assert(start>=0,`${name} missing`);const brace=html.indexOf('{',start);let d=0;for(let i=brace;i<html.length;i++){if(html[i]==='{')d++;else if(html[i]==='}'){d--;if(d===0)return html.slice(start,i+1)}}throw new Error('unclosed '+name)}
const src=extractFunction('startGame');
const scheduleAt=src.indexOf('scheduleFrame(loop)');
const drawAt=src.indexOf('draw()');
assert(scheduleAt>=0,'startGame must schedule the game loop');
assert(drawAt>=0,'startGame should render an initial frame');
assert(scheduleAt<drawAt,'game loop must be scheduled before initial draw so a render failure cannot prevent time from starting');
assert(src.includes('try{draw()}')||src.includes('try { draw()'), 'initial draw must be isolated from startup');
console.log('train_start_resilience: PASS');
