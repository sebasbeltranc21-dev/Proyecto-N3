import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../engine.js';
import {worlds,throneGate} from '../world.js';
import {buildScript,CinematicDirector} from '../cinematics.js';

test('Zone 3 has strictly ONE castle gate and no zone duplicates unique landmarks',()=>{
 const zone3Gates=worlds[3].houses.filter(h=>h.type==='gate');
 assert.equal(zone3Gates.length,1,'El último mapa debe tener exactamente un solo castillo');
 assert.equal(zone3Gates[0].x,throneGate.x);

 const uniqueTypes=['inn','herbal','archive','armory','mill','gate'];
 for(const [z,w] of worlds.entries()){
  for(const type of uniqueTypes){
   const count=w.houses.filter(h=>h.type===type).length;
   assert.ok(count<=1,`Zona ${z} no debe duplicar el edificio único ${type} (encontrados: ${count})`);
  }
 }
});

test('Castle gate and Espada del Alba trigger immersive cinematics before combat',()=>{
 const events=[];
 const g=new Adventure(null,(type,val)=>events.push([type,val]));
 let intercepted=null;
 g.cinematicHandler=(id,done)=>{intercepted={id,done};};

 // Enter zone 3 without Espada del Alba and interact with the castle gate
 g.data.zone=3;
 Object.assign(g.hero,{x:throneGate.x,y:throneGate.y+10});
 g.act('attack');
 assert.equal(g.mode,'map','No debe forzar combate sin la Espada del Alba');
 assert.ok(events.some(([t,v])=>t==='cinematic'&&v.id==='castle_locked'),'Debe disparar cinemática de portón sellado');

 // Open the Espada del Alba altar/chest
 Object.assign(g.hero,{x:worlds[3].chest.x,y:worlds[3].chest.y+8});
 g.act('attack');
 assert.equal(g.data.weapon,4);
 assert.ok(events.some(([t,v])=>t==='cinematic'&&v.id==='dawn_sword'),'Debe disparar cinemática de la Espada del Alba');

 // Now enter the castle gate with the Espada del Alba: cinematic runs BEFORE battle
 Object.assign(g.hero,{x:throneGate.x,y:throneGate.y+10});
 g.act('attack');
 assert.equal(g.mode,'map','La cinemática del trono debe reproducirse antes de iniciar la transición');
 assert.equal(intercepted?.id,'throne_intro');

 // Once cinematic completes, battle transition begins
 intercepted.done();
 assert.equal(g.mode,'transition');
});

test('Throne cinematic personalizes lore with player memory and director advances/skips cleanly',()=>{
 const g=new Adventure();
 for(let i=0;i<10;i++)g.memory.observe('roll:E',55,80);
 const script=buildScript('throne_intro',g);
 assert.ok(script.length>=3);
 assert.match(script[1].text,/10 gestos/);
 assert.match(script[1].text,/derecha/i);

 let finished=false;
 const dir=new CinematicDirector(null);
 dir.play('dawn_sword',g,()=>{finished=true;});
 assert.equal(dir.active,true);
 // First advance reveals full line, second moves to next beat
 dir.advance();
 assert.equal(dir.lineComplete,true);
 dir.skip();
 assert.equal(dir.active,false);
 assert.equal(finished,true);
});

test('Snapshot preserves seenCinematics and found items without shared array mutations',()=>{
 const g=new Adventure();
 g.markCinematic('intro');
 g.markCinematic('castle_arrival');
 const snap=g.snapshot();
 g.markCinematic('dawn_sword');
 assert.deepEqual(snap.data.seenCinematics,['intro','castle_arrival']);
 const restored=new Adventure(snap);
 assert.equal(restored.hasSeenCinematic('castle_arrival'),true);
 assert.equal(restored.hasSeenCinematic('dawn_sword'),false);
});
