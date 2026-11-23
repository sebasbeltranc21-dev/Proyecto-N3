import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure,weapons} from '../engine.js';
import {EchoMemory} from '../learning.js';
import {WORLD,worlds,canWalk,discoveries,throneGate} from '../world.js';
import {release,stepHazards,chooseMove} from '../arsenal.js';

test('Learns alternating dodges, scores before observation, and transfers history',()=>{
 const m=new EchoMemory();
 for(let i=0;i<22;i++)m.observe(i%2?'roll:O':'roll:E',51,80);
 assert.equal(m.predict(51,80).action,'roll:E');
 assert.ok(m.hits/m.scored>.75);
 const next=new EchoMemory(m.snapshot());assert.equal(next.samples,22);
 for(let i=0;i<25;i++)next.observe('heal',50,20);
 assert.equal(next.predict(50,20).action,'heal');
 assert.notEqual(m.samples,next.samples);
});

const frame=1/60;
function until(g,check,control,seconds=24){
 for(let i=0;i<seconds*60&&!check();i++){const [x,y]=control();g.tick(frame,x,y);}
 assert.ok(check(),'Se agotó el tiempo en '+g.mode+' / región '+g.data.zone);
}
function move(g,goal,check){until(g,check,()=>{const p=goal();return [p.x-g.hero.x,p.y-g.hero.y];});}
function encounter(g){
 if(g.hero.x<650&&g.hero.y>375)waypoint(g,464,415);
 waypoint(g,g.hero.x,WORLD.road);
 if(g.hero.x<740)waypoint(g,740,WORLD.road);
 move(g,()=>g.patrol,()=>g.mode==='transition');
 until(g,()=>g.mode==='arena',()=>[0,0]);
}
function waypoint(g,x,y){move(g,()=>({x,y}),()=>Math.hypot(g.hero.x-x,g.hero.y-y)<4);}
function duel(g){
 until(g,()=>g.mode!=='arena',()=>{
   const h=g.hero,e=g.enemy,dx=e.x-h.x,dy=e.y-h.y,len=Math.hypot(dx,dy);
   if(g.data.hp<48&&g.data.bag[0]){while(g.data.item!==0)g.act('select');g.act('item');}
   else if(e.wind>0&&e.wind<.20&&len<85)g.act('roll');
   else if(len<50)g.act('attack');
   return len>33?[dx,dy]:[0,0];
 },60);
 assert.notEqual(g.mode,'lost');
}
function exitZone(g,side,to){
 const start=g.data.zone;
 waypoint(g,g.hero.x,WORLD.road);
 until(g,()=>g.data.zone!==start,()=>[side,0]);
 assert.equal(g.data.zone,to);
}
test('Walks all four regions, opens a chest, returns from arenas and wins the crown',()=>{
 const g=new Adventure();
 move(g,()=>g.chest,()=>Math.hypot(g.hero.x-g.chest.x,g.hero.y-g.chest.y)<30);
 g.act('attack');assert.deepEqual(g.data.opened,[0]);assert.equal(g.data.weapon,1);
 encounter(g);const entry=[g.data.x,g.data.y];duel(g);
 assert.deepEqual([g.hero.x,g.hero.y],entry);
 exitZone(g,1,1);encounter(g);duel(g);
 exitZone(g,-1,0);exitZone(g,-1,2);encounter(g);duel(g);
 const save=JSON.parse(JSON.stringify(g.snapshot()));
 const loaded=new Adventure(save);assert.equal(loaded.memory.samples,g.memory.samples);
 exitZone(loaded,-1,3);
 waypoint(loaded,throneGate.x,WORLD.road);
 waypoint(loaded,throneGate.x,throneGate.y+13);
 loaded.act('attack');assert.equal(loaded.mode,'map','The sword comes before the duel');
 waypoint(loaded,loaded.chest.x,throneGate.y+13);
 loaded.act('attack');assert.equal(loaded.data.weapon,4);
 assert.ok(weapons[4].damage>Math.max(...weapons.slice(0,4).map(weapon=>weapon.damage)));
 waypoint(loaded,throneGate.x,throneGate.y+13);
 loaded.act('attack');assert.equal(loaded.mode,'transition');
 until(loaded,()=>loaded.mode==='arena',()=>[0,0]);
 const inherited=loaded.memory.samples;duel(loaded);
 assert.ok(loaded.memory.samples>inherited);assert.equal(loaded.data.royalTrialWon,true);
});
test('The king aims at the learned dodge and smoke breaks the lock',()=>{
 const g=new Adventure();g.data.zone=3;
 for(let i=0;i<10;i++)g.memory.observe('roll:E',80,90);
 g.enterArena();g.hero.x=240;g.enemy.x=315;g.enemy.cool=0;g.tick(frame,0,0);
 assert.ok(g.enemy.target.x>g.hero.x+30);assert.match(g.enemy.read,/derecha/);
 g.data.item=4;g.act('item');assert.equal(g.enemy.wind,0);
 assert.equal(g.enemy.read,'Predicción velada');
});
test('Healing takes time; death allows retry with retained learning and equipment',()=>{
 const g=new Adventure();g.data.hp=20;g.act('item');
 assert.equal(g.data.hp,20);for(let i=0;i<45;i++)g.tick(frame,0,0);
 assert.equal(g.data.hp,63);g.enterArena();g.learn('roll:N');
 g.data.hp=1;g.enemy.x=g.hero.x;g.enemy.y=g.hero.y;g.enemy.target={...g.hero};g.enemy.wind=.001;
 g.tick(frame,0,0);assert.equal(g.mode,'lost');
 g.retry();assert.equal(g.mode,'map');assert.equal(g.data.hp,100);assert.equal(g.memory.samples,1);
});

