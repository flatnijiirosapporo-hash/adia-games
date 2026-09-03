const fs = require('fs');
const path = require('path');
const assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(__dirname, '..', 'assets', 'game_catalog.js'), 'utf8');
for (const href of [
  'moon_jump.html?v=20260903-jumptune1',
  'world_trip_jump.html?v=20260903-jumptune1',
]) {
  const count = html.split(href).length - 1;
  assert(count >= 2, `index.html must use ${href} in static card and embedded catalog (found ${count})`);
  assert(catalog.includes(href), `game_catalog.js must use ${href}`);
}
assert(!html.includes('moon_jump.html?v=20260903-moon1'), 'old moon cache URL must be removed');
assert(!html.includes('world_trip_jump.html?v=20260903-world1'), 'old world cache URL must be removed');
assert(!catalog.includes('moon_jump.html?v=20260903-moon1'), 'catalog old moon cache URL must be removed');
assert(!catalog.includes('world_trip_jump.html?v=20260903-world1'), 'catalog old world cache URL must be removed');
console.log('jump_cache_bust_fix: PASS');
