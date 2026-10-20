"""Non-destructive secret opportunity compiler for Black Hollow Forge.

This module generates *proposals*, not verified new passages or actual geometry.
Student rooms, doors and all .haunt source content stay unchanged.
"""
import hashlib
import json
from pathlib import Path

PROFILES = (
    ("concealed_bookcase", ("library", "archive", "study", "office", "spell", "book"), "An antique bookcase conceals a locked mechanism", "book_spine_sequence"),
    ("watching_portrait", ("portrait", "gallery", "hall", "foyer"), "A portrait subtly changes its gaze when the player turns", "observe_portrait"),
    ("living_mirror", ("mirror", "dressing", "bedroom"), "An aged mirror briefly reflects another version of the room", "mirror_alignment"),
    ("sealed_reliquary", ("crypt", "vault", "chapel", "tomb"), "An iron-bound reliquary opens after a symbol puzzle", "rune_order"),
    ("botanical_ward", ("conservatory", "greenhouse", "botanical", "garden"), "A carnivorous vine guards a hidden cabinet", "botanical_sequence"),
    ("occult_instrument", ("lab", "alchemy", "workshop", "observatory", "seer"), "An antique scientific instrument responds to supernatural energy", "instrument_calibration"),
    ("music_box_memory", ("nursery", "ballroom", "parlor", "music"), "A music box plays a memory from the estate's past", "music_pattern"),
)

EXCLUDE=("stair", "elevator", "corridor", "landing", "shaft", "passage", "hallway")
WALLS=("top", "right", "bottom", "left")

def digest(s):return hashlib.sha256(s.encode('utf-8')).hexdigest()
def dimension_ft(room, wall):
    return float(room.get('l',0) if wall in ('top','bottom') else room.get('w',0))
def wall_eligible(room, wall):
    length=dimension_ft(room,wall)
    if length < 9.0:return False
    openings=[]
    for op in room.get('openings') or []:
        if op.get('wall')!=wall:continue
        typ=str(op.get('type','')).lower()
        if typ in ('door','secretdoor','window','arch','passage','opening'):
            try: openings.append(float(op.get('pos',.5)))
            except (ValueError,TypeError):return False
    # Reserve middle 25%-75%; no authored opening nearer than 18% of wall length.
    return not any(abs(p-.5)<.18 for p in openings)

def profile_for(room):
    name=str(room.get('name','')).lower()
    typ=str(room.get('roomType',room.get('type',''))).lower()
    v=name+' '+typ
    if any(word in v for word in EXCLUDE):return None
    for key,terms,desc,interaction in PROFILES:
        if any(t in v for t in terms):return key,desc,interaction
    return ('whispering_object','An heirloom whispers an optional clue','listen_for_clue')

