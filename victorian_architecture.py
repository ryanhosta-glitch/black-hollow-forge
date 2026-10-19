"""Blueprint-faithful Victorian façade and roof compilation.
Exterior segments come from the shapely union of real room footprints.
Mansard surface follows concave outlines, instead of one bounding rectangle.
All dimensions in meters; GLB meshes are static decoration.
"""
import math
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

def build_exterior_facade(sc,add,floor):
    rooms=spaces(floor)
    if not rooms:return {'edges':0,'windows':0}
    outline=footprint(rooms)
    openings=exterior_openings(floor,outline)
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
                windows+=typ=='window'
                top=min(h-.35,2.35 if typ=='window' else 2.45)
                bottom=.76 if typ=='window' else .05
                for side in [-1,1]:
                    beam(f'ornate-opening-{j}-jamb-{side}',along+side*(ow/2+.10),(bottom+top)/2,.17,top-bottom,.12,GOLD)
                beam(f'ornate-opening-{j}-pediment',along,top+.12,ow+.42,.16,.14,STONE)
                if typ=='window':beam(f'ornate-opening-{j}-sill',along,bottom-.09,ow+.35,.15,.16,STONE)
            # avoid count explosion: a small number of repeating masonry accent courses
            if length>2:
                n=min(30,math.floor(length/.8))
                for j in range(1,n):
                    beam(f'brick-pier-{j}',-length/2+j*length/n,.60,.035,.66,.055,BRICK)
            segment_no+=1
    return {'edges':segment_no,'authoredExteriorOpenings':len(openings),'windows':windows,'polygons':len(polygons(outline))}

def build_roof(sc, add, source):
    floors=source.get('floors',[]);top=next((f for f in reversed(floors) if spaces(f)),None)
    if not top:return {'style':'none','limits':'no upper rooms'}
    geometry=footprint(spaces(top))
    if geometry.is_empty:return {'style':'none','limits':'empty footprint'}
    roof=source.get('roof') or {}; kind=str(roof.get('type','hip') or 'hip').lower()
    rise=max(.6,float(roof.get('rise',5))*K); y=roof_height(source)+.10
    # Rounded set of mesh support sites: exact polygon perimeter vertices, periodic boundary
    # points and some interior grid points. Each tile is clipped to the real footprint.
    exterior=geometry.boundary
    inset=max(.6,min(2.2,math.sqrt(geometry.area)*.12))
    sites=[]
    for poly in polygons(geometry):
        for ring in [poly.exterior,*poly.interiors]:
            n=max(24,min(450,math.ceil(ring.length/.48)))
            sites.extend([ring.interpolate(ring.length*i/n).coords[0] for i in range(n)])
    minx,minz,maxx,maxz=geometry.bounds
    sample_step=max(.65,min(1.5,math.sqrt(geometry.area)/13))
    for xx in np.arange(minx+sample_step/2,maxx,sample_step):
        for zz in np.arange(minz+sample_step/2,maxz,sample_step):
            p=Point(float(xx),float(zz))
            if geometry.covers(p):sites.append((float(xx),float(zz)))
    tessellation=triangulate(MultiPoint(sites))
    vertices=[];faces=[]
    def roof_y(x,z):
        if kind=='flat':return y+.18
        dist=Point(x,z).distance(exterior)
        if kind=='mansard':
            # strong steep lower slope then upper plateau
            return y+rise*min(1,dist/inset)
        return y+rise*min(1,dist/max(inset*2,math.sqrt(geometry.area)*.22))
    for tri in tessellation:
        cut=tri.intersection(geometry)
        for poly in polygons(cut):
            if poly.area<.0001:continue
            # cut polygons are mostly triangles; fan triangulation exact for convex cuts.
            ring=list(poly.exterior.coords)[:-1]
            if len(ring)<3:continue
            for j in range(1,len(ring)-1):
                xyz=[(x,roof_y(x,z),z) for x,z in (ring[0],ring[j],ring[j+1])]
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
    return {'style':kind,'riseFeet':round(rise/K,2),'method':'actual-room-union-perimeter-heightfield','footprintAreaSqMeters':round(geometry.area,2),'perimeterMeters':round(geometry.length,2),'facadeEdges':segments,'triangles':len(faces),'limits':'Roof follows nonrectangular footprint but dormers, vertical roof valleys and watertight joints require further modeling.'}
