import {Adventure,weapons,items,exits} from './engine.js';
import {drawWorld,drawMinimap,drawArena} from './village-art.js';
import {chamberNames,roomNames,guardianPlaces} from './world.js';
import {scoutNames,royalPhases} from './arsenal.js';
import {paintThreats,attackCaption} from './weapon-art.js';
import {drawHero,drawOpponent} from './actors.js';
import {conversation,speakerPosition,placeBubble} from './speech.js';
import {loadAtlas,tile,stamp} from './atlas.js';
import {ChipAudio} from './audio.js';
import {habit} from './learning.js';
import {emblem,label,enemyNames,regions} from './art.js';

const $=id=>document.getElementById(id);
const scene=$('scene'),modal=$('modal');
const logical=Object.assign(document.createElement('canvas'),{width:640,height:336});
const g=logical.getContext('2d',{alpha:false}),display=scene.getContext('2d',{alpha:false});
function resizeDisplay(){
 const box=scene.getBoundingClientRect(),ratio=window.devicePixelRatio||1;
 const width=Math.max(1,Math.round(box.width*ratio)),height=Math.max(1,Math.round(box.height*ratio));
 if(scene.width!==width||scene.height!==height){scene.width=width;scene.height=height;}
 display.imageSmoothingEnabled=false;
 display.drawImage(logical,0,0,scene.width,scene.height);
}
new ResizeObserver(resizeDisplay).observe(scene);
window.addEventListener('resize',resizeDisplay);
const slot='isla-ecos-adventure-v1',soundSlot='isla-ecos-vol-v1';
const audio=new ChipAudio(),keys=new Set(),effects=[];
const graphics=[
 ['places','poblados.png',4,3],['hero','viajero.png',4,8],['residents','vecinos.png',4,8],
 ['foes','guardianes.png',4,16],['tiles','terreno.png',4,4],['props','objetos.png',4,4],
 ['arenas','arenas.webp',2,2],['rooms','interiores.webp',2,2]
];
let artReady=false,speech=null;
async function prepareGraphics(){
 $('start').disabled=true;$('startLabel').textContent='Cargando la isla…';
 try{
  await Promise.all(graphics.map(([id,path,columns,rows])=>loadAtlas(id,'assets/'+path,columns,rows)));
  [...$('zones').children].forEach((card,i)=>{
   const c=card.querySelector('canvas'),ctx=c.getContext('2d');
   tile(ctx,'arenas',i,0,0,c.width,c.height);stamp(ctx,'places',[0,1,6,7][i],29,43,38);
  });
  if(modal.open)paintMenu(menuZone);
  artReady=true;$('startLabel').textContent=saved?(saved.data.royalTrialWon?'Ver mi aventura':'Continuar aventura'):'Comenzar aventura';
 }catch{$('startLabel').textContent='Volver a cargar los gráficos';}
 $('start').disabled=false;
}
function clearSpeech(){speech=null;$('speech').hidden=true;}
function speak(words){
 speech=conversation(game,words);
 $('speaker').textContent=words.name;$('spoken').textContent=words.line;
 $('speech').hidden=false;
}
function followSpeech(){
 if(!speech)return;
 const point=speakerPosition(game,speech);if(point)placeBubble($('speech'),point);else clearSpeech();
}
let game,started=false,paused=false,modalKind='',message='',messageUntil=0,flash=0,last=0,step=0,lastSave=0;
function load(){try{const s=JSON.parse(localStorage.getItem(slot));return s?.version===1?s:null;}catch{return null;}}
function save(){try{if(game&&started)localStorage.setItem(slot,JSON.stringify(game.snapshot()));}catch{$('saveState').textContent='Guardado no disponible';}}
function tell(msg){message=msg;messageUntil=(game?.time||0)+3.2;}
function event(type,value){
 if(type==='sound')audio.play(value,game.data.weapon);
 if(type==='notice')tell(value);
 if(type==='effect'){effects.push({...value,age:0});flash=.06;}
 if(type==='save'){save();updateCards();}
 if(type==='dialog')speak(value);
 if(type==='arena'||type==='zone')updateCards();
 if(type==='zone')tell(regions[game.data.zone]);
 if(type==='won')ending(true);
 if(type==='lost')ending(false);
}
const saved=load();game=new Adventure(saved,event);
if(saved)$('startLabel').textContent=saved.data.won?'Ver mi aventura':'Continuar aventura';
try{const vol=localStorage.getItem(soundSlot);if(['0','1','2'].includes(vol))audio.volume(Number(vol));}catch{}
function renderVolume(){emblem($('soundIcon'),'sound',audio.level);$('soundBtn').title=['Sonido silenciado','Volumen bajo','Volumen alto'][audio.level];$('soundBtn').setAttribute('aria-label',$('soundBtn').title+' · cambiar');}
renderVolume();emblem($('crest'),'crest');
const descriptions=[
 'El sendero de trigo se bifurca bajo los álamos. Bramble custodia el primer sello. La posada queda al oeste. El cofre está al sur de la plaza, y el molino al este del puente.',
 'Una polilla luminosa patrulla los helechos. Su sello abre el trono junto con los de la pradera y las ruinas.',
 'Entre columnas cubiertas de musgo duerme Talos. Su martillo golpea fuerte y deja una ventana para esquivar.',
 'Recoge la Espada del Alba en el cofre junto al portón y cruza al salón del trono. El Rey Mimético tiene tres fases y aprende hacia dónde te mueves.'
];
const sealRegions=['Pradera','Bosque','Ruinas'];
function updateCards(){
 [...$('zones').children].forEach((card,i)=>{
   const current=i===game.data.zone;
   const completed=i===3?game.data.royalTrialWon:game.data.cleared.includes(i);
   card.classList.toggle('active',current);
   card.setAttribute('aria-current',current?'location':'false');
   card.querySelector('small').textContent=completed?(i===3?'Rey vencido':'Sello recuperado'):current?'Estás aquí':'';
 });
}
for(let i=0;i<4;i++){
 const card=document.createElement('button');
 card.className='zoneCard';
 card.innerHTML='<canvas width="58" height="44" aria-hidden="true"></canvas><span><small></small><b></b></span>';
 card.querySelector('b').textContent=regions[i];
 card.onclick=()=>regionMenu(i);
 $('zones').append(card);
}
updateCards();
let menuZone=game.data.zone;
function paintMenu(zone){
 const canvas=$('menuArt'),ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,canvas.width,canvas.height);
 // Use the middle of the illustrated backdrop to keep the horizon in view.
 tile(ctx,'arenas',zone,0,-13,288,151);
 const landmark=[0,1,6,7][zone];
 stamp(ctx,'places',landmark,233,99,112);
}
function button(text,fn){
 const b=document.createElement('button');
 b.className='chrome';b.type='button';b.textContent=text;b.onclick=fn;
 return b;
}
function show(kind,tag,title,body,actions=[],zone=game.data.zone){
 keys.clear();
 paused=true;
 modalKind=kind;
 menuZone=zone;
 modal.dataset.kind=kind;
 $('dialogTag').textContent=tag;
 $('dialogTitle').textContent=title;
 $('dialogBody').innerHTML=body;
 $('dialogActions').replaceChildren(...actions);
 $('close').hidden=['lost','won'].includes(kind);
 paintMenu(zone);
 if(!modal.open)modal.showModal();
 $('dialogTitle').focus({preventScroll:true});
 modal.scrollTop=0;
}
function close(){if(modal.open)modal.close();keys.clear();paused=false;modalKind='';if(started)scene.focus({preventScroll:true});}

