import {oval,poly,rect} from './art.js';
import {drawOpponent} from './actors.js';
import {drawArena} from './village-art.js';
import {breathHalfAngle,breathRange,dragonMoves,diveFlight,impactRadius} from './battle-plus.js';

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

export function drawDragon(g,d,t){
 const diving=d.move==='dive'&&d.phase==='attack'&&d.age<diveFlight;
 const lifting=d.move==='dive'&&d.phase==='wind';
 const lift=d.phase==='land'?Math.max(0,1-d.age/1.15)*108:
   diving?Math.sin(Math.PI*d.age/diveFlight)*65+12*(1-d.age/diveFlight):
   lifting?d.age/d.duration*12:0;
 const wings=Math.round(Math.sin(t*(lift>0?17:7))*(lift>0?12:4));
 const crouch=d.phase==='recover'?8:0;
 const fire=d.move!=='dive'&&(d.phase==='wind'||d.phase==='attack');
 const outline='#201b32',dark='#24515a',scale=d.hurt>0?'#adf8e6':'#428d86';
 const light=d.hurt>0?'#f0ffff':'#70bf9f';
 const membrane=d.fast?'#a64650':'#70426c';
 oval(g,'#120b2399',d.x,d.y,Math.round(45-lift*.2),7);
 g.save();
 g.translate(Math.round(d.x),Math.round(d.y-lift+crouch));
 g.scale(d.face,1);

 poly(g,outline,[[-12,-40],[-36,-65],[-31,-93+wings],[-12,-77+wings],[2,-63],[26,-60],[15,-45],[-1,-35]]);
 poly(g,membrane,[[-13,-44],[-32,-66],[-30,-88+wings],[-11,-73+wings],[4,-59],[20,-57],[11,-46]]);
 poly(g,outline,[[-22,-18],[-49,-19],[-65,-11],[-81,-16],[-59,-25],[-51,-31],[-27,-38]]);
 poly(g,dark,[[-20,-22],[-48,-22],[-64,-15],[-71,-16],[-55,-27],[-45,-30],[-26,-34]]);
 poly(g,outline,[[-25,-11],[-22,-26],[-16,-36],[-4,-44],[16,-49],[21,-62],[36,-69],[49,-63],[52,-55],[65,-52],[64,-43],[53,-37],[44,-41],[32,-33],[25,-12],[11,-5],[-13,-4]]);
 poly(g,dark,[[-23,-13],[-20,-26],[-10,-38],[11,-45],[20,-49],[24,-61],[36,-66],[46,-61],[50,-53],[62,-50],[61,-44],[48,-41],[41,-43],[29,-33],[23,-15],[9,-8],[-13,-7]]);
 poly(g,scale,[[-19,-20],[-9,-35],[8,-42],[20,-46],[23,-56],[34,-63],[44,-59],[48,-51],[60,-48],[49,-45],[39,-47],[28,-39],[21,-24],[2,-18]]);
 poly(g,light,[[4,-37],[22,-47],[27,-56],[37,-61],[44,-57],[31,-53],[25,-42],[17,-32],[0,-25]]);
 poly(g,outline,[[22,-58],[19,-73],[22,-78],[32,-66],[39,-64]]);
 poly(g,'#e6bd89',[[23,-61],[22,-73],[30,-64],[34,-62]]);
 poly(g,'#d49d80',[[31,-58],[37,-56],[40,-51],[35,-52]]);
 rect(g,fire?'#fff0a0':'#ffbb66',39,-55,4,3);
 rect(g,outline,42,-55,1,3);
 if(fire){
  poly(g,outline,[[42,-45],[65,-46],[61,-35],[54,-30],[46,-35]]);
  rect(g,'#ff7048',49,-43,12,4);
  rect(g,'#fff0ae',57,-44,5,2);
 }
 poly(g,outline,[[-23,-20],[-9,-23],[-5,-14],[-8,-6],[-3,-2],[-5,2],[-26,2],[-25,-5],[-21,-8]]);
 poly(g,scale,[[-21,-18],[-10,-20],[-8,-15],[-12,-4],[-20,-4]]);
 rect(g,'#eab787',-11,-3,5,3);
 poly(g,outline,[[10,-21],[24,-22],[26,-12],[20,-5],[29,-1],[28,2],[8,2],[7,-5],[15,-11]]);
 poly(g,scale,[[13,-19],[23,-19],[22,-12],[16,-5],[12,-5],[17,-14]]);
 rect(g,'#eab787',21,-2,6,2);

 const wingTip=-81+wings+(crouch?12:0);
 poly(g,outline,[[-5,-43],[-20,-62],[-49,wingTip],[-61,wingTip+12],[-60,-48],[-52,-35],[-49,-46],[-34,-36],[-27,-31],[-23,-41],[0,-31]]);
 poly(g,membrane,[[-9,-43],[-23,-61],[-49,wingTip+4],[-57,wingTip+14],[-57,-49],[-53,-41],[-50,-51],[-34,-41],[-27,-36],[-25,-46],[-4,-37]]);
 poly(g,scale,[[-8,-42],[-20,-62],[-47,wingTip+2],[-55,wingTip+7],[-45,wingTip+10],[-26,-57],[-15,-41],[-3,-35]]);
 poly(g,'#bf798a',[[-51,wingTip+12],[-45,-53],[-33,-42],[-47,-51],[-53,-43]]);
 for(let i=0;i<5;i++)rect(g,light,-5+i*5,-25+i%2*3,3,2);
 g.restore();
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
