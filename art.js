const INK='#263337', DARK='#263e3d';
const rect=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
function oval(g,c,x,y,rx,ry){
  for(let k=-ry;k<=ry;k++){const d=Math.round(rx*Math.sqrt(Math.max(0,1-k*k/(ry*ry))));rect(g,c,x-d,y+k,2*d+1,1);}
}
function poly(g,c,points){
  // Scanline rasterization keeps every silhouette on the pixel grid.
  for(let y=Math.min(...points.map(p=>p[1]));y<Math.max(...points.map(p=>p[1]));y++){
    const hits=[];
    points.forEach(([x,a],i)=>{const [u,b]=points[(i+1)%points.length];if((a<=y&&b>y)||(b<=y&&a>y)) hits.push(x+(y-a)*(u-x)/(b-a));});
    hits.sort((a,b)=>a-b);for(let i=0;i<hits.length;i+=2)rect(g,c,Math.ceil(hits[i]),y,Math.ceil(hits[i+1])-Math.ceil(hits[i]),1);
  }
}
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
export const regions=['Pradera del Inicio','Bosque Encantado','Ruinas de los Ecos','Castillo Mimético'];
export const enemyNames=['Bramble, el guardabrotes','Lumbre, la polilla lunar','Talos, el centinela','Rey Mimético'];
export function label(g,str,x,y,color='#ffedbd',px=9){
  g.font=px+'px Silk, monospace';g.textAlign='center';g.fillStyle=INK;g.fillText(str,Math.round(x+1),Math.round(y+2));g.fillStyle=color;g.fillText(str,Math.round(x),Math.round(y));
}
export function sign(g,x,y,dir,title){
  rect(g,'#6c5944',x-2,y-19,5,19);rect(g,'#473e35',x-16,y-26,33,13);rect(g,'#cb9d64',x-15,y-25,31,10);
  label(g,dir==='left'?'◀':'▶',x,y-17,'#fff0bc',9);label(g,title,x,y+11,'#fff3ce',8);
}
// Inventory shapes use whole pixels so the edges stay crisp at every slot size.
function sword(g,variant){
  const outline='#252538';
  const bladeColors=[
    ['#708194','#bbcdd6','#fff6dc'],
    ['#416783','#8fc0d3','#e5f8ff'],
    ['#2c6b64','#67d9a3','#e2ffe3']
  ];
  const [shade,metal,light]=bladeColors[variant];
  const blade=[
    [[8,12],[18,2],[22,1],[21,7],[12,16]],
    [[7,12],[16,3],[22,1],[22,7],[12,17]],
    [[7,12],[12,7],[15,7],[15,4],[19,1],[22,1],[22,6],[19,9],[16,10],[16,13],[12,17]]
  ][variant];
  poly(g,outline,blade);
  poly(g,shade,[[9,12],[19,3],[21,2],[20,7],[11,15]]);
  poly(g,metal,[[9,12],[19,3],[21,2],[18,7],[11,14]]);
  poly(g,light,[[10,11],[19,3],[21,2],[19,5],[11,13]]);
  poly(g,outline,[[2,18],[8,12],[6,10],[8,8],[16,16],[15,19],[12,18],[7,22],[4,23],[1,20]]);
  poly(g,'#84513e',[[3,18],[8,13],[11,16],[6,21],[3,21],[2,20]]);
  poly(g,'#d48750',[[4,18],[8,14],[9,15],[5,20],[3,20]]);
  poly(g,'#a8683c',[[7,10],[9,10],[15,16],[14,18],[7,12]]);
  poly(g,'#f2c36c',[[7,10],[9,10],[14,15],[13,16]]);
  rect(g,'#fff1af',4,19,2,2);
  if(variant===1)rect(g,'#87d4ef',10,13,2,2);
  if(variant===2){
    rect(g,'#e7ff99',10,13,3,2);
    rect(g,'#adfff1',16,7,2,2);
    rect(g,'#adfff1',5,5,1,3);
    rect(g,'#adfff1',4,6,3,1);
  }
}

