// Uniform atlas cells are bottom-centred for depth sorting by the actors' feet.
const atlases={};
export async function loadAtlas(name,url){
 const img=new Image();img.src=url;await img.decode();atlases[name]=img;
}
export function stamp(g,name,index,x,y,size,face=1,height=size){
 const image=atlases[name];if(!image)return false;
 g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(y));g.scale(face<0?-1:1,1);
 g.drawImage(image,(index%4)*128,Math.floor(index/4)*128,128,128,-Math.round(size/2),-height,size,height);
 g.restore();return true;
}
export function atlasReady(name){return !!atlases[name];}

