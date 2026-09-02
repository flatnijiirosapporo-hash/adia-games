const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const index = fs.readFileSync('index.html','utf8');
const catalog = fs.readFileSync('assets/game_catalog.js','utf8');
const sandbox = {window:{}};
vm.createContext(sandbox);
vm.runInContext(catalog, sandbox);
const games = sandbox.window.NIJI_GAMES;

assert.strictEqual(games.length, 59, 'TOP main catalog must contain 59 one-card games');
const expected = [
  ['flatoreHub','フラトレ','flatore.html'],
  ['movementHub','運動あそび','movement.html'],
  ['dangerHub','危険予知','danger_game.html'],
  ['cognitiveHub','10分チェック','cognitive_check_10min.html'],
  ['sstHub','SST','sst.html']
];
for (const [id,title,href] of expected) {
  const match = games.find(g=>g.id===id);
  assert(match, `${title} must be a standalone game card`);
  assert.strictEqual(match.title,title);
  assert(match.href.startsWith(href), `${title} must link directly to ${href}`);
}
assert(!index.includes('id="quickTitle"'), 'special quick-pick game section must be removed');
assert(!index.includes('shape-puzzle-quick'), 'shape puzzle special card must be removed');
assert(!index.includes('id="flatTitle"'), 'mixed flat teaching/game section must be removed');
assert.match(index,/id="gamesTitle">ゲームをえらぶ</,'main game heading must be unified');
assert.match(index,/<span id="gameCount">59<\/span>種類/,'visible initial game count must be 59');
assert.match(index,/id="staffTitle">職員・記録</,'non-game tools must be separated into staff/records area');
assert.match(index,/href="result_report\.html"[\s\S]*href="records\.html"[\s\S]*href="child_summary\.html"[\s\S]*href="parent\.html"/,'staff/records area must keep the four non-game tools');
console.log('PASS top unified 59 games');
