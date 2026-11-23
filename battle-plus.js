export const waveDuration=45;
export const diamondSword={name:'Espada de Diamante',short:'Diamante',damage:150,reach:90,delay:.26,cost:0};
export const dragonName='Varkhos, el Dragón de la Caldera';
export const dragonMoves={
 breath:{name:'Aliento de la caldera',wind:.86,active:.72,recovery:1.05,damage:23},
 dive:{name:'Picado sísmico',wind:.86,active:.96,recovery:1.35,damage:30},
 volley:{name:'Lluvia de ascuas',wind:.78,active:.24,recovery:1.0,damage:17}
};
export const breathRange=256;
export const breathHalfAngle=.39;
export const impactRadius=76;
export const diveFlight=.54;

const monsters=[
 {zone:0,scout:false,hp:72,speed:83,damage:5},
 {zone:1,scout:true,hp:50,speed:114,damage:4},
 {zone:2,scout:false,hp:108,speed:61,damage:8},
 {zone:3,scout:true,hp:92,speed:88,damage:6},
 {zone:1,scout:false,hp:64,speed:88,damage:5,ranged:true},
 {zone:0,scout:true,hp:56,speed:101,damage:4},
 {zone:2,scout:true,hp:75,speed:80,damage:5,ranged:true},
 {zone:3,scout:false,hp:112,speed:71,damage:7}
];
const patterns=['breath','dive','volley'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angleTo=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);

export function inDragonBreath(dragon,point){
 const dx=point.x-dragon.x,dy=point.y-dragon.y;
 const range=Math.hypot(dx,dy);
 return range<=breathRange&&dx*Math.cos(dragon.angle)+dy*Math.sin(dragon.angle)>=range*Math.cos(breathHalfAngle);
}

