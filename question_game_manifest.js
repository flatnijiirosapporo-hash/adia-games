'use strict';
const CATALOG_IDS=[
'tensec','directions','janken','colorquiz','stick','maze','bottle','slide15','girigiri','bomb','bugfind','bugcatch','tap10','tap50','make10','make10drop','multblock','primeblock','numorder','shapequiz','divisor','commondiv','commonmult','calcmaze','hiramemory','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','story','continents','prefecture','dice','roulette','bingo','dicetalk','traffic','words','dayword','shopping','stamp','shapeDrop','moraread','kanjipuzzle','bushu','palindrome','idiomsearch','dagashi','moneycount','exchange','threepoint','flatoreHub','movementHub','dangerHub','cognitiveHub','sstHub','shapePuzzle','numberHighLow','flagGame','balloonTap','moguraTataki','colorTouchStandalone','hiraganaTouchStandalone','memoryGameStandalone','visionTrainingHub','visionStarStandalone','visionSameStandalone','visionNumberStandalone','sstSessionStandalone','sstQuizStandalone','sstRoleplayStandalone','sstEmotionStandalone','sstCustomStandalone','sstSkillHelp','sstSkillRefuse','sstSkillFeel','sstSkillListen','sstSkillRepair','sstSkillPerspective','feelingChoiceStandalone','turnWaitingStandalone','troubleResponseStandalone','sstReflectionStandalone','moonJump'];
const tkkFixed=['colorquiz','shapequiz','hiraarrange','kataarrange','hirasearch','katasearch','idiomarrange','continents','prefecture','dicetalk','traffic','words','moraread','kanjipuzzle','bushu','palindrome','idiomsearch'];
const inlineFixed={
 dangerHub:['danger_game.html','danger'],
 cognitiveHub:['cognitive_check_10min.html','cognitive'],
 sstQuizStandalone:['sst_quiz.html','sstQuiz'],
 sstRoleplayStandalone:['sst_roleplay.html','sstRoleplay'],
 sstSkillHelp:['sst_skills.html','help'],sstSkillRefuse:['sst_skills.html','refuse'],sstSkillFeel:['sst_skills.html','feel'],sstSkillListen:['sst_skills.html','listen'],sstSkillRepair:['sst_skills.html','repair'],sstSkillPerspective:['sst_skills.html','perspective'],
 feelingChoiceStandalone:['feeling_choice.html','feelingChoice'],turnWaitingStandalone:['turn_waiting.html','turnWaiting'],troubleResponseStandalone:['trouble_response.html','troubleResponse']
};
const generated=['make10','make10drop','multblock','primeblock','divisor','commondiv','commonmult','calcmaze','dayword','shopping','dagashi','moneycount','exchange'];
const existing=['story','hiramemory','flagGame','numberHighLow'];
const rows=[];
for(const id of tkkFixed)rows.push({id,mode:'fixed500',sourceType:'tkkFixed',bankId:id});
for(const [id,[file,marker]] of Object.entries(inlineFixed))rows.push({id,mode:'fixed500',sourceType:'inlineFixed',file,marker});
rows.push({id:'shapePuzzle',mode:'fixed500',sourceType:'shapePuzzle'});
for(const id of generated)rows.push({id,mode:'generated500',sourceType:'tkkGenerated',generatorId:id});
for(const id of existing)rows.push({id,mode:'existingRich',sourceType:id});
const used=new Set(rows.map(x=>x.id));for(const id of CATALOG_IDS)if(!used.has(id))rows.push({id,mode:'nonQuestion',sourceType:'routeGuard'});
module.exports=rows;
module.exports.CATALOG_IDS=CATALOG_IDS;
