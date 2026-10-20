"""Black Hollow Forge pass 4: deterministic additive room identity plans.
Does not edit or repair source plans; doesn't claim collision certification.
Usage: python room_identity_v2.py path/to/room_intelligence.json path/to/furnishing_plan.json output.json
"""
import json,sys,hashlib,re
from pathlib import Path

PATTERNS={
 'burial':('carved epitaph panels','funerary candle sconces','sarcophagus lid: inspect','memorial plaque: read','cold dust and stone'),
 'laboratory':('tile splashback','suspended reagent rack','apparatus shelf: inspect','cabinet: open','chemical patina'),
 'storage':('heavy timber shelving','stone bottle niches','wine cabinet: open','barrel: inspect','damp cellar'),
 'secured':('reinforced jamb trim','iron key hooks','lockbox: inspect','cabinet: unlock','contained and guarded'),
 'library':('carved shelf pilasters','bookcase crown','bookcase: search','reading desk: open','powdery dry dust'),
 'study':('wood writing panels','carved hearth surround','desk: open','letter: read','warm aged brass'),
 'entertainment':('coffered ceiling accent','dancefloor perimeter inlay','mirror: inspect','chandelier: inspect','pale fading gilding'),
 'social':('rich paneling','fireplace lintel','armchair: sit','cabinet: open','faded damask'),
 'dining':('ornate wall dado','chandelier ceiling rose','sideboard: open','table setting: inspect','untouched banquet'),
 'botanical':('iron lattice trim','plant display shelving','specimen: inspect','terrarium: open','overgrown living green'),
 'nursery':('painted dado','toy shelf trim','toy chest: open','rocking chair: sit','uncanny preservation'),
 'workshop':('tool rail','bench shelving','workbench: search','toolbox: open','sawdust and corrosion'),
 'gallery':('picture rail','niche molding','portrait: inspect','frame: investigate','dusty gilt'),
 'occult':('carved sigil architrave','ritual alcove molding','spellbook: read','reliquary: open','unsettling candle smoke'),
 'observatory':('brass instrument mounting','roof beam trim','telescope: rotate','star chart: read','cold moonlit brass'),
 'entry':('stone baseboards','grand ceiling medallion','guestbook: read','entry clock: inspect','carefully preserved'),
 'mirror':('mirrored pilasters','gilt corner rosettes','mirror: inspect','hidden panel: test','distorted reflection'),
 'circulation':('durable baseboards','lantern bracket','wall plaque: read','sconce: inspect','quiet transition'),
 'stair':('newel trim','balustrade detail','banister: inspect','landing plaque: read','safe traversal priority'),
 'neutral':('optional crown band','restrained wainscot','room plaque: inspect','wall feature: inspect','subtle aging'),
}
EXACT={'ballroom':'entertainment','lab':'laboratory','cellar':'storage','vault':'secured','botanical':'botanical','crypt':'burial','gallery':'gallery','library':'library','nursery':'nursery','study':'study','workshop':'workshop','observatory':'observatory','occult':'occult','mirror':'mirror','entry':'entry','none':'neutral'}

def classify(row, old_profile):
 name=row['name'].lower(); c=str(row.get('recognizedCategory','')).lower(); family=str(row.get('functionalFamily','')).lower()
 if re.search(r'stair|steps|landing',name):return 'stair'
 if re.search(r'corridor|passage|hallway',name):return 'circulation'
 for word,key in [('dollmaker','workshop'),('seer','occult'),('mirror','mirror'),('conservatory','botanical'),('wine','storage'),('crypt','burial'),('nursery','nursery'),('laboratory','laboratory'),('observatory','observatory'),('archive','library'),('library','library'),('ballroom','entertainment')]:
  if word in name:return key
 for candidate in (old_profile,c,family):
  if candidate in EXACT:return EXACT[candidate]
  if candidate in PATTERNS:return candidate
 return 'neutral'

def build(rooms,furnishing,source_hash=None):
 by_id={r['id']:r for r in furnishing['rooms']}
 out=[]
 for row in rooms['roomAssignments']:
  furnished=by_id.get(row['roomId'],{})
  family=classify(row,furnished.get('profile',''))
  crown,feature,action1,action2,aging=PATTERNS[family]
  suggestions=[dict(objectName=p['name'],position={'x':p['x'],'z':p['z']},state='placement-proposed',clearance='not-certified') for p in furnished.get('placements',[])]
  out.append({'roomId':row['roomId'],'floor':row['floor'],'roomName':row['name'],'authoredType':row.get('authoredRoomType'), 'profile':family,'recognition':'name/type heuristic; review custom rooms','visualIdentity':{'architecturalAccents':[crown,feature],'wallSuggestion':row.get('suggestedWallFinish'),'floorSuggestion':row.get('suggestedFloorFinish'),'agingTheme':aging},'interactionIdeas':[action1,action2], 'furniturePlacements':suggestions, 'constraints':{'studentAuthoredFinishesWin':True,'studentBlueprintImmutable':True,'preserveTravelAndDoorSwings':True,'automaticPlacementCollisionCertified':False},'exportStatus':'design-and-placement-plan; not baked/gameplay-certified'})
 return {'schema':'black-hollow.room-identity.v2','generatedBy':'room_identity_v2.py','sourceHauntSha256':source_hash,'policy':'Beautiful but Abandoned; preserve authored dimensions and materials','rooms':out,'limitations':['Room types are heuristic, not student-authoritative labels','Accents/interactions are recommended metadata until attached to GLB/runtime','Existing furnishing coordinates are not clearance certified','No generated playable behaviors asserted']}

if __name__=='__main__':
 a,b,o=sys.argv[1:4]; parent=Path(a).parents[1];src=parent/'source.haunt';sha=hashlib.sha256(src.read_bytes()).hexdigest() if src.exists() else None
 result=build(json.loads(Path(a).read_text()),json.loads(Path(b).read_text()),sha)
 Path(o).write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
 print(len(result['rooms']),'room identity records',o)