def compile_secrets(source, density=.40):
    if isinstance(source,(str,Path)):source=json.loads(Path(source).read_text(encoding='utf8'))
    generated=[]; skipped=[]; eligible=[]
    for fi,f in enumerate(source.get('floors') or []):
        for room in f.get('rooms') or []:
            rid=str(room.get('id',''))
            match=profile_for(room)
            if not match:
                skipped.append({'roomId':rid,'reason':'circulation_or_stair_room'})
                continue
            if room.get('noForgeSecrets') or room.get('noSecrets'):
                skipped.append({'roomId':rid,'reason':'author_opt_out'})
                continue
            walls=[w for w in WALLS if wall_eligible(room,w)]
            if not walls:
                skipped.append({'roomId':rid,'reason':'no_available_wall_segment'})
                continue
            eligible.append((fi,f,room,match,walls))
    # Deterministic percentage across estate, not one per room.
    count=round(len(eligible)*max(0,min(1,density)))
    selection=sorted(eligible,key=lambda a:digest(str(a[2].get('id'))+'|forge-secrets-v1'))[:count]
    for fi,f,r,(kind,desc,interaction),walls in selection:
        rid=str(r['id']); wall=sorted(walls,key=lambda w:digest(rid+'|'+w))[0]
        generated.append({'id':'forge-secret-'+digest(rid+'|'+kind)[:12],
          'roomId':rid,'roomName':r.get('name','Untitled room'),'floorIndex':fi,'floorName':f.get('name',str(fi)),
          'type':kind,'displayText':desc,'interaction':interaction,
          'placement':{'wall':wall,'normalizedWallPosition':.5,'surface':'existing_wall','interiorOnly':True},
          'storyState':'undiscovered','reward':'lore_or_minor_optional_item',
          'criticalPath':False,'addsPhysicalOpening':False,'connectsRooms':False,
          'needsRuntimeImplementation':True,'needsCollisionCheck':True,
          'source':'forge_generated_overlay','status':'PROPOSAL_NOT_GAMEPLAY_CERTIFIED'})
    # Escalation is deterministic across the whole estate. Never depend on Python's
    # randomized hash or mutate authored content. Keep room/secret IDs stable.
    levels=('concealed_history','supernatural_disturbance','impossible_architecture')
    # Exact integer quotas with largest-remainder distribution for small estates.
    proportions=(.50,.35,.15)
    raw=[len(generated)*v for v in proportions]
    quotas=[int(v) for v in raw]
    for i in sorted(range(3),key=lambda i:(-(raw[i]-quotas[i]),i))[:len(generated)-sum(quotas)]:quotas[i]+=1
    ordered=sorted(generated,key=lambda x:(x['floorIndex'],digest(x['roomId']+'|progressive-order')))
    # Sort progression so the rare impossible encounters appear later; prefer
    # upper/deeper authored floors, but do not invent Floor 13 when absent.
    assigned=[levels[i] for i,n in enumerate(quotas) for _ in range(n)]
    for rank,(secret,tier) in enumerate(zip(ordered,assigned)):
        secret['hauntingTier']=tier
        secret['progressionRank']=rank+1
        secret['minimumDiscoveredSecrets']=max(0,rank-1) if tier!='concealed_history' else 0
        secret['progressionTrigger']={'type':'minimum_optional_secrets_discovered',
                                      'value':secret['minimumDiscoveredSecrets']}
        secret['realityEffect']={
            'concealed_history':'physical_mechanism_or_archival_clue',
            'supernatural_disturbance':'nonstructural_illusion_or_spectral_response',
            'impossible_architecture':'instanced_pocket_scene_with_return_anchor'
        }[tier]
        secret['runtimeContract']={
            'event':'forge.secret.discovered', 'id':secret['id'],
            'roomId':secret['roomId'], 'tier':tier,
            'requiresVerifiedPropPlacement':True,
            'reversible':True,
            'returnToAuthoredRoom':True,
            'mayModifyCriticalPath':False,
            'mayAlterStudentBlueprint':False
        }
        if tier=='impossible_architecture':
            secret['addsPhysicalOpening']=False
            secret['connectsRooms']=False
            secret['requiresPocketScene']=True
            secret['proposedPortalIsNonPhysical']=True
            secret['returnAnchorRequired']=True
    counts_by_tier={tier:sum(x['hauntingTier']==tier for x in generated) for tier in levels}
    # Floor 13 is recognized only if already present in authored floor data.
    floor13=[i for i,f in enumerate(source.get('floors') or [])
              if '13' in str(f.get('name','')).lower().split() or str(f.get('number',''))=='13']
    return {'schema':'black-hollow-forge-secrets-v2','estate':source.get('name','Unnamed'),
      'settings':{'density':density,'blueprintMutated':False,'optionalOnly':True,
                  'noInventedConnections':True,'tierWeights':dict(zip(levels,proportions)),
                  'floor13AuthoredIndices':floor13,
                  'floor13Policy':'escalation_priority_if_authored; no floor or geometry synthesized'},
      'counts':{'rooms':sum(len(f.get('rooms') or []) for f in source.get('floors') or []),
                'eligible':len(eligible),'proposed':len(generated),'skipped':len(skipped),
                'byTier':counts_by_tier},
      'secrets':generated,'skipped':skipped,
      'requiredBeforeRuntime':['Validate furnishings/portraits do not overlap generated props',
      'Confirm proposed placement does not interfere with circulation',
      'Instantiate visual props, spectral effects and optional pocket scenes',
      'Prove every impossible pocket scene has a safe return anchor',
      'Wire triggers to the Black Hollow runtime; do not modify required mission path']}


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('blueprint');p.add_argument('output');p.add_argument('--density',type=float,default=.40)
    a=p.parse_args()
    Path(a.output).parent.mkdir(parents=True,exist_ok=True)
    Path(a.output).write_text(json.dumps(compile_secrets(a.blueprint,a.density),indent=2),encoding='utf8')
