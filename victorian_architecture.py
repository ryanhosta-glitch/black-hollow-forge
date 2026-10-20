"""Blueprint-faithful Victorian façade and roof compilation.
Exterior segments come from the shapely union of real room footprints.
Mansard surface follows concave outlines, instead of one bounding rectangle.
All dimensions in meters; GLB meshes are static decoration.
"""
import math
import hashlib
import numpy as np
import trimesh
from shapely.geometry import box as shpbox, Point, Polygon, MultiPoint
from shapely.ops import unary_union, triangulate
from shapely.prepared import prep
K=.3048
GOLD=(196,156,91,255);BRASS=(160,126,77,255);STONE=(153,142,139,255)
DARK=(55,55,64,255);BRICK=(112,69,70,255);GLASS=(78,120,150,190)
SLATE=(69,80,96,255);RIDGE=(155,131,95,255)

def spaces(floor):
    return [r for r in floor.get('rooms',[]) if r.get('type') not in ('porch','yard','exterior') and all(float(r.get(q,0))>0 for q in ('l','w','h'))]

def footprint(rooms):
    return unary_union([shpbox(float(r['x'])*K,float(r['y'])*K,(float(r['x'])+float(r['l']))*K,(float(r['y'])+float(r['w']))*K) for r in rooms])

def polygons(geom):
    if geom.is_empty:return []
    if isinstance(geom,Polygon):return [geom]
    return [g for g in getattr(geom,'geoms',[]) if isinstance(g,Polygon)]

def roof_height(source):
    # Geometry is roof-local; viewer positions the roof at the top storey.
    floors=source.get('floors',[])
    top=next((f for f in reversed(floors) if spaces(f)),None)
    return max(float(r.get('h',10)) for r in spaces(top))*K if top else 0

def add_quad(sc,name,v,color):
    vertices=np.array(v,dtype=float)
    faces=np.array([[0,1,2],[0,2,3],[2,1,0],[3,2,0]])
    mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
    mesh.visual.face_colors=np.tile(np.array(color,dtype=np.uint8),(4,1))
    sc.add_geometry(mesh,node_name=name,geom_name=name)

def exterior_openings(floor, geom):
    # Original openings remain authored; ONLY those coincident with the union exterior are used.
    output=[]
    for r in spaces(floor):
        x,z=float(r['x'])*K,float(r['y'])*K
        w,d=float(r['l'])*K,float(r['w'])*K
        for op in r.get('openings',[]):
            wall=op.get('wall'); typ=op.get('type')
            if wall not in ('top','bottom','left','right') or typ not in ('door','window','arch','archway','open','passage'):continue
            p=max(0,min(1,float(op.get('pos',.5))))
            pos=(x+p*w,z+d if wall=='top' else z) if wall in ('top','bottom') else (x+w if wall=='right' else x,z+p*d)
            if geom.boundary.distance(Point(*pos))<.035:
                output.append((pos, min(float(op.get('width',3))*K, min(w,d)*.8),typ))
    return output

