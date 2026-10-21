import {circleTouchesRectangle} from './navigation/door_leaf_collision.mjs';
// Black Hollow Forge — Navigation 2 main-viewer compatibility controller.
// Reusable preview controller, not yet a certified game physics engine. Closed/locked doors require game logic.
export function createNavigation2ForgeViewer(THREE,{scene,camera,controls,canvas,getRoom,levelY,selectRoom,getConnections,isReady}){
 const S={active:false,room:null,x:0,z:0,yaw:0,pitch:0,moving:new Set(),mouse:false,px:0,py:0,mode:'cinematic',directorMode:'hybrid',clock:performance.now(),hintUntil:0,revealUntil:0,facingYaw:0,cameraYaw:0,movementAnchor:null,speed:0,turnSpeed:0,lookYaw:0,lookUntil:0,cameraRoomId:null,requireFreshForward:false,arrivalUntil:0,lastPortal:null,lastPortalAt:0,doorState:new Map()};
 const K=.3048,margin=.20,eye=1.68,radius=.20,topPitch=0.65;
 const heading=()=>new THREE.Vector3(-Math.sin(S.yaw),0,-Math.cos(S.yaw));
 const doorMeshes=new Map();
 const doorGroup=new THREE.Group();doorGroup.name='forge_43_hinged_doors';
 if(scene)scene.add(doorGroup);
 const panel=document.createElement('section');panel.id='bh-walk-panel';panel.innerHTML=`<style>
 #bh-walk-panel{position:fixed;z-index:1200;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px;width:min(94vw,820px);padding:8px;background:#10131ef0;color:#f6e8d7;border:1px solid #a08462;border-radius:12px;font:12px system-ui;box-sizing:border-box}#bh-walk-panel button{background:#342839;color:#fff;border:1px solid #997a62;padding:8px;border-radius:7px;cursor:pointer}#bh-walk-panel .walking{display:none}#bh-walk-panel.active .walking{display:inline-block}#bh-walk-panel small{width:100%;text-align:center;color:#d3bfa6}#bh-walk-panel .room{font-weight:bold}#bh-walk-panel .touch{touch-action:none}#bh-walk-panel #bh-walk-status{color:#e8cc9a}</style>
 <button id="bh-walk-toggle">Enter Cinematic Explorer</button><span class="room" id="bh-walk-room">Room inspection</span><button class="walking" id="bh-walk-camera">Camera: CINEMATIC</button><button class="walking" id="bh-walk-exit">Exit</button><button class="walking touch" data-walk="forward">▲</button><button class="walking touch" data-walk="turnleft">↶</button><button class="walking touch" data-walk="backward">▼</button><button class="walking touch" data-walk="turnright">↷</button><button class="walking" id="bh-director-mode">Director: HYBRID</button><button class="walking" id="bh-camera-plan">Export camera plan</button><button class="walking" id="bh-walk-next">Next linked room (QA)</button><small id="bh-walk-status">W/↑ forward · S/↓ back · A/← turn left · D/→ turn right</small>`;
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
 function sync(){q('bh-director-mode').textContent='Director: '+S.directorMode.toUpperCase();panel.classList.toggle('active',S.active);q('bh-walk-toggle').textContent=S.active?'Explorer ON':'Enter Cinematic Explorer';q('bh-walk-room').textContent=S.room?.name||'Room inspection';q('bh-walk-camera').textContent='Camera: '+S.mode.toUpperCase();avatar.visible=S.active&&S.mode!=='first';}
 function status(t){q('bh-walk-status').textContent=t;}
 function orient(){return heading();}
 function placeAtCenter(r){const b=bnd(r);if(!b)return;S.x=(b.minX+b.maxX)*.5;S.z=(b.minZ+b.maxZ)*.5;}
 function enter(){if(!isReady())return false;buildDoors();S.room=getRoom();const b=bnd(S.room);if(!b)return false;S.active=true;S.mode='cinematic';S.moving.clear();S.lastPortal=null;S.lastPortalAt=0;S.doorState.clear();placeAtCenter(S.room);S.yaw=0;S.facingYaw=0;S.cameraYaw=0;S.movementAnchor=null;S.pitch=0;S.speed=0;S.turnSpeed=0;S.lookYaw=0;S.lookUntil=0;S.cameraRoomId=null;S.requireFreshForward=false;S.arrivalUntil=0;controls.enabled=false;S.clock=performance.now();if(scene&&avatar.parent!==scene)scene.add(avatar);sync();follow(.05,true);status('W/↑ forward · S/↓ back · A/← turn left · D/→ turn right · camera behind explorer');return true;}
 function exit(){if(!S.active)return;S.active=false;for(const d of doorMeshes.values()){d.pivot.visible=false;d.open=0;d.pivot.rotation.y=0;}S.moving.clear();S.movementAnchor=null;S.speed=0;S.turnSpeed=0;S.requireFreshForward=false;S.mouse=false;avatar.visible=false;controls.enabled=true;camera.near=.1;camera.fov=62;camera.updateProjectionMatrix();controls.target.set(S.x,(bnd(S.room)?.y??0)+1.18,S.z);sync();}
 function changeCamera(){S.mode=S.mode==='cinematic'?'explorer':S.mode==='explorer'?'first':'cinematic';sync();follow(.05,true)}
 // 4.3: Only a matched, same-floor architect-door is walkable. Magical elevator and stairs stay explicit.
 function doorPortal(r,o){const b=bnd(r);if(!b||!o||o.type!=='door'||!o.shared)return null;const pos=clamp(Number(o.pos??.5),0,1),w=clamp(Number(o.width||o.widthFeet||3.54)*K, .65, 2.1);let x,z,axis,dir;
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
  const ids=new Set([...(getConnections(r.id)||[]),...(window.__forgeWalkRooms||[]).filter(q=>q.id!==r.id&&q.floor===r.floor&&(q.openings||[]).some(v=>v.type==='door'&&v.shared&&(r.openings||[]).some(o=>o.shared===v.shared))).map(q=>q.id)]);
  const all=window.__forgeWalkRooms||[];
  for(const side of sides){
   for(const o of (r.openings||[])){
    if(o.wall!==side||o.type!=='door'||!o.shared)continue;
    const portal=doorPortal(r,o);
    if(!portal)continue;
    const lateral=portal.axis==='x'?nz:nx;
    const center=portal.axis==='x'?portal.z:portal.x;
    if(Math.abs(lateral-center)>Math.max(.18,portal.half-.02))continue;
    // Continuous traversal is controlled by wall crossing, not by a time lock.
    for(const id of ids){
     const other=all.find(a=>a.id===id);
     if(!other||other.floor!==r.floor)continue;
     const opposing={left:'right',right:'left',top:'bottom',bottom:'top'}[side];
     const receiving=(other.openings||[]).find(d=>d.type==='door'&&d.shared===o.shared&&d.wall===opposing);
     const receivingPortal=doorPortal(other,receiving);
     if(!receivingPortal||Math.abs(lateral-(receivingPortal.axis==='x'?receivingPortal.z:receivingPortal.x))>receivingPortal.half)continue;
     const bb=bnd(other);if(!bb)continue;
     const gap=side==='left'?b.minX-bb.maxX:side==='right'?bb.minX-b.maxX:side==='top'?b.minZ-bb.maxZ:bb.minZ-b.maxZ;
     if(Math.abs(gap)>.26)continue;
     return {room:other,box:bb,side,portal};
    }
   }
  }
  return null;
 }
 // Navigation 2 transition: preserve exact world position across a shared boundary.
 // No doorway teleport, no stop-and-release requirement, and no forced heading snap.
 // Test the actual hinged leaf, including fully open doors. Transforming the
 // capsule center into leaf-local space avoids an oversized world AABB at 45°.
 function blockedByDoor(x,z){
  const floor=levelY(S.room.floor);
  for(const d of doorMeshes.values()){
   if(d.floor!==S.room.floor)continue;
   d.leaf.updateWorldMatrix(true,false);
   const p=d.leaf.worldToLocal(new THREE.Vector3(x,floor+1,z));
   const b=d.leaf.geometry.boundingBox;
   if(circleTouchesRectangle(p.x,p.z,b.min.x,b.max.x,b.min.z,b.max.z,radius+.01))return true;
  }
  return false;
 }
 function step(dx,dz){
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.055));
  const vx=dx/count,vz=dz/count;
  for(let i=0;i<count;i++){
   const current=bnd(S.room);if(!current)break;
   // Resolve each short move against every leaf before room-interior shortcuts.
   // Axis separation retains wall-style sliding instead of freezing both axes.
   let nx=S.x+vx,nz=S.z+vz;
   if(blockedByDoor(nx,S.z))nx=S.x;
   if(blockedByDoor(nx,nz))nz=S.z;
   if(nx===S.x&&nz===S.z)continue;
   const inside=nx>=current.minX+margin&&nx<=current.maxX-margin&&nz>=current.minZ+margin&&nz<=current.maxZ-margin;
   // After crossing a shared wall the explorer is still within the receiving
   // room's physical doorway strip. Let him finish walking into that room;
   // otherwise the old inset margin pins him against the threshold.
   const arrivalPortal=(S.room.openings||[]).filter(o=>o.shared===S.lastPortal).map(o=>doorPortal(S.room,o)).find(p=>p&&Math.abs((p.axis==='x'?nz:nx)-(p.axis==='x'?p.z:p.x))<=p.half&&Math.abs((p.axis==='x'?nx:nz)-(p.axis==='x'?p.x:p.z))<=margin+.06);
   const justCrossed=!!arrivalPortal;
   const physicallyInside=nx>=current.minX&&nx<=current.maxX&&nz>=current.minZ&&nz<=current.maxZ;
   if(inside||(justCrossed&&physicallyInside)){S.x=nx;S.z=nz;continue;}
   const passage=findPassage(nx,nz,vx,vz);
   if(passage){
    const leaf=doorMeshes.get(passage.portal.shared);
    if(leaf&&leaf.open<.90){S.doorState.set(passage.portal.shared,{progress:1,closingAt:performance.now()+3000});continue;}
    // Remain inside the actual portal's narrow lane instead of jumping into
    // the next room. Use a small physical margin, not a .29m relocation.
    const axis=passage.portal.axis,lateral=axis==='x'?nz:nx;
    const center=axis==='x'?passage.portal.z:passage.portal.x;
    if(Math.abs(lateral-center)>passage.portal.half)continue;
    S.x=nx;S.z=nz;
    // Cross at the shared wall. The room reference changes but coordinates do not.
    const across=passage.side==='left'?nx<=current.minX:
     passage.side==='right'?nx>=current.maxX:
     passage.side==='top'?nz<=current.minZ:nz>=current.maxZ;
    if(across){
     S.room=passage.room;
     S.revealUntil=performance.now()+850;
     S.lastPortal=passage.portal.shared;S.lastPortalAt=performance.now();
     S.doorState.set(passage.portal.shared,{progress:1,closingAt:performance.now()+2600});
     selectRoom(passage.room.id);if(document.activeElement?.matches?.('select,button'))document.activeElement.blur();sync();
     status('Entered '+passage.room.name);
    }
    continue;
   }
   // Solid wall collision preserves free sliding along the remaining axis.
   const cx=clamp(nx,current.minX+margin,current.maxX-margin);
   const cz=clamp(nz,current.minZ+margin,current.maxZ-margin);
   if(Math.abs(cx-S.x)<.08)S.x=cx;
   if(Math.abs(cz-S.z)<.08)S.z=cz;
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
    if(!other)continue; // Paired blueprint door is authoritative, not optional magic graph
    const p=doorPortal(r,o),b=bnd(r);if(!p||!b)continue;
    seen.add(o.shared);
    const span=Math.max(.65,Math.min(1.08,Number(o.width||o.widthFeet||3.54)*K));
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
    panel.geometry.computeBoundingBox();
    doorMeshes.set(o.shared,{pivot,leaf:panel,centerX:p.x,centerZ:p.z,axis:p.axis,floor:r.floor,open:0,target:0,side:o.wall});
   }
  }
 }
 // Approach triggers automatic doors; crossing keeps them open long enough for
 // the player/camera to clear the threshold. Only matched architect-doors exist here.
 function tickDoors(now,dt){
  for(const [id,d] of doorMeshes){
   const distance=Math.hypot(S.x-d.centerX,S.z-d.centerZ);
   const old=S.doorState.get(id);
   const sameFloor=S.room?.floor===d.floor;
   const nearby=S.active&&sameFloor&&(distance<2.6||Math.hypot(camera.position.x-d.centerX,camera.position.z-d.centerZ)<1.75);
   if(nearby){S.doorState.set(id,{progress:1,closingAt:now+2600});}
   else if(old&&now>old.closingAt&&distance>2.6){S.doorState.delete(id);}
   d.target=S.doorState.has(id)?1:0;
   d.open+=(d.target-d.open)*Math.min(1,dt*6);
   const sign={left:1,right:-1,top:-1,bottom:1}[d.side];
   d.pivot.rotation.y=d.open*sign*1.56;
   d.pivot.visible=S.active&&sameFloor;
  }
 }
 // Camera plans are derived only from authored room bounds and matching door IDs.
 // These are safe-zone proposals, NOT mesh-level collision certification.
 function directorPlan(r){
  const b=bnd(r);if(!b)return null;
  const wx=b.maxX-b.minX,wz=b.maxZ-b.minZ;
  const compact=Math.min(wx,wz)<3.0;
  const portals=(r.openings||[]).filter(o=>o.type==='door'&&o.shared).map(o=>{
   const p=doorPortal(r,o);return p?{id:o.shared,wall:o.wall,center:[p.x,p.z],widthMeters:Math.round((p.half+radius)*200)/100}:null;
  }).filter(Boolean);
  const pad=Math.min(.24,wx*.14,wz*.14);
  return {roomId:r.id,floor:r.floor,classification:compact?'narrow':Math.max(wx,wz)>9?'grand':'room',
   safeBoundsMeters:{minX:b.minX+pad,maxX:b.maxX-pad,minZ:b.minZ+pad,maxZ:b.maxZ-pad,floorY:b.y},
   focusMeters:[(b.minX+b.maxX)/2,b.y+1.1,(b.minZ+b.maxZ)/2],
   preferredDistanceMeters:compact?1.9:Math.max(wx,wz)>9?3.25:2.7,
   portals,shotModes:['hybrid','chase','dollhouse'],
   dollhouseSide:wx>wz?'z':'x'};
 }
 function cameraPlan(){
  const rooms=window.__forgeWalkRooms||[];
  return {format:'black-hollow-camera-plan',version:1,units:'meters',generator:'forge-cinematic-director-preview',
   certification:'PROVISIONAL-ROOM-BOUNDS-ONLY',rooms:rooms.map(directorPlan).filter(Boolean)};
 }
 function saveCameraPlan(){
  const json=JSON.stringify(cameraPlan(),null,2);
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='black-hollow-camera-plan.preview.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  status('Camera plan exported for QA; not certified for CASA gameplay');
 }
 function changeDirector(){
  const modes=['hybrid','chase','dollhouse'],i=modes.indexOf(S.directorMode);
  S.directorMode=modes[(i+1)%modes.length];sync();follow(.05,true);
  status('Camera director: '+S.directorMode+' · movement controls unchanged');
 }
 // Hallway safety: the camera stays behind the explorer, never at a wall-side anchor.
 // Projecting to a safe room segment also keeps interpolated movement within bounds.
 function follow(dt,instant=false){
  const b=bnd(S.room);if(!b)return;
  const floor=b.y,now=performance.now();
  avatar.position.set(S.x,floor,S.z);avatar.rotation.y=S.facingYaw;
  const width=Math.min(b.maxX-b.minX,b.maxZ-b.minZ);
  const hallway=width<3.05;
  // Navigation 2 camera: smooth, predictable chase direction even in corridors.
  const targetYaw=S.yaw+S.lookYaw;
  S.cameraYaw=angleTo(S.cameraYaw,targetYaw,instant?1:Math.min(1,dt*4));
  const face=new THREE.Vector3(-Math.sin(S.cameraYaw),0,-Math.cos(S.cameraYaw));
  const back=face.clone().negate();
  const roomHeight=Math.max(2.15,(Number(S.room?.boundsFeet?.h)||9)*K);
  const ceiling=floor+roomHeight;
  const doorNear=[...doorMeshes.values()].some(d=>d.floor===S.room?.floor&&Math.hypot(S.x-d.centerX,S.z-d.centerZ)<1.3);
  S.doorwayDip=(S.doorwayDip||0)+(Number(doorNear)-(S.doorwayDip||0))*Math.min(1,dt*(doorNear?5:2.3));
  const dip=S.doorwayDip;
  const aim=new THREE.Vector3(S.x,Math.min(floor+1.18-dip*.10,ceiling-.75),S.z);
  if(S.mode==='first'){
   camera.near=.045;camera.updateProjectionMatrix();
   camera.position.set(S.x,Math.min(floor+eye,ceiling-.38),S.z);
   camera.lookAt(S.x+face.x*5,camera.position.y+Math.tan(S.pitch)*5,S.z+face.z*5);
   avatar.visible=false;return;
  }
  avatar.visible=true;
  const plan=directorPlan(S.room),long=S.mode==='cinematic';
  const distance=hallway?1.35:S.directorMode==='chase'?2.15:S.directorMode==='dollhouse'?Math.min(2.25,plan.preferredDistanceMeters):long?2.35:1.85;
  const desired=aim.clone().addScaledVector(back,distance);
  desired.y=Math.min(floor+(hallway?1.78:2.03)-dip*.58,ceiling-.42);
  // Gather actual visible architecture. Do not treat nonstructural atmosphere,
  // decorations, invisible models, or the explorer as camera walls.
  const occluders=[];
  scene?.traverse(o=>{
   if(!o.isMesh||o.userData?.cameraIgnore||avatar.getObjectById(o.id))return;
   for(let ancestor=o;ancestor;ancestor=ancestor.parent)if(!ancestor.visible)return;
   const n=String(o.name||'').toLowerCase();
   if(/particle|mist|fog|smoke|flame|highlight|decay/i.test(n))return;
   if(Array.isArray(o.material)?o.material.every(m=>m.transparent):o.material?.transparent)return;
   if(!o.geometry?.boundingBox)o.geometry?.computeBoundingBox();
   const ext=o.geometry?.boundingBox?.getSize(new THREE.Vector3());
   if((ext&&Math.max(ext.x,ext.y,ext.z)>.65)||o.parent===doorGroup||n.includes('door'))occluders.push(o);
  });
  const direction=desired.clone().sub(aim),distanceToCamera=direction.length();
  if(distanceToCamera>.01){
   const hits=new THREE.Raycaster(aim,direction.clone().normalize(),.12,distanceToCamera).intersectObjects(occluders,false);
   const obstacle=hits.find(hit=>hit.distance>.13);
   if(obstacle)desired.copy(aim).addScaledVector(direction.normalize(),Math.max(.05,obstacle.distance-.25));
  }
  // Avoid abrupt camera relocation on room changes. If the OLD camera is now
  // behind a wall, immediately adopt the safe target instead of easing through it.
  const currentRay=camera.position.clone().sub(aim),currentLength=currentRay.length();
  const oldOccluded=currentLength>.2&&new THREE.Raycaster(aim,currentRay.normalize(),.13,currentLength).intersectObjects(occluders,false).some(h=>h.distance>.15&&h.distance<currentLength-.1);
  if(instant||oldOccluded)camera.position.copy(desired);
  else camera.position.lerp(desired,Math.min(1,dt*8));
  // Second check: interpolation can cross geometry even if its target is clear.
  const finalRay=camera.position.clone().sub(aim),finalLength=finalRay.length();
  if(finalLength>.2){
   const hit=new THREE.Raycaster(aim,finalRay.clone().normalize(),.12,finalLength).intersectObjects(occluders,false).find(h=>h.distance>.13);
   if(hit)camera.position.copy(aim).addScaledVector(finalRay.normalize(),Math.max(.05,hit.distance-.25));
  }
  camera.near=.045;camera.fov=hallway?72:long?69:64;camera.updateProjectionMatrix();
  camera.lookAt(aim.x,aim.y+S.pitch*.18,aim.z);
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
  // Agreed controls: W/S translate, A/D turn the character, never strafe.
  // Smooth acceleration prevents instantaneous pivots and foot sliding.
  const turn=Number(S.moving.has('turnright'))-Number(S.moving.has('turnleft'));
  // Turning must remain available after the Forge room selector updates.
  const turnTarget=-turn*1.5;
  S.turnSpeed+=(turnTarget-S.turnSpeed)*Math.min(1,dt*(turn?7:10));
  S.yaw+=S.turnSpeed*dt;
  S.facingYaw=S.yaw;
  const f=Number(S.moving.has('forward')&&!S.requireFreshForward)-Number(S.moving.has('backward'));
  const targetSpeed=f*(S.moving.has('sprint')?4.6:2.55);
  S.speed+=(targetSpeed-S.speed)*Math.min(1,dt*(f?7:11));
  if(Math.abs(S.speed)>.015){
    const dx=-Math.sin(S.yaw)*S.speed*dt;
    const dz=-Math.cos(S.yaw)*S.speed*dt;
    step(dx,dz);
  }
  if(!S.mouse&&Math.abs(S.lookYaw)>.001&&performance.now()>S.lookUntil){
    S.lookYaw=angleTo(S.lookYaw,0,Math.min(1,dt*1.8));
  }
  const len=Math.abs(S.speed);
  const moving=len>.001;
  stride+=dt*(moving?10:0);const a=moving?Math.sin(stride)*.45:0;
  legs[0].rotation.x=a;legs[1].rotation.x=-a;
  arms[0].rotation.x=-a*.75;arms[1].rotation.x=a*.75;
  torso.position.y=moving?Math.abs(Math.sin(stride))*.035:0;
  follow(dt);
 }
 const keymap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'turnleft',KeyD:'turnright',ArrowLeft:'turnleft',ArrowRight:'turnright',ShiftLeft:'sprint',ShiftRight:'sprint'};
 window.addEventListener('keydown',e=>{if(!S.active)return;const m=keymap[e.code];if(m){S.moving.add(m);e.preventDefault();e.stopPropagation();return;}if(e.code==='KeyV'){changeCamera();e.preventDefault();return;}if(e.code==='Escape'){exit();e.preventDefault();return;}},true);
 document.addEventListener('keyup',e=>{const m=keymap[e.code];if(m){S.moving.delete(m);if(m==='forward')S.requireFreshForward=false;}});window.addEventListener('blur',()=>S.moving.clear());
 canvas.addEventListener('pointerdown',e=>{if(!S.active)return;S.mouse=true;S.px=e.clientX;S.py=e.clientY;});canvas.addEventListener('pointermove',e=>{if(!S.active||!S.mouse)return;S.lookYaw=clamp(S.lookYaw-(e.clientX-S.px)*.004,-1.15,1.15);S.lookUntil=performance.now()+950;S.pitch=clamp(S.pitch-(e.clientY-S.py)*.004,-topPitch,topPitch);S.px=e.clientX;S.py=e.clientY;});for(const event of ['pointerup','pointercancel','pointerleave'])canvas.addEventListener(event,()=>S.mouse=false);
 for(const btn of panel.querySelectorAll('[data-walk]')){const m=btn.dataset.walk;btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);S.moving.add(m)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(evt,()=>S.moving.delete(m));}
 q('bh-walk-toggle').onclick=()=>S.active?exit():enter();q('bh-walk-exit').onclick=exit;q('bh-walk-camera').onclick=changeCamera;q('bh-director-mode').onclick=changeDirector;q('bh-camera-plan').onclick=saveCameraPlan;
 q('bh-walk-next').onclick=()=>{const ids=S.room?getConnections(S.room.id)||[]:[];if(!ids.length){status('No linked room in navigation graph');return;}exit();selectRoom(ids[0]);enter();status('QA connection jump (not physical door travel)');};
 function onRoomChanged(){if(!S.active)return;S.room=getRoom();placeAtCenter(S.room);sync();follow(.05,true);}
 return {enter,exit,update,onRoomChanged,get active(){return S.active},get position(){return [S.x,bnd(S.room)?.y??0,S.z]},get currentRoomId(){return S.room?.id||null},get doorStates(){return [...doorMeshes].map(([id,d])=>({shared:id,open:d.open}))},get cameraPlan(){return cameraPlan()},get directorMode(){return S.directorMode}};
}
