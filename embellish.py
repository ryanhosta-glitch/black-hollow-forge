"""Forge architectural detail generator.
Geometry is decoration only; door/walk clearances remain cut out.
Colors are authored approximations, NOT copied textures from the game.
"""
import math

BRASS=(175,135,75,255)
GOLD=(204,165,93,255)
DARK=(47,32,30,255)
OAK=(90,54,40,255)
SLATE=(63,69,79,255)
STONE=(142,135,131,255)
GLASS=(82,123,134,120)

def architectural_details(scene,add,r):
    k=.3048
    x,z,w,d=(float(r[v])*k for v in ('x','y','l','w'))
    h=max(4,float(r.get('h',10)))*k
    rid=str(r.get('id','unknown'))
    tw=.17; lead=.027
    openings=r.get('openings') or []
    for j,o in enumerate(openings):
        wall=o.get('wall')
        if wall not in ('top','bottom','left','right'):continue
        typ=o.get('type','door')
        is_window=typ=='window'
        if typ not in ('door','arch','archway','open','passage','window'):continue
        horiz=wall in ('top','bottom')
        L=w if horiz else d
        p=max(.08,min(.92,float(o.get('pos',.5))))*L
        width=min(L*.75,float(o.get('width',3))*k)
        width=min(width,L-0.15)
        if width<=0.3:continue
        if horiz:
            cx=x+p;cz=z+(d if wall=='top' else 0)
            def slab(name,offset,yy,length,thick,height,color):
                add(scene,rid+'-'+str(j)+'-'+name,(cx+offset,yy,cz),(thick if name.endswith('edge') else length,height,tw),color)
            def piece(tag,along,cy,along_size,vertical_size,col):
                add(scene,rid+f'-opening{j}-{tag}',(cx+along,cy,cz),(along_size,vertical_size,.072),col)
        else:
            cx=x+(w if wall=='right' else 0);cz=z+p
            def piece(tag,along,cy,along_size,vertical_size,col):
                add(scene,rid+f'-opening{j}-{tag}',(cx,cy,cz+along),(.072,vertical_size,along_size),col)
        bottom=.90 if is_window else 0
        top=min(h-.20,2.1 if is_window else 2.15)
        if top-bottom<=.25:continue
        for direction in (-1,1):
            piece('jamb-'+str(direction),direction*width/2,(bottom+top)/2,.09,top-bottom,STONE if is_window else OAK)
            piece('fluted-pilaster-'+str(direction),direction*(width/2+.11),(bottom+top)/2,.045,top-bottom,GOLD if r.get('style') in ('damask','wainscot') else STONE)
        piece('lintel',0,top,width+.24,.13,GOLD if r.get('style')=='damask' else OAK)
        if is_window:
            piece('sill',0,bottom-.06,width+.28,.12,STONE)
            # Glass is inset with mullions. Windows in the source are open cutouts.
            piece('glass',0,(bottom+top)/2,width-.18,top-bottom-.14,GLASS)
            piece('window-transom',0,bottom+(top-bottom)*.72,width-.15,.035,DARK)
            piece('window-mullion',0,(bottom+top)/2,.04,top-bottom-.2,DARK)
        elif typ=='door':
            # Leave the opening fully clear for player traversal; show a door hung open
            # next to one jamb, entirely inside adjacent trim space.
            piece('threshold',0,.035,width-.10,.07,BRASS)
            piece('hinge',width/2,.45,.10,.12,BRASS)
        else:
            piece('arch-pediment',0,top+.08,width+.12,.12,BRASS)
    # Upper cornice and ceiling rosette ornaments: visual only.
    style=r.get('style','stonewall')
    cornice=GOLD if style in ('wainscot','damask') else OAK if style=='darkwood' else STONE
    for side in (0,1):
        add(scene,rid+'-cornice-x'+str(side),(x+w/2,h-.12,z+side*d),(w,.13,.11),cornice)
        add(scene,rid+'-cornice-z'+str(side),(x+side*w,h-.12,z+d/2),(.11,.13,d),cornice)
    if r.get('type')=='stairs':
        # Stairs must be traversed by runtime-owned navigation. This is a visual staircase
        # proxy rather than collision geometry; preserve the room footprint and entry.
        steps=13
        ascending=r.get('stairEntrance') not in ('top','right')
        for n in range(steps):
            f=n/steps; zz=z+(f if ascending else 1-f)*d
            width=min(w*.78,2.0);xx=x+w/2
            add(scene,rid+f'-stair-tread-{n}',(xx,f*(h-.3)+.02,zz),(width,.10,d/steps*.8),(126,105,91,255))
        # Upper rail silhouettes (not used for collision).
        for direction in (-1,1):
            xx=x+w/2+direction*min(w*.40,1.06)
            for n in range(0,steps,2):
                f=n/steps;zz=z+(f if ascending else 1-f)*d
                add(scene,rid+f'-stair-baluster-{direction}-{n}',(xx,f*(h-.3)+.55,zz),(.045,1.05,.045),BRASS)

