// Black Hollow Forge 4.2 — cinematic explorer + verified automatic doorway crossing.
// Preview navigation, not a certified physics engine. Closed/locked doors require game logic.
export function createCinematicWalkthrough(THREE,{scene,camera,controls,canvas,getRoom,levelY,selectRoom,getConnections,isReady}){
 const S={active:false,room:null,x:0,z:0,yaw:0,pitch:0,moving:new Set(),mouse:false,px:0,py:0,mode:'cinematic',clock:performance.now(),hintUntil:0};
 const K=.3048,margin=.25,eye=1.68,radius=.23,topPitch=0.65;
 const panel=document.createElement('section');panel.id='bh-walk-panel';panel.innerHTML=`<style>
 #bh-walk-panel{position:fixed;z-index:1200;bottom:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:5px;width:min(94vw,820px);padding:8px;background:#10131ef0;color:#f6e8d7;border:1px solid #a08462;border-radius:12px;font:12px system-ui;box-sizing:border-box}#bh-walk-panel button{background:#342839;color:#fff;border:1px solid #997a62;padding:8px;border-radius:7px;cursor:pointer}#bh-walk-panel .walking{display:none}#bh-walk-panel.active .walking{display:inline-block}#bh-walk-panel small{width:100%;text-align:center;color:#d3bfa6}#bh-walk-panel .room{font-weight:bold}#bh-walk-panel .touch{touch-action:none}#bh-walk-panel #bh-walk-status{color:#e8cc9a}</style>
 <button id="bh-walk-toggle">Enter Cinematic Explorer</button><span class="room" id="bh-walk-room">Room inspection</span><button class="walking" id="bh-walk-camera">Camera: CINEMATIC</button><button class="walking" id="bh-walk-exit">Exit</button><button class="walking touch" data-walk="forward">▲</button><button class="walking touch" data-walk="turnleft">↶</button><button class="walking touch" data-walk="backward">▼</button><button class="walking touch" data-walk="turnright">↷</button><button class="walking" id="bh-walk-next">Next linked room (QA)</button><small id="bh-walk-status">W/S walk · A/D strafe · ←/→ turn · drag look · V changes camera · doors automatically cross when matched</small>`;
 document.body.append(panel);const q=id=>panel.querySelector('#'+id);const avatar=new THREE.Group();avatar.name='forge_victorian_explorer_preview';
 const coat=new THREE.MeshStandardMaterial({color:0x27334a,roughness:.9}),vest=new THREE.MeshStandardMaterial({color:0x665344}),skin=new THREE.MeshStandardMaterial({color:0xc6a68c}),hat=new THREE.MeshStandardMaterial({color:0x191922}),cloth=new THREE.MeshStandardMaterial({color:0x252733}),boots=new THREE.MeshStandardMaterial({color:0x17161c});
 function addBox(parent,w,h,d,x,y,z,material){let a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);a.position.set(x,y,z);parent.add(a);return a}
 const torso=new THREE.Group();avatar.add(torso);const body=new THREE.Mesh(new THREE.CylinderGeometry(.26,.37,1.08,10),coat);body.position.y=1.2;torso.add(body);addBox(torso,.29,.5,.09,0,1.30,-.28,vest);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.245,12,10),skin);head.position.y=1.96;torso.add(head);const brim=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.055,14),hat);brim.position.y=2.19;torso.add(brim);const crown=new THREE.Mesh(new THREE.CylinderGeometry(.245,.29,.34,12),hat);crown.position.y=2.39;torso.add(crown);
 const legs=[],arms=[];for(const side of [-1,1]){let leg=new THREE.Group();leg.position.set(side*.16,.71,0);avatar.add(leg);addBox(leg,.22,.72,.25,0,-.32,0,cloth);addBox(leg,.26,.15,.38,0,-.74,-.09,boots);legs.push(leg);let arm=new THREE.Group();arm.position.set(side*.34,1.57,0);torso.add(arm);addBox(arm,.17,.65,.18,side*.015,-.3,0,coat);arms.push(arm)}
 avatar.visible=false;
 function bnd(r){const b=r?.boundsFeet;if(!b)return null;return {minX:b.x*K,maxX:(b.x+b.l)*K,minZ:b.y*K,maxZ:(b.y+b.w)*K,y:levelY(r.floor),floor:r.floor};}
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function sync(){panel.classList.toggle('active',S.active);q('bh-walk-toggle').textContent=S.active?'Explorer ON':'Enter Cinematic Explorer';q('bh-walk-room').textContent=S.room?.name||'Room inspection';q('bh-walk-camera').textContent='Camera: '+S.mode.toUpperCase();avatar.visible=S.active&&S.mode!=='first';}
 function status(t){q('bh-walk-status').textContent=t;}
 function orient(){const dir=new THREE.Vector3(-Math.sin(S.yaw),0,-Math.cos(S.yaw));return dir;}
 function placeAtCenter(r){const b=bnd(r);if(!b)return;S.x=(b.minX+b.maxX)*.5;S.z=(b.minZ+b.maxZ)*.5;}
 function enter(){if(!isReady())return false;S.room=getRoom();const b=bnd(S.room);if(!b)return false;S.active=true;S.mode='cinematic';S.moving.clear();placeAtCenter(S.room);S.yaw=0;S.pitch=0;controls.enabled=false;S.clock=performance.now();if(scene&&avatar.parent!==scene)scene.add(avatar);sync();follow(.05,true);status('Cinematic explorer · W/S walk · arrows turn · approach a matched door to cross automatically');return true;}
 function exit(){S.active=false;S.moving.clear();S.mouse=false;avatar.visible=false;controls.enabled=true;camera.fov=62;camera.updateProjectionMatrix();sync();}
 function changeCamera(){S.mode=S.mode==='cinematic'?'explorer':S.mode==='explorer'?'first':'cinematic';sync();follow(.05,true)}
 // Only a matched, same-floor architect-door is walkable. Magical elevator and stairs stay explicit.
 function doorPortal(r,o){const b=bnd(r);if(!b||!o||o.type!=='door'||!o.shared)return null;const pos=clamp(Number(o.pos??.5),0,1),w=clamp(Number(o.width||o.widthFeet||3)*K, .65, 2.1);let x,z,axis,dir;
 if(o.wall==='left'){x=b.minX;z=b.minZ+(b.maxZ-b.minZ)*pos;axis='x';dir=-1}
 else if(o.wall==='right'){x=b.maxX;z=b.minZ+(b.maxZ-b.minZ)*pos;axis='x';dir=1}
 else if(o.wall==='top'){z=b.minZ;x=b.minX+(b.maxX-b.minX)*pos;axis='z';dir=-1}
 else if(o.wall==='bottom'){z=b.maxZ;x=b.minX+(b.maxX-b.minX)*pos;axis='z';dir=1}
 else return null;return {x,z,axis,dir,half:Math.max(.22,w*.5-radius),shared:o.shared};}
 function findPassage(nx,nz){const r=S.room,b=bnd(r);if(!r||!b)return null;const over=nx<b.minX?'left':nx>b.maxX?'right':nz<b.minZ?'top':nz>b.maxZ?'bottom':null;if(!over)return null;
 const portal=(r.openings||[]).filter(o=>o.wall===over).map(o=>doorPortal(r,o)).find(p=>p&&Math.abs(p.axis==='x'?nz-p.z:nx-p.x)<=p.half);if(!portal)return null;
 const ids=getConnections(r.id)||[];for(const id of ids){const other=window.__forgeWalkRooms?.find(a=>a.id===id);if(!other||other.floor!==r.floor)continue;const destOpen=(other.openings||[]).some(o=>o.type==='door'&&o.shared===portal.shared);if(!destOpen)continue;const bb=bnd(other);if(!bb)continue;const gap=portal.axis==='x'?(portal.dir>0?bb.minX-b.maxX:b.minX-bb.maxX):(portal.dir>0?bb.minZ-b.maxZ:b.minZ-bb.maxZ);
 // Tolerate tiny blueprint rounding, never jump through a distant disconnected structure.
 if(Math.abs(gap)>.25)continue;
 return {room:other,box:bb,portal};}return null;}
 // Explicit registration of navigation data is provided by index.html; no fabricated door pairs.
 function step(dx,dz){const dist=Math.hypot(dx,dz),count=Math.max(1,Math.ceil(dist/.08));for(let i=0;i<count;i++){const nx=S.x+dx/count,nz=S.z+dz/count,b=bnd(S.room);if(!b)break;
 const p=findPassage(nx,nz);if(p){S.room=p.room;S.x=clamp(nx,p.box.minX+margin,p.box.maxX-margin);S.z=clamp(nz,p.box.minZ+margin,p.box.maxZ-margin);sync();selectRoom(p.room.id);status('Automatically entered '+p.room.name);continue;}
 S.x=clamp(nx,b.minX+margin,b.maxX-margin);S.z=clamp(nz,b.minZ+margin,b.maxZ-margin);
 }}
 function follow(dt,instant=false){const b=bnd(S.room);if(!b)return;let floor=b.y;avatar.position.set(S.x,floor,S.z);avatar.rotation.y=S.yaw;const face=orient(),cameraY=floor+eye;
 if(S.mode==='first'){camera.position.set(S.x,cameraY,S.z);camera.lookAt(S.x+face.x*5,cameraY+Math.tan(S.pitch)*5,S.z+face.z*5);avatar.visible=false;return;}
 avatar.visible=true;const dist=S.mode==='cinematic'?5.4:3.3,raise=S.mode==='cinematic'?3.0:2.4;
 const look=new THREE.Vector3(S.x,floor+1.40,S.z),desired=new THREE.Vector3(S.x-face.x*dist,floor+raise,S.z-face.z*dist);
 // Avoid blindly clamping a camera to a small room and rendering a wall directly in its face.
 desired.x=clamp(desired.x,b.minX+.15,b.maxX-.15);desired.z=clamp(desired.z,b.minZ+.15,b.maxZ-.15);
 if(instant)camera.position.copy(desired);else camera.position.lerp(desired,Math.min(1,dt*6));camera.lookAt(look.x+face.x*1.4,look.y+S.pitch,look.z+face.z*1.4);
 }
 let stride=0;
 function update(t){let dt=Math.min(.05,Math.max(0,(t-S.clock)/1000));S.clock=t;if(!S.active)return;let turn=(Number(S.moving.has('turnright'))-Number(S.moving.has('turnleft')));S.yaw+=turn*dt*1.8;
 let f=Number(S.moving.has('forward'))-Number(S.moving.has('backward')),side=Number(S.moving.has('right'))-Number(S.moving.has('left'));const len=Math.hypot(f,side)||1;f/=len;side/=len;const dir=orient(),speed=S.moving.has('sprint')?5.4:3.1;const dx=(dir.x*f+(-dir.z)*side)*speed*dt,dz=(dir.z*f+dir.x*side)*speed*dt;step(dx,dz);
 const moving=Math.hypot(dx,dz)>.0001;stride+=dt*(moving?10:0);const a=moving?Math.sin(stride)*.45:0;legs[0].rotation.x=a;legs[1].rotation.x=-a;arms[0].rotation.x=-a*.75;arms[1].rotation.x=a*.75;torso.position.y=moving?Math.abs(Math.sin(stride))*.035:0;follow(dt);
 }
 const keymap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',KeyD:'right',ArrowLeft:'turnleft',ArrowRight:'turnright',ShiftLeft:'sprint',ShiftRight:'sprint'};
 document.addEventListener('keydown',e=>{if(!S.active||e.target?.closest?.('input,textarea,select'))return;if(e.code==='KeyV'){changeCamera();e.preventDefault();return;}if(e.code==='Escape'){exit();return;}const m=keymap[e.code];if(m){S.moving.add(m);e.preventDefault();}});
 document.addEventListener('keyup',e=>{const m=keymap[e.code];if(m)S.moving.delete(m);});window.addEventListener('blur',()=>S.moving.clear());
 canvas.addEventListener('pointerdown',e=>{if(!S.active)return;S.mouse=true;S.px=e.clientX;S.py=e.clientY;});canvas.addEventListener('pointermove',e=>{if(!S.active||!S.mouse)return;S.yaw+=(e.clientX-S.px)*.004;S.pitch=clamp(S.pitch-(e.clientY-S.py)*.004,-topPitch,topPitch);S.px=e.clientX;S.py=e.clientY;});for(const event of ['pointerup','pointercancel','pointerleave'])canvas.addEventListener(event,()=>S.mouse=false);
 for(const btn of panel.querySelectorAll('[data-walk]')){const m=btn.dataset.walk;btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);S.moving.add(m)});for(const evt of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(evt,()=>S.moving.delete(m));}
 q('bh-walk-toggle').onclick=()=>S.active?exit():enter();q('bh-walk-exit').onclick=exit;q('bh-walk-camera').onclick=changeCamera;
 q('bh-walk-next').onclick=()=>{const ids=S.room?getConnections(S.room.id)||[]:[];if(!ids.length){status('No linked room in navigation graph');return;}exit();selectRoom(ids[0]);enter();status('QA connection jump (not physical door travel)');};
 function onRoomChanged(){if(!S.active)return;S.room=getRoom();placeAtCenter(S.room);sync();follow(.05,true);}
 return {enter,exit,update,onRoomChanged,get active(){return S.active},get position(){return [S.x,bnd(S.room)?.y??0,S.z]}};
}