function regionMenu(zone){
 const links=exits[zone];
 show('region','Atlas de la isla',regions[zone],
   '<p class="menuLead">'+descriptions[zone]+'</p>'+
   '<h3>Lugares</h3><ul class="menuPlaces">'+
   [chamberNames[zone],roomNames[zone],guardianPlaces[zone]].map(name=>'<li>'+name+'</li>').join('')+'</ul>'+
   '<nav class="menuRoutes" aria-label="Regiones vecinas"></nav>',[],zone);
 const routes=$('dialogBody').querySelector('nav');
 ['Oeste','Este'].forEach((direction,i)=>{
   const next=links[i];
   const link=button(direction+' · '+regions[next],()=>regionMenu(next));
   routes.append(link);
 });
}

const controls=[
 ['WASD / ↑↓←→','Moverse'],['J','Atacar e interactuar'],['Espacio','Rodar'],
 ['1–9 / 0','Elegir casilla'],['Q / R','Cambiar arma u objeto'],['E','Usar objeto'],['Esc','Pausar']
];
function codex(){
 const m=game.memory,p=m.predict(50,100*game.data.hp/game.maxHp);
 show('codex','Códice del viajero','La memoria de la isla',
   '<p class="menuLead">El Rey aprende de los encuentros de toda la isla. Cambia la dirección de tus esquivas para confundirlo.</p>'+
   '<dl class="menuStats"><div><dt>Acciones vistas</dt><dd>'+m.samples+'</dd></div>'+
   '<div><dt>Predicciones acertadas</dt><dd>'+m.hits+' / '+m.scored+'</dd></div>'+
   '<div class="memoryRead"><dt>Lectura a corta distancia</dt><dd>'+habit(p.action)+'</dd></div></dl>'+
   '<p>Reúne los sellos de la pradera, el bosque y las ruinas para abrir el castillo.</p>'+
   '<details class="menuControls"><summary>Controles</summary><ul>'+
   controls.map(([key,action])=>'<li><span>'+action+'</span><kbd>'+key+'</kbd></li>').join('')+'</ul></details>',
   [button(started?'Volver al juego':'Volver a la portada',close)]);
}
function pause(){
 if(!started||modal.open)return;
 const count=sealRegions.filter((_,i)=>game.data.cleared.includes(i)).length;
 const seals=sealRegions.map((name,i)=>{
   const found=game.data.cleared.includes(i);
   return '<li class="'+(found?'collected':'')+'"><span aria-hidden="true">'+(found?'◆':'◇')+'</span>'+
     '<span>'+name+'<small>'+(found?'Recuperado':'Pendiente')+'</small></span></li>';
 }).join('');
 show('pause','Campamento','Juego en pausa',
   '<p class="menuLead">'+regions[game.data.zone]+'</p>'+
   '<h3>Sellos recuperados <span>'+count+' / 3</span></h3><ul class="menuSeals">'+seals+'</ul>',
   [button('Continuar',close),button('Abrir códice',codex)]);
}
function ending(won){
 const m=game.memory;
 show(won?'won':'lost',won?'Fin de la aventura':'Caíste en combate',won?'La isla vuelve a cantar':'El eco permanece',
   won?'<p class="menuLead">La Espada del Alba rompió la corona del Rey Mimético.</p>'+
     '<dl class="menuStats"><div><dt>Acciones recordadas</dt><dd>'+m.samples+'</dd></div></dl>'
      :'<p class="menuLead">Vuelves a la región con la vida completa. Tus armas, sellos y los recuerdos aprendidos siguen contigo.</p>',
   [...(won?[button('Seguir explorando',()=>{close();game.mode='map';game.grace=1;tell('La isla está en paz · quedan lugares por descubrir');updateCards();save();})]:[]),
   button(won?'Nueva aventura':'Volver al sendero',()=>{close();if(won){game=new Adventure(null,event);tell('Busca el primer sello');}else game.retry();effects.length=0;updateCards();save();})]);
}
$('close').onclick=close;modal.addEventListener('cancel',e=>{e.preventDefault();if(!['won','lost'].includes(modalKind))close();});
$('start').onclick=()=>{
 if(!artReady){void prepareGraphics();return;}
 audio.start();started=true;$('cover').hidden=true;$('hud').hidden=false;scene.focus();
 $('touch').hidden=!matchMedia('(pointer: coarse), (max-width: 760px)').matches;
 if(game.data.royalTrialWon){game.mode='won';ending(true);}else if(game.data.hp<=0){game.retry();}else tell(game.data.zone===3?'El cofre del Alba y el trono están junto al portón':'J para hablar o entrar · Cruza el puente hacia el guardián');
 save();
};
$('codexBtn').onclick=codex;$('pauseBtn').onclick=pause;
$('soundBtn').onclick=()=>{audio.volume((audio.level+1)%3);audio.start();audio.play('click');renderVolume();try{localStorage.setItem(soundSlot,audio.level);}catch{}};
const gameView=$('gameView');
const nativeView=()=>document.fullscreenElement||document.webkitFullscreenElement;
let immersive=false;
function setView(active){
 immersive=active;
 gameView.classList.toggle('immersive',active);
 document.documentElement.classList.toggle('playing-full',active);
 $('fullBtn').setAttribute('aria-pressed',String(active));
 if(active)$('leaveFull').focus({preventScroll:true});
 else $('fullBtn').focus({preventScroll:true});
}
async function enterFull(){
 setView(true);
 try{
   const request=gameView.requestFullscreen||gameView.webkitRequestFullscreen;
   if(request)await request.call(gameView);
 }catch{/* The viewport layout also works in embedded browsers. */}
}
async function leaveFull(){
 if(nativeView()===gameView){
   const exit=document.exitFullscreen||document.webkitExitFullscreen;
   if(exit)await exit.call(document);
 }
 if(immersive)setView(false);
}
for(const event of ['fullscreenchange','webkitfullscreenchange']){
 document.addEventListener(event,()=>setView(nativeView()===gameView));
}
$('fullBtn').onclick=enterFull;
$('leaveFull').onclick=leaveFull;
const actions={KeyJ:'attack',Space:'roll',KeyQ:'weapon',KeyR:'select',KeyE:'item'};
const movement=['KeyW','KeyA','KeyS','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
function engage(k){
 if(!started||paused)return;keys.add(k);
 if(k==='KeyJ'&&speech){clearSpeech();return;}
 if(actions[k])game.act(actions[k]);
}
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'&&immersive&&!modal.open){e.preventDefault();leaveFull();return;}
 if(!started||modal.open||e.ctrlKey||e.altKey||e.metaKey)return;
 if(e.code==='Escape'){e.preventDefault();pause();return;}
 if(/^Digit[0-9]$/.test(e.code)){
   e.preventDefault();if(!e.repeat)selectSlot((Number(e.code.slice(-1))+9)%10);
   return;
 }
 if(actions[e.code]||movement.includes(e.code)){e.preventDefault();if(!e.repeat)engage(e.code);}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(started&&!modal.open)pause();});