def roof_exterior(scene,add,source):
    """Single building-envelope roof; overhangs the top-floor bounding footprint.
    Simplicity is intentional: nonrectangular roof union needs a polygon solver.
    """
    floors=source.get('floors',[])
    top=next((f for f in reversed(floors) if f.get('rooms')),None)
    if top is None:return {'style':'none','limits':'no floors'}
    k=.3048
    roof=source.get('roof') or {};typ=str(roof.get('type','hip') or 'hip')
    rise=max(1.,float(roof.get('rise',5)))*k
    rooms=[r for r in top.get('rooms',[]) if r.get('type') not in ('porch',)]
    if not rooms:return {'style':'none','limits':'empty top floor'}
    x0=min(r['x'] for r in rooms)*k-.4
    x1=max(r['x']+r['l'] for r in rooms)*k+.4
    z0=min(r['y'] for r in rooms)*k-.4
    z1=max(r['y']+r['w'] for r in rooms)*k+.4
    h=max(float(r.get('h',10)) for r in rooms)*k
    # All floor GLBs are local to each floor. Roof is a roof-local GLB.
    y=h+.08
    if typ=='flat':
        add(scene,'unified-flat-roof',((x0+x1)/2,y+.12,(z0+z1)/2),(x1-x0,.24,z1-z0),SLATE)
    else:
        W=x1-x0;D=z1-z0
        inset=min(W,D)*(.18 if typ=='mansard' else .42)
        if typ=='gable':
            if W>D:
                coords=[[(x0,y,z0),(x1,y,z0),(x1,y+rise,(z0+z1)/2),(x0,y+rise,(z0+z1)/2)],[(x0,y+rise,(z0+z1)/2),(x1,y+rise,(z0+z1)/2),(x1,y,z1),(x0,y,z1)]]
            else:
                coords=[[(x0,y,z0),(x0,y,z1),((x0+x1)/2,y+rise,z1),((x0+x1)/2,y+rise,z0)],[((x0+x1)/2,y+rise,z0),((x0+x1)/2,y+rise,z1),(x1,y,z1),(x1,y,z0)]]
        else:
            xa=x0+inset;xb=x1-inset;za=z0+inset;zb=z1-inset
            coords=[[(x0,y,z0),(x1,y,z0),(xb,y+rise,za),(xa,y+rise,za)],[(x1,y,z0),(x1,y,z1),(xb,y+rise,zb),(xb,y+rise,za)],[(x1,y,z1),(x0,y,z1),(xa,y+rise,zb),(xb,y+rise,zb)],[(x0,y,z1),(x0,y,z0),(xa,y+rise,za),(xa,y+rise,zb)]]
            if typ=='mansard':coords.append([(xa,y+rise,za),(xb,y+rise,za),(xb,y+rise,zb),(xa,y+rise,zb)])
        import numpy as np
        import trimesh
        for j,quad in enumerate(coords):
            v=np.array(quad,dtype=float);faces=np.array([[0,1,2],[0,2,3],[2,1,0],[3,2,0]])
            m=trimesh.Trimesh(vertices=v,faces=faces,process=False)
            m.visual.face_colors=np.tile(np.array(SLATE,dtype=np.uint8),(len(faces),1))
            scene.add_geometry(m,node_name=f'unified-{typ}-roof-{j}')
        if typ=='mansard':
            # ornamental seam atop four sloped planes
            add(scene,'roof-iron-crest',((xa+xb)/2,y+rise+.11,za),(.06,.22,.06),BRASS)
    # Visual-only slate courses, ornamental crest, corner finials and dormer silhouettes.
    if typ=='mansard':
        W=x1-x0; D=z1-z0; inset=min(W,D)*.18
        xa=x0+inset;xb=x1-inset;za=z0+inset;zb=z1-inset
        # At each height the rectangular contour contracts with the roof slope.
        for course in range(1,8):
            frac=course/8
            yy=y+frac*rise+.035
            lx=x0+frac*inset;rx=x1-frac*inset
            nz=z0+frac*inset;fz=z1-frac*inset
            add(scene,f'slate-front-course-{course}',((lx+rx)/2,yy,nz),(max(.1,rx-lx),.035,.055),(95,101,116,255))
            add(scene,f'slate-back-course-{course}',((lx+rx)/2,yy,fz),(max(.1,rx-lx),.035,.055),(95,101,116,255))
            add(scene,f'slate-left-course-{course}',(lx,yy,(nz+fz)/2),(.055,.035,max(.1,fz-nz)),(95,101,116,255))
            add(scene,f'slate-right-course-{course}',(rx,yy,(nz+fz)/2),(.055,.035,max(.1,fz-nz)),(95,101,116,255))
        for i,(xx,zz) in enumerate(((xa,za),(xa,zb),(xb,za),(xb,zb))):
            add(scene,f'gothic-roof-finial-{i}',(xx,y+rise+.43,zz),(.13,.86,.13),BRASS)
            add(scene,f'roof-finial-base-{i}',(xx,y+rise+.12,zz),(.34,.18,.34),GOLD)
        # Three dormer frames along the longest slope; proxies rather than cuts into roof planes.
        if W>5:
            for i in range(3):
                xx=x0+W*(i+1)/4;zz=z0+inset*.36; yy=y+rise*.36
                add(scene,f'mansard-dormer-side-{i}',(xx,yy+.46,zz),(.9,.92,.33),STONE)
                add(scene,f'mansard-dormer-glazing-{i}',(xx,yy+.46,zz-.2),(.6,.7,.03),(64,97,123,255))
                add(scene,f'mansard-dormer-cap-{i}',(xx,yy+1.0,zz), (1.14,.16,.48),SLATE)
        # Embellishments do not solve the bounding-rectangle roof limitations.
    # Gothic chimney silhouettes; placed on visual roof only.
    if len(rooms)>2:
        for j,(cx,cz) in enumerate([(x0+2,z0+2),(x1-2,z1-2)]):
            add(scene,f'chimney-{j}',(cx,y+rise*.75,cz),(.68,rise*1.5,.68),(113,82,83,255))
            add(scene,f'chimney-cap-{j}',(cx,y+rise*1.5+.08,cz),(.92,.16,.92),STONE)
    return {'style':typ,'riseFeet':round(rise/k,2),'limits':'Bounding-rectangle envelope. Recessed wings and roof valleys not yet resolved.'}
