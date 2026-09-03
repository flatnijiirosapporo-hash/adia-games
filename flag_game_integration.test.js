const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'assets', 'game_catalog.js');

function readCatalogSource() {
  return fs.readFileSync(catalogPath, 'utf8');
}

function catalogEntryCount() {
  const src = readCatalogSource();
  return (src.match(/\{id:/g) || []).length;
}

assert.strictEqual(catalogEntryCount(), 86, 'catalog must contain 86 games after exposing all active individual games');
assert.match(readCatalogSource(), /id:'shapePuzzle'/, 'shapePuzzle must remain in catalog');
assert.ok(fs.existsSync(path.join(root, 'shape_puzzle.html')), 'shape puzzle page must remain');
assert.strictEqual((readCatalogSource().match(/id:'flagGame'/g)||[]).length,1,'flagGame must appear exactly once');
assert.match(readCatalogSource(),/href:'flag_game\.html\?v=20260902-q500-1'/,'flag game cache-busted route required');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(index,/<span id="gameCount">86<\/span>/,'visible game count must be 86');
assert.ok(index.includes('id="embeddedGameCatalog"'),'TOP must embed the 86-game catalog to avoid stale external catalog cache');
assert.ok(!/<script[^>]+src="assets\/game_catalog\.js/i.test(index),'TOP must not depend on external game_catalog.js');
console.log('PASS integrated flag game within unified 86 games');
