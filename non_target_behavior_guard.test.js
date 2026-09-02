'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),manifest=require('../tools/question_game_manifest.js');
const catalogCtx={window:{}};vm.createContext(catalogCtx);vm.runInContext(fs.readFileSync(path.join(root,'assets/game_catalog.js'),'utf8'),catalogCtx);const games=catalogCtx.window.NIJI_GAMES||[],byId=new Map(games.map(g=>[g.id,g]));
// existingRich guards
const tkk=fs.readFileSync(path.join(root,'assets/tkk_games.js'),'utf8');
assert.ok(tkk.includes("games.story=()=>"),'story game missing');
assert.ok(tkk.includes("const data={when:['きょう'"),'story combinatorial data missing');
assert.ok(tkk.includes("games.hiramemory=()=>"),'hiramemory missing');
assert.ok(tkk.includes("slice(0,8)"),'hiramemory 8-pair setup changed unexpectedly');
const flag=fs.readFileSync(path.join(root,'flag_game.html'),'utf8');
for(const mode of ['name','pair','compare','map','sort'])assert.ok(flag.includes(`data-mode="${mode}"`),`flag mode ${mode} missing`);
const countryMatches=flag.match(/"difficultyRank":\d+/g)||[];assert.strictEqual(countryMatches.length,201,'flag country count');
const highlow=fs.readFileSync(path.join(root,'number_highlow.html'),'utf8');
assert.ok(/RANGES\s*=\s*\{easy:\[1,10\],normal:\[1,50\],challenge:\[1,100\]\}/.test(highlow),'highlow 1-10/1-50/1-100 ranges missing');
// nonQuestion routes stay valid
for(const x of manifest.filter(x=>x.mode==='nonQuestion')){
 const g=byId.get(x.id);assert.ok(g,`${x.id}: catalog missing`);const href=g.href||`tkk_games.html?game=${g.id}`;const file=href.split('?')[0];assert.ok(fs.existsSync(path.join(root,file)),`${x.id}: route target missing ${file}`);if(!g.href)assert.ok(tkk.includes(`games.${g.id}=`)||tkk.includes(`games.${g.id} =`),`${x.id}: tkk handler missing`);
}
console.log('PASS non-target behavior guard');
