'use strict';
const fs=require('fs');
const path=require('path');
const {browserSource}=require('./tkk_bank_export');
const ROOT=path.join(__dirname,'..');
const arg=process.argv.indexOf('--output');
const output=arg>=0&&process.argv[arg+1]?path.resolve(process.argv[arg+1]):path.join(ROOT,'tkk_games.html');
const template=fs.readFileSync(path.join(__dirname,'tkk_games_template.html'),'utf8');
const safe=s=>String(s).replace(/<\/script/gi,'<\\/script');
const inline=(src,label)=>`<script>\n/* INLINE:${label}:START */\n${safe(src)}\n/* INLINE:${label}:END */\n</script>`;
const assets={
 'assets/game_catalog.js':fs.readFileSync(path.join(ROOT,'assets/game_catalog.js'),'utf8'),
 'assets/game_profile_v24.js':fs.readFileSync(path.join(ROOT,'assets/game_profile_v24.js'),'utf8'),
 'assets/result_store.js':fs.readFileSync(path.join(ROOT,'assets/result_store.js'),'utf8')
};
let html=template;
for(const [ref,src] of Object.entries(assets)){
 const tag=`<script src="${ref}"></script>`;
 if(!html.includes(tag)) throw new Error(`template script missing: ${ref}`);
 html=html.replace(tag,inline(src,path.basename(ref)));
}
const gameTag='<script src="assets/tkk_games.js"></script>';
if(!html.includes(gameTag)) throw new Error('template script missing: assets/tkk_games.js');
const qbag=fs.readFileSync(path.join(ROOT,'tools/question_bag_runtime.js'),'utf8');
const generatorCore=fs.readFileSync(path.join(ROOT,'tools/tkk_generator_core.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(ROOT,'assets/tkk_games.js'),'utf8');
html=html.replace(gameTag,[
 inline(qbag,'question_bag_runtime.js'),
 inline(browserSource(),'tkk_fixed_banks.js'),
 inline(generatorCore,'tkk_generator_core.js'),
 inline(gameSrc,'tkk_games.js')
].join('\n'));
fs.writeFileSync(output,html);
console.log(output);
