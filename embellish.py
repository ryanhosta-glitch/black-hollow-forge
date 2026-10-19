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
    # Exterior façade is handled once per FLOOR UNION by victorian_architecture.py.
    # Do not decorate every room wall as if it were an exterior wall.
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

def roof_exterior(scene, add, source):
    from victorian_architecture import build_roof
    return build_roof(scene, add, source)
