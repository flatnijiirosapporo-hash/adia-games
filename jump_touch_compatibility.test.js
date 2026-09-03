const fs = require('fs');
const path = require('path');
const assert = require('assert');

for (const file of ['moon_jump.html', 'world_trip_jump.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert(
    /shell\.addEventListener\(['\"]click['\"],\s*handleTap/.test(html),
    `${file}: tap start/jump must support standard click events for iPad/Safari/WebView compatibility`
  );
}
console.log('jump_touch_compatibility: PASS');
