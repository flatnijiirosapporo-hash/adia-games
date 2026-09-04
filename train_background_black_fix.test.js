const assert=require('assert');
const fs=require('fs');
const html=fs.readFileSync('train_driver.html','utf8');

assert(/#gameScreen\{[^}]*background:linear-gradient\(/.test(html),
  'game screen needs a bright CSS fallback instead of a black background');
assert(/#trainCanvas\{[^}]*background:linear-gradient\(/.test(html),
  'canvas needs its own bright CSS fallback');
assert(html.includes('function drawFallbackBg()'),
  'canvas needs a dedicated bright fallback background renderer');
assert(html.includes('drawFallbackBg();const im=bg[state.course.region]'),
  'drawBg must paint fallback before attempting the region image');
assert(html.includes("im.onload=()=>{if(state&&state.course&&state.course.region===r)draw()};"),
  'loaded region image must trigger a redraw');
assert(html.includes("im.onerror=()=>{if(state&&state.course&&state.course.region===r)draw()};"),
  'failed region image must still trigger fallback redraw');
assert(html.includes('updateEasyButtons();resize();draw();updateHud();'),
  'startGame must draw synchronously before HUD/RAF so the canvas never opens black');
console.log('train_background_black_fix: PASS');
