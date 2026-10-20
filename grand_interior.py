"""Additive architectural interior craft. Never mutates Architect source.
All measurements are metres; avoid openings and stairs, and keep decorative
projections shallow. Geometry is non-colliding visual detail only.
"""
import math

K=.3048
GOLD=(169,128,75,255)
WALNUT=(91,54,44,255)
DARK=(62,41,40,255)
STONE=(154,143,137,255)

def apply(scene, add, room, floor_index=0):
    x,z,w,d=(float(room[k])*K for k in ('x','y','l','w'))
    h=max(4,float(room.get('h',10)))*K
    rid=str(room.get('id','unknown'))
    roomtype=(str(room.get('type',''))+' '+str(room.get('name',''))).lower()
    if any(t in roomtype for t in ('stair','elevator','shaft','outdoor','porch','yard')):return {'panels':0,'doorFrames':0,'corniceSegments':0,'medallions':0}
    style=str(room.get('style','stonewall'))
    trim=STONE if style=='stonewall' else GOLD
    main=WALNUT if style in ('darkwood','wainscot') else STONE if style=='stonewall' else DARK
    metrics={'panels':0,'doorFrames':0,'corniceSegments':0,'medallions':0}
    for wall in ('bottom','top','left','right'):
        horizontal=wall in ('top','bottom')
        length=w if horizontal else d
        # Inner surface coordinates prevent accidental outward facade details.
        def item(tag,p,y,span,height,depth,color):
            if span<=.018 or height<=.018:return
            if horizontal:
                zz=z+(d-.15 if wall=='top' else .15)
                zz+=(-depth/2 if wall=='top' else depth/2)
                c=(x+p,y,zz);dim=(span,height,depth)
            else:
                xx=x+(w-.15 if wall=='right' else .15)
                xx+=(-depth/2 if wall=='right' else depth/2)
                c=(xx,y,z+p);dim=(depth,height,span)
            add(scene,f'{rid}-interior-{wall}-{tag}',c,dim,color)
        openings=[]
        for op in room.get('openings',[]):
            if op.get('wall')!=wall or op.get('type') not in ('door','window','arch','archway','open','passage'):continue
            pos=max(0,min(1,float(op.get('pos',.5))))*length
            wd=min(.75*length,float(op.get('width',3))*K)
            openings.append((max(0,pos-wd/2),min(length,pos+wd/2),str(op.get('type'))))
        openings.sort()
        # Surface parts never bridge a portal; preserve at least 8 cm of setback.
        intervals=[];end=0
        for a,b,typ in openings:
            if a>end:intervals.append((end,a))
            end=max(end,b)
            if typ in ('door','arch','archway','open','passage') and h>2.25:
                # Slim reveal jambs, not solid doors. Cap their height to the actual lintel.
                for side,px in (('a',a-.035),('b',b+.035)):
                    if .05<px<length-.05:
                        item(f'door-{side}-{round(px,2)}',px,1.055,.055,2.11,.035,trim)
                        metrics['doorFrames']+=1
                item(f'door-header-{round(a,2)}',(a+b)/2,2.16,b-a+.16,.075,.045,trim)
        if end<length:intervals.append((end,length))
        for j,(a,b) in enumerate(intervals):
            a+=.075;b-=.075;span=b-a
            if span<.34:continue
            center=(a+b)/2
            if h>2.25:
                item(f'crown-{j}',center,h-.20,span,.095,.055,trim)
                item(f'crown-upper-{j}',center,h-.115,span,.045,.075,main)
                metrics['corniceSegments']+=1
            item(f'base-{j}',center,.13,span,.11,.035,main)
            if h>2.55 and span>.82:
                count=min(5,max(1,int(span/1.20)))
                cell=span/count
                for k in range(count):
                    mid=a+(k+.5)*cell
                    width=max(.16,cell-.24)
                    # Frame only, no opaque fill: four thin rails over the authored wall.
                    low=.42;high=min(1.72,h-.65)
                    for sign in (-1,1):
                        item(f'panel-{j}-{k}-v{sign}',mid+sign*width/2,(low+high)/2,.027,high-low,.038,trim)
                    for tag,yy in (('lo',low),('hi',high)):
                        item(f'panel-{j}-{k}-{tag}',mid,yy,width,.035,.038,trim)
                    metrics['panels']+=1
    # Ceiling rosette: an understated concentric series of thin horizontal
    # slabs (not huge fixture blocks). Never used in shafts/stairwells.
    if w>=3 and d>=3 and h>=2.6 and not any(t in roomtype for t in ('crypt','vault','cellar','dungeon')):
        cx=x+w/2;cz=z+d/2
        for j,rad in enumerate((.58,.43,.29)):
            m=__import__('trimesh').creation.icosphere(subdivisions=2,radius=rad)
            m.apply_scale([1,.04,1]);m.apply_translation([cx,h-.095-j*.018,cz]);m.visual.face_colors=trim if j!=1 else main
            scene.add_geometry(m,node_name=f'{rid}-interior-ceiling-medallion-{j}',geom_name=f'{rid}-interior-ceiling-medallion-{j}')
        metrics['medallions']=1
    return metrics
