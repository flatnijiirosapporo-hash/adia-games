(function(){
'use strict';
if(!window.NIJI_RESULT)return;
const skip=/^(index|sst|parent|growth|movement|park)\.html$/i.test((location.pathname.split('/').pop()||''));
if(skip)return;
const b=document.createElement('button');
b.type='button'; b.id='nijiflaUniversalReport'; b.textContent='📄 結果・評価を印刷';
b.setAttribute('aria-label','結果と評価をA4で印刷');
Object.assign(b.style,{position:'fixed',right:'16px',bottom:'16px',zIndex:'9998',border:'0',borderRadius:'999px',padding:'12px 18px',fontWeight:'900',fontSize:'16px',background:'#0f766e',color:'#fff',boxShadow:'0 10px 28px rgba(15,118,110,.28)',cursor:'pointer',display:'none'});
document.body.appendChild(b);
function reportVisible(){
  const rep=document.querySelector('#report:not(.hidden), .report:not(.hidden)');
  if(rep && rep.textContent.trim().length>8)return true;
  const retry=[...document.querySelectorAll('button,a')].some(x=>/もう1回|もう一回/.test(x.textContent||'') && x.offsetParent!==null);
  const ended=/おしまい|終了|レポート/.test((document.querySelector('#msg')?.textContent||'')+' '+(document.querySelector('#scene')?.textContent||''));
  return retry||ended;
}
function refresh(){b.style.display=reportVisible()?'block':'none'}
new MutationObserver(refresh).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']});
setInterval(refresh,1200); refresh();
b.onclick=()=>{
  const rep=document.querySelector('#report:not(.hidden), .report:not(.hidden)');
  const txt=(rep?.textContent||document.querySelector('#msg')?.textContent||document.querySelector('#scene')?.textContent||'').replace(/\s+/g,' ').trim();
  const score=(txt.match(/(\d+(?:\.\d+)?\s*(?:\/\s*\d+|点|秒|匹|個|HIT|ポイント))/)||[])[1]||'';
  const rec=window.NIJI_RESULT.save({title:document.querySelector('h1')?.textContent||document.title,score,detail:txt,source:location.pathname.split('/').pop()||''});
  location.href=NIJI_RESULT.reportUrl(rec);
};
})();
