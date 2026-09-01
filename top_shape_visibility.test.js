const fs = require('fs');
const assert = require('assert');
const html = fs.readFileSync('index.html','utf8');
const catalog = fs.readFileSync('assets/game_catalog.js','utf8');
assert.match(catalog, /id:'shapePuzzle'/, 'catalog must contain shapePuzzle');
assert.match(html, /class="quick-card shape-puzzle-quick"[^>]*href="shape_puzzle\.html"/, 'TOP must have a direct visible shape puzzle quick card');
assert.match(html, /assets\/game_catalog\.js\?v=20260901-53/, 'catalog script must be cache-busted');
assert.match(html, /assets\/home_v24\.js\?v=20260901-53/, 'home renderer must be cache-busted');
console.log('top shape visibility PASS');
