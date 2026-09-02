const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/flag_game_data/flags_master.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/flag_game_data/source_manifest.js'), 'utf8'), sandbox);
const data = sandbox.window.NIJI_FLAG_MASTER;
assert.strictEqual(data.length, 201);
assert.strictEqual(new Set(data.map(x => x.id)).size, 201);
for (const x of data) {
  for (const key of ['id','nameJa','nameShort','region','difficultyRank','areaKm2','population','populationYear','flagSymbolId','mapId','colors','symbols','layout','comparisonEligible']) {
    assert.notStrictEqual(x[key], undefined, `${x.id}: missing ${key}`);
  }
  assert.ok(Number.isFinite(x.areaKm2) && x.areaKm2 > 0, `${x.id}: invalid area`);
  assert.ok(Number.isFinite(x.population) && x.population > 0, `${x.id}: invalid population`);
  assert.ok(Array.isArray(x.colors) && x.colors.length > 0, `${x.id}: missing colors`);
  assert.ok(Array.isArray(x.symbols), `${x.id}: symbols must be array`);
}
assert.strictEqual(data.filter(x => x.difficultyRank <= 40).length, 40);
assert.strictEqual(data.filter(x => x.difficultyRank <= 100).length, 100);
assert.strictEqual(data.filter(x => x.difficultyRank <= 201).length, 201);
assert.ok(sandbox.window.NIJI_FLAG_SOURCES.population.year, 'population baseline year required');
console.log('PASS flag data schema');
const sprite = fs.readFileSync(path.join(root, 'assets/flag_game_data/flags_sprite.svg'), 'utf8');
const mapSvg = fs.readFileSync(path.join(root, 'assets/flag_game_data/world_map.svg'), 'utf8');
for (const x of data) {
  assert.match(sprite, new RegExp(`id=["']${x.flagSymbolId}["']`), `${x.id}: flag SVG missing`);
  assert.match(mapSvg, new RegExp(`data-country-id=["']${x.mapId}["']`), `${x.id}: map target missing`);
}
console.log('PASS flag SVG/map coverage');
