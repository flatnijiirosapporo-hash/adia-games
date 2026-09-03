(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.MoonJumpCore=factory();}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const MOON_DISTANCE_KM=384400;
  const TARGET_SECONDS=300;
  const KM_PER_SECOND=MOON_DISTANCE_KM/TARGET_SECONDS;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function distanceAtSeconds(seconds){
    return Math.round(clamp(Number(seconds)||0,0,TARGET_SECONDS)*KM_PER_SECOND);
  }
  function remainingKmAtSeconds(seconds){return Math.max(0,MOON_DISTANCE_KM-distanceAtSeconds(seconds));}
  function progressAtSeconds(seconds){return clamp((Number(seconds)||0)/TARGET_SECONDS*100,0,100);}
  function rectsOverlap(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }
  function formatKm(value){return Math.max(0,Math.round(value)).toLocaleString('ja-JP');}
  return {MOON_DISTANCE_KM,TARGET_SECONDS,KM_PER_SECOND,clamp,distanceAtSeconds,remainingKmAtSeconds,progressAtSeconds,rectsOverlap,formatKm};
});
