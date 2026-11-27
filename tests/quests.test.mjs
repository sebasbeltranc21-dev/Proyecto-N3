import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../engine.js';
import {canWalk,riverX,worlds} from '../world.js';
import {questPoints,questJournal,millShortcutY,guardRounds} from '../quests.js';
import {strike} from '../arsenal.js';

const frame=1/60;
function mapAt(zone){
 const g=new Adventure();
 g.data.zone=zone;
 g.data.cleared=[0,1,2];
 g.data.scouts=[0,1,2,3];
 g.initPatrol();
 return g;
}
function use(g,target){
 const point=typeof target==='string'?questPoints(g).find(o=>o.id===target):target;
 assert.ok(point,'Expected interactable quest point '+target);
 if(!g.data.sideRoom)assert.ok(canWalk(g.data.zone,point.x,point.y,g.data.quests.mill.done));
 Object.assign(g.hero,{x:point.x,y:point.y,lock:0});
 Object.assign(g.data,{x:point.x,y:point.y});
 g.act('attack');
}
function finishFight(g,singleRound=false){
 const starting=g.sideTrial.round;
 let attempts=0;
 while(g.mode==='arena'&&(!singleRound||g.sideTrial.round===starting)&&attempts++<1800){
  const {hero:h,enemy:e}=g,dx=e.x-h.x,dy=e.y-h.y,len=Math.hypot(dx,dy);
  if(e.wind>0&&e.wind<.14&&len<95)g.act('roll');
  else if(len<55)g.act('attack');
  g.tick(frame,len>34?dx:0,len>34?dy:0);
 }
 assert.ok(attempts<1800,'Fight can be finished through combat inputs');
}

test('Mill order resets on error and a restored save keeps the new walkable bridge',()=>{
 const g=mapAt(0);
 const x=riverX(millShortcutY);
 assert.equal(canWalk(0,x,millShortcutY),false);
 use(g,worlds[0].people[0]);
 use(g,'inscription');
 use(g,'retorno');use(g,'molino');
 assert.deepEqual(g.data.quests.mill.sequence,[]);
 use(g,'retorno');
 const detached=g.snapshot();
 use(g,'entrada');use(g,'molino');
 assert.deepEqual(detached.data.quests.mill.sequence,['retorno']);
 assert.equal(g.data.bag[0],6);
 const loaded=new Adventure(JSON.parse(JSON.stringify(g.snapshot())));
 assert.equal(loaded.data.quests.mill.done,true);
 assert.match(questJournal(loaded.data)[0],/puente nuevo/);
 Object.assign(loaded.hero,{x:x-50,y:millShortcutY});
 loaded.grace=120;
 for(let i=0;i<65;i++)loaded.tick(frame,1,0);
 assert.ok(loaded.hero.x>x+50,'The player crosses the shortcut using movement');
});

test('Forest lights open a room with a real optional battle and a one-time reward',()=>{
 const g=mapAt(1);
 use(g,worlds[1].people[0]);
 use(g,'luz1');g.scaredUntil=g.time+1;use(g,'luz2');
 assert.equal(g.data.quests.forest.lights.length,1);
 g.tick(1.2,0,0);
 use(g,'luz2');use(g,'luz3');use(g,'cave');
 assert.equal(g.data.sideRoom,'forest');
 g.data.hp=88;
 use(g,'guardian');
 const snapshotsBefore=g.snapshot();
 assert.equal(g.hp,g.maxHp);
 strike(g,g.maxHp);
 assert.equal(g.mode,'map');
 assert.equal(g.data.hp,88);
 use(g,'guardian');
 finishFight(g);
 assert.equal(g.data.quests.forest.cleared,true);
 use(g,'forest-cache');
 assert.equal(g.data.bag[0],snapshotsBefore.data.bag[0]+3);
 assert.equal(g.data.quests.forest.done,true);
 assert.equal(g.data.cleared.length,3);
 assert.ok(!questPoints(g).some(o=>o.id==='forest-cache'));
 use(g,'leave');assert.equal(g.data.sideRoom,null);
});

test('Ruins require all three calques and the mosaic protects the relic until solved',()=>{
 const g=mapAt(2);
 use(g,worlds[2].people[0]);
 use(g,'agua');use(g,'raiz');use(g,'corona');
 assert.equal(g.data.quests.ruins.marks.length,3);
 use(g,'corona');assert.deepEqual(g.data.quests.ruins.sequence,[]);
 use(g,'agua');use(g,'raiz');use(g,'corona');
 use(g,'chamber');
 assert.equal(g.data.sideRoom,'ruins');
 const loaded=new Adventure(JSON.parse(JSON.stringify(g.snapshot())));
 use(loaded,'ruins-cache');assert.equal(loaded.data.bag[4],3);
 assert.equal(loaded.data.quests.ruins.done,true);
 assert.ok(!questPoints(loaded).some(o=>o.id==='ruins-cache'));
 use(loaded,'leave');assert.equal(loaded.data.sideRoom,null);
});

test('The statue uses three rounds, predicts movement and records a repeatable best time',()=>{
 const g=mapAt(3);
 g.data.unlocked.push(4);g.data.weapon=4;g.data.hp=71;
 use(g,'statue');assert.equal(g.sideTrial.round,0);
 const before=g.snapshot();
 finishFight(g,true);assert.equal(g.sideTrial.round,1);
 finishFight(g,true);assert.equal(g.sideTrial.round,2);
 assert.equal(g.enemy.max,guardRounds[2].hp);
 for(let i=0;i<7;i++)g.sideTrial.steps.observe('step:E',60,100);
 Object.assign(g.enemy,{x:280,y:213,phaseDelay:0,cool:0});
 Object.assign(g.hero,{x:340,y:213});
 g.fight(frame);
 assert.equal(g.enemy.move,'edict');
 assert.match(g.enemy.read,/derecha/);
 for(let i=0;i<16;i++)g.tick(frame,-1,0);
 while(g.enemy.wind>0)g.tick(frame,0,0);
 assert.ok(g.enemy.exposed>0);
 finishFight(g);
 assert.equal(g.data.quests.guard.done,true);
 assert.ok(g.data.quests.guard.best>0);
 assert.equal(g.data.hp,71);
 assert.equal(g.data.bag[1],before.data.bag[1]+1);
 assert.equal(g.data.won,false);
 assert.equal(g.memory.samples,0);
 const best=g.data.quests.guard.best;
 use(g,'statue');g.sideTrial.elapsed=best+30;
 finishFight(g);
 assert.equal(g.data.quests.guard.best,best);
 assert.equal(g.data.bag[1],before.data.bag[1]+1);
});
