const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'flag_game.html'),'utf8');
function escapeRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function scriptFor(source){
  const re=new RegExp(`<script\\s+data-embedded-source=["']${escapeRe(source)}["']>\\n([\\s\\S]*?)<\\/script>`);
  const m=html.match(re);assert.ok(m,`missing embedded ${source}`);return m[1];
}
for(const source of ['assets/flag_game_data/flags_master.js','assets/flag_game_data/source_manifest.js','assets/flag_game_core.js','assets/flag_game_app.js']){
  const expected=fs.readFileSync(path.join(root,source),'utf8').replace(/<\/script/gi,'<\\/script')+'\n';
  assert.strictEqual(scriptFor(source),expected,`${source}: embedded source differs`);
}
const css=html.match(/<style id="flagGameEmbeddedCss">\n([\s\S]*?)<\/style>/);assert.ok(css);
assert.strictEqual(css[1],fs.readFileSync(path.join(root,'assets/flag_game.css'),'utf8')+'\n');
const sprite=fs.readFileSync(path.join(root,'assets/flag_game_data/flags_sprite.svg'),'utf8').trim();assert.ok(html.includes(sprite),'flag sprite differs');
const map=fs.readFileSync(path.join(root,'assets/flag_game_data/world_map.svg'),'utf8').trim();assert.ok(html.includes(map),'world map differs');
console.log('PASS embedded source identity');
