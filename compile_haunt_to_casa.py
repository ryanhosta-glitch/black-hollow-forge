#!/usr/bin/env python3
"""Forge 3.9 universal .haunt -> .casa QA compiler. Python 3, trimesh, numpy."""
import argparse, hashlib, json, re, zipfile, io
from pathlib import Path
import numpy as np
import trimesh

def slug(s): return re.sub(r'^-+|-+$','',re.sub('[^a-z0-9]+','-',str(s).casefold())) or 'unnamed-house'
def b(v): return json.dumps(v,indent=2,ensure_ascii=False).encode('utf-8')+b'\n'
def check_path(p):
    if p.startswith('/') or '..' in Path(p).parts or '\\' in p: raise ValueError('Unsafe package path')

def compile_blueprint(source, creator='', description='', house_id=None):
    if not isinstance(source,dict) or not isinstance(source.get('floors'),list) or not source['floors']: raise ValueError('A .haunt must contain a nonempty floors array')
    name=str(source.get('name') or '').strip()
    if not name: raise ValueError('A mansion name is required')
    floors=source['floors']; ids=set(); room_defs=[]; floor_models=[]; preview_boxes=[]; collision=[]; issues=[]; entry=source.get('gameEntry') or {}
    for fi,fl in enumerate(floors):
        if not isinstance(fl.get('rooms'),list):raise ValueError(f'Floor {fi} has no rooms array')
        room_meshes=[]
        for r in fl['rooms']:
            rid=str(r.get('id') or '')
            if not rid or rid in ids:raise ValueError(f'Missing/duplicate room ID {rid!r}')
            ids.add(rid)
            try: x,y,l,w,h=[float(r[k]) for k in ('x','y','l','w','h')]
            except (KeyError,TypeError,ValueError):raise ValueError(f'Invalid room bounds: {rid}')
            if not all(np.isfinite([x,y,l,w,h])) or min(l,w,h)<=0:raise ValueError(f'Invalid dimensions: {rid}')
            if max(abs(x),abs(y),l,w,h)>10000:raise ValueError(f'Excessively large room: {rid}')
            base=fi*14.0; ceiling=base+h
            def box(center,size,mat):
                if min(size)<=0.01:return
                m=trimesh.creation.box(extents=size);m.apply_translation(center); m.visual.face_colors=mat;room_meshes.append(m)
            floorcol=[67,60,64,255];wallcol=[112,102,114,255];roofcol=[54,47,60,255]
            box((x+l/2,base-.12,y+w/2),(l,.24,w),floorcol)
            box((x+l/2,ceiling+.10,y+w/2),(l,.20,w),roofcol)
            openings=r.get('openings') or []
            wall_specs={'top':(x,y,l,'x'),'bottom':(x,y+w,l,'x'),'left':(x,y,w,'z'),'right':(x+l,y,w,'z')}
            for side,(sx,sz,span,axis) in wall_specs.items():
                intervals=[]
                for o in openings:
                    if o.get('wall')!=side or o.get('type') not in ('door','window'):continue
                    pos=float(o.get('pos',.5));center=max(.1,min(.9,pos))*span
                    width=min(2.4 if o['type']=='door' else 1.65,span*.68)
                    lo=max(0,center-width/2);hi=min(span,center+width/2)
                    bottom=0 if o['type']=='door' else h*.34
                    height=min(2.6,h*.82) if o['type']=='door' else min(1.55,h*.4)
                    intervals.append((lo,hi,bottom,min(h,bottom+height)))
                # Partition wall across opening boundaries; leave holes only where the segment crosses the opening's vertical interval.
                cuts=sorted({0.,span,*[q for lo,hi,_,_ in intervals for q in (lo,hi)]})
                for a,c in zip(cuts,cuts[1:]):
                    if c-a<.01:continue
                    mid=(a+c)/2; holes=[(bt,tp) for lo,hi,bt,tp in intervals if lo<=mid<=hi]
                    heights=sorted({0.,h,*[q for bt,tp in holes for q in (bt,tp)]})
                    for low,high in zip(heights,heights[1:]):
                        if high-low<.01 or any(bt<=(high+low)/2<=tp for bt,tp in holes):continue
                        coord=(sx+mid,base+(low+high)/2,sz) if axis=='x' else (sx,base+(low+high)/2,sz+mid)
                        size=(c-a,high-low,.22) if axis=='x' else (.22,high-low,c-a)
                        box(coord,size,wallcol)
                collision.append({'roomId':rid,'floor':fi,'wall':side,'openings':[o for o in openings if o.get('wall')==side]})
            room_defs.append({'id':rid,'name':r.get('name',rid),'floor':fi,'bounds':{'x':x,'y':y,'l':l,'w':w,'h':h},'openings':openings,'type':r.get('type','room'),'roomType':r.get('roomType'),'haunting':r.get('haunting',0),'elevatorShaftId':r.get('elevatorShaftId')})
            if fi==0:preview_boxes.extend(room_meshes[-(2+4):])
            if r.get('embeddedStair') or r.get('stairs') or 'stair' in str(r.get('type','')).lower() or 'stair' in str(r.get('roomType','')).lower():
                issues.append({'severity':'BLOCK_GAME_READY','code':'STAIR_TRAVERSAL_NOT_COMPILED','roomId':rid})
        if not room_meshes: issues.append({'severity':'BLOCK_GAME_READY','code':'EMPTY_FLOOR','floor':fi})
        scene=trimesh.Scene()
        if room_meshes:scene.add_geometry(trimesh.util.concatenate(room_meshes))
        floor_models.append((f'geometry/floor_{fi:02}.glb',trimesh.exchange.gltf.export_glb(scene)))
    chosen=next((r for r in room_defs if r['id']==entry.get('roomId')),None)
    if chosen and entry.get('openingId') and not any(o.get('id')==entry['openingId'] and o.get('type')=='door' for o in chosen['openings']):chosen=None
    if not chosen:
        chosen=next((r for r in room_defs if any(o.get('type')=='door' for o in r['openings'])),room_defs[0] if room_defs else None)
        entry={'roomId':chosen['id'],'openingId':next((o.get('id') for o in chosen['openings'] if o.get('type')=='door'),None)} if chosen else {}
        issues.append({'severity':'ADVISORY','code':'ENTRY_FALLBACK_SELECTED'})
    if not chosen:raise ValueError('No rooms available')
    identity={'houseId':house_id or ('house-'+hashlib.sha256(b(source)).hexdigest()[:14]),'name':name,'architect':creator,'description':description,'slug':slug(name),'street':{'mailboxName':name,'preview':'exterior/street_preview.glb'}}
    preview_scene=trimesh.Scene()
    if preview_boxes:preview_scene.add_geometry(trimesh.util.concatenate(preview_boxes))
    else:preview_scene=trimesh.load(io.BytesIO(floor_models[0][1]),file_type='glb',force='scene')
    files={'source.haunt':b(source),'casa_identity.json':b(identity),'navigation/rooms.json':b({'rooms':room_defs,'entry':entry}),'navigation/collision.json':b({'status':'uncertified','wallSegments':collision,'physicsCertified':False}),'navigation/stairs.json':b({'status':'uncertified','requiresControllerTesting':True}),'exterior/street_preview.glb':trimesh.exchange.gltf.export_glb(preview_scene)}
    files.update(floor_models)
    issues.extend([{'severity':'BLOCK_GAME_READY','code':'COLLISION_PHYSICS_NOT_CERTIFIED'},{'severity':'BLOCK_GAME_READY','code':'GAME_CASA_LOADER_NOT_INTEGRATED'}])
    manifest={'format':'black-hollow-house','version':'1.0-qa','name':name,'id':identity['houseId'],'entry':entry,'floors':[{'id':f'floor_{fi:02}','name':fl.get('name',f'Floor {fi+1}'),'model':f'geometry/floor_{fi:02}.glb','roomIds':[r['id'] for r in room_defs if r['floor']==fi]} for fi,fl in enumerate(floors)],'navigation':'navigation/rooms.json','collision':'navigation/collision.json','stairNavigation':'navigation/stairs.json','casa':{'spec':'black-hollow-casa','specVersion':'1.0','creator':creator,'description':description,'streetPreview':'exterior/street_preview.glb','source':'source.haunt','gameplayCertified':False,'geometryLevel':'qa-simple-architecture','gameOwned':['missions','ghosts','Impossible Elevator','Floor 13','save games']}}
    files['manifest.json']=b(manifest)
    checks={k:{'bytes':len(v),'sha256':hashlib.sha256(v).hexdigest()} for k,v in sorted(files.items())}
    files['casa_validation.json']=b({'spec':'black-hollow-casa','version':'1.0','packagingStatus':'QA_PACKAGE','gameReady':False,'architecturalRooms':len(room_defs),'floors':len(floors),'issues':issues,'entries':checks})
    out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for path,content in sorted(files.items()):check_path(path);z.writestr(path,content)
    return out.getvalue(),manifest,issues

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('haunt',type=Path);ap.add_argument('--architect',default='');ap.add_argument('--description',default='');ap.add_argument('--house-id',default=None);ap.add_argument('--output',type=Path,default=None);args=ap.parse_args()
    source=json.loads(args.haunt.read_text(encoding='utf-8-sig'));data,manifest,issues=compile_blueprint(source,args.architect,args.description,args.house_id)
    target=args.output or Path(slug(manifest['name'])+'.casa');target.write_bytes(data)
    print(f'Created {target} ({len(data)} bytes), {len(manifest["floors"])} floors, {len(issues)} QA flags — NOT GAMEPLAY CERTIFIED')
if __name__=='__main__':main()
