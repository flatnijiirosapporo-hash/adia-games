(function(){
'use strict';
const KEY='nijifla_game_results_v22';
const LEGACY_KEY='nijifla_game_results_v21';
const LAST='nijifla_last_result_v22';
const LEGACY_LAST='nijifla_last_result_v21';
const EVAL_KEY='nijifla_result_evaluations_v22';
const LEGACY_FORM_PREFIX='nijifla_report_form_v21_';
const SCHEMA='2.5';
const CONTEXT_KEY='nijifla_session_context_v25';

const MEM_STORE={};
function lsGet(k){try{return localStorage.getItem(k)}catch{return Object.prototype.hasOwnProperty.call(MEM_STORE,k)?MEM_STORE[k]:null}}
function lsSet(k,v){const val=String(v);try{localStorage.setItem(k,val)}catch{MEM_STORE[k]=val}}
function lsRemove(k){try{localStorage.removeItem(k)}catch{delete MEM_STORE[k]}}
function lsKeys(){try{return Object.keys(localStorage)}catch{return Object.keys(MEM_STORE)}}


function sessionContext(){
  try{
    const q=new URLSearchParams(location.search);const saved=parse(CONTEXT_KEY,{});
    return {child:clean(q.get('child')||saved.child||''),staff:clean(q.get('staff')||saved.staff||'')};
  }catch{return parse(CONTEXT_KEY,{})||{}}
}
function saveSessionContext(patch={}){const cur=sessionContext();const next={...cur,...patch,updatedAt:new Date().toISOString()};if(!next.child)delete next.child;if(!next.staff)delete next.staff;lsSet(CONTEXT_KEY,JSON.stringify(next));return next}

function clean(v){
  if(typeof document==='undefined') return String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const d=document.createElement('div'); d.innerHTML=String(v??'');
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}
function parse(key,fallback){try{const x=JSON.parse(lsGet(key)||'');return x??fallback}catch{return fallback}}
function uniqById(arr){const m=new Map();for(const x of arr||[]){if(x&&x.id&&!m.has(x.id))m.set(x.id,x)}return [...m.values()]}
function normalizeRecord(data={}){
  const now=new Date();
  return {
    id:clean(data.id)||('r'+now.getTime().toString(36)+Math.random().toString(36).slice(2,7)),
    createdAt:data.createdAt||now.toISOString(),
    title:clean(data.title||document.querySelector('h1')?.textContent||document.title||'ゲーム'),
    category:clean(data.category||''), score:clean(data.score||''), detail:clean(data.detail||''),
    success:typeof data.success==='boolean'?data.success:null,
    durationSec:Number.isFinite(Number(data.durationSec))?Math.max(0,Math.round(Number(data.durationSec))):null,
    type:clean(data.type||'game')||'game', source:clean(data.source||location.pathname.split('/').pop()||''),
    extra:data.extra??null
  };
}
function migrate(){
  const current=parse(KEY,[]); if(current.length)return;
  const old=parse(LEGACY_KEY,[]); if(old.length){lsSet(KEY,JSON.stringify(uniqById(old).slice(0,1000)));const oldLast=lsGet(LEGACY_LAST);if(oldLast)lsSet(LAST,oldLast)}
}
function list(){migrate();return uniqById(parse(KEY,[])).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))}
function persist(all){lsSet(KEY,JSON.stringify(uniqById(all).slice(0,1000)))}
function save(data){const c=sessionContext();let payload={...data};if(c.child||c.staff){const ex=(data.extra&&typeof data.extra==='object'&&!Array.isArray(data.extra))?data.extra:{};payload.extra={...ex,sessionContext:{child:c.child||'',staff:c.staff||''}}}const rec=normalizeRecord(payload);const all=list().filter(x=>x.id!==rec.id);all.unshift(rec);persist(all);lsSet(LAST,rec.id);return rec}
function get(id){return list().find(x=>x.id===id)||null}
function update(id,patch={}){const all=list();const i=all.findIndex(x=>x.id===id);if(i<0)return null;all[i]={...all[i],...patch,id:all[i].id};persist(all);return all[i]}
function remove(id){persist(list().filter(x=>x.id!==id));const ev=parse(EVAL_KEY,{});delete ev[id];lsSet(EVAL_KEY,JSON.stringify(ev));lsRemove(LEGACY_FORM_PREFIX+id);if(lsGet(LAST)===id)lsRemove(LAST);return true}
function clearAll(){[KEY,LEGACY_KEY,LAST,LEGACY_LAST,EVAL_KEY,'nijifla_sst_records','nijifla_sst_quiz_records'].forEach(lsRemove);lsKeys().filter(k=>k.startsWith(LEGACY_FORM_PREFIX)).forEach(lsRemove)}
function evaluations(){return parse(EVAL_KEY,{})}
function getEvaluation(id){const ev=evaluations();if(ev[id])return ev[id];const legacy=parse(LEGACY_FORM_PREFIX+id,null);return legacy||{}}
function saveEvaluation(id,data={}){const ev=evaluations();ev[id]={...data,updatedAt:new Date().toISOString()};lsSet(EVAL_KEY,JSON.stringify(ev));return ev[id]}
function getLastId(){return lsGet(LAST)||lsGet(LEGACY_LAST)||''}
function reportUrl(recOrId){const r=typeof recOrId==='string'?get(recOrId):recOrId;if(!r)return 'result_report.html';let u='result_report.html?id='+encodeURIComponent(r.id);try{const bridge={record:r,evaluation:getEvaluation(r.id)};u+='&r='+encodeURIComponent(JSON.stringify(bridge))}catch{}try{const c=sessionContext();if(c.child)u+='&child='+encodeURIComponent(c.child);if(c.staff)u+='&staff='+encodeURIComponent(c.staff)}catch{}return u}
function open(rec){const r=rec&&rec.id?rec:save(rec||{});location.href=reportUrl(r)}
function openNew(rec){const r=rec&&rec.id?rec:save(rec||{});window.open(reportUrl(r),'_blank')}
function capturePage(opts={}){const title=opts.title||document.querySelector('h1')?.textContent||document.title;const report=document.querySelector('#report:not(.hidden), .report:not(.hidden), .reportScreen');const msg=report?.textContent||document.querySelector('#msg')?.textContent||document.querySelector('#scene')?.textContent||'';return save({title,category:opts.category||'',score:opts.score||'',detail:opts.detail||msg,success:opts.success,type:opts.type||'game',source:location.pathname.split('/').pop()||''})}
function exportAll(){
  return {schemaVersion:SCHEMA,exportedAt:new Date().toISOString(),results:list(),evaluations:evaluations(),sstRecords:parse('nijifla_sst_records',[]),sstQuizRecords:parse('nijifla_sst_quiz_records',[])};
}
function importAll(payload,mode='merge'){
  if(!payload||!Array.isArray(payload.results))throw new Error('対応していないバックアップ形式です');
  const incoming=payload.results.map(normalizeRecord);
  const merged=mode==='replace'?incoming:uniqById([...incoming,...list()]);persist(merged);
  const currentEv=mode==='replace'?{}:evaluations();const inEv=(payload.evaluations&&typeof payload.evaluations==='object')?payload.evaluations:{};lsSet(EVAL_KEY,JSON.stringify({...currentEv,...inEv}));
  if(Array.isArray(payload.sstRecords)){const old=mode==='replace'?[]:parse('nijifla_sst_records',[]);const combo=[...old,...payload.sstRecords];const seen=new Set(),uniq=[];for(const x of combo){const k=JSON.stringify(x);if(!seen.has(k)){seen.add(k);uniq.push(x)}}lsSet('nijifla_sst_records',JSON.stringify(uniq.slice(-1000)))}
  if(Array.isArray(payload.sstQuizRecords)){const old=mode==='replace'?[]:parse('nijifla_sst_quiz_records',[]);const combo=[...old,...payload.sstQuizRecords];const seen=new Set(),uniq=[];for(const x of combo){const k=JSON.stringify(x);if(!seen.has(k)){seen.add(k);uniq.push(x)}}lsSet('nijifla_sst_quiz_records',JSON.stringify(uniq.slice(-1000)))}
  return {results:merged.length,evaluations:Object.keys({...currentEv,...inEv}).length};
}
window.NIJI_RESULT={save,list,get,update,remove,clearAll,getEvaluation,saveEvaluation,getLastId,reportUrl,open,openNew,capturePage,exportAll,importAll,sessionContext,saveSessionContext,clean,KEY,LAST,EVAL_KEY,SCHEMA};
})();
