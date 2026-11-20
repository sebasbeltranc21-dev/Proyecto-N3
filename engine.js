import {EchoMemory,sector,directions,habit} from './learning.js';
export const weapons=[
 {name:'Espada de Viajero',short:'Viajero',damage:15,reach:56,delay:.39,cost:8},
 {name:'Espada de Caballero',short:'Caballero',damage:22,reach:61,delay:.46,cost:10},
 {name:'Dagas del Viento',short:'Dagas',damage:11,reach:48,delay:.19,cost:4},
 {name:'Martillo del Ocaso',short:'Martillo',damage:37,reach:58,delay:.76,cost:15},
 {name:'Espada Rúnica',short:'Rúnica',damage:26,reach:74,delay:.50,cost:10}
];
export const items=['Fruta','Escudo','Aturdidora','Elixir','Humo'];
export const exits=[[2,1],[0,3],[3,0],[1,2]];
const pos=(x,y)=>({x,y});
const chestPositions=[pos(160,142),pos(245,145),pos(378,250),pos(181,156)];
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function fresh(){return {zone:0,x:86,y:202,hp:100,weapon:0,item:0,unlocked:[0],bag:[4,1,1,1,1],cleared:[],opened:[],won:false};}
export class Adventure {
 constructor(save,onEvent=()=>{}){
   this.data=Object.assign(fresh(),save?.data||{});this.memory=new EchoMemory(save?.memory);this.emit=onEvent;
   this.time=0;this.mode='map';this.enemy=null;this.energy=100;this.grace=0;this.face=1;this.walk=false;
   this.spawnHero();this.initPatrol();
 }
 spawnHero(){const d=this.data;this.hero={x:d.x,y:d.y,dx:1,dy:0,roll:0,lock:0,hurt:0,heal:0,shield:0,haste:0,smoke:0,attack:0};}
 initPatrol(){this.patrol={x:402,y:197};this.patrolTime=0;}
 get chest(){return chestPositions[this.data.zone];}
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
   if(this.mode==='map'&&dist(h,this.chest)<39&&!d.opened.includes(d.zone)){this.openChest();return;}
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
 learn(action){if(this.mode==='arena')this.memory.observe(action,dist(this.hero,this.enemy),this.data.hp);}
 openChest(){
   const d=this.data;d.opened.push(d.zone);const loot=this.unlock([1,2,3,4][d.zone]);
   d.bag[0]+=2;d.bag[(d.zone+1)%5]++;this.emit('sound','loot');this.notice((loot?loot+' · ':'')+'Fruta ×2');this.emit('save');
 }
 useItem(){
   const d=this.data,h=this.hero,i=d.item;
   if(!d.bag[i]){this.notice('Sin existencias · R cambia de objeto');return;}
   if(i===0&&d.hp>=100){this.notice('Ya tienes toda la vida');return;}
   if(i===2&&this.mode!=='arena'){this.notice('La bomba se usa en la arena');return;}
   d.bag[i]--;h.lock=.25;
   if(i===0){this.learn('heal');h.heal=.65;this.emit('sound','heal');this.notice('Preparando fruta…');return;}
   if(i===1)h.shield=4;
   if(i===2){this.enemy.stun=2.1;this.enemy.wind=0;this.enemy.cool=1;}
   if(i===3)h.haste=5;
   if(i===4){h.smoke=3;if(this.enemy){this.enemy.guard='';this.enemy.wind=0;this.enemy.cool=.7;this.enemy.read='Predicción velada';}}
   this.emit('sound','item');this.notice(['','Escudo · 4 s','Enemigo aturdido','Elixir · 5 s','Humo · 3 s'][i]);
 }
 beginBattle(){
   const d=this.data;d.x=this.hero.x;d.y=this.hero.y;this.mode='transition';this.fade=.54;this.emit('sound','enter');this.emit('save');
 }
 enterArena(){
   const d=this.data;this.mode='arena';this.hero.x=184;this.hero.y=203;this.hero.dx=1;this.hero.dy=0;this.hero.roll=0;this.face=1;
   const max=[63,78,94,210][d.zone];this.enemy={x:445,y:203,hp:max,max,cool:.58,wind:0,guard:'',stun:0,recovery:0,hurt:0,read:'Reuniendo recuerdos',face:-1,walk:false};
   this.memory.recent=[];this.emit('arena');this.notice(d.zone===3?'El Rey heredó '+this.memory.samples+' recuerdos':'¡Encuentro! J ataca · Espacio rueda');
 }
 winBattle(){
   const d=this.data;this.enemy=null;d.cleared.push(d.zone);d.hp=Math.min(100,d.hp+32);this.energy=100;d.bag[0]++;d.bag[2]++;
   const loot=this.unlock([1,2,3,4][d.zone]);
   this.spawnHero();this.grace=1;
   if(d.zone===3){this.mode='won';d.won=true;this.emit('sound','win');this.emit('save');this.emit('won');return;}
   this.mode='map';this.emit('sound','loot');this.notice((loot?loot+' · ':'Guardián vencido · ')+d.cleared.length+'/3 sellos');
   this.emit('save');
 }
 retry(){const d=this.data;this.mode='map';this.enemy=null;d.hp=100;this.energy=100;d.x=82;d.y=200;d.bag[0]=Math.max(1,d.bag[0]);this.spawnHero();this.initPatrol();this.grace=1;this.emit('save');}
 tick(dt,dx,dy){
   this.time+=dt;const d=this.data,h=this.hero;
   if(this.mode==='transition'){this.fade-=dt;if(this.fade<=0)this.enterArena();return;}
   if(!['map','arena'].includes(this.mode))return;
   for(const k of ['lock','hurt','shield','haste','smoke','attack'])h[k]=Math.max(0,h[k]-dt);
   this.grace=Math.max(0,this.grace-dt);this.energy=Math.min(100,this.energy+dt*22);
   if(h.heal>0){h.heal=Math.max(0,h.heal-dt);if(!h.heal){d.hp=Math.min(100,d.hp+43);this.notice('+43 vida');}}
   const n=Math.hypot(dx,dy);this.walk=!!n;
   if(h.roll>0){dx=h.dx;dy=h.dy;h.roll=Math.max(0,h.roll-dt);}
   else if(n){dx/=n;dy/=n;h.dx=dx;h.dy=dy;if(dx)this.face=Math.sign(dx);}
   const speed=h.roll>0?310:h.heal>0?22:h.haste>0?143:105;
   const arena=this.mode==='arena';h.x=clamp(h.x+dx*speed*dt,arena?23:8,arena?617:632);
   h.y=clamp(h.y+dy*speed*dt,arena?133:108,arena?293:281);
   if(arena){this.fight(dt);return;}
   if(h.x<14||h.x>626){
     const right=h.x>626,next=exits[d.zone][right?1:0];
     if(next===3&&d.cleared.filter(k=>k<3).length<3){h.x=right?605:35;this.notice('Faltan sellos · vence a los tres guardianes');}
     else{d.zone=next;d.x=right?32:608;d.y=h.y;this.spawnHero();this.initPatrol();this.grace=.7;this.emit('zone');this.emit('save');}
     return;
   }
   d.x=h.x;d.y=h.y;
   if(d.cleared.includes(d.zone))return;
   const p=this.patrol;this.patrolTime+=dt;
   const chasing=dist(h,p)<85;
   const goal=chasing?h:{x:402+51*Math.sin(this.patrolTime*.67),y:195+15*Math.sin(this.patrolTime*.9)};
   this.approach(p,goal,(chasing?91:38)*dt);
   if(dist(h,p)<18&&!this.grace)this.beginBattle();
 }
 approach(a,b,step){const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy);if(n>.01){const k=Math.min(1,step/n);a.x+=dx*k;a.y+=dy*k;}}
 fight(dt){
   const h=this.hero,e=this.enemy,boss=this.data.zone===3;
   e.hurt=Math.max(0,e.hurt-dt);e.walk=false;
   if(e.stun>0){e.stun-=dt;return;}
   if(e.recovery>0){e.recovery-=dt;return;}
   if(e.wind>0){
     e.wind-=dt;if(e.wind>0)return;
     const reach=boss?96:68;this.approach(e,e.target,reach);
     if(dist(e,h)<(boss?44:35)&&h.roll<=0&&h.shield<=0&&h.hurt<=0){
       this.data.hp=Math.max(0,this.data.hp-(boss?20:11+this.data.zone*2));h.hurt=.36;h.heal=0;
       this.emit('sound','hurt');this.emit('effect',{x:h.x,y:h.y-32,text:'−'+(boss?20:11+this.data.zone*2)});
       if(!this.data.hp){this.mode='lost';this.emit('lost');return;}
     }
     e.cool=boss?.38:.65;e.recovery=boss?.46:.58;return;
   }
   e.face=h.x>=e.x?1:-1;e.cool-=dt;
   const range=dist(h,e);
   if(range>(boss?76:54)){this.approach(e,h,(boss?87:65)*dt);e.walk=true;}
   if(e.cool>0||range>(boss?128:89))return;
   const guess=this.memory.predict(range,this.data.hp);
   const token=!h.smoke&&guess.confidence>=(boss?.48:.60)?guess.action:'';
   e.guard=token.startsWith('atk:')?token:'';
   let tx=h.x,ty=h.y;
   if(token.startsWith('roll:')){const [x,y]=directions[token.slice(5)];tx+=x*(boss?50:32);ty+=y*(boss?50:32);}
   if(h.smoke>0){tx=e.x-36*e.face;ty=e.y-12;}
   e.target={x:clamp(tx,23,617),y:clamp(ty,133,293)};
   e.wind=token==='heal'?.29:boss?.52:.68;
   const message=h.smoke>0?'Predicción velada':token?habit(token)+' · '+Math.round(guess.confidence*100)+'%':'Observando…';
   if(e.read!==message&&token)this.emit('sound','adapt');e.read=message;
 }
}
