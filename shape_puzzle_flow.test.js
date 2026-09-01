const assert = require('assert');
const fs = require('fs');

const home = fs.readFileSync('assets/home_v24.js','utf8');
const layout = fs.readFileSync('assets/layout_v25.js','utf8');
const catalog = fs.readFileSync('assets/game_catalog.js','utf8');
const ids = [...catalog.matchAll(/id:'[^']*'/g)];
assert.equal(ids.length,53,'game catalog must contain exactly 53 games');

assert.match(catalog, /id:'shapePuzzle'/);
assert.match(catalog, /href:'shape_puzzle\.html'/);
assert.match(catalog, /noContext:true/);
assert.match(home, /g\.href/);
assert.match(home, /data-no-context/);
assert.match(layout, /dataset\.noContext/);

console.log('PASS shape_puzzle_flow integration markers');

const html = fs.readFileSync('shape_puzzle.html','utf8');
const app = fs.readFileSync('assets/shape_puzzle_app.js','utf8');
const css = fs.readFileSync('assets/shape_puzzle.css','utf8');
for (const id of ['screenName','screenDifficulty','screenPlay','screenComplete','screenReport','childNameInput','shapeBoard','pieceTray','rotatePieceBtn','hintBtn','supportEndBtn','supportComment']) {
  assert.match(html,new RegExp(`id=["']${id}["']`));
}
assert.doesNotMatch(app,/localStorage|sessionStorage/);
for (const marker of ['function showScreen','function clearSession','function startSession','function beginPuzzle','function rotateSelectedPiece','function requestHint','function completeCurrentPuzzle','function buildReport','function printReport']) assert.match(app,new RegExp(marker));
assert.match(app,/SHAPE_HINT_IDLE_MS\s*=\s*45000/);
assert.match(app,/pointerdown/);assert.match(app,/setPointerCapture/);assert.match(app,/周りにやりたい友達がいないか確認してね/);
assert.match(css,/@page\s*\{[^}]*A4 portrait/s);assert.match(css,/prefers-reduced-motion/);assert.match(css,/@media \(max-width:\s*767px\)/);
console.log('PASS shape_puzzle_flow app markers');
