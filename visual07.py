"""Decorative geometry pass; deliberately avoids modifying student blueprint geometry."""
import math
import numpy as np
import trimesh

def add_visuals(scene, box, sphere, name):
    gold=(205,164,91,255); brass=(158,111,61,255); ivory=(215,204,180,255)
    wine=(97,22,38,255); shadow=(43,34,42,255); leaf=(41,97,68,255)
    def ring(tag,cx,cy,cz,r,yheight=.08,n=18,col=gold):
        for j in range(n):
            a=math.tau*j/n;b=math.tau*(j+1)/n
            xa,za=cx+math.cos(a)*r,cz+math.sin(a)*r
            xb,zb=cx+math.cos(b)*r,cz+math.sin(b)*r
            length=math.hypot(xb-xa,zb-za)
            m=trimesh.creation.box((length,yheight,.08))
            m.apply_transform(trimesh.transformations.rotation_matrix(-a-math.pi/2,[0,1,0]))
            m.apply_translation(((xa+xb)/2,cy,(za+zb)/2));m.visual.face_colors=np.array(col,dtype=np.uint8)
            scene.add_geometry(m,node_name=f'{tag}-{j}')
    if name=='main-hall':
        # Ceiling coffers, structural cornices and layered ornamental bands.
        for z in range(-16,18,4):
            box(f'gilded-ceiling-beam-{z}',(0,17.75,z),(26,.15,.14),gold)
            for x in range(-11,12,4):
                box(f'coffer-center-{x}-{z}',(x,17.68,z),(.75,.05,.75),brass)
        for s in (-1,1):
            for y in (0.4,3.2,7.2,12.4,16.9):
                box(f'gilded-wall-banding-{s}-{y}',(s*13.68,y,0),(.14,.11,37),gold)
            for z in range(-14,16,5):
                box(f'ornate-wall-panel-{s}-{z}',(s*13.7,6.2,z),(.12,5.3,3.2),(91,54,61,255))
                box(f'panel-medallion-{s}-{z}',(s*13.59,6.2,z),(.13,1.3,1.3),brass)
        for x in range(-12,13,3):
            box(f'marble-floor-diamond-joint-{x}',(x,.012,-8),(.027,.008,19),(128,116,114,255))
        # Delineate the descending perspective and add grand balustrade spheres.
        for s in (-1,1):
            for i in range(0,28,2):
                y=(i+1)*8.7/28+1.48;z=(i+.5)*17/28-.5
                sphere(f'balustrade-finial-{s}-{i}',(s*5.3,y,z),.16,gold,1)
                box(f'railing-rail-short-{s}-{i}',(s*5.3,y-.15,z),(.10,.10,1.25),brass)
        # Globes now have cardinal rings and each lion an elongated haunch, rear legs and mane ridges.
        for s in (-1,1):
            sx=s*7.1
            for lat in (-.35,0,.35):
                ring(f'lion-world-latitude-{s}-{lat}',sx-s*1.1,1.03+lat,0,.57*math.cos(lat),.035,18,brass)
            for j in range(9):
                a=math.tau*j/9
                sphere(f'lion-mane-tuft-{s}-{j}',(sx+math.cos(a)*.6,2.36+math.sin(a)*.58,-.55),.23,(143,129,111,255),1)
            for dz in (-1.45,-.65):
                sphere(f'lion-haunch-{s}-{dz}',(sx+s*.36,1.0,dz),.45,(149,143,128,255),1)
        # Raven beak and bright watchful eyes.
        box('raven-beak',(.05,15.45,18.12),(.11,.11,.48),(79,66,48,255))
        for s in (-1,1):sphere(f'raven-eye-{s}',(s*.16,15.31,18.27),.045,(229,132,44,255),1)
        # Thick antique framed map with raised map-floor plaques. Static labels deliberately omitted.
        for i in range(5):
            box(f'estate-map-floor-band-{i}',(6.2,11.45+i*.32,18.50),(2.16,.025,.035),brass)
        # Chandelier crystal tiers; animated transform can attach to named groups later.
        for j,z in enumerate((-8,7)):
            for level,rad,drop in ((0,2.6,5.05),(1,1.8,5.65),(2,.95,6.2)):
                ring(f'chandelier-hoop-{j}-{level}',0,18-drop,z,rad,.075,22,gold)
                for k in range(18):
                    a=k*math.tau/18
                    sphere(f'chandelier-pendant-{j}-{level}-{k}',(math.cos(a)*rad,18-drop-.25,z+math.sin(a)*rad),.12,(171,197,213,255),1,(.65,2,.65))
    else:
        # Conservatory: Victorian ironwork, tile paths, botanical diversity and glass ridge silhouettes.
        W,D=30,37
        for x in range(-14,15,2):
            box(f'floor-terracotta-seam-x-{x}',(x,.011,0),(.028,.02,36),(74,69,62,255))
        for z in range(-17,18,2):
            box(f'floor-terracotta-seam-z-{z}',(0,.011,z),(29,.02,.028),(74,69,62,255))
        for z in range(-18,19,3):
            box(f'glass-ridge-crossmember-{z}',(0,23.7,z),(27,.095,.095),(105,126,122,255))
            for s in (-1,1):
                box(f'filigree-cornice-{s}-{z}',(s*13.75,18.65,z),(.28,.32,.34),brass)
        for s in (-1,1):
            for z in range(-15,16,6):
                for i in range(3):
                    x=s*(8+i*.68)
                    # Thick stem and several fronds: static articulated botanical meshes.
                    box(f'fern-stem-{s}-{z}-{i}',(x,1.8,z),(.06,1.9,.06),(59,78,47,255))
                    for j in range(5):
                        a=j*math.tau/5
                        sphere(f'fern-frond-{s}-{z}-{i}-{j}',(x+math.cos(a)*.75,2.35,z+math.sin(a)*.75),.62,leaf,1,(1,.22,.52))
        # Fountain layering and hidden black-water channel.
        ring('black-fountain-gold-lip',0,.69,0,3.02,.11,24,brass)
        sphere('black-fountain-center-sphere',(0,2.55,0),.46,(93,101,103,255),2)
        for i in range(12):
            a=math.tau*i/12
            sphere(f'fountain-marble-scallop-{i}',(math.cos(a)*2.65,.85,math.sin(a)*2.65),.28,ivory,1)
        # Lab cabinets and glass samples, hung seed drawers.
        for j in range(6):
            xx=4.35+j*1.2
            box(f'specimen-cabinet-{j}',(xx,2.0,-16),(1.05,2.25,.48),(79,50,41,255))
            for t in range(3):
                box(f'specimen-label-{j}-{t}',(xx,1.35+t*.57,-15.73),(.69,.12,.035),ivory)
                sphere(f'specimen-jar-{j}-{t}',(xx,1.54+t*.57,-15.25),.16,(74,135,139,160),1)
        for s in (-1,1):
            for x in range(-7,8,1):
                box(f'catwalk-spindle-{s}-{x}',(x,7.03,14+s*.7),(.07,1.4,.08),brass)
        # Carnivorous flower teeth in two semicircular arrays.
        for j in range(13):
            a=math.pi*j/12
            for s in (-1,1):
                sphere(f'flytrap-teeth-{s}-{j}',(-8+s*(.7+math.cos(a)*.7),3.0+math.sin(a)*.15,10+math.sin(a)*.82),.14,ivory,1,(.45,1.8,.45))
        # Spectral hanging orchids over the side path.
        for j in range(12):
            x=(-1 if j%2 else 1)*(10+j%3)
            z=-13+j*2.3
            box(f'ghost-orchid-stem-{j}',(x,8.9,z),(.04,4.8,.04),(65,77,58,255))
            for k in range(4):
                a=k*math.tau/4
                sphere(f'ghost-orchid-petal-{j}-{k}',(x+math.cos(a)*.26,6.3,z+math.sin(a)*.25),.23,(154,173,190,255),1,(1,.42,1))
