// Black Hollow Forge: architecture-aware visual atmosphere, no collision or blueprint mutation.
export function authoredWindows(rooms){return (rooms||[]).flatMap(room=>(room.openings||[]).filter(o=>/^(window|stained[-_ ]?glass)$/i.test(String(o.type||''))).map(o=>({room,opening:o})));}
export function roomWearProfile(room){const k=(room.roomType||room.type||room.name||'').toLowerCase();const haunting=Number(room.haunting||0);return {dust: /crypt|attic|storage|abandon|cellar/.test(k)?1.25:0.55, moisture:/crypt|basement|conservatory|bath|cellar/.test(k)?0.85:0.18, age:Math.min(.9,.22+haunting*.03)};}
export function createAtmosphericDetails(THREE,scene,{mobile=false}={}){
 const group=new THREE.Group();group.name='forge_visual_atmosphere_noncolliding';scene.add(group);
 const dustCount=mobile?100:320,random=(()=>{let s=17419;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)})();
 const positions=new Float32Array(dustCount*3),speeds=new Float32Array(dustCount),phases=new Float32Array(dustCount);
 const geometry=new THREE.BufferGeometry();for(let i=0;i<dustCount;i++){speeds[i]=.12+.18*random();phases[i]=random()*Math.PI*2;positions[3*i]=(random()-.5)*12;positions[3*i+1]=random()*3.1+.2;positions[3*i+2]=(random()-.5)*9}geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const dustMat=new THREE.PointsMaterial({color:0xdccaaa,size:mobile?.023:.035,transparent:true,opacity:mobile?.22:.32,depthWrite:false,sizeAttenuation:true});const dust=new THREE.Points(geometry,dustMat);dust.frustumCulled=false;group.add(dust);
 // Candle smoke is purely decorative, spawned only around configured, actual fixture locations.
 const smokeGeo=new THREE.BufferGeometry(),smokeCount=mobile?18:44,smokePos=new Float32Array(smokeCount*3),smokeOpacity=[];smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokePos,3));const smokeMat=new THREE.PointsMaterial({color:0x8c9ba5,size:.09,transparent:true,opacity:.16,depthWrite:false});const smoke=new THREE.Points(smokeGeo,smokeMat);group.add(smoke);
 let enabled=true, origin=new THREE.Vector3(), roomSize={x:10,y:3,z:8},sources=[];
 function enter(room,elevation=0){if(!room)return;const b=room.boundsFeet||{},k=.3048;origin.set(((b.x||0)+(b.l||0)/2)*k,elevation,((b.y||0)+(b.w||0)/2)*k);roomSize={x:Math.max(2,(b.l||20)*k),y:Math.max(2,(b.h||10)*k),z:Math.max(2,(b.w||14)*k)};dust.position.copy(origin);sources=[];group.visible=enabled;}
 function setSmokeSources(points){sources=(points||[]).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)).slice(0,8);smoke.visible=sources.length>0;}
 function update(seconds){if(!enabled||!group.visible)return;const a=dust.geometry.attributes.position;for(let i=0;i<dustCount;i++){const p=i*3;a.array[p]+=.001*Math.sin(seconds*.55+phases[i]);a.array[p+1]=.2+((a.array[p+1]+speeds[i]*.008)%Math.max(.3,roomSize.y-.3));if(Math.abs(a.array[p])>roomSize.x/2)a.array[p]*=.85;if(Math.abs(a.array[p+2])>roomSize.z/2)a.array[p+2]*=.85;}a.needsUpdate=true;
 if(sources.length){for(let i=0;i<smokeCount;i++){const source=sources[i%sources.length],v=(seconds*.12+i*.173)%1;smokePos[3*i]=source.x+.12*Math.sin(i*2.4+seconds*.7)*v;smokePos[3*i+1]=source.y+v*1.2;smokePos[3*i+2]=source.z+.13*Math.cos(i*1.9+seconds*.5)*v;}smokeGeo.attributes.position.needsUpdate=true;}}
 function setEnabled(v){enabled=!!v;group.visible=enabled;}
 function dispose(){scene.remove(group);geometry.dispose();dustMat.dispose();smokeGeo.dispose();smokeMat.dispose();}
 return {group,enter,update,setSmokeSources,setEnabled,dispose};
}
