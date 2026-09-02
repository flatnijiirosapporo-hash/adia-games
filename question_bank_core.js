'use strict';

function normalizeText(value){
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u3000]+/g,'')
    .replace(/[、。，．・：；？！!?「」『』（）()［］\[\]【】〈〉《》“”\"'`´]/g,'');
}

function normalizeQuestion(q={}){
  const choices=Array.isArray(q.choices)?q.choices.map(v=>String(v ?? '').normalize('NFKC').trim()):[];
  return {
    ...q,
    id:String(q.id ?? '').normalize('NFKC').trim(),
    difficulty:String(q.difficulty ?? 'all').normalize('NFKC').trim().toLowerCase(),
    prompt:String(q.prompt ?? '').normalize('NFKC').trim(),
    answer:String(q.answer ?? '').normalize('NFKC').trim(),
    choices,
    category:String(q.category ?? '').normalize('NFKC').trim(),
    stimulusKey:String(q.stimulusKey ?? '').normalize('NFKC').trim()
  };
}

function semanticKey(q={}){
  const n=normalizeQuestion(q);
  const choices=n.choices.map(normalizeText).sort();
  return JSON.stringify({
    prompt:normalizeText(n.prompt),
    answer:normalizeText(n.answer),
    choices,
    stimulusKey:normalizeText(n.stimulusKey)
  });
}

function validateFixedBank(bank,options={}){
  const list=Array.isArray(bank)?bank:[];
  const minCount=Number.isFinite(Number(options.minCount))?Number(options.minCount):0;
  const requireChoices=!!options.requireChoices;
  const ids=[];
  const idCount=new Map();
  const semanticMap=new Map();
  const difficultyCounts={easy:0,normal:0,challenge:0,all:0};
  const categoryCounts={};
  const errors=[];

  if(list.length<minCount) errors.push(`minCount: expected at least ${minCount}, got ${list.length}`);

  list.forEach((raw,index)=>{
    const q=normalizeQuestion(raw);
    const label=q.id||`index ${index}`;
    if(!q.id) errors.push(`${label}: empty id`);
    if(!q.prompt) errors.push(`${label}: empty prompt`);
    if(!q.answer) errors.push(`${label}: empty answer`);
    if(q.id){
      ids.push(q.id);
      idCount.set(q.id,(idCount.get(q.id)||0)+1);
    }
    const diff=['easy','normal','challenge'].includes(q.difficulty)?q.difficulty:'all';
    if(diff!=='all') difficultyCounts[diff]+=1;
    difficultyCounts.all+=1;
    if(q.category) categoryCounts[q.category]=(categoryCounts[q.category]||0)+1;

    if(requireChoices && q.choices.length<2) errors.push(`${label}: choices required`);
    if(q.choices.length){
      const normalizedChoices=q.choices.map(normalizeText);
      if(new Set(normalizedChoices).size!==normalizedChoices.length) errors.push(`${label}: duplicate choices`);
      if(q.answer && !normalizedChoices.includes(normalizeText(q.answer))) errors.push(`${label}: answer missing from choices`);
    }

    const sk=semanticKey(q);
    if(!semanticMap.has(sk)) semanticMap.set(sk,[]);
    semanticMap.get(sk).push({id:q.id,index});
  });

  const duplicateIds=[...idCount.entries()].filter(([,count])=>count>1).map(([id])=>id).sort();
  duplicateIds.forEach(id=>errors.push(`duplicate id: ${id}`));
  const semanticDuplicates=[...semanticMap.entries()]
    .filter(([,items])=>items.length>1)
    .map(([key,items])=>({key,items}));
  semanticDuplicates.forEach(group=>errors.push(`semantic duplicate: ${group.items.map(x=>x.id||`#${x.index}`).join(',')}`));

  return {
    count:list.length,
    ids,
    difficultyCounts,
    duplicateIds,
    semanticDuplicates,
    errors,
    categoryCounts
  };
}

const api={normalizeText,normalizeQuestion,semanticKey,validateFixedBank};
if(typeof module!=='undefined'&&module.exports) module.exports=api;
if(typeof window!=='undefined') window.NIJI_QUESTION_BANK_CORE=api;
