import {WORLD,worlds,riverX,footbridges,discoveries,townsperson,interaction,throneGate} from './world.js';
import {rect,oval,rng,label,sign} from './art.js';
import {material,stamp,tile} from './atlas.js';
import {cameraPosition} from './speech.js';
import {drawResident} from './actors.js';

const terrainCache=new Map();
// Strictly separate building sprites: tile 7 (the grand castle) is reserved ONLY for 'gate'.
const roofTiles={inn:0,herbal:1,archive:2,armory:3,mill:4,hut:5,arch:6,gate:7,stall:8,tent:11,shrine:6};
const propTiles={barrels:[0,32],cart:[1,45],fence:[2,70],garden:[3,62],hay:[4,42],mushrooms:[5,33],lantern:[6,42],pillar:[7,47],fountain:[8,57],rack:[9,43],banners:[10,58],obelisk:[11,60]};
function roads(z){
 const [north,south]=discoveries[z],fy=footbridges[z],fx=riverX(fy);
 return [
  [39,[[0,314],[125,316],[259,309],[352,325],[486,316],[574,310],[718,315],[842,334],[980,306],[1104,315],[1214,309],[WORLD.width,314]]],
  [23,[[155,245],[180,289],[244,315],[382,220]]],
  [24,[[370,322],[432,423],[549,428],[655,316]]],
  [23,[[772,319],[829,410],[968,453],[1113,440],[1193,310]]],
  [22,[[881,324],[943,229],[1053,211],[1113,306]]],
  [13,[[256,303],[259,213],[north.x,north.y]]],
  [13,[[865,409],[south.x,south.y]]],
  [15,[[395,fy<314?224:423],[516,fy],[fx,fy],[801,fy],[903,fy<314?223:426]]]
 ];
}
function roadMask(z){
 const c=Object.assign(document.createElement('canvas'),{width:WORLD.width,height:WORLD.height});
 const ctx=c.getContext('2d');
 for(const [width,points] of roads(z)){
  for(let j=1;j<points.length;j++){
   const [x,y]=points[j-1],[u,v]=points[j],steps=Math.ceil(Math.hypot(u-x,v-y)/4);
   for(let k=0;k<=steps;k++){
    const a=k/steps;
    oval(ctx,'#fff',Math.round(x+(u-x)*a),Math.round(y+(v-y)*a),width,Math.ceil(width*.58));
   }
  }
 }
 const bitmap=ctx.getImageData(0,0,c.width,c.height),a=bitmap.data,step=c.width*4;
 const original=new Uint8ClampedArray(a),random=rng(578+z);
 for(let y=4;y<c.height-4;y++)for(let x=4;x<c.width-4;x++){
  const k=(y*c.width+x)*4+3;
  if(!original[k])continue;
  const depth=Math.round(2+Math.sin(x*.09+y*.12)+Math.sin(y*.31-x*.15));
  if(original[k-step*depth]&&original[k+step*depth]&&original[k-4*depth]&&original[k+4*depth])continue;
  if(random()<.55)a[k]=0;
 }
 ctx.putImageData(bitmap,0,0);return c;
}
function bridge(g,x,y,half){
 rect(g,'#3c494a',x-49,y-half+2,99,half*2+3);
 const timber=material(g,12);
 for(let i=0;i<17;i++){
  const xx=x-49+i*6;rect(g,timber,xx,y-half,5,half*2);
  rect(g,'#593d32',xx+5,y-half,1,half*2);rect(g,'#ecc58b',xx,y-half,1,half*2);
 }
 for(const side of [-1,1]){
  const yy=y+side*half;
  rect(g,'#604237',x-50,yy-7,102,4);rect(g,'#e4ad6e',x-50,yy-8,102,2);
  for(const k of [-48,-18,18,48]){
   rect(g,'#65432f',x+k,yy-13,5,16);rect(g,'#c28a51',x+k+1,yy-10,2,12);
   rect(g,'#f4c991',x+k-1,yy-14,6,3);
  }
 }
}
function terrain(z){
 if(terrainCache.has(z))return terrainCache.get(z);
 const c=Object.assign(document.createElement('canvas'),{width:WORLD.width,height:WORLD.height}),g=c.getContext('2d');
 g.imageSmoothingEnabled=false;
 const {width:W,height:H}=c,r=rng(1208+z*550);
 rect(g,material(g,z),0,0,W,H);
 const cliff=material(g,10);
 for(let x=0;x<W;x+=3){
  const y=57+Math.round(Math.sin(x/106+z)*12+Math.sin(x/39)*4);
  rect(g,cliff,x,y-10,3,23);rect(g,'#4f564e',x,y+12,3,2);
 }
 const paths=roadMask(z),p=paths.getContext('2d');
 p.globalCompositeOperation='source-in';
 rect(p,['#ac9266','#886f53','#aa9476','#6c6570'][z],0,0,W,H);g.drawImage(paths,0,2);
 rect(p,material(p,4+z),0,0,W,H);g.drawImage(paths,0,0);
 const square=material(g,z===3?7:11);
 for(let j=-22;j<=22;j++){const span=Math.round(69*Math.sqrt(1-j*j/484));rect(g,square,258-span,304+j,2*span,1);}
 const bank=material(g,9),water=material(g,8);
 for(let y=0;y<H;y++){
  const x=riverX(y),edge=Math.round(Math.sin(y/13)*1.5);
  rect(g,bank,x-36+edge,y,72,1);rect(g,'#527c73',x-29,y,59,1);rect(g,water,x-27,y,55,1);
 }
 for(let i=0;i<50;i++){
  const x=i*29+Math.round(r()*20);
  if(Math.abs(x-riverX(46))<47)continue;
  const type=z<2?'places':'props',index=z<2?10:z===2?7:10;
  stamp(g,type,index,x,41+Math.round(r()*13),z<2?44+Math.floor(r()*21):33+Math.floor(r()*12));
 }
 for(const [x,y] of [[48,177],[469,148],[570,230],[740,229],[810,200],[1236,220],[58,497],[542,506],[771,491],[1219,501]]){
  stamp(g,z<2?'places':'props',z<2?10:z===2?7:11,x,y,z<2?z===1?90:76:47);
 }
 for(let j=0;j<37;j++){
  const x=Math.round(28+r()*(W-56)),y=j%2?Math.round(62+r()*58):Math.round(515+r()*61);
  if(Math.abs(x-riverX(y))<50)continue;
  stamp(g,'props',[3,5,7,10][z],x,y,[23,27,27,35][z]+Math.floor(r()*6));
 }
 bridge(g,655,WORLD.road,23);bridge(g,riverX(footbridges[z]),footbridges[z],13);
 terrainCache.set(z,c);return c;
}
function drawWatchtower(g,o,t){
 const x=Math.round(o.x),y=Math.round(o.y);
 oval(g,'#24283455',x+2,y,24,6);
 rect(g,'#262433',x-19,y-58,38,59);
 rect(g,'#6a677d',x-17,y-56,34,55);
 rect(g,'#89859e',x-15,y-56,11,55);
 rect(g,'#4f4c61',x+7,y-56,10,55);
 for(let row=0;row<6;row++){
  rect(g,'#3b384c',x-17,y-8-row*9,34,1);
  rect(g,'#3b384c',x-6+(row%2)*8,y-17-row*9,1,9);
 }
 rect(g,'#262433',x-23,y-69,46,13);
 rect(g,'#7b7790',x-21,y-67,42,9);
 for(const mx of [-21,-9,3,15]){
  rect(g,'#262433',x+mx-1,y-75,9,8);
  rect(g,'#9a95ae',x+mx,y-74,7,6);
 }
 rect(g,'#262433',x-4,y-44,8,14);
 rect(g,'#ffcf78',x-2,y-42,4,10);
 const sway=Math.round(Math.sin(t*3+x)*1.5);
 rect(g,'#592536',x-6+sway,y-25,12,15);
 rect(g,'#b63d4f',x-5+sway,y-24,10,12);
 rect(g,'#f2c975',x-2+sway,y-20,4,5);
 const flick=Math.sin(t*9+x)>0?1:0;
 rect(g,'#ff9642',x-3,y-79-flick,6,5);
 rect(g,'#fff1a8',x-1,y-78-flick,2,3);
}
function drawCottage(g,o){
 const x=Math.round(o.x),y=Math.round(o.y);
 oval(g,'#2f393245',x+2,y,30,6);
 rect(g,'#2a242b',x-28,y-36,56,37);
 rect(g,'#e2d2b0',x-26,y-34,52,33);
 rect(g,'#c6b28f',x+8,y-34,18,33);
 rect(g,'#6e4a35',x-26,y-34,4,33);rect(g,'#6e4a35',x+22,y-34,4,33);rect(g,'#6e4a35',x-26,y-20,52,3);
 rect(g,'#262c33',x-32,y-53,64,20);
 rect(g,'#4b7a6e',x-30,y-51,60,16);
 rect(g,'#689f8d',x-28,y-49,56,5);
 rect(g,'#365c54',x-30,y-39,60,4);
 rect(g,'#3b2822',x-17,y-17,12,16);rect(g,'#8c593c',x-15,y-15,8,14);
 rect(g,'#3b2822',x+4,y-28,12,10);rect(g,'#ffd987',x+6,y-26,8,6);
}
function drawPlace(g,o,z,t){
 if(o.type==='watchtower'){drawWatchtower(g,o,t);return;}
 if(o.type==='cottage'){drawCottage(g,o);return;}
 const size=Math.round(o.width*(o.type==='mill'?1.65:o.type==='gate'?1.68:1.24));
 oval(g,'#313a3445',o.x+3,o.y,Math.floor(o.width*.45),5);
 stamp(g,'places',roofTiles[o.type],o.x,o.y+2,size);
 if(o.type==='gate'){
  for(const side of [-46,46]){
   const bx=Math.round(o.x+side),by=Math.round(o.y-6);
   const flick=Math.round(Math.sin(t*10+side)*1.4);
   rect(g,'#2b2633',bx-4,by-12,8,13);
   rect(g,'#595469',bx-3,by-11,6,11);
   oval(g,'#ffae4244',bx,by-15,9+flick,6);
   rect(g,'#ff8a3d',bx-3,by-18-flick,6,6);
   rect(g,'#fff2a6',bx-1,by-17-flick,2,4);
  }
 }
 if(o.door){
  const x=o.x+o.width/2+8;rect(g,'#755540',x-2,o.y-14,4,16);
  rect(g,'#563a32',x-18,o.y-20,37,10);rect(g,'#d6a16d',x-18,o.y-21,37,2);
  label(g,['POSADA','BOTICA','ARCHIVO','ARMERÍA'][z],x,o.y-12,'#fff1bc',6);
 }
}
function drawProp(g,o){
 if(o.type==='well'||o.type==='shrine'){stamp(g,'places',o.type==='well'?9:6,o.x,o.y+2,49);return;}
 if(o.type==='mosaic'){rect(g,material(g,14),o.x-17,o.y-9,34,13);return;}
 const [index,size]=propTiles[o.type];
 stamp(g,'props',index,o.x,o.y+1,size);
}
function drawAtmosphere(g,z,t,cx,cy){
 const count=z===3?22:16;
 for(let i=0;i<count;i++){
  const seed=i*97+z*31;
  let px,py,color,w=2,h=2;
  if(z===0){
   px=(seed*19+t*14)%WORLD.width;
   py=(seed*13+Math.sin(t*1.4+i)*18+t*6)%WORLD.height;
   color=i%2?'#fff2b299':'#c6f0a588';
  }else if(z===1){
   px=(seed*23+Math.sin(t*.9+i)*24)%WORLD.width;
   py=(seed*17+Math.cos(t*1.1+i)*18)%WORLD.height;
   const pulse=0.45+0.55*Math.sin(t*3.2+i);
   color=pulse>.65?'#f7f099cc':'#8df0bf88';
  }else if(z===2){
   px=(seed*29+Math.sin(t*.5+i)*10)%WORLD.width;
   py=(WORLD.height-((seed*11+t*9)%WORLD.height));
   color=i%3===0?'#9ee7f599':'#e6d7b066';
  }else{
   px=(seed*31+Math.sin(t*1.6+i)*16)%WORLD.width;
   py=(WORLD.height-((seed*17+t*18)%WORLD.height));
   color=i%2?'#ffad5cbb':'#ffdf8e99';
   w=i%3===0?3:2;h=2;
  }
  if(px>=cx-8&&px<=cx+648&&py>=cy-8&&py<=cy+344)rect(g,color,px,py,w,h);
 }
}
export function drawArena(g,z,t){
 tile(g,'arenas',z,0,0,640,336);
 const count=z===3?16:9;
 for(let i=0;i<count;i++){
  const x=(i*83+Math.sin(t*.5+i)*14+23)%640;
  const y=z===3?115-(t*16+i*19)%95:80+(i*13)%42+Math.sin(t*.7+i)*4;
  if(z===3)rect(g,i%2?'#ffad5caa':'#ffe39988',x,y,2,2);
  else if(z===1||i%3===0)rect(g,z===1?'#e5dd8b':'#edd8aa',x,y,2,1);
 }
}
export function drawWorld(g,game,drawHero,drawFoe,speech,cameraOverride=null){
 const {hero:h,data:d,time:t}=game,z=d.zone,w=worlds[z];
 const request=cameraOverride?null:interaction(game);
 if(d.inside&&!cameraOverride){
  rect(g,'#171c26',0,0,640,336);tile(g,'rooms',z,111,23,418,266);
  drawResident(g,{x:335,y:151,style:z*3},t,speech&&h,true);drawHero();
  if(request&&!speech)label(g,'J · '+request.title,h.x,h.y-54,'#fff0ba',9);
  return;
 }
 const {x:cx,y:cy}=cameraOverride||cameraPosition(h,false);
 g.save();g.translate(-cx,-cy);g.imageSmoothingEnabled=false;g.drawImage(terrain(z),cx,cy,640,336,cx,cy,640,336);
 for(let i=0;i<16;i++){
  const y=Math.floor((i*39+t*7)%WORLD.height);
  if(Math.abs(y-314)>27&&Math.abs(y-footbridges[z])>15)rect(g,'#c8ebd499',riverX(y)+Math.sin(i*9+t*.8)*18,y,4,1);
 }
 const entries=[...w.houses,...w.props,...w.people.map((n,i)=>({...townsperson(n,t,i),walkIndex:i})),{...w.chest,type:'chest'},{...h,type:'hero'}];
 discoveries[z].forEach((a,i)=>{if(!d.found.includes(z*2+i))entries.push({...a,type:'relic'});});
 if(z!==3&&!d.cleared.includes(z))entries.push({...game.patrol,type:'guardian'});if(!d.scouts.includes(z))entries.push({...game.scout,type:'scout'});
 sign(g,33,333,'left','OESTE');sign(g,WORLD.width-37,333,'right','ESTE');
 for(const o of entries.sort((a,b)=>a.y-b.y)){
  if(o.x<cx-120||o.x>cx+760||o.y<cy-20||o.y>cy+470)continue;
  switch(o.type){
   case 'hero':drawHero();break;
   case 'guardian':case 'scout':drawFoe(o,o.type==='scout');break;
   case 'npc':drawResident(g,o,t,speech?.name===o.name?h:null);break;
   case 'chest':
    if(z===3&&!d.opened.includes(z)){
     const pulse=Math.round(Math.sin(t*3.5)*2);
     oval(g,'#ffcf6833',o.x,o.y-2,20+pulse,8);
     rect(g,'#ffe79922',o.x-8,o.y-58,16,56);
     rect(g,'#fff5c438',o.x-3,o.y-64,6,62);
    }
    stamp(g,'props',d.opened.includes(z)?13:12,o.x,o.y,28);
    if(z===3&&!d.opened.includes(z)){
     label(g,'✦ ALBA',o.x,o.y-30+Math.sin(t*3)*3,'#ffe99e',8);
    }
    break;
   case 'relic':stamp(g,'props',[4,5,11,9][z],o.x,o.y,20);label(g,'✦',o.x+8,o.y-17+Math.sin(t*3)*2,'#ffdc78',9);break;
   default:if(w.houses.includes(o))drawPlace(g,o,z,t);else drawProp(g,o);
  }
 }
 if(z===3&&!d.royalTrialWon){
  const labelColor=d.unlocked.includes(4)?'#ffe69e':'#ffbf88';
  label(g,d.unlocked.includes(4)?'SALÓN DEL TRONO':'PORTÓN DEL CASTILLO',throneGate.x,throneGate.y-52,labelColor,8);
 }
 drawAtmosphere(g,z,t,cx,cy);
 if(request&&!speech)label(g,'J · '+request.title,h.x,h.y-54,'#fff0ba',9);
 g.restore();
 if(z===3){
  // Stepped pixel-art twilight edge bars (no blurry gradients)
  rect(g,'#120c1c38',0,0,640,14);rect(g,'#120c1c1e',0,14,640,12);
  rect(g,'#120c1c1e',0,310,640,12);rect(g,'#120c1c38',0,322,640,14);
 }
}
export function drawMinimap(g,game){
 const d=game.data,z=d.zone;if(d.inside)return;
 const x=562,y=295,w=68,h=32;
 // 16-bit brass & ink pixel frame with 4 corner rivets
 rect(g,'#0b141a',x-4,y-4,w+8,h+8);
 rect(g,'#c99f58',x-3,y-3,w+6,h+6);
 rect(g,'#0b141a',x-1,y-1,w+2,h+2);
 rect(g,'#3b5a4d',x,y,w,h);
 rect(g,'#59a9a1',x+32,y,4,h);
 rect(g,'#c9b17b',x,y+15,w,3);
 for(const [rx,ry] of [[x-3,y-3],[x+w+1,y-3],[x-3,y+h+1],[x+w+1,y+h+1]])rect(g,'#fff0b5',rx,ry,2,2);
 const dot=(o,c)=>rect(g,c,x+o.x/WORLD.width*(w-3),y+o.y/WORLD.height*(h-3),3,3);
 dot(worlds[z].houses[0],'#f5d27a');
 if(!d.opened.includes(z))dot(game.chest,'#ffbf4d');
 if(z===3&&!d.royalTrialWon)dot(throneGate,'#ef6f65');
 else if(!d.cleared.includes(z))dot(game.patrol,'#ef6f65');
 const blink=Math.floor(game.time*4)%2===0;
 dot(game.hero,blink?'#ffffff':'#ffe899');
}
