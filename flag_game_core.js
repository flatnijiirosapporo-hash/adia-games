(function(){
  'use strict';
  const LIMITS={easy:40,normal:100,challenge:201};
  function poolForDifficulty(master,level){const limit=LIMITS[level]||40;return master.filter(x=>x.difficultyRank<=limit);}
  function shuffled(items,rng=Math.random){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999999,rng()))*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function sampleUnique(items,count,rng=Math.random){return shuffled(items,rng).slice(0,Math.min(count,items.length));}
  function similarScore(a,b){let s=0;for(const c of a.colors||[])if((b.colors||[]).includes(c))s+=2;for(const x of a.symbols||[])if((b.symbols||[]).includes(x))s+=3;for(const x of a.layout||[])if((b.layout||[]).includes(x))s+=1;return s;}
  function buildNameQuiz(master,level,count=10,rng=Math.random){
    const pool=poolForDifficulty(master,level),answers=sampleUnique(pool,count,rng);
    return answers.map(ans=>{
      const wrongPool=pool.filter(x=>x.id!==ans.id).sort((a,b)=>similarScore(ans,b)-similarScore(ans,a));
      const top=wrongPool.slice(0,Math.max(8,Math.min(24,wrongPool.length)));
      const wrong=sampleUnique(top,3,rng);
      const options=shuffled([ans,...wrong],rng).map(x=>({id:x.id,name:x.nameShort,flagSymbolId:x.flagSymbolId}));
      return {answerId:ans.id,answerName:ans.nameShort,flagSymbolId:ans.flagSymbolId,region:ans.region,firstChar:Array.from(ans.nameShort)[0]||'',options};
    });
  }
  function applyNameHint(q,stage){
    if(stage===1)return {type:'region',text:`${q.region}にあるよ`};
    if(stage===2)return {type:'firstChar',text:`「${q.firstChar}」からはじまるよ`};
    const wrong=q.options.find(x=>x.id!==q.answerId);
    return {type:'reduce',text:'2つまでしぼったよ',visibleOptionIds:[q.answerId,wrong?wrong.id:q.answerId]};
  }
  function buildPairRound(master,level,rng=Math.random){
    const countries=sampleUnique(poolForDifficulty(master,level),6,rng);
    const cards=[]; countries.forEach(c=>{cards.push({cardId:`${c.id}-flag`,countryId:c.id,type:'flag',flagSymbolId:c.flagSymbolId,label:c.nameShort});cards.push({cardId:`${c.id}-name`,countryId:c.id,type:'name',label:c.nameShort});});
    return {countries,cards:shuffled(cards,rng)};
  }
  function buildCompareQuiz(master,level,count=10,rng=Math.random){
    const pool=poolForDifficulty(master,level).filter(x=>x.comparisonEligible!==false&&x.areaKm2>0&&x.population>0);
    const out=[],used=new Set();
    for(let i=0;i<count;i++){
      const metric=i%2===0?'area':'population'; let tries=0,pair;
      do{const two=sampleUnique(pool,2,rng); if(two.length<2)break; const [a,b]=two; const av=metric==='area'?a.areaKm2:a.population,bv=metric==='area'?b.areaKm2:b.population; const key=[metric,a.id,b.id].sort().join('|'); if(av!==bv&&!used.has(key)){pair=[a,b,av,bv,key];break;} tries++;}while(tries<80);
      if(!pair){const a=pool[(i*2)%pool.length],b=pool[(i*2+1)%pool.length];pair=[a,b,metric==='area'?a.areaKm2:a.population,metric==='area'?b.areaKm2:b.population,`${metric}|${a.id}|${b.id}`];}
      const [a,b,av,bv,key]=pair;used.add(key);out.push({metric,leftId:a.id,rightId:b.id,leftName:a.nameShort,rightName:b.nameShort,leftFlag:a.flagSymbolId,rightFlag:b.flagSymbolId,leftValue:av,rightValue:bv,leftYear:a.populationYear,rightYear:b.populationYear,answerId:av>bv?a.id:b.id});
    }
    return shuffled(out,rng);
  }
  function buildMapQuiz(master,level,count=10,rng=Math.random){return sampleUnique(poolForDifficulty(master,level),count,rng).map(x=>({answerId:x.id,name:x.nameShort,region:x.region,mapId:x.mapId,flagSymbolId:x.flagSymbolId}));}
  const SORT_RULES=[
    {key:'red',label:'赤がある国旗を全部えらぼう',test:x=>(x.colors||[]).includes('red')},
    {key:'blue',label:'青がある国旗を全部えらぼう',test:x=>(x.colors||[]).includes('blue')},
    {key:'star',label:'星がある国旗を全部えらぼう',test:x=>(x.symbols||[]).includes('star')},
    {key:'cross',label:'十字がある国旗を全部えらぼう',test:x=>(x.symbols||[]).includes('cross')},
    {key:'circle',label:'丸がある国旗を全部えらぼう',test:x=>(x.symbols||[]).includes('circle')},
    {key:'vertical_tricolor',label:'たて3色の国旗をえらぼう',test:x=>(x.layout||[]).includes('vertical_tricolor')},
    {key:'horizontal_tricolor',label:'よこ3色の国旗をえらぼう',test:x=>(x.layout||[]).includes('horizontal_tricolor')}
  ];
  function buildSortQuiz(master,level,count=10,rng=Math.random){
    const pool=poolForDifficulty(master,level),validRules=SORT_RULES.filter(r=>pool.some(r.test)&&pool.some(x=>!r.test(x))),out=[];
    for(let i=0;i<count;i++){
      const rule=validRules[i%validRules.length];
      const positives=shuffled(pool.filter(rule.test),rng),negatives=shuffled(pool.filter(x=>!rule.test(x)),rng);
      const pcount=Math.min(3,Math.max(1,positives.length)),ncount=Math.min(4,Math.max(1,negatives.length));
      let options=shuffled([...positives.slice(0,pcount),...negatives.slice(0,ncount)],rng);
      if(options.length<6){const used=new Set(options.map(x=>x.id));options=options.concat(sampleUnique(pool.filter(x=>!used.has(x.id)),6-options.length,rng));}
      options=options.slice(0,8); const correct=options.filter(rule.test).map(x=>x.id);
      if(correct.length===0||correct.length===options.length){i--;continue;}
      out.push({ruleKey:rule.key,label:rule.label,optionIds:options.map(x=>x.id),options:options.map(x=>({id:x.id,name:x.nameShort,flagSymbolId:x.flagSymbolId})),correctIds:correct});
    }
    return out;
  }
  function evaluateSort(q,selectedIds){const a=[...(selectedIds||[])].sort().join('|'),b=[...(q.correctIds||[])].sort().join('|');return a===b;}
  window.NIJI_FLAG_CORE={poolForDifficulty,sampleUnique,buildNameQuiz,applyNameHint,buildPairRound,buildCompareQuiz,buildMapQuiz,buildSortQuiz,evaluateSort,SORT_RULES};
})();
