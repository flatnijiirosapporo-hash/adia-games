const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const safeScript=s=>s.replace(/<\/script/gi,'<\\/script');
let html=read('tools/flag_game_template.html');
const replacements={
  '<!-- FLAG_GAME_CSS -->':read('assets/flag_game.css'),
  '<!-- FLAG_MASTER -->':safeScript(read('assets/flag_game_data/flags_master.js')),
  '<!-- FLAG_SOURCES -->':safeScript(read('assets/flag_game_data/source_manifest.js')),
  '<!-- FLAG_SPRITE -->':read('assets/flag_game_data/flags_sprite.svg'),
  '<!-- WORLD_MAP -->':read('assets/flag_game_data/world_map.svg'),
  '<!-- FLAG_CORE -->':safeScript(read('assets/flag_game_core.js')),
  '<!-- FLAG_APP -->':safeScript(read('assets/flag_game_app.js'))
};
for(const [marker,value] of Object.entries(replacements)){
  if(!html.includes(marker))throw new Error(`Missing template marker: ${marker}`);
  html=html.replace(marker,value);
}
fs.writeFileSync(path.join(root,'flag_game.html'),html);
console.log(`Built flag_game.html (${Buffer.byteLength(html).toLocaleString()} bytes)`);
