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
from integrity import compile_integrity
from embellish import architectural_details, roof_exterior
from victorian_architecture import build_exterior_facade, forge_window_plan
from special_scenes import build as build_special
from grand_interior import apply as apply_interior
from historic_interior_pass import apply as apply_historic_interior
from door_window_workshop import build as build_door_window_workshop

def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-') or 'house'
def box(scene,name,center,dims,color):
 if min(dims)<=0.001:return
 m=trimesh.creation.box(extents=dims);m.apply_translation(center);m.visual.face_colors=np.asarray(color,dtype=np.uint8);scene.add_geometry(m,node_name=name,geom_name=name)
# Compile Architect finish tokens into visible geometry.  These are authored
# palettes inspired by Black Hollow 8.5.19, not extracted proprietary textures.
WALL_COLORS={'stonewall':(93,97,111,255),'wainscot':(115,91,80,255),
             'damask':(85,59,83,255),'darkwood':(61,45,41,255)}
FLOOR_COLORS={'stone':(84,83,90,255),'marble':(192,176,159,255),
              'wood':(115,72,50,255),'herringbone':(109,72,53,255)}
def wall_section(scene,rid,wall,x,z,w,d,t,bottom,top,a,b,color,label,detail=True):
 if b-a<.025 or top-bottom<.025:return
 horizontal=wall in ('top','bottom')
 if horizontal: center=(x+(a+b)/2,(bottom+top)/2,z+(d if wall=='top' else 0));size=(b-a,top-bottom,t)
 else:center=(x+(w if wall=='right' else 0),(bottom+top)/2,z+(a+b)/2);size=(t,top-bottom,b-a)
 box(scene,rid+'-'+wall+'-'+label,center,size,color)

