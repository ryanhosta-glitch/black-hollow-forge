// Forge visual layer: non-destructive, UV coordinates from local mesh geometry.
// Mesh vertex colors and source GLB geometry are retained as fallbacks.
export function createSurfaceFidelity(THREE,{mobile=false}={}){
 const cache=new Map(),size=mobile?256:512;
 function rand(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)}
 function makeTexture(kind){const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d'),r=rand(kind.split('').reduce((a,c)=>Math.imul(a,33)+c.charCodeAt(0),932)>>>0);const n=size;
 const backgrounds={slate:'#363c46',stone:'#77706a',marble:'#bbb2aa',brass:'#75603c',iron:'#343338',wood:'#56372a',damask:'#4a293d'};
 ctx.fillStyle=backgrounds[kind]||'#666';ctx.fillRect(0,0,n,n);
 if(kind==='slate'){
  const h=n/12,w=n/6;for(let y=0;y<12;y++)for(let x=-1;x<7;x++){
   const xx=(x+(y%2)*.5)*w;const p=Math.floor(r()*17)-8;
   ctx.fillStyle=`rgb(${56+p},${63+p},${75+p})`;ctx.fillRect(xx+1,y*h+1,w-2,h-2);
   ctx.strokeStyle='#13182499';ctx.lineWidth=1.5;ctx.strokeRect(xx+.5,y*h+.5,w-1,h-1);
  }
 }else if(kind==='stone'){
  const h=n/9,w=n/5;for(let y=0;y<9;y++)for(let x=-1;x<6;x++){
   const xx=(x+(y%2)*.5)*w,p=Math.floor(r()*30)-15;
   ctx.fillStyle=`rgb(${121+p},${114+p},${107+p})`;ctx.fillRect(xx+2,y*h+2,w-4,h-4);
   ctx.strokeStyle='#3a3431';ctx.strokeRect(xx+1.5,y*h+1.5,w-3,h-3);
  }
 }else if(kind==='wood'){
  for(let x=0;x<n;x+=n/8){ctx.strokeStyle='#1b0b0a55';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,n);ctx.stroke()}
  for(let i=0;i<320;i++){const x=r()*n,phase=r()*7;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=n;y+=12)ctx.lineTo(x+Math.sin(y*.04+phase)*(2+r()*2),y);ctx.strokeStyle=i%4===0?'#c09b6b30':'#170d0a3c';ctx.lineWidth=.4+r()*1.2;ctx.stroke()}
 }else if(kind==='damask'){
  const step=n/6;ctx.strokeStyle='#bd92704a';ctx.lineWidth=2;for(let y=step*.5;y<n;y+=step)for(let x=step*.5;x<n;x+=step){ctx.beginPath();ctx.moveTo(x,y-step*.37);ctx.bezierCurveTo(x+step*.29,y-step*.3,x+step*.31,y+step*.2,x,y+step*.32);ctx.bezierCurveTo(x-step*.31,y+step*.2,x-step*.29,y-step*.3,x,y-step*.37);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,step*.12,step*.24,0,0,Math.PI*2);ctx.stroke()}
 }else if(kind==='marble'){
  for(let i=0;i<90;i++){const x=r()*n,y=r()*n;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+n*.09,y-n*.06,x+n*.2,y+n*.1,x+n*.37,y+n*.03);ctx.strokeStyle=i%3?'#f5eee653':'#5f5b5b49';ctx.lineWidth=.4+r()*1.5;ctx.stroke()}
 }else if(kind==='brass'||kind==='iron'){
  for(let i=0;i<1500;i++){const x=r()*n,y=r()*n;ctx.fillStyle=kind==='brass'?(r()>.5?'#cfb27a13':'#1d170d20'):(r()>.5?'#8b8d9512':'#0b0b101e');ctx.fillRect(x,y,1+r()*3,1+r()*2)}
 }
 for(let i=0;i<Math.floor(n*n/130);i++){ctx.fillStyle=r()>.5?'#ffffff0a':'#0000000a';ctx.fillRect(r()*n,r()*n,1+r()*3,1+r()*3)}
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=mobile?2:4;t.needsUpdate=true;return t;
 }
 function material(kind){if(cache.has(kind))return cache.get(kind);const m=new THREE.MeshStandardMaterial({map:makeTexture(kind),roughness:({marble:.31,brass:.36,iron:.71,wood:.64,slate:.87,stone:.94,damask:.91})[kind]||.8,metalness:({brass:.76,iron:.58,slate:.04})[kind]||0,side:THREE.DoubleSide});cache.set(kind,m);return m}
 function kindFor(name){name=(name||'').toLowerCase();if(/glass|glazing|window-pane/.test(name))return null;if(/brass|gild|gold|finial|chandelier|crest/.test(name))return 'brass';if(/iron|rail|baluster|grille/.test(name))return 'iron';if(/marble|lion|statue/.test(name))return 'marble';if(/damask|wallpaper/.test(name))return 'damask';if(/roof|slate|mansard|shingle/.test(name))return 'slate';if(/wood|mahogany|wainscot|bookcase|parquet|cabinet|plank|trim/.test(name))return 'wood';if(/stone|wall|masonry|buttress|pier|frieze|tracery|arch|column|cornice/.test(name))return 'stone';return null}
 function ensureUV(mesh,kind){const g=mesh.geometry;if(g.getAttribute('uv'))return;const p=g.getAttribute('position');if(!p)return;
  // Project along the most appropriate local plane, preserving authored mesh geometry.
  const bounds=new THREE.Box3().setFromBufferAttribute(p),d=bounds.getSize(new THREE.Vector3());
  const out=new Float32Array(p.count*2);let axes;
  if(kind==='slate'||/floor|tread|slab|roof/i.test(mesh.name))axes=[0,2];
  else if(d.x<=d.y&&d.x<=d.z)axes=[2,1];else if(d.z<=d.y&&d.z<=d.x)axes=[0,1];else axes=[0,2];
  const scale=kind==='damask'?1.25:kind==='slate'?1.75:kind==='stone'?1.1:kind==='wood'?1.3:.75;
  for(let i=0;i<p.count;i++){out[i*2]=p.getX(i)*(axes[0]===0?scale:0)+p.getY(i)*(axes[0]===1?scale:0)+p.getZ(i)*(axes[0]===2?scale:0);out[i*2+1]=p.getX(i)*(axes[1]===0?scale:0)+p.getY(i)*(axes[1]===1?scale:0)+p.getZ(i)*(axes[1]===2?scale:0)}
  mesh.geometry=g.clone();mesh.geometry.setAttribute('uv',new THREE.BufferAttribute(out,2));mesh.userData.forgeGeneratedUV=true;
 }
 function apply(root){let counts={textured:0,projected:0};root.traverse(o=>{if(!o.isMesh)return;const kind=kindFor(o.name);if(!kind)return;if(!o.userData.forgeOriginalMaterial)o.userData.forgeOriginalMaterial=o.material;const before=!!o.geometry.getAttribute('uv');ensureUV(o,kind);if(!before&&o.geometry.getAttribute('uv'))counts.projected++;o.material=material(kind);counts.textured++});return counts}
 function restore(root){root.traverse(o=>{if(o.isMesh&&o.userData.forgeOriginalMaterial)o.material=o.userData.forgeOriginalMaterial})}
 return {apply,restore,kindFor,quality:mobile?'mobile-256':'desktop-512',provenance:'Forge texture upgrade; original Black Hollow bridge retained for compatibility'};
}