function dagger(g,x,y,shade,metal){
  const shape=(color,points)=>poly(g,color,points.map(([u,v])=>[u+x,v+y]));
  shape('#25313d',[[0,9],[3,6],[3,4],[8,0],[12,0],[12,5],[8,9],[9,11],[7,13],[5,12],[2,15],[0,14]]);
  shape(shade,[[4,5],[9,1],[11,1],[11,4],[7,8]]);
  shape(metal,[[4,5],[9,1],[11,1],[6,7]]);
  shape('#e6b66f',[[3,6],[4,6],[8,10],[7,12],[3,8]]);
  shape('#c98257',[[1,10],[4,8],[5,10],[2,13],[1,13]]);
}

function hammer(g){
  poly(g,'#302638',[[1,18],[13,7],[17,11],[6,23],[2,22]]);
  poly(g,'#9c6550',[[2,19],[14,8],[16,11],[5,22]]);
  poly(g,'#f0ad6c',[[3,19],[14,8],[15,10],[4,20]]);
  poly(g,'#282839',[[8,3],[11,0],[15,0],[23,8],[23,12],[19,17],[16,17],[8,9],[7,6]]);
  poly(g,'#635e78',[[8,4],[12,1],[15,1],[22,8],[22,12],[18,16],[10,8]]);
  poly(g,'#9ca2b7',[[9,4],[12,1],[15,1],[22,8],[18,11]]);
  poly(g,'#d9d8d6',[[9,4],[12,2],[15,2],[21,8],[18,9]]);
  poly(g,'#e0a658',[[10,8],[15,3],[17,5],[12,10]]);
  rect(g,'#ecc17c',18,11,2,2);
}

function fruit(g){
  poly(g,'#302635',[[10,6],[11,3],[14,1],[20,1],[19,5],[15,7],[18,8],[21,12],[21,16],[19,20],[16,22],[12,21],[8,22],[4,19],[3,15],[3,11],[5,7],[8,6]]);
  poly(g,'#a33f47',[[4,11],[6,8],[9,7],[12,9],[16,7],[19,9],[20,13],[19,17],[16,21],[12,20],[8,21],[5,18]]);
  poly(g,'#e56549',[[5,10],[8,8],[12,9],[16,8],[19,10],[18,15],[15,18],[9,19],[5,16]]);
  poly(g,'#ff9d63',[[5,12],[7,9],[10,9],[11,11],[8,15],[6,15]]);
  rect(g,'#fff1ba',7,10,2,2);
  rect(g,'#704932',11,4,2,5);
  poly(g,'#60a65e',[[12,6],[14,3],[19,2],[17,5]]);
  rect(g,'#abdb75',15,3,3,1);
}

function shield(g){
  poly(g,'#282c3e',[[2,4],[6,4],[12,1],[18,4],[22,4],[22,13],[19,18],[12,23],[5,18],[2,13]]);
  poly(g,'#96714a',[[3,5],[7,5],[12,2],[17,5],[21,5],[21,13],[18,17],[12,22],[6,17],[3,13]]);
  poly(g,'#f4ce80',[[3,5],[7,5],[12,2],[17,5],[20,5],[19,7],[12,4],[5,7],[5,13],[8,17],[12,20],[12,22],[6,17],[3,13]]);
  poly(g,'#375471',[[5,7],[12,4],[19,7],[19,13],[16,17],[12,20],[8,17],[5,13]]);
  poly(g,'#4e8a96',[[5,7],[12,4],[18,7],[17,12],[12,18],[8,16],[5,13]]);
  poly(g,'#b3e4db',[[12,6],[13,10],[17,12],[13,13],[12,17],[11,13],[7,12],[11,10]]);
}

