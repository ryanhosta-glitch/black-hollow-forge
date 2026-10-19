"""Grand Hall detail layer: ten independently named architectural enhancements.
Static meshes remain separate from runtime collision and story controls.
"""
import math
import numpy as np
import trimesh

def build(sc):
 C={'brass':(189,143,72,255),'oldgold':(131,93,49,255),'cream':(198,185,166,255),'stone':(162,157,153,255),'mahogany':(72,43,42,255),'ink':(31,33,40,255),'velvet':(117,26,45,255),'crystal':(176,202,215,255),'patina':(85,107,103,255),'ivory':(219,202,178,255)}
 counts={}
 def put(name,mesh,col,passno):
  mesh.visual.face_colors=np.array(C.get(col,col),dtype=np.uint8);sc.add_geometry(mesh,node_name=name,geom_name=name);counts[passno]=counts.get(passno,0)+1
 def box(name,at,dim,col,p):
  if min(dim)<.001:return
  m=trimesh.creation.box(extents=dim);m.apply_translation(at);put(name,m,col,p)
 def ell(name,at,rad,col,p,sub=2):
  m=trimesh.creation.icosphere(subdivisions=sub);m.apply_scale(rad);m.apply_translation(at);put(name,m,col,p)
 def beam(name,a,b,r,col,p,sides=9):
  a=np.array(a,float);b=np.array(b,float);d=b-a;L=np.linalg.norm(d)
  if L<.001:return
  m=trimesh.creation.cylinder(radius=r,height=L,sections=sides)
  m.apply_transform(trimesh.geometry.align_vectors([0,0,1],d/L));m.apply_translation((a+b)/2);put(name,m,col,p)
 def tube_ring(name,xyz,rx,rz,r,col,p,n=32):
  for i in range(n):
   a=2*math.pi*i/n;b=2*math.pi*(i+1)/n
   beam(f'{name}-{i}',(xyz[0]+rx*math.cos(a),xyz[1],xyz[2]+rz*math.sin(a)),(xyz[0]+rx*math.cos(b),xyz[1],xyz[2]+rz*math.sin(b)),r,col,p)
 # 01 Marble flooring, border and inset medallion - leave crimson runner intact.
 for side in (-1,1):
  for z in range(-16,18,2):box(f'P01-marble-floor-diamond-{side}-{z}',(side*10,.018,z),(.85,.013,.85),'cream',1)
  box(f'P01-bronze-floor-border-{side}',(side*12,.023,0),(.075,.02,35),'brass',1)
 for rad in (1.8,2.3,2.7):tube_ring('P01-entry-marble-inlay-'+str(rad),(0,.04,-14),rad,rad,.025,'oldgold',1,24)
 # 02 Wall panels, lower wainscoting, crown cornices, pilasters.
 for side in (-1,1):
  for z in range(-15,16,4):
   box(f'P02-mahogany-wainscot-{side}-{z}',(side*13.73,1.52,z),(.085,3.04,3.7),'mahogany',2)
   for yy in (.3,2.8):box(f'P02-panel-rail-{side}-{z}-{yy}',(side*13.64,yy,z),(.09,.10,3.45),'brass',2)
   for dz in (-1.67,1.67):box(f'P02-panel-stile-{side}-{z}-{dz}',(side*13.64,1.55,z+dz),(.09,2.6,.09),'oldgold',2)
  for yy in (3.25,8.75,16.75):box(f'P02-cornice-{side}-{yy}',(side*13.48,yy,0),(.42,.22,36),'oldgold',2)
 # 03 Grand stairs, marble side stringers and a pair of continuous timber rails.
 for side in (-1,1):
  a=(side*5.38,1.23,-.5);b=(side*5.38,10.02,16.5)
  beam(f'P03-sweeping-handrail-{side}',a,b,.12,'mahogany',3,12)
  beam(f'P03-handrail-brass-inlay-{side}',(side*5.38,1.38,-.5),(side*5.38,10.17,16.5),.037,'brass',3)
  for n in range(0,28,2):
   z=n*17/28-.5;y=(n+1)*8.7/28
   beam(f'P03-baluster-{side}-{n}',(side*5.38,y,z),(side*5.38,y+1.18,z),.066,'brass',3)
   ell(f'P03-baluster-orb-{side}-{n}',(side*5.38,y+1.19,z),(.105,.105,.105),'ivory',3,1)
 # 04 Gallery balustrade, decorative rosettes.
 for side in (-1,1):
  for z in [12+i*.8 for i in range(8)]:
   beam(f'P04-gallery-spindle-{side}-{z:.1f}',(side*8.15,8.9,z),(side*8.15,10.9,z),.055,'oldgold',4)
   ell(f'P04-gallery-spindle-orb-{side}-{z:.1f}',(side*8.15,10.85,z),(.11,.11,.11),'brass',4,1)
  beam(f'P04-gallery-rail-{side}',(side*8.15,11.05,11.9),(side*8.15,11.05,19),.12,'mahogany',4)
 # 05 Monumental elevator crown, threshold, operating lever and jamb carvings.
 box('P05-elevator-threshold',(0,8.93,18.92),(4.3,.16,1.5),'cream',5)
 for side in (-1,1):
  box(f'P05-elevator-fluted-pilaster-{side}',(side*2.49,11.62,18.71),(.23,5.8,.4),'brass',5)
  for y in [9.5+i*.48 for i in range(11)]:ell(f'P05-elevator-rivet-{side}-{y:.2f}',(side*2.45,y,18.43),(.095,.095,.06),'oldgold',5,1)
  beam(f'P05-elevator-hinged-handle-{side}',(side*1.2,11.1,18.64),(side*1.2,11.8,18.64),.065,'ivory',5)
 box('P05-elevator-overdoor-frieze',(0,15,18.55),(5.4,.38,.4),'oldgold',5)
 ell('P05-elevator-crested-cartouche',(0,15.35,18.42),(.52,.37,.16),'ivory',5)
 # 06 Sculpted lion guardians. Body, hindquarters, maned head, muzzle, ears, legs, tail and paws.
 for side in (-1,1):
  sx=side*7.1
  # existing proxy body remains, these additive anatomical features create readable silhouettes
  ell(f'P06-lion-haunch-{side}',(sx,1.23,-1.7),(.68,.72,.6),'stone',6)
  ell(f'P06-lion-chest-{side}',(sx,1.6,-.53),(.72,.94,.58),'cream',6)
  ell(f'P06-lion-snout-{side}',(sx,2.23,.37),(.37,.25,.32),'cream',6)
  ell(f'P06-lion-nose-{side}',(sx,2.23,.67),(.17,.1,.12),'ink',6)
  for ear in (-1,1):
   ell(f'P06-lion-ear-{side}-{ear}',(sx+ear*.5,2.78,-.33),(.22,.25,.17),'stone',6)
   ell(f'P06-lion-eye-{side}-{ear}',(sx+ear*.22,2.44,.38),(.075,.064,.047),'ink',6)
   ell(f'P06-lion-whiskerpad-{side}-{ear}',(sx+ear*.2,2.12,.51),(.2,.12,.12),'ivory',6,1)
  for leg in (-1,1):
   beam(f'P06-lion-foreleg-{side}-{leg}',(sx+leg*.45,1.7,-.25),(sx+leg*.45,.59,.08),.25,'cream',6)
   ell(f'P06-lion-frontpaw-{side}-{leg}',(sx+leg*.45,.62,.25),(.35,.15,.36),'stone',6)
  # globe under one paw, with bronze meridians
  globe=(sx-side*1.1,1.03,0)
  tube_ring(f'P06-globe-equator-{side}',globe,.7,.7,.024,'brass',6,20)
  for i in range(6):
   a=2*math.pi*i/6
   beam(f'P06-globe-stand-{side}-{i}',(globe[0]+.45*math.cos(a),.46,globe[2]+.45*math.sin(a)),(globe[0]+.26*math.cos(a),.62,globe[2]+.26*math.sin(a)),.025,'oldgold',6)
  beam(f'P06-lion-tail-{side}',(sx,1.3,-1.85),(sx+side*.75,2,-2.0),.13,'stone',6)
  ell(f'P06-lion-tail-tuft-{side}',(sx+side*.75,2,-2),(.19,.27,.19),'oldgold',6)
 # 07 Raven crown, tapered beak, tail feathers, talons, more distinct wings.
 beam('P07-raven-beak',(0,15.30,18.34),(0,15.25,17.90),.12,'ink',7,5)
 for wing in (-1,1):
  for i in range(5):
   beam(f'P07-raven-primary-{wing}-{i}',(wing*.28,14.95,18.55),(wing*(.8+i*.13),14.55-i*.05,18.42+i*.035),.075,'ink',7,5)
  beam(f'P07-raven-talon-{wing}',(wing*.2,14.59,18.48),(wing*.25,14.38,18.56),.045,'oldgold',7)
 for i in (-1,0,1):beam(f'P07-raven-tail-{i}',(i*.12,14.95,18.83),(i*.18,14.65,19.22),.065,'ink',7,5)
 # 08 Elaborate chandeliers: concentric metal rings, chains, candles, crystal drops.
 for j,z in enumerate((-8,7)):
  for rad in (1.3,2.5):tube_ring(f'P08-chandelier-ring-{j}-{rad}',(0,13.18,z),rad,rad,.055,'brass',8,20)
  for i in range(16):
   a=2*math.pi*i/16;x=2.48*math.cos(a);zz=z+2.48*math.sin(a)
   beam(f'P08-chandelier-suspension-{j}-{i}',(0,15.5,z),(x,13.18,zz),.025,'brass',8)
   ell(f'P08-chandelier-prism-{j}-{i}',(x,12.78,zz),(.09,.38,.09),'crystal',8,1)
   ell(f'P08-candle-flame-{j}-{i}',(x,13.55,zz),(.065,.17,.065),'ivory',8,1)
 # 09 Portrait frames and alcoves on walls, without loading external images.
 for side in (-1,1):
  for i,z in enumerate((-11,-3,5,13)):
   x=side*13.48
   box(f'P09-portrait-back-{side}-{i}',(x,10.0,z),(.1,3.5,2.5),'mahogany',9)
   for dz in (-1.3,1.3):box(f'P09-portrait-stile-{side}-{i}-{dz}',(x-side*.11,10,z+dz),(.22,3.8,.19),'brass',9)
   for yy in (8.1,11.9):box(f'P09-portrait-rail-{side}-{i}-{yy}',(x-side*.11,yy,z),(.22,.18,2.8),'brass',9)
   ell(f'P09-portrait-cartouche-{side}-{i}',(x-side*.15,12.10,z),(.13,.22,.32),'ivory',9,1)
 # 10 Interactive anchors and decorative map/plinth marker geometry.
 box('P10-estate-atlas-wooden-surround',(6.2,11.78,18.39),(3.35,2.55,.25),'mahogany',10)
 for a in range(5):box(f'P10-atlas-floor-line-{a}',(6.2,11.1+a*.32,18.20),(2.15,.02,.035),'oldgold',10)
 ell('P10-atlas-compass', (7.1,12.42,18.17),(.18,.18,.03),'brass',10,1)
 for side in (-1,1):box(f'P10-lion-nameplate-{side}',(side*7.1,.31,-2.73),(1.7,.21,.07),'brass',10)
 return {'passes':[{ 'pass':i,'addedMeshes':counts.get(i,0)} for i in range(1,11)],'addedMeshes':sum(counts.values()),'notes':'Static decorative detail with named geometry anchors; not an animated/rigged asset and not collision navigation.'}
