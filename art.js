const INK='#263337', DARK='#263e3d';
const canv=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
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
const colors=[
 ['#87d7ce','#d0e5a3','#70bfa0','#418c77','#94bf68','#a7cd70','#e7c982','#c89c62'],
 ['#76c7bf','#acdfb8','#5aaf98','#327867','#579a70','#6bae78','#bfb877','#9c9c66'],
 ['#9acacb','#f5dfac','#88b39d','#609283','#adb784','#bfbd8d','#e6c894','#c4a883'],
 ['#79839c','#cba8ab','#757395','#484b70','#756c87','#887d92','#b99991','#8c7581']
];
function tree(g,x,y,s,seed,biome=0){
  g.save();g.translate(x,y);g.scale(s,s);const r=rng(seed);
  oval(g,'#3b6657',1,0,16,3);poly(g,'#594c3c',[[-7,0],[-4,-5],[-5,-26],[4,-27],[5,-6],[9,0]]);
  rect(g,'#ad8150',-2,-23,4,21);rect(g,'#d8a967',0,-15,2,12);
  const tones=biome===1?['#254f53','#296c61','#368a6e','#54a57b','#8ac88d']:['#345c50','#3c8061','#53a066','#77ba69','#a7ce7d'];
  for(const [dx,dy,rx,ry] of [[0,-33,18,19],[-13,-26,12,11],[12,-28,13,13],[0,-22,17,11]]){
    oval(g,tones[0],dx,dy,rx,ry);oval(g,tones[1],dx,dy-2,rx-1,ry-2);oval(g,tones[2],dx-2,dy-4,rx-3,ry-4);
  }
  for(let i=0;i<44;i++){let dx=Math.round((r()-.5)*36),dy=Math.round((r()-.5)*21);if(dx*dx/390+dy*dy/145<1){rect(g,tones[3],dx,dy-34,3+Math.floor(r()*4),2);if(i%3===0)rect(g,tones[4],dx,dy-35,3,1);}}
  g.restore();
}
function pillar(g,x,y,s,broken=false){
  g.save();g.translate(x,y);g.scale(s,s);
  oval(g,'#687a68',2,0,12,3);
  rect(g,'#586665',-9,-3,18,4);rect(g,'#c1bca0',-8,-5,16,3);
  const top=broken?-19:-36;
  rect(g,'#647878',-6,top,12,-top-5);rect(g,'#bec2a6',-5,top,7,-top-5);rect(g,'#e5d8b0',-4,top,2,-top-7);
  for(let i=top+6;i<-6;i+=8)rect(g,'#81928a',-5,i,10,1);
  rect(g,'#647878',-8,top-4,16,5);rect(g,'#e1d8b8',-8,top-5,15,2);
  rect(g,'#518563',3,top-3,4,8);rect(g,'#78a76e',4,top+3,3,4);g.restore();
}
function tower(g,x,y,w,h,purple=false){
  const a=purple?'#645c7c':'#899d99',b=purple?'#95879b':'#b2bdae';
  rect(g,INK,x-1,y-h,w+2,h);rect(g,a,x,y-h,w,h);rect(g,b,x+2,y-h+2,w*.55,h-2);
  for(let row=0;row<h/6;row++)for(let col=0;col<w/8;col++)rect(g,a,x+(row%2)*3+col*8,y-h+4+row*6,4,1);
  poly(g,'#394451',[[x-4,y-h],[x+w/2,y-h-18],[x+w+4,y-h]]);poly(g,purple?'#a6667a':'#be775b',[[x-2,y-h-1],[x+w/2,y-h-16],[x+w*.6,y-h-1]]);
  rect(g,'#38434b',x+w*.43,y-h+10,4,9);rect(g,'#ebc18b',x+w*.43+1,y-h+11,1,4);
}
const sceneCache=new Map();
function landscape(z,arena){
  const id=z+'-'+arena;if(sceneCache.has(id))return sceneCache.get(id);
  const c=canv(680,336),g=c.getContext('2d'),p=colors[z],r=rng(1001+z*177+(arena?17:0));
  rect(g,p[0],0,0,680,336);
  for(let i=0;i<12;i++){let x=r()*680,y=r()*42;rect(g,p[1],x,y,20+r()*58,3);rect(g,p[1],x+8,y-3,15+r()*23,3);}
  for(let layer=0;layer<2;layer++){
    const points=[[0,120],[0,65]];
    for(let x=0;x<=704;x+=32)points.push([x,Math.floor(52+layer*15+Math.sin(x/69+z+layer)*11+r()*16)]);
    points.push([704,120]);poly(g,p[2+layer],points);
  }
  tower(g,z===3?320:503,94,z===3?41:19,z===3?62:26,z===3);
  if(z===3){tower(g,289,97,25,42,true);tower(g,366,95,25,47,true);}
  const line=arena?117:82;
  rect(g,p[4],0,line,680,336-line);
  if(z===3){
    for(let y=line;y<336;y+=13){for(let x=-30+(y%2)*17;x<680;x+=34){rect(g,p[5],x,y,32,12);rect(g,'#98919e',x+1,y,29,1);if(r()<.28)rect(g,p[4],x+8,y+3,7,1);}}
    rect(g,'#735468',0,164,680,70);for(const y of [165,172,226,232])rect(g,'#c29a72',0,y,680,2);
  }else{
    for(let i=0;i<2400;i++){const x=r()*680,y=line+r()*(336-line);rect(g,r()>.5?p[5]:p[3],x,y,r()*3+1,1);}
    for(let x=0;x<680;x++){const center=arena?208:187+Math.sin(x/92+z)*17;const radius=arena?68:36;
      rect(g,p[7],x,center-radius+Math.floor(Math.sin(x*.12)*2),1,2*radius+6);
      rect(g,p[6],x,center-radius+3,1,2*radius-2);}
    for(let i=0;i<1200;i++){let x=r()*680,y=(arena?208:187+Math.sin(x/92+z)*17)+(r()-.5)*(arena?125:64);rect(g,i%3?p[7]:'#f4dfab',x,y,1+r()*3,1);}
    for(let i=0;i<92;i++){const x=r()*680,y=(i%2?line+5+r()*36:269+r()*65);rect(g,p[3],x,y,2,5);rect(g,i%4?'#f9e7aa':'#e89189',x-1,y,4,2);}
  }
  for(let i=0;i<(z===1?37:17);i++){const x=i*(z===1?20:43)+r()*12,y=line+r()*9;
    if(z<2)tree(g,x,y,.55+r()*.45,i*29+13,z);
    else if(z===2)pillar(g,x,y,.6+r()*.55,i%3!==0);
    else {rect(g,'#5c576c',x-5,y-10,11,22);rect(g,'#b89f91',x-6,y-11,13,3);if(i%3===0){rect(g,'#ed9359',x-1,y-16,5,6);rect(g,'#ffe599',x,y-18,2,7);}}
  }
  for(let i=0;i<12;i++){const x=i*60+r()*12,y=334+r()*11;
    if(z<2&&i%3!==1)tree(g,x,y,.68+r()*.4,913+i,z);
    else if(z>=2)pillar(g,x,y,.6+r()*.5,true);}
  sceneCache.set(id,c);return c;
}
export function background(g,z,arena,x){
  g.imageSmoothingEnabled=false;const offset=Math.round(10+Math.max(0,Math.min(1,x/640))*16);
  const image=landscape(z,arena), horizon=arena?70:38;
  g.drawImage(image,-offset,0);
  g.drawImage(image,Math.round(offset*.32),0,640,horizon,0,0,640,horizon);
}
const sprites={
 hero:[
 '       v   v        ','      vvV vvVvv     ','      vVUUUVVVvv    ','     vVUUUVVUVVvv   ','     vVUVVVVVVVVvv  ','      vVvvVvvvVv    ','      vVffFfFv      ','      vFffFfiFff    ','       vffFFfFFF    ','        fFFffFf     ','     ssssRRRRrr     ','    sSSssRrrrrr     ','    sSStttTTttaa    ','    sSStTATTtfFFf   ','     sstTTTAtfff    ','       bbbGbbb      ','      tTtTTTtt      ','      tTt  ttt      ','      bBB  bBBb     ','     bBBb  bBBBb    '],
 sprout:[
 '       ll   Ll     ','       lLl lLLl    ','        lLlLLl     ','         lGl       ','      ggggggg      ','    ggGGGGGGGgg    ','   gGLLGGGGGGGGg   ','   gGLGGGGGGGGGg   ','   gGGGfGGGfGGGg   ','   gGGGiGGGiGGGg   ','    gGfffGfffGg    ','   ggGggGGGggGgg   ','  gGGgGGGGGGGgGGg  ','  gGg ggggggg gGg  ','    bBBb   bBBb    ','   bBBBb   bBBBb   '],
 moth:[
 '   lL       Ll     ','    lL     Ll      ',' ww  hh   hh   ww  ','wPPww hh hh  wwPPw ','wPAPPhhhhhhwwPPAPw ',' wPPPhHHHHhPPPPPw  ','  wPPHFiFiHPPPw    ','   wwHFFFFHwww     ','  wPPhHHHHhPPPw    ',' wPAPPrRRrPPAPw    ','  wPPw rGr wPPw    ','   ww  rrr  ww     ','      bB bB        '],
 stone:[
 '       aaaa        ','     aaAAaa        ','    ssSSSSss       ','   sSAASSSSSs      ','   sSSiiiisss      ','   sSSAGGAsss      ','   sSSSSSSSSs      ','  ssRRrrrrRRss     ',' sSSsSSGGSSsSSs    ',' sASsSGAAGSsASs    ',' sSSsSSGGSSsSSs    ','  ss ssSSss ss     ','    sSSssSSs       ','    sSSs sSSs      ','   sSSSs sSSSs     '],
 king:[
 '     G   G   G     ','     Gg GgG gG     ','     gGGAGAGGg     ','    rrgggggggrr    ','   rRRRrrrrRRRRr   ','   rRHhHHHHhHRRr   ','   rRHAGiiGAHRRr   ','    rHhhffhhHRr    ','    rrHHFFHHrr     ','   gGGrRRrrrGGg    ','  rRAGGGAGGGGARr   ',' rRRrRRRGrRRrRRRr  ',' rRr rRGGGRr rRRr  ',' hHh rRrGrRr hHHh  ','    rRRrGrRRr      ','   rRRRrGrRRRr     ','  rRRRrrGrrRRRr    ',' rRRRRrrGrrRRRRr   ',' rrRRrrGGGrrRRrr   ','    bBBB bBBB      ']
};
const pal={t:'#244d59',T:'#348e99',A:'#ffe0a0',a:'#82624f',h:'#493f43',H:'#816759',f:'#d9986e',F:'#ffcf96',i:'#222c35',s:'#40595b',S:'#98a9a0',R:'#c65648',r:'#793d49',b:'#473d3c',B:'#98694d',G:'#eebf59',g:'#597749',l:'#357352',L:'#a6d975',w:'#654b73',P:'#bf89bb'};
Object.assign(pal,{v:'#763f40',V:'#c65e43',U:'#f19a55'});
const cache=new Map(),sheets=new Map();
export async function loadSheet(kind,url){const img=new Image();img.src=url;await img.decode();sheets.set(kind,img);}
// A replacement sheet uses four columns and rows idle, walk, attack, roll, hurt, heal.
const poses=['idle','walk','attack','roll','hurt','heal'];
function sprite(kind,pose,frame,weapon){
  const key=[kind,pose,frame,weapon].join('/');if(cache.has(key))return cache.get(key);
  const c=canv(128,128),g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const rows=sprites[kind], step=frame===1?1:frame===3?-1:0;
  const bob=(pose==='walk'?Math.abs(step)*-3:frame===2?-2:0);
  g.translate(64,106+bob);if(pose==='roll'){g.translate(0,-23);g.rotate([0,Math.PI/2,Math.PI,3*Math.PI/2][frame]);g.translate(0,23);}
  if(pose==='hurt')g.translate(-4,1);
  if(kind!=='hero'&&pose==='attack'){g.translate(frame*2,2);g.scale(1.06,.92);}
  const cells=[];
  rows.forEach((row,y)=>[...row].forEach((v,x)=>{
    if(v===' ')return;
    const foot=pose==='walk'&&y>rows.length-4?(x<9?step:-step)*3:0;
    const wing=kind==='moth'&&(x<6||x>12)?step*3:0;
    cells.push([Math.round((x-9)*4)+foot,(y-rows.length)*4+wing,v]);
  }));
  for(const [x,y] of cells)rect(g,INK,x-2,y-2,8,8);
  for(const [x,y,v] of cells)rect(g,pal[v],x,y,4,4);
  if(kind==='sprout'){oval(g,'#79b35d',-9,-46,8,3);rect(g,'#dbab5c',-1,-5,6,3);}
  if(kind==='hero'){
    const swing=pose==='attack',hx=swing?22:16,hy=pose==='heal'?-46:-31;
    if(pose==='heal'){oval(g,'#df6354',hx+3,hy-5,7,7);rect(g,'#94ce70',hx+2,hy-14,6,4);}
    else if(swing&&weapon===3){rect(g,'#714e38',hx,hy,30,5);rect(g,INK,hx+22,hy-10,16,24);rect(g,'#8c9fa6',hx+24,hy-8,12,18);}
    else{
      const len=weapon===2?18:weapon===4?36:29;
      const angle=swing?[-.9,-.5,.07,.45][frame]:-1.05;
      g.save();g.translate(hx,hy);g.rotate(angle);
      rect(g,INK,-5,-3,len+10,7);rect(g,'#aa7748',-5,-2,10,4);rect(g,'#e6b75f',4,-6,4,12);
      rect(g,weapon===4?'#7fe4d2':'#b9ced1',8,-2,len-4,4);rect(g,'#f2edcf',9,-2,len-6,1);g.restore();
    }
  }
  cache.set(key,c);return c;
}
export function actor(g,kind,x,y,pose,t,face,size,weapon=0){
  const frame=Math.floor(t*(pose==='attack'?18:pose==='roll'?20:pose==='idle'?3:9))%4;
  g.save();g.translate(Math.round(x),Math.round(y));oval(g,'#374d4966',0,0,Math.round(size*.21),Math.max(2,Math.round(size*.045)));
  g.scale(face<0?-1:1,1);g.imageSmoothingEnabled=false;
  const sheet=sheets.get(kind),src=sheet||sprite(kind,pose,frame,weapon);
  if(pose!=='hurt'||Math.floor(t*18)%2===0)g.drawImage(src,sheet?frame*128:0,sheet?poses.indexOf(pose)*128:0,128,128,-size/2,-size*.83,size,size);
  g.restore();
}
export const kinds=['sprout','moth','stone','king'];
export function label(g,str,x,y,color='#ffedbd',px=9){
  g.font=px+'px Silk, monospace';g.textAlign='center';g.fillStyle=INK;g.fillText(str,Math.round(x+1),Math.round(y+2));g.fillStyle=color;g.fillText(str,Math.round(x),Math.round(y));
}
export function sign(g,x,y,dir,title){
  rect(g,'#6c5944',x-2,y-19,5,19);rect(g,'#473e35',x-16,y-26,33,13);rect(g,'#cb9d64',x-15,y-25,31,10);
  label(g,dir==='left'?'◀':'▶',x,y-17,'#fff0bc',9);label(g,title,x,y+11,'#fff3ce',8);
}
export function chest(g,x,y,open){rect(g,INK,x-11,y-12,23,13);rect(g,'#ac6e43',x-10,y-11,21,10);rect(g,open?'#443b3c':'#d6a052',x-9,y-13,18,5);for(const k of [-7,5])rect(g,'#e4bc70',x+k,y-12,3,11);rect(g,INK,x-10,y-6,21,2);rect(g,'#ffe190',x-2,y-7,5,5);}
export function emblem(canvas,type,index=0){
  const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;g.clearRect(0,0,w,h);g.imageSmoothingEnabled=false;g.save();
  if(type==='region'){g.drawImage(landscape(index,false),400,35,140,110,0,0,w,h);g.restore();return;}
  g.scale(w/24,h/24);
  if(type==='crest'){poly(g,INK,[[2,3],[21,3],[21,15],[12,23],[2,15]]);poly(g,'#dcb36c',[[3,4],[20,4],[20,14],[12,21],[3,14]]);poly(g,'#368b81',[[5,6],[18,6],[18,14],[12,18],[5,14]]);poly(g,'#fff0c3',[[6,13],[10,8],[12,11],[15,7],[18,14],[6,14]]);}
  if(type==='sound'){rect(g,'#cbd8c4',3,9,5,6);poly(g,'#f3d296',[[7,9],[14,4],[14,20],[7,15]]);if(index){rect(g,'#83d7bb',16,8,2,8);if(index===2)rect(g,'#83d7bb',20,6,1,12);}else{rect(g,'#e18b80',16,11,5,2);}}
  if(type==='weapon'){
    g.translate(4,20);g.rotate(-.79);rect(g,'#986442',-1,-4,3,6);rect(g,'#f3cf78',-4,-5,10,3);
    rect(g,index===4?'#89e0cf':'#ccdedb',0,-(index===2?14:21),4,index===2?10:17);
    if(index===3)rect(g,'#a0abb1',-4,-19,13,7);
  }
  if(type==='item'){
    const c=['#e77761','#73bad0','#bc91c5','#eab653','#a6afc9'][index];
    if(index===1){poly(g,c,[[4,5],[19,5],[18,15],[12,21],[5,15]]);rect(g,'#d4f1da',11,7,2,10);}
    else {oval(g,INK,12,14,7,7);oval(g,c,12,14,6,6);rect(g,'#fff0bd',8,11,3,2);rect(g,index===0?'#77bb67':'#b28c58',11,4,6,4);}
  }g.restore();
}

export {tree,pillar,tower,oval,poly,rect,rng};
