// Black Hollow Forge 4.2 — cinematic explorer + verified automatic doorway crossing.
// Reusable preview controller, not yet a certified game physics engine. Closed/locked doors require game logic.
export function createCinematicWalkthrough(THREE,{scene,camera,controls,canvas,getRoom,levelY,selectRoom,getConnections,isReady}){
 const S={active:false,room:null,x:0,z:0,yaw:0,pitch:0,moving:new Set(),mouse:false,px:0,py:0,mode:'cinematic',clock:performance.now(),hintUntil:0,revealUntil:0,facingYaw:0,cameraYaw:0,movementAnchor:null,lastPortal:null,lastPortalAt:0,doorState:new Map()};
 const K=.3048,margin=.25,eye=1.68,radius=.23,topPitch=0.65;
 const heading=()=>new THREE.Vector3(-Math.sin(S.yaw),0,-Math.cos(S.yaw));
 const doorMeshes=new Map();
 const doorGroup=new THREE.Group();doorGroup.name='forge_43_hinged_doors';
 if(scene)scene.add(doorGroup);
 const panel=document.createElement('section');panel.id='bh-walk-panel';panel.innerHTML=`<style>
 #bh-walk-panel{position:fixed;z-index:1200;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px;width:min(94vw,820px);padding:8px;background:#10131ef0;color:#f6e8d7;border:1px solid #a08462;border-radius:12px;font:12px system-ui;box-sizing:border-box}#bh-walk-panel button{background:#342839;color:#fff;border:1px solid #997a62;padding:8px;border-radius:7px;cursor:pointer}#bh-walk-panel .walking{display:none}#bh-walk-panel.active .walking{display:inline-block}#bh-walk-panel small{width:100%;text-align:center;color:#d3bfa6}#bh-walk-panel .room{font-weight:bold}#bh-walk-panel .touch{touch-action:none}#bh-walk-panel #bh-walk-status{color:#e8cc9a}</style>
 <button id="bh-walk-toggle">Enter Cinematic Explorer</button><span class="room" id="bh-walk-room">Room inspection</span><button class="walking" id="bh-walk-camera">Camera: CINEMATIC</button><button class="walking" id="bh-walk-exit">Exit</button><button class="walking touch" data-walk="forward">▲</button><button class="walking touch" data-walk="turnleft">↶</button><button class="walking touch" data-walk="backward">▼</button><button class="walking touch" data-walk="turnright">↷</button><button class="walking" id="bh-walk-next">Next linked room (QA)</button><small id="bh-walk-status">W/↑ forward · S/↓ back · A/← turn left · D/→ turn right</small>`;
 document.body.append(panel);const q=id=>panel.querySelector('#'+id);const avatar=new THREE.Group();avatar.name='forge_victorian_explorer_preview';
 const coat=new THREE.MeshStandardMaterial({color:0x27334a,roughness:.9}),vest=new THREE.MeshStandardMaterial({color:0x665344}),skin=new THREE.MeshStandardMaterial({color:0xc6a68c}),hat=new THREE.MeshStandardMaterial({color:0x191922}),cloth=new THREE.MeshStandardMaterial({color:0x252733}),boots=new THREE.MeshStandardMaterial({color:0x17161c});
 function addBox(parent,w,h,d,x,y,z,material){let a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);a.position.set(x,y,z);parent.add(a);return a}
 const torso=new THREE.Group();avatar.add(torso);const body=new THREE.Mesh(new THREE.CylinderGeometry(.26,.37,1.08,10),coat);body.position.y=1.2;torso.add(body);addBox(torso,.29,.5,.09,0,1.30,-.28,vest);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.245,12,10),skin);head.position.y=1.96;torso.add(head);const brim=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.055,14),hat);brim.position.y=2.19;torso.add(brim);const crown=new THREE.Mesh(new THREE.CylinderGeometry(.245,.29,.34,12),hat);crown.position.y=2.39;torso.add(crown);
 const legs=[],arms=[];for(const side of [-1,1]){let leg=new THREE.Group();leg.position.set(side*.16,.71,0);avatar.add(leg);addBox(leg,.22,.72,.25,0,-.32,0,cloth);addBox(leg,.26,.15,.38,0,-.74,-.09,boots);legs.push(leg);let arm=new THREE.Group();arm.position.set(side*.34,1.57,0);torso.add(arm);addBox(arm,.17,.65,.18,side*.015,-.3,0,coat);arms.push(arm)}
 avatar.scale.setScalar(.68); // 1.75m including hat; architectural feet-to-meter scale.
 avatar.visible=false;
 function bnd(r){const b=r?.boundsFeet;if(!b)return null;return {minX:b.x*K,maxX:(b.x+b.l)*K,minZ:b.y*K,maxZ:(b.y+b.w)*K,y:levelY(r.floor),floor:r.floor};}
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sync(){panel.classList.toggle('active',S.active);q('bh-walk-toggle').textContent=S.active?'Explorer ON':'Enter Cinematic Explorer';q('bh-walk-room').textContent=S.room?.name||'Room inspection';q('bh-walk-camera').textContent='Camera: '+S.mode.toUpperCase();avatar.visible=S.active&&S.mode!=='first';}
 function status(t){q('bh-walk-status').textContent=t;}
 function orient(){return heading();}
 function placeAtCenter(r){const b=bnd(r);if(!b)return;S.x=(b.minX+b.maxX)*.5;S.z=(b.minZ+b.maxZ)*.5;}
 function enter(){if(!isReady())return false;buildDoors();S.room=getRoom();const b=bnd(S.room);if(!b)return false;S.active=true;S.mode='cinematic';S.moving.clear();S.lastPortal=null;S.lastPortalAt=0;S.doorState.clear();placeAtCenter(S.room);S.yaw=0;S.facingYaw=0;S.cameraYaw=0;S.movementAnchor=null;S.pitch=0;controls.enabled=false;S.clock=performance.now();if(scene&&avatar.parent!==scene)scene.add(avatar);sync();follow(.05,true);status('W/↑ forward · S/↓ back · A/← turn left · D/→ turn right · camera behind explorer');return true;}
 function exit(){S.active=false;for(const d of doorMeshes.values()){d.pivot.visible=false;d.open=0;d.pivot.rotation.y=0;}S.moving.clear();S.movementAnchor=null;S.mouse=false;avatar.visible=false;controls.enabled=true;camera.fov=62;camera.updateProjectionMatrix();sync();}
 function changeCamera(){S.mode=S.mode==='cinematic'?'explorer':S.mode==='explorer'?'first':'cinematic';sync();follow(.05,true)}
 // 4.3: Only a matched, same-floor architect-door is walkable. Magical elevator and stairs stay explicit.
 function doorPortal(r,o){const b=bnd(r);if(!b||!o||o.type!=='door'||!o.shared)return null;const pos=clamp(Number(o.pos??.5),0,1),w=clamp(Number(o.width||o.widthFeet||3)*K, .65, 2.1);let x,z,axis,dir;
 if(o.wall==='left'){x=b.minX;z=b.minZ+(b.maxZ-b.minZ)*pos;axis='x';dir=-1}
 else if(o.wall==='right'){x=b.maxX;z=b.minZ+(b.maxZ-b.minZ)*pos;axis='x';dir=1}
 else if(o.wall==='top'){z=b.minZ;x=b.minX+(b.maxX-b.minX)*pos;axis='z';dir=-1}
 else if(o.wall==='bottom'){z=b.maxZ;x=b.minX+(b.maxX-b.minX)*pos;axis='z';dir=1}
 else return null;return {x,z,axis,dir,half:Math.max(.22,w*.5-radius),shared:o.shared};}
 // Check the player capsule against the doorway BEFORE the usual room-edge clamp.
 // The prior algorithm clamped to an inset boundary and only looked for doors
 // after crossing the outer boundary, making a valid passage unreachable.
 function findPassage(nx,nz,dx,dz){
  const r=S.room,b=bnd(r);if(!r||!b)return null;
  const sides=[];
  if(dx<0&&nx<=b.minX+margin+.015)sides.push('left');
  if(dx>0&&nx>=b.maxX-margin-.015)sides.push('right');
  if(dz<0&&nz<=b.minZ+margin+.015)sides.push('top');
  if(dz>0&&nz>=b.maxZ-margin-.015)sides.push('bottom');
  if(!sides.length)return null;
  const ids=getConnections(r.id)||[];
  const all=window.__forgeWalkRooms||[];
  for(const side of sides){
   for(const o of (r.openings||[])){
    if(o.wall!==side||o.type!=='door'||!o.shared)continue;
    const portal=doorPortal(r,o);
    if(!portal)continue;
    const lateral=portal.axis==='x'?nz:nx;
    const center=portal.axis==='x'?portal.z:portal.x;
    if(Math.abs(lateral-center)>portal.half)continue;
    if(S.lastPortal===o.shared&&performance.now()-S.lastPortalAt<550)continue;
    for(const id of ids){
     const other=all.find(a=>a.id===id);
     if(!other||other.floor!==r.floor)continue;
     const opposing={left:'right',right:'left',top:'bottom',bottom:'top'}[side];
     if(!(other.openings||[]).some(d=>d.type==='door'&&d.shared===o.shared&&d.wall===opposing))continue;
     const bb=bnd(other);if(!bb)continue;
     const gap=side==='left'?b.minX-bb.maxX:side==='right'?bb.minX-b.maxX:side==='top'?b.minZ-bb.maxZ:bb.minZ-b.maxZ;
     if(Math.abs(gap)>.26)continue;
     return {room:other,box:bb,side,portal};
    }
   }
  }
  return null;
 }
 function step(dx,dz){
  const distance=Math.hypot(dx,dz),count=Math.max(1,Math.ceil(distance/.07));
  for(let i=0;i<count;i++){
   const vx=dx/count,vz=dz/count,nx=S.x+vx,nz=S.z+vz,b=bnd(S.room);
   if(!b)break;
   const p=findPassage(nx,nz,vx,vz);
   if(p){
    const leaf=doorMeshes.get(p.portal.shared);
    if(leaf&&leaf.open<.92)continue; // Allow traversal only after the hinged leaf has substantially cleared the doorway.
    // The connected room replaces the camera containment volume at this threshold.
    // Cross the shared wall at the actual portal center. Only a small capsule
    // clearance offset is used; there is no arbitrary jump to a distant room.
    const landing=.29;
    S.room=p.room;
    if(p.side==='left'){S.x=p.box.maxX-landing;S.z=clamp(nz,p.box.minZ+margin,p.box.maxZ-margin)}
    else if(p.side==='right'){S.x=p.box.minX+landing;S.z=clamp(nz,p.box.minZ+margin,p.box.maxZ-margin)}
    else if(p.side==='top'){S.z=p.box.maxZ-landing;S.x=clamp(nx,p.box.minX+margin,p.box.maxX-margin)}
    else {S.z=p.box.minZ+landing;S.x=clamp(nx,p.box.minX+margin,p.box.maxX-margin)}
    S.revealUntil=performance.now()+1300;
    S.lastPortal=p.portal.shared;S.lastPortalAt=performance.now();
    S.doorState.set(p.portal.shared,{progress:1,closingAt:performance.now()+1700});
    selectRoom(p.room.id);sync();
    status('Entered '+p.room.name+' · automatic architectural portal');
    continue;
   }
   S.x=clamp(nx,b.minX+margin,b.maxX-margin);
   S.z=clamp(nz,b.minZ+margin,b.maxZ-margin);
  }
 }
 // Each shared architect-door becomes one hinged mesh, built in world space
 // from the exact same bounds/opening ID used by player navigation.
 function buildDoors(){
  for(const item of doorMeshes.values()){
   item.pivot.removeFromParent();
   item.pivot.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
  }
  doorMeshes.clear();
  const rooms=window.__forgeWalkRooms||[],seen=new Set();
  for(const r of rooms){
   for(const o of r.openings||[]){
    if(o.type!=='door'||!o.shared||seen.has(o.shared))continue;
    const other=rooms.find(c=>c.id!==r.id&&c.floor===r.floor&&(c.openings||[]).some(q=>q.type==='door'&&q.shared===o.shared));
    if(!other||!(getConnections(r.id)||[]).includes(other.id))continue;
    const p=doorPortal(r,o),b=bnd(r);if(!p||!b)continue;
    seen.add(o.shared);
    const span=Math.max(.65,Math.min(1.08,Number(o.width||o.widthFeet||3)*K));
    const height=Math.min(2.18,Math.max(1.9,(Number(r.boundsFeet.h)||9)*K-.25));
    const pivot=new THREE.Group();pivot.name='bh-door-'+o.shared;
    const center=p.axis==='x'?p.z:p.x,edge=center-span/2;
    // Axis x => wall is constant x, panel spans z.
    if(p.axis==='x')pivot.position.set(p.x,b.y,edge);
    else pivot.position.set(edge,b.y,p.z);
    const panelMaterial=new THREE.MeshStandardMaterial({color:0x3b2118,roughness:.83,metalness:.04,side:THREE.DoubleSide});
    const panel=new THREE.Mesh(new THREE.BoxGeometry(p.axis==='x'?.075:span,height,p.axis==='x'?span:.075),panelMaterial);
    panel.position.set(p.axis==='x'?0:span/2,height/2,p.axis==='x'?span/2:0);
    panel.castShadow=true;panel.receiveShadow=true;panel.name='bh-door-leaf-'+o.shared;pivot.add(panel);
    const trimMaterial=new THREE.MeshStandardMaterial({color:0x87613a,metalness:.55,roughness:.48});
    const knob=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),trimMaterial);
    knob.position.set(p.axis==='x'?.065:span*.83,1.00,p.axis==='x'?span*.83:.065);
    pivot.add(knob);doorGroup.add(pivot);
    doorMeshes.set(o.shared,{pivot,centerX:p.x,centerZ:p.z,axis:p.axis,floor:r.floor,open:0,target:0,side:o.wall});
   }
  }
 }
 // Approach triggers automatic doors; crossing keeps them open long enough for
 // the player/camera to clear the threshold. Only matched architect-doors exist here.
 function tickDoors(now,dt){
  for(const [id,d] of doorMeshes){
   const distance=Math.hypot(S.x-d.centerX,S.z-d.centerZ);
   const old=S.doorState.get(id);
   const nearby=S.active&&distance<1.25&&S.room?.floor===d.floor;
   if(nearby){S.doorState.set(id,{progress:1,closingAt:now+650});}
   else if(old&&now>old.closingAt){S.doorState.delete(id);}
   d.target=S.doorState.has(id)?1:0;
   d.open+=(d.target-d.open)*Math.min(1,dt*5.5);
   d.pivot.rotation.y=d.open*(d.axis==='x'?1:-1)*1.40;
   d.pivot.visible=S.active; 
  }
 }
 function follow(dt,instant=false){
  const b=bnd(S.room);if(!b)return;
  const floor=b.y;
  avatar.position.set(S.x,floor,S.z);
  avatar.rotation.y=S.facingYaw;
  // Camera bearing eases behind the body instead of snapping 90 degrees on A/D.
  S.cameraYaw=S.yaw; // The camera stays behind the explorer while A/D moves him.
  const face=new THREE.Vector3(-Math.sin(S.cameraYaw),0,-Math.cos(S.cameraYaw));
  // Height comes from the authored room, never from a fixed "cinematic" offset.
  const authoredHeight=Math.max(2.15,(Number(S.room?.boundsFeet?.h)||9)*K);
  const ceiling=floor+authoredHeight;
  const headY=Math.min(floor+1.21,ceiling-.68);
  if(S.mode==='first'){
   camera.position.set(clamp(S.x,b.minX+.08,b.maxX-.08),Math.min(floor+eye,ceiling-.38),clamp(S.z,b.minZ+.08,b.maxZ-.08));
   camera.lookAt(S.x+face.x*5,camera.position.y+Math.tan(S.pitch)*5,S.z+face.z*5);
   avatar.visible=false;return;
  }
  avatar.visible=true;
  // Third-person camera looks AT the character, not over a nearby ceiling beam.
  // Keep it inside the actual ceiling, and use a short chase distance in hallways.
  const long=S.mode==='cinematic';
  const reveal=performance.now()<S.revealUntil;const distance=long?(reveal?3.5:3.05):2.5;
  const height=Math.min(floor+(long?(reveal?2.16:2.03):1.88),ceiling-.45);
  const aim=new THREE.Vector3(S.x,headY,S.z);
  // Project the camera backwards along a line from the explorer. Shrink that
  // distance where the line meets a wall, instead of clamping X and Z
  // independently (which shifted the camera sideways and lost the player).
  const safePad=.19;
  const back=new THREE.Vector3(-face.x,0,-face.z);
  let allowed=distance;
  for(const [p,d,lo,hi] of [[S.x,back.x,b.minX+safePad,b.maxX-safePad],[S.z,back.z,b.minZ+safePad,b.maxZ-safePad]]){
   if(Math.abs(d)>1e-5)allowed=Math.min(allowed,Math.max(0,((d>0?hi:lo)-p)/d));
  }
  let desired=new THREE.Vector3(S.x+back.x*Math.max(0,allowed-.035),height,S.z+back.z*Math.max(0,allowed-.035));
  // A shoulder-offset helps keep the character visible down narrow corridors.
  // Stop short of any opaque geometry between avatar and chase camera.
  const direction=desired.clone().sub(aim);
  const rayLength=direction.length();
  if(rayLength>.3){
   const ray=new THREE.Raycaster(aim,direction.clone().normalize(),.15,rayLength);
   const models=(scene?.children||[]).filter(o=>o!==avatar&&o!==doorGroup&&o.visible&&o.type==='Group'&&!String(o.name||'').startsWith('forge_'));
   const hits=ray.intersectObjects(models,true).filter(h=>h.object?.isMesh&&h.object.visible&&h.object.material?.transparent!==true);
   if(hits.length){
    const near=Math.max(.40,hits[0].distance-.25);
    desired=aim.clone().addScaledVector(direction.normalize(),near);
   }
  }
  const outsideRoom=(camera.position.x<b.minX+safePad||camera.position.x>b.maxX-safePad||camera.position.z<b.minZ+safePad||camera.position.z>b.maxZ-safePad);
  // Snap on a real room transition: never lerp *through* the connecting wall.
  if(instant||outsideRoom||camera.position.distanceTo(desired)>7)camera.position.copy(desired);
  else camera.position.lerp(desired,Math.min(1,dt*4.2));
  camera.position.x=clamp(camera.position.x,b.minX+safePad,b.maxX-safePad);
  camera.position.z=clamp(camera.position.z,b.minZ+safePad,b.maxZ-safePad);
  camera.near=.07;
  camera.fov=long?69:64;
  camera.updateProjectionMatrix();
  // Look forward into the room, not down at the explorer's hat.
  camera.lookAt(aim.x,aim.y+S.pitch*.25,aim.z);
 }
 let stride=0;
 function angleTo(current,target,amount){
  const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));
  return current+delta*Math.min(1,amount);
 }
 // W/S moves forward/back; A/D and horizontal arrows move the actual character.
 // Face the direction of travel. Camera follows the avatar's back.
 // Keep the movement basis fixed until keys release, avoiding steering spirals.
 function update(t){
  const dt=Math.min(.05,Math.max(0,(t-S.clock)/1000));S.clock=t;
  if(!S.active)return;
  tickDoors(t,dt);
  // Agreed adventure controls: A/D rotate the explorer, never strafe or orbit a free camera.
  const turn=Number(S.moving.has('turnright'))-Number(S.moving.has('turnleft'));
  S.yaw-=turn*dt*1.8; // Forward = -Z; negative yaw turns toward +X (right).
  S.facingYaw=S.yaw;
  const f=Number(S.moving.has('forward'))-Number(S.moving.has('backward'));
  const len=Math.abs(f);
  if(len>0){
   const speed=S.moving.has('sprint')?5.0:2.75;
   const dx=-Math.sin(S.yaw)*f*speed*dt;
   const dz=-Math.cos(S.yaw)*f*speed*dt;
   step(dx,dz);
  }
  const moving=len>.001;
  stride+=dt*(moving?10:0);const a=moving?Math.sin(stride)*.45:0;
  legs[0].rotation.x=a;legs[1].rotation.x=-a;
  arms[0].rotation.x=-a*.75;arms[1].rotation.x=a*.75;
  torso.position.y=moving?Math.abs(Math.sin(stride))*.035:0;
  follow(dt);
 }
 const keymap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'turnleft',KeyD:'turnright',ArrowLeft:'turnleft',ArrowRight:'turnright',ShiftLeft:'sprint',ShiftRight:'sprint'};
 document.addEventListener('keydown',e=>{if(!S.active||e.target?.closest?.('input,textarea,select'))return;if(e.code==='KeyV'){changeCamera();e.preventDefault();return;}if(e.code==='Escape'){exit();return;}const m=keymap[e.code];if(m){S.moving.add(m);e.preventDefault();}});
 document.addEventListener('keyup',e=>{const m=keymap[e.code];if(m)S.moving.delete(m);});window.addEventListener('blur',()=>S.moving.clear());
 canvas.addEventListener('pointerdown',e=>{if(!S.active)return;S.mouse=true;S.px=e.clientX;S.py=e.clientY;});canvas.addEventListener('pointermove',e=>{if(!S.active||!S.mouse)return;S.yaw-=(e.clientX-S.px)*.004;S.facingYaw=S.yaw;S.movementAnchor=null;S.pitch=clamp(S.pitch-(e.clientY-S.py)*.004,-topPitch,topPitch);S.px=e.clientX;S.py=e.clientY;});for(const event of ['pointerup','pointercancel','pointerleave'])canvas.addEventListener(event,()=>S.mouse=false);
 for(const btn of panel.querySelectorAll('[data-walk]')){const m=btn.dataset.walk;btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);S.moving.add(m)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(evt,()=>S.moving.delete(m));}
 q('bh-walk-toggle').onclick=()=>S.active?exit():enter();q('bh-walk-exit').onclick=exit;q('bh-walk-camera').onclick=changeCamera;
 q('bh-walk-next').onclick=()=>{const ids=S.room?getConnections(S.room.id)||[]:[];if(!ids.length){status('No linked room in navigation graph');return;}exit();selectRoom(ids[0]);enter();status('QA connection jump (not physical door travel)');};
 function onRoomChanged(){if(!S.active)return;S.room=getRoom();placeAtCenter(S.room);sync();follow(.05,true);}
 return {enter,exit,update,onRoomChanged,get active(){return S.active},get position(){return [S.x,bnd(S.room)?.y??0,S.z]},get currentRoomId(){return S.room?.id||null},get doorStates(){return [...doorMeshes].map(([id,d])=>({shared:id,open:d.open}))}};
}
