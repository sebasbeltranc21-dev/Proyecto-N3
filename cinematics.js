import {WORLD,throneGate,worlds} from './world.js';
import {habit} from './learning.js';
import {drawCinematicScene,drawCinematicFrame} from './cinematic-art.js';

export const royalPhaseQuotes={
 2:{title:'Fase II · El Espejo',line:'«Tus pasos ya dibujan mi reflejo en la piedra.»'},
 3:{title:'Fase III · El Último Eco',line:'«¡Veamos si la Espada del Alba sobrevive a tu propia sombra!»'}
};

function clampCam(x,y){
 return {
  x:Math.round(Math.max(0,Math.min(WORLD.width-640,x-320))),
  y:Math.round(Math.max(0,Math.min(WORLD.height-336,y-202)))
 };
}

export function buildScript(id,game){
 const mem=game?.memory;
 const samples=mem?.samples||0;
 const pred=mem?mem.predict(55,80):{action:''};
 const topHabit=pred.action?habit(pred.action):'';
 const altar=worlds[3].chest;
 const mill=worlds[0].houses.find(place=>place.type==='mill');
 const kingLine=samples>=6 && topHabit
  ?`He contado ${samples} gestos tuyos a través de mis guardianes. Cuando dudas, repites «${topHabit}»…`
  :samples>0
   ?`Mis guardianes trajeron ${samples} ecos de tu espada hasta este salón. Cada golpe tuyo ya resuena en mis muros.`
   :'Pocos llegan hasta el trono sin dejar huella… pero tus primeros pasos ya empiezan a enseñarme cómo peleas.';

 const scripts={
  intro:[
   {stage:'map',zone:3,focus:throneGate,pan:-105,establishing:true,tint:'#17162c38',speaker:'Crónica de la Isla',title:'La Isla de los Ecos',
    text:'Hace un siglo, el Rey Mimético selló la isla bajo una corona que recuerda cada golpe y cada esquive de quienes lo desafían.'},
   {stage:'map',zone:0,focus:mill,pan:100,establishing:true,speaker:'Crónica de la Isla',title:'Los Tres Sellos',
    text:'Bramble en la pradera, Lumbre en el bosque y Talos en las ruinas custodian los tres sellos que abren el Castillo Mimético.'},
   {stage:'map',zone:0,focus:{x:210,y:285},cut:true,speaker:'Viajero',title:'El Comienzo del Camino',
    text:'Debo reunir los tres sellos, descubrir nuevas armas y llegar al castillo… antes de que el Rey aprenda todos mis movimientos.'}
  ],
  guardian_0:[
   {stage:'boss_intro',zone:0,speaker:'Bramble, el Guardabrotes',title:'Guardián de la Pradera',
    text:'«Otro viajero cruza el puente del molino. Mi jabalina probará tus reflejos… y el Rey guardará cada eco de tu esquive.»',sfx:'rumble'}
  ],
  guardian_1:[
   {stage:'boss_intro',zone:1,speaker:'Lumbre, la Polilla Lunar',title:'Guardiana del Bosque',
    text:'«Las luciérnagas ya susurran cómo luchaste en la pradera. Mis cuchillas no buscan dónde estás… sino adónde vas a rodar.»',sfx:'rumble'}
  ],
  guardian_2:[
   {stage:'boss_intro',zone:2,speaker:'Talos, el Centinela',title:'Guardián de las Ruinas',
    text:'«El último sello pesa tanto como mi martillo. Si resistes la onda de piedra, el Castillo Mimético abrirá su portón.»',sfx:'rumble'}
  ],
  castle_arrival:[
   {stage:'map',focus:{x:throneGate.x,y:throneGate.y-10},speaker:'Narrador',title:'Castillo Mimético',
    text:'Los tres sellos vibran al unísono. Al fondo del barrio de las almenas se alza la única fortaleza del Rey Mimético.',sfx:'rumble'},
   {stage:'map',focus:{x:worlds[3].chest.x,y:worlds[3].chest.y},speaker:'Voz de los Antiguos',title:'El Altar del Alba',
    text:'Junto al portón brilla el cofre sagrado de la Espada del Alba. Ningún acero común ha logrado quebrar jamás la corona del Rey.'}
  ],
  castle_locked:[
   {stage:'map',focus:{x:throneGate.x,y:throneGate.y-8},speaker:'Inscripción del Portón',title:'El Umbral Sellado',
    text:'El hierro del portón vibra y rechaza tu paso. Una inscripción dorada arde sobre la piedra: «Solo quien empuñe el Alba podrá mirar al Rey sin convertirse en su eco.»',sfx:'rumble'},
   {stage:'map',focus:{x:worlds[3].chest.x,y:worlds[3].chest.y},speaker:'Viajero',title:'La Última Espada',
    text:'Ese resplandor junto al muro… es el cofre de la Espada del Alba. Debo despertarla antes de cruzar el portón del castillo.'}
  ],
  dawn_sword:[
   {stage:'sword_shrine',zone:3,focus:altar,pan:-34,establishing:true,speaker:'Narrador',title:'El Despertar del Alba',
    text:'Al abrir el cofre ancestral, una columna de luz dorada rasga la ceniza del patio. El aire vibra como una campana lejana.',sfx:'sword'},
   {stage:'sword_shrine',zone:3,focus:altar,establishing:true,speaker:'Espada del Alba',title:'Arma Legendaria Desbloqueada',
    text:'Forjada por los primeros viajeros que resistieron al Rey, su filo arde con luz propia: el arma más poderosa de la isla ahora responde a tu mano.'},
   {stage:'map',focus:{x:throneGate.x,y:throneGate.y-8},speaker:'Viajero',title:'Hacia el Salón del Trono',
    text:'El portón del castillo acaba de desbloquearse. Con la Espada del Alba en mano, es hora de entrar y terminar con el reinado de los ecos.'}
  ],
  throne_intro:[
   {stage:'throne',step:0,speaker:'Narrador',title:'Salón del Trono',
    text:'Las pesadas rejas del Castillo Mimético se elevan con un rugido de piedra. Al cruzar el umbral, la sala se ilumina con antorchas carmesí.',sfx:'rumble'},
   {stage:'throne',step:1,speaker:'Rey Mimético',title:'El Soberano de los Ecos',
    text:`«Al fin entras en mi corte, viajero. ${kingLine}»`},
   {stage:'throne',step:2,speaker:'Rey Mimético',title:'La Corona Despierta',
    text:'«Y traes contigo la Espada del Alba… Muy bien. Tres formas tiene mi corona, y en cada una reflejaré quién eres realmente. ¡En guardia!»',sfx:'adapt'}
  ],
  diamond_sword:[
   {stage:'diamond_shrine',speaker:'Voz de la Caldera',title:'El Corazón del Diamante',
    text:'Bajo el trono, una veta de diamante se abrió cuando cayó la corona. De su luz nació una espada capaz de partir la piedra con un solo tajo.',sfx:'sword'},
   {stage:'diamond_shrine',speaker:'Viajero',title:'Espada de Diamante',
    text:'La espada ya es mía. Resistiré 45 segundos en la caldera. Si el rugido que oigo es real, lo peor vendrá después.',sfx:'dragon_roar',raise:true}
  ],
  victory:[
   {stage:'epilogue',step:0,speaker:'Narrador',title:'La Corona Quebrada',
    text:'Un último destello de la Espada del Alba parte en dos la corona del Rey Mimético. Los ecos atrapados durante un siglo se liberan en chispas doradas.',sfx:'win'},
   {stage:'epilogue',step:1,speaker:'Rey Mimético',title:'El Último Susurro',
    text:'«Por primera vez… no pude prever tu siguiente paso. El silencio vuelve a ser tuyo, viajero.»'},
   {stage:'map',zone:0,focus:mill,pan:94,establishing:true,speaker:'Crónica de la Isla',title:'Un Nuevo Amanecer',
    text:'El viento regresa al molino de la pradera, el bosque apaga sus cuchillas y las ruinas descansan. La Isla de los Ecos vuelve a cantar.'}
  ]
 };
 return scripts[id]||null;
}

