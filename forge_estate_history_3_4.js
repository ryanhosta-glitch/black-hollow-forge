// Black Hollow Forge 3.4 — environmental history, viewer-only.
// Deterministic, lightweight, room-aware overlays. No geometry, blueprint or furniture edits.
export function createEstateHistory(THREE,scene,{mobile=false}={}) {
  const group=new THREE.Group();group.name='Forge_3_4_Room_History';scene.add(group);
  const shared=[];let enabled=true,sceneEnabled=true;let last=null;
  const hash=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n>>>0};
  const rng=seed=>{let x=seed>>>0;return()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296)};
  function canvasTexture(kind,seed){const r=rng(seed+hash(kind));const c=document.createElement('canvas');c.width=c.height=mobile?128:256;const g=c.getContext('2d'),N=c.width;g.clearRect(0,0,N,N);
    const addSpot=(x,y,rad,col)=>{const gradient=g.createRadialGradient(x,y,0,x,y,rad);gradient.addColorStop(0,col);gradient.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gradient;g.fillRect(x-rad,y-rad,rad*2,rad*2)};
    if(kind==='water'){for(let i=0;i<18;i++)addSpot(r()*N,(.62+r()*.33)*N,(.06+r()*.22)*N,'rgba(36,34,28,.18)');}
    if(kind==='soot'){for(let i=0;i<35;i++)addSpot((.16+r()*.68)*N,(.1+r()*.60)*N,(.05+r()*.18)*N,'rgba(22,19,20,.17)');}
    if(kind==='fade'){for(let i=0;i<30;i++)addSpot(r()*N,r()*N,(.025+r()*.12)*N,'rgba(154,143,120,.12)');}
    if(kind==='scuff'){for(let i=0;i<75;i++){let x=r()*N,y=r()*N;g.strokeStyle=`rgba(35,26,23,${(.035+r()*.13).toFixed(3)})`;g.lineWidth=.4+r()*1.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*N*.10,y+(r()-.5)*N*.06);g.stroke()}}
    if(kind==='dust'){for(let i=0;i<(mobile?140:340);i++){g.fillStyle=`rgba(194,186,165,${(.024+r()*.055).toFixed(3)})`;g.fillRect(r()*N,r()*N,1+r()*2,1+r()*2)}}
    const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=1;shared.push(tex);return tex;
  }
  function decal(kind,seed,width,height,x,y,z,rotation,alpha,flat=false){
    if(width<.14||height<.14)return;
    const material=new THREE.MeshBasicMaterial({map:canvasTexture(kind,seed),transparent:true,opacity:alpha,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);mesh.name='Forge_History_'+kind;mesh.position.set(x,y,z);if(flat)mesh.rotation.x=-Math.PI/2;else mesh.rotation.y=rotation;mesh.renderOrder=4;group.add(mesh);
  }
  function clear(){for(const mesh of [...group.children]){group.remove(mesh);mesh.geometry.dispose();mesh.material.dispose()}for(const texture of shared)texture.dispose();shared.length=0;last=null}
  function enter(room,baseLevel=0,profile={}){
    clear();const b=room?.boundsFeet;if(!b)return null;
    const k=.3048,x=b.x*k,z=b.y*k,w=b.l*k,d=b.w*k,h=b.h*k;
    if(![x,z,w,d,h].every(Number.isFinite)||w<1.3||d<1.3||h<1.6)return null;
    const name=String(room.name||'').toLowerCase(),type=String(room.roomType||room.type||'').toLowerCase(),p=String(profile?.profile||'').toLowerCase(),t=name+' '+type+' '+p;
    const wet=/crypt|cellar|basement|vault|conservatory|greenhouse|wash|bath|damp|underground|wine|laboratory/.test(t)||Number(room.floor)<0;
    const fire=/fireplace|hearth|kitchen|boiler|furnace/.test(t);
    const dusty=/attic|archive|crypt|vault|store|storage|forgotten|nursery|study|library/.test(t);
    const traffic=/hall|corridor|stair|entrance|passage|landing|gallery/.test(t);
    const seed=hash(room.id||name);const r=rng(seed);const strength=Math.max(.15,Math.min(.85,Number(profile?.decayIntensity) || .4));
    // Surfaces remain untouched: a maximum of four shallow overlays per selected room.
    const midX=x+w*.50,midZ=z+d*.50,midY=baseLevel+h*.52;
    if(wet)decal('water',seed+1,Math.min(w*.55,2.8),Math.min(h*.62,2.3),midX,baseLevel+h*.45,z+.045,0,.25+.20*strength);
    else decal('fade',seed+1,Math.min(w*.64,3),Math.min(h*.58,2.2),midX,midY,z+.045,0,.13+.16*strength);
    if(fire)decal('soot',seed+2,Math.min(d*.48,1.7),Math.min(h*.55,2.2),x+.045,baseLevel+h*.68,midZ,Math.PI/2,.25+.18*strength);
    else if(traffic)decal('scuff',seed+2,Math.min(d*.65,2.6),Math.min(h*.32,.85),x+.045,baseLevel+.60,midZ,Math.PI/2,.16+.18*strength);
    else if(wet)decal('water',seed+2,Math.min(d*.5,1.9),Math.min(h*.5,1.8),x+.045,baseLevel+h*.36,midZ,Math.PI/2,.18+.14*strength);
    if(dusty||wet||!traffic){const fw=Math.min(w*.76,3.7),fd=Math.min(d*.76,3.7);decal('dust',seed+3,fw,fd,midX,baseLevel+.017,midZ,0,.20+.18*strength,true)}
    if(w>4&&d>4&&!mobile&&strength>.42)decal('scuff',seed+4,Math.min(w*.5,2.3),Math.min(h*.28,.75),x+w*(.30+r()*.4),baseLevel+.49,z+d-.045,Math.PI,.12);
    group.visible=enabled&&sceneEnabled;
    last={roomId:room.id,wet,fire,dusty,traffic,decals:group.children.length};return last;
  }
  function setEnabled(value){enabled=!!value;group.visible=enabled&&sceneEnabled}
  function setSceneActive(value){sceneEnabled=!!value;group.visible=enabled&&sceneEnabled}
  function dispose(){clear();scene.remove(group)}
  return {enter,setEnabled,setSceneActive,dispose,get enabled(){return enabled},get report(){return last}};
}
