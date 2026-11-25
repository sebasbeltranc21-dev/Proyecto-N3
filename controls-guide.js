import {emblem,label,oval,rect} from './art.js';
import {stamp,tile} from './atlas.js';
import {drawHero,drawResident} from './actors.js';

export const lessons=[
 {id:'move',keys:'WASD / Flechas',name:'Moverte',text:'W o ↑ sube. A o ← va a la izquierda. S o ↓ baja. D o → va a la derecha.'},
 {id:'attack',keys:'J',name:'Atacar o interactuar',text:'Ataca en combate. En el mapa, pulsa J cerca de una persona, puerta o cofre.'},
 {id:'roll',keys:'Espacio',name:'Rodar',text:'Rueda en la última dirección en la que te moviste. La esquiva consume energía.'},
 {id:'weapon',keys:'Q',name:'Cambiar arma',text:'Pasa a la siguiente arma desbloqueada.'},
 {id:'item',keys:'R',name:'Cambiar objeto',text:'Selecciona el siguiente consumible de la bolsa.'},
 {id:'use',keys:'E',name:'Usar objeto',text:'Usa el consumible seleccionado. La fruta recupera vida tras una breve espera.'},
 {id:'slot',keys:'1–9 / 0',name:'Elegir casilla',text:'1 a 5 eligen un arma. 6 a 9 y 0 eligen un consumible.'},
 {id:'pause',keys:'Esc',name:'Pausar',text:'Abre el menú de pausa. En una cinemática, Esc salta la escena.'},
 {id:'scene',keys:'Enter / J / Espacio',name:'Avanzar diálogo',text:'Pulsa para mostrar la línea completa. Vuelve a pulsar para avanzar.'}
];

const directions=[
 {key:'D',x:80,y:93,dx:73,dy:0,face:1},
 {key:'W',x:153,y:93,dx:0,dy:-23,face:1},
 {key:'A',x:153,y:70,dx:-73,dy:0,face:-1},
 {key:'S',x:80,y:70,dx:0,dy:23,face:-1}
];
const icons=new Map();

function icon(g,type,index,x,y){
 const id=type+index;
 if(!icons.has(id)){
  const c=Object.assign(document.createElement('canvas'),{width:24,height:24});
  emblem(c,type,index);
  icons.set(id,c);
 }
 g.drawImage(icons.get(id),x,y,18,18);
}

function cap(g,key,lit=true){
 const width=key.length*7+12;
 rect(g,'#13232a',8,8,width+2,20);
 rect(g,lit?'#f4cb78':'#668076',9,9,width,17);
 rect(g,lit?'#9b5f36':'#344d47',10,22,width-2,3);
 label(g,key,9+width/2,20,lit?'#362737':'#e6f3e1',8);
}

function box(g,title,x,y,width){
 rect(g,'#111e24f5',x,y,width,29);
 rect(g,'#d3aa6b',x,y,width,2);
 rect(g,'#5d7868',x,y+27,width,2);
 label(g,title,x+width/2,y+18,'#ffedbd',8);
}

function belt(g,type,selected){
 for(let i=0;i<5;i++){
  const x=132+i*23;
  rect(g,'#121c25',x,70,23,24);
  rect(g,i===selected?'#f0bf67':'#6a776f',x+1,71,21,22);
  rect(g,'#233638',x+2,72,19,20);
  icon(g,type,i,x+3,73);
 }
}

export function drawControlDemo(g,id,t,key=''){
 const loop=t%2.6,phase=Math.min(1,Math.max(0,(loop-.35)/.9));
 const changed=loop>.8;
 let x=91,y=91,face=1,walking=false,weapon=0,pose={};
 let badge=lessons.find(lesson=>lesson.id===id).keys.split(' / ')[0];
 tile(g,'arenas',0,0,0,256,112);
 rect(g,'#11312c22',0,0,256,112);

 if(id==='move'){
  const dir=key?directions.find(direction=>direction.key===key):directions[Math.floor(t/1.15)%4];
  const position=key?phase:Math.min(1,t%1.15/.92);
  x=dir.x+dir.dx*position;y=dir.y+dir.dy*position;face=dir.face;
  walking=position<1;badge=dir.key;
 }else if(id==='attack'){
  if(key||t%5.2<2.6){
   stamp(g,'props',4,149,91,37);
   if(loop>.46&&loop<.69)pose={attack:.69-loop,attackWeapon:0};
   if(loop>.51&&loop<.75){
    const spark=140+(loop-.51)*40;
    rect(g,'#fff0a2',spark,72,9,2);rect(g,'#fff0a2',spark+4,68,2,10);
   }
  }else{
   drawResident(g,{x:157,y:91,style:0},t,changed?{x}:null);
   if(changed)box(g,'¡Buen viaje!',132,28,110);
  }
 }else if(id==='roll'){
  badge='ESPACIO';x=67+Math.min(1,Math.max(0,(loop-.42)/.24))*96;
  if(loop>.42&&loop<.65)pose={roll:.65-loop};
  if(loop>.45&&loop<.82)for(let i=0;i<5;i++)rect(g,'#f6dca7b0',x-15-i*8,90-i%3*3,3,2);
 }else if(id==='weapon'||id==='item'||id==='slot'){
  const picked=id==='slot'&&key?Number(key)||10:null;
  const bag=id==='item'||picked>=6;
  const selected=changed?(picked?(picked-1)%5:1):0;
  if(!bag)weapon=selected;
  belt(g,bag?'item':'weapon',selected);
  if(id==='slot')badge=key||'2';
 }else if(id==='use'){
  if(loop>.52&&loop<1.18)pose={heal:1.18-loop};
  const healed=loop>=1.18;
  rect(g,'#152326',145,57,86,13);
  rect(g,healed?'#7bcf89':'#d87365',148,60,healed?80:37,7);
  if(healed)label(g,'+43 VIDA',187,51,'#c8f6a4',8);
  if(!healed)icon(g,'item',0,179,75);
 }else if(id==='pause'){
  walking=!changed;
  x=76+36*Math.min(1,loop/.8);
 }else if(id==='scene'){
  badge='ENTER';
  drawResident(g,{x:169,y:91,style:3},t,{x});
 }
 if(id==='roll')oval(g,'#64465a30',x,y,17,4);
 drawHero(g,{hero:{x,y,...pose},data:{inside:false},face,walk:walking,time:t,weapon},true);
 if(id==='pause'&&changed){
  rect(g,'#0b151c85',0,0,256,112);
  box(g,'JUEGO EN PAUSA',61,39,134);
 }
 if(id==='scene')box(g,changed?'El sello está al este.':'Escucha, viajero…',68,10,174);
 cap(g,badge,loop>.32&&loop<1.21);
}