window.addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();keys.clear();if(started&&!modal.open)pause();}});
function selectSlot(position){
 if(!started||paused||!['arena','map'].includes(game.mode))return;
 const d=game.data;
 if(position<weapons.length){
   if(!d.unlocked.includes(position))return;
   d.weapon=position;
 }else d.item=position-weapons.length;
 audio.play('click');scene.focus({preventScroll:true});
}
const inventorySlots=[...weapons.map(w=>w.name),...items].map((name,position)=>{
 const gear=position<weapons.length,index=gear?position:position-weapons.length;
 const button=document.createElement('button');
 button.type='button';button.className='inventorySlot';
 const key=(position+1)%10;
 button.innerHTML='<small>'+key+'</small><canvas width="24" height="24" aria-hidden="true"></canvas><b></b>';
 emblem(button.querySelector('canvas'),gear?'weapon':'item',index);
 button.onclick=()=>selectSlot(position);
 $(gear?'gearSlots':'bagSlots').append(button);
 return {button,name,gear,index,key};
});
$('useBtn').onclick=()=>{if(!paused){game.act('item');scene.focus({preventScroll:true});}};
for(const b of $('touch').querySelectorAll('[data-key]')){
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);engage(b.dataset.key);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));
}
function held(...codes){return codes.some(k=>keys.has(k))?1:0;}

