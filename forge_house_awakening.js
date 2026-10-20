// Black Hollow 2.9 — The House Awakens. Scene-only theatrical presentation.
// No student blueprint, collision graph, model asset, or gameplay state is changed.
export function createHouseAwakening(THREE,scene,camera,{mobile=false}={}){
 let active=false,t0=0,center=new THREE.Vector3(),size=new THREE.Vector3(30,15,30),ghost=null,embers=null;
 const group=new THREE.Group();group.name='the_house_awakens_fx';group.visible=false;scene.add(group);
 const chill=new THREE.PointLight(0x78ffed,0,38,2);group.add(chill);
 const rand=(()=>{let s=0x8c0f231;return ()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/4294967296)})();
 const count=mobile?120:320,positions=new Float32Array(count*3),speeds=new Float32Array(count);
 for(let i=0;i<count;i++){positions[i*3]=(rand()-.5)*28;positions[i*3+1]=rand()*12;positions[i*3+2]=(rand()-.5)*28;speeds[i]=.18+rand()*.44}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const mat=new THREE.PointsMaterial({color:0x8cebd8,size:mobile?.08:.095,transparent:true,opacity:.48,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});embers=new THREE.Points(geo,mat);group.add(embers);
 function spawnGhost(){if(ghost)return;ghost=new THREE.Group();const translucent=new THREE.MeshPhysicalMaterial({color:0xa6f7ef,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide,roughness:.35,emissive:0x163b38,emissiveIntensity:.45});
 // tapered spectral silhouette, avoiding any copyrighted character assets
 const body=new THREE.Mesh(new THREE.ConeGeometry(.7,2.6,22,1,true),translucent);body.rotation.z=Math.PI;body.position.y=.85;ghost.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.38,18,12),translucent);head.position.y=2.3;ghost.add(head);
 const eye=new THREE.MeshBasicMaterial({color:0xccfff6,transparent:true,opacity:.78,depthWrite:false});for(const x of [-.13,.13]){const e=new THREE.Mesh(new THREE.SphereGeometry(.038,8,6),eye);e.position.set(x,2.34,.346);ghost.add(e)}
 const halo=new THREE.PointLight(0x65eed8,mobile?1.2:2.3,9,2);halo.position.y=1.4;ghost.add(halo);group.add(ghost)}
 function bounds(box){if(!box||box.isEmpty())return;box.getCenter(center);box.getSize(size);group.position.copy(center);group.position.y=center.y-size.y*.5;}
 function start(now=performance.now()){spawnGhost();active=true;t0=now;group.visible=true;return true}
 function stop(){active=false;group.visible=false;chill.intensity=0}
 function update(now){if(!active)return null;const t=(now-t0)/1000;
 // The haunting is intentionally finite; standard camera controls remain independent.
 const slow=Math.min(1,Math.max(0,t/2)),fade=Math.min(1,Math.max(0,(16-t)/3));if(t>16){stop();return {done:true,t}}
 const p=geo.attributes.position;for(let i=0;i<count;i++){let y=p.getY(i)+speeds[i]*.009;if(y>12)y=0;p.setY(i,y)}p.needsUpdate=true;
 mat.opacity=.42*slow*fade;
 ghost.position.set(Math.sin(t*.52)*Math.min(size.x*.24,7),1.3+Math.sin(t*1.13)*.48,Math.cos(t*.43)*Math.min(size.z*.2,6));ghost.rotation.y=Math.atan2(camera.position.x-(center.x+ghost.position.x),camera.position.z-(center.z+ghost.position.z));
 ghost.scale.setScalar(.84+.10*Math.sin(t*.87));ghost.visible=t>3&&t<14;chill.position.set(ghost.position.x,3,ghost.position.z);chill.intensity=(t>3&&t<14?2.3:0)*(1+.4*Math.sin(t*2.6));
 return {t,ghostVisible:ghost.visible,flash:t>10.4&&t<10.6};
 }
 return {bounds,start,stop,update,get active(){return active},group};
}
