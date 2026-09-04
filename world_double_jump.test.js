const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('world_trip_jump.html','utf8');

assert.match(html, /jumpCount\s*:\s*0|jumpCount\s*=\s*0/, 'player state must track jumpCount');
assert.match(html, /MAX_JUMPS\s*=\s*2/, 'world trip must allow exactly two jumps');
assert.match(html, /function\s+jump\s*\(\)[\s\S]*jumpCount\s*>=\s*MAX_JUMPS[\s\S]*jumpCount\s*\+\+/, 'jump() must reject a third jump and increment jumpCount');
assert.match(html, /player\.onGround\s*=\s*true;\s*player\.jumpCount\s*=\s*0|player\.jumpCount\s*=\s*0;\s*player\.onGround\s*=\s*true/, 'landing must reset jumpCount');
assert.match(html, /2段ジャンプ|2回までジャンプ/, 'player-facing instructions must mention double jump');
console.log('world_double_jump: PASS');
