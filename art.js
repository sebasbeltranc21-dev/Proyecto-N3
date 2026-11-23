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
export function emblem(canvas,type,index=0){
  const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;g.save();
  g.scale(w/24,h/24);
  if(type==='crest'){poly(g,INK,[[2,3],[21,3],[21,15],[12,23],[2,15]]);poly(g,'#dcb36c',[[3,4],[20,4],[20,14],[12,21],[3,14]]);poly(g,'#368b81',[[5,6],[18,6],[18,14],[12,18],[5,14]]);poly(g,'#fff0c3',[[6,13],[10,8],[12,11],[15,7],[18,14],[6,14]]);}
  if(type==='sound'){rect(g,'#cbd8c4',3,9,5,6);poly(g,'#f3d296',[[7,9],[14,4],[14,20],[7,15]]);if(index){rect(g,'#83d7bb',16,8,2,8);if(index===2)rect(g,'#83d7bb',20,6,1,12);}else{rect(g,'#e18b80',16,11,5,2);}}
  if(type==='weapon'){
    g.translate(4,20);g.rotate(.79);rect(g,'#986442',-1,-4,3,6);rect(g,'#f3cf78',-4,-5,10,3);
    rect(g,index===4?'#89e0cf':'#ccdedb',0,-(index===2?14:21),4,index===2?10:17);
    if(index===1)rect(g,'#85b9da',1,-18,2,10);
    if(index===2){rect(g,'#c3e5dd',7,-17,3,12);rect(g,'#cc9e64',5,-6,7,2);}
    if(index===3)rect(g,'#a0abb1',-4,-19,13,7);
  }
  if(type==='item'){
    const c=['#e77761','#73bad0','#bc91c5','#eab653','#a6afc9'][index];
    if(index===1){poly(g,c,[[4,5],[19,5],[18,15],[12,21],[5,15]]);rect(g,'#d4f1da',11,7,2,10);}
    else {oval(g,INK,12,14,7,7);oval(g,c,12,14,6,6);rect(g,'#fff0bd',8,11,3,2);rect(g,index===0?'#77bb67':'#b28c58',11,4,6,4);}
  }g.restore();
}

export {oval,poly,rect,rng};
