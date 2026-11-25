const sheets=new Map();
const materials=new Map();

export async function loadAtlas(name,url,columns=4,rows=4){
 const image=new Image();
 image.src=url;
 await image.decode();
 if(image.width%columns||image.height%rows)throw new Error('Atlas desalineado: '+name);
 sheets.set(name,{image,columns,width:image.width/columns,height:image.height/rows});
}

export function tile(g,name,index,x,y,width,height,mirror=false){
 const sheet=sheets.get(name);
 if(!sheet)return;
 const {image,columns,width:w,height:h}=sheet;
 x=Math.round(x);y=Math.round(y);width=Math.round(width??w);height=Math.round(height??h);
 g.imageSmoothingEnabled=false;
 if(mirror){g.save();g.translate(x+width,y);g.scale(-1,1);x=0;y=0;}
 g.drawImage(image,index%columns*w,Math.floor(index/columns)*h,w,h,x,y,width,height);
 if(mirror)g.restore();
}

export function stamp(g,name,index,x,y,size,face=1,height=size){
 tile(g,name,index,Math.round(x)-Math.floor(size/2),Math.round(y)-height,size,height,face<0);
}

export function tilePart(g,name,index,[sx,sy,sw,sh],x,y,width,height){
 const sheet=sheets.get(name);
 if(!sheet)return;
 const {image,columns,width:w,height:h}=sheet;
 g.imageSmoothingEnabled=false;
 g.drawImage(image,index%columns*w+sx,Math.floor(index/columns)*h+sy,sw,sh,x,y,width,height);
}

// Each animated sheet contains native-resolution poses on equal transparent cells.
// Drawing a whole cell at 1:1 avoids resampling a face or changing its width per frame.
export function nativeActor(g,name,index,x,y,face=1){
 const sheet=sheets.get(name);
 if(sheet)stamp(g,name,index,x,y,sheet.width,face,sheet.height);
}

export function material(g,index){
 if(!materials.has(index)){
  const sheet=sheets.get('tiles');if(!sheet)throw new Error('Faltan las texturas de terreno');
  const c=Object.assign(document.createElement('canvas'),{width:sheet.width,height:sheet.height});
  tile(c.getContext('2d'),'tiles',index,0,0);
  materials.set(index,c);
 }
 return g.createPattern(materials.get(index),'repeat');
}

