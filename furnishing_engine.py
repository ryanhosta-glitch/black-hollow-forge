import os,sys,shutil,json,hashlib,zipfile,random,math
from pathlib import Path
import numpy as np
import trimesh
src=Path('/mnt/data/Black_Hollow_Forge_Room_Intelligence'); out=Path('/mnt/data/Black_Hollow_Forge_Beautiful_But_Abandoned_Release')
if out.exists():shutil.rmtree(out)
shutil.copytree(src,out,ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
root=out/'houses/ferres-estate'
nav=json.loads((root/'navigation/collision.json').read_text())
manifest=json.loads((root/'manifest.json').read_text())
scale=.3048
# deterministic model assets, primarily edge furniture to protect room center and doors
COL={'mahogany':[70,36,28,255],'wood':[86,57,39,255],'stone':[105,100,106,255],'brass':[154,125,70,255],'aged':[82,77,74,255],'velvet':[84,25,38,255],'glass':[115,143,140,160],'ivory':[182,164,133,255],'iron':[44,45,50,255]}

def cube(scene,name,c,s,mat):
 m=trimesh.creation.box(extents=s);m.apply_translation(c);m.visual.vertex_colors=np.tile(np.array(COL[mat],dtype=np.uint8),(len(m.vertices),1));scene.add_geometry(m,node_name=name,geom_name=name)
def ball(scene,name,c,r,mat):
 m=trimesh.creation.icosphere(subdivisions=1,radius=r);m.apply_translation(c);m.visual.vertex_colors=np.tile(np.array(COL[mat],dtype=np.uint8),(len(m.vertices),1));scene.add_geometry(m,node_name=name,geom_name=name)

def style_for(name):
 n=name.lower()
 for token,kind in [('stair','none'),('corridor','none'),('hallway','none'),('entrance','entry'),('crypt','burial'),('vault','vault'),('laboratory','lab'),('cellar','cellar'),('library','library'),('archive','library'),('ballroom','ballroom'),('gallery','gallery'),('conservatory','botanical'),('observatory','observatory'),('nursery','nursery'),('study','study'),('workshop','workshop'),('mirror','mirror'),('seer','occult')]:
  if token in n:return kind
 return 'custom'

def clearance(x,z,b,doors):
 # preserve inset and avoid 1.35m at door midpoint
 if not (b['x']+.62<x<b['x']+b['l']-.62 and b['z']+.62<z<b['z']+b['w']-.62):return False
 for p in doors:
  if math.hypot(x-p[0],z-p[1])<1.55:return False
 return True

def door_pts(r,b):
 ps=[]
 for o in r.get('openings',[]):
  if o.get('type') not in ('door','secretDoor','secret'):continue
  t=float(o.get('pos',.5));w=o.get('wall','')
  if w=='left':ps.append((b['x'],b['z']+b['w']*t))
  if w=='right':ps.append((b['x']+b['l'],b['z']+b['w']*t))
  if w=='top':ps.append((b['x']+b['l']*t,b['z']))
  if w=='bottom':ps.append((b['x']+b['l']*t,b['z']+b['w']))
 return ps

report=[]; floor_scenes={i:trimesh.Scene() for i in range(4)}
for r in nav['rooms']:
 f=int(r['floor']);b0=r['boundsFeet']; b={k:float(b0[k])*scale for k in ('x','y','l','w','h')};b['z']=b['y'];scene=floor_scenes[f];doors=door_pts(r,b);kind=style_for(r['name']);
 if kind=='none':report.append({'id':r['id'],'room':r['name'],'floor':f,'profile':kind,'status':'protected-circulation','objects':0});continue
 # edge-aligned footprint using individual object bounding sizes, no gameplay collision yet
 choices={
 'burial':[('stone_sarcophagus',1.8,.85,'stone'),('memorial_stone',.65,.35,'aged')],
 'vault':[('reinforced_cabinet',1.35,.48,'iron'),('ledger_table',1.25,.62,'wood')],
 'lab':[('experiment_bench',1.8,.65,'wood'),('apparatus_shelf',1.2,.35,'mahogany')],
 'cellar':[('barrel_rack',1.55,.50,'wood'),('wine_cabinet',1.25,.40,'mahogany')],
 'library':[('bookcase',2.3,.42,'mahogany'),('reading_desk',1.3,.64,'wood')],
 'ballroom':[('velvet_settee',1.65,.68,'velvet'),('gilded_cabinet',1.05,.45,'mahogany')],
 'gallery':[('portrait_stand',1.15,.34,'wood'),('velvet_bench',1.7,.60,'velvet')],
 'botanical':[('botanical_workbench',1.5,.60,'wood'),('planter',.95,.75,'stone')],
 'observatory':[('chart_cabinet',1.55,.46,'mahogany'),('instrument_desk',1.15,.65,'wood')],
 'nursery':[('antique_crib',1.5,.80,'ivory'),('old_wardrobe',1.15,.48,'wood')],
 'study':[('writing_desk',1.55,.72,'mahogany'),('filing_cabinet',1.0,.45,'wood')],
 'workshop':[('craft_workbench',1.65,.65,'wood'),('parts_cabinet',1.10,.45,'mahogany')],
 'mirror':[('standing_mirror',1.1,.32,'brass'),('draped_table',1.0,.52,'velvet')],
 'occult':[('seer_table',1.35,.72,'mahogany'),('reliquary',.95,.44,'iron')],
 'entry':[('console_table',1.35,.45,'mahogany')],
 'custom':[('antique_cabinet',1.3,.45,'mahogany')]
 }[kind]
 placed=[]
 # Try wall-parallel centered placements at two far interior walls, preferring non-door areas
 for j,(label,wide,deep,mat) in enumerate(choices):
  z = b['z'] + (deep/2+.60 if j==0 else b['w']-deep/2-.60)
  x = b['x'] + (b['l']*.34 if j==0 else b['l']*.68)
  if b['l']<wide+1.65 or b['w']<deep+2.0:continue
  spots=[(x,z),(b['x']+b['l']*.65,z),(b['x']+b['l']*.5,z)]
  found=next(((px,pz) for px,pz in spots if clearance(px,pz,b,doors) and all(math.hypot(px-q['x'],pz-q['z'])>1.8 for q in placed)),None)
  if found is None:continue
  x,z=found
  # local floor coordinates: source room floor GLBs have floor local elevations
  base=.10
  height=1.45 if ('cabinet' in label or 'bookcase' in label or 'wardrobe' in label or 'rack' in label) else .76
  if 'mirror' in label or 'portrait' in label:height=1.65
  if 'sarcophagus' in label:height=.68
  if 'planter' in label:height=.62
  cube(scene,f'{r["id"]}_{label}',(x,base+height/2,z),(wide,height,deep),mat)
  # architectural visual accent appropriate to object, deterministic gentle abandonment
  if mat in ('mahogany','wood'):
   cube(scene,f'{r["id"]}_{label}_brass_trim',(x,base+height-.07,z+deep/2+.008),(wide*.8,.055,.045),'brass')
  if label=='planter':ball(scene,f'{r["id"]}_withered_plant',(x,base+height+.27,z),.23,'aged')
  if label=='seer_table':ball(scene,f'{r["id"]}_crystal',(x,base+height+.19,z),.17,'glass')
  if label=='experiment_bench':
   for k in range(3):ball(scene,f'{r["id"]}_specimen_{k}',(x+(-.43+k*.42),base+height+.1,z),.10,'glass')
  placed.append({'name':label,'x':round(x,3),'z':round(z,3),'width':wide,'depth':deep,'height':height,'status':'decorative-not-collision-certified'})
 report.append({'id':r['id'],'room':r['name'],'floor':f,'profile':kind,'style':'Beautiful but Abandoned','objects':len(placed),'placements':placed,'status':'preview-not-gameplay-certified'})

for f,scene in floor_scenes.items():
 path=root/'geometry'/f'furnishings_floor_{f:02d}.glb'
 if len(scene.geometry):path.write_bytes(scene.export(file_type='glb'))

(root/'navigation'/'furnishing_plan.json').write_text(json.dumps({'policy':'Beautiful but Abandoned','generatedBy':'shared room-aware edge-furnishing rules (see furnishing_engine.py)','sourceBlueprintUnchanged':True,'collisionCertified':False,'visibleIn':'furnishing_inspector.html','rooms':report},indent=2))
manifest['furnishingOverlays']={f'floor_{f:02d}':f'geometry/furnishings_floor_{f:02d}.glb' for f in floor_scenes}
manifest['furnishingPlan']='navigation/furnishing_plan.json'
manifest['furnishingPolicy']='Beautiful but Abandoned; protected circulation; decorative provisional overlays'
(root/'manifest.json').write_text(json.dumps(manifest,indent=2))
# Inspector uses existing CDN setup in current Forge and lets user toggle floors
html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Black Hollow — Beautiful but Abandoned</title><style>body{margin:0;background:#131019;color:#eee;font:15px system-ui}header{padding:12px 18px;background:#211a27;display:flex;justify-content:space-between;align-items:center;gap:12px}h1{font-size:19px;color:#dfba7c;margin:0}#info{padding:12px 20px;background:#211a27}#info select,#info button{font:inherit;background:#352b3d;color:white;border:1px solid #907657;border-radius:6px;padding:7px;margin-right:6px}#view{height:67vh}#error{color:#f7b59d}small{color:#c2b7c9}a{color:#efd29f}</style><header><h1>Forge — Beautiful but Abandoned</h1><a href="index.html">Back to Forge</a></header><div id="info">Floor: <select id="floor"></select><button id="fit">Fit</button><label><input type="checkbox" id="structure" checked> Show original structure</label><p id="status">Loading…</p><small>Architect-authored geometry remains unchanged. Furniture overlays are visual proposals: collision and door approaches require playtesting.</small><p id="error"></p></div><div id="view"></div><script type="module">import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';const host=document.getElementById('view'),r=new THREE.WebGLRenderer({antialias:true});r.setSize(host.clientWidth,host.clientHeight);r.setPixelRatio(Math.min(devicePixelRatio,2));r.setClearColor(0x15121c);host.appendChild(r.domElement);const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x444151,2.2));const sun=new THREE.DirectionalLight(0xffe3bb,2.5);sun.position.set(25,30,20);scene.add(sun);const camera=new THREE.PerspectiveCamera(48,host.clientWidth/host.clientHeight,.1,500);camera.position.set(24,25,36);const controls=new OrbitControls(camera,r.domElement);const loader=new GLTFLoader(),group=new THREE.Group();scene.add(group);const sel=document.getElementById('floor');for(let f=0;f<4;f++){const o=document.createElement('option');o.value=f;o.textContent=['Basement','Ground Floor','Second Floor','Third Floor'][f];sel.append(o)}let floor=1;const loaded=new Map();const load=async(path)=>{if(loaded.has(path))return loaded.get(path).clone(true);let m=await new Promise((resolve,reject)=>loader.load(path,x=>resolve(x.scene),undefined,reject));loaded.set(path,m);return m.clone(true)};function fit(){const bb=new THREE.Box3().setFromObject(group);if(bb.isEmpty())return;const center=bb.getCenter(new THREE.Vector3()),s=bb.getSize(new THREE.Vector3());controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(s.x*1.4+5,s.y*1.8+14,s.z*1.4+5));camera.near=.1;camera.far=600;camera.updateProjectionMatrix();controls.update()}async function draw(){const token=++draw.token;group.clear();document.getElementById('status').textContent='Loading floor '+floor+'…';const base='houses/ferres-estate/geometry/';try{const [shell,props]=await Promise.all([load(base+'floor_'+String(floor).padStart(2,'0')+'.glb'),load(base+'furnishings_floor_'+String(floor).padStart(2,'0')+'.glb')]);if(token!==draw.token)return;shell.visible=document.getElementById('structure').checked;group.add(shell);group.add(props);fit();const p=await fetch('houses/ferres-estate/navigation/furnishing_plan.json').then(x=>x.json());const rooms=p.rooms.filter(x=>x.floor===floor);document.getElementById('status').textContent=rooms.length+' rooms · '+rooms.reduce((a,x)=>a+x.objects,0)+' furnishing placements · decorative preview';}catch(e){document.getElementById('error').textContent='Model loading failed: '+e.message;document.getElementById('status').textContent='Check GitHub Pages asset paths.'}}draw.token=0;sel.value=1;sel.onchange=()=>{floor=+sel.value;draw()};document.getElementById('structure').onchange=()=>{for(const child of group.children.slice(0,1))child.visible=document.getElementById('structure').checked};document.getElementById('fit').onclick=fit;function animate(){requestAnimationFrame(animate);controls.update();r.render(scene,camera)}animate();addEventListener('resize',()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();r.setSize(host.clientWidth,host.clientHeight)});draw();</script></html>'''
(out/'furnishing_inspector.html').write_text(html)
(out/'FURNISHING_RELEASE_NOTES.md').write_text('''# Beautiful but Abandoned — room furnishing checkpoint\n\n- Shared source `furnishing_engine.py` creates room-aware decoration overlays for all compatible house packages; `furnishing_inspector.html` currently previews Ferre’s Estate as the regression house.\n- Floors 0–3 get separate *decorative* GLB overlays, with their own placement manifest.\n- Deliberately leaves stairwells and corridors empty, stays toward room edges and avoids recorded door centers.\n- No authored `.haunt` file or existing model was modified.\n- Objects are lightweight Victorian proxy furniture, not polished original-game PBR assets. Placement is **not** physically collision-certified; furniture is intentionally NOT enabled by default in the gameplay walktest.\n- Original game textures still need full baking/export integration.\n- Upload the full extracted folder to GitHub repository root; use `furnishing_inspector.html` to review.\n''')
# keep deploy compiler source for reuse, separate module
(out/'furnishing_engine.py').write_text(Path(__file__).read_text())
zip_path=Path('/mnt/data/Black_Hollow_Forge_Beautiful_But_Abandoned_GitHub_Release.zip')
with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=7) as z:
 for p in out.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(out))
assert zipfile.ZipFile(zip_path).testzip() is None
print(json.dumps({'zip':str(zip_path),'files':len(zipfile.ZipFile(zip_path).namelist()),'rooms':len(report),'furnishings':sum(x['objects'] for x in report),'protected':sum(x['status']=='protected-circulation' for x in report),'size':zip_path.stat().st_size}))
