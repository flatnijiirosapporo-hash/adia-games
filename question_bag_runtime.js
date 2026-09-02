'use strict';

function fisherYates(values,random=Math.random){
  const a=values.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function createQuestionBag({storage,gameId,difficulty='all',bankVersion='v1',ids,random=Math.random}){
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function') throw new Error('storage is required');
  if(!gameId) throw new Error('gameId is required');
  const uniqueIds=[...new Set((ids||[]).map(String))];
  if(!uniqueIds.length) throw new Error('ids must not be empty');
  const key=`nijifla_qbag_v1:${gameId}:${difficulty}`;
  const idSet=new Set(uniqueIds);

  function read(){
    try{
      const raw=storage.getItem(key);
      return raw?JSON.parse(raw):null;
    }catch{return null;}
  }
  function write(state){
    storage.setItem(key,JSON.stringify(state));
  }
  function fresh(){
    const state={bankVersion,order:fisherYates(uniqueIds,random),cursor:0,knownIds:uniqueIds.slice()};
    write(state);
    return state;
  }
  function reconcile(state){
    if(!state||!Array.isArray(state.order)||!Number.isInteger(state.cursor)) return fresh();
    const oldOrder=state.order.map(String);
    const oldCursor=Math.max(0,Math.min(state.cursor,oldOrder.length));
    const consumed=[];
    const seenConsumed=new Set();
    for(const id of oldOrder.slice(0,oldCursor)){
      if(idSet.has(id)&&!seenConsumed.has(id)){seenConsumed.add(id);consumed.push(id);}
    }
    const remaining=[];
    const seenRemaining=new Set();
    for(const id of oldOrder.slice(oldCursor)){
      if(idSet.has(id)&&!seenConsumed.has(id)&&!seenRemaining.has(id)){seenRemaining.add(id);remaining.push(id);}
    }
    const newIds=uniqueIds.filter(id=>!seenConsumed.has(id)&&!seenRemaining.has(id));
    const mustRewrite=state.bankVersion!==bankVersion ||
      !Array.isArray(state.knownIds) ||
      state.knownIds.length!==uniqueIds.length ||
      state.knownIds.some(id=>!idSet.has(String(id))) ||
      newIds.length>0 || consumed.length+remaining.length!==uniqueIds.length;
    if(!mustRewrite) return state;
    const tail=fisherYates([...remaining,...newIds],random);
    const next={bankVersion,order:[...consumed,...tail],cursor:consumed.length,knownIds:uniqueIds.slice()};
    write(next);
    return next;
  }

  let state=reconcile(read());

  function rollover(exclude=new Set()){
    const shuffled=fisherYates(uniqueIds,random);
    if(exclude.size){
      const safe=shuffled.filter(id=>!exclude.has(id));
      const repeated=shuffled.filter(id=>exclude.has(id));
      state={bankVersion,order:[...safe,...repeated],cursor:0,knownIds:uniqueIds.slice()};
    }else{
      state={bankVersion,order:shuffled,cursor:0,knownIds:uniqueIds.slice()};
    }
    write(state);
  }

  function draw(count=1){
    const requested=Math.max(0,Math.floor(Number(count)||0));
    if(!requested) return [];
    if(requested>uniqueIds.length) throw new Error(`draw count ${requested} exceeds unique bank size ${uniqueIds.length}`);
    const result=[];
    const used=new Set();
    while(result.length<requested){
      if(state.cursor>=state.order.length) rollover(used);
      const id=state.order[state.cursor++];
      if(!idSet.has(id)) continue;
      if(used.has(id)) continue;
      result.push(id);
      used.add(id);
      write(state);
    }
    return result;
  }
  function remaining(){return Math.max(0,state.order.length-state.cursor);}
  function reset(){rollover();return remaining();}

  return {draw,remaining,reset,key};
}

const api={createQuestionBag,fisherYates};
if(typeof module!=='undefined'&&module.exports) module.exports=api;
if(typeof window!=='undefined') window.NIJI_QUESTION_BAG_RUNTIME=api;
