import {oval} from './art.js';
import {tilePart} from './atlas.js';

const sprites=new Map();
const buildings={
 // Compose the cottage from the plaster facade, wooden door and local leaf shingles.
 cottage:{base:97,pieces:[
  [0,[15,69,108,55],3,48,93,49],
  [3,[47,78,35,46],40,57,29,40],
  [5,[3,0,124,54],0,0,100,52],
  [5,[8,54,36,10],4,52,29,9],
  [5,[80,54,44,10],62,52,35,9]
 ]},
 // Use only the castle's tower, leaving the central gate and its wall in the castle.
 watchtower:{base:105,pieces:[
  [7,[8,3,46,47],29,5,44,38],
  [7,[16,49,30,50],37,42,29,41],
  [7,[8,98,42,27],29,83,40,22]
 ]}
};

export function drawVillageStructure(g,{type,x,y}){
 const building=buildings[type];
 if(!building)return false;
 if(!sprites.has(type)){
  const canvas=Object.assign(document.createElement('canvas'),{width:104,height:building.base});
  const ctx=canvas.getContext('2d');
  for(const [index,source,...destination] of building.pieces){
   tilePart(ctx,'places',index,source,...destination);
  }
  sprites.set(type,canvas);
 }
 oval(g,'#31283259',x+2,y,type==='cottage'?37:25,6);
 g.imageSmoothingEnabled=false;
 g.drawImage(sprites.get(type),x-51,y-building.base);
 return true;
}
