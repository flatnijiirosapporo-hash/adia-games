const fs = require('fs');
const path = require('path');
const assert = require('assert');

const cases = [
  ['moon_jump.html', 'MoonJumpCore', 'MOON_DISTANCE_KM'],
  ['world_trip_jump.html', 'WorldTripCore', 'EARTH_CIRCUMFERENCE_KM'],
];
for (const [file, globalName, marker] of cases) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert(html.includes(marker), `${file}: must inline its runtime core data`);
  assert(
    new RegExp(`(?:window\\.|root\\.)?${globalName}\\s*=`).test(html) || html.includes(`root.${globalName}=factory()`),
    `${file}: must define ${globalName} inside the HTML before game startup`
  );
  assert(!/<script\s+src=["']assets\/(?:moon_jump_core|world_trip_core)\.js/i.test(html), `${file}: must not depend on external jump core JS`);
}
console.log('jump_selfcontained_runtime: PASS');
