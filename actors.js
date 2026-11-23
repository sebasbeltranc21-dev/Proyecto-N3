import {weapons} from './engine.js';
import {nativeActor} from './atlas.js';
import {oval,rect} from './art.js';
import {heroWeapon,heroStrike,armedEnemy} from './weapon-art.js';

const clampFrame=(remaining,duration)=>Math.min(3,Math.max(0,Math.floor(4*(1-remaining/duration))));
export function heroPose(h,walking,t){
 if(h.roll>0)return 8+clampFrame(h.roll,.23);
 if(h.hurt>0)return 14;
 if(h.heal>0)return 15;
 if(h.attack>0)return 4+clampFrame(h.attack,.23);
 if(walking)return Math.floor(t*9)%4;
 return 12+(Math.floor(t*2)%2);
}
function shadow(g,x,y,r){
 oval(g,'#2c303553',Math.round(x),Math.round(y)-1,r,Math.max(2,Math.round(r*.25)));
}
export function drawHero(g,game,arena,talking=false){
 const h=game.hero,t=game.time,frame=heroPose(h,game.walk,t),face=game.face;
 shadow(g,h.x,h.y,arena?14:10);
 nativeActor(g,'hero',frame+(arena?16:0),h.x,h.y,face);
 if(!talking&&!game.data.inside&&(frame<8||frame===12||frame===13)){
  const attacking=frame>=4&&frame<=7;
  const weapon=attacking?(h.attackWeapon??game.data.weapon):game.data.weapon;
  if(attacking&&arena)heroStrike(g,weapon,h.x,h.y,face,weapons[weapon].reach,h.attack);
  heroWeapon(g,weapon,h.x,h.y,face,arena,frame);
 }
 if(frame===15){
  const k=Math.floor(t*10)%7;
  rect(g,'#f2ffcc',h.x+6,h.y-31-k,2,3);rect(g,'#9ee5a0',h.x-9,h.y-24-k*2,2,2);
 }
}

export function drawResident(g,n,t,talking,indoors=false){
 const kind=[0,4,1,5,1,4,2,6,0,3,7,6][n.style%12];
 const pace=Math.floor(t*4+n.style)%4;
 const stopped=indoors||Math.abs(Math.cos(t*.49+(n.walkIndex||0)*2))<.25;
 const frame=talking?(Math.floor(t*3)%3===0?0:3):stopped?0:[1,0,2,0][pace];
 const face=talking?(talking.x<n.x?-1:1):indoors?1:Math.cos(t*.49+(n.walkIndex||0)*2)<0?-1:1;
 shadow(g,n.x,n.y,8);
 nativeActor(g,'residents',kind*4+frame,n.x,n.y,face);
}

export function drawOpponent(g,unit,z,t,arena,scout,heroX){
 const e=arena?unit:null,face=e?.face??(heroX<unit.x?-1:1);
 const flying=z===1;
 let frame=(e?.walk||!arena||flying)?Math.floor(t*(flying?5:4))%2:0;
 if(e?.wind>0)frame=2;
 if(e?.release>0)frame=3;
 if(e?.stun>0)frame=0;
 const set=arena?(scout?2:3):(scout?0:1);
 const bob=flying?Math.round(2+Math.sin(t*4)*2):0;
 const recoil=e?.hurt>0?Math.round(e.hurt*16)*-face:0;
 const charge=e?.wind>0?1-e.wind/e.windDuration:0;
 const swing=e?.release>0?Math.sin(Math.PI*e.release/.25):0;
 const crouch=e?.move==='slam'?5:2;
 const lift=flying?Math.round(charge*6+swing*3):0;
 const x=unit.x+recoil+face*Math.round(swing*5-charge*3);
 const y=unit.y-bob+Math.round(charge*crouch)-lift;
 if(e?.lunge)for(let i=1;i<=3;i++)rect(g,'#dfdf955e',x-face*(12+i*5),y-8-i*3,5,2);
 shadow(g,unit.x,unit.y,scout?9:z===3?18:13);
 nativeActor(g,'foes',set*16+z*4+frame,x,y,face);
 if(arena)armedEnemy(g,e,z,t,{x,y,frame});
}