test('Original saves migrate once, with safe coordinates, gear, life and learned memory',()=>{
 const g=new Adventure();g.memory.observe('roll:E',80,100);
 const legacy={version:1,data:{zone:2,x:311,y:100,hp:76,cleared:[0],unlocked:[0,1],weapon:1},memory:g.memory.snapshot()};
 const a=new Adventure(legacy);
 assert.ok(canWalk(2,a.hero.x,a.hero.y));assert.equal(a.data.weapon,1);
 assert.equal(a.maxHp,115);assert.equal(a.data.hp,76);assert.equal(a.memory.samples,1);
 const b=new Adventure(JSON.parse(JSON.stringify(a.snapshot())));
 assert.deepEqual([b.hero.x,b.hero.y],[a.hero.x,a.hero.y]);
 assert.equal(canWalk(0,WORLD.bridgeX,WORLD.road),true);
 assert.equal(canWalk(0,WORLD.bridgeX+12,WORLD.road+48),false);
});

test('Each interior can be entered, resumed, used and left from the world',()=>{
 for(let zone=0;zone<4;zone++){
   const g=new Adventure();g.data.zone=zone;const door=worlds[zone].houses[0];
   Object.assign(g.hero,{x:door.x,y:door.y+8});g.act('attack');assert.equal(g.data.inside,true);
   const inside=new Adventure(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(inside.data.inside,true);
   Object.assign(inside.hero,{x:335,y:174});inside.data.hp=20;
   const count=inside.data.bag[0];inside.act('attack');inside.act('attack');
   assert.deepEqual(inside.data.services,[zone]);
   if(zone===0)assert.equal(inside.data.hp,100);if(zone===1)assert.equal(inside.data.bag[0],count+3);
   Object.assign(inside.hero,{x:319,y:273});inside.act('attack');assert.equal(inside.data.inside,false);
   assert.ok(canWalk(zone,inside.hero.x,inside.hero.y));
 }
});

test('Scout victories and discoveries reward supplies without granting seals or duplicating loot',()=>{
 const g=new Adventure();Object.assign(g.hero,discoveries[0][0]);const before=g.data.bag[0];
 g.act('attack');g.act('attack');assert.equal(g.data.bag[0],before+1);
 g.beginBattle('scout');g.enterArena();assert.ok(g.enemy.max<100);
 g.winBattle();assert.deepEqual(g.data.scouts,[0]);assert.deepEqual(g.data.cleared,[]);
});

test('Distinct weapon hitboxes, active dodges, and all three royal arsenals',()=>{
 for(const [kind,count] of [['lance',1],['fan',3],['slam',1],['sweep',1]]){
   const g=new Adventure();g.enterArena();const e=g.enemy;
   Object.assign(e,{x:250,y:200,target:{x:300,y:200},move:kind});
   Object.assign(g.hero,{x:295,y:200});release(g);assert.equal(g.hazards.length,count);
   const old=g.data.hp;
   for(let i=0;i<40;i++)stepHazards(g,frame);
   assert.ok(g.data.hp<old,kind+' should reach its target');
 }
 const g=new Adventure();g.data.zone=3;g.enterArena();assert.equal(g.enemy.max,600);
 assert.equal(chooseMove(g.enemy,3),'dash');g.enemy.phase=2;assert.equal(chooseMove(g.enemy,3),'fan');
 g.enemy.phase=3;assert.equal(chooseMove(g.enemy,3),'edict');
 Object.assign(g.enemy,{x:250,y:200,target:{x:300,y:200},move:'sweep'});Object.assign(g.hero,{x:290,y:200,roll:.23});
 release(g);stepHazards(g,.1);assert.equal(g.data.hp,100);
});

test('All eight opponents vary their repertoire and scouts retain individual observations',()=>{
 const repertoires=new Set();
 for(let zone=0;zone<4;zone++)for(const scout of [true,false]){
  const g=new Adventure();g.data.zone=zone;g.encounterType=scout?'scout':'guardian';g.enterArena();
  const attacks=new Set();
  for(let n=0;n<12;n++){g.enemy.sequence=n;g.enemy.move=chooseMove(g.enemy,zone);attacks.add(g.enemy.move);}
  assert.ok(attacks.size>=3);repertoires.add([...attacks].sort().join('/'));
 }
 assert.equal(repertoires.size,8);
 const g=new Adventure();g.data.zone=1;g.encounterType='scout';g.enterArena();
 for(let i=0;i<8;i++){g.learn('atk:0:E');g.learn('roll:E');}
 assert.equal(g.foeMemory.samples,8);assert.equal(g.memory.samples,16);
 const loaded=new Adventure(JSON.parse(JSON.stringify(g.snapshot())));
 loaded.encounterType='scout';loaded.enterArena();loaded.enemy.x=loaded.hero.x+80;loaded.enemy.cool=0;
 loaded.tick(frame,0,0);assert.equal(loaded.enemy.move,'hook');assert.ok(loaded.enemy.target.x>loaded.hero.x);
 loaded.encounterType='guardian';loaded.enterArena();assert.equal(loaded.foeMemory.samples,0);
});
test('Returning blade doubles back and the marked thorns leave time to step aside',()=>{
 const g=new Adventure();g.enterArena();const e=g.enemy;
 Object.assign(e,{x:240,y:200,target:{x:340,y:200},move:'hook'});release(g);
 const blade=g.hazards[0];for(let i=0;i<45;i++)stepHazards(g,frame);
 assert.ok(blade.x>380);for(let i=0;i<42;i++)stepHazards(g,frame);assert.ok(blade.x<260);
 e.move='bloom';release(g);g.hero.x=340;g.hero.y=250;stepHazards(g,frame);assert.equal(g.data.hp,100);
 g.hero.y=200;stepHazards(g,frame);assert.ok(g.data.hp<100);
});

test('Royal phase thresholds cannot be skipped and the last phase predicts a walking route',()=>{
 const g=new Adventure();g.data.zone=3;g.data.weapon=4;g.enterArena();
 const e=g.enemy;
 Object.assign(g.hero,{x:285,y:205});Object.assign(e,{x:315,y:205,hp:405});
 g.act('attack');
 assert.equal(e.hp,400);assert.equal(e.phase,2);assert.ok(e.phaseDelay>0);
 assert.equal(chooseMove(e,3),'fan');
 g.hero.lock=0;g.act('attack');assert.equal(e.hp,400);
 for(let i=0;i<85;i++)g.tick(frame,1,0);
 assert.ok(g.royalSteps.samples>=3);
 Object.assign(e,{hp:206,phaseDelay:0,guard:'',wind:0});
 Object.assign(g.hero,{x:e.x-30,y:e.y,lock:0});g.act('attack');
 assert.equal(e.hp,200);assert.equal(e.phase,3);
 e.phaseDelay=0;g.hero.x=280;g.hero.y=203;e.x=325;e.y=203;e.cool=0;
 g.fight(frame);
 assert.equal(e.move,'edict');assert.match(e.read,/Ruta hacia derecha/);
 assert.equal(e.runes.length,3);assert.ok(e.runes.every(rune=>rune.x>g.hero.x+40));
 release(g);
 Object.assign(g.hero,{x:e.runes[0].x,y:e.runes[0].y});
 const hp=g.data.hp;stepHazards(g,frame);
 assert.ok(g.data.hp<hp,'The marked ground must resolve the displayed attack');
});
test('Previous winners can challenge the three-phase King without losing their equipment',()=>{
 const legacy=new Adventure().snapshot();
 Object.assign(legacy.data,{zone:3,won:true,cleared:[0,1,2,3],opened:[3],unlocked:[0,4],weapon:4});
 const g=new Adventure(legacy);
 Object.assign(g.hero,throneGate);
 g.act('attack');assert.equal(g.mode,'transition');
 g.enterArena();assert.equal(g.enemy.phase,1);assert.equal(g.data.weapon,4);
 g.retry();assert.equal(g.mode,'map');
 assert.ok(Math.abs(g.hero.x-throneGate.x)<100);
 assert.equal(g.data.royalTrialWon,false);
});