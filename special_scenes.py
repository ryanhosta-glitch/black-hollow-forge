"""Reusable visually richer but still prototype-level Black Hollow special scenes.
Collision and missions belong to runtime, not decorative geometry.
"""
import math
import numpy as np
import trimesh

def build(name,out):
 sc=trimesh.Scene()
 def box(label,xyz,dim,col):
  if min(dim)<=0:return
  m=trimesh.creation.box(extents=dim);m.apply_translation(xyz);m.visual.face_colors=np.asarray(col,dtype=np.uint8);sc.add_geometry(m,node_name=label)
 def sphere(label,xyz,r,col,sub=1,scale=None):
  m=trimesh.creation.icosphere(subdivisions=sub,radius=r)
  if scale:m.apply_scale(scale)
  m.apply_translation(xyz);m.visual.face_colors=np.asarray(col,dtype=np.uint8);sc.add_geometry(m,node_name=label)
 gold=(192,143,70,255);red=(109,29,42,255);dark=(48,33,37,255);marble=(179,166,152,255);amber=(214,169,108,255)
 if name=='main-hall':
  W,D,H=28,38,18
  box('black-marble-foundation',(0,-.2,0),(W,.4,D),(63,62,73,255))
  for i in range(-12,13,3):box('marble-polish-strip-'+str(i),(i,-.001,0),(.025,.01,D),(152,140,133,255))
  box('red-carpet-main',(0,.018,-8),(6,.025,21),red)
  for side in (-1,1):
   box(f'gilded-runner-border-{side}',(side*3,.04,-8),(.065,.04,21),gold)
   box(f'wall-eastwest-{side}',(side*W/2,H/2,0),(.37,H,D),(88,72,75,255))
   for z in (-14,-6,2,10,17):
    box(f'ornate-pilaster-{side}-{z}',(side*(W/2-.35),H/2,z),(.36,H,.6),gold)
    box(f'wall-torch-{side}-{z}',(side*(W/2-.58),4.7,z),(.29,.6,.4),amber)
  for side in (-1,1):box('rear-front-stone-'+str(side),(0,H/2,side*D/2),(W,H,.37),(86,69,73,255))
  box('ceiling-cornice',(0,H-.2,0),(W,.4,D),(79,62,70,255))
  # Deep coffer ribs give scale and contrasting recessed panels under inspection light.
  for xx in range(-12,13,4):box(f'gold-ceiling-coffer-cross-{xx}',(xx,H-.47,0),(.14,.18,D-1),gold)
  for zz in range(-16,17,4):box(f'gold-ceiling-coffer-long-{zz}',(0,H-.47,zz),(W-1,.18,.14),gold)
  for side in (-1,1):
   for zz in range(-16,18,3):
    box(f'marble-wall-recess-{side}-{zz}',(side*(W/2-.18),8.7,zz),(.10,10,2),(104,67,75,255))
    box(f'ornate-wall-toprail-{side}-{zz}',(side*(W/2-.32),14.2,zz),(.16,.11,2.2),gold)
  for zz in (-16,16):
   for xx in range(-12,13,3):box(f'gold-crown-frieze-{zz}-{xx}',(xx,H-1.0,zz),(.23,.33,.17),gold)
  # Massive single central stair, camera can turn and look down from upper platform.
  steps=28;run=17;rise=8.7
  for n in range(steps):
   depth=(n+.5)*run/steps
   box('grand-stair-marble-'+str(n),(0,(n+.5)*rise/steps,depth-.5),(10,rise/steps,run/steps+.02),marble)
   box('grand-stair-crimson-'+str(n),(0,(n+1)*rise/steps+.012,depth-.5),(6,.025,run/steps+.02),red)
   for side in (-1,1):
    box(f'stair-rod-{n}-{side}',(side*3,(n+1)*rise/steps+.06,depth-.5),(.07,.07,run/steps),gold)
    if n%2==0:box(f'gilded-stair-post-{n}-{side}',(side*5.3,(n+1)*rise/steps+.75,depth-.5),(.11,1.5,.11),gold)
  box('great-upper-gallery',(0,rise,16),(17,.34,9),marble)
  for side in (-1,1):
   for n in range(21):
    x=side*(5.45+n%3*.04);z=n*17/21-.5
    box(f'upper-baluster-{side}-{n}',(x,rise+1.16,z),(.14,2.12,.14),gold)
   box(f'upper-balcony-handrail-{side}',(side*5.45,rise+2.21,7.9),(.22,.18,17.9),gold)
  # Deep red and brass frieze to signal the gateway from the ground floor.
  box('great-stair-stage-plinth',(0,.12,-1),(14,.24,2),marble)
  box('upper-gallery-carpet',(0,rise+.19,15.8),(6,.03,8),red)
  for side in (-1,1):
   box(f'gallery-balustrade-{side}',(side*8.4,rise+1.05,16),(.16,1.8,8),gold)
  box('elevator-portal-bronze',(0,rise+2.9,19.15),(5.1,5.8,.4),gold)
  box('elevator-dark-gate',(0,rise+2.9,18.87),(3.8,4.9,.12),dark)
  for i in range(-5,6):box(f'elevator-brass-bars-{i}',(i*.30,rise+2.8,18.76),(.035,4.6,.035),gold)
  box('wall-map-parchment',(6.2,rise+3,18.7),(2.7,2,.12),(167,135,90,255))
  box('map-label-plate',(6.2,rise+1.65,18.62),(2.3,.28,.10),gold)
  box('map-frame',(6.2,rise+3,18.57),(3,.11,.23),gold)
  # Iconic lions each guarding a globe at the foot of the stairs: sculptural proxies.
  for side in (-1,1):
   sx=side*7.1
   box(f'lion-plinth-{side}',(sx,.32,-1.2),(3,.65,3),marble)
   sphere(f'lion-body-{side}',(sx,1.42,-1.1),.95,(153,145,132,255),2,(1.08,.85,1.25))
   sphere(f'lion-mane-{side}',(sx,2.35,-.55),.77,(135,126,113,255),2)
   sphere(f'lion-face-{side}',(sx,2.35,-.0),.49,(169,156,136,255),2)
   sphere(f'lion-world-{side}',(sx-side*1.1,1.03,.0),.69,(132,141,133,255),2)
   box(f'lion-paw-on-world-{side}',(sx-side*.66,1.55,.0),(.56,.27,.6),marble)
  # Raven sculptural silhouette directly above elevator door.
  sphere('raven-body',(0,rise+6.2,18.6),.42,(20,21,29,255),2,(1,.8,1.4))
  sphere('raven-head',(.05,rise+6.56,18.5),.26,(16,17,24,255),2)
  for s in (-1,1):sphere('raven-wing-'+str(s),(s*.47,rise+6.18,18.55),.5,(22,21,31,255),1,(1.6,.28,.75))
  box('raven-perch',(0,rise+5.83,18.65),(1.9,.08,.2),gold)
  # Two huge faceted chandelier prototypes with separate hierarchy names for future animation.
  for j,z in enumerate((-8,7)):
   box(f'chandelier-chain-{j}',(0,H-2.6,z),(.075,4,.075),gold)
   for i in range(12):
    a=i*math.tau/12
    xx,zz=math.cos(a)*2.6,z+math.sin(a)*2.6
    sphere(f'chandelier-crystal-{j}-{i}',(xx,H-5.1,zz),.22,(197,210,216,255),1)
    box(f'chandelier-arm-{j}-{i}',(xx/2,H-4.65,(zz+z)/2),(math.hypot(xx/2,(zz-z)/2),.07,.07),gold)
    box(f'chandelier-candle-{j}-{i}',(xx,H-4.7,zz),(.09,.25,.09),amber)
  box('upper-landing-side-door-left',(-12,rise+1.85,15),(.3,3.7,1.9),dark)
  box('upper-landing-side-door-right',(12,rise+1.85,15),(.3,3.7,1.9),dark)
 elif name=='floor13-conservatory':
  W,D,H=30,37,19
  box('greenhouse-marble-floor',(0,-.15,0),(W,.3,D),(90,94,83,255))
  box('central-conservatory-walk',(0,.04,0),(4.2,.08,D-1),(149,143,124,255))
  # Glassless Gothic lantern structure keeps roof transparent without sorting artifacts.
  for zz in range(-17,19,2):
   for side in (-1,1):
    for n in range(7):
     t=n/6;x=side*(13.8-t*13.8);y=H+5*math.sin(t*math.pi/2)
     box(f'cast-iron-vault-arch-{zz}-{side}-{n}',(x,y,zz),(.14,.13,.13),(139,125,91,255))
  for side in (-1,1):
   for zz in range(-16,18,4):
    box(f'gothic-glass-frame-transom-{side}-{zz}',(side*14,13,zz),(.19,.17,3.4),(165,137,91,255))
  for xx in (-10,10):
   for zz in (-13,13):
    box(f'gargoyle-fern-pedestal-{xx}-{zz}',(xx,.48,zz),(1.4,.96,1.4),(124,121,105,255))
  for side in (-1,1):
   for z in range(-17,19,4):
    box(f'glasshouse-iron-column-{side}-{z}',(side*14,H/2,z),(.20,H,.20),(60,69,70,255))
    box(f'greenhouse-fern-bench-{side}-{z}',(side*9,.45,z),(2.8,.9,2.3),(73,56,50,255))
    for i in range(4):
     px=side*(8+(i%2)*1.1);pz=z+(i//2)*.75-.4
     sphere(f'plant-foliage-{side}-{z}-{i}',(px,1.5+(i%2)*.3,pz),.64,(37+9*i,80+8*i,51+5*i,255),1,(.85,1.7,.85))
  for z in (-18.5,18.5):
   for x in range(-14,15,3):box(f'end-wall-cast-iron-{x}-{z}',(x,H/2,z),(.14,H,.14),(65,74,75,255))
  for y in range(3,20,3):
   for s in (-1,1):box(f'greenhouse-horizontal-mullion-{s}-{y}',(s*14,y,0),(.12,.12,D),(72,88,86,255))
  # Sloped ribbed high glass vault. This is a geometric lattice, no expensive glass transparency.
  for z in range(-18,19,3):
   for s in (-1,1):
    for n in range(9):
     t=n/9
     x=s*(14-t*14);yy=H+math.sin(t*math.pi/2)*5
     box(f'glass-vault-rib-{z}-{s}-{n}',(x,yy,z),(.13,.17,.13),(69,100,103,255))
  box('conservatory-central-fountain-basin',(0,.3,0),(5.4,.6,5.4),(111,112,107,255))
  box('black-water',(0,.64,0),(4.7,.05,4.7),(20,22,33,255))
  sphere('fountain-statue',(0,1.7,0),.62,(155,152,145,255),2,(.6,1.65,.6))
  box('iron-catwalk',(0,6.4,14),(15,.16,1.6),(68,75,72,255))
  for x in range(-7,8,2):box('catwalk-post-'+str(x),(x,7.15,13.3),(.08,1.5,.08),(79,83,78,255))
  box('secret-botany-laboratory-floor',(8,.07,-12),(10,.15,10),(92,76,67,255))
  for i in range(4):
   box(f'botanical-workbench-{i}',(5+i*1.9,.65,-11),(1.3,1.15,3),(72,54,45,255))
   sphere(f'ghost-orchid-{i}',(5+i*1.9,1.55,-10),.32,(132,163,178,255),1,(.9,1.7,.9))
  # oversized flytrap sculptural proxy
  sphere('carnivorous-core',(-8,2,10),1.5,(58,111,59,255),2,(1.15,.45,1.3))
  for s in (-1,1):sphere('carnivorous-mouth-'+str(s),(-8+s*.7,2.8,10),1.2,(97,117,69,255),1,(.9,.2,1.1))
 else:raise ValueError(name)
 if name=='floor13-conservatory':
  from living_conservatory import build as upgrade_conservatory
  conservatory_upgrade=upgrade_conservatory(sc)
 if name=='main-hall':
  from grand_hall_masterpiece import build as upgrade_hall
  hall_upgrade=upgrade_hall(sc)
 from visual07 import add_visuals
 add_visuals(sc,box,sphere,name)
 sc.export(str(out))
 return {'scene':name,'meshes':len(sc.geometry),'grandHallPasses':hall_upgrade if name=='main-hall' else None,'livingConservatory':conservatory_upgrade if name=='floor13-conservatory' else None,'status':'enhanced static proxy; animations, cinematic texturing and gameplay not yet integrated'}
