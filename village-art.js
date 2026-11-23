import {WORLD,worlds,riverX,footbridges,discoveries,townsperson,interaction,throneGate} from './world.js';
import {rect,oval,rng,label,sign} from './art.js';
import {material,stamp,tile} from './atlas.js';
import {cameraPosition} from './speech.js';
import {drawResident} from './actors.js';

const terrainCache=new Map();
const roofTiles={inn:0,herbal:1,archive:2,armory:3,mill:4,hut:5,arch:6,gate:7,stall:8,tent:11,house:0,barn:4,tower:7,shrine:6};
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
// Build a common silhouette for every fork before laying down the walking surface.
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
 // Break up the last few pixels of soil at each verge. Interior junctions stay continuous.
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
function drawPlace(g,o,z){
 const size=Math.round(o.width*(o.type==='mill'?1.65:o.type==='gate'?1.55:1.24));
 oval(g,'#313a3445',o.x+3,o.y,Math.floor(o.width*.45),5);
 stamp(g,'places',roofTiles[o.type],o.x,o.y+2,size);
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
export function drawArena(g,z,t){
 tile(g,'arenas',z,0,0,640,336);
 // Dust and fireflies stay at the distant edge, clear of every attack indicator.
 for(let i=0;i<7;i++){
  const x=(i*103+Math.sin(t*.4+i)*12+23)%640,y=84+(i*13)%37+Math.sin(t*.6+i)*3;
  if(z===1||i%3===0)rect(g,z===1?'#e5dd8b':'#edd8aa',x,y,2,1);
 }
}
export function drawWorld(g,game,drawHero,drawFoe,speech){
 const {hero:h,data:d,time:t}=game,z=d.zone,w=worlds[z];
 const request=interaction(game);
 if(d.inside){
  rect(g,'#262a37',0,0,640,336);tile(g,'rooms',z,111,23,418,266);
  drawResident(g,{x:335,y:151,style:z*3},t,speech&&h,true);drawHero();
  if(request&&!speech)label(g,'J · '+request.title,h.x,h.y-54,'#fff0ba',9);
  return;
 }
 const {x:cx,y:cy}=cameraPosition(h,false);
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
  if(o.x<cx-95||o.x>cx+735||o.y<cy-10||o.y>cy+470)continue;
  switch(o.type){
   case 'hero':drawHero();break;
   case 'guardian':case 'scout':drawFoe(o,o.type==='scout');break;
   case 'npc':drawResident(g,o,t,speech?.name===o.name?h:null);break;
   case 'chest':
    stamp(g,'props',d.opened.includes(z)?13:12,o.x,o.y,28);
    if(z===3&&!d.opened.includes(z))label(g,'✦',o.x,o.y-27+Math.sin(t*3)*3,'#ffdf96',12);
    break;
   case 'relic':stamp(g,'props',[4,5,11,9][z],o.x,o.y,20);label(g,'✦',o.x+8,o.y-17+Math.sin(t*3)*2,'#ffdc78',9);break;
   default:if(w.houses.includes(o))drawPlace(g,o,z);else drawProp(g,o);
  }
 }
 if(z===3&&!d.royalTrialWon)label(g,'TRONO',throneGate.x,throneGate.y-41,'#ffcf8c',9);
 if(request&&!speech)label(g,'J · '+request.title,h.x,h.y-54,'#fff0ba',9);
 g.restore();
}
export function drawMinimap(g,game){
 const d=game.data,z=d.zone;if(d.inside)return;
 const x=568,y=300,w=64,h=29;
 rect(g,'#343e48',x-2,y-2,w+4,h+4);rect(g,'#c3aa7d',x-1,y-1,w+2,h+2);rect(g,'#526c5d',x,y,w,h);
 rect(g,'#70b3ab',x+30,y,3,h);rect(g,'#c3b182',x,y+14,w,2);
 const dot=(o,c)=>rect(g,c,x+o.x/WORLD.width*(w-3),y+o.y/WORLD.height*(h-3),3,3);
 dot(worlds[z].houses[0],'#f2cc89');if(!d.opened.includes(z))dot(game.chest,'#d7a659');if(z===3&&!d.royalTrialWon)dot(throneGate,'#ef8070');else if(!d.cleared.includes(z))dot(game.patrol,'#ef8070');dot(game.hero,'#fffbe1');
}

