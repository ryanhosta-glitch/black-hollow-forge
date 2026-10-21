// Black Hollow Forge — atmosphere-only lighting: no blueprint mutation.
export function createGothicLighting(THREE,scene,renderer,{mobile=false}={}){
  const MAX=mobile?3:7;
  const warm=Array.from({length:MAX},(_,i)=>{
    const p=new THREE.PointLight(0xffb767,0, mobile?11:14,2);
    p.name='forge_adaptive_room_light_'+i;p.castShadow=false;scene.add(p);return p;
  });
  let candidates=[],mode='day',lastUpdate=0;
  const palettes={day:{ambient:2.0,sun:2.45,moon:.14,exposure:1.14,lamps:.10},dusk:{ambient:.82,sun:1.08,moon:.48,exposure:1.23,lamps:1.45},night:{ambient:.52,sun:.22,moon:1.0,exposure:1.35,lamps:1.95},spectral:{ambient:.55,sun:.10,moon:1.55,exposure:1.21,lamps:.95}};
  const styleColor={library:0xffbb77,study:0xffbd79,ballroom:0xffd3a0,dining:0xffb66a,crypt:0x88b5dd,vault:0xa3bbdf,chapel:0xffd4a6,conservatory:0x98d5ad,laboratory:0x99ccd0,nursery:0xffca88,bedroom:0xffbc7e};
  const tmp=new THREE.Vector3();
  function setRooms(rooms,levels){
    candidates=(rooms||[]).map(r=>{
      const b=r.boundsFeet;if(!b)return null;
      const f=Number(r.floor)||0;
      const name=String(r.roomType||r.type||r.name||'').toLowerCase();
      const kind=Object.keys(styleColor).find(k=>name.includes(k))||'generic';
      const height=Math.max(1.5,Math.min(3.4,(Number(b.h)||10)*.3048*.74));
      return {id:r.id,kind,color:styleColor[kind]||0xffbd80,
        pos:new THREE.Vector3((b.x+b.l/2)*.3048,(levels[f]??(f*3.048))+height,(b.y+b.w/2)*.3048),
        weight:kind==='generic'?1:1.25};
    }).filter(Boolean);
  }
  function setMode(next,ambient,sun,moon){
    mode=palettes[next]?next:'day';const p=palettes[mode];
    if(ambient)ambient.intensity=p.ambient;
    if(sun){sun.intensity=p.sun;sun.color.set(mode==='day'?0xfff0d7:mode==='dusk'?0xffd0a0:0xc5d3ed)}
    if(moon)moon.intensity=p.moon;
    renderer.toneMappingExposure=p.exposure;
    if(mode==='spectral')warm.forEach(l=>l.color.set(0x95c6f9));
    return mode;
  }
  function update(camera,view='estate',now=performance.now()){
    if(now-lastUpdate<230)return;lastUpdate=now;
    if(view!=='estate'||!candidates.length){warm.forEach(l=>l.intensity=0);return}
    const p=palettes[mode];
    // Select nearest rooms; fixed-size pooled lights prevent dozens of active lights.
    const nearest=candidates.map(c=>({c,d:c.pos.distanceToSquared(camera.position)/c.weight})).sort((a,b)=>a.d-b.d).slice(0,MAX);
    for(let i=0;i<warm.length;i++){
      const light=warm[i],r=nearest[i];if(!r){light.intensity=0;continue}
      light.position.copy(r.c.pos);
      light.color.set(mode==='spectral'?0x91c1ee:r.c.color);
      const attenuation=1/(1+Math.max(0,r.d-100)/900);
      light.intensity=p.lamps*attenuation;
    }
  }
  return {setRooms,setMode,update,get mode(){return mode},count:MAX};
}