def forge_window_plan(floor):
    """Stable, explicitly decorative exterior windows, never changes author openings."""
    rooms=spaces(floor); outline=footprint(rooms); candidates=[]
    excluded=('crypt','secret','hidden','vault','closet','bath','toilet','cellar','storage','shaft','stair','hall','corridor','elevator','attic','laboratory')
    for r in rooms:
        name=(str(r.get('name',''))+' '+str(r.get('type',''))+' '+str(r.get('roomType',''))).lower()
        if any(word in name for word in excluded):continue
        if r.get('noWindows') or r.get('windowless') or r.get('sealed') or r.get('keepWindowless'):continue
        if any(op.get('type')=='window' for op in r.get('openings',[])):continue
        x,z=float(r['x'])*K,float(r['y'])*K; w,d=float(r['l'])*K,float(r['w'])*K
        edges=[]
        for wall,length,center in [('bottom',w,(x+w/2,z)),('top',w,(x+w/2,z+d)),('left',d,(x,z+d/2)),('right',d,(x+w,z+d/2))]:
            if length<2.35 or outline.boundary.distance(Point(*center))>.04:continue
            # Exterior corner/door avoidance. Do not add glazing over authored openings.
            authored=[op for op in r.get('openings',[]) if op.get('wall')==wall and op.get('type') in ('door','window','arch','archway','open','passage')]
            free=[]
            for portion in (.28,.5,.72):
                if all(abs(portion-float(op.get('pos',.5)))*length>(float(op.get('width',3))*K/2+.67) for op in authored):free.append(portion)
            if free:edges.append((wall,length,free))
        if edges:candidates.append((r,edges))
    # ~50% of eligible windowless rooms, reproducible across rebuilds.
    ordered=sorted(candidates,key=lambda re:hashlib.sha256(str(re[0].get('id','')).encode()).hexdigest())
    chosen=ordered[:round(len(ordered)*.5)]
    results=[]
    for room,edges in chosen:
        edges=sorted(edges,key=lambda e:-e[1]); wall,length,free=edges[0]
        area=float(room['l'])*float(room['w']); count=2 if area>=220 and length>=3.8 and len(free)>=2 else 1
        spots=([free[0],free[-1]] if count==2 else [min(free,key=lambda p:abs(p-.5))])
        x,z=float(room['x'])*K,float(room['y'])*K;w,d=float(room['l'])*K,float(room['w'])*K
        for spot in spots:
            position=(x+spot*w,z+d if wall=='top' else z) if wall in ('top','bottom') else (x+w if wall=='right' else x,z+spot*d)
            results.append({'roomId':room.get('id'),'wall':wall,'pos':round(spot,3),'positionMeters':position,'widthMeters':.78,'kind':'forge-decorative-window','sourceBlueprintModified':False,'note':'Visual facade glazing only. Wall cutout and playable visibility not yet constructed.'})
    return {'eligibleWindowlessRooms':len(candidates),'enhancedRooms':len(chosen),'windows':results}

