'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),V='20260902-q500-1';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),catalogSrc=fs.readFileSync(path.join(root,'assets/game_catalog.js'),'utf8'),home=fs.readFileSync(path.join(root,'assets/home_v24.js'),'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(catalogSrc,ctx);const games=ctx.window.NIJI_GAMES||[];
for(const g of games){
 const expected=g.href?null:`tkk_games.html?game=${g.id}&v=${V}`;
 if(expected) assert.ok(html.includes(`href="${expected}"`),`${g.id}: static TKK href not q500`);
 if(g.href){ const special={moonJump:'v=20260903-jumptune1',worldTripJump:'v=20260903-jumptune1'}; const expectedVersion=special[g.id]||`v=${V}`; assert.ok(g.href.includes(expectedVersion),`${g.id}: direct href version unexpected (${g.href})`); }
}
assert.ok(home.includes(`&v=${V}`),'home default TKK href version missing');
assert.ok(html.includes(`&v=${V}`),'embedded home/static q500 version missing');
assert.ok(!/v=2026090[12]-(?:59|84)|v=20260901-4|v=20260902-[125]/.test(catalogSrc),'old catalog cache version remains');
console.log('PASS TOP q500 cache versions');
