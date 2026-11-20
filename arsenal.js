export const health=[100,165,250,460];
export const scoutNames=['Vigía de la era','Mariposa de cobre','Aprendiz de basalto','Guardia del foso'];
export const moves={
 lance:{name:'Jabalina de zarza',wind:.64,range:248,damage:12},
 sweep:{name:'Sable en arco',wind:.52,range:68,damage:16},
 fan:{name:'Abanico de cuchillas',wind:.82,range:265,damage:13},
 slam:{name:'Martillo sísmico',wind:.94,range:113,damage:22},
 dash:{name:'Estocada real',wind:.55,range:132,damage:18}
};
const lists=[['lance','sweep'],['fan','dash','sweep'],['slam','lance','sweep'],['dash','lance','slam','sweep']];
export function chooseMove(enemy,z){
 const cycle=z===3&&!enemy.scout&&enemy.hp<=enemy.max/2?['fan','dash','slam','lance','sweep']:lists[z];
 return cycle[enemy.sequence%cycle.length];
}
const span=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function strike(game,damage){
 const h=game.hero;
 if(game.mode!=='arena'||h.roll>0||h.shield>0||h.hurt>0)return;
 game.data.hp=Math.max(0,game.data.hp-damage);h.hurt=.48;h.heal=0;
 game.emit('sound','hurt');game.emit('effect',{x:h.x,y:h.y-32,text:'−'+damage});
 if(!game.data.hp){game.mode='lost';game.emit('lost');}
}
export function release(game){
 const e=game.enemy,kind=e.move||'dash',d=moves[kind],target=e.target,h=game.hero;
 const angle=Math.atan2(target.y-e.y,target.x-e.x);
 const damage=e.scout?Math.round(d.damage*.7):d.damage+(game.data.zone===3?3:0);
 if(kind==='lance'||kind==='fan'){
  const offsets=kind==='lance'?[0]:[-.32,0,.32];const speed=kind==='lance'?200:145;
  for(const off of offsets)game.hazards.push({kind,x:e.x,y:e.y,angle:angle+off,speed,damage,age:0,life:2.5});
 }else if(kind==='slam'){
  game.hazards.push({kind,x:e.x,y:e.y,age:0,radius:0,life:1.22,damage});
 }else if(kind==='sweep'){
  game.hazards.push({kind,x:e.x,y:e.y,angle,age:0,life:.24,damage});
 }else{
  game.approach(e,target,96);if(span(e,h)<38)strike(game,damage);
 }
 e.release=.25;e.cool=e.scout?.85:.45;e.recovery=kind==='slam'?.85:.54;e.sequence++;
 game.emit('sound',kind==='slam'?'hit':'attack');
}
export function stepHazards(game,dt){
 const h=game.hero;
 for(const a of game.hazards){
  if(a.life<=0)continue;
  a.age+=dt;a.life-=dt;
  let hit=false;
  if(a.kind==='slam'){a.radius=a.age*118;hit=Math.abs(span(h,a)-a.radius)<7;}
  else if(a.kind==='sweep'){
   const theta=Math.atan2(h.y-a.y,h.x-a.x)-a.angle;
   hit=span(h,a)<70&&Math.cos(theta)>.28;
  }else{
   const dx=Math.cos(a.angle)*a.speed*dt,dy=Math.sin(a.angle)*a.speed*dt;
   const k=Math.max(0,Math.min(1,((h.x-a.x)*dx+(h.y-a.y)*dy)/(dx*dx+dy*dy||1)));
   hit=Math.hypot(h.x-a.x-dx*k,h.y-a.y-dy*k)<10;
   a.x+=dx;a.y+=dy;
  }
  if(hit&&!a.hit&&h.roll<=0){strike(game,a.damage);a.hit=true;if(a.kind==='fan'||a.kind==='lance')a.life=0;}
 }
 game.hazards=game.hazards.filter(a=>a.life>0&&a.x>-30&&a.x<670&&a.y>80&&a.y<350);
}