def build_exterior_facade(sc,add,floor):
    rooms=spaces(floor)
    if not rooms:return {'edges':0,'windows':0}
    outline=footprint(rooms)
    openings=exterior_openings(floor,outline)
    enhancements=forge_window_plan(floor)
    for item in enhancements["windows"]:openings.append((item["positionMeters"],item["widthMeters"],"forge-window"))
    h=max(float(r.get('h',10)) for r in rooms)*K
    segment_no=0;windows=0
    for poly in polygons(outline):
        coords=list(poly.exterior.coords)
        for (x0,z0),(x1,z1) in zip(coords,coords[1:]):
            dx=x1-x0;dz=z1-z0;length=math.hypot(dx,dz)
            if length<.25:continue
            tx,tz=dx/length,dz/length;nx,nz=-tz,tx
            xc,zc=(x0+x1)/2,(z0+z1)/2
            horizontal=abs(dx)>=abs(dz)
            def beam(label,along,yy,width,height,depth,col):
                bx=xc+tx*along+nx*depth; bz=zc+tz*along+nz*depth
                dimensions=(width,height,.09) if horizontal else (.09,height,width)
                add(sc,f'facade-{segment_no}-{label}',(bx,yy,bz),dimensions,col)
            # paired cornices, sill-band and dimensional quoins on exterior only
            for tag,yy,ht,dep,col in [('foundation',.14,.27,.055,STONE),('stringcourse',min(h*.55,1.72),.13,.075,GOLD),('frieze',h-.30,.19,.095,STONE),('cornice',h-.07,.22,.16,GOLD)]:
                beam(tag,0,yy,length,ht,dep,col)
            for end in [-1,1]:
                beam(f'corner-quoin-{end}',end*(length/2-.09),h*.50,.16,h*.88,.045,STONE)
            # Windows/doors: facade only, never invent exterior openings that conflict with blueprint.
            for j,(xy,ow,typ) in enumerate(openings):
                along=(xy[0]-xc)*tx+(xy[1]-zc)*tz
                perp=abs((xy[0]-xc)*nx+(xy[1]-zc)*nz)
                if perp>.045 or abs(along)>length/2+.04:continue
                windows+=typ in ('window','forge-window')
                top=min(h-.35,2.35 if typ in ('window','forge-window') else 2.45)
                bottom=.76 if typ in ('window','forge-window') else .05
                for side in [-1,1]:
                    beam(f'ornate-opening-{j}-jamb-{side}',along+side*(ow/2+.10),(bottom+top)/2,.17,top-bottom,.12,GOLD)
                beam(f'ornate-opening-{j}-pediment',along,top+.12,ow+.42,.16,.14,STONE)
                if typ in ('window','forge-window'):
                    beam(f'ornate-opening-{j}-glass',along,(top+bottom)/2,ow,top-bottom,.115,GLASS)
                    beam(f'ornate-opening-{j}-mullion',along,(top+bottom)/2,.055,top-bottom,.17,BRASS)
                    beam(f'ornate-opening-{j}-sill',along,bottom-.09,ow+.35,.15,.16,STONE)
            # Architectural Gothic Revival enrichments: exterior-only, individually
            # named, source-faithful static meshes; no new room or passage created.
            # Brackets and lancet forms are backed by the compiled exterior openings.
            for j,(xy,ow,typ) in enumerate(openings):
                along=(xy[0]-xc)*tx+(xy[1]-zc)*tz
                perp=abs((xy[0]-xc)*nx+(xy[1]-zc)*nz)
                if perp>.045 or abs(along)>length/2-.02:continue
                iswin=typ in ('window','forge-window')
                top=min(h-.35,2.35 if iswin else 2.45)
                bottom=.76 if iswin else .05
                # Sculptural segmented lancet head, with real triangular cheeks.
                # Mounted forward of the original rectangular opening; no wall edits.
                crest_y=min(h-.12,top+.33)
                half=ow/2+.115
                if crest_y>top+.08:
                    for sign in (-1,1):
                        xstart=along+sign*half
                        xend=along
                        pieces=max(3,min(8,int(ow*5)))
                        for k in range(pieces):
                            f0=k/pieces;f1=(k+1)/pieces
                            a0=xstart+(xend-xstart)*f0
                            a1=xstart+(xend-xstart)*f1
                            y0=top+(crest_y-top)*f0
                            y1=top+(crest_y-top)*f1
                            av=(a0+a1)/2;ay=(y0+y1)/2
                            seg=math.hypot(a1-a0,y1-y0)
                            # custom angled rectangular stone tracery, aligned along wall
                            if horizontal:
                                mesh=trimesh.creation.box(extents=(seg+.015,.060,.095))
                                angle=math.atan2(y1-y0,a1-a0)
                                mesh.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,0,1]))
                                mesh.apply_translation((xc+tx*av+nx*.21,ay,zc+tz*av+nz*.21))
                            else:
                                mesh=trimesh.creation.box(extents=(.095,.060,seg+.015))
                                angle=math.atan2(y1-y0,a1-a0)
                                mesh.apply_transform(trimesh.transformations.rotation_matrix(-angle,[1,0,0]))
                                mesh.apply_translation((xc+tx*av+nx*.21,ay,zc+tz*av+nz*.21))
                            mesh.visual.face_colors=np.asarray(STONE,dtype=np.uint8)
                            sc.add_geometry(mesh,node_name=f'facade-{segment_no}-gothic-lancet-{j}-{sign}-{k}')
                # Miniature trefoil tracery bars and iron saddle tie in the window.
                if iswin and top-bottom>.8:
                    beam(f'gothic-window-{j}-tracery-high',along,top-.29,ow*.91,.055,.205,BRASS)
                    for side in (-.24,.24):
                        beam(f'gothic-window-{j}-tracery-light-{side}',along+side*ow,(top+bottom)/2,.038,top-bottom-.32,.21,BRASS)
                    for side in (-1,1):
                        beam(f'gothic-window-{j}-stone-cap-{side}',along+side*(ow/2+.11),top-.05,.12,.20,.205,STONE)
                else:
                    beam(f'gothic-door-{j}-keystone',along,crest_y-.02,.18,.21,.215,STONE)
            # Projecting stone piers only where clear of authored and forged openings.
            # These add real depth to long uninterrupted wall spans.
            if length>=2.5:
                for i in range(1,min(14,math.floor(length/1.65))):
                    along=-length/2+i*length/max(1,math.floor(length/1.65))
                    if any(abs(along-((xy[0]-xc)*tx+(xy[1]-zc)*tz))<ow/2+.42 and abs((xy[0]-xc)*nx+(xy[1]-zc)*nz)<.045 for xy,ow,_ in openings):continue
                    beam(f'gothic-pier-{i}',along,min(h*.5,1.55),.20,min(h*.83,2.8),.24,STONE)
                    beam(f'gothic-pier-cap-{i}',along,min(h-.22,2.95),.36,.20,.28,GOLD)
                    beam(f'gothic-pier-plinth-{i}',along,.19,.40,.38,.31,STONE)
            # Layered carved frieze blocks beneath cornice; dense but capped.
            if length>1.5:
                count=min(22,max(2,int(length/.42)))
                for i in range(count):
                    along=-length/2+(i+.5)*length/count
                    beam(f'gothic-dentil-{i}',along,h-.38,.15,.18,.15,STONE)
            # avoid count explosion: a small number of repeating masonry accent courses
            if length>2:
                n=min(30,math.floor(length/.8))
                for j in range(1,n):
                    beam(f'brick-pier-{j}',-length/2+j*length/n,.60,.035,.66,.055,BRICK)
            segment_no+=1
    return {'edges':segment_no,'authoredExteriorOpenings':len(openings),'windows':windows,'enhancedWindowlessRooms':enhancements['enhancedRooms'],'eligibleWindowlessRooms':enhancements['eligibleWindowlessRooms'],'windowsAddedAsFacadeOnly':len(enhancements['windows']),'polygons':len(polygons(outline))}