def render_floor(floor,outfile,index):
 scene=trimesh.Scene();parts=0
 plans=forge_window_plan(floor)
 enhanced={}
 for wplan in plans["windows"]: enhanced.setdefault(wplan["roomId"],[]).append(wplan)
 for r in floor.get('rooms',[]):
  x,z,w,d=(float(r[k]) for k in ('x','y','l','w'));h=max(4,float(r.get('h',10)))
  k=.3048;x*=k;z*=k;w*=k;d*=k;h*=k;t=.15;rid=str(r.get('id','unknown'))
  style=r.get('style','stonewall');finish=WALL_COLORS.get(style,WALL_COLORS['stonewall'])
  flooring=r.get('flooring','stone');floorcolor=FLOOR_COLORS.get(flooring,FLOOR_COLORS['stone'])
  box(scene,rid+'-floor',(x+w/2,-.09,z+d/2),(w,.18,d),floorcolor)
  # patterned marble, plank, and herringbone flooring
  if flooring=='marble':
   for j in range(1,min(32,int(w/.75))):
    xx=x+j*.75
    if xx<x+w:box(scene,rid+f'-marble-seam-x{j}',(xx,.003,z+d/2),(.012,.008,d),(106,101,102,255))
   for j in range(1,min(32,int(d/.75))):
    zz=z+j*.75
    if zz<z+d:box(scene,rid+f'-marble-seam-z{j}',(x+w/2,.003,zz),(w,.008,.012),(106,101,102,255))
  elif flooring in ('wood','herringbone'):
   count=min(28,int(w/.27))
   for j in range(1,count):
    xx=x+j*w/count
    box(scene,rid+f'-plank-seam-{j}',(xx,.002,z+d/2),(.011,.006,d),(48,32,30,255))
   if flooring=='herringbone':
    for j in range(1,min(36,int(d/.34))):
     zz=z+j*.34
     box(scene,rid+f'-herringbone-end-{j}',(x+w/2,.003,zz),(w,.006,.012),(63,41,34,255))
  box(scene,rid+'-ceiling',(x+w/2,h+.04,z+d/2),(w,.08,d),(83,73,76,255));parts+=2
  opens=list(r.get('openings') or [])
  # Forge-owned openings are merged for rendering, NOT written to the source blueprint.
  for win in enhanced.get(rid,[]):
   opens.append({'type':'window','wall':win['wall'],'pos':win['pos'],'width':win['widthMeters']/k,'forgeGenerated':True})
  for wall in ('top','bottom','left','right'):
   horizontal=wall in ('top','bottom');length=w if horizontal else d
   holes=[]
   for op in opens:
    if op.get('wall')!=wall or op.get('type') not in ('door','window','arch','archway','open','passage'):continue
    p=float(op.get('pos',.5));p=max(0,min(1,p));ow=min(length*.75,float(op.get('width',3))*k)
    center=p*length;a=max(0,center-ow/2);b=min(length,center+ow/2)
    if b-a>.1:holes.append((a,b,op.get('type')))
   holes.sort();cursor=0
   def decorate(a,b,bottom,top,label):
    if b-a<.12 or top-bottom<.25:return
    # Decoration remains strictly inside solid wall segment; never spans a door/window.
    def band(y0,y1,col,tag,depth=.035):
     if y1<=y0:return
     if horizontal:
      pos=(x+(a+b)/2,(y0+y1)/2,z+(d if wall=='top' else 0)+(.11 if wall=='top' else -.11))
      dims=(b-a,y1-y0,depth)
     else:
      pos=(x+(w if wall=='right' else 0)+(.11 if wall=='right' else -.11),(y0+y1)/2,z+(a+b)/2)
      dims=(depth,y1-y0,b-a)
     box(scene,rid+'-'+wall+'-finish-'+label+'-'+tag,pos,dims,col)
    if style=='wainscot':
     band(.18,min(1.12,top-.07),(102,64,49,255),'lower')
     band(min(1.12,top-.07),min(1.19,top),(195,154,100,255),'chair-rail')
     band(.06,.16,(180,144,93,255),'skirting')
     if top>1.55:band(top-.13,top-.06,(194,154,104,255),'crown')
    elif style=='damask':
     band(.06,.16,(143,116,90,255),'skirting')
     if top>1.55:band(top-.13,top-.06,(182,142,102,255),'crown')
     for q in range(1,min(13,int((b-a)/.65))):
      p=a+q*(b-a)/max(1,int((b-a)/.65)); width=.025
      if horizontal:pos=(x+p, min(top-.25,1.53), z+(d if wall=='top' else 0)+(.125 if wall=='top' else -.125)); dims=(width,.32,.014)
      else:pos=(x+(w if wall=='right' else 0)+(.125 if wall=='right' else -.125),min(top-.25,1.53),z+p);dims=(.014,.32,width)
      box(scene,rid+'-damask-motif-'+wall+'-'+label+str(q),pos,dims,(146,113,113,255))
    elif style=='darkwood':
     band(.06,.15,(153,102,63,255),'skirting');band(top-.13,top-.06,(143,100,66,255),'crown')
     for q in range(1,min(14,int((b-a)/.9)+1)):
      p=a+q*(b-a)/(int((b-a)/.9)+1)
      if horizontal:pos=(x+p,top*.52,z+(d if wall=='top' else 0)+(.11 if wall=='top' else -.11));dims=(.035,top*.78,.03)
      else:pos=(x+(w if wall=='right' else 0)+(.11 if wall=='right' else -.11),top*.52,z+p);dims=(.03,top*.78,.035)
      box(scene,rid+'-wood-panel-stile-'+wall+'-'+label+str(q),pos,dims,(139,89,60,255))
    else:
     band(.08,.15,(118,110,109,255),'stone-base')
   def section(a,b,bottom,top,label):
    wall_section(scene,rid,wall,x,z,w,d,t,bottom,top,a,b,finish,label)
    if bottom==0:decorate(a,b,bottom,top,label)
   for n,(a,b,typ) in enumerate(holes):
    if a<cursor:a=cursor
    if b<=a:continue
    section(cursor,a,0,h,str(n)+'-solid')
    if typ=='window':
     sill=min(h*.3,.90);lintel=min(h-.25,2.1)
     section(a,b,0,sill,'sill-'+str(n));section(a,b,lintel,h,'lintel-'+str(n))
     # Glazing is visual and does not act as an opaque room wall.
     if horizontal:wc=(x+(a+b)/2,(sill+lintel)/2,z+(d if wall=='top' else 0));wd=(b-a,max(.05,lintel-sill),.025)
     else:wc=(x+(w if wall=='right' else 0),(sill+lintel)/2,z+(a+b)/2);wd=(.025,max(.05,lintel-sill),b-a)
     box(scene,rid+'-'+wall+'-window-glazing-'+str(n),wc,wd,(75,112,132,120))
    else:section(a,b,min(h,2.15),h,'lintel-'+str(n))
    cursor=b
   section(cursor,length,0,h,'end');parts+=1
  # Decoration includes the generated openings; the source room object is not changed.
  decorated=dict(r,openings=opens)
  architectural_details(scene,box,decorated)
  apply_interior(scene,box,decorated,index)
  apply_historic_interior(scene,box,decorated,index)
 facade_stats=build_exterior_facade(scene,box,floor)
 scene.export(str(outfile));return {"roomWallGroups":parts,"windowEnhancements":plans}

