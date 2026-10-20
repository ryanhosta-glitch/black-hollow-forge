"""Pass 3: decorative historic architecture, source-preserving, collision NOT certified.
Coordinates metres; wall segments are derived from user-authored openings.
"""
import math
K=.3048
WOOD=(97,60,44,255); CARVE=(150,108,71,255); STONE=(130,121,122,255)
BRASS=(184,142,80,255); HEARTH=(52,46,47,255); TILE=(173,157,136,255)
SKIP=('stair','elevator','shaft','porch','yard','exterior','outdoor')

def apply(scene, add, room, floor_index=0):
    name=(str(room.get('name',''))+' '+str(room.get('type',''))).lower()
    metrics={'ceilingBeams':0,'archedInsets':0,'hearths':0,'columns':0,'floorBorders':0}
    if any(word in name for word in SKIP): return metrics
    try:
        x,z,w,d=(float(room[k])*K for k in ('x','y','l','w'))
        h=max(4.,float(room.get('h',10)))*K
    except (ValueError,KeyError,TypeError): return metrics
    if min(w,d)<1.2:return metrics
    rid=str(room.get('id','unknown'))
    style=str(room.get('style','stonewall')).lower()
    trim=STONE if style=='stonewall' else WOOD
    openings=room.get('openings') or []
    def piece(tag,center,ext,color):
        if min(ext)>.006:add(scene,f'{rid}-historic-{tag}',center,ext,color)
    # Thin inlaid floor perimeter bands: below walk surface, no steps/raised blockers.
    if w>2 and d>2:
        inset=.23
        piece('floor-border-n',(x+w/2,.004,z+inset),(w-2*inset,.007,.024),BRASS)
        piece('floor-border-s',(x+w/2,.004,z+d-inset),(w-2*inset,.007,.024),BRASS)
        piece('floor-border-w',(x+inset,.004,z+d/2),(.024,.007,d-2*inset),BRASS)
        piece('floor-border-e',(x+w-inset,.004,z+d/2),(.024,.007,d-2*inset),BRASS)
        metrics['floorBorders']=4
    # Ceiling coffering: purely high overhead, never intrudes into nominal 2.1m clearance.
    if h>=2.75 and w>=3 and d>=3:
        n=min(4,max(2,int(w/2.15)))
        for i in range(1,n):
            xx=x+i*w/n
            piece(f'ceiling-coffer-long-{i}',(xx,h-.12,z+d/2),(.09,.14,d-.40),trim)
            metrics['ceilingBeams']+=1
        m=min(5,max(2,int(d/2.2)))
        for i in range(1,m):
            zz=z+i*d/m
            piece(f'ceiling-coffer-cross-{i}',(x+w/2,h-.12,zz),(w-.40,.14,.085),trim)
            metrics['ceilingBeams']+=1
    # Explicitly decorative archivolt bands ABOVE intact authored arch openings.
    for wall in ('bottom','top','left','right'):
        length=w if wall in ('bottom','top') else d
        for j,op in enumerate(openings):
            if op.get('wall')!=wall or op.get('type') not in ('arch','archway'):continue
            pw=min(length*.75,max(.4,float(op.get('width',3))*K))
            center=max(pw/2,min(length-pw/2,float(op.get('pos',.5))*length))
            if h<2.55:continue
            # Tiny stepped approximation of the arch crown at 2.24m+; does not fill passage below.
            for t in range(7):
                p=(t-3)/3
                yh=2.19+.25*math.sqrt(max(0,1-p*p))
                loc=center+p*pw*.44
                if wall in ('bottom','top'):
                    xc=x+loc;zc=z+(d-.105 if wall=='top' else .105)
                    ext=(pw*.15,.038,.045)
                else:
                    xc=x+(w-.105 if wall=='right' else .105);zc=z+loc
                    ext=(.045,.038,pw*.15)
                piece(f'arch-{wall}-{j}-{t}',(xc,yh,zc),ext,CARVE)
                metrics['archedInsets']+=1
    # Mantel, attached to one uninterrupted perimeter wall. NEVER auto-place if
    # no safe structural wall segment or in small / circulation rooms.
    hearth_eligible=any(k in name for k in ('drawing','parlor','parlour','lounge','library','study','salon','dining','sitting','great hall'))
    if hearth_eligible and min(w,d)>3.2:
        candidates=[]
        for wall in ('bottom','top','left','right'):
            length=w if wall in ('bottom','top') else d
            blocked=[]
            for op in openings:
                if op.get('wall')!=wall or op.get('type') not in ('door','window','arch','archway','passage','open'):continue
                mid=max(0,min(1,float(op.get('pos',.5))))*length
                half=max(.3,float(op.get('width',3))*K/2)+.55
                blocked.append((mid-half,mid+half))
            ranges=[(0,length)]
            for a,b in blocked:
                ranges=[(lo,min(hi,a)) for lo,hi in ranges if lo<min(hi,a)]+[(max(lo,b),hi) for lo,hi in ranges if max(lo,b)<hi]
            for lo,hi in ranges:
                if hi-lo>=2.5:candidates.append((hi-lo,wall,(lo+hi)/2))
        if candidates:
            _,wall,p=max(candidates)
            horizontal=wall in ('bottom','top')
            # Front-facing relief max 0.28m; no deep firebox or protruding hearth into routes.
            side=1 if wall in ('bottom','left') else -1
            plane=(z+.20 if wall=='bottom' else z+d-.20) if horizontal else (x+.20 if wall=='left' else x+w-.20)
            def fireplace(tag,along,yy,span,thickness,depth,color):
                if horizontal: center=(x+along,yy,plane);ext=(span,thickness,depth)
                else:center=(plane,yy,z+along);ext=(depth,thickness,span)
                piece('mantel-'+tag,center,ext,color)
            fireplace('back',p,.73,1.52,1.39,.028,HEARTH)
            fireplace('firebox',p,.50,.85,.79,.039,(37,32,33,255))
            fireplace('lintel',p,1.40,1.72,.15,.18,CARVE)
            fireplace('cornice',p,1.53,1.90,.10,.20,STONE)
            for n,s in enumerate((-1,1)):
                fireplace('pilaster-'+str(n),p+s*.73,.71,.16,1.39,.12,CARVE)
            metrics['hearths']=1
    # Four corner pilasters in sufficiently large grand chambers, kept in corners.
    if ('ballroom' in name or 'grand hall' in name) and min(w,d)>5 and h>=3:
        for a in (.31,w-.31):
            for b in (.31,d-.31):
                piece(f'corner-pilaster-{a:.1f}-{b:.1f}',(x+a,h/2,z+b),(.16,h-.26,.16),STONE)
                metrics['columns']+=1
    return metrics
