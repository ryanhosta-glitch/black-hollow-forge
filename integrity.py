"""Forge non-destructive opening/arrival/vertical integrity metadata.
Advisory geometric tests: no claim of simulated first-person physics.
"""
import math

def compile_integrity(data, magic):
    floors=data.get('floors') or []
    rooms={str(r['id']):(fi,r) for fi,f in enumerate(floors) for r in f.get('rooms',[]) if r.get('id')}
    doors=[];windows=[];warnings=[];shafts=[];stairs=[];safe={};slab_openings=[]
    def bounds(r):return (float(r['x']),float(r['y']),float(r['l']),float(r['w']))
    def inside(r,x,y,margin=0.5):
        rx,ry,l,w=bounds(r)
        return rx+margin<=x<=rx+l-margin and ry+margin<=y<=ry+w-margin
    def place(r):
        x,y,l,w=bounds(r)
        # Walking-center candidate, not proof of furniture clearance.
        return [round(x+l*.5,4),round(y+w*.5,4)]
    for rid,(fi,r) in rooms.items():
        x,y,l,w=bounds(r); safe[rid]={'floorIndex':fi,'pointFeet':place(r),'status':'candidate-needs-runtime-collision-check'}
        if min(l,w)<3:warnings.append({'kind':'narrow-space','roomId':rid,'widthFeet':min(l,w)})
        if float(r.get('h',10))<6.5:warnings.append({'kind':'low-ceiling','roomId':rid})
        for op in r.get('openings') or []:
            typ=op.get('type'); wall=op.get('wall')
            if typ not in ('door','window','arch','archway','open','passage'):continue
            if wall not in ('top','bottom','left','right'):
                warnings.append({'kind':'invalid-opening-wall','roomId':rid,'openingId':op.get('id')});continue
            try: pos=float(op.get('pos',.5)); width=float(op.get('width',3))
            except (ValueError,TypeError):warnings.append({'kind':'invalid-opening-size','roomId':rid,'openingId':op.get('id')});continue
            length=l if wall in ('top','bottom') else w
            width=min(length*.75,width)
            if not (0<=pos<=1) or width<=0:
                warnings.append({'kind':'out-of-range-opening','roomId':rid,'openingId':op.get('id')});continue
            center=pos*length; span=[max(0,center-width/2),min(length,center+width/2)]
            if wall in ('top','bottom'):
                wx=x+center;wy=y+(w if wall=='top' else 0)
                ix=wx;iy=wy+(-.75 if wall=='top' else .75)
            else:
                wx=x+(l if wall=='right' else 0);wy=y+center
                ix=wx+(-.75 if wall=='right' else .75);iy=wy
            record={'id':str(op.get('id') or rid+':'+wall+':'+str(pos)),'roomId':rid,'floorIndex':fi,'type':typ,'style':op.get('style'), 'wall':wall,'relativePosition':pos,'widthFeet':round(width,3),'spanFeet':[round(i,3) for i in span], 'wallCenterFeet':[round(wx,4),round(wy,4)],'interiorApproachFeet':[round(ix,4),round(iy,4)],'shared':op.get('shared')}
            if typ=='window':windows.append(record)
            else:
                record['animation']={'kind':'hinge','state':'open','pivot':'generated-at-runtime'} if typ=='door' else {'kind':'none'}
                record['traversable']=width>=2.25
                if width<2.25:warnings.append({'kind':'narrow-opening','openingId':record['id'],'roomId':rid,'widthFeet':width})
                if not inside(r,ix,iy,0):warnings.append({'kind':'unsafe-door-approach','openingId':record['id'],'roomId':rid})
                doors.append(record)
        if r.get('type')=='elevator':
            shafts.append({'roomId':rid,'floorIndex':fi,'shaftId':r.get('elevatorShaftId'),'arrivalFeet':place(r)})
        if r.get('type')=='stairs' or r.get('embeddedStair'):
            stairs.append({'roomId':rid,'floorIndex':fi,'embedded':bool(r.get('embeddedStair')),'layout':(r.get('embeddedStair') or {}).get('layout') or r.get('stairLayout','straight'),'arrivalFeet':place(r)})
            if r.get('embeddedStair'):
                e=r['embeddedStair'];slab_openings.append({'roomId':rid,'floorIndex':fi,'kind':'embedded-stair','localFeet':{k:e.get(k) for k in ('x','y','l','w')},'status':'needs-boolean-slab-cutout'})
    # Real door shared IDs map to architectural graph connections.
    paired={}
    for d in doors:
        if d['shared']:paired.setdefault((d['floorIndex'],str(d['shared'])),[]).append(d)
    for key,group in paired.items():
        if len(group)!=2:warnings.append({'kind':'unpaired-or-ambiguous-door','shared':key[1],'count':len(group)})
        if len(group)==2:
            a,b=group
            if math.dist(a['wallCenterFeet'],b['wallCenterFeet'])>1.5:
                warnings.append({'kind':'misaligned-shared-door','shared':key[1],'distanceFeet':round(math.dist(a['wallCenterFeet'],b['wallCenterFeet']),2)})
            a['targetRoomId']=b['roomId'];b['targetRoomId']=a['roomId']
    for repair in magic.get('repairs',[]):
        if repair.get('type')=='spectral-elevator-stop':
            dest=repair.get('toRoom');repair['arrival']=safe.get(dest)
            repair['returnToRoom']=repair.get('fromRoom')
    return {'schema':'black-hollow-integrity-1','doors':doors,'windows':windows,'stairs':stairs,'elevatorShafts':shafts,'floorOpenings':slab_openings,'safeRoomPoints':safe,'warnings':warnings,'runtimeRequirements':['verify player capsule clearance','validate door hinges and furniture collision','create slab cutouts for stairwells and shafts','do not instantiate closed solid doors across passages'], 'counts':{'doors':len(doors),'windows':len(windows),'stairs':len(stairs),'shafts':len(shafts),'warnings':len(warnings)}}
