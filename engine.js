import {EchoMemory,sector,directions,habit} from './learning.js';
import {WORLD,worlds,canWalk,safePosition,interaction,roomNames} from './world.js';
import {health,moves,chooseMove,release,stepHazards} from './arsenal.js';
export const weapons=[
 {name:'Espada de Viajero',short:'Viajero',damage:15,reach:56,delay:.39,cost:8},
 {name:'Espada de Caballero',short:'Caballero',damage:22,reach:61,delay:.46,cost:10},
 {name:'Dagas del Viento',short:'Dagas',damage:11,reach:48,delay:.19,cost:4},
 {name:'Martillo del Ocaso',short:'Martillo',damage:37,reach:58,delay:.76,cost:15},
 {name:'Espada Rúnica',short:'Rúnica',damage:26,reach:74,delay:.50,cost:10}
];
export const items=['Fruta','Escudo','Aturdidora','Elixir','Humo'];
export const exits=[[2,1],[0,3],[3,0],[1,2]];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function fresh(){return {mapRevision:2,inside:false,scouts:[],services:[],zone:0,x:111,y:312,hp:100,weapon:0,item:0,unlocked:[0],bag:[4,1,1,1,1],cleared:[],opened:[],won:false};}
export class Adventure {
 constructor(save,onEvent=()=>{}){
   this.data=Object.assign(fresh(),save?.data||{});this.memory=new EchoMemory(save?.memory);this.emit=onEvent;
   const d=this.data;
   if(save?.data && save.data.mapRevision!==2){
     const p=safePosition(d.zone,clamp(d.x*2.1,38,WORLD.width-38),clamp(d.y*1.54,80,WORLD.height-25));
     d.x=p.x;d.y=p.y;d.inside=false;
   }
   d.found??=[];
   this.hazards=[];this.encounterType='guardian';
   this.time=0;this.mode='map';this.enemy=null;this.energy=100;this.grace=0;this.face=1;this.walk=false;
   this.spawnHero();this.initPatrol();
 }
 spawnHero(){const d=this.data;this.hero={x:d.x,y:d.y,dx:1,dy:0,roll:0,lock:0,hurt:0,heal:0,shield:0,haste:0,smoke:0,attack:0};}
 initPatrol(){
   const w=worlds[this.data.zone];this.patrol={...w.guardian};this.scout={...w.scout};this.patrolTime=0;
 }
 get maxHp(){return 100+this.data.cleared.filter(i=>i<3).length*15;}
 get chest(){return worlds[this.data.zone].chest;}
 interact(a){
   const d=this.data,w=worlds[d.zone],door=w.houses[0];
   if(a.type==='chest'){this.openChest();return;}
   if(a.type==='find'){
     d.found.push(a.id);d.bag[a.item]++;this.emit('sound','loot');this.notice(a.name+' · '+items[a.item]+' +1');this.emit('save');return;
   }
   if(a.type==='door'||a.type==='leave'){
     d.inside=a.type==='door';d.x=d.inside?319:door.x;d.y=d.inside?242:door.y+15;
     this.spawnHero();this.grace=.65;this.emit('sound','click');this.notice(d.inside?roomNames[d.zone]:'De vuelta al camino');this.emit('save');return;
   }
   if(a.type==='npc'){
     const h=this.hero;
     if(Math.abs(h.x-a.x)<28&&Math.abs(h.y-a.y)<24){
       const side=h.x<a.x?-1:1;
       const x=[a.x+side*31,a.x-side*31].find(x=>canWalk(d.zone,x,h.y));
       if(x!==undefined){h.x=x;d.x=x;}
     }
     this.face=h.x<a.x?1:-1;
     this.emit('dialog',{name:a.name,line:a.line});return;
   }
   if(a.type==='service'){
     const used=d.services.includes(d.zone);const lines=[
      'Hay sopa caliente y una cama junto a la ventana. Recuperaste toda la vida.',
      used?'Ya recogiste la cosecha de hoy. El claro está al otro lado del puente.':'Llévate tres frutas del huerto para el camino.',
      'La losa dice que el martillo de Talos levanta una onda circular. Rueda hacia el centro al cruzarla.',
      used?'Tu escudo ya está reparado. El Rey cambia de arma a media vida.':'Reforcé un escudo mágico para ti. Equípalo antes de entrar al patio.'
     ];
     if(d.zone===0)d.hp=this.maxHp;
     if(!used){if(d.zone===1)d.bag[0]+=3;if(d.zone===3)d.bag[1]++;d.services.push(d.zone);}
     this.emit('save');this.emit('dialog',{name:['Alma','Sauce','Elías','Bruno'][d.zone],line:lines[d.zone]});
   }
 }
 snapshot(){return {version:1,data:{...this.data,bag:[...this.data.bag],unlocked:[...this.data.unlocked],cleared:[...this.data.cleared],opened:[...this.data.opened]},memory:this.memory.snapshot()};}
 notice(s){this.emit('notice',s);}
 unlock(i){if(!this.data.unlocked.includes(i)){this.data.unlocked.push(i);this.data.weapon=i;return weapons[i].name;}return '';}
 cycleWeapon(){const d=this.data;d.weapon=d.unlocked[(d.unlocked.indexOf(d.weapon)+1)%d.unlocked.length];this.emit('sound','click');this.notice(weapons[d.weapon].name);}
 cycleItem(){this.data.item=(this.data.item+1)%items.length;this.emit('sound','click');}
 act(key){
   if(!['arena','map'].includes(this.mode))return;
   if(key==='weapon'){this.cycleWeapon();return;}if(key==='select'){this.cycleItem();return;}
   const h=this.hero,d=this.data,w=weapons[d.weapon];
   if(h.lock>0||h.heal>0)return;
   if(key==='item'){this.useItem();return;}
   if(key==='roll'&&this.energy>=18){
     const direction=sector(h.dx,h.dy);this.learn('roll:'+direction);
     h.roll=.23;h.lock=.31;this.energy-=18;this.emit('sound','roll');return;
   }
   if(key!=='attack')return;
   if(this.mode==='map'){const a=interaction(this);if(a){this.interact(a);return;}}
   if(this.energy<w.cost)return;
   this.energy-=w.cost;h.attack=.23;h.lock=w.delay*(h.haste>0?.75:1);this.emit('sound','attack');
   if(this.mode!=='arena')return;
   const e=this.enemy,side=sector(h.x-e.x,h.y-e.y),token='atk:'+d.weapon+':'+side;
   this.learn(token);if(dist(h,e)>w.reach)return;
   this.face=e.x<h.x?-1:1;
   const guarded=e.guard===token&&e.stun<=0&&e.recovery<=0&&h.smoke<=0;
   const damage=Math.round(w.damage*(h.haste>0?1.3:1)*(guarded?.32:1));
   e.hp-=damage;e.hurt=.14;this.emit('effect',{x:e.x,y:e.y-33,text:guarded?'BLOQUEO · '+damage:'−'+damage});
   this.emit('sound','hit');
   if(e.hp<=0)this.winBattle();
 }
 learn(action){if(this.mode==='arena')this.memory.observe(action,dist(this.hero,this.enemy),100*this.data.hp/this.maxHp);}
 openChest(){
   const d=this.data;d.opened.push(d.zone);const loot=this.unlock([1,2,3,4][d.zone]);
   d.bag[0]+=2;d.bag[(d.zone+1)%5]++;this.emit('sound','loot');this.notice((loot?loot+' · ':'')+'Fruta ×2');this.emit('save');
 }
 useItem(){
   const d=this.data,h=this.hero,i=d.item;
   if(!d.bag[i]){this.notice('Sin existencias · R cambia de objeto');return;}
   if(i===0&&d.hp>=this.maxHp){this.notice('Ya tienes toda la vida');return;}
   if(i===2&&this.mode!=='arena'){this.notice('La bomba se usa en la arena');return;}
   d.bag[i]--;h.lock=.25;
   if(i===0){this.learn('heal');h.heal=.65;this.emit('sound','heal');this.notice('Preparando fruta…');return;}
   if(i===1)h.shield=4;
   if(i===2){this.enemy.stun=2.1;this.enemy.wind=0;this.enemy.cool=1;}
   if(i===3)h.haste=5;
   if(i===4){h.smoke=3;if(this.enemy){this.enemy.guard='';this.enemy.wind=0;this.enemy.cool=.7;this.enemy.read='Predicción velada';}}
   this.emit('sound','item');this.notice(['','Escudo · 4 s','Enemigo aturdido','Elixir · 5 s','Humo · 3 s'][i]);
 }
 beginBattle(type='guardian'){
   this.encounterType=type;
   const d=this.data;d.x=this.hero.x;d.y=this.hero.y;this.mode='transition';this.fade=.54;this.emit('sound','enter');this.emit('save');
 }
 enterArena(){
   const d=this.data;this.mode='arena';this.hero.x=184;this.hero.y=203;this.hero.dx=1;this.hero.dy=0;this.hero.roll=0;this.face=1;
   const scout=this.encounterType==='scout',max=scout?Math.round(health[d.zone]*.34):health[d.zone];this.hazards=[];this.enemy={x:445,y:203,hp:max,max,scout,sequence:0,release:0,move:null,cool:.58,wind:0,guard:'',stun:0,recovery:0,hurt:0,read:'Reuniendo recuerdos',face:-1,walk:false};
   this.memory.recent=[];this.emit('arena');this.notice(d.zone===3?'El Rey heredó '+this.memory.samples+' recuerdos':'¡Encuentro! J ataca · Espacio rueda');
 }
 winBattle(){
   const d=this.data;const scout=this.enemy.scout;this.enemy=null;this.hazards=[];
   if(scout){d.scouts.push(d.zone);d.bag[0]++;d.bag[1]++;this.spawnHero();this.mode='map';this.grace=1;this.notice('Patrulla vencida · fruta y escudo');this.emit('sound','loot');this.emit('save');return;}
   d.cleared.push(d.zone);d.hp=Math.min(this.maxHp,d.hp+47);this.energy=100;d.bag[0]++;d.bag[2]++;
   const loot=this.unlock([1,2,3,4][d.zone]);
   this.spawnHero();this.grace=1;
   if(d.zone===3){this.mode='won';d.won=true;this.emit('sound','win');this.emit('save');this.emit('won');return;}
   this.mode='map';this.emit('sound','loot');this.notice((loot?loot+' · ':'Guardián vencido · ')+d.cleared.length+'/3 sellos');
   this.emit('save');
 }
 retry(){const d=this.data;this.mode='map';this.enemy=null;this.hazards=[];d.inside=false;d.hp=this.maxHp;this.energy=100;d.x=111;d.y=312;d.bag[0]=Math.max(1,d.bag[0]);this.spawnHero();this.initPatrol();this.grace=1;this.emit('save');}
 tick(dt,dx,dy){
   this.time+=dt;const d=this.data,h=this.hero;
   if(this.mode==='transition'){this.fade-=dt;if(this.fade<=0)this.enterArena();return;}
   if(!['map','arena'].includes(this.mode))return;
   for(const k of ['lock','hurt','shield','haste','smoke','attack'])h[k]=Math.max(0,h[k]-dt);
   this.grace=Math.max(0,this.grace-dt);this.energy=Math.min(100,this.energy+dt*22);
   if(h.heal>0){h.heal=Math.max(0,h.heal-dt);if(!h.heal){d.hp=Math.min(this.maxHp,d.hp+43);this.notice('+43 vida');}}
   const n=Math.hypot(dx,dy);this.walk=!!n;
   if(h.roll>0){dx=h.dx;dy=h.dy;h.roll=Math.max(0,h.roll-dt);}
   else if(n){dx/=n;dy/=n;h.dx=dx;h.dy=dy;if(dx)this.face=Math.sign(dx);}
   const speed=h.roll>0?310:h.heal>0?22:h.haste>0?143:105;
   const arena=this.mode==='arena';
   const vx=dx*speed*dt,vy=dy*speed*dt;
   if(arena){h.x=clamp(h.x+vx,23,617);h.y=clamp(h.y+vy,133,293);this.fight(dt);return;}
   if(d.inside){h.x=clamp(h.x+vx,130,510);h.y=clamp(h.y+vy,157,274);d.x=h.x;d.y=h.y;return;}
   const nx=clamp(h.x+vx,8,WORLD.width-8),ny=clamp(h.y+vy,62,WORLD.height-25);
   if(canWalk(d.zone,nx,h.y))h.x=nx;
   if(canWalk(d.zone,h.x,ny))h.y=ny;
   if((h.x<14||h.x>WORLD.width-14)&&Math.abs(h.y-WORLD.road)<35){
     const right=h.x>WORLD.width/2,next=exits[d.zone][right?1:0];
     if(next===3&&d.cleared.filter(k=>k<3).length<3){h.x=right?WORLD.width-38:38;this.notice('Faltan sellos · vence a los tres guardianes');}
     else{d.zone=next;d.x=right?32:WORLD.width-32;d.y=WORLD.road;this.spawnHero();this.initPatrol();this.grace=.7;this.emit('zone');this.emit('save');}
     return;
   }
   d.x=h.x;d.y=h.y;this.patrolTime+=dt;
   const w=worlds[d.zone];
   for(const [p,home,done,type] of [[this.patrol,w.guardian,d.cleared,'guardian'],[this.scout,w.scout,d.scouts,'scout']]){
     if(done.includes(d.zone))continue;
     const chasing=dist(h,p)<86;
     const goal=chasing?h:{x:home.x+32*Math.sin(this.patrolTime*.65),y:home.y+11*Math.sin(this.patrolTime*.91)};
     const prev={...p};this.approach(p,goal,(chasing?87:32)*dt);
     if(!canWalk(d.zone,p.x,p.y))Object.assign(p,prev);
     if(dist(h,p)<18&&!this.grace){this.beginBattle(type);return;}
   }
 }
 approach(a,b,step){const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);if(n>.01){const k=Math.min(1,step/n);a.x+=dx*k;a.y+=dy*k;}}
 fight(dt){
   const h=this.hero,e=this.enemy,boss=this.data.zone===3;
   stepHazards(this,dt);if(this.mode!=='arena')return;
   e.hurt=Math.max(0,e.hurt-dt);e.release=Math.max(0,e.release-dt);e.walk=false;
   if(e.stun>0){e.stun-=dt;return;}
   if(e.recovery>0){e.recovery-=dt;return;}
   if(e.wind>0){e.wind-=dt;if(e.wind<=0)release(this);return;}
   e.face=h.x>=e.x?1:-1;e.cool-=dt;
   const range=dist(h,e),next=chooseMove(e,this.data.zone),attack=moves[next];
   if(range>Math.min(88,attack.range-12)){this.approach(e,h,(boss?90:68)*dt);e.walk=true;}
   if(e.cool>0||range>attack.range)return;
   e.move=next;
   const guess=this.memory.predict(range,100*this.data.hp/this.maxHp);
   const token=!h.smoke&&guess.confidence>=(boss?.48:.60)?guess.action:'';
   e.guard=token.startsWith('atk:')?token:'';
   let tx=h.x,ty=h.y;
   if(token.startsWith('roll:')){const [x,y]=directions[token.slice(5)];tx+=x*(boss?50:32);ty+=y*(boss?50:32);}
   if(h.smoke>0){tx=e.x-36*e.face;ty=e.y-12;}
   e.target={x:clamp(tx,23,617),y:clamp(ty,133,293)};
   e.wind=attack.wind*(token==='heal'?.77:1);
   const message=h.smoke>0?'Predicción velada':token?habit(token)+' · '+Math.round(guess.confidence*100)+'%':'Observando…';
   if(e.read!==message&&token)this.emit('sound','adapt');e.read=message;
 }
}
