'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const moon=fs.readFileSync(path.join(root,'moon_jump.html'),'utf8');
const world=fs.readFileSync(path.join(root,'world_trip_jump.html'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const catalog=fs.readFileSync(path.join(root,'assets','game_catalog.js'),'utf8');

// Moon: one tap changes direction, two quick taps jump, without firing the single-tap action.
assert.match(moon,/const\s+TAP_WINDOW_MS\s*=\s*(?:2[0-8]\d)/,'moon must define a 200-289ms custom double-tap window');
assert.match(moon,/function\s+changeDirection\s*\(/,'moon must expose a direction-change action for single taps');
assert.match(moon,/player\.vx\s*=\s*-player\.vx/,'single tap direction action must reverse horizontal velocity');
assert.match(moon,/function\s+handleGameplayTap\s*\(/,'moon must have a gameplay tap discriminator');
assert.match(moon,/clearTimeout\s*\(\s*tapTimer\s*\)[\s\S]{0,160}jump\s*\(\s*\)/,'second tap inside window must cancel single tap and jump');
assert.match(moon,/setTimeout\s*\(\s*\(\)\s*=>\s*\{[\s\S]{0,180}changeDirection\s*\(\s*\)/,'single tap must defer then change direction');
assert.match(moon,/1回タップ[^<]{0,40}左右|1回タップ[^<]{0,40}方向/,'moon instructions must explain one tap changes direction');
assert.match(moon,/2回(?:連続)?タップ[^<]{0,40}ジャンプ|すばやく2回タップ[^<]{0,40}ジャンプ/,'moon instructions must explain double tap jumps');

// World trip: runner must be explicitly right-facing and gameplay art should be vector-drawn, not emoji sprites.
assert.match(world,/function\s+drawRunnerRightFacing\s*\(/,'world runner must use an explicitly right-facing vector renderer');
const drawPlayer=(world.match(/function\s+drawPlayer\s*\(\)\s*\{([\s\S]*?)\n\}/)||[])[1]||'';
assert.match(drawPlayer,/drawRunnerRightFacing\s*\(/,'drawPlayer must call the right-facing runner renderer');
assert.doesNotMatch(drawPlayer,/fillText\s*\(\s*['"]🏃/,'runner must not use an ambiguous-direction emoji');
assert.doesNotMatch(world,/const\s+obstacleEmoji\s*=/,'obstacles must no longer depend on emoji sprites');
assert.match(world,/function\s+drawVehicle\s*\(/,'realistic obstacle renderer must include vehicles');
assert.match(world,/function\s+drawPerson\s*\(/,'realistic obstacle renderer must include people');
assert.match(world,/function\s+drawBird\s*\(/,'realistic obstacle renderer must include birds');
assert.match(world,/function\s+drawBoat\s*\(/,'realistic obstacle renderer must include boats');
assert.match(world,/function\s+drawAnimal\s*\(/,'realistic obstacle renderer must include animals');
assert.match(world,/function\s+drawBicycle\s*\(/,'realistic obstacle renderer must include bicycles');
assert.match(world,/function\s+drawParallaxDetails\s*\(/,'world background must add parallax depth/detail');

// More obstacles: about 1.5-2.8 s at the start, getting a little denser later.
assert.match(world,/nextObstacleAt\s*=\s*1\.8/,'first world obstacle should arrive much earlier than before');
assert.match(world,/const\s+minGap\s*=\s*1\.5\s*-\s*progress\s*\*\s*\.3/,'world obstacle minimum gap must start at 1.5s and tighten later');
assert.match(world,/const\s+maxGap\s*=\s*2\.8\s*-\s*progress\s*\*\s*\.6/,'world obstacle maximum gap must start at 2.8s and tighten later');

// Cache-bust modified game pages everywhere so deployed devices cannot reopen stale versions.
for(const text of [index,catalog]){
  assert.match(text,/moon_jump\.html\?v=20260903-jumptune1/,'moon link must use tuning cache version');
  assert.match(text,/world_trip_jump\.html\?v=20260903-jumptune1/,'world trip link must use tuning cache version');
  assert.doesNotMatch(text,/moon_jump\.html\?v=20260903-jumpfix1/,'old moon cache URL must be removed');
  assert.doesNotMatch(text,/world_trip_jump\.html\?v=20260903-jumpfix1/,'old world cache URL must be removed');
}

console.log('jump_tuning_controls_realism: PASS');
