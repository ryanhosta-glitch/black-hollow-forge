/** Black Hollow Forge 2.5 — reusable, dimensional Victorian furniture.
 * Build meshes at local floor Y=0; no .haunt geometry modification or automatic placement.
 * Furniture MAY repeat within a house. Portrait allocation is a separate unique-art policy.
 */
export const FURNITURE_CATALOG=Object.freeze({
 bookcase:{label:'Carved Bookcase',footprint:[1.52,.45],height:2.34,rooms:['library','study','gallery'],repeatable:true},
 writing_desk:{label:'Victorian Writing Desk',footprint:[1.52,.74],height:.79,rooms:['study','library','bedroom'],repeatable:true},
 armchair:{label:'Tufted Armchair',footprint:[.86,.87],height:1.19,rooms:['library','parlor','study','bedroom'],repeatable:true},
 settee:{label:'Tufted Velvet Settee',footprint:[1.84,.85],height:1.19,rooms:['parlor','ballroom','gallery'],repeatable:true},
 dining_table:{label:'Carved Dining Table',footprint:[2.14,1.05],height:.77,rooms:['dining','banquet','ballroom'],repeatable:true},
 wardrobe:{label:'Tall Carved Wardrobe',footprint:[1.49,.67],height:2.17,rooms:['bedroom','nursery','dressing'],repeatable:true}
});
// Reuse finish maps across repeated furnishings rather than allocating per chair.
const finishCache=new WeakMap();
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(+n)?+n:a));
export function createVictorianFurniture(THREE,{type='bookcase',age=.32,variant=0,quality='standard'}={}){
 if(!FURNITURE_CATALOG[type])throw Error('Unknown furniture type '+type);
 const root=new THREE.Group();root.name='forge-furniture-'+type;
 const wear=clamp(age,0,1);const detail=quality==='mobile'?0:1;
 const mat=(color,metal=.0,rough=.65)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:clamp(rough+wear*.13,.1,1)});
 const walnut=mat(0x39251b,.04,.53),edge=mat(0x65412b,.05,.58),dark=mat(0x231811,.07,.65),brass=mat(0x9e8448,.72,.41),velvet=mat(variant%2===0?0x50253a:0x29443f,.02,.87),tuft=mat(variant%2===0?0x6b3649:0x3a5955,.02,.83),leather=mat(0x593321,.02,.74),paper=mat(0xb1a081,0,.9);
 // Lightweight deterministic procedural texture, no external images or per-frame regeneration.
 const makeGrain=(kind)=>{if(typeof document==='undefined')return null;let cache=finishCache.get(THREE);if(!cache){cache=new Map();finishCache.set(THREE,cache)}const key=kind+':'+((variant|0)%8);if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=128;
  const ctx=c.getContext('2d');if(!ctx)return null;const img=ctx.createImageData(128,128);let state=101+(variant|0)*31;
  const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;
   let shade=kind==='wood'?(.77+.11*Math.sin(x*.38+Math.sin(y*.028)*1.6)+.10*(random()-.5)):(.90+.07*(random()-.5));
   const v=Math.round(255*Math.max(.55,Math.min(1,shade)));img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;
  }ctx.putImageData(img,0,0);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,2);tex.anisotropy=quality==='mobile'?2:4;cache.set(key,tex);return tex;
 };
 const grain=makeGrain('wood'),weave=makeGrain('fabric');
 if(grain){for(const m of [walnut,edge,dark])m.map=grain;for(const m of [velvet,tuft])m.map=weave;}
 velvet.roughness=Math.min(1,velvet.roughness+.06);tuft.roughness=Math.min(1,tuft.roughness+.06);
 brass.metalness=.72;brass.roughness=Math.min(.65,.30+wear*.18);
 if(grain){for(const m of [walnut,edge,dark]){m.bumpMap=grain;m.bumpScale=.006;m.roughness=Math.max(.32,m.roughness-.12)}}
 if(weave){for(const m of [velvet,tuft]){m.bumpMap=weave;m.bumpScale=.004}}

 const add=(geo,m,name,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geo,m);mesh.position.set(x,y,z);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh};
 const box=(name,x,y,z,w,h,d,m)=>add(new THREE.BoxGeometry(w,h,d),m,name,x,y,z);
 const orb=(name,x,y,z,r,m)=>add(new THREE.SphereGeometry(r,10,7),m,name,x,y,z);
 const leg=(name,x,z,h=.69,wide=.075)=>{const a=add(new THREE.CylinderGeometry(wide*.61,wide,h,8),walnut,name,x,h/2,z);a.rotation.z=(x<0?-.045:.045);orb('turned-leg-knee',x,h*.64,z,wide*.82,edge)};
 const molding=(name,x,y,z,w,d)=>{box(name,x,y,z,w,.035,d,edge);if(detail)box(name+'-gilt-inlay',x,y+.022,z,w*.96,.009,d*.96,brass)};
 const handle=(x,y,z)=>{orb('brass-knob',x,y,z,.019,brass);if(detail)box('keyhole',x-.055,y,z,.014,.033,.006,dark)};
 const feet=(width,depth,height=.68)=>{for(const x of [-1,1])for(const z of [-1,1])leg('turned-foot',x*(width*.5-.08),z*(depth*.5-.08),height)};
 const padded=(prefix,w,d,y,back=false)=>{box(prefix+'-core',0,y,0,w,.145,d,velvet);box(prefix+'-piping-front',0,y-.023,d*.5,w,.026,.023,tuft); if(detail){for(let x=-w*.37;x<w*.4;x+=.17){orb(prefix+'-button',x,y+.08,0,.013,brass)}}};
 if(type==='bookcase'){
  const w=1.52,d=.45,h=2.34;
  box('carcass-left',-w/2+.052,h/2,0,.104,h,d,walnut);box('carcass-right',w/2-.052,h/2,0,.104,h,d,walnut);
  box('panelled-back',0,h/2,-d/2+.018,w-.19,h-.12,.036,dark);box('base',0,.075,0,w,.15,d+.07,edge);
  box('carved-cornice',0,h-.07,0,w+.13,.14,d+.13,edge);molding('cornice-edge',0,h-.15,0,w+.17,d+.15);
  for(let s=0;s<5;s++){const y=.29+s*.42;box('bookshelf-'+s,0,y,0,w-.11,.047,d,walnut);
   for(let i=0;i<12;i++){const bw=.042+((i*7+s*5)%5)*.004,bh=.22+((i*3+s)%5)*.027;const x=-.61+i*.109;
    const colors=[0x58352d,0x46534f,0x6b4e2c,0x313f54,0x51402c];const cover=mat(colors[(i+s)%colors.length],0,.8);
    box('individual-book-spine',x,y+.026+bh/2,-.015,bw,bh,.27,cover);
    if(detail)box('book-gilt-spine',x,y+.03+bh*.68,.126,bw*.8,.009,.005,brass);
   }
  }
  for(const x of [-.67,.67]){box('carved-stile',x,h*.52,d*.50,.055,h*.85,.035,edge);if(detail)for(let j=0;j<3;j++)orb('carved-rosette',x,.38+j*.78,d*.52,.033,brass)}
 }else if(type==='writing_desk'){
  feet(1.44,.65,.68);box('writing-surface',0,.75,0,1.55,.08,.77,walnut);molding('desktop-bevel',0,.81,0,1.62,.79);
  box('front-apron',0,.61,.354,1.29,.17,.065,edge);
  for(let i=-1;i<=1;i++){box('drawer-front',i*.395,.63,.392,.348,.139,.025,walnut);handle(i*.395,.635,.413)}
  box('raised-writing-hutch-back',0,.90,-.328,1.18,.20,.085,edge);
  box('leather-writing-inlay',0,.817,.065,1.01,.008,.44,leather);
  if(detail){box('closed-ledger',-.36,.843,.04,.31,.031,.23,paper);orb('inkstand',.44,.86,-.22,.063,brass)}
 }else if(type==='armchair'||type==='settee'){
  const wide=type==='settee'?1.84:.86,depth=.85;
  feet(wide-.06,depth-.08,.36);box('mahogany-seat-base',0,.43,0,wide,.15,depth,walnut);
  padded('velvet-seat',wide-.12,depth-.14,.535);
  box('curved-back-foundation',0,.89,-depth/2+.085,wide-.09,.62,.145,edge);
  box('upholstered-back',0,.90,-depth/2+.002,wide-.22,.52,.07,velvet);
  for(const x of [-1,1]){box('arm-support',x*(wide/2-.105),.72,.07,.12,.38,.10,walnut);box('padded-armrest',x*(wide/2-.085),.91,.055,.17,.09,.62,velvet);orb('arm-scroll',x*(wide/2-.085),.91,.37,.082,edge)}
  if(detail){for(let x=-wide*.38;x<wide*.4;x+=.19){for(let j=0;j<2;j++)orb('upholstery-tuft',x,.78+j*.22,-depth/2+.049,.012,brass)}}
 }else if(type==='dining_table'){
  box('solid-mahogany-top',0,.724,0,2.14,.086,1.05,walnut);molding('beveled-edge',0,.781,0,2.25,1.15);
  for(const x of [-.82,.82]){leg('turned-table-leg',x,-.37,.69,.093);leg('turned-table-leg',x,.37,.69,.093)}
  box('long-apron',0,.61,.45,1.74,.14,.055,edge);box('long-apron-back',0,.61,-.45,1.74,.14,.055,edge);
  if(detail)for(let x=-.72;x<=.72;x+=.24)orb('apron-rosette',x,.60,.488,.015,brass);
 }else if(type==='wardrobe'){
  const w=1.49,h=2.17,d=.67;
  box('cabinet-body',0,h/2,0,w,h,d,walnut);box('plinth',0,.08,.015,w+.09,.16,d+.09,dark);
  box('carved-wardrobe-crown',0,h-.065,0,w+.19,.13,d+.17,edge);molding('top-crown-bevel',0,h-.14,0,w+.21,d+.19);
  for(const s of [-1,1]){const x=s*.345;box('recessed-door-panel',x,1.12,d/2+.019,.63,1.67,.032,dark);
   box('raised-wood-door',x,1.12,d/2+.042,.54,1.56,.033,edge);
   for(const k of [-1,1])box('door-panel-molding',x+k*.24,1.12,d/2+.065,.026,1.49,.029,walnut);
   box('door-horiz-rail',x,.47,d/2+.068,.54,.027,.025,walnut);box('door-horiz-rail',x,1.75,d/2+.068,.54,.027,.025,walnut);
   handle(s*.074,1.10,d/2+.093);
  }
  for(let s of [-1,1])orb('carved-feet',s*.63,.085,d*.25,.08,dark);
 }
 root.userData={type:'black-hollow.furniture',furnitureType:type,repeatable:true,uniqueArt:false,age:wear,variant,placementCertified:false,interactive:false};
 return root;
}
/** One constructor per repeat; independently position meshes while geometry may be shared by renderer. */
export function buildFurnitureShowcase(THREE,{age=.32,quality='standard'}={}){
 const group=new THREE.Group();const names=Object.keys(FURNITURE_CATALOG);
 for(let i=0;i<names.length;i++){
  const obj=createVictorianFurniture(THREE,{type:names[i],age,quality,variant:i});
  obj.position.set((i%3-1)*3,0,Math.floor(i/3)*3-1.5);group.add(obj);
 }
 return group;
}
export function chooseReusableFurniture(roomType,{seed=1,maxItems=5}={}){
 const choices=Object.entries(FURNITURE_CATALOG).filter(([,d])=>d.rooms.includes(roomType));
 let state=seed>>>0;const rand=()=>((state=(1664525*state+1013904223)>>>0)/4294967296);
 const result=[];for(let i=0;i<Math.max(0,Math.min(20,maxItems))&&choices.length;i++)result.push(choices[Math.floor(rand()*choices.length)][0]);
 return result; // repetitions allowed deliberately. Does not position or spawn anything.
}