function stunOrb(g){
  poly(g,'#372a40',[[9,5],[9,2],[13,2],[13,5],[18,6],[21,10],[22,15],[19,20],[15,22],[8,22],[3,19],[2,14],[4,9]]);
  poly(g,'#a85696',[[5,9],[10,6],[15,6],[19,9],[21,14],[19,19],[15,21],[8,21],[4,18],[3,14]]);
  poly(g,'#dd86bb',[[4,12],[7,8],[12,7],[17,8],[19,11],[17,16],[11,19],[6,18],[4,16]]);
  poly(g,'#ffee93',[[13,8],[7,14],[11,14],[9,19],[17,12],[13,12],[15,8]]);
  rect(g,'#f0b778',10,3,3,2);
  rect(g,'#fde7a8',16,2,2,2);
  rect(g,'#fde7a8',19,4,1,1);
}

function elixir(g){
  poly(g,'#342839',[[8,1],[16,1],[17,5],[15,6],[15,8],[19,11],[19,20],[16,22],[7,22],[4,20],[4,11],[8,8],[9,6],[7,5]]);
  poly(g,'#7ea1a8',[[10,5],[14,5],[14,9],[18,12],[18,19],[15,21],[8,21],[5,19],[5,12],[10,9]]);
  poly(g,'#af6536',[[6,13],[10,12],[15,14],[17,13],[17,19],[15,20],[8,20],[6,18]]);
  poly(g,'#ffbf4d',[[6,13],[10,12],[15,14],[16,16],[14,19],[8,19],[6,17]]);
  rect(g,'#c88553',8,2,8,3);
  rect(g,'#ffc887',9,2,5,1);
  rect(g,'#e0fff1',7,11,2,2);
  rect(g,'#fff2aa',9,15,2,2);
  rect(g,'#fff2aa',13,17,1,1);
}

function smoke(g){
  poly(g,'#30283d',[[8,8],[7,4],[9,3],[14,4],[16,3],[18,4],[16,9],[20,14],[22,18],[20,21],[15,23],[8,23],[3,21],[2,18],[5,12]]);
  poly(g,'#596088',[[3,18],[6,12],[10,8],[15,9],[19,14],[21,18],[19,20],[14,22],[8,22],[4,20]]);
  poly(g,'#7d88a7',[[4,17],[7,12],[11,9],[15,10],[17,13],[16,18],[12,20],[6,20]]);
  poly(g,'#9eaec4',[[8,5],[10,4],[13,6],[17,4],[15,9],[10,9]]);
  rect(g,'#bd9469',9,8,7,2);
  rect(g,'#eccb9a',9,8,6,1);
  poly(g,'#d6deeb',[[7,16],[9,13],[13,13],[14,15],[16,15],[17,18],[7,18],[6,17]]);
}

const weaponIcons=[
  g=>sword(g,0),
  g=>sword(g,1),
  g=>{dagger(g,3,0,'#577695','#d2eeea');dagger(g,10,7,'#59908e','#ecffe6');},
  hammer,
  g=>sword(g,2)
];
const itemIcons=[fruit,shield,stunOrb,elixir,smoke];

export function emblem(canvas,type,index=0){
  const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;g.save();
  g.scale(w/24,h/24);
  if(type==='crest'){poly(g,INK,[[2,3],[21,3],[21,15],[12,23],[2,15]]);poly(g,'#dcb36c',[[3,4],[20,4],[20,14],[12,21],[3,14]]);poly(g,'#368b81',[[5,6],[18,6],[18,14],[12,18],[5,14]]);poly(g,'#fff0c3',[[6,13],[10,8],[12,11],[15,7],[18,14],[6,14]]);}
  if(type==='sound'){rect(g,'#cbd8c4',3,9,5,6);poly(g,'#f3d296',[[7,9],[14,4],[14,20],[7,15]]);if(index){rect(g,'#83d7bb',16,8,2,8);if(index===2)rect(g,'#83d7bb',20,6,1,12);}else{rect(g,'#e18b80',16,11,5,2);}}
  if(type==='weapon')weaponIcons[index](g);
  if(type==='item')itemIcons[index](g);
  g.restore();
}

export {oval,poly,rect,rng};