def make_roof(data,outfile):
 sc=trimesh.Scene()
 meta=roof_exterior(sc,box,data)
 sc.export(str(outfile))
 return meta

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
 integrity=compile_integrity(data,magic)
 (out/'navigation'/'integrity.json').write_text(json.dumps(integrity,ensure_ascii=False,indent=2))
 warnings.extend('Integrity inspection: '+w['kind'] for w in integrity['warnings'])
 warnings.extend(f"Forge repair: {r['type']}" for r in magic['repairs'])
 (out/'navigation'/'magic.json').write_text(json.dumps(magic,ensure_ascii=False,indent=2))
 files=[];window_plan=[]
 for fi,f in enumerate(floors):
  stem=f'floor_{fi:02d}';floor_result=render_floor(f,out/'geometry'/f'{stem}.glb',fi)
  window_plan.append({'floor':fi,'floorName':f.get('name',stem),**floor_result['windowEnhancements']})
  files.append({'id':stem,'name':f.get('name',stem),'model':f'geometry/{stem}.glb','roomIds':[r['id'] for r in f.get('rooms',[])]})
 # Reusable architectural enhancement contract for any compatible .haunt.
 (out/'navigation'/'forge_window_enhancements.json').write_text(json.dumps({'policy':'stable approximately 50 percent of eligible windowless rooms; authored openings preserved','originalBlueprintModified':False,'generationMode':'actual wall cutouts with inset glazing','floors':window_plan},ensure_ascii=False,indent=2))
 door_workshop=build_door_window_workshop(floors,out,window_plan)
 # Removable authored roof geometry, using the Architect's chosen type and rise.
 roof_meta=make_roof(data,out/'geometry'/'roof.glb')
 main_meta=build_special('main-hall',out/'geometry'/'special_main_hall.glb');conservatory_meta=build_special('floor13-conservatory',out/'geometry'/'special_floor13_conservatory.glb')
 entryroom=next(r for r in rooms if r['id']==er)
 navigation={'units':'feet','sourceRoomCount':len(rooms),'rooms':rooms,'elevatorShafts':elevators,'entry':entry,'specialScenes':{'mainHall':{'originalRoomId':er,'scene':'geometry/special_main_hall.glb','mode':'portal-pocket','portalReturnRoom':er,'impossibleElevator':{'positionMeters':[0,5.25,14.0]}},'floor13Conservatory':{'scene':'geometry/special_floor13_conservatory.glb','mode':'separate-dimension'}}}
 (out/'navigation'/'collision.json').write_text(json.dumps(navigation,ensure_ascii=False,indent=2))
 manifest={'format':'black-hollow-house','version':'1.0-prototype','name':data.get('name','Haunted Estate'),'id':slug(data.get('name','haunted-estate')),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'entry':entry,'floors':files,'navigation':'navigation/collision.json','magic':'navigation/magic.json','integrity':'navigation/integrity.json','forgeWindowEnhancements':'navigation/forge_window_enhancements.json','doorWindowWorkshop':'navigation/door_window_workshop.json','roof':'geometry/roof.glb','specialRooms':{'mainHall':'geometry/special_main_hall.glb','floor13Conservatory':'geometry/special_floor13_conservatory.glb'},'finishPaletteVersion':'forge-architectural-five-pass-opening-v2','authoredRoof':data.get('roof',{}),'roofBuild':roof_meta,'specialSceneDetails':[main_meta,conservatory_meta],'runtimeStatus':'compiled-geometry-with-finish-proxies; full gameplay and material-texture parity not yet wired'}
 (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));shutil.copyfile(source,out/'source.haunt')
 (out/'validation.json').write_text(json.dumps({'status':'passed-with-warnings' if warnings else 'passed','errors':[],'warnings':warnings,'totalRooms':len(rooms),'floors':len(floors),'integrityCounts':integrity['counts'],'magicRepairs':len(magic['repairs']),'allRoomsReachableWithMagic':magic['allRoomsReachable']},indent=2))
 print(f'Built {out}: {len(floors)} floors, {len(rooms)} rooms')
if __name__=='__main__':
 if len(sys.argv)!=3:sys.exit('Usage: python forge.py input.haunt output_directory')
 main(sys.argv[1],sys.argv[2])
