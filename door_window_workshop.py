"""Forge component export: authored doors, windows and generated window enhancement proposals.
All assets are additive, separately toggleable; not yet gameplay-certified.
"""
import math, json
from pathlib import Path
import numpy as np
import trimesh

FT=.3048

def box(sc, name, xyz, dims, rgba):
    m=trimesh.creation.box(extents=dims)
    m.apply_translation(xyz)
    m.visual.face_colors=np.array(rgba, dtype=np.uint8)
    sc.add_geometry(m, node_name=name, geom_name=name)

def build(floors, out_dir, window_plans):
    out_dir=Path(out_dir); (out_dir/'geometry').mkdir(parents=True,exist_ok=True)
    results=[]; metadata=[]
    windows_by_floor={p['floor']:p for p in window_plans}
    for fi,f in enumerate(floors):
        sc=trimesh.Scene(); count=0
        generated={}
        for w in windows_by_floor.get(fi,{}).get('windows',[]):
            generated.setdefault(str(w['roomId']),[]).append(w)
        for room in f.get('rooms',[]):
            rid=str(room['id']); x,z,w,d=[float(room[k])*FT for k in ('x','y','l','w')]; h=float(room.get('h',10))*FT
            openings=list(room.get('openings') or [])
            for win in generated.get(rid,[]):
                openings.append({'type':'window','wall':win['wall'],'pos':win['pos'],'width':win['widthMeters']/FT,'forgeGenerated':True})
            for i,op in enumerate(openings):
                kind=op.get('type'); wall=op.get('wall')
                if kind not in ('door','window') or wall not in ('top','bottom','left','right'): continue
                along=w if wall in ('top','bottom') else d
                half=min(along*.75,max(.4,float(op.get('width',3))*FT))/2
                t=max(half,min(along-half,float(op.get('pos',.5))*along))
                width=min(2*half,along)
                if width<.45:continue
                ox=x+t if wall in ('top','bottom') else x+(w if wall=='right' else 0)
                oz=z+(d if wall=='top' else 0) if wall in ('top','bottom') else z+t
                is_h=wall in ('top','bottom')
                height=min(h-.16,2.15 if kind=='door' else 2.08)
                sill=0 if kind=='door' else min(.9,h*.30)
                if height-sill<.4:continue
                name=f'{rid}-{kind}-{i}'; gold=(145,112,69,255); wood=(80,46,33,255); stone=(140,133,132,255)
                def piece(tag,a,b,depth,color):
                    # a = lengthwise opening-center offset; b = elevation
                    xyz=(ox+a,b,oz+depth) if is_h else (ox+depth,b,oz+a)
                    dims=(.065,.09,.095) if is_h else (.095,.09,.065)
                    box(sc,name+'-'+tag,xyz,dims,color)
                # Frame: two jambs and an overhead lintel, dimensioned in world units.
                for side in (-1,1):
                    alongpos=side*(width/2+.048)
                    center=(ox+alongpos,(sill+height)/2,oz) if is_h else (ox,(sill+height)/2,oz+alongpos)
                    dims=(.085,height-sill,.095) if is_h else (.095,height-sill,.085)
                    box(sc,name+'-carved-jamb-'+str(side),center,dims,wood)
                    for yy in (sill+.18,height-.13):piece('jamb-cap-'+str(side)+'-'+str(yy),alongpos,yy,0,gold)
                header=(ox,height+.055,oz) if is_h else (ox,height+.055,oz)
                box(sc,name+'-header',header,(width+.19,.11,.11) if is_h else (.11,.11,width+.19),stone)
                if kind=='door':
                    # The leaf remains a separate 3D object; rotation around hinge is defined in metadata.
                    # Do NOT merge with authored wall or collision geometry.
                    hinge=-width/2+.035
                    leafcenter=hinge+(width-.07)/2
                    center=(ox+leafcenter,height/2,oz) if is_h else (ox,height/2,oz+leafcenter)
                    box(sc,name+'-door-leaf',center,(width-.075,height-.09,.055) if is_h else (.055,height-.09,width-.075),wood)
                    for yy in (.55,1.40):
                        handleoff=width/2-.18
                        center=(ox+handleoff,yy,oz-.055) if is_h else (ox-.055,yy,oz+handleoff)
                        box(sc,name+f'-brass-hardware-{yy}',center,(.09,.09,.04) if is_h else (.04,.09,.09),gold)
                    metadata.append({'id':name,'kind':'hinged-door','roomId':rid,'floor':fi,'source':'student','closedCenterMeters':[ox,height/2,oz], 'hingeMeters':[ox+hinge,0,oz] if is_h else [ox,0,oz+hinge],'leafWidthMeters':round(width-.075,3),'heightMeters':round(height,3),'openingAngleDegrees':85,'swingClearance':'UNVERIFIED; door leaf preview only','gameplayReady':False})
                else:
                    # Gothic pointed-tracery suggestion that does not affect the authored glazing.
                    for frac in (-.24,0,.24):
                        pt=frac*width
                        center=(ox+pt,(sill+height)/2,oz) if is_h else (ox,(sill+height)/2,oz+pt)
                        box(sc,name+'-mullion-'+str(frac),center,(.025,height-sill,.055) if is_h else (.055,height-sill,.025),gold)
                    metadata.append({'id':name,'kind':'tracery-window','roomId':rid,'floor':fi,'source':'forge' if op.get('forgeGenerated') else 'student','widthMeters':round(width,3),'gameplayReady':False})
                count+=1
        dest=f'geometry/door_window_floor_{fi:02d}.glb'
        sc.export(out_dir/dest)
        results.append({'floor':fi,'model':dest,'components':count})
    contract={'version':1,'units':'meters','studentBlueprintModified':False,'rendering':'separate optional GLB overlays, not installed into collision mesh', 'models':results,'interactiveComponents':metadata, 'limitations':['hinge pivots declared but door leaves are currently static mesh previews','swing volumes, neighboring-room conflicts and furnishing clearance not certified','do not treat any door or window as gameplay-ready']}
    (out_dir/'navigation'/'door_window_workshop.json').write_text(json.dumps(contract,indent=2))
    return contract
