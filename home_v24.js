(()=>{
'use strict';
const games=window.NIJI_GAMES||[];
const FAV_KEY='nijifla_favorites_v24';
const RECENT_KEY='nijifla_recent_v24';
const load=(k,d=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let favorites=new Set(load(FAV_KEY));
const recent=load(RECENT_KEY).filter(id=>games.some(g=>g.id===id)).slice(0,8);
const icons={'すべて':'🌈','じかん・抑制':'⏱️','ビジョン':'👀','SST':'💬','認知':'🧠','息抜き':'🎈','算数':'🔢','国語':'🔤','社会':'🌏','レク':'🎲','生活':'🛒'};
const cats=['すべて',...new Set(games.map(g=>g.cat))];
let active='すべて';
const purpose=document.getElementById('purposeGrid'),grid=document.getElementById('gameGrid'),search=document.getElementById('gameSearch'),empty=document.getElementById('emptyState'),count=document.getElementById('gameCount'),ageFilter=document.getElementById('ageFilter'),difficultyFilter=document.getElementById('difficultyFilter'),timeFilter=document.getElementById('timeFilter');
const favSection=document.getElementById('favoriteSection'),favGrid=document.getElementById('favoriteGrid'),recentSection=document.getElementById('recentSection'),recentGrid=document.getElementById('recentGrid');
function difficulty(n){return '●'.repeat(n)+'○'.repeat(3-n)}
function card(g,compact=false){const p=g.profile||{};const href=g.href||`tkk_games.html?game=${encodeURIComponent(g.id)}`;const noContext=g.noContext?' data-no-context="true"':'';return `<article class="home-game-card${compact?' compact':''}" data-id="${g.id}">
  <button type="button" class="fav-btn${favorites.has(g.id)?' active':''}" aria-label="${favorites.has(g.id)?'お気に入りから外す':'お気に入りに追加'}" title="お気に入り">★</button>
  <a class="game-card-link" href="${href}"${noContext} aria-label="${g.title}を開く">
    <div class="g-icon">${g.icon}</div><h3>${g.title}</h3><p>${g.desc}</p>
    <div class="profile-row"><span>⏱ ${p.minutes||'3〜5分'}</span><span>🎯 ${p.age||'目安なし'}</span></div>
    <div class="profile-row"><span class="diff" aria-label="むずかしさ ${p.difficulty||2} / 3">むずかしさ ${difficulty(p.difficulty||2)}</span></div>
    <div class="g-foot"><span class="cat-pill">${g.cat}</span><span class="play-link">あそぶ →</span></div>
  </a>
</article>`}
function bindFav(scope=document){scope.querySelectorAll('.fav-btn').forEach(b=>{b.onclick=e=>{e.preventDefault();e.stopPropagation();const id=b.closest('[data-id]')?.dataset.id;if(!id)return;if(favorites.has(id))favorites.delete(id);else favorites.add(id);save(FAV_KEY,[...favorites]);drawGames();drawSaved()}})}
function drawCats(){purpose.innerHTML=cats.map(c=>`<button type="button" class="purpose-btn${c===active?' active':''}" data-cat="${c}"><span class="p-icon">${icons[c]||'🎯'}</span>${c}</button>`).join('');purpose.querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.cat;drawCats();drawGames();document.getElementById('allGames').scrollIntoView({block:'start'})})}
function drawGames(){const term=search.value.trim().toLowerCase(),age=ageFilter?.value||'',diff=difficultyFilter?.value||'',tm=timeFilter?.value||'';const list=games.filter(g=>(active==='すべて'||g.cat===active)&&(!term||[g.title,g.desc,g.cat,...g.tags,g.profile?.aim,g.profile?.age].join(' ').toLowerCase().includes(term))&&(!age||g.profile?.age===age)&&(!diff||String(g.profile?.difficulty||'')===diff)&&(!tm||g.profile?.minutes===tm));count.textContent=list.length;grid.innerHTML=list.map(g=>card(g)).join('');empty.style.display=list.length?'none':'block';bindFav(grid)}
function drawSaved(){const favs=games.filter(g=>favorites.has(g.id));favSection.hidden=!favs.length;favGrid.innerHTML=favs.slice(0,8).map(g=>card(g,true)).join('');bindFav(favGrid);const rec=recent.map(id=>games.find(g=>g.id===id)).filter(Boolean);recentSection.hidden=!rec.length;recentGrid.innerHTML=rec.map(g=>card(g,true)).join('');bindFav(recentGrid)}
search.addEventListener('input',drawGames);[ageFilter,difficultyFilter,timeFilter].forEach(x=>x&&x.addEventListener('change',drawGames));document.getElementById('clearSearch').onclick=()=>{search.value='';if(ageFilter)ageFilter.value='';if(difficultyFilter)difficultyFilter.value='';if(timeFilter)timeFilter.value='';active='すべて';drawCats();drawGames();search.focus()};
drawCats();drawGames();drawSaved();if(location.protocol==='file:')document.getElementById('fileModeNote').style.display='block';
})();
