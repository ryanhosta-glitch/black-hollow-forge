// Black Hollow Forge: Universal Realism Engine 2.0 (five integrated phases).
// Non-destructive visual overlay; never edits .haunt or authored dimensions.
export function classifySurface(name='', materialName='') {
 const s=(name+' '+materialName).toLowerCase();
 if(/mirror|silvered/.test(s)) return 'mirror';
 if(/window|glass|glazing|crystal/.test(s)) return 'glass';
 if(/velvet|upholster|fabric|curtain|leather|sofa|armchair/.test(s)) return 'fabric';
 if(/brass|bronze|gild|gold|candel|chandelier|sconce|hinge|knob/.test(s)) return 'brass';
 if(/iron|metal|baluster|rail|grill|crest/.test(s)) return 'iron';
 if(/wallpaper|damask/.test(s)) return 'wallpaper';
 if(/marble|polished.stone/.test(s)) return 'marble';
 if(/plaster|stucco/.test(s)) return 'plaster';
 if(/mahogany|walnut|timber|wood|shelf|bookcase|desk|cabinet|floorboard|parquet|molding|wainscot|skirting/.test(s)) return 'wood';
 if(/stone|masonry|slate|tile|limestone|column|arch|floor|stair|tread/.test(s)) return 'stone';
 return null;
}
export const DEFAULT_ENVIRONMENT={wearLevel:.34,grimeLevel:.24,moistureLevel:.16,polishLevel:.42,hauntIntensity:.4};
export function clamp01(n){return Math.min(1,Math.max(0,Number(n)||0))}
export function environmentFor(room={}) {
 const s=(room.name+' '+(room.roomType||room.type||'')).toLowerCase();
 const haunt=clamp01((Number(room.haunting)||0)/100);
 const age=/crypt|vault|cellar|attic|ruin|forgotten/.test(s)?.8:/study|ballroom|gallery|grand|library/.test(s)?.25:.45;
 return {wearLevel:age,grimeLevel:clamp01(age*.72),moistureLevel:/crypt|cellar|conservatory|greenhouse/.test(s)?.72:.14,polishLevel:/ballroom|grand|gallery|library/.test(s)?.68:.27,hauntIntensity:haunt};
}
export function materialTreatment(kind,env=DEFAULT_ENVIRONMENT){
 const e={...DEFAULT_ENVIRONMENT,...env}; const roughBase={wood:.49,wallpaper:.9,marble:.23,stone:.82,plaster:.93,brass:.34,iron:.64,fabric:.96,glass:.12,mirror:.085}[kind]??.7;
 const metal={brass:.83,iron:.65,mirror:.9}[kind]??0;
 const r=clamp01(roughBase+e.wearLevel*.11+e.grimeLevel*.12+e.moistureLevel*.05-e.polishLevel*.09);
 return {roughness:Math.max(.075,r),metalness:metal};
}
function hashText(s){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0;}
export function createUniversalRealism(THREE,scene,{mobile=false}={}){
 const modified=new Set(), ambientGroup=new THREE.Group();ambientGroup.name='forge_universal_physical_lights';scene.add(ambientGroup);
 const shadowGroup=new THREE.Group();shadowGroup.name='forge_universal_contact_shadows';scene.add(shadowGroup);
 const textures=new Map();let activeRooms=[],lastRoomId='',mood='dusk';
 // Small shared stochastic micro-roughness maps reduce flat plastic-looking response.
 function roughnessMap(kind){if(typeof document==='undefined')return null;if(textures.has(kind))return textures.get(kind);
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');if(!ctx)return null;
  const image=ctx.createImageData(128,128);let h=hashText(kind);for(let i=0;i<128*128;i++){
   h=(Math.imul(h,1664525)+1013904223)>>>0;const n=(h>>>24);const value=Math.round(210+n*.17);
   image.data.set([value,value,value,255],i*4);
  }ctx.putImageData(image,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.needsUpdate=true;textures.set(kind,t);return t;
 }
 function apply(root,env=DEFAULT_ENVIRONMENT){let upgraded=0,preserved=0;
  root.traverse?.(o=>{if(!o.isMesh||!o.material)return;
   const original=o.userData.forgeUniversalOriginal||o.material;
   const arr=Array.isArray(original)?original:[original];
   const transformed=arr.map((src)=>{
    if(!src?.isMeshStandardMaterial&&!src?.isMeshPhysicalMaterial){preserved++;return src}
    const kind=classifySurface(o.name,src.name);if(!kind){preserved++;return src}
    if(src.userData?.studentAuthoredFinish||o.userData?.studentAuthoredFinish){preserved++;return src}
    const m=src.clone();const treatment=materialTreatment(kind,env);
    // Keep authored imported textures, colors, and normals; never replace them.
    m.roughness=THREE.MathUtils.lerp(src.roughness??.8,treatment.roughness,src.map?.35:.72);
    m.metalness=THREE.MathUtils.lerp(src.metalness??0,treatment.metalness,src.metalness>.15?.30:.52);
    if(!m.roughnessMap && o.geometry?.getAttribute?.('uv') && !mobile) m.roughnessMap=roughnessMap(kind);
    if(kind==='glass'){m.transparent=true;m.opacity=Math.max(.25,Math.min(1,src.opacity??.72));m.depthWrite=m.opacity>=.95}
    if(m.isMeshPhysicalMaterial){if(kind==='wood'||kind==='marble')m.clearcoat=Math.max(m.clearcoat||0,.19);if(kind==='fabric')m.sheen=Math.max(m.sheen||0,.17)}
    m.userData={...src.userData,forgeUniversal:true};m.needsUpdate=true;upgraded++;return m;
   });
   if(upgraded && !o.userData.forgeUniversalOriginal)o.userData.forgeUniversalOriginal=original;
   if(transformed.some((m,i)=>m!==arr[i])){o.material=Array.isArray(original)?transformed:transformed[0];modified.add(o)}
  });return {upgraded,preserved};
 }
 function restore(){for(const o of modified){if(o.userData.forgeUniversalOriginal){const m=o.material;for(const item of Array.isArray(m)?m:[m])if(item?.userData?.forgeUniversal)item.dispose?.();o.material=o.userData.forgeUniversalOriginal;delete o.userData.forgeUniversalOriginal}}modified.clear()}
 function rooms(blueprintRooms=[],levels=[]){activeRooms=(blueprintRooms||[]).filter(r=>r.boundsFeet).map(r=>{
  const b=r.boundsFeet,k=.3048,i=Number(r.floor)||0;
  return {id:r.id,floor:i,environment:environmentFor(r),x:(Number(b.x)+Number(b.l)/2)*k,y:(levels[i]||0)+Math.min(2.5,Math.max(1.6,Number(b.h)*k*.73)),z:(Number(b.y)+Number(b.w)/2)*k,size:Math.min(20,Math.max(4,Math.sqrt(b.l*b.w)*k*1.25))}
 });}
 function selectRoom(roomId){lastRoomId=roomId;ambientGroup.clear();shadowGroup.clear();const p=activeRooms.find(r=>r.id===roomId);if(!p)return;
  const light=new THREE.PointLight(0xffd4a0,mood==='day'?.55:mood==='night'?1.05:.83,p.size,2);light.position.set(p.x,p.y,p.z);light.castShadow=false;light.name='forge_room_indirect_fill';ambientGroup.add(light);
  // Soft elliptical transparent contact veil at floor center. Skip because it would obscure authored flooring.
 }
 function setMood(next){mood=next;selectRoom(lastRoomId)}
 function attachFlicker(flameGroup){let count=0;flameGroup.traverse?.(o=>{if(o.userData?.forgeFlameTip && o.material?.emissive){o.userData.forgeUniversalFlameIndex=count++;o.material=o.material.clone();o.material.emissiveIntensity=Math.max(.42,o.material.emissiveIntensity||0)}});return count}
 function tick(timeMs){const t=(Number(timeMs)||0)*.001;ambientGroup.children.forEach(o=>{if(o.isLight)o.intensity*=1+Math.sin(t*1.7)*.0007});}
 return {apply,restore,rooms,selectRoom,setMood,attachFlicker,tick,materialTreatment,environmentFor,get activeRoomCount(){return activeRooms.length},get modifiedMeshCount(){return modified.size}};
}
