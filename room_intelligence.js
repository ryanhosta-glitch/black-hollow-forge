// Black Hollow Forge — reusable room intelligence. Never mutates the source blueprint.
export const ROOM_PROFILES = {
  "crypt": {
    "family": "burial",
    "suggestedWall": "carved stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "sarcophagus, funerary plaques, subdued lanterns"
  },
  "mausoleum": {
    "family": "burial",
    "suggestedWall": "carved stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "memorial tablets, niches, urns"
  },
  "laboratory": {
    "family": "laboratory",
    "suggestedWall": "wainscot and tile",
    "suggestedFloor": "stone",
    "furnishingIdea": "workbench, instruments, glass vessels"
  },
  "alchemist": {
    "family": "laboratory",
    "suggestedWall": "darkwood",
    "suggestedFloor": "stone",
    "furnishingIdea": "alchemical bench, retorts, specimen jars"
  },
  "cellar": {
    "family": "storage",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "barrels, shelving, storage bins"
  },
  "wine": {
    "family": "storage",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "bottle racks, barrels, cellar lighting"
  },
  "vault": {
    "family": "secured",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "iron cabinets, lockboxes, reinforced doors"
  },
  "library": {
    "family": "library",
    "suggestedWall": "darkwood",
    "suggestedFloor": "herringbone",
    "furnishingIdea": "bookcases, reading desk, ladder"
  },
  "study": {
    "family": "study",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "desk, writing accessories, bookcases"
  },
  "office": {
    "family": "study",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "desk, cabinets, lamps"
  },
  "ballroom": {
    "family": "entertainment",
    "suggestedWall": "damask",
    "suggestedFloor": "marble",
    "furnishingIdea": "chandeliers, mirrors, open dance area"
  },
  "parlor": {
    "family": "social",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "sofa, chairs, tables, fireplace"
  },
  "salon": {
    "family": "social",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "chairs, piano, fireplace"
  },
  "drawing": {
    "family": "social",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "seating groups, art, fireplace"
  },
  "dining": {
    "family": "dining",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "dining table, sideboard, sconces"
  },
  "kitchen": {
    "family": "service",
    "suggestedWall": "tile and wood",
    "suggestedFloor": "stone",
    "furnishingIdea": "worktables, range, pantry storage"
  },
  "pantry": {
    "family": "service",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "shelves, containers"
  },
  "bedroom": {
    "family": "sleeping",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "bed, dresser, wardrobe"
  },
  "nursery": {
    "family": "sleeping",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "crib, rocking chair, toys"
  },
  "bath": {
    "family": "hygiene",
    "suggestedWall": "tile",
    "suggestedFloor": "stone",
    "furnishingIdea": "basin, clawfoot tub, mirror"
  },
  "wash": {
    "family": "hygiene",
    "suggestedWall": "tile",
    "suggestedFloor": "stone",
    "furnishingIdea": "wash basin, cabinets"
  },
  "chapel": {
    "family": "ceremonial",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "pews, altar, candle stands"
  },
  "shrine": {
    "family": "ceremonial",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "altar, ritual fittings"
  },
  "observatory": {
    "family": "scientific",
    "suggestedWall": "darkwood",
    "suggestedFloor": "wood",
    "furnishingIdea": "telescope, maps, star charts"
  },
  "conservatory": {
    "family": "botanical",
    "suggestedWall": "iron and glass",
    "suggestedFloor": "stone",
    "furnishingIdea": "planters, botanical displays, paths"
  },
  "greenhouse": {
    "family": "botanical",
    "suggestedWall": "iron and glass",
    "suggestedFloor": "stone",
    "furnishingIdea": "benches, planters, irrigation"
  },
  "garden": {
    "family": "botanical",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "paths, planters, seating"
  },
  "attic": {
    "family": "storage",
    "suggestedWall": "aged wood",
    "suggestedFloor": "wood",
    "furnishingIdea": "trunks, old furniture, dust"
  },
  "tower": {
    "family": "vertical",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "narrow lighting, architectural railings"
  },
  "armory": {
    "family": "secured",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "display stands, locking cabinets"
  },
  "gallery": {
    "family": "exhibition",
    "suggestedWall": "damask",
    "suggestedFloor": "marble",
    "furnishingIdea": "frames, pedestals, benches"
  },
  "museum": {
    "family": "exhibition",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "cases, plaques, pedestals"
  },
  "theater": {
    "family": "entertainment",
    "suggestedWall": "darkwood",
    "suggestedFloor": "wood",
    "furnishingIdea": "seating, stage, curtains"
  },
  "theatre": {
    "family": "entertainment",
    "suggestedWall": "darkwood",
    "suggestedFloor": "wood",
    "furnishingIdea": "seating, stage, curtains"
  },
  "music": {
    "family": "entertainment",
    "suggestedWall": "damask",
    "suggestedFloor": "wood",
    "furnishingIdea": "piano, music stands"
  },
  "corridor": {
    "family": "circulation",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "sconces, occasional framed art"
  },
  "hallway": {
    "family": "circulation",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "sconces, occasional framed art"
  },
  "entrance": {
    "family": "circulation",
    "suggestedWall": "marble and damask",
    "suggestedFloor": "marble",
    "furnishingIdea": "entry table, sculptural details"
  },
  "foyer": {
    "family": "circulation",
    "suggestedWall": "marble and damask",
    "suggestedFloor": "marble",
    "furnishingIdea": "entry table, sculptural details"
  },
  "stair": {
    "family": "vertical",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "safe railings, no blocking furnishings"
  },
  "spiral": {
    "family": "vertical",
    "suggestedWall": "stone and iron",
    "suggestedFloor": "stone",
    "furnishingIdea": "safe railings, no blocking furnishings"
  },
  "elevator": {
    "family": "vertical",
    "suggestedWall": "brass and darkwood",
    "suggestedFloor": "stone",
    "furnishingIdea": "gate, control panel, clear landing"
  },
  "secret": {
    "family": "hidden",
    "suggestedWall": "darkwood",
    "suggestedFloor": "wood",
    "furnishingIdea": "concealed shelving, unobstructed hidden door"
  },
  "dungeon": {
    "family": "burial",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "ironwork, chains, sparse lanterns"
  },
  "prison": {
    "family": "secured",
    "suggestedWall": "stone",
    "suggestedFloor": "stone",
    "furnishingIdea": "bars, sconces"
  },
  "closet": {
    "family": "storage",
    "suggestedWall": "wood",
    "suggestedFloor": "wood",
    "furnishingIdea": "shelves, hooks"
  },
  "hall": {
    "family": "circulation",
    "suggestedWall": "wainscot",
    "suggestedFloor": "wood",
    "furnishingIdea": "sconces, unobstructed walking route"
  }
};
const PRIORITY = ["stair", "spiral", "elevator", "corridor", "hallway", "entrance", "foyer"];
export function classifyRoom(room) {
  const label = String(room.name||'').toLowerCase();
  const type = String(room.roomType||room.type||'').toLowerCase();
  const keys = [...PRIORITY,...Object.keys(ROOM_PROFILES).filter(k=>!PRIORITY.includes(k))];
  const category = keys.find(k=>type===k || type.includes(k) || label.includes(k)) || 'unclassified';
  const base = ROOM_PROFILES[category]||{family:'custom',suggestedWall:'neutral',suggestedFloor:'neutral',furnishingIdea:'Manual planning required'};
  return {roomId:room.id,category,...base,authoredWall:room.wallFinish??room.wallStyle??null,authoredFloor:room.floorFinish??room.floorStyle??null,
    wallFinish:room.wallFinish??room.wallStyle??base.suggestedWall,
    floorFinish:room.floorFinish??room.floorStyle??base.suggestedFloor,
    isSuggestionOnly:true};
}
export function planRooms(rooms) {return rooms.map(classifyRoom);}
