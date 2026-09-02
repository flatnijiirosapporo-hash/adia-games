'use strict';
const manifest=require('./question_game_manifest');
const gen=require('./tkk_generator_core');
const results=[];
for(const x of manifest.filter(x=>x.mode==='generated500')){
 const keys=gen.listProblemKeys(x.generatorId),uniq=[...new Set(keys)];if(uniq.length<500)throw new Error(`${x.id}: ${uniq.length}`);let errors=0;for(const key of uniq){const e=gen.validateProblem(x.generatorId,gen.makeProblem(x.generatorId,key));if(e.length){errors++;if(errors<4)console.error(x.id,key,e)}}if(errors)throw new Error(`${x.id}: ${errors} validation errors`);results.push({id:x.id,keys:uniq.length,errors});
}
if(results.length!==13)throw new Error(`generated500 audit count ${results.length}`);
console.log(`generated500: ${results.length} PASS`);for(const r of results)console.log(`${r.id}\tkeys=${r.keys}\terrors=${r.errors}`);module.exports=results;
