(()=>{
  'use strict';
  const body=document.body;if(!body)return;
  body.classList.add('niji-v24');
  const CONTEXT_KEY='nijifla_session_context_v25';
  const mem={};
  const lsGet=k=>{try{return localStorage.getItem(k)}catch{return mem[k]||null}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{mem[k]=v}};
  const readSaved=()=>{try{return JSON.parse(lsGet(CONTEXT_KEY)||'{}')||{}}catch{return {}}};
  const query=new URLSearchParams(location.search);
  const incoming={child:(query.get('child')||'').trim(),staff:(query.get('staff')||'').trim()};
  let context=readSaved();
  if(incoming.child||incoming.staff){context={...context,...Object.fromEntries(Object.entries(incoming).filter(([,v])=>v)),updatedAt:new Date().toISOString()};lsSet(CONTEXT_KEY,JSON.stringify(context))}
  const getContext=()=>({...context});
  const setContext=patch=>{context={...context,...patch,updatedAt:new Date().toISOString()};if(!context.child)delete context.child;if(!context.staff)delete context.staff;lsSet(CONTEXT_KEY,JSON.stringify(context));return getContext()};
  const clearContext=()=>{context={};try{localStorage.removeItem(CONTEXT_KEY)}catch{delete mem[CONTEXT_KEY]}};
  const decorateUrl=raw=>{
    if(!raw||raw.startsWith('#')||/^(javascript:|mailto:|tel:)/i.test(raw))return raw;
    try{const u=new URL(raw,location.href);if(u.origin!==location.origin && location.protocol!=='file:')return raw;const c=getContext();if(c.child&&!u.searchParams.has('child'))u.searchParams.set('child',c.child);if(c.staff&&!u.searchParams.has('staff'))u.searchParams.set('staff',c.staff);return u.pathname.split('/').pop()+u.search+u.hash}catch{return raw}
  };
  window.NIJI_CONTEXT={get:getContext,set:setContext,clear:clearContext,decorateUrl,KEY:CONTEXT_KEY};
  document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;if(a.dataset.noContext==='true')return;const href=a.getAttribute('href');if(!href||href.startsWith('#'))return;const decorated=decorateUrl(href);if(decorated&&decorated!==href)a.setAttribute('href',decorated)},true);
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file==='index.html'||file==='') body.classList.add('home-v24');
  const redirects=['sst_help.html','sst_listening.html','sst_random.html','sst_repair.html','sst_tell.html'];
  if(redirects.includes(file))return;
  if(body.querySelector('main.wrap > section.panel') && (body.querySelector('#startBtn')||body.querySelector('.playArea,.choices,.tenChoices,.colorGrid,.visionArea'))) body.classList.add('legacy-play');
  const top=body.querySelector('.top .nav');
  const excluded=['index.html','records.html','child_summary.html','result_report.html','sst_report.html','tkk_games.html'];
  if(top && !excluded.includes(file)){
    const first=top.querySelector('a');
    if(first && /戻る|TOP/.test(first.textContent)) first.textContent='← TOP';
    if(!top.querySelector('.niji-record-link')){
      const rec=document.createElement('a');rec.href='records.html';rec.className='niji-record-link';rec.textContent='記録';
      const pill=top.querySelector('.pill');
      if(pill) top.insertBefore(rec,pill); else top.appendChild(rec);
    }
  } else if(!top && !excluded.includes(file) && !body.querySelector('.site-header')){
    const bar=document.createElement('div');bar.className='niji-auto-top';
    const title=(document.querySelector('h1')?.textContent||document.title||'にじフラ').trim();
    bar.innerHTML=`<div class="niji-auto-top-inner"><a href="index.html">← TOP</a><a href="records.html">記録</a><div class="niji-auto-title"></div></div>`;
    bar.querySelector('.niji-auto-title').textContent=title;
    body.insertBefore(bar,body.firstChild);
  }
  const isPlayPage=body.classList.contains('legacy-play')||body.classList.contains('game-body')||!!body.querySelector('#startBtn,.playArea,.tenChoices,.colorGrid,.visionArea');
  if(isPlayPage){
    let focusButton=document.getElementById('focusBtn');
    const ensureExit=()=>{
      let x=document.getElementById('nijiFocusExit');
      if(!x){x=document.createElement('button');x.type='button';x.id='nijiFocusExit';x.className='niji-focus-exit';x.textContent='集中モードを終了';x.hidden=true;document.body.appendChild(x)}
      return x;
    };
    const setFocus=on=>{
      body.classList.toggle('focus-mode',!!on);
      if(focusButton)focusButton.textContent=on?'通常画面':'集中モード';
      const exit=ensureExit();exit.hidden=!on;
      if(on){setTimeout(()=>{(body.querySelector('.play-card')||body.querySelector('main.wrap>section.panel')||body.querySelector('main'))?.scrollIntoView({block:'start'})},30)}
    };
    if(!focusButton){
      if(top){focusButton=document.createElement('button');focusButton.type='button';focusButton.id='focusBtn';focusButton.className='niji-focus-toggle';focusButton.textContent='集中モード';const pill=top.querySelector('.pill');if(pill)top.insertBefore(focusButton,pill);else top.appendChild(focusButton)}
      else if(body.querySelector('.niji-auto-top-inner')){focusButton=document.createElement('button');focusButton.type='button';focusButton.id='focusBtn';focusButton.className='niji-focus-toggle';focusButton.textContent='集中モード';body.querySelector('.niji-auto-top-inner').insertBefore(focusButton,body.querySelector('.niji-auto-title'))}
    }
    if(focusButton)focusButton.addEventListener('click',()=>setFocus(!body.classList.contains('focus-mode')));
    ensureExit().addEventListener('click',()=>setFocus(false));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&body.classList.contains('focus-mode'))setFocus(false)});
  }
  document.querySelectorAll('a.card,a.menu').forEach(a=>{if(!a.getAttribute('aria-label')){const t=a.querySelector('h3,.title')?.textContent?.trim();if(t)a.setAttribute('aria-label',t+'を開く')}});
})();
