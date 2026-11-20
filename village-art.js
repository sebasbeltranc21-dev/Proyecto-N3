import {WORLD,worlds,riverX,footbridges,discoveries,townsperson,interaction} from './world.js';
import {tree,pillar,tower,oval,poly,rect,rng,actor,sign,chest,label} from './art.js';
import {atlasReady,stamp} from './atlas.js';
const ink='#3b3c41', wood='#7d5140', lightWood='#d8a166',cream='#fff0bd';
const palettes=[
 ['#84b86b','#aacd72','#659b66','#e6c381','#caa36b','#4d967d','#63bbb0'],
 ['#4f8e73','#75a677','#417963','#c2b782','#a49c6c','#367f83','#58a6a1'],
 ['#a8b58b','#c3c29a','#8e9f81','#dec696','#bba684','#609595','#7ab6ad'],
 ['#747987','#91909b','#656a7a','#a99b97','#887e86','#535d7d','#6c8397']
];
const roofs={inn:['#873f3e','#be5c4c','#e3835d'],house:['#2e666e','#368e94','#6fb7a8'],mill:['#79503f','#ba8052','#e4ac63'],barn:['#824442','#b8594e','#d78662'],armory:['#454663','#645c80','#99859a'],archive:['#38746e','#51968b','#8eb9a0']};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const groundCache=new Map();
function line(g,col,x,y,u,v,weight=1){const n=Math.max(1,Math.abs(u-x),Math.abs(v-y));for(let i=0;i<=n;i++)rect(g,col,x+(u-x)*i/n,y+(v-y)*i/n,weight,weight);}
function stone(g,x,y,z){oval(g,'#576b68',x,y-1,7,3);poly(g,z===3?'#92909d':'#a3b3a0',[[x-8,y-2],[x-5,y-8],[x+2,y-10],[x+7,y-5],[x+7,y-2]]);rect(g,'#d4d4b6',x-4,y-7,6,2);}
function blossom(g,x,y,z,n){rect(g,'#466c52',x,y-3,2,5);rect(g,'#60965c',x-2,y-1,2,2);const c=['#fff2b7','#f7cb76','#df9383','#b3d6da'][n%4];rect(g,c,x-2,y-4,5,2);rect(g,c,x-1,y-5,3,4);rect(g,'#c88354',x,y-4,1,1);}
function trail(g,points,width,p){
 for(let i=1;i<points.length;i++){
 const [x,y]=points[i-1],[u,v]=points[i],n=Math.ceil(Math.hypot(u-x,v-y)/4);
 for(let j=0;j<=n;j++){const k=j/n;oval(g,p[4],Math.round(x+(u-x)*k),Math.round(y+(v-y)*k)+3,width,Math.ceil(width*.57));}}
 for(let i=1;i<points.length;i++){
 const [x,y]=points[i-1],[u,v]=points[i],n=Math.ceil(Math.hypot(u-x,v-y)/4);
 for(let j=0;j<=n;j++){const k=j/n;oval(g,p[3],Math.round(x+(u-x)*k),Math.round(y+(v-y)*k),width,Math.ceil(width*.57));}}
}
function bridge(g){
 const x=655,y=WORLD.road;rect(g,wood,x-49,y-23,100,48);
 for(let j=0;j<20;j++){rect(g,j%3===0?'#d6a06a':'#e4b57b',x-48+j*5,y-22,4,45);rect(g,'#aa774f',x-48+j*5,y+14,3,1);}
 for(const dy of [-23,24]){rect(g,'#6a5146',x-50,y+dy-7,102,4);rect(g,'#f0c68a',x-50,y+dy-8,102,2);for(const k of [-48,-19,19,48]){rect(g,'#774f3d',x+k,y+dy-12,5,14);rect(g,'#deb47b',x+k,y+dy-13,6,3);}}
}
function terrain(z){
 const key=z+'-'+atlasReady('places');
 if(groundCache.has(key))return groundCache.get(key);
 const c=Object.assign(document.createElement('canvas'),{width:WORLD.width,height:WORLD.height}),g=c.getContext('2d');
 const p=palettes[z],r=rng(37+z*310),W=c.width,H=c.height;
 rect(g,p[0],0,0,W,H);
 for(let k=0;k<145;k++){const x=r()*W,y=r()*H;for(let j=0;j<32;j++){const off=(r()-.5)*42;rect(g,p[1],x+off,y+(r()-.5)*(19-Math.abs(off)*.6),3+r()*5,2);}}
 for(let i=0;i<7600;i++){const x=r()*W,y=r()*H;rect(g,i%4?p[1]:p[2],x,y,1+r()*3,1);if(i%3===0)rect(g,p[2],x-1,y-1,1,2);}
 // Raised ledges frame the valley, with visible strata and foothill orchards.
 for(let x=0;x<W;x+=3){const y=54+Math.round(Math.sin(x/106+z)*12+Math.sin(x/39)*4);
 rect(g,'#8e7964',x,0,3,y+13);rect(g,'#c39e76',x,0,3,y+9);rect(g,p[2],x,0,3,y+2);rect(g,p[1],x,0,3,y-1);}
 for(let i=0;i<67;i++){const x=i*22+r()*12;if(z<2)tree(g,x,41+r()*13,.65+r()*.46,i+10,z);
 else if(i%3===0)(z===2?pillar(g,x,45,.83,true):tower(g,x,58,22,30,true));}
 const main=[[0,314],[125,316],[259,309],[352,325],[486,316],[574,310],[718,315],[842,334],[980,306],[1104,315],[1214,309],[W,314]];
 trail(g,main,39,p);trail(g,[[155,245],[180,289],[244,315],[382,220]],23,p);
 trail(g,[[370,322],[432,423],[549,428],[655,316]],24,p);
 trail(g,[[772,319],[829,410],[968,453],[1113,440],[1193,310]],23,p);
 trail(g,[[881,324],[943,229],[1053,211],[1113,306]],22,p);
 const [north,south]=discoveries[z];
 trail(g,[[256,303],[259,213],[north.x,north.y]],12,p);
 trail(g,[[865,409],[south.x,south.y]],12,p);
 const foot=footbridges[z],bend=riverX(foot);
 trail(g,[[395,foot<314?224:423],[516,foot],[bend,foot],[801,foot],[903,foot<314?223:426]],14,p);
 // Individual paving stones mark the central square and the fortress courtyard.
 for(let row=-5;row<6;row++)for(let col=-9;col<10;col++){
  if(col*col/82+row*row/28>1)continue;
  const xx=258+col*8+(row%2)*3,yy=304+row*5;
  rect(g,z===3?'#827b85':p[4],xx,yy,7,4);
  rect(g,z===3?'#aaa0a0':'#e1c293',xx+1,yy,5,3);
 }
 if(z===3){
  for(const y of [92,547])for(let x=20;x<W-20;x+=16){
   if(Math.abs(x-riverX(y))<48)continue;
   rect(g,'#59566b',x,y,16,15);rect(g,'#90869b',x,y,15,6);rect(g,'#777487',x+1,y+8,14,5);
   rect(g,'#9990a0',x,y-6,7,7);rect(g,'#c0b4ac',x,y-6,7,2);
  }
 }
 for(let i=0;i<12200;i++){const x=r()*W|0,y=r()*H|0;
 if(i%16===0&&(y<156||y>470))blossom(g,x,y,z,i%5);
 else if(i%21===0&&(y<156||y>484))stone(g,x,y,z);
 else if(Math.abs(y-314)<14)rect(g,i%2?p[4]:'#e9d4aa',x,y,2+r()*3,1);}
 // Riverbanks are shared with navigability, keeping the bridge the crossing point.
 for(let y=0;y<H;y++){const x=riverX(y);rect(g,'#697e68',x-34,y,68,1);rect(g,'#d0bb86',x-32,y,64,1);rect(g,p[5],x-29,y,58,1);rect(g,p[6],x-23,y,46,1);}
 for(let i=0;i<715;i++){const y=r()*H|0,x=riverX(y)+(r()-.5)*49;rect(g,i%3?p[5]:'#a3d7bf',x,y,2+r()*7,1);}
 for(let i=0;i<28;i++){
 const x=r()*W,y=H-r()*21;if(z<2)tree(g,x,y,.66+r()*.60,i*4+8,z);else if(i%2)pillar(g,x,y,.6+r()*.8,i%3!==0);
 }
 for(const [x,y] of [[48,177],[469,148],[570,230],[740,229],[810,200],[1236,220],[58,497],[542,506],[771,491],[1219,501]]){
 if(z<2){if(!stamp(g,'places',10,x,y+3,z===1?93:78))tree(g,x,y,1.04,Math.round(x),z);}
 else if(z===2){pillar(g,x,y,1.25,false);stone(g,x+15,y,z);}else tower(g,x,y,23,35,true);
 }
 for(let k=0;k<52;k++){
  const x=34+(k*139+z*17)%(W-68),y=k%2?77+(k*39)%79:485+(k*19)%67;
  if(Math.abs(x-riverX(y))<48||Math.hypot(x-north.x,y-north.y)<28||Math.hypot(x-south.x,y-south.y)<28)continue;
  if(z<=1){for(let j=0;j<4;j++){oval(g,'#43745a',x+j*6,y+4,6,5);oval(g,z?'#659e74':'#86ad61',x+j*6-1,y+1,5,4);rect(g,'#c3d987',x+j*6-2,y-2,3,1);}}
  else if(z===2)stone(g,x,y,z);
 }
 bridge(g);
 g.save();g.translate(bend,foot);g.scale(1,.56);g.translate(-655,-WORLD.road);bridge(g);g.restore();
 groundCache.set(key,c);return c;
}
function windowBox(g,x,y){
 rect(g,wood,x-7,y-10,15,14);rect(g,'#90c4b4',x-5,y-8,11,9);rect(g,'#d5ebc6',x-4,y-7,3,4);
 rect(g,'#76513f',x,y-8,2,10);rect(g,'#76513f',x-5,y-3,11,2);rect(g,'#f4cc92',x-8,y+3,17,3);
}
function roof(g,x,y,w,colors){
 const [dark,mid,hi]=colors;
 const a=x-w/2,b=x+w/2;
 poly(g,ink,[[a-6,y+2],[a+9,y-26],[b-11,y-33],[b+8,y+1],[b+8,y+6],[a-6,y+6]]);
 poly(g,dark,[[a-4,y+1],[a+10,y-24],[b-11,y-30],[b+6,y+1],[b+6,y+4],[a-4,y+4]]);
 for(let row=0;row<5;row++){
 const top=y-22+row*5,left=a+9-row*2,right=b-10+row*3;
 rect(g,mid,left,top,right-left,4);rect(g,hi,left,top,right-left,1);
 for(let xx=left+3+(row%2)*4;xx<right;xx+=9)rect(g,dark,xx,top+1,1,3);
 }
 rect(g,hi,a+12,y-25,w-22,3);
}
function building(g,o,z){
 const {x,y,type,width:w}=o;
 oval(g,'#374a4d42',x+4,y+2,w/2+4|0,6);
 const tile={inn:0,herbal:1,archive:2,armory:3,mill:4,hut:5,arch:6,gate:7,stall:8,tent:11,house:0,barn:4,tower:7,shrine:6}[type];
 if(tile!==undefined&&stamp(g,'places',tile,x,y+2,Math.round(w*(type==='mill'?1.65:type==='gate'?1.55:1.24)))){
   if(o.door){
     const a=x+w/2+8;rect(g,wood,a-2,y-14,4,16);rect(g,'#74503d',a-15,y-21,32,10);
     label(g,['POSADA','BOTICA','ARCHIVO','ARMERÍA'][z],a,y-14,'#ffebad',6);
   }
   return;
 }
 if(type==='tower'){tower(g,x-22,y,45,63,true);return;}
 if(type==='arch'||type==='gate'){
  const castle=type==='gate';for(const s of [-1,1]){const a=x+s*30;pillar(g,a,y,1.55,false);if(castle)tower(g,a-11,y-4,22,58,true);}
  rect(g,'#5e6570',x-34,y-59,68,12);rect(g,'#c5b99d',x-35,y-60,70,5);for(let k=-25;k<33;k+=11)rect(g,'#837c73',x+k,y-55,2,8);
  poly(g,castle?'#b4686a':'#629785',[[x-10,y-57],[x+9,y-57],[x+9,y-39],[x,y-32],[x-10,y-40]]);return;
 }
 if(type==='stall'){
  for(const a of [-23,22])rect(g,wood,x+a,y-35,4,35);
  rect(g,'#926243',x-28,y-15,57,15);rect(g,'#e8b47c',x-30,y-17,61,5);
  for(let j=0;j<7;j++){const a=x-29+j*8;rect(g,j%2?'#f3d49b':['#c96057','#4d988d','#c59155','#92739a'][z],a,y-39,8,12);rect(g,j%2?'#dec28e':'#9b6259',a,y-27,8,4);}
  for(let i=0;i<7;i++)oval(g,['#d9835d','#e3b864','#74a166'][i%3],x-20+i*7,y-19,4,3);return;
 }
 if(type==='tent'||type==='shrine'){
  poly(g,wood,[[x-w/2,y],[x-2,y-41],[x+w/2,y]]);poly(g,type==='tent'?'#d79d70':'#749f89',[[x-w/2+3,y-2],[x-3,y-40],[x+10,y-2]]);
  poly(g,'#544a49',[[x-7,y],[x,y-21],[x+9,y]]);line(g,cream,x,y-39,x+w/2+5,y,1);return;
 }
 const tall=type==='mill'?62:36;
 rect(g,ink,x-w/2,y-tall,w,tall);rect(g,['#efd7a4','#d5c296','#daceab','#c0b4a6'][z],x-w/2+2,y-tall+2,w-4,tall-4);
 rect(g,'#b29b81',x+w/2-11,y-tall+2,9,tall-3);
 for(let k=0;k<8;k++)rect(g,'#bc9d7a',x-w/2+4+(k*17)%(w-11),y-(k*7)%(tall-4)-3,5,2);
 for(const a of [-w/2+2,w/2-9])rect(g,wood,x+a,y-tall,4,tall);
 rect(g,'#916b53',x-w/2,y-4,w,4);
 rect(g,'#6c4b42',x+w/4-4,y-tall-38,10,25);rect(g,'#b68770',x+w/4-6,y-tall-39,14,5);
 const mush=type==='herbal'||type==='hut';
 if(mush){
  oval(g,'#535d5c',x,y-tall,w/2+7|0,22);oval(g,type==='herbal'?'#aa6e76':'#418684',x,y-tall-3,w/2+6|0,20);
  oval(g,type==='herbal'?'#d59a8a':'#79aa9b',x-5,y-tall-9,w/2-4|0,12);
  for(let j=0;j<8;j++){const xx=x-w/3+j*w/10;oval(g,'#e4d4aa',xx|0,(y-tall-6-Math.sin(j)*6)|0,3,2);}
 }else roof(g,x,y-tall,w,roofs[type]||roofs.house);
 rect(g,wood,x-8,y-24,17,24);rect(g,o.door?'#317579':'#774e3f',x-6,y-21,13,20);
 for(let j=0;j<3;j++)rect(g,'#ffffff22',x-5+j*4,y-19,1,16);
 rect(g,'#f6c96f',x+3,y-10,2,2);rect(g,'#e4c396',x-11,y,22,3);
 windowBox(g,x-w*.29,y-16);windowBox(g,x+w*.29,y-16);
 if(o.door){rect(g,'#593f35',x-17,y-tall+2,34,9);label(g,['POSADA','BOTICA','ARCHIVO','ARMERÍA'][z],x,y-tall+9,'#ffdf98',6);}
}
function barrel(g,x,y){
 oval(g,'#734f42',x,y-7,6,8);rect(g,'#bd8458',x-4,y-13,8,13);
 rect(g,'#716865',x-6,y-10,12,2);rect(g,'#716865',x-6,y-3,12,2);oval(g,'#d9a371',x,y-14,5,2);rect(g,'#ecc18b',x-2,y-13,1,9);
}
function prop(g,o,z,t){
 const {x,y,type}=o;switch(type){
 case 'barrels':barrel(g,x-4,y);barrel(g,x+7,y+2);break;
 case 'fence':for(let a=-29;a<32;a+=14){rect(g,wood,x+a,y-13,4,14);rect(g,lightWood,x+a,y-14,4,3);}rect(g,lightWood,x-30,y-9,63,3);break;
 case 'garden':for(let j=0;j<3;j++){rect(g,'#997958',x-29,y-14+j*7,58,4);for(let i=0;i<8;i++)blossom(g,x-26+i*7,y-14+j*7,z,i+j);}break;
 case 'well':case 'fountain':{
 if(type==='well'&&stamp(g,'places',9,x,y+2,45))break;
 const f=type==='fountain';oval(g,'#647777',x,y-5,f?21:15,8);rect(g,'#a4ada0',x-(f?19:13),y-15,f?38:26,11);oval(g,'#cdd0b2',x,y-15,f?21:15,7);oval(g,'#559c9e',x,y-16,f?15:10,4);
 if(f){rect(g,'#dfdfc7',x-3,y-34,6,18);oval(g,'#9fcac1',x,y-34,8,3);line(g,'#b5e4d5',x,y-34,x+8,y-17,1);}
 else {for(const a of [-12,10])rect(g,wood,x+a,y-40,3,25);roof(g,x,y-35,28,roofs.house);}break;}
 case 'cart':rect(g,wood,x-13,y-15,27,12);for(let j=0;j<3;j++)rect(g,lightWood,x-12,y-14+j*4,25,2);for(const a of [-8,8]){oval(g,ink,x+a,y,5,5);oval(g,lightWood,x+a,y,2,2);}break;
 case 'hay':for(let i=0;i<3;i++){rect(g,'#b8904d',x-12+i*6,y-11-(i%2)*4,13,12);rect(g,'#efd486',x-12+i*6,y-11-(i%2)*4,13,3);}break;
 case 'mushrooms':for(let i=0;i<5;i++){const a=x-10+i*5,b=y-i%3*4;rect(g,'#ddcfb6',a-1,b-6,3,6);oval(g,i%2?'#c88ca6':'#8bcab9',a,b-7,4+i%2,3);rect(g,cream,a-1,b-9,2,1);}break;
 case 'lantern':rect(g,wood,x-2,y-28,4,29);rect(g,wood,x-2,y-29,11,3);rect(g,ink,x+6,y-26,7,10);rect(g,'#f8ce75',x+7,y-24,5,6);break;
 case 'banners':rect(g,wood,x-2,y-39,3,40);poly(g,'#a35e77',[[x,y-37],[x+18,y-35],[x+16,y-17],[x+8,y-21],[x,y-19]]);rect(g,'#e0c189',x+6,y-33,3,11);break;
 case 'rack':for(const a of [-10,0,10]){rect(g,'#c3d2cf',x+a,y-27,3,22);rect(g,lightWood,x+a-3,y-12,9,2);}rect(g,wood,x-14,y-7,31,4);break;
 case 'mosaic':for(let i=0;i<6;i++)for(let j=0;j<3;j++)rect(g,(i+j)%2?'#8ca59b':'#d3c59e',x-15+i*5,y-6+j*4,4,3);break;
 case 'shrine':building(g,{...o,width:42},z);break;
 default:pillar(g,x,y,type==='obelisk'?1:.8,type==='pillar');break;
 }
}
function villager(g,n,t){
 const {x,y,style}=n, b=Math.sin(t*3+style)>.5?1:0;
 const resident=[0,4,1,5,1,4,2,6,0,3,7,6][style%12];
 const cell=resident<4?resident:resident+4;
 if(stamp(g,'people',cell,x,y-b,35+(style%4===3?3:0),Math.sin(t*.49+style*.7)<-.35?-1:1))return;
 const coat=['#417d86','#ae705d','#a381b2','#77a581','#c39b65','#748ca5'][style%6];
 g.save();g.translate(Math.round(x),Math.round(y));oval(g,'#334c4c66',0,0,9,3);
 rect(g,ink,-5,-5,4,6-b);rect(g,ink,2,-5,4,5+b);
 poly(g,ink,[[-5,-20],[4,-20],[9,-14],[7,-4],[-8,-4],[-8,-13]]);rect(g,coat,-6,-17,12,12);
 rect(g,'#ebc295',-8,-13,3,6);rect(g,'#efd1a4',6,-12,3,5);rect(g,'#ffe0ad',-1,-17,3,9);
 oval(g,'#694d44',0,-23,7,7);rect(g,'#eac199',-5,-26,10,9);rect(g,ink,1,-23,2,2);
 if(style%3===0){oval(g,'#b4804a',0,-29,10,3);oval(g,'#edc777',0,-31,6,4);rect(g,coat,-6,-29,12,2);}
 else if(style%3===1){oval(g,'#efe0c2',-2,-28,7,5);rect(g,'#efe0c2',-7,-28,4,7);}
 else{oval(g,coat,-1,-29,8,4);rect(g,'#e7bc72',-7,-27,14,2);}g.restore();
}
function windmill(g,x,y,t){
 if(atlasReady('places')){
  for(let j=0;j<4;j++){const k=(t*.6+j*.25)%1;rect(g,'#eee4c777',x+26+k*12,y-87-k*21,2+k*5,2+k*3);}
  return;
 }
 const cx=x,cy=y-68;
 for(let j=0;j<4;j++){const a=t*.68+j*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
 const pt=(r,o)=>[Math.round(cx+c*r-s*o),Math.round(cy+s*r+c*o)];
 poly(g,'#826245',[pt(3,-2),pt(38,-2),pt(38,7),pt(13,7)]);poly(g,'#f4dfa2',[pt(13,0),pt(36,0),pt(36,5),pt(15,5)]);
 for(let k=16;k<36;k+=5){const [a,b]=pt(k,0),[u,v]=pt(k,5);line(g,'#b59a69',a,b,u,v);}
 }oval(g,'#89613e',cx,cy,4,4);rect(g,'#f1cd8e',cx-2,cy-2,3,3);
}
function room(g,z){
 const wall=['#b09670','#668881','#96978e','#746d89'][z];rect(g,'#343947',0,0,640,336);rect(g,wall,113,32,414,104);
 for(let y=37;y<129;y+=13)for(let x=113+(y%2)*10;x<521;x+=24)rect(g,'#ffffff20',x,y,19,2);
 rect(g,'#604e47',111,122,418,167);
 for(let j=0;j<12;j++)for(let i=0;i<10;i++)rect(g,(i+j)%3?'#bb946c':'#cba479',113+i*42-(j%2)*0,126+j*13,40,12);
 rect(g,'#a75f59',279,180,81,92);for(const x of [282,353])rect(g,'#e2b57e',x,180,3,91);
 for(const x of [175,457]){windowBox(g,x,82);rect(g,wood,x-30,115,61,7);
 for(let i=0;i<7;i++){const h=9+i%3*3;rect(g,['#a76262','#648887','#dbaf75'][i%3],x-24+i*7,115-h,5,h);}}
 rect(g,wood,295,130,80,24);rect(g,'#d8b082',292,128,86,6);
 if(z===0){rect(g,wood,143,175,63,37);rect(g,'#5f9393',146,178,57,28);rect(g,cream,146,177,55,8);}
 if(z===1)for(let i=0;i<5;i++){oval(g,['#bf7688','#689d85','#d2a556'][i%3],306+i*12,123,4,6);rect(g,cream,304+i*12,115,4,3);}
 if(z===2)for(let i=0;i<4;i++)rect(g,'#f0d4a3',302+i*15,123-i%2*4,12,6);
 if(z===3)prop(g,{x:409,y:195,type:'rack'},z,0);
 barrel(g,485,189);barrel(g,472,194);rect(g,'#403e45',303,272,32,15);label(g,'SALIDA',319,286,cream,7);
}
export function drawWorld(g,game,drawHero,drawFoe){
 const {hero:h,data:d,time:t}=game,z=d.zone,w=worlds[z];
 if(d.inside){room(g,z);villager(g,{x:335,y:151,style:z*3},t);drawHero();const a=interaction(game);if(a)label(g,'J · '+a.title,h.x,h.y-46);return;}
 const cx=Math.round(clamp(h.x-307,0,WORLD.width-640)),cy=Math.round(clamp(h.y-181,0,WORLD.height-336));
 g.save();g.translate(-cx,-cy);g.drawImage(terrain(z),cx,cy,640,336,cx,cy,640,336);
 for(let i=0;i<18;i++){const y=(i*35+t*10)%WORLD.height;if(Math.abs(y-314)>26&&Math.abs(y-footbridges[z])>15){const x=riverX(y)+Math.sin(i*9+t*.8)*18;rect(g,'#cef0ce',x,y,5,1);}}
 const entries=[...w.houses,...w.props,...w.people.map((n,i)=>townsperson(n,t,i)),{...w.chest,type:'chest'},{...h,type:'hero'}];
 discoveries[z].forEach((a,i)=>{if(!d.found.includes(z*2+i))entries.push({...a,type:'relic'});});
 if(!d.cleared.includes(z))entries.push({...game.patrol,type:'guardian'});if(!d.scouts.includes(z))entries.push({...game.scout,type:'scout'});
 sign(g,33,333,'left','OESTE');sign(g,WORLD.width-37,333,'right','ESTE');
 for(const o of entries.sort((a,b)=>a.y-b.y)){
 if(o.x<cx-95||o.x>cx+735||o.y<cy-10||o.y>cy+467)continue;
 if(o.type==='hero')drawHero();
 else if(o.type==='guardian'||o.type==='scout')drawFoe(o,o.type==='scout');
 else if(o.type==='npc')villager(g,o,t);
 else if(o.type==='chest')chest(g,o.x,o.y,d.opened.includes(z));
 else if(o.type==='relic'){oval(g,'#596555',o.x,o.y,7,3);oval(g,['#e8b65e','#a8cf8a','#c38965','#9b9cb5'][z],o.x,o.y-5,5,6);rect(g,cream,o.x-2,o.y-9,2,3);label(g,'✦',o.x+5,o.y-13+Math.sin(t*3)*2,'#ffdc78',8);}
 else if(w.houses.includes(o)){building(g,o,z);if(o.type==='mill')windmill(g,o.x,o.y,t);}
 else prop(g,o,z,t);
 }
 for(let i=0;i<9;i++){const x=(i*143+Math.sin(t*.55+i)*18+86)%WORLD.width,y=195+((i*53)%285)+Math.sin(t*1.3+i)*7;
 if(z===1||i%3===0){rect(g,z===1?'#f7d786':'#ffdaa1',x,y,3,2);rect(g,'#fff2be',x+2,y+Math.sin(t*10+i)*2,2,1);}}
 const a=interaction(game);if(a)label(g,'J · '+a.title,h.x,h.y-48,cream,9);
 g.restore();
}
export function drawMinimap(g,game){
 const d=game.data,z=d.zone;if(d.inside)return;
 const gx=568,gy=300,w=64,h=29;
 rect(g,'#343e48',gx-2,gy-2,w+4,h+4);rect(g,'#b29e76',gx-1,gy-1,w+2,h+2);rect(g,'#526c5d',gx,gy,w,h);
 rect(g,'#70b3ab',gx+30,gy,3,h);rect(g,'#c3b182',gx,gy+14,w,2);
 const dot=(o,c)=>rect(g,c,gx+o.x/WORLD.width*(w-3),gy+o.y/WORLD.height*(h-3),3,3);
 dot(worlds[z].houses[0],'#f2cc89');if(!d.opened.includes(z))dot(game.chest,'#d7a659');if(!d.cleared.includes(z))dot(game.patrol,'#ef8070');dot(game.hero,'#f8fff2');
}
export function arenaScenery(g,z,t){
 const place=[{type:'mill',x:100,y:109,width:64},{type:'herbal',x:70,y:106,width:64},{type:'arch',x:90,y:112,width:67},{type:'gate',x:320,y:112,width:91}][z];
 building(g,place,z);if(z===0)windmill(g,place.x,place.y+10,t);
 for(const [x,kind] of [[505,['hay','mushrooms','obelisk','banners'][z]],[568,['fence','lantern','pillar','rack'][z]]])prop(g,{type:kind,x,y:115},z,t);
}
