import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Adventure} from '../engine.js';
import {heroPose} from '../actors.js';
import {cameraPosition,conversation,speakerPosition} from '../speech.js';
import {worlds,townsperson} from '../world.js';

test('A conversation follows its speaker as the camera moves and ends when the player leaves',()=>{
 const game=new Adventure(),npc=worlds[0].people[0];
 Object.assign(game.hero,{x:npc.x,y:npc.y});
 const speech=conversation(game,npc);
 const first=speakerPosition(game,speech);assert.ok(first);
 game.time=2;game.hero.x+=26;
 const actor=townsperson(npc,game.time,0),camera=cameraPosition(game.hero,false);
 assert.deepEqual(speakerPosition(game,speech),{x:actor.x-camera.x,y:actor.y-camera.y-44});
 assert.equal(game.mode,'map');game.hero.x+=120;assert.equal(speakerPosition(game,speech),null);
 game.hero.x=npc.x;game.mode='arena';assert.equal(speakerPosition(game,speech),null);
});
test('The room service bubble anchors to the attendant and expires in game time',()=>{
 const g=new Adventure();g.data.inside=true;Object.assign(g.hero,{x:332,y:164});
 const speech=conversation(g,{name:'Alma',line:'Ya puedes descansar.'});
 assert.deepEqual(speakerPosition(g,speech),{x:335,y:107});
 g.time=speech.until;assert.equal(speakerPosition(g,speech),null);
});
test('Walking, attacking and rolling each expose four distinct frames in action order',()=>{
 const h={roll:0,attack:0,hurt:0,heal:0};
 assert.deepEqual([0,1,2,3].map(i=>heroPose(h,true,(i+.1)/9)),[0,1,2,3]);
 for(const [action,start] of [['attack',4],['roll',8]]){
  const frames=[.23,.16,.10,.025].map(timer=>heroPose({...h,[action]:timer},false,53));
  assert.deepEqual(frames,[start,start+1,start+2,start+3]);
 }
 assert.equal(heroPose({...h,heal:.4},false,0),15);
 assert.equal(heroPose({...h,hurt:.2},false,0),14);
});
test('Native atlases have complete rows at every supported sprite scale',()=>{
 for(const [name,w,h] of [['viajero',352,704],['vecinos',224,448],['guardianes',416,1664],['objetos',256,256],['terreno',256,256]]){
  const bytes=fs.readFileSync(new URL('../assets/'+name+'.png',import.meta.url));
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[w,h],name);
 }
});

