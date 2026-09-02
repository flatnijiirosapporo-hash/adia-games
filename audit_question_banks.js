'use strict';
const path=require('path');
const manifest=require('./question_game_manifest');
const {FIXED_BANKS}=require('./tkk_bank_export');
const {extractInlineBank}=require('./extract_inline_bank');
const {validateFixedBank}=require('./question_bank_core');
const shapeCore=require('../assets/shape_puzzle_core.js');
const shapePools={easy:require('../assets/shape_puzzle_data/puzzles_easy.js'),normal:require('../assets/shape_puzzle_data/puzzles_normal.js'),challenge:require('../assets/shape_puzzle_data/puzzles_challenge.js')};
const root=path.resolve(__dirname,'..');
function shapeSig(p){const t=shapeCore.normalizeCells(p.targetCells).map(shapeCore.cellKey).join(';');const parts=p.pieces.map(x=>shapeCore.normalizeCells(x.cells).map(shapeCore.cellKey).join(':')).sort().join('|');return `${t}#${parts}`}
const results=[];
for(const x of manifest.filter(x=>x.mode==='fixed500')){
 if(x.sourceType==='tkkFixed'){
   const bank=FIXED_BANKS[x.bankId],r=validateFixedBank(bank,{minCount:500,requireChoices:x.bankId!=='dicetalk'});if(r.errors.length)throw new Error(`${x.id}: ${r.errors.slice(0,3).join('; ')}`);results.push({id:x.id,count:r.count,difficultyCounts:r.difficultyCounts,semanticDuplicates:r.semanticDuplicates.length});
 }else if(x.sourceType==='inlineFixed'){
   const bank=extractInlineBank(path.join(root,x.file),x.marker),objective=x.marker!=='sstRoleplay',r=validateFixedBank(bank,{minCount:500,requireChoices:objective});if(r.errors.length)throw new Error(`${x.id}: ${r.errors.slice(0,3).join('; ')}`);results.push({id:x.id,count:r.count,difficultyCounts:r.difficultyCounts,semanticDuplicates:r.semanticDuplicates.length});
 }else if(x.sourceType==='shapePuzzle'){
   const all=[...shapePools.easy,...shapePools.normal,...shapePools.challenge],sigs=all.map(shapeSig);if(all.length<500)throw new Error(`shapePuzzle: ${all.length}`);if(new Set(sigs).size!==all.length)throw new Error('shapePuzzle: semantic duplicate');results.push({id:x.id,count:all.length,difficultyCounts:{easy:shapePools.easy.length,normal:shapePools.normal.length,challenge:shapePools.challenge.length,all:all.length},semanticDuplicates:0});
 }
}
if(results.length!==31)throw new Error(`fixed500 audit count ${results.length}`);
console.log(`fixed500: ${results.length} PASS`);
for(const r of results)console.log(`${r.id}\t${r.count}\t${JSON.stringify(r.difficultyCounts)}\tsemanticDup=${r.semanticDuplicates}`);
module.exports=results;
