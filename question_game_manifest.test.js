'use strict';
const assert=require('assert');
const fs=require('fs'),vm=require('vm'),path=require('path');
let manifest;
try{manifest=require('../tools/question_game_manifest.js')}catch{console.error('RED: question game manifest missing');process.exit(1)}
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/game_catalog.js'),'utf8'),ctx);const catalog=ctx.window.NIJI_GAMES||[];
assert.strictEqual(manifest.length,84,'manifest count');
assert.strictEqual(new Set(manifest.map(x=>x.id)).size,84,'manifest duplicate ids');
assert.deepStrictEqual([...manifest.map(x=>x.id)].sort(),[...catalog.map(x=>x.id)].sort(),'manifest/catalog ids differ');
const counts={};for(const x of manifest){assert.ok(['fixed500','generated500','existingRich','nonQuestion'].includes(x.mode),`${x.id}: bad mode`);counts[x.mode]=(counts[x.mode]||0)+1}
assert.deepStrictEqual(counts,{fixed500:31,generated500:13,existingRich:4,nonQuestion:36});
console.log('PASS question game manifest',counts);
