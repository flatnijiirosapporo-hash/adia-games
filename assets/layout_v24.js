(()=>{
  'use strict';
  const body=document.body;if(!body)return;
  body.classList.add('niji-v24');
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file==='index.html'||file==='') body.classList.add('home-v24');
  const redirects=['sst_help.html','sst_listening.html','sst_random.html','sst_repair.html','sst_tell.html'];
  if(redirects.includes(file))return;
  if(body.querySelector('main.wrap > section.panel') && (body.querySelector('#startBtn')||body.querySelector('.playArea,.choices,.tenChoices,.colorGrid,.visionArea'))) body.classList.add('legacy-play');
  const top=body.querySelector('.top .nav');
  const excluded=['index.html','records.html','result_report.html','sst_report.html','tkk_games.html'];
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
