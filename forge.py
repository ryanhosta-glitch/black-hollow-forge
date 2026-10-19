#!/usr/bin/env python3
"""Black Hollow Forge prototype: compile Architect JSON .haunt to a GLB-per-floor house pack.
No changes to the original .haunt. Geometry is static; game logic remains runtime-owned.
Usage: python forge.py blueprint.haunt output_dir
Requires: trimesh, numpy
"""
import json,sys,math,shutil,re,hashlib
from pathlib import Path
import numpy as np
import trimesh
from magical import compile_magic

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-') or 'house'
def box(scene,name,center,dims,color):
 if min(dims)<=0.001:return
 m=trimesh.creation.box(extents=dims);m.apply_translation(center);m.visual.face_colors=np.asarray(color,dtype=np.uint8);scene.add_geometry(m,node_name=name,geom_name=name)
def render_floor(floor,outfile,index):
 scene=trimesh.Scene();parts=0
 for r in floor.get('rooms',[]):
  x,z,w,d=(float(r[k]) for k in ('x','y','l','w'));h=max(4,float(r.get('h',10)))
  # Architect coordinates represent feet; all GLB dimensions exported in meters.
  k=.3048; x*=k;z*=k;w*=k;d*=k;h*=k;t=.15;rid=str(r.get('id','unknown'))
  finish=(88,78,98,255) if r.get('style')!='stonewall' else (88,91,102,255)
  box(scene,rid+'-floor',(x+w/2,-.09,z+d/2),(w,.18,d),(88,75,69,255));parts+=1
  box(scene,rid+'-ceiling',(x+w/2,h+.04,z+d/2),(w,.08,d),(65,60,72,255));parts+=1
  opens=r.get('openings') or []
  for wall in ('top','bottom','left','right'):
   horizontal=wall in ('top','bottom'); length=w if horizontal else d
   holes=[]
   for op in opens:
    if op.get('wall')!=wall or op.get('type') not in ('door','window','arch','archway','open','passage'):continue
    p=float(op.get('pos',.5));p=max(0,min(1,p)); ow=min(length*.75,float(op.get('width',3))*k)
    center=p*length; a=max(0,center-ow/2);b=min(length,center+ow/2)
    if b-a>.1:holes.append((a,b,op.get('type')))
   holes.sort()
   # Wall segmentation along openings; top surfaces above doors, window sills below windows
   cursor=0
   def section(a,b,bottom,top,label):
    if b-a<.025 or top-bottom<.025:return
    if horizontal: center=(x+(a+b)/2,(bottom+top)/2,z+(d if wall=='top' else 0));size=(b-a,top-bottom,t)
    else:center=(x+(w if wall=='right' else 0),(bottom+top)/2,z+(a+b)/2);size=(t,top-bottom,b-a)
    box(scene,rid+'-'+wall+'-'+label,center,size,finish)
   for n,(a,b,typ) in enumerate(holes):
    if a<cursor: a=cursor
    if b<=a:continue
    section(cursor,a,0,h,str(n)+'-solid')
    if typ=='window':section(a,b,0,.9,'sill-'+str(n));section(a,b,min(h,2.1),h,'lintel-'+str(n))
    else:section(a,b,min(h,2.15),h,'lintel-'+str(n))
    cursor=b
   section(cursor,length,0,h,'end');parts+=1
 scene.export(str(outfile));return parts

def special(name,outfile):
 # Purpose-built modular scene with its own coordinates; never replaces or resizes blueprint volume.
 sc=trimesh.Scene();k=1
 if name=='main-hall':
  W,D,H=24,31,15
  box(sc,'marble-floor',(0,-.15,0),(W,.3,D),(55,52,68,255))
  box(sc,'vaulted-roof',(0,H,0),(W,.3,D),(51,45,63,255))
  for xx in (-W/2,W/2):box(sc,'stone-side-'+str(xx),(xx,H/2,0),(.35,H,D),(82,78,92,255))
  for zz in (-D/2,D/2):box(sc,'stone-end-'+str(zz),(0,H/2,zz),(W,H,.35),(81,71,82,255))
  # Grand twin staircase with playable ramp proxy authored as separate navigation metadata.
  for side in (-1,1):
   for i in range(16):
    stepw=5.0;dh=.32
    box(sc,f'grand-stair-{side}-{i}',(side*4.1,(i+.5)*dh,3+i*.43),(stepw,dh,(i+1)*.43),(105,91,99,255))
  box(sc,'upper-elevator-landing',(0,5.16,11),(12,.3,7),(88,76,91,255))
  box(sc,'impossible-elevator-gateway',(0,7.2,14.3),(3.2,4,.4),(148,112,76,255))
  for a in (-9.5,9.5):
   for b in (-11,-2,7):box(sc,f'gothic-column-{a}-{b}',(a,H/2,b),(.65,H,.65),(115,107,126,255))
 elif name=='floor13-conservatory':
  W,D,H=28,34,16
  box(sc,'moss-tiled-floor',(0,-.12,0),(W,.24,D),(62,73,65,255))
  for a in (-W/2,W/2):
   for b in np.arange(-D/2,D/2+.1,3):box(sc,'iron-frame',(a,H/2,float(b)),(.2,H,.17),(60,72,75,255))
  for b in (-D/2,D/2):
   for a in np.arange(-W/2,W/2+.1,3):box(sc,'glass-rib',(float(a),H/2,b),(.17,H,.17),(68,91,94,255))
  box(sc,'glass-roof',(0,H,0),(W,.09,D),(64,100,110,155))
  for n,(a,b) in enumerate([(0,0),(8,8),(-8,-8),(7,-8),(-7,9)]):
   box(sc,f'abandoned-botanical-bed-{n}',(a,.5,b),(3,1,4),(62,53,56,255))
 sc.export(str(outfile))

