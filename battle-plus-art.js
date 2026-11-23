import {poly,rect} from './art.js';
import {drawOpponent} from './actors.js';
import {drawArena} from './village-art.js';
import {drawDragon} from './dragon-art.js';
import {breathHalfAngle,breathRange,dragonMoves,diveFlight,impactRadius} from './battle-plus.js';

export {drawDragon};

export function drawCaldera(g,t){
 drawArena(g,3,t);
 rect(g,'#130d2459',0,0,640,336);
 rect(g,'#571b322e',0,107,640,229);
 for(let i=0;i<22;i++){
  const x=(i*97+t*(8+i%4))%640,y=302-(t*(21+i%7)+i*17)%225;
  rect(g,i%3?'#fd8c57aa':'#ffc780aa',x,y,i%4?2:4,2);
 }
}

function groundRing(g,x,y,r,color,t){
 for(let i=0;i<48;i++){
  if((i+Math.floor(t*10))%4===0)continue;
  const a=i*Math.PI/24;
  rect(g,color,x+Math.cos(a)*r,y+Math.sin(a)*r,4,2);
 }
}

function breath(g,d,t){
 const active=d.phase==='attack';
 const point=(r,a)=>[Math.round(d.x+Math.cos(d.angle+a)*r),Math.round(d.y+Math.sin(d.angle+a)*r)];
 const cone=[point(0,0),point(breathRange,-breathHalfAngle),point(breathRange,0),point(breathRange,breathHalfAngle)];
 poly(g,active?'#f544376b':'#f25e502c',cone);
 if(!active){
  for(const side of [-1,1])for(let i=4;i<breathRange;i+=9){
   const [x,y]=point(i,side*breathHalfAngle);
   rect(g,'#ffc387d8',x,y,4,2);
  }
  return;
 }
 for(let i=0;i<38;i++){
  const r=12+(t*470+i*41)%(breathRange-12);
  const a=Math.sin(i*5.7+t*7)*breathHalfAngle;
  const [x,y]=point(r,a);
  const size=Math.round(5+r/22);
  rect(g,i%3?'#ff8546':'#fff0a7',x-size/2,y, size,3+i%4);
  rect(g,'#ffce68',x,y+1,Math.max(2,size/3),2);
 }
}

function dragonThreat(g,d,t){
 if(d.phase!=='wind'&&d.phase!=='attack')return;
 if(d.move==='breath'){breath(g,d,t);return;}
 if(d.move==='dive'){
  if(d.phase==='wind'||d.age<diveFlight){
   groundRing(g,d.target.x,d.target.y,impactRadius,'#ea775ec9',t);
   groundRing(g,d.target.x,d.target.y,12,'#fff2bd',t);
  }else{
   const radius=impactRadius*(d.age-diveFlight)/(dragonMoves.dive.active-diveFlight);
   groundRing(g,d.x,d.y,radius,'#ffdd8a',t);
   groundRing(g,d.x,d.y,Math.max(2,radius-9),'#f17c55bd',t);
   for(let i=0;i<11;i++){
    const a=i*2.4;
    rect(g,'#ff9e68',d.x+Math.cos(a)*radius,d.y+Math.sin(a)*radius-7-i%4*4,3,4);
   }
  }
  return;
 }
 if(d.phase==='wind')for(const side of [-1,0,1])for(let step=18;step<=144;step+=18){
  const a=d.angle+side*.33;
  rect(g,'#ffb784a8',d.x+Math.cos(a)*step,d.y+Math.sin(a)*step,3,3);
 }
}

export function drawPlusBattle(g,battle,drawHero){
 const t=battle.game.time,hero=battle.game.hero;
 drawCaldera(g,t);
 const units=battle.enemies.map(enemy=>({
  y:enemy.y,draw:()=>drawOpponent(g,enemy,enemy.zone,t,true,enemy.scout,hero.x)
 }));
 if(battle.dragon){
  dragonThreat(g,battle.dragon,t);
  units.push({y:battle.dragon.y,draw:()=>drawDragon(g,battle.dragon,t)});
 }
 units.push({y:hero.y,draw:drawHero});
 for(const unit of units.sort((a,b)=>a.y-b.y))unit.draw();
 for(const shot of battle.projectiles){
  const size=shot.kind==='fire'?8:5;
  for(let i=4;i>0;i--){
   rect(g,i%2?'#e85852aa':'#fc884875',shot.x-shot.vx*i*.017,shot.y-shot.vy*i*.017-4,size-i,3);
  }
  rect(g,'#fc774e',shot.x-size/2,shot.y-size/2-3,size,size);
  rect(g,'#ffe9a0',shot.x-2,shot.y-5,4,4);
 }
}
