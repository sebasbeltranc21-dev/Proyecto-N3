import {label,oval,rect} from './art.js';
import {nativeActor,stamp} from './atlas.js';
import {drawHero,drawOpponent} from './actors.js';
import {drawArena} from './village-art.js';
import {drawCaldera} from './battle-plus-art.js';
import {drawMimicKing} from './king-art.js';
import {drawUprightWeapon} from './weapon-art.js';
import {diamondIndex} from './engine.js';
import {worlds} from './world.js';

function hero(g,game,t,x,y,walking,weapon=game.weapon){
 drawHero(g,{hero:{x,y},data:{inside:false},time:t,walk:walking,face:1,weapon},true);
}

function motes(g,t,x,y,spread,height,palette){
 for(let i=0;i<22;i++){
  const px=x-spread/2+(i*37+Math.sin(t*2+i)*10+spread)%spread;
  const py=y-(t*(23+i%5)+i*17)%height;
  const color=palette[i%palette.length];
  rect(g,color,px,py,2,2+i%2);
  if(i%7===0&&Math.sin(t*4+i)>.15){
   rect(g,color,px-2,py+1,6,1);rect(g,color,px+1,py-2,1,6);
  }
 }
}

function liftSword(g,t,x,y,diamond,raise){
 const pulse=Math.round(Math.sin(t*5)*4);
 const gold=['#fff0b4','#edc682','#e7aa62'];
 const jade=['#e5ffff','#61e7e7','#2399a7'];
 oval(g,diamond?'#53ede94d':'#ffcf6844',x,y-5,40+pulse,10);
 const sy=y-38+Math.round(Math.sin(t*4)*4)-raise*13;
 drawUprightWeapon(g,diamond?diamondIndex:4,x,sy,diamond?1.5:1.35);
 motes(g,t,x,y+8,112,112,diamond?jade:gold);
}

export function drawCinematicScene(g,game,b,t,bt,camera,drawMap){
 if(b.stage==='map'||b.stage==='sword_shrine'){
  if(drawMap)drawMap(camera,b,t);
  else drawArena(g,b.zone??game.data.zone,t);
  if(b.tint)rect(g,b.tint,0,0,640,336);
  if(b.stage==='sword_shrine'){
   const chest=worlds[3].chest;
   const x=chest.x-camera.x,y=chest.y-camera.y;
   nativeActor(g,'hero',16+15,x-35,y+4,1);
   liftSword(g,t,x,y,false,Math.min(1,bt*1.5));
  }
  return;
 }

 if(b.stage==='diamond_shrine'){
  drawCaldera(g,t);
  stamp(g,'props',13,320,206,44);
  nativeActor(g,'hero',16+15,275,214,1);
  liftSword(g,t,320,201,true,b.raise?Math.min(1,bt*1.4):0);
  return;
 }

 drawArena(g,b.zone??3,t);
 if(b.stage==='boss_intro'){
  const enter=Math.min(1,bt*1.6);
  const e={x:520-enter*75,y:207,face:-1,walk:enter<1,wind:enter===1?.25:0,windDuration:.7};
  hero(g,game,t,110+enter*74,207,enter<1);
  drawOpponent(g,e,b.zone,t,true,false,184);
 }else if(b.stage==='throne'){
  const enter=Math.min(1,t*.7);
  const kx=480-Math.min(1,Math.max(0,(t-.4)*.8))*35;
  hero(g,game,t,92+enter*92,206,enter<1,4);
  drawMimicKing(g,{
   x:kx,y:204,face:-1,phase:1,walk:t>.4&&kx>445,phaseDelay:b.step,
   wind:b.step===2?Math.max(.12,.9-bt*.72):0,windDuration:.9
  },t);
 }else if(b.stage==='epilogue'){
  hero(g,game,t,224,205,false,4);
  g.save();
  g.globalAlpha=Math.max(.13,1-t*.27);
  drawMimicKing(g,{x:428,y:211,face:-1,phase:3,hurt:1},t);
  g.restore();
  motes(g,t,417,218,160,130,['#ffd990','#c1fff0','#e28bbd']);
 }
}

export function drawCinematicFrame(g,title,t){
 const bar=Math.min(26,Math.floor(t*42/2)*2);
 if(!bar)return;
 rect(g,'#0b141a',0,0,640,bar);
 rect(g,'#0b141a',0,336-bar,640,bar);
 if(bar>=6){
  rect(g,'#805941',0,bar-2,640,2);
  rect(g,'#d5ac68',0,bar-2,640,1);
  rect(g,'#d5ac68',0,336-bar,640,1);
 }
 if(bar>=22&&title)label(g,title.toUpperCase(),320,16,'#ffdd91',9);
}
