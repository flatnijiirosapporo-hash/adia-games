(()=>{
'use strict';
const child=document.getElementById('sessionChild'),staff=document.getElementById('sessionStaff'),state=document.getElementById('sessionState'),clear=document.getElementById('sessionClear');
if(!child||!staff)return;
const E=s=>String(s??'');
const ctx=window.NIJI_CONTEXT?.get?.()||window.NIJI_RESULT?.sessionContext?.()||{};
child.value=ctx.child||'';staff.value=ctx.staff||'';
function meaningful(e){return e&&Object.entries(e).some(([k,v])=>k!=='updatedAt'&&String(v??'').trim())}
function options(){const children=new Set(),staffs=new Set();try{for(const r of NIJI_RESULT.list()){const e=NIJI_RESULT.getEvaluation(r.id)||{};if(e.child)children.add(e.child);if(e.staff)staffs.add(e.staff)}}catch{}
 const cl=document.getElementById('knownChildren'),sl=document.getElementById('knownStaff');if(cl)cl.innerHTML=[...children].sort().map(v=>`<option value="${E(v).replace(/"/g,'&quot;')}"></option>`).join('');if(sl)sl.innerHTML=[...staffs].sort().map(v=>`<option value="${E(v).replace(/"/g,'&quot;')}"></option>`).join('');
}
function save(show=true){const next={child:child.value.trim(),staff:staff.value.trim()};window.NIJI_CONTEXT?.set?.(next);window.NIJI_RESULT?.saveSessionContext?.(next);if(state){state.textContent=next.child||next.staff?'設定済み：このあと開く活動・A4へ引き継ぎます':'未設定';if(show)setTimeout(()=>{state.textContent=next.child||next.staff?'設定済み':'未設定'},1800)}}
child.addEventListener('change',()=>save());staff.addEventListener('change',()=>save());child.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save();staff.focus()}});staff.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();save();staff.blur()}});
clear?.addEventListener('click',()=>{child.value='';staff.value='';window.NIJI_CONTEXT?.clear?.();window.NIJI_RESULT?.saveSessionContext?.({child:'',staff:''});if(state)state.textContent='クリアしました'});
options();save(false);
})();