export class BattlePlus {
 constructor(game){
  this.game=game;
  this.stage='intro';
  this.hp=game.maxHp;
  this.elapsed=0;
  this.kills=0;
  this.nextSpawn=0;
  this.spawned=0;
  this.enemies=[];
  this.projectiles=[];
  this.dragon=null;
 }
 get remaining(){return Math.max(0,waveDuration-this.elapsed);}
 get finished(){return this.stage==='won'||this.stage==='lost';}
 begin(){
  this.stage='waves';
  this.game.notice('Sobrevive 45 s · mantén J para encadenar tajos');
  this.spawn();
  this.spawn();
  this.nextSpawn=.5;
 }
 spawn(){
  const i=this.spawned++;
  const {hp,...type}=monsters[i%monsters.length];
  const fromLeft=i%2===0;
  this.enemies.push({
   ...type,x:fromLeft?23:617,y:143+(i*53)%141,hp,face:fromLeft?1:-1,
   cool:.65,wind:0,windDuration:.32,release:0,walk:false,target:null
  });
 }
 attack(){
  if(this.stage!=='waves'&&this.stage!=='dragon')return;
  const game=this.game,h=game.hero;
  if(h.lock>0)return;
  h.attack=.23;
  h.attackWeapon=game.weapon;
  h.lock=diamondSword.delay;
  game.emit('sound','diamond');

  if(this.stage==='waves'){
   const previous=this.enemies.length;
   this.enemies=this.enemies.filter(enemy=>{
    if(distance(h,enemy)>diamondSword.reach)return true;
    enemy.hp-=diamondSword.damage;
    game.emit('effect',{x:enemy.x,y:enemy.y-28,text:'✦'});
    return enemy.hp>0;
   });
   const defeated=previous-this.enemies.length;
   this.kills+=defeated;
   this.hp=Math.min(game.maxHp,this.hp+defeated*2);
   return;
  }

  const d=this.dragon;
  if(d.move==='dive'&&d.phase==='attack'&&d.age<diveFlight)return;
  if(distance(h,d)>diamondSword.reach+12)return;
  const vulnerable=d.phase==='recover';
  const damage=vulnerable?diamondSword.damage:36;
  d.hp=Math.max(0,d.hp-damage);
  d.hurt=.16;
  game.emit('effect',{x:d.x,y:d.y-66,text:vulnerable?'−'+damage:'ESCAMAS · '+damage});
  game.emit('sound','hit');
  if(d.hp===0)this.finish(true);
 }
 takeDamage(damage){
  const {hero:h}=this.game;
  if(this.stage==='arrival'||this.finished||h.roll>0||h.hurt>0)return;
  this.hp=Math.max(0,this.hp-damage);
  h.hurt=.52;
  this.game.emit('sound','hurt');
  this.game.emit('effect',{x:h.x,y:h.y-32,text:'−'+damage});
  if(this.hp===0)this.finish(false);
 }
 finish(won){
  this.stage=won?'won':'lost';
  this.projectiles=[];
  if(won){
   this.game.data.battlePlusWon=true;
   this.game.emit('save');
  }
  this.game.emit('sound',won?'win':'rumble');
  this.game.emit('plus_finished',won);
 }
 tick(dt){
  if(this.finished||this.stage==='intro')return;
  if(this.stage==='waves'){
   this.elapsed=Math.min(waveDuration,this.elapsed+dt);
   if(this.remaining<1e-7){this.summonDragon();return;}
   this.nextSpawn-=dt;
   if(this.nextSpawn<=0&&this.enemies.length<15){
    this.spawn();
    this.nextSpawn=.72-this.elapsed*.009;
   }
   for(const monster of this.enemies){
    this.tickMonster(monster,dt);
    if(this.finished)return;
   }
  }else{
   this.tickDragon(dt);
  }
  if(!this.finished)this.tickProjectiles(dt);
 }
 tickMonster(m,dt){
  const {hero:h}=this.game;
  const range=distance(m,h);
  m.release=Math.max(0,m.release-dt);
  m.walk=false;
  if(m.wind>0){
   m.wind-=dt;
   if(m.wind>0)return;
   m.release=.23;
   m.cool=m.ranged?1.48:.72;
   if(m.ranged)this.fire(m,m.target,128,m.damage,0,'spark');
   else if(range<34)this.takeDamage(m.damage);
   return;
  }
  if(m.release>0)return;
  m.face=h.x>=m.x?1:-1;
  m.cool-=dt;
  const attackRange=m.ranged?125:24;
  if(range>attackRange-4){
   this.game.approach(m,h,(m.speed+this.elapsed*.5)*dt);
   m.walk=true;
  }
  if(m.cool<=0&&range<=attackRange){
   m.target={x:h.x,y:h.y};
   m.wind=m.windDuration;
  }
 }
 summonDragon(){
  this.elapsed=waveDuration;
  this.stage='arrival';
  this.enemies=[];
  this.projectiles=[];
  this.hp=this.game.maxHp;
  this.game.energy=100;
  this.dragon={
   x:this.game.hero.x<320?502:138,y:208,hp:1440,max:1440,face:1,
   phase:'land',age:0,sequence:0,move:null,hurt:0,cool:0
  };
  this.game.emit('sound','dragon_roar');
  this.game.emit('plus_shake');
  this.game.notice('Varkhos desciende · tu vida se ha restaurado');
 }
 tickDragon(dt){
  const d=this.dragon,h=this.game.hero;
  d.age+=dt;
  d.hurt=Math.max(0,d.hurt-dt);
  if(d.phase==='land'){
   d.face=h.x>=d.x?1:-1;
   if(d.age>=1.65){
    this.stage='dragon';
    Object.assign(d,{phase:'idle',age:0,cool:.4});
    this.game.notice('Esquiva sus ataques · golpea cuando baje la guardia');
   }
   return;
  }
  if(d.phase==='idle'){
   d.face=h.x>=d.x?1:-1;
   if(d.age<d.cool)return;
   d.move=patterns[d.sequence++%patterns.length];
   d.angle=angleTo(d,h);
   d.target={x:h.x,y:h.y};
   d.origin={x:d.x,y:d.y};
   d.fast=d.hp<d.max*.45;
   d.duration=dragonMoves[d.move].wind*(d.fast?.76:1);
   d.phase='wind';
   d.age=0;
   return;
  }
  const attack=dragonMoves[d.move];
  if(d.phase==='wind'&&d.age>=d.duration){
   d.phase='attack';
   d.age=0;
   d.impact=false;
   this.game.emit('sound',d.move==='dive'?'rumble':'dragon_fire');
   if(d.move==='volley'){
    const count=d.fast?3:2;
    for(let i=-count;i<=count;i++)this.fire(d,d.target,185+(count-Math.abs(i))*18,attack.damage,i*.17,'fire');
   }
  }else if(d.phase==='attack'){
   if(d.move==='breath'&&inDragonBreath(d,h)&&!d.hit){
    if(!h.roll&&!h.hurt){this.takeDamage(attack.damage);d.hit=true;}
   }
   if(d.move==='dive'){
    const travel=Math.min(1,d.age/diveFlight);
    d.x=d.origin.x+(d.target.x-d.origin.x)*travel;
    d.y=d.origin.y+(d.target.y-d.origin.y)*travel;
    if(d.age>=diveFlight){
     if(!d.impact){this.game.emit('plus_shake');this.game.emit('sound','hit');d.impact=true;}
     const radius=impactRadius*(d.age-diveFlight)/(attack.active-diveFlight);
     if(!d.hit&&distance(d,h)<radius&&!h.roll&&!h.hurt){this.takeDamage(attack.damage);d.hit=true;}
    }
   }
   if(d.age>=attack.active){d.phase='recover';d.age=0;}
  }else if(d.phase==='recover'&&d.age>=attack.recovery){
   Object.assign(d,{phase:'idle',age:0,cool:d.fast?.32:.57,hit:false});
  }
 }
 fire(origin,target,speed,damage,spread,kind){
  const angle=angleTo(origin,target)+spread;
  this.projectiles.push({
   x:origin.x,y:origin.y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
   damage,kind,life:kind==='fire'?3.2:1.4
  });
 }
 tickProjectiles(dt){
  const h=this.game.hero;
  this.projectiles=this.projectiles.filter(shot=>{
   const dx=shot.vx*dt,dy=shot.vy*dt;
   const along=Math.max(0,Math.min(1,((h.x-shot.x)*dx+(h.y-shot.y)*dy)/(dx*dx+dy*dy||1)));
   const hit=Math.hypot(h.x-shot.x-dx*along,h.y-shot.y-dy*along)<(shot.kind==='fire'?11:8);
   shot.x+=dx;
   shot.y+=dy;
   shot.life-=dt;
   if(hit){this.takeDamage(shot.damage);return false;}
   return shot.life>0&&shot.x>-24&&shot.x<664&&shot.y>105&&shot.y<320;
  });
  if(this.finished)this.projectiles=[];
 }
}
