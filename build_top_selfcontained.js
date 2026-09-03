'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),V='20260902-q500-1';
const catalogSrc=fs.readFileSync(path.join(ROOT,'assets/game_catalog.js'),'utf8'),profileSrc=fs.readFileSync(path.join(ROOT,'assets/game_profile_v24.js'),'utf8'),homeSrc=fs.readFileSync(path.join(ROOT,'assets/home_v24.js'),'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(catalogSrc,ctx);vm.runInContext(profileSrc,ctx);const games=ctx.window.NIJI_GAMES||[];
if(games.length!==85)throw new Error(`expected 85 games, got ${games.length}`);
function difficulty(n){return '●'.repeat(n)+'○'.repeat(3-n)}
function card(g){const p=g.profile||{},href=g.href||`tkk_games.html?game=${encodeURIComponent(g.id)}&v=${V}`,noContext=g.noContext?' data-no-context="true"':'';return `<article class="home-game-card" data-id="${g.id}">
  <button type="button" class="fav-btn" aria-label="お気に入りに追加" title="お気に入り">★</button>
  <a class="game-card-link" href="${href}"${noContext} aria-label="${g.title}を開く">
    <div class="g-icon">${g.icon}</div><h3>${g.title}</h3><p>${g.desc}</p>
    <div class="profile-row"><span>⏱ ${p.minutes||'3〜5分'}</span><span>🎯 ${p.age||'目安なし'}</span></div>
    <div class="profile-row"><span class="diff" aria-label="むずかしさ ${p.difficulty||2} / 3">むずかしさ ${difficulty(p.difficulty||2)}</span></div>
    <div class="g-foot"><span class="cat-pill">${g.cat}</span><span class="play-link">あそぶ →</span></div>
  </a>
</article>`}
const file=path.join(ROOT,'index.html');let html=fs.readFileSync(file,'utf8');
const start='<div class="home-game-grid" id="gameGrid">',a=html.indexOf(start),b=html.indexOf('    <div id="emptyState"',a);if(a<0||b<0)throw new Error('game grid boundaries missing');html=html.slice(0,a)+start+'\n'+games.map(card).join('\n')+'\n</div>\n'+html.slice(b);
html=html.replace(/<span id="gameCount">\d+<\/span>/,`<span id="gameCount">${games.length}</span>`);
html=html.replace(/<script id="embeddedGameCatalog">[\s\S]*?<\/script>/,`<script id="embeddedGameCatalog">\n${catalogSrc.replace(/<\/script/gi,'<\\/script')}\n</script>`);
html=html.replace(/<script id="embeddedHomeV24">[\s\S]*?<\/script>/,`<script id="embeddedHomeV24">\n${homeSrc.replace(/<\/script/gi,'<\\/script')}\n</script>`);
fs.writeFileSync(file,html);console.log(file);
