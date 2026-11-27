import {oval,poly,rect,label,rng} from './art.js';
import {material,stamp} from './atlas.js';

const colors={agua:'#94d6df',raiz:'#9bd591',corona:'#f4cb7f'};
const symbols={agua:'≈',raiz:'◆',corona:'✦'};

export function questObject(g,o,t){
 const {x,y}=o;
 if(o.kind==='firefly'){
  const bob=Math.round(Math.sin(t*6)*5),shimmer=Math.floor(t*14)%2;
  oval(g,'#e9e38336',x,y-15+bob,16,10);
  oval(g,'#fbec8a55',x,y-15+bob,9,6);
  rect(g,'#fff2a7',x-2,y-17+bob,5,4);
  rect(g,'#a9e3c7',x-4,y-19+bob,2,2+shimmer);
  rect(g,'#a9e3c7',x+3,y-19+bob,2,2+shimmer);
  return;
 }
 if(o.kind==='valve'){
  oval(g,'#28313966',x,y,14,4);
  rect(g,'#443b37',x-10,y-10,20,11);
  rect(g,'#82715e',x-8,y-10,16,7);
  rect(g,'#4f4235',x-2,y-22,5,15);
  oval(g,'#4a3536',x,y-23,10,4);
  oval(g,o.active?'#99cf9c':'#d68d59',x,y-24,8,2);
  rect(g,'#3f4140',x-3,y-25,6,2);
  label(g,o.id.toUpperCase(),x,y+12,'#fff0ba',7);
  return;
 }
 if(o.kind==='tablet'||o.kind==='socket'){
  const floor=o.kind==='socket';
  oval(g,'#342d3c55',x,y,15,5);
  if(floor){
   rect(g,'#4f454e',x-14,y-10,28,13);
   rect(g,o.active?'#667f70':'#716577',x-12,y-9,24,8);
   rect(g,'#beb28e',x-11,y-9,22,1);
  }else{
   poly(g,'#4b414f',[[x-10,y],[x-11,y-20],[x-7,y-25],[x+6,y-25],[x+10,y-18],[x+10,y]]);
   rect(g,'#7b7376',x-7,y-20,14,15);
   rect(g,'#c8b398',x-5,y-21,10,2);
  }
  label(g,symbols[o.id]??'✧',x,y-(floor?1:9),colors[o.id]??'#ffe59e',floor?9:12);
  return;
 }
 if(o.kind==='portal'||o.kind==='exit'){
  if(o.kind==='exit'){
   rect(g,'#382c42',x-28,y-3,56,7);rect(g,'#ac9878',x-23,y-3,46,2);
   label(g,'↓',x,y-6,'#ffe9ad',14);
   return;
  }
  const forest=o.id==='cave';
  oval(g,'#29323c77',x,y,29,7);
  poly(g,forest?'#354d47':'#4c4354',[[x-30,y],[x-29,y-19],[x-22,y-35],[x-9,y-45],[x+11,y-44],[x+25,y-32],[x+31,y-17],[x+30,y]]);
  poly(g,forest?'#708e65':'#989080',[[x-26,y-2],[x-25,y-21],[x-18,y-33],[x-8,y-41],[x+10,y-40],[x+21,y-29],[x+26,y-18],[x+25,y-2]]);
  poly(g,'#211e30',[[x-16,y],[x-16,y-20],[x-10,y-30],[x+9,y-30],[x+16,y-20],[x+16,y]]);
  for(const [dx,dy] of [[-24,-18],[14,-31],[22,-14],[-18,-31]])rect(g,forest?'#c3d181':'#d0b390',x+dx,y+dy,5,3);
  label(g,forest?'GRUTA':'CÁMARA',x,y+11,'#ffebaf',8);
  return;
 }
 if(o.kind==='statue'){
  oval(g,'#2c303861',x,y,16,5);
  if(o.id==='guardian'){stamp(g,'props',5,x,y,39);label(g,'✦',x,y-34,'#fcef9c',12);return;}
  rect(g,'#443e4b',x-15,y-5,30,7);
  rect(g,'#8b8292',x-12,y-8,24,6);
  poly(g,'#4f4858',[[x-8,y-8],[x-8,y-21],[x-14,y-24],[x-10,y-35],[x-5,y-37],[x-6,y-45],[x+4,y-45],[x+8,y-38],[x+8,y-33],[x+14,y-26],[x+8,y-20],[x+7,y-8]]);
  rect(g,'#a49a9c',x-5,y-43,8,6);
  rect(g,'#b2c1b1',x+2,y-40,4,2);
  rect(g,'#7b7485',x-8,y-28,13,8);
  poly(g,'#b7a18c',[[x+8,y-20],[x+19,y-36],[x+22,y-38],[x+20,y-31],[x+11,y-19]]);
  return;
 }
 if(o.kind==='cache'){
  if(o.id==='forest-cache')stamp(g,'props',12,x,y,30);
  else {stamp(g,'props',11,x,y,31);label(g,'✧',x,y-27+Math.round(Math.sin(t*3)*2),'#d7fff2',13);}
 }
}

