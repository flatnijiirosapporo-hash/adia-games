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

assert.strictEqual(catalogEntryCount(), 59, 'catalog must contain 59 games after TOP unification');
assert.match(readCatalogSource(), /id:'shapePuzzle'/, 'shapePuzzle must remain in catalog');
assert.ok(fs.existsSync(path.join(root, 'shape_puzzle.html')), 'shape puzzle page must remain');
assert.strictEqual((readCatalogSource().match(/id:'flagGame'/g)||[]).length,1,'flagGame must appear exactly once');
assert.match(readCatalogSource(),/href:'flag_game\.html\?v=20260902-1'/,'flag game cache-busted route required');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(index,/<span id="gameCount">59<\/span>/,'visible game count must be 59');
assert.match(index,/assets\/game_catalog\.js\?v=20260902-59/,'catalog cache buster must be updated');
console.log('PASS integrated flag game within unified 59 games');
