// Black Hollow Forge — Grand Hall cinematic light rig (viewer only).
// Lighting is positioned using the student's authored room bounds; it is not collision geometry.
export function createGrandHallIllumination(THREE, scene, renderer, {mobile=false}={}) {
 const group=new THREE.Group();group.name='grand_hall_cinematic_lighting';scene.add(group);
 let bounds=null,level=0,mode='day',enabled=true,quality=mobile?'mobile':'desktop', exposureTrim=0;
 const lights=[];
 const profiles={
  day:{warm:.36,moon:.35,exposure:1.06},
  dusk:{warm:1.8,moon:.75,exposure:1.10},
  night:{warm:2.3,moon:1.22,exposure:1.10},
  spectral:{warm:.78,moon:2.05,exposure:1.03}
 };
 function point(name,color,power,range){const l=new THREE.PointLight(color,power,range,2);l.name=name;l.castShadow=false;group.add(l);lights.push(l);return l}
 const chandelier=point('grand_hall_real_chandelier_illumination',0xffc18b,0,9);
 const sconces=[point('grand_hall_sconce_left',0xffa86b,0,5.5),point('grand_hall_sconce_right',0xffad71,0,5.5)];
 const moon=new THREE.SpotLight(0xabcaff,0,20,Math.PI/5,.65,1.25);
 moon.name='grand_hall_moonlight_window_wash';moon.castShadow=false;group.add(moon,moon.target);
 function setHall(room,levels){if(!room?.boundsFeet)return false;
  const b=room.boundsFeet,ft=.3048;
  const cx=(b.x+b.l*.5)*ft,cz=(b.y+b.w*.5)*ft;
  const sy=levels?.[room.floor]??(room.floor*3.048);
  const h=Math.max(2.1,(Number(b.h)||10)*ft),w=b.l*ft,d=b.w*ft;
  level=room.floor;bounds={cx,cz,sy,h,w,d};
  chandelier.position.set(cx,sy+Math.min(h*.75,h-.6),cz);
  sconces[0].position.set(cx-w*.39,sy+Math.min(2.3,h-.45),cz-d*.28);
  sconces[1].position.set(cx+w*.39,sy+Math.min(2.3,h-.45),cz+d*.28);
  moon.position.set(cx-w*.45,sy+h*.82,cz-d*.47);
  moon.target.position.set(cx,sy+.4,cz);
  return true;
 }
 function setMode(m){mode=profiles[m]?m:'day';updateIntensity()}
 function setEnabled(on){enabled=!!on;updateIntensity()}
 function setQuality(q){quality=q==='cinematic'?'cinematic':q==='desktop'?'desktop':'mobile';updateIntensity()}
 function setExposureTrim(x){exposureTrim=Math.max(-.5,Math.min(.5,Number(x)||0));updateIntensity()}
 function updateIntensity(){const p=profiles[mode],scale=quality==='mobile'?.65:quality==='cinematic'?1.25:1;
  const active=enabled&&bounds;
  chandelier.intensity=active?p.warm*scale:0;
  sconces.forEach((l,i)=>l.intensity=active&&quality!=='mobile'?p.warm*.32*scale:0);
  moon.intensity=active?p.moon*scale:0;
  // The adaptive lighting studio owns base exposure; trim is applied separately by main viewer.
 }
 function update(camera,activeScene,selectedFloor,wholeHouse){
  // In a single-floor estate preview hide the rig if it isn't the displayed hall floor.
  group.visible=!!bounds&&enabled&&activeScene==='estate'&&(wholeHouse||selectedFloor===level);
 }
 setMode('day');
 return {setHall,setMode,setEnabled,setQuality,setExposureTrim,update,get quality(){return quality},get exposureTrim(){return exposureTrim},get lights(){return lights.length+1}};
}