export function questRoom(g,room,t,arena=false){
 const forest=room==='forest',left=arena?0:106,right=arena?640:534;
 const w=right-left,ground=arena?0:28;
 rect(g,'#151d27',0,0,640,336);
 rect(g,material(g,10),left,ground,w,288);
 rect(g,forest?'#23344192':'#30304488',left,ground,w,288);
 poly(g,material(g,forest?6:7),[[left,ground+103],[left+55,ground+84],[right-50,ground+85],[right,ground+105],[right,316],[left,316]]);
 rect(g,forest?'#20363c4d':'#3b30404d',left,ground+108,w,208-ground);
 for(const side of [left,right-15]){
  rect(g,'#252b37',side,ground+10,15,287-ground);
  rect(g,forest?'#405e55':'#675a62',side+4,ground+24,7,270-ground);
 }
 const noise=rng(forest?712:903);
 for(let i=0;i<38;i++){
  const x=left+19+Math.floor(noise()*(w-38)),y=ground+13+Math.floor(noise()*79),s=4+Math.floor(noise()*13);
  poly(g,'#26343d',[[x,y],[x+s,y-4],[x+s+5,y],[x+s-2,y+5],[x-4,y+4]]);
  rect(g,forest?'#557166':'#887879',x,y-2,s,2);
 }
 if(forest){
  for(const [offset,y,size] of [[33,135,38],[69,116,32],[w-29,151,40],[w-72,113,35],[35,221,27],[w-35,246,29]]){
   const x=left+offset;
   oval(g,'#a5d58b2e',x,y-8,20,8);
   stamp(g,'props',5,x,y,size);
  }
  for(let i=0;i<20;i++){
   const x=left+23+((i*47+Math.round(t*8))%(w-46)),y=99+(i*17+Math.round(t*14))%158;
   rect(g,i%3?'#bddc8d':'#fff0a5',x,y,2,1+((i+Math.floor(t*5))%2));
  }
 }else{
  stamp(g,'places',6,320,166,125);
  for(const x of [left+62,right-62]){
   stamp(g,'props',7,x,156,54);
   oval(g,'#d4e0a429',x,153,27,9);
   rect(g,'#b2dccb',x-2,118+Math.round(Math.sin(t*5+x)*2),4,5);
  }
  for(let i=0;i<10;i++)rect(g,'#9fe6dc',left+29+i*41,227+(i*19+Math.round(t*8))%49,2,1);
 }
 if(!arena)label(g,forest?'GRUTA DE LAS LUCIÉRNAGAS':'CÁMARA DE LAS TABLILLAS',320,43,'#fff0bb',9);
}

export function millWheel(g,x,y,t,running){
 oval(g,'#453b36',x,y,12,12);
 oval(g,'#936e48',x,y-1,9,9);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3+(running?t*2.8:0);
  for(let r=3;r<10;r++)rect(g,'#ddb67a',x+Math.cos(a)*r,y+Math.sin(a)*r,2,2);
 }
 rect(g,'#76513b',x-2,y-2,4,4);
}
