/** Reproducible signature-room art, metres. Shared by preview and GLB exporter.
 * Fixed seed; instanced repeating ornament; no textures, timers, or per-frame builds.
 */
export function buildSignatureScene(THREE,kind){
 const hall=kind==='hall',root=new THREE.Group();root.name=hall?'The Gilded Midnight Hall':'The Nocturne Conservatory';
 const W=hall?24:28,D=hall?31:34,H=hall?15:16,parts=new Map(),blockers=[],lights=[];
 const material=(name,color,roughness=.65,metalness=0,extra={})=>new THREE.MeshStandardMaterial({name,color,roughness,metalness,...extra});
 const mats={ivory:material('warm-limestone',0xc3b397,.75),dark:material('black-marble',0x1c2530,.28),pale:material('ivory-marble',0xbcb9a9,.32),gold:material('aged-brass',0xb08b4e,.32,.72),wood:material('carved-walnut',0x382219,.46),velvet:material('wine-velvet',0x4d1833,.92),iron:material('verdigris-iron',0x243d3a,.54,.62),soil:material('damp-soil',0x25241a,.98),green:material('fern-jade',0x214637,.85),leaf:material('leaf-emerald',0x436844,.78),red:material('pitcher-burgundy',0x702b40,.62),water:material('obsidian-water',0x172e35,.14,.25),glow:material('amber-lamp-glass',0xffbd6f,.35,.05,{emissive:0xffa34c,emissiveIntensity:1.6}),spectral:material('orchid-moonlight',0xb19ac6,.5,0,{emissive:0x72548c,emissiveIntensity:.45}),glass:material('smoked-greenhouse-glass',0x537c80,.18,.08,{transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide}),blue:material('moonlit-stained-glass',0x264d71,.44,.1,{emissive:0x234567,emissiveIntensity:.4})};
 let seed=131313;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const transform=new THREE.Object3D();
 function add(type,mat,pos,scale,rot=[0,0,0]){const key=type+':'+mat;if(!parts.has(key))parts.set(key,[]);transform.position.set(...pos);transform.scale.set(...scale);transform.rotation.set(...rot);transform.updateMatrix();parts.get(key).push(transform.matrix.clone());}
 const box=(mat,x,y,z,w,h,d,rot)=>add('box',mat,[x,y,z],[w,h,d],rot);
 const sphere=(mat,x,y,z,rx,ry=rx,rz=rx,rot)=>add('sphere',mat,[x,y,z],[rx,ry,rz],rot);
 const cyl=(mat,x,y,z,r,h)=>add('cylinder',mat,[x,y,z],[r,h,r]);
 const ring=(mat,x,y,z,r,t,rot=[Math.PI/2,0,0])=>add('torus',mat,[x,y,z],[r,r,r],rot);
 function beam(mat,a,b,r=.04){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av),mid=av.clone().add(bv).multiplyScalar(.5);transform.position.copy(mid);transform.scale.set(r,delta.length(),r);transform.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());transform.updateMatrix();const key='cylinder:'+mat;if(!parts.has(key))parts.set(key,[]);parts.get(key).push(transform.matrix.clone());}
 function obstacle(id,x,z,w,d,y=0,h=2){blockers.push({id,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y,maxY:y+h});}
 function portalFrame(x,y,z,w,h){for(const side of [-1,1]){box('ivory',x+side*(w/2+.2),y+h/2,z,.35,h,.38);box('gold',x+side*(w/2+.10),y+h/2,z-.23,.07,h,.06);}box('ivory',x,y+h+.12,z,w+.85,.25,.46);box('gold',x,y+h+.30,z,w+1,.08,.50);}
 function bench(x,z,rotation=0){const group=new THREE.Group();const local=(a,b,c)=>{const co=Math.cos(rotation),si=Math.sin(rotation);return[x+a*co+c*si,b,z-a*si+c*co]};for(const a of [-.85,.85])for(const c of [-.28,.28]){const p=local(a,.27,c);cyl('wood',...p,.055,.54);}let p=local(0,.56,0);box('velvet',...p,2,.18,.78,[0,rotation,0]);p=local(0,1,.32);box('wood',...p,2.05,.85,.12,[0,rotation,0]);p=local(0,1,.24);box('velvet',...p,1.82,.62,.09,[0,rotation,0]);for(const a of [-1.02,1.02]){p=local(a,.85,0);box('gold',...p,.07,.09,.83,[0,rotation,0]);}obstacle('settee',x,z,rotation?1:2.2,rotation?2.2:1);}
 function chandelier(x,z,y,r=1.35){cyl('gold',x,(H+y)/2,z,.035,H-y);ring('gold',x,y,z,r,.04);ring('gold',x,y+.4,z,r*.65,.04);sphere('gold',x,y-.45,z,.16,.3,.16);for(let j=0;j<10;j++){const a=j*Math.PI/5,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;beam('gold',[x,y+.35,z],[px,y,pz],.025);cyl('gold',px,y+.1,pz,.085,.25);sphere('glow',px,y+.35,pz,.065,.18,.065);for(let n=0;n<3;n++)sphere('pale',px,y-.12-n*.15,pz,.035,.08,.035);}lights.push({position:[x,y+.25,z],color:0xffba75,intensity:hall?65:32,distance:hall?16:11});}
 // Continuous floor with a lightweight repeated inlay surface.
 box(hall?'dark':'iron',0,-.16,0,W,.3,D);
 const tile=hall?1:.95;for(let x=-W/2+.6;x<W/2-.3;x+=tile)for(let z=-D/2+.6;z<D/2-.3;z+=tile){const ix=Math.round((x+W/2)/tile),iz=Math.round((z+D/2)/tile);box((ix+iz)%2?'dark':'pale',x,.003,z,tile-.025,.025,tile-.025);}
 for(const x of [-W/2+.65,W/2-.65])box('gold',x,.025,0,.07,.025,D-1.3);
 for(const z of [-D/2+.65,D/2-.65])box('gold',0,.025,z,W-1.3,.025,.07);
 if(hall){
  // Cut a real south entrance aperture; doors are runtime-owned.
  for(const x of [-7.1,7.1])box('ivory',x,7.5,-15.5,9.8,15,.25);box('ivory',0,10,-15.5,4.4,10,.25);
  box('ivory',0,7.5,15.5,24,15,.25);for(const x of [-12,12])box('wood',x,7.5,0,.25,15,31);
  portalFrame(0,0,-15.3,4.4,5);
  // Coffered ceiling with curved gilt vault ribs and a star rosette.
  box('wood',0,15,0,24,.18,31);
  for(let z=-12;z<=12;z+=6)for(let j=0;j<24;j++){const a=Math.PI*j/24,b=Math.PI*(j+1)/24;beam('gold',[-10.5*Math.cos(a),10+4.6*Math.sin(a),z],[-10.5*Math.cos(b),10+4.6*Math.sin(b),z],.065);}
  for(let x=-8;x<=8;x+=4)for(let z=-12;z<=12;z+=6){box('gold',x,14.85,z,3.7,.08,.055);box('gold',x-1.85,14.85,z+2.8,.055,.08,5.6);sphere('gold',x,14.7,z,.14,.10,.14);}
  for(const side of [-1,1])for(const z of [-11,-4,3,10]){
   const x=side*10.5;cyl('ivory',x,6.5,z,.28,13);cyl('dark',x,.4,z,.49,.8);cyl('gold',x,12.9,z,.48,.28);cyl('gold',x,1,z,.35,.08);
   // Tall architectural wall panels and a jewel-toned window insert.
   box('gold',side*11.82,6.2,z,.08,7.6,2.7);box('blue',side*11.76,6.2,z,.07,7.2,2.45);
   for(let k=0;k<4;k++)box(k%2?'spectral':'gold',side*11.70,3.5+k*1.7,z,.04,.06,2.5);
   sphere('glow',side*10.3,3,z+.8,.11,.25,.11);
  }
  // Radial marble medallion and central carpet, keeping the circulation clear.
  cyl('gold',0,.033,-5,2.7,.02);cyl('dark',0,.05,-5,2.58,.02);
  for(let j=0;j<16;j++){const a=j*Math.PI/8;box(j%2?'gold':'pale',Math.cos(a)*1.75,.069,-5+Math.sin(a)*1.75,.75,.02,.16,[0,-a,0]);}
  box('velvet',0,.035,1,2.7,.025,4.5);for(const x of [-1.29,1.29])box('gold',x,.052,1,.055,.01,4.45);
  // Twin flights, a clear cross-landing, and actual open elevator cabin.
  for(const side of [-1,1]){
   const x=side*4.5;for(let i=0;i<28;i++){const top=(i+1)*5.25/28;box('ivory',x,top/2,4+(i+.5)*.25,3.8,top,.25);box('gold',x,top+.008,4+i*.25,3.8,.025,.035);}
   for(const edge of [-1,1]){const xx=x+edge*1.92;beam('wood',[xx,1.05,4],[xx,6.30,11],.065);for(let i=0;i<=28;i++){const z=4+i*.25,y=i*5.25/28;cyl('gold',xx,y+.51,z,.026,1.02);sphere('gold',xx,y+1.06,z,.055);}}
  }
  box('ivory',0,5.08,12.5,16,.34,3);
  for(const side of [-1,1]){box('iron',side*1.8,6.7,13.9,.12,2.9,2.8);portalFrame(0,5.25,12.5,3.4,3);}
  box('wood',0,6.7,15.25,3.6,2.9,.15);box('gold',0,5.28,14,3.5,.04,2.7);box('gold',0,8.22,14,3.7,.13,2.8);
  for(let x=-1.5;x<=1.5;x+=.3)box('gold',x,6.7,15.12,.025,2.7,.03);
  for(const x of [-8,8]){bench(x,-8,Math.PI/2);bench(x,-1,Math.PI/2);}
  chandelier(0,-7,7.6,1.6);chandelier(0,2,9,1.3);chandelier(0,11,11,1.2);
 }else{
  // A barrel glass canopy: iron ribs, ridge finials and transparent panes.
  for(let z=-17;z<=17;z+=3.4){for(const x of [-14,14]){cyl('iron',x,5,z,.10,10);cyl('gold',x,.25,z,.19,.5);}for(let i=0;i<28;i++){const a=Math.PI*i/28,b=Math.PI*(i+1)/28;beam('iron',[-14*Math.cos(a),9.7+6*Math.sin(a),z],[-14*Math.cos(b),9.7+6*Math.sin(b),z],.065);}}
  for(let i=0;i<14;i++){const a=(i+.5)*Math.PI/14,x=-14*Math.cos(a),y=9.7+6*Math.sin(a);box('glass',x,y,0,.035,2.9,34,[0,0,a-Math.PI/2]);beam('iron',[x,y,-17],[x,y,17],.035);}
  for(const x of [-14,14]){box('glass',x,5,0,.025,9.7,34);for(const y of [1,3.5,7,9.7])box('iron',x,y,0,.13,.06,34);}
  for(const z of [-17,17]){for(const x of [-8.5,8.5])box('glass',x,5,z,10,9.7,.025);portalFrame(0,0,z,3.8,3.5);}
  // Garden beds stay outside the central aisle and the outer circulation loop.
  function plant(x,z,height=2){
   cyl('wood',x,height*.42,z,.055,height*.84);
   for(let j=0;j<9;j++){const a=j*Math.PI*2/9+ rnd()*.3,r=.45+rnd()*.5;const y=height*(.45+rnd()*.45);beam('green',[x,y-.3,z],[x+Math.cos(a)*r,y+.12,z+Math.sin(a)*r],.018);sphere(j%2?'green':'leaf',x+Math.cos(a)*r,y,z+Math.sin(a)*r,.12,.7,.22,[Math.sin(a)*.9,a,Math.cos(a)*.9]);}
  }
  for(const side of [-1,1])for(const z of [-10,-3,5,11]){const x=side*8;
   box('ivory',x,.35,z,4.1,.7,3.5);box('soil',x,.72,z,3.85,.08,3.25);obstacle('botanical-bed',x,z,4.2,3.6,0,1.2);
   for(let n=0;n<7;n++)plant(x+(rnd()-.5)*2.8,z+(rnd()-.5)*2.4,1.3+rnd()*2.5);
   for(let n=0;n<5;n++){const px=x+(rnd()-.5)*2.8,pz=z+(rnd()-.5)*2.3;beam('green',[px,.75,pz],[px,1.6,pz],.025);sphere('red',px,1.45,pz,.17,.42,.17);ring('gold',px,1.8,pz,.19,.02);sphere('spectral',px+.22,1.95,pz,.14,.07,.14);}
  }
  // Obsidian fountain and moon-orchid display in the central crossing.
  cyl('ivory',0,.24,0,2.1,.48);cyl('water',0,.49,0,1.95,.025);cyl('iron',0,1.1,0,.18,1.3);cyl('gold',0,1.65,0,.85,.13);sphere('spectral',0,2.12,0,.22,.40,.22);obstacle('fountain',0,0,4.3,4.3,0,2.5);
  for(let j=0;j<16;j++){const a=j*Math.PI/8;sphere('water',Math.cos(a)*.65,.9,Math.sin(a)*.65,.025,.65,.025,[Math.sin(a)*.3,0,Math.cos(a)*.3]);}
  for(const side of [-1,1])for(const z of [-13,14])bench(side*6,z);
  // Research tables, brass instruments and terracotta specimen pots.
  for(const x of [-10,10]){box('wood',x,1.05,-14,2.8,.15,1);obstacle('research-table',x,-14,2.9,1.15);for(const dx of [-1.2,1.2])for(const dz of [-.35,.35])cyl('iron',x+dx,.5,-14+dz,.045,1);for(let j=0;j<5;j++){cyl('gold',x-1+j*.45,1.28,-14,.11,.3);sphere('glass',x-1+j*.45,1.65,-14,.14,.25,.14);}}
  // Retain recognizable staging at existing conservatory interaction anchors.
  cyl('iron',-5,.9,-13,.15,1.8);ring('gold',-5,2.05,-13,.48,.03,[0,0,0]);sphere('glass',-5,2.05,-13,.42,.42,.045);
  box('wood',7.2,1.05,-12.3,1.8,.13,.7);box('pale',7.2,1.17,-12.3,.65,.08,.42,[0,-.18,0]);box('velvet',7.2,1.22,-12.3,.60,.025,.39,[0,-.18,0]);obstacle('botany-codex-desk',7.2,-12.3,1.9,.8);
  portalFrame(-12.8,0,-12,1.4,2.5);box('wood',-12.8,1.25,-12,1.35,2.5,.10);sphere('gold',-12.35,1.2,-11.9,.06);
  chandelier(0,-10,6,1.1);chandelier(0,10,6,1.1);
  lights.push({position:[0,4,0],color:0x87a9d1,intensity:45,distance:16});
  // Ground-level return elevator, with an open, boardable cabin.
  box('wood',0,1.65,-16.7,3.8,3.3,.16);for(const x of [-1.95,1.95])box('iron',x,1.65,-15.6,.12,3.3,2.3);box('gold',0,.025,-15.6,3.8,.035,2.2);box('gold',0,3.35,-15.6,4,.12,2.4);
 }
 const geometries={box:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,10,7),cylinder:new THREE.CylinderGeometry(1,1,1,12),torus:new THREE.TorusGeometry(1,.025,5,24)};
 for(const [key,matrices] of parts){const[type,mat]=key.split(':');const mesh=new THREE.InstancedMesh(geometries[type],mats[mat],matrices.length);mesh.name=key;matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=false;mesh.receiveShadow=true;root.add(mesh);}
 root.userData={signatureVersion:6,units:'meters',kind,blockers,lights,staticDecoration:true};
 return {root,blockers,lights,dimensions:[W,H,D],instances:[...parts.values()].reduce((s,a)=>s+a.length,0)};
}