export class CinematicDirector{
 constructor(audio,onShake=()=>{}){
  this.audio=audio;
  this.onShake=onShake;
  this.active=false;
  this.id='';
  this.beats=[];
  this.index=0;
  this.time=0;
  this.beatTime=0;
  this.chars=0;
  this.voiceTimer=0;
  this.cam=null;
  this.onComplete=null;
 }
 play(id,game,onComplete=()=>{}){
  const beats=buildScript(id,game);
  if(!beats||!beats.length){onComplete();return false;}
  this.active=true;
  this.id=id;
  this.beats=beats;
  this.index=0;
  this.time=0;
  this.beatTime=0;
  this.chars=0;
  this.voiceTimer=0;
  this.onComplete=onComplete;
  const start=clampCam(game.hero.x,game.hero.y);
  this.cam={x:start.x,y:start.y};
  this._enterBeat();
  return true;
 }
 get current(){return this.beats[this.index]||null;}
 get revealedText(){
  const b=this.current;
  if(!b)return '';
  return b.text.slice(0,Math.floor(this.chars));
 }
 get lineComplete(){
  const b=this.current;
  return !b||this.chars>=b.text.length;
 }
 _triggerBeatSfx(){
  const b=this.current;
  if(!b)return;
  if(b.sfx){
   this.audio?.play(b.sfx);
   if(['rumble','sword','dragon_roar'].includes(b.sfx))this.onShake(b.sfx==='rumble'?3:4,.38);
  }
 }
 _enterBeat(previous=null){
  const b=this.current;
  if(b.focus&&(b.cut||(b.zone!==undefined&&b.zone!==previous?.zone))){
   this.cam=clampCam(b.focus.x+(b.pan??0),b.focus.y);
  }
  this._triggerBeatSfx();
 }
 advance(){
  if(!this.active)return;
  const b=this.current;
  if(b&&this.chars<b.text.length){
   this.chars=b.text.length;
   return;
  }
  this.index++;
  if(this.index>=this.beats.length){this.finish();return;}
  this.beatTime=0;
  this.chars=0;
  this.voiceTimer=0;
  this._enterBeat(b);
 }
 skip(){
  if(!this.active)return;
  this.finish();
 }
 finish(){
  const done=this.onComplete;
  this.active=false;
  this.id='';
  this.beats=[];
  this.onComplete=null;
  done?.();
 }
 tick(dt,game){
  if(!this.active)return;
  this.time+=dt;
  this.beatTime+=dt;
  const b=this.current;
  if(!b)return;
  if(this.chars<b.text.length){
   const prev=Math.floor(this.chars);
   this.chars=Math.min(b.text.length,this.chars+dt*44);
   this.voiceTimer+=dt;
   if(Math.floor(this.chars)>prev&&this.voiceTimer>=.075){
    this.voiceTimer=0;
    this.audio?.play('voice',this.index+b.speaker.length);
   }
  }
  if(b.focus&&this.cam){
   const target=clampCam(b.focus.x,b.focus.y);
   const k=Math.min(1,dt*4.5);
   this.cam.x+=(target.x-this.cam.x)*k;
   this.cam.y+=(target.y-this.cam.y)*k;
  }
 }
 draw(g,game,drawWorldFn){
  const b=this.current;
  if(!this.active||!b)return;
  const camera={x:Math.round(this.cam.x),y:Math.round(this.cam.y)};
  drawCinematicScene(g,game,b,this.time,this.beatTime,camera,drawWorldFn);
  drawCinematicFrame(g,b.title,this.time);
 }
}
