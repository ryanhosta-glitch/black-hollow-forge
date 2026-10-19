"""Black Hollow Living Conservatory: ten additive geometric design passes.
Static render models and gameplay anchor metadata; does not alter student rooms.
"""
import math
import numpy as np
import trimesh

def build(sc):
    C={'iron':(47,65,66,255),'bronze':(150,119,75,255),'jade':(41,97,71,255),'moss':(49,82,49,255),'darkleaf':(25,69,51,255),'lime':(116,151,72,255),'fern':(64,128,83,255),'bark':(74,58,49,255),'mold':(97,106,75,255),'ivory':(203,198,169,255),'ghost':(153,187,194,255),'glass':(117,174,173,95),'purple':(91,72,120,255),'ruby':(145,51,72,255),'water':(25,38,50,255),'stone':(101,105,101,255),'floor':(153,133,106,255)}
    counts={}; anchors=[]
    def add(tag,m,color,p):
        m.visual.face_colors=np.array(C[color] if isinstance(color,str) else color,dtype=np.uint8)
        sc.add_geometry(m,node_name=tag,geom_name=tag);counts[p]=counts.get(p,0)+1
    def cube(tag,at,ext,c,p):
        if min(ext)<=0:return
        m=trimesh.creation.box(extents=ext);m.apply_translation(at);add(tag,m,c,p)
    def ell(tag,at,r,c,p,sub=1):
        m=trimesh.creation.icosphere(subdivisions=sub);m.apply_scale(r);m.apply_translation(at);add(tag,m,c,p)
    def bar(tag,a,b,r,c,p,sides=7):
        a=np.array(a,float);b=np.array(b,float);vec=b-a;d=np.linalg.norm(vec)
        if d<.01:return
        m=trimesh.creation.cylinder(radius=r,height=d,sections=sides)
        m.apply_transform(trimesh.geometry.align_vectors((0,0,1),vec/d));m.apply_translation((a+b)/2)
        add(tag,m,c,p)
    def anchor(id,pos,kind,action):
        anchors.append({'id':id,'positionMeters':[round(float(q),3) for q in pos],'kind':kind,'suggestedAction':action,'runtimeWired':False})
    # 1: Structural ironwork: vertical ribs, vault ties, cast iron footplates
    for z in range(-17,18,4):
        for s in (-1,1):
            x= s*13.8
            cube(f'frame-cast-foot-{s}-{z}',(x,.16,z),(.6,.32,.6),'stone',1)
            cube(f'frame-cast-cap-{s}-{z}',(x,18.65,z),(.62,.32,.62),'bronze',1)
            for k in range(6):
                t=k/5
                bar(f'arched-spine-{s}-{z}-{k}',(s*13.8*(1-t),19+5*math.sin(t*math.pi/2),z),(s*13.8*(1-(t+.2/5)),19+5*math.sin(min(1,t+.2/5)*math.pi/2),z),.12,'iron',1)
    for z in (-17.6,17.6):
        for x in range(-12,13,3):bar(f'end-gable-ornament-{x}-{z}',(x,18,z),(x,20.4,z),.06,'bronze',1)
    # 2: Victorian glazing, panels are mostly transparent, and do not block viewing
    for s in (-1,1):
        for z in range(-15,16,5):
            for j in range(3):
                ell(f'etched-glass-roundel-{s}-{z}-{j}',(s*13.74,4.6+j*4.8,z),(.03,.55,.55),'glass',2)
    for z in range(-15,16,5):
        for j in range(-3,4):
            ell(f'vault-stained-glass-medallion-{z}-{j}',(j*3.6,23.9-abs(j)*.22,z),(.67,.04,.67),'glass',2)
    # 3: patterned pedestrian routes and plant bed borders
    for s in (-1,1):
        for z in range(-16,17,4):
            cube(f'botanical-border-{s}-{z}',(s*6.8,.10,z),(.15,.25,3.8),'bronze',3)
            cube(f'drain-channel-{s}-{z}',(s*3.3,.07,z),(.12,.05,3.8),'iron',3)
    for z in range(-17,18,3):cube(f'central-aisle-geometric-mosaic-{z}',(0,.093,z),(3.5,.012,.07),'bronze',3)
    # 4: recognizable tree ferns: trunk, radial curved frond spines, pinnules
    for s in (-1,1):
        for idx,z in enumerate((-14,-5,5,14)):
            x=s*(10.8+idx%2*.7)
            bar(f'tree-fern-trunk-{s}-{idx}',(x,.7,z),(x,3.5,z),.17,'bark',4)
            for f in range(7):
                a=f*math.tau/7
                tip=(x+math.cos(a)*2.1,2.6,z+math.sin(a)*2.1)
                bar(f'tree-fern-rachis-{s}-{idx}-{f}',(x,3.55,z),tip,.045,'fern',4)
                for k in (1,2,3):
                    t=k/4; px=x+math.cos(a)*2.1*t;pz=z+math.sin(a)*2.1*t
                    ell(f'tree-fern-pinna-{s}-{idx}-{f}-{k}',(px,3.28-.55*t,pz),(.25,.07,.50),'fern',4)
    # 5: palms, monstera-style leaves and vines from roof
    for s in (-1,1):
        for idx,z in enumerate((-10,1,11)):
            x=s*11.6
            bar(f'fan-palm-trunk-{s}-{idx}',(x,.4,z),(x+s*.4,5.5,z),.19,'bark',5)
            for j in range(8):
                a=j*math.tau/8
                ell(f'palm-frond-{s}-{idx}-{j}',(x+s*.4+math.cos(a)*1.35,5.1,z+math.sin(a)*1.35),(1.05,.09,.30),'jade',5)
    for j in range(10):
        x=(-1)**j*(11+j%3*.6);z=-14+j*3
        for k in range(3):bar(f'hanging-vine-{j}-{k}',(x,19-k*1.2,z),(x+.4*math.sin(k+j),17-(k+1)*1.3,z+.3*k),.035,'moss',5)
    # 6: carnivorous living displays; active positions stored as anchors
    for idx,(x,z) in enumerate(((-8,10),(8,8),(-10,-9))):
        bar(f'giant-nepenthes-stem-{idx}',(x,.5,z),(x,3.4,z),.15,'jade',6)
        ell(f'giant-nepenthes-pitcher-{idx}',(x+.65,2.05,z),(.75,1.3,.72),'ruby',6,2)
        ell(f'giant-nepenthes-open-lip-{idx}',(x+.65,3.18,z),(.85,.17,.77),'lime',6,2)
        ell(f'giant-nepenthes-lid-{idx}',(x+.75,3.65,z-.3),(.84,.15,.65),'darkleaf',6,2)
        anchor(f'pitcher_{idx}',(x+.6,2.8,z),'carnivorous-plant','react_to_spectral_lens')
    for i in range(8):
        x=-7.6+(i%4)*.45;z=9.5+(i//4)*.45
        ell(f'drosera-trap-{i}',(x,1.08,z),(.25,.08,.3),'ruby',6)
        for j in range(5):
            a=j*math.tau/5
            bar(f'drosera-tentacle-{i}-{j}',(x,1.1,z),(x+.24*math.cos(a),1.5,z+.24*math.sin(a)),.022,'ghost',6)
    # 7: pool, draining channels, gargoyles and night water
    for k in range(2):
        size=5.7+1.0*k
        for s in (-1,1):
            cube(f'fountain-stepped-lip-x-{k}-{s}',(0,.55-.13*k,s*size/2),(size,.22,.16),'stone',7)
            cube(f'fountain-stepped-lip-z-{k}-{s}',(s*size/2,.55-.13*k,0),(.16,.22,size),'stone',7)
    for i in range(8):
        a=i*math.tau/8
        ell(f'black-water-reflection-{i}',(math.cos(a)*1.75,.69,math.sin(a)*1.75),(.45,.01,.13),'ghost',7)
    anchor('black_fountain',(0,.85,0),'puzzle','listen_to_water_whispers')
    # 8: research laboratory and specimen cabinets with transparent vessels
    for j in range(5):
        x=4+j*1.6
        cube(f'lab-counter-drawer-{j}',(x,1.28,-13.5),(1.4,1.05,1.3),'bark',8)
        cube(f'lab-counter-marble-{j}',(x,1.85,-13.5),(1.5,.13,1.45),'stone',8)
        for i in range(2):
            ell(f'lab-alembic-{j}-{i}',(x+(.32 if i else -.32),2.2,-13.5),(.19,.32,.19),'glass',8)
            cube(f'lab-vial-stopper-{j}-{i}',(x+(.32 if i else -.32),2.57,-13.5),(.18,.12,.18),'bronze',8)
    anchor('botanical_lab',(7.2,1.8,-12.3),'research','examine_botany_codex')
    # 9: catwalk engineering, railings and service stair footprints
    for s in (-1,1):
        cube(f'catwalk-outer-handrail-{s}',(0,7.95,14+s*.76),(15,.1,.1),'bronze',9)
        for x in range(-7,8):
            bar(f'catwalk-vertical-{s}-{x}',(x,6.55,14+s*.76),(x,7.92,14+s*.76),.038,'iron',9)
    for i in range(12):
        x=10.8-i*.50
        cube(f'catwalk-service-step-{i}',(x,(i+.5)*.52,12),(1.15,.16,1.45),'iron',9)
    anchor('catwalk_observation',(0,6.55,14),'navigation','inspect_from_upper_catwalk')
    # 10: supernatural tokens, damaged wing, bioluminescent orchid chandelier and secret lens
    for i in range(10):
        a=i*math.tau/10
        x=math.cos(a)*3.2;z=-5+math.sin(a)*3.2
        ell(f'ghost-orchid-illumination-{i}',(x,14+math.sin(a*2)*.9,z),(.28,.22,.60),'ghost',10)
        bar(f'ghost-orchid-filament-{i}',(x,17.2,z),(x,14.2,z),.019,'iron',10)
    for j in range(6):
        cube(f'abandoned-wing-smashed-frame-{j}',(-13.3,2.4+j*.9,-6+j*.56),(.22,.12,1.3),'iron',10)
    ell('spectral-lens-plinth',(-5,1.05,-13),(.65,.95,.65),'stone',10,2)
    ell('spectral-lens-crystal',(-5,2.05,-13),(.43,.44,.43),'purple',10,2)
    anchor('spectral_lens',(-5,2.05,-13),'quest','collect_spectral_lens')
    anchor('secret_botanical_door',(-12.8,1.3,-12),'secret-door','unlock_research_vault')
    anchor('return_portal',(0,1,-17),'floor13-exit','find_impossible_elevator')
    return {'passCounts':{str(k):counts.get(k,0) for k in range(1,11)},'interactionAnchors':anchors,'totalAddedMeshes':sum(counts.values()),'status':'static geometric detail; interactions and navigation not yet connected to game runtime'}