function tintRing(x,y,rx,ry,color){
 for(let i=0;i<64;i++){const a=i*Math.PI/32;g.fillStyle=color;g.fillRect(Math.round(x+Math.cos(a)*rx),Math.round(y+Math.sin(a)*ry),3,2);}
}
function draw(dt){
 const {data:d,hero:h,enemy:e}=game,z=d.zone,t=game.time,arena=game.mode==='arena'||game.mode==='lost';
 const hero=()=>{
   if(h.shield>0||h.haste>0)tintRing(h.x,h.y,21,7,h.shield>0?'#aff3ed':'#fadc87');
   if(h.smoke>0)for(let j=0;j<12;j++){g.fillStyle='#d1cbd0aa';g.fillRect(Math.round(h.x+Math.sin(t*3+j*8)*19),Math.round(h.y-6-(t*24+j*7)%37),5,4);}
   drawHero(g,game,arena,Boolean(speech));
   if(h.heal>0)label(g,'✚',h.x,h.y-56,'#b9f3ac');
 };
 const foe=(unit,scout=false)=>{
   drawOpponent(g,unit,z,t,arena,scout,h.x);
   const size=z===3?83:65;
   if(e?.stun>0)label(g,'✦ ✦',unit.x,unit.y-55,'#ffe58d');
   if(!arena)label(g,scout?'•':'◆',unit.x,unit.y-size*.78+Math.round(Math.sin(t*3)*2),scout?'#f2b69d':'#ffee99',10);
 };
 if(arena&&e){
   drawArena(g,z,t);paintThreats(g,game);
   if(h.y<=e.y){hero();foe(e,e.scout);}else{foe(e,e.scout);hero();}
 }else{drawWorld(g,game,hero,foe,speech);drawMinimap(g,game);}
 for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.age+=dt;label(g,f.text,f.x,f.y-f.age*24,'#fff0ac',10);if(f.age>.65)effects.splice(i,1);}
 if(flash>0){g.fillStyle='#ffeeb018';g.fillRect(0,0,640,336);flash-=dt;}
 if(game.mode==='transition'){g.fillStyle='#273048';const w=Math.ceil((.54-game.fade)/.54*640);for(let y=0;y<336;y+=12)g.fillRect(y%24===0?0:640-w,y,w,12);}
}
let icons='';
function hud(){
 const d=game.data,e=game.enemy;const region=(d.inside?roomNames[d.zone]:e?regions[d.zone]:game.hero.x<650?chamberNames[d.zone]:guardianPlaces[d.zone])+' · '+d.cleared.filter(i=>i<3).length+'/3';
 if($('region').textContent!==region)$('region').textContent=region;
 $('hp').style.width=(100*d.hp/game.maxHp)+'%';$('sp').style.width=game.energy+'%';$('enemyHud').hidden=!e;
 $('lifeText').textContent=d.hp+' / '+game.maxHp;
 if(e){
   $('enemyName').textContent=(e.scout?scoutNames[d.zone]:enemyNames[d.zone])+' · '+Math.max(0,e.hp)+'/'+e.max;
   $('enemyHP').style.width=100*Math.max(0,e.hp/e.max)+'%';
   const phase=royalPhases[e.phase-1];
   $('enemyHud').classList.toggle('royal',Boolean(phase));
   $('royalPhase').hidden=!phase;
   if(phase)$('royalPhase').textContent='Fase '+e.phase+' / 3 · '+phase.name;
   const samples=phase?game.memory.samples+game.royalSteps.samples:game.foeMemory.samples;
   $('prediction').textContent=[samples+' recuerdos',attackCaption(e),e.read].filter(Boolean).join(' · ');
 }
 const key=[d.weapon,d.item,...d.bag,'gear',...d.unlocked].join('/');
 if(key!==icons){
   icons=key;
   for(const {button,name,gear,index,key:shortcut} of inventorySlots){
     const locked=gear&&!d.unlocked.includes(index);
     button.disabled=locked;
     button.setAttribute('aria-pressed',String(!locked&&index===(gear?d.weapon:d.item)));
     button.classList.toggle('empty',!gear&&!d.bag[index]);
     button.querySelector('b').textContent=gear?'':d.bag[index];
     button.title=(locked?'Arma por descubrir':name+(gear?'':' ×'+d.bag[index]))+' ['+shortcut+']';
     button.setAttribute('aria-label',button.title);
     if(gear&&!locked){
       const {damage,reach,delay,cost}=weapons[index];
       button.title+=' · Daño '+damage+' · Alcance '+reach+' · '+String(delay).replace('.',',')+' s entre ataques · '+cost+' de energía';
     }
   }
   $('useBtn').disabled=!d.bag[d.item];
   $('useBtn').title='Usar '+items[d.item]+' [E]';
 }
 const msg=game.time<messageUntil?message:'';if($('toast').textContent!==msg)$('toast').textContent=msg;
}
function frame(now){
 const dt=Math.min(.045,(now-last)/1000||.016);last=now;
 if(started&&!paused){
   const dx=held('ArrowRight','KeyD')-held('ArrowLeft','KeyA'),dy=held('ArrowDown','KeyS')-held('ArrowUp','KeyW');
   game.tick(dt,dx,dy);if(keys.has('KeyJ')&&game.mode==='arena')game.act('attack');
   if(game.walk&&game.time-step>.37){audio.play('step');step=game.time;}
   audio.track(game.mode!=='arena'?'map':game.data.zone===3?'king':'arena');audio.tick();followSpeech();draw(dt);
   display.drawImage(logical,0,0,scene.width,scene.height);hud();
   if(game.time-lastSave>3){save();lastSave=game.time;}if(lastSave>game.time)lastSave=0;
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

void prepareGraphics();
