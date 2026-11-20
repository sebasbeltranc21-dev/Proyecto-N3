import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../engine.js';
import {EchoMemory} from '../learning.js';

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
 move(g,()=>g.patrol,()=>g.mode==='transition');
 until(g,()=>g.mode==='arena',()=>[0,0]);
}
function duel(g){
 until(g,()=>g.mode!=='arena',()=>{
   const h=g.hero,e=g.enemy,dx=e.x-h.x,dy=e.y-h.y,len=Math.hypot(dx,dy);
   if(len<50)g.act('attack');
   return len>33?[dx,dy]:[0,0];
 });
 assert.notEqual(g.mode,'lost');
}
function exitZone(g,side,to){
 const start=g.data.zone;
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
 exitZone(loaded,-1,3);encounter(loaded);
 const inherited=loaded.memory.samples;duel(loaded);
 assert.ok(loaded.memory.samples>inherited);assert.equal(loaded.data.won,true);
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
