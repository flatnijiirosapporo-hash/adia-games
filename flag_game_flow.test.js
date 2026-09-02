const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'flag_game.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/flag_game.css'),'utf8');
const app=fs.readFileSync(path.join(root,'assets/flag_game_app.js'),'utf8');
for(const mode of ['name','pair','compare','map','sort']) assert.match(html+app,new RegExp(`data-mode=["']${mode}["']|mode:\\s*["']${mode}["']`));
for(const level of ['easy','normal','challenge']) assert.match(html+app,new RegExp(level));
assert.match(css,/min-height:\s*44px/);
assert.match(app,/inputLocked/);
assert.match(app,/hintCount/);
assert.match(app,/correctCount/);
assert.match(app,/toggleSound/);
assert.match(app,/おつかれさま！/);
console.log('PASS flag game base flow');
// Task 6: 国名当て
assert.match(app,/function\s+renderNameQuestion\s*\(/,'name mode renderer required');
assert.match(app,/function\s+useNameHint\s*\(/,'name hint handler required');
assert.match(app,/function\s+answerName\s*\(/,'name answer handler required');
assert.match(app,/ヒントをつかう？/,'inactivity hint prompt required');
assert.match(app,/setTimeout\s*\(/,'inactivity/transition timer required');
console.log('PASS name quiz flow markers');
// Task 7: 国旗・国名ペア
assert.match(app,/function\s+renderPairBoard\s*\(/,'pair board renderer required');
assert.match(app,/function\s+flipPairCard\s*\(/,'pair flip handler required');
assert.match(app,/function\s+resolvePairSelection\s*\(/,'pair resolver required');
assert.match(app,/700/,'pair mismatch should wait before closing');
console.log('PASS pair flow markers');
// Task 8: どっちかな？
assert.match(app,/function\s+renderCompareQuestion\s*\(/,'compare renderer required');
assert.match(app,/function\s+answerCompare\s*\(/,'compare answer handler required');
assert.match(app,/function\s+formatArea\s*\(/,'area formatter required');
assert.match(app,/function\s+formatPopulation\s*\(/,'population formatter required');
assert.match(app,/最新人口ではありません/,'population freshness notice required');
console.log('PASS compare flow markers');
// Task 9: 世界地図で国さがし
assert.match(app,/function\s+renderMapQuestion\s*\(/,'map renderer required');
assert.match(app,/function\s+answerMap\s*\(/,'map answer handler required');
assert.match(app,/function\s+useMapHint\s*\(/,'map hint handler required');
assert.match(app,/function\s+setMapRegionHighlight\s*\(/,'region highlight required');
assert.match(app,/function\s+setMapTargetHighlight\s*\(/,'target highlight required');
console.log('PASS map flow markers');
// Task 10: 国旗のなかま分け
assert.match(app,/function\s+renderSortQuestion\s*\(/,'sort renderer required');
assert.match(app,/function\s+toggleSortFlag\s*\(/,'sort toggle handler required');
assert.match(app,/function\s+submitSortAnswer\s*\(/,'sort submit handler required');
assert.match(app,/aria-pressed/,'sort selection state required');
console.log('PASS sort flow markers');
