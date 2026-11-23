import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure,diamondIndex,weapons} from '../engine.js';
import {dragonMoves,diveFlight,waveDuration} from '../battle-plus.js';
import {CinematicDirector} from '../cinematics.js';
import {drawPlusBattle} from '../battle-plus-art.js';
import {drawHero} from '../actors.js';

const dt=.025;
const canvas=new Proxy({},{get:(g,key)=>g[key]??(()=>{})});
function completedAdventure(onEvent){
 return new Adventure({data:{
  zone:3,x:944,y:260,hp:73,weapon:4,unlocked:[0,1,2,3,4],
  cleared:[0,1,2,3],won:true,royalTrialWon:true,mapRevision:2
 }},onEvent);
}
function waitUntil(game,condition){
 for(let i=0;i<400&&!condition();i++)game.tick(dt,0,0);
 assert.ok(condition());
}

test('Battle Plus unlocks after the royal victory and starts its timer after the sword cinematic',()=>{
 assert.equal(new Adventure().startBattlePlus(),false);
 const game=completedAdventure();
 const original=game.snapshot();
 const director=new CinematicDirector(null);
 game.cinematicHandler=(id,done)=>director.play(id,game,done);
 assert.equal(game.startBattlePlus(),true);
 assert.equal(game.startBattlePlus(),false);
 assert.equal(director.id,'diamond_sword');
 game.tick(3,0,0);
 assert.equal(game.battlePlus.stage,'intro');
 assert.equal(game.battlePlus.remaining,waveDuration);
 director.advance();
 director.advance();
 assert.match(director.current.title,/Diamante/);
 director.skip();
 assert.equal(game.battlePlus.stage,'waves');
 assert.equal(game.weapon,diamondIndex);
 assert.equal(game.hp,game.maxHp);
 assert.equal(weapons[game.weapon].cost,0);
 game.act('weapon');
 game.act('item');
 game.battlePlus.takeDamage(12);
 assert.deepEqual(game.snapshot(),original);
 game.leaveBattlePlus();
 assert.equal(game.weapon,4);
 assert.equal(game.hp,73);
 assert.deepEqual(game.hero.x,944);
});

test('Diamond slashes clear groups in one hit, with eight enemy types spawning for 45 seconds',()=>{
 const game=completedAdventure();
 game.startBattlePlus();
 const battle=game.battlePlus;
 const types=new Set();
 const step=()=>{
  for(const enemy of battle.enemies){
   types.add(enemy.zone+':'+enemy.scout);
   // Feed the spawned foes into the sword's range to exercise pressure and kills.
   enemy.x=game.hero.x+22;
   enemy.y=game.hero.y;
  }
  game.tick(dt,0,0);
  game.act('attack');
 };
 for(let i=0;i<(waveDuration-1)/dt;i++)step();
 assert.equal(battle.stage,'waves');
 assert.equal(types.size,8);
 assert.ok(battle.kills>65);
 for(let i=0;i<1/dt;i++)step();
 assert.equal(battle.stage,'arrival');
 assert.equal(battle.remaining,0);
 assert.equal(battle.enemies.length,0);
 assert.equal(battle.projectiles.length,0);
 assert.ok(battle.dragon.hp>weapons[game.weapon].damage);
 assert.equal(game.snapshot().data.weapon,4);
});

test('The dragon telegraphs three attacks, while only exposed scales take full sword damage',()=>{
 const game=completedAdventure();
 game.startBattlePlus();
 const battle=game.battlePlus;
 battle.summonDragon();
 const d=battle.dragon;
 Object.assign(game.hero,{x:d.x-70,y:d.y});
 waitUntil(game,()=>d.phase==='wind');
 assert.equal(d.move,'breath');
 drawPlusBattle(canvas,battle,()=>drawHero(canvas,game,true));
 const hp=d.hp;
 game.act('attack');
 assert.equal(d.hp,hp-36);
 waitUntil(game,()=>d.phase==='recover');
 assert.equal(game.hp,game.maxHp-dragonMoves.breath.damage);
 const guardHp=d.hp;
 game.act('attack');
 assert.equal(d.hp,guardHp-weapons[game.weapon].damage);

 waitUntil(game,()=>d.move==='dive'&&d.phase==='wind');
 const target={...d.target};
 for(let i=0;i<32;i++)game.tick(dt,target.x<320?1:-1,0);
 assert.ok(Math.abs(target.x-game.hero.x)>76);
 const afterBreath=game.hp;
 waitUntil(game,()=>d.move==='dive'&&d.phase==='attack'&&d.age>=diveFlight);
 assert.ok(Math.abs(d.x-target.x)<1&&Math.abs(d.y-target.y)<1);
 drawPlusBattle(canvas,battle,()=>drawHero(canvas,game,true));
 waitUntil(game,()=>d.phase==='recover');
 assert.equal(game.hp,afterBreath);
 waitUntil(game,()=>d.move==='volley'&&d.phase==='wind');
 assert.equal(battle.projectiles.length,0);
 waitUntil(game,()=>d.move==='volley'&&d.phase==='attack');
 assert.equal(battle.projectiles.length,5);
 drawPlusBattle(canvas,battle,()=>drawHero(canvas,game,true));
});

test('Dragon victory persists, a loss can be retried, and Plus cinematics and combat render',()=>{
 const events=[];
 const game=completedAdventure((type,value)=>events.push([type,value]));
 game.startBattlePlus();
 const battle=game.battlePlus;
 const director=new CinematicDirector(null);
 director.play('diamond_sword',game);
 director.tick(.5,game);
 director.draw(canvas,game);
 drawPlusBattle(canvas,battle,()=>drawHero(canvas,game,true));
 battle.takeDamage(game.maxHp);
 assert.equal(battle.stage,'lost');
 assert.equal(game.snapshot().data.hp,73);
 game.leaveBattlePlus();
 assert.equal(game.startBattlePlus(),true);
 assert.notEqual(game.battlePlus,battle);
 game.battlePlus.summonDragon();
 const d=game.battlePlus.dragon;
 drawPlusBattle(canvas,game.battlePlus,()=>drawHero(canvas,game,true));
 waitUntil(game,()=>d.phase==='recover');
 Object.assign(game.hero,{x:d.x-40,y:d.y});
 d.hp=weapons[game.weapon].damage;
 game.act('attack');
 assert.deepEqual(events.filter(([t])=>t==='plus_finished'),[['plus_finished',false],['plus_finished',true]]);
 const restored=new Adventure(game.snapshot());
 assert.equal(restored.data.battlePlusWon,true);
 assert.equal(restored.battlePlus,null);
 assert.equal(restored.weapon,4);
});
