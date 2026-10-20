// Black Hollow 3.2 — whole-estate physical lighting. Visual-only, no blueprint edits.
// Uses one shadow-casting primary directional light and one bounded interior accent.
export function createWholeHouseLighting(THREE, scene, renderer, {sun, moon, fill, mobile=false}={}) {
  const original = {sunCast:sun.castShadow, moonCast:moon.castShadow, map:renderer.shadowMap.enabled, type:renderer.shadowMap.type};
  const quality = {mode:mobile?'mobile':'desktop'};
  const warmth=new THREE.PointLight(0xffbc79,0,13,2);warmth.name='BH32_local_warmth';scene.add(warmth);
  const shadow=document.createElement('canvas');shadow.width=shadow.height=128;
  const ctx=shadow.getContext('2d');let grad=ctx.createRadialGradient(64,64,8,64,64,64);grad.addColorStop(0,'rgba(0,0,0,.30)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  const texture=new THREE.CanvasTexture(shadow);texture.colorSpace=THREE.SRGBColorSpace;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,opacity:.45,polygonOffset:true,polygonOffsetFactor:-1}));plane.rotation.x=-Math.PI/2;plane.name='BH32_room_contact_softness';plane.visible=false;scene.add(plane);
  let active=true;let mood='night';let room=null;let eye=null;let allowed=true;
  function qualityMode(mode){quality.mode=mode==='mobile'?'mobile':'desktop';const dim=quality.mode==='mobile'?512:1024;[sun,moon].forEach(light=>{light.shadow.mapSize.set(dim,dim);if(light.shadow.map){light.shadow.map.dispose();light.shadow.map=null;}light.shadow.bias=-.00025;light.shadow.normalBias=.035;light.shadow.camera.left=-32;light.shadow.camera.right=32;light.shadow.camera.top=32;light.shadow.camera.bottom=-32;light.shadow.camera.near=.5;light.shadow.camera.far=135;light.shadow.camera.updateProjectionMatrix();});apply();}
  function apply(){renderer.shadowMap.enabled=active&&allowed;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=active&&allowed&&mood==='day';moon.castShadow=active&&allowed&&mood!=='day';warmth.intensity=active&&allowed&&room?(mood==='day'?.65:1.6):0;plane.visible=active&&allowed&&!!room;}
  function setRoom(center,size,floorY=0){if(!center||!size){room=null;apply();return;}room={center:center.clone(),size:size.clone(),floorY};warmth.position.set(center.x,Math.max(floorY+1.9,center.y+.45),center.z);plane.position.set(center.x,floorY+.018,center.z);plane.scale.set(Math.min(size.x,3.8),Math.min(size.z,3.8),1);apply();}
  function tick(camera,estateVisible=true){allowed=estateVisible;if(room){const dx=camera.position.x-room.center.x,dz=camera.position.z-room.center.z;const distance=Math.hypot(dx,dz);const cutoff=Math.max(room.size.x,room.size.z)*1.3+4;const fade=Math.max(0,Math.min(1,(cutoff-distance)/3));warmth.intensity=(mood==='day'?.65:1.6)*fade*(active&&allowed?1:0);plane.material.opacity=.20*fade;plane.visible=active&&allowed&&fade>.05;}else warmth.intensity=0;applyShadowOnly();}
  function applyShadowOnly(){renderer.shadowMap.enabled=active&&allowed;sun.castShadow=active&&allowed&&mood==='day';moon.castShadow=active&&allowed&&mood!=='day';}
  function dispose(){sun.castShadow=original.sunCast;moon.castShadow=original.moonCast;renderer.shadowMap.enabled=original.map;renderer.shadowMap.type=original.type;scene.remove(warmth,plane);warmth.dispose();texture.dispose();plane.geometry.dispose();plane.material.dispose();}
  qualityMode(quality.mode);
  return {setEnabled(v){active=!!v;apply();},get enabled(){return active;},setMood(v){mood=v;apply();},setRoom,tick,setQuality:qualityMode,dispose};
}
