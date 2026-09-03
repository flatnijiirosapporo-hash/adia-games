(function(root,factory){
  if(typeof module==='object'&&module.exports){module.exports=factory();}
  else{root.WorldTripCore=factory();}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const EARTH_CIRCUMFERENCE_KM=40075;
  const TARGET_SECONDS=300;
  const KM_PER_SECOND=EARTH_CIRCUMFERENCE_KM/TARGET_SECONDS;
  const ROUTE_SCENES=[
    {id:'asakusa',start:0,name:'浅草・雷門',country:'日本・東京',landmark:'sensoji',theme:'city',obstacles:['人','自転車','タクシー']},
    {id:'pacific1',start:5,name:'太平洋',country:'日本から東へ',landmark:'ocean',theme:'ocean',obstacles:['船','カモメ','飛び魚']},
    {id:'hawaii',start:10,name:'ハワイ・ダイヤモンドヘッド',country:'アメリカ',landmark:'diamondhead',theme:'tropical',obstacles:['サーファー','カモメ','ボート']},
    {id:'sanfrancisco',start:16,name:'サンフランシスコ',country:'アメリカ',landmark:'goldengate',theme:'city',obstacles:['車','ケーブルカー','カモメ']},
    {id:'grandcanyon',start:22,name:'グランドキャニオン',country:'アメリカ',landmark:'canyon',theme:'desert',obstacles:['ワシ','車','コヨーテ']},
    {id:'newyork',start:28,name:'ニューヨーク・自由の女神',country:'アメリカ',landmark:'liberty',theme:'city',obstacles:['黄色いタクシー','人','ハト']},
    {id:'rio',start:35,name:'リオデジャネイロ',country:'ブラジル',landmark:'christ',theme:'tropical',obstacles:['人','オウム','車']},
    {id:'africa',start:42,name:'アフリカ・サバンナ',country:'アフリカ',landmark:'kilimanjaro',theme:'savanna',obstacles:['シマウマ','ダチョウ','サファリカー']},
    {id:'paris',start:49,name:'パリ・エッフェル塔',country:'フランス',landmark:'eiffel',theme:'city',obstacles:['自転車','車','ハト']},
    {id:'egypt',start:56,name:'ギザのピラミッド',country:'エジプト',landmark:'pyramids',theme:'desert',obstacles:['ラクダ','車','鳥']},
    {id:'dubai',start:62,name:'ドバイ・ブルジュ・ハリファ',country:'UAE',landmark:'burj',theme:'desertCity',obstacles:['車','人','ハヤブサ']},
    {id:'india',start:68,name:'アグラ・タージマハル',country:'インド',landmark:'taj',theme:'warm',obstacles:['リキシャ','牛','鳥']},
    {id:'angkor',start:74,name:'アンコールワット',country:'カンボジア',landmark:'angkor',theme:'jungle',obstacles:['トゥクトゥク','人','鳥']},
    {id:'china',start:80,name:'万里の長城',country:'中国',landmark:'greatwall',theme:'mountain',obstacles:['自転車','人','鳥']},
    {id:'fuji',start:87,name:'富士山',country:'日本',landmark:'fuji',theme:'japan',obstacles:['登山者','車','鳥']},
    {id:'tokyo',start:93,name:'東京へ帰ってきた！',country:'日本・東京',landmark:'tokyo',theme:'city',obstacles:['人','自転車','タクシー']},
    {id:'skytree',start:98,name:'東京スカイツリー',country:'日本・東京',landmark:'skytree',theme:'city',obstacles:['人','車','鳥']}
  ];
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function distanceAtSeconds(seconds){return Math.round(clamp(Number(seconds)||0,0,TARGET_SECONDS)*KM_PER_SECOND);}
  function remainingKmAtSeconds(seconds){return Math.max(0,EARTH_CIRCUMFERENCE_KM-distanceAtSeconds(seconds));}
  function progressAtSeconds(seconds){return clamp((Number(seconds)||0)/TARGET_SECONDS*100,0,100);}
  function sceneAtProgress(progress){
    const p=clamp(Number(progress)||0,0,100);
    let scene=ROUTE_SCENES[0];
    for(const candidate of ROUTE_SCENES){if(p>=candidate.start)scene=candidate;else break;}
    return scene;
  }
  function sceneIndexAtProgress(progress){return ROUTE_SCENES.indexOf(sceneAtProgress(progress));}
  function localSceneProgress(progress){
    const p=clamp(Number(progress)||0,0,100),i=sceneIndexAtProgress(p),a=ROUTE_SCENES[i].start,b=i<ROUTE_SCENES.length-1?ROUTE_SCENES[i+1].start:100;
    return b===a?1:clamp((p-a)/(b-a),0,1);
  }
  function rectsOverlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}
  function formatKm(value){return Math.max(0,Math.round(value)).toLocaleString('ja-JP');}
  return {EARTH_CIRCUMFERENCE_KM,TARGET_SECONDS,KM_PER_SECOND,ROUTE_SCENES,clamp,distanceAtSeconds,remainingKmAtSeconds,progressAtSeconds,sceneAtProgress,sceneIndexAtProgress,localSceneProgress,rectsOverlap,formatKm};
});
