import {WORLD,throneGate,worlds} from './world.js';
import {habit} from './learning.js';
import {rect,oval,label} from './art.js';
import {tile,nativeActor} from './atlas.js';

export const royalPhaseQuotes={
 2:{title:'Fase II · El Espejo',line:'«Tus pasos ya dibujan mi reflejo en la piedra.»'},
 3:{title:'Fase III · El Último Eco',line:'«¡Veamos si la Espada del Alba sobrevive a tu propia sombra!»'}
};

function clampCam(x,y){
 return {
  x:Math.round(Math.max(0,Math.min(WORLD.width-640,x-320))),
  y:Math.round(Math.max(0,Math.min(WORLD.height-336,y-168)))
 };
}

export function buildScript(id,game){
 const mem=game?.memory;
 const samples=mem?.samples||0;
 const pred=mem?mem.predict(55,80):{action:''};
 const topHabit=pred.action?habit(pred.action):'';
 const kingLine=samples>=6 && topHabit
  ?`He contado ${samples} gestos tuyos a través de mis guardianes. Cuando dudas, repites «${topHabit}»…`
  :samples>0
   ?`Mis guardianes trajeron ${samples} ecos de tu espada hasta este salón. Cada golpe tuyo ya resuena en mis muros.`
   :'Pocos llegan hasta el trono sin dejar huella… pero tus primeros pasos ya empiezan a enseñarme cómo peleas.';

 const scripts={
  intro:[
   {stage:'prologue',speaker:'Crónica de la Isla',title:'La Isla de los Ecos',
    text:'Hace un siglo, el Rey Mimético selló la isla bajo una corona que recuerda cada golpe y cada esquive de quienes lo desafían.'},
   {stage:'prologue',speaker:'Crónica de la Isla',title:'Los Tres Sellos',
    text:'Bramble en la pradera, Lumbre en el bosque y Talos en las ruinas custodian los tres sellos que abren el Castillo Mimético.'},
   {stage:'map',focus:{x:210,y:285},speaker:'Viajero',title:'El Comienzo del Camino',
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
   {stage:'sword_shrine',speaker:'Narrador',title:'El Despertar del Alba',
    text:'Al abrir el cofre ancestral, una columna de luz dorada rasga la ceniza del patio. El aire vibra como una campana lejana.',sfx:'sword'},
   {stage:'sword_shrine',speaker:'Espada del Alba',title:'Arma Legendaria Desbloqueada',
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
  victory:[
   {stage:'epilogue',step:0,speaker:'Narrador',title:'La Corona Quebrada',
    text:'Un último destello de la Espada del Alba parte en dos la corona del Rey Mimético. Los ecos atrapados durante un siglo se liberan en chispas doradas.',sfx:'win'},
   {stage:'epilogue',step:1,speaker:'Rey Mimético',title:'El Último Susurro',
    text:'«Por primera vez… no pude prever tu siguiente paso. El silencio vuelve a ser tuyo, viajero.»'},
   {stage:'epilogue',step:2,speaker:'Crónica de la Isla',title:'Un Nuevo Amanecer',
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
  this._triggerBeatSfx();
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
   if(b.sfx==='rumble'||b.sfx==='sword')this.onShake(b.sfx==='sword'?4:3,.38);
  }
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
  this._triggerBeatSfx();
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
  if(b.stage==='map'&&b.focus&&this.cam){
   const target=clampCam(b.focus.x,b.focus.y);
   const k=Math.min(1,dt*4.5);
   this.cam.x+=(target.x-this.cam.x)*k;
   this.cam.y+=(target.y-this.cam.y)*k;
  }
 }
 draw(g,game,drawWorldFn){
  if(!this.active)return;
  const b=this.current,t=this.time,bt=this.beatTime;
  if(!b)return;
  if(b.stage==='map'){
   drawWorldFn({x:Math.round(this.cam.x),y:Math.round(this.cam.y)});
   // Subtle golden focus glow
   if(b.focus){
    const fx=b.focus.x-Math.round(this.cam.x),fy=b.focus.y-Math.round(this.cam.y);
    const r=26+Math.round(Math.sin(t*4)*4);
    oval(g,'#ffda7d24',fx,fy-8,r,Math.round(r*.55));
   }
  }else if(b.stage==='prologue'){
   rect(g,'#10192b',0,0,640,336);
   // Night sky gradient bands
   rect(g,'#17253d',0,56,640,95);
   rect(g,'#223650',0,151,640,54);
   // Moon & stars
   oval(g,'#ffeec2',512,92,22,22);
   oval(g,'#17253d',522,87,18,18);
   for(let i=0;i<36;i++){
    const sx=(i*73+19)%640,sy=42+(i*29)%115;
    if(Math.sin(t*2.5+i)>-0.3)rect(g,i%3?'#fff4cf':'#9ae6d1',sx,sy,2,2);
   }
   // Silhouette of the island & castle peak
   oval(g,'#14242c',320,248,260,55);
   rect(g,'#0d1721',0,232,640,104);
   // Distant lone castle silhouette on the hill
   rect(g,'#1d2236',292,162,56,42);
   rect(g,'#1d2236',286,148,14,56);
   rect(g,'#1d2236',340,148,14,56);
   rect(g,'#ffcf75',315,182,10,14);
   // Floating echoes
   for(let i=0;i<14;i++){
    const ex=(i*57+t*22)%640,ey=155+Math.sin(t*1.8+i)*26;
    rect(g,i%2?'#ffcf68aa':'#82debf99',ex,ey,3,2);
   }
  }else if(b.stage==='boss_intro'){
   tile(g,'arenas',b.zone,0,0,640,336);
   rect(g,'#0f152266',0,0,640,336);
   const enter=Math.min(1,bt*1.6);
   const hx=Math.round(110+enter*74),ex=Math.round(520-enter*75);
   oval(g,'#1b202966',hx,208,15,5);
   nativeActor(g,'hero',16+(enter<1?Math.floor(t*9)%4:12),hx,206,1);
   oval(g,'#1b202966',ex,208,16,5);
   nativeActor(g,'foes',48+b.zone*4+(Math.floor(t*3)%2),ex,206,-1);
  }else if(b.stage==='sword_shrine'){
   tile(g,'arenas',3,0,0,640,336);
   rect(g,'#120e1e99',0,0,640,336);
   // Radiant dawn pillar behind the hero
   const pulse=Math.round(Math.sin(t*5)*6);
   rect(g,'#ffcf6826',266-pulse,30,108+pulse*2,250);
   rect(g,'#ffe79938',292,30,56,250);
   rect(g,'#fff7d14d',310,30,20,250);
   oval(g,'#ffcf6844',320,204,48+pulse,14);
   // Hero raising the golden Espada del Alba
   nativeActor(g,'hero',16+15,320,206,1);
   // Glowing golden sword hovering above hero's hand
   const sy=Math.round(132+Math.sin(t*4)*5);
   rect(g,'#252538',317,sy-24,6,34);
   rect(g,'#e6b569',318,sy-22,4,28);
   rect(g,'#fff5cc',319,sy-20,2,24);
   rect(g,'#f2c36c',312,sy+5,16,4);
   rect(g,'#84513e',318,sy+9,4,8);
   // Rising golden dawn sparks
   for(let i=0;i<22;i++){
    const sx=230+((i*37+Math.sin(t*2+i)*18)%180);
    const sy2=230-((t*48+i*19)%170);
    rect(g,i%2?'#fff2b2':'#ffbf59',sx,sy2,2,3);
   }
  }else if(b.stage==='throne'){
   tile(g,'arenas',3,0,0,640,336);
   rect(g,'#160c1f55',0,0,640,336);
   const enter=Math.min(1,t*0.7);
   const hx=Math.round(92+enter*92);
   const kx=Math.round(480-Math.min(1,Math.max(0,(t-0.4)*0.8))*35);
   // Royal aura behind the King
   if((b.step||0)>=1){
    for(let i=0;i<12;i++){
     const ang=i*Math.PI/6+t*1.6;
     rect(g,b.step>=2?'#efabcf':'#a0e5cb',kx+Math.cos(ang)*28,196+Math.sin(ang)*9,3,2);
    }
   }
   oval(g,'#1a142666',hx,206,15,5);
   nativeActor(g,'hero',16+(enter<1?Math.floor(t*9)%4:12),hx,204,1);
   // Golden glint on the Hero's Espada del Alba
   rect(g,'#fff0b0',hx+16,176+Math.round(Math.sin(t*6)*2),3,14);
   oval(g,'#1a142666',kx,206,20,6);
   nativeActor(g,'foes',48+3*4+((b.step||0)>=2?2:Math.floor(t*3)%2),kx,204,-1);
   // Floating throne embers
   for(let i=0;i<18;i++){
    const ex=(i*49+t*18)%640,ey=240-((t*28+i*23)%190);
    rect(g,i%2?'#ff9d54aa':'#ffe599aa',ex,ey,2,2);
   }
  }else if(b.stage==='epilogue'){
   tile(g,'arenas',3,0,0,640,336);
   // Sunrise wash clearing the darkness
   const glow=Math.min(1,t*0.25);
   g.fillStyle=`rgba(255,214,132,${(0.18+glow*0.22).toFixed(2)})`;
   g.fillRect(0,0,640,336);
   oval(g,'#fff0bc66',320,120,70+Math.round(Math.sin(t*2)*6),40);
   nativeActor(g,'hero',16+12,240,206,1);
   // Liberated golden echoes rising into the sky
   for(let i=0;i<26;i++){
    const ex=120+((i*41+Math.sin(t*1.5+i)*20)%400);
    const ey=240-((t*36+i*17)%200);
    rect(g,i%2?'#fff6cc':'#98f0cf',ex,ey,3,2);
   }
  }
  // Smooth pixel-art letterbox bars
  const bar=Math.round(Math.min(1,t*3.5)*34);
  rect(g,'#0b1019',0,0,640,bar);
  rect(g,'#0b1019',0,336-bar,640,bar);
  if(bar>=26&&b.title){
   label(g,b.title.toUpperCase(),320,21,'#ffcf68',9);
  }
 }
}