def main(src,dest):
 source=Path(src);out=Path(dest);out.mkdir(parents=True,exist_ok=True);(out/'geometry').mkdir(exist_ok=True);(out/'navigation').mkdir(exist_ok=True)
 data=json.loads(source.read_text(encoding='utf-8'));errors=[];warnings=[];floors=data.get('floors',[])
 if not isinstance(floors,list) or not floors:errors.append('Missing floors array')
 ids=set();rooms=[];elevators={}
 for fi,f in enumerate(floors):
  for r in f.get('rooms',[]):
   rid=r.get('id');
   if not rid or rid in ids: errors.append('Missing or duplicate room ID: '+str(rid))
   ids.add(rid)
   for k in ('x','y','l','w','h'):
    if not isinstance(r.get(k), (int,float)):errors.append(f'{rid}: invalid {k}')
   if float(r.get('l',0))<=0 or float(r.get('w',0))<=0:errors.append(f'{rid}: invalid dimensions')
   if r.get('type')=='elevator':elevators.setdefault(r.get('elevatorShaftId','missing-shaft'),[]).append({'floor':fi,'room':rid})
   rooms.append({'id':rid,'name':r.get('name','Room'),'floor':fi,'type':r.get('type','room'),'roomType':r.get('roomType'), 'boundsFeet':{k:r.get(k) for k in ('x','y','l','w','h')},'openings':r.get('openings',[]),'embeddedStair':r.get('embeddedStair'),'haunting':r.get('haunting')})
 entry=data.get('gameEntry',{});er=entry.get('roomId');
 if er not in ids: errors.append('gameEntry roomId not found')
 if not elevators:warnings.append('No architectural elevator shaft. Game-controlled Impossible Elevator remains separate.')
 if errors:
  (out/'validation.json').write_text(json.dumps({'status':'failed','errors':errors,'warnings':warnings},indent=2));raise ValueError('; '.join(errors))
 magic=compile_magic(data)
 warnings.extend(f"Forge repair: {r['type']}" for r in magic['repairs'])
 (out/'navigation'/'magic.json').write_text(json.dumps(magic,ensure_ascii=False,indent=2))
 files=[]
 for fi,f in enumerate(floors):
  stem=f'floor_{fi:02d}';render_floor(f,out/'geometry'/f'{stem}.glb',fi)
  files.append({'id':stem,'name':f.get('name',stem),'model':f'geometry/{stem}.glb','roomIds':[r['id'] for r in f.get('rooms',[])]})
 # A separate removable roof skin, fitted to the top-floor room footprint and derived from existing dimensions.
 top=next((f for f in reversed(floors) if f.get('rooms')),None)
 if top:
  sc=trimesh.Scene();k=.3048
  for r in top['rooms']:
   x,z,w,d=(float(r[q])*k for q in ('x','y','l','w'));h=max(4,float(r.get('h',10)))*k
   box(sc,str(r['id'])+'-roof-skin',(x+w/2,h+.24,z+d/2),(w+.25,.4,d+.25),(52,51,60,255))
  sc.export(str(out/'geometry'/'roof.glb'))
 special('main-hall',out/'geometry'/'special_main_hall.glb');special('floor13-conservatory',out/'geometry'/'special_floor13_conservatory.glb')
 entryroom=next(r for r in rooms if r['id']==er)
 navigation={'units':'feet','sourceRoomCount':len(rooms),'rooms':rooms,'elevatorShafts':elevators,'entry':entry,'specialScenes':{'mainHall':{'originalRoomId':er,'scene':'geometry/special_main_hall.glb','mode':'portal-pocket','portalReturnRoom':er,'impossibleElevator':{'positionMeters':[0,5.25,14.0]}},'floor13Conservatory':{'scene':'geometry/special_floor13_conservatory.glb','mode':'separate-dimension'}}}
 (out/'navigation'/'collision.json').write_text(json.dumps(navigation,ensure_ascii=False,indent=2))
 manifest={'format':'black-hollow-house','version':'1.0-prototype','name':data.get('name','Haunted Estate'),'id':slug(data.get('name','haunted-estate')),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'entry':entry,'floors':files,'navigation':'navigation/collision.json','magic':'navigation/magic.json','roof':'geometry/roof.glb','specialRooms':{'mainHall':'geometry/special_main_hall.glb','floor13Conservatory':'geometry/special_floor13_conservatory.glb'},'runtimeStatus':'compiled-geometry-only; gameplay bridge and magical traversal not yet wired'}
 (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));shutil.copyfile(source,out/'source.haunt')
 (out/'validation.json').write_text(json.dumps({'status':'passed-with-warnings' if warnings else 'passed','errors':[],'warnings':warnings,'totalRooms':len(rooms),'floors':len(floors),'magicRepairs':len(magic['repairs']),'allRoomsReachableWithMagic':magic['allRoomsReachable']},indent=2))
 print(f'Built {out}: {len(floors)} floors, {len(rooms)} rooms')
if __name__=='__main__':
 if len(sys.argv)!=3:sys.exit('Usage: python forge.py input.haunt output_directory')
 main(sys.argv[1],sys.argv[2])
