// Black Hollow architectural decay decals. Viewer-only, non-colliding; no changes to authored geometry.
export function createArchitecturalDecay(THREE, scene){
 const layer=new THREE.Group();layer.name='Forge_Architectural_Decay_Overlays';scene.add(layer);
 const cache=new Map();let enabled=true, current=null;
 const hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h>>>0};
 function texture(type,seed){const key=type+seed;if(cache.has(key))return cache.get(key);let x=hash(key);const rnd=()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.clearRect(0,0,256,256);
 if(type==='damp'||type==='leak'){
  for(let k=0;k<9;k++){const px=(.12+rnd()*.76)*256,py=(type==='leak'?.09:.55)*256+rnd()*40,r=30+rnd()*85;
   const grad=g.createRadialGradient(px,py,2,px,py,r);grad.addColorStop(0,'rgba(40,35,26,.31)');grad.addColorStop(.47,'rgba(54,47,38,.19)');grad.addColorStop(1,'rgba(68,55,38,0)');g.fillStyle=grad;g.fillRect(px-r,py-r,2*r,2*r)}
 }else if(type==='peel'){
   for(let k=0;k<15;k++){const px=25+rnd()*206,py=8+rnd()*240,w=9+rnd()*28,h=6+rnd()*44;g.beginPath();g.moveTo(px,py);g.lineTo(px+w,py-3);g.lineTo(px+w*(.3+rnd()*.45),py+h);g.closePath();g.fillStyle=`rgba(170,149,111,${(.06+rnd()*.18).toFixed(3)})`;g.fill();g.strokeStyle='rgba(43,34,27,.23)';g.lineWidth=1;g.stroke()}
 }else if(type==='dust'){
   for(let k=0;k<380;k++){const px=rnd()*256,py=rnd()*256,r=.3+rnd()*2;g.fillStyle=`rgba(181,169,145,${(.025+rnd()*.07).toFixed(3)})`;g.beginPath();g.arc(px,py,r,0,Math.PI*2);g.fill()}
 }else if(type==='tarnish'){
   for(let k=0;k<95;k++){const px=rnd()*256,py=rnd()*256,r=2+rnd()*14;let grad=g.createRadialGradient(px,py,0,px,py,r);grad.addColorStop(0,'rgba(20,52,45,.22)');grad.addColorStop(1,'rgba(10,40,30,0)');g.fillStyle=grad;g.fillRect(px-r,py-r,2*r,2*r)}
 }
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;cache.set(key,t);return t;}
 function add(type,seed,w,h,px,py,pz,rotation,opacity=.8){const mat=new THREE.MeshBasicMaterial({map:texture(type,seed),transparent:true,depthWrite:false,side:THREE.DoubleSide,opacity,polygonOffset:true,polygonOffsetFactor:-2});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.name='Forge_Decay_'+type;m.position.set(px,py,pz);m.rotation.y=rotation;m.renderOrder=2;layer.add(m)}
 function enter(room,level=0,profile=null){clear();if(!room?.boundsFeet)return;const b=room.boundsFeet,k=.3048;const x=b.x*k,z=b.y*k,w=b.l*k,d=b.w*k,h=b.h*k;const strength=Math.max(0,Math.min(1,profile?.decayIntensity??.35));const seed=hash(room.id);const kind=String(profile?.profile||'').toLowerCase();const moist=/crypt|basement|cellar|burial|conservatory|wash|bath|damp|water|greenhouse/.test(kind+' '+room.name.toLowerCase());
 const wallW=Math.min(w*.72,2.6),wallH=Math.min(h*.70,2.2),y=level+Math.min(h*.52,h-.4);
 // Non-structural wall-aligned artwork, placed slightly inside room boundaries.
 add(moist?'damp':'peel',seed,wallW,wallH,x+w*.5,y,z+.025,0,.35+.42*strength);
 add('peel',seed+2,Math.min(d*.55,2.2),wallH,x+.025,y,z+d*.5,Math.PI/2,.25+.32*strength);
 if(strength>.42)add('leak',seed+7,Math.min(w*.53,2),Math.min(h*.48,1.4),x+w*.35,level+h*.70,z+d-.027,Math.PI,.20+.36*strength);
 // Dust deposits are on floor planes; renderOrder is visual-only and never blocks collision.
 if(strength>.25){const mat=new THREE.MeshBasicMaterial({map:texture('dust',seed+9),transparent:true,depthWrite:false,side:THREE.DoubleSide,opacity:.30+.38*strength,polygonOffset:true,polygonOffsetFactor:-2});const m=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w*.75,4),Math.min(d*.75,4)),mat);m.rotation.x=-Math.PI/2;m.position.set(x+w*.52,level+.014,z+d*.49);m.name='Forge_Decay_FloorDust';layer.add(m)}
 layer.visible=enabled;current={id:room.id,intensity:strength,moist,decals:layer.children.length};return current;}
 function clear(){for(const m of [...layer.children]){layer.remove(m);m.geometry.dispose();m.material.dispose()}current=null}
 let sceneActive=true;function setEnabled(v){enabled=!!v;layer.visible=enabled&&sceneActive}function setSceneActive(v){sceneActive=!!v;layer.visible=enabled&&sceneActive}
 function dispose(){clear();for(const t of cache.values())t.dispose();cache.clear();scene.remove(layer)}
 return {enter,setEnabled,setSceneActive,dispose,get report(){return current},get enabled(){return enabled}};
}
