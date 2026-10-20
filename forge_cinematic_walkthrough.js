// Black Hollow Forge 3.0: Room-safe cinematic visual inspection.
// Non-destructive camera control. Architectural collision is conservative room-bounds
// containment; it is NOT a replacement for the game's physics/collision system.
export function createCinematicWalkthrough(THREE,{camera,controls,canvas,getRoom,levelY,selectRoom,getConnections,isReady}){
 const state={active:false,yaw:0,pitch:0,move:new Set(),speed:1.25,mouseDown:false,dragX:0,dragY:0,room:null};
 const eye=1.64, margin=.38, pitchMax=1.25;
 let last=performance.now();
 const root=document.createElement('section');root.id='bh-walk-panel';root.setAttribute('aria-label','Cinematic walkthrough controls');
 root.innerHTML=`<style>
 #bh-walk-panel{position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:1200;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;max-width:min(96vw,700px);padding:9px 12px;border:1px solid #997a54;background:#10131eea;color:#f5ead6;border-radius:13px;box-shadow:0 9px 35px #0009;font:12px system-ui}#bh-walk-panel button{background:#302738;border:1px solid #a18b6e;border-radius:7px;color:#fff;padding:8px 11px;cursor:pointer;touch-action:none}#bh-walk-panel button[aria-pressed=true]{background:#71533c}#bh-walk-panel .nav{display:none}#bh-walk-panel.active .nav{display:inline-block}#bh-walk-panel .hint{width:100%;text-align:center;color:#d6c8b5}#bh-walk-panel .nav:active{background:#826f58}#bh-walk-panel .room{font-weight:700;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#bh-walk-panel.active .hint{display:none}@media(pointer:coarse){#bh-walk-panel.active .nav{padding:12px 14px}}</style><button id="bh-walk-toggle" type="button" aria-pressed="false">Enter Walkthrough</button><span id="bh-walk-room" class="room">Room inspection</span><button id="bh-walk-next" type="button" class="nav">Next connected room ↪</button><button id="bh-walk-shot" type="button" class="nav">📷 Screenshot</button><button id="bh-walk-exit" type="button" class="nav">Exit</button><button class="nav" data-move="forward">▲</button><button class="nav" data-move="left">◀</button><button class="nav" data-move="backward">▼</button><button class="nav" data-move="right">▶</button><div class="hint">Walk mode: WASD / arrows · drag to look · screenshot button</div>`;
 document.body.append(root);
 const q=s=>root.querySelector(s);
 function sync(){root.classList.toggle('active',state.active);q('#bh-walk-toggle').textContent=state.active?'Walkthrough ON':'Enter Walkthrough';q('#bh-walk-toggle').setAttribute('aria-pressed',String(state.active));q('#bh-walk-room').textContent=state.room?.name||'Room inspection';}
 function bounds(r){if(!r?.boundsFeet)return null;const b=r.boundsFeet,k=.3048;return {minX:b.x*k+margin,maxX:(b.x+b.l)*k-margin,minZ:b.y*k+margin,maxZ:(b.y+b.w)*k-margin,y:levelY(r.floor)+eye};}
 function updateRoom(){state.room=getRoom();sync();}
 function enter(){if(!isReady())return false;updateRoom();let b=bounds(state.room);if(!b||b.maxX<=b.minX||b.maxZ<=b.minZ)return false;
  state.active=true;controls.enabled=false;state.move.clear();
  camera.position.set(Math.max(b.minX,Math.min(b.maxX,camera.position.x)),b.y,Math.max(b.minZ,Math.min(b.maxZ,camera.position.z)));
  const facing=controls.target.clone().sub(camera.position);if(facing.lengthSq()<.01)facing.set(0,0,-1);
  state.yaw=Math.atan2(-facing.x,-facing.z);state.pitch=Math.max(-pitchMax,Math.min(pitchMax,Math.atan2(facing.y,Math.hypot(facing.x,facing.z))));
  camera.fov=68;camera.near=.035;camera.updateProjectionMatrix();sync();look();return true;
 }
 function exit(){state.active=false;state.move.clear();state.mouseDown=false;controls.enabled=true;camera.fov=62;camera.updateProjectionMatrix();sync();}
 function look(){const cp=Math.cos(state.pitch);camera.lookAt(camera.position.x-Math.sin(state.yaw)*cp,camera.position.y+Math.sin(state.pitch),camera.position.z-Math.cos(state.yaw)*cp);}
 function update(t){let dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!state.active)return;const b=bounds(state.room);if(!b){exit();return;}
  let f=(state.move.has('forward')?1:0)-(state.move.has('backward')?1:0);let s=(state.move.has('right')?1:0)-(state.move.has('left')?1:0);const len=Math.hypot(f,s)||1;f/=len;s/=len;
  const dx=(-Math.sin(state.yaw)*f+Math.cos(state.yaw)*s)*state.speed*dt;
  const dz=(-Math.cos(state.yaw)*f-Math.sin(state.yaw)*s)*state.speed*dt;
  camera.position.x=Math.max(b.minX,Math.min(b.maxX,camera.position.x+dx));camera.position.z=Math.max(b.minZ,Math.min(b.maxZ,camera.position.z+dz));camera.position.y=b.y;look();
 }
 const keymap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
 document.addEventListener('keydown',e=>{if(!state.active||e.target.closest('input,textarea,select'))return;if(keymap[e.code]){state.move.add(keymap[e.code]);e.preventDefault()}if(e.code==='Escape')exit();});
 document.addEventListener('keyup',e=>{if(keymap[e.code])state.move.delete(keymap[e.code])});
 window.addEventListener('blur',()=>state.move.clear());
 canvas.addEventListener('pointerdown',e=>{if(!state.active)return;state.mouseDown=true;state.dragX=e.clientX;state.dragY=e.clientY;});
 canvas.addEventListener('pointermove',e=>{if(!state.active||!state.mouseDown)return;let dx=e.clientX-state.dragX,dy=e.clientY-state.dragY;state.dragX=e.clientX;state.dragY=e.clientY;state.yaw+=dx*.004;state.pitch=Math.max(-pitchMax,Math.min(pitchMax,state.pitch-dy*.004));});
 for(const name of ['pointerup','pointercancel','pointerleave'])canvas.addEventListener(name,()=>{state.mouseDown=false});
 for(const b of root.querySelectorAll('[data-move]')){const m=b.dataset.move;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);state.move.add(m)});
  for(const evt of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(evt,()=>state.move.delete(m));
 }
 q('#bh-walk-toggle').onclick=()=>state.active?exit():enter();q('#bh-walk-exit').onclick=exit;
 q('#bh-walk-next').onclick=()=>{if(!state.active)return;const links=getConnections(state.room?.id)||[];if(!links.length){q('#bh-walk-room').textContent='No connected room';return;}const id=links[0];exit();selectRoom(id);enter();};
 q('#bh-walk-shot').onclick=()=>{if(!state.active)return;document.getElementById('screenshot')?.click();};
 function onRoomChanged(){if(!state.active)return;updateRoom();const b=bounds(state.room);if(!b){exit();return;}camera.position.set((b.minX+b.maxX)/2,b.y,(b.minZ+b.maxZ)/2);look();}
 return {enter,exit,update,onRoomChanged,get active(){return state.active},get position(){return camera.position.toArray()}};
}
