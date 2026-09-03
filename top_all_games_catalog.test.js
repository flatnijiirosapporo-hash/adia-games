'use strict';
const fs=require('fs');
const vm=require('vm');
const path=require('path');
const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'assets/game_catalog.js'),'utf8'),context);
const games=context.window.NIJI_GAMES||[];
const ids=new Set(games.map(g=>g.id));
const required=[
  'balloonTap','moguraTataki','colorTouchStandalone','hiraganaTouchStandalone','memoryGameStandalone',
  'visionTrainingHub','visionStarStandalone','visionSameStandalone','visionNumberStandalone',
  'sstSessionStandalone','sstQuizStandalone','sstRoleplayStandalone','sstEmotionStandalone','sstCustomStandalone',
  'sstSkillHelp','sstSkillRefuse','sstSkillFeel','sstSkillListen','sstSkillRepair','sstSkillPerspective',
  'feelingChoiceStandalone','turnWaitingStandalone','troubleResponseStandalone','sstReflectionStandalone'
];
const missing=required.filter(id=>!ids.has(id));
if(missing.length){
  console.error('Missing TOP game cards:',missing.join(', '));
  process.exit(1);
}
if(games.length!==86){
  console.error(`Expected 86 TOP cards, got ${games.length}`);
  process.exit(1);
}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!index.includes('<span id="gameCount">86</span>')){
  console.error('index.html gameCount is not 86');
  process.exit(1);
}
console.log('PASS: all 86 TOP game cards are registered');