def build_roof(sc, add, source):
    floors=source.get('floors',[]);top=next((f for f in reversed(floors) if spaces(f)),None)
    if not top:return {'style':'none','limits':'no upper rooms'}
    geometry=footprint(spaces(top))
    if geometry.is_empty:return {'style':'none','limits':'empty footprint'}
    roof=source.get('roof') or {}; kind=str(roof.get('type','hip') or 'hip').lower()
    rise=max(.6,float(roof.get('rise',5))*K); y=roof_height(source)+.10
    # Roof reconstruction: build constrained contour support sites, not an
    # arbitrary rectangular interior height grid. The inset contours produce
    # consistent pitches, clear mansard breaklines and a broad upper roof plane.
    exterior=geometry.boundary
    inset=max(.6,min(2.2,math.sqrt(geometry.area)*.12))
    contours=[0.0]
    if kind=='mansard':contours += [inset*.50,inset,inset*1.45]
    elif kind=='flat':contours += [.18]
    else:contours += [inset*.55,inset*1.1,inset*2.2]
    sites=[]
    for offset in contours:
        strip=geometry if offset==0 else geometry.buffer(-offset,join_style=2)
        for poly in polygons(strip):
            for ring in [poly.exterior,*poly.interiors]:
                n=max(12,min(480,math.ceil(ring.length/.30)))
                sites.extend([ring.interpolate(ring.length*i/n).coords[0] for i in range(n)])
            if offset>0 and poly.area>.01:
                pt=poly.representative_point();sites.append((pt.x,pt.y))
    if len(sites)<3:raise ValueError('Roof support contours generated no points')
    tessellation=triangulate(MultiPoint(sites))
    vertices=[];faces=[]
    def roof_y(x,z):
        if kind=='flat':return y+.18
        dist=Point(x,z).distance(exterior)
        if kind=='mansard':return y+rise*min(1,dist/inset)
        return y+rise*min(1,dist/max(inset*2,math.sqrt(geometry.area)*.22))
    for tri in tessellation:
        cut=tri.intersection(geometry)
        for poly in polygons(cut):
            if poly.area<.0001:continue
            # Recursively triangulate any polygon with more than three vertices
            # to avoid concave fan cuts along irregular student roof footprints.
            for cell in triangulate(poly):
                if cell.area<.00001 or not poly.covers(cell.representative_point()):continue
                ring=list(cell.exterior.coords)[:-1]
                if len(ring)!=3:continue
                xyz=[(x,roof_y(x,z),z) for x,z in ring]
                idx=len(vertices);vertices.extend(xyz);faces.extend([(idx,idx+1,idx+2),(idx+2,idx+1,idx)])
    if not faces:raise ValueError('Roof triangulation generated no faces')
    mesh=trimesh.Trimesh(vertices=np.asarray(vertices),faces=np.asarray(faces),process=False)
    mesh.visual.face_colors=np.tile(np.array(SLATE,dtype=np.uint8),(len(faces),1))
    sc.add_geometry(mesh,node_name=f'outline-faithful-{kind}-roof')
    segments=0
    for poly in polygons(geometry):
        coords=list(poly.exterior.coords)
        for (x0,z0),(x1,z1) in zip(coords,coords[1:]):
            dx=x1-x0; dz=z1-z0;length=math.hypot(dx,dz)
            if length<.25:continue
            midx,midz=(x0+x1)/2,(z0+z1)/2
            add(sc,f'polygon-eave-{segments}',(midx,y-.08,midz),(length,.17,.20) if abs(dx)>abs(dz) else (.20,.17,length),GOLD)
            segments+=1
    # Finials only on a modest number of prominent outer corners.
    for i,(x,z) in enumerate([list(poly.exterior.coords)[0] for poly in polygons(geometry)][:8]):
        add(sc,f'roof-finial-{i}',(x,y+.35,z),(.13,.7,.13),BRASS)
    # Gothic Revival is the Forge ornamentation layer. Never alter the authored
    # roof style or rise: an authored mansard remains a mansard, etc.
    # Iron cresting, lancet dormer silhouettes and carved corner finials are
    # separate decorative meshes positioned inside the actual roof footprint.
    gothic_counts={'ironCrestSections':0,'lancetDormers':0,'carvedFinials':0,'slateBands':0}
    def gothic_cone(name,point,height,radius,color):
        m=trimesh.creation.cone(radius=radius,height=height,sections=9)
        # trimesh cone is based at y? native cone is along Z; turn into Y
        m.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2,[1,0,0]))
        m.apply_translation(point)
        m.visual.face_colors=np.asarray(color,dtype=np.uint8)
        sc.add_geometry(m,node_name=name,geom_name=name)
    for poly_index,poly in enumerate(polygons(geometry)):
        ring=list(poly.exterior.coords)[:-1]
        for j,(x0,z0) in enumerate(ring):
            x1,z1=ring[(j+1)%len(ring)]
            dx,dz=x1-x0,z1-z0
            length=math.hypot(dx,dz)
            if length<1.35:continue
            ux,uz=dx/length,dz/length
            # roofline detailing; pierces no structural openings
            count=max(1,min(15,int(length/1.35)))
            for q in range(count):
                t=(q+.5)/count
                xx=x0+dx*t;zz=z0+dz*t
                if q%2==0:
                    gothic_cone(f'gothic-iron-crest-{poly_index}-{j}-{q}',(xx,y+.08,zz),.34,.095,DARK)
                    gothic_counts['ironCrestSections']+=1
            # Gothic triangular dormer silhouette is only decorative and set
            # just inside the roof; NOT a daylight opening or additional room.
            if length>=4.3:
                mx,mz=(x0+x1)/2,(z0+z1)/2
                # choose inward perpendicular based on containment
                nx,nz=-uz,ux
                if not geometry.covers(Point(mx+nx*.8,mz+nz*.8)):nx,nz=-nx,-nz
                cx,cz=mx+nx*.84,mz+nz*.84
                base=roof_y(cx,cz)
                width=min(1.05,length*.24)
                # two narrow gable panels form a pointed Gothic arch silhouette
                for sign in (-1,1):
                    a=(cx+ux*sign*width*.45,base,cz+uz*sign*width*.45)
                    apex=(cx,base+1.18,cz)
                    center=(cx,base+.09,cz)
                    m=trimesh.Trimesh(vertices=np.asarray([a,apex,center]),faces=np.asarray([[0,1,2],[2,1,0]]),process=False)
                    m.visual.face_colors=np.asarray((49,51,62,255),dtype=np.uint8)
                    sc.add_geometry(m,node_name=f'gothic-lancet-dormer-{poly_index}-{j}-{sign}')
                # Shallow *solid* dormer housing (not merely a pair of triangles):
                # vertical face, side cheeks, pitched gable and glazing aligned to
                # the true exterior wall. This remains decorative, not a usable
                # roof opening or additional student-designed space.
                def dormer_box(tag,along,up,depth,wid,ht,thick,col):
                    m=trimesh.creation.box(extents=(wid,ht,thick))
                    # local horizontal axis follows the exterior edge; local
                    # depth axis points into the roof.
                    theta=math.atan2(uz,ux)
                    m.apply_transform(trimesh.transformations.rotation_matrix(-theta,[0,1,0]))
                    m.apply_translation((cx+ux*along+nx*depth,up,cz+uz*along+nz*depth))
                    m.visual.face_colors=np.asarray(col,dtype=np.uint8)
                    sc.add_geometry(m,node_name=f'dormer-{poly_index}-{j}-{tag}',geom_name=f'dormer-{tag}')
                dormer_box('front-wall',0,base+.50,-.14,width*.84,.90,.11,STONE)
                dormer_box('dark-window',0,base+.51,-.235,width*.51,.56,.035,GLASS)
                dormer_box('vertical-mullion',0,base+.51,-.26,.042,.60,.055,BRASS)
                dormer_box('horizontal-transom',0,base+.55,-.26,width*.54,.043,.055,BRASS)
                for side in (-1,1):
                    dormer_box(f'side-jamb-{side}',side*width*.43,base+.53,-.26,.085,.96,.08,STONE)
                dormer_box('sill',0,base+.14,-.25,width+.25,.10,.22,STONE)
                dormer_box('ridge-cap',0,base+1.18,.10,.11,.13,.53,DARK)
                gothic_counts['lancetDormers']+=1
        # More expressive sculpted-but-stylized corner spires.
        for vertex,(xx,zz) in enumerate(ring[:min(28,len(ring))]):
            if vertex%2:continue
            gothic_cone(f'gothic-corner-spire-{poly_index}-{vertex}',(xx,y+.06,zz),.75,.16,STONE)
            gothic_counts['carvedFinials']+=1
    return {'style':kind,'riseFeet':round(rise/K,2),'method':'contour-supported-roof-planes-v2','footprintAreaSqMeters':round(geometry.area,2),'perimeterMeters':round(geometry.length,2),'facadeEdges':segments,'triangles':len(faces),'ornamentation':'Gothic Revival: iron cresting, lancet dormer silhouettes and stone finials', 'gothicDetails':gothic_counts,'limits':'Contour roof and dimensional decorative dormers; dormers are not structural openings, watertight roof seams and precise valleys still require validation.'}
