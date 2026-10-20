/** Black Hollow Forge — frame / artwork configuration seed.
 * This module is DATA + selection policy, not automatic frame placement.
 * 40 distinct canonical artworks are required before enabling house-wide dressing.
 */
export const FRAME_COLLECTION_POLICY = Object.freeze({
  version: '2.3-seed',
  monochromeOnly: true,
  artworkUniqueness: 'canonical-id-per-house',
  artworkTarget: 40,
  enableAutoPlacement: false,
  styleFallback: 'mahogany_library',
  emptyLibraryBehavior: 'leave-wall-empty',
  preserveStudentArchitecture: true
});
export const FRAME_STYLE_PRESETS = Object.freeze({
  gilded_grand: {label:'Gilded ancestral', shape:'rectangle', material:'aged-gilt',borderMeters:.105,depthMeters:.095,ornament:'crest',rooms:['entrance','grand_hall','ballroom','gallery']},
  mahogany_library: {label:'Carved mahogany',shape:'rectangle',material:'mahogany',borderMeters:.085,depthMeters:.085,ornament:'subtle-beading',rooms:['library','study','hall','bedroom']},
  mourning_oval: {label:'Black mourning oval',shape:'oval',material:'ebonized-wood',borderMeters:.095,depthMeters:.075,ornament:'top-flourish',rooms:['nursery','bedroom','parlor','gallery']},
  brass_botanical: {label:'Scientific brass',shape:'rectangle',material:'tarnished-brass',borderMeters:.06,depthMeters:.06,ornament:'none',rooms:['conservatory','laboratory','library','study']}
});
export const ROOM_FRAME_RULES = Object.freeze({
  entrance: {styles:['gilded_grand','mahogany_library'],categories:['portrait'],maxPerRoom:3,density:.30},
  grand_hall: {styles:['gilded_grand'],categories:['portrait'],maxPerRoom:5,density:.48},
  gallery: {styles:['gilded_grand','mourning_oval'],categories:['portrait','botanical'],maxPerRoom:8,density:.73},
  library: {styles:['mahogany_library','brass_botanical'],categories:['portrait','botanical'],maxPerRoom:4,density:.48},
  study: {styles:['mahogany_library','brass_botanical'],categories:['portrait','botanical'],maxPerRoom:3,density:.40},
  conservatory: {styles:['brass_botanical'],categories:['botanical'],maxPerRoom:4,density:.50},
  laboratory: {styles:['brass_botanical','mahogany_library'],categories:['botanical'],maxPerRoom:4,density:.46},
  bedroom: {styles:['mourning_oval','mahogany_library'],categories:['portrait'],maxPerRoom:2,density:.30},
  nursery: {styles:['mourning_oval'],categories:['portrait'],maxPerRoom:2,density:.22},
  hall: {styles:['mahogany_library','mourning_oval'],categories:['portrait'],maxPerRoom:2,density:.28},
  corridor: {styles:['mahogany_library'],categories:['portrait'],maxPerRoom:2,density:.20},
  default: {styles:['mahogany_library'],categories:['portrait'],maxPerRoom:1,density:.16}
});
/** Canonical identities map variant files to ONE artwork. Variants cannot bypass reuse prevention. */
export const PORTRAIT_ART_SEED = Object.freeze([
  ['hooded_wraith','hooded_wraith_bw.webp',['crypt','gallery','hall']],
  ['gothic_family_wolf','gothic_family_wolf_bw.webp',['gallery','hall','library']],
  ['vampire_countess_pair','vampire_countess_pair_bw.webp',['gallery','parlor','study']],
  ['vampire_lord_chair','vampire_lord_chair_bw.webp',['gallery','library','study']],
  ['occult_noble_pair','occult_noble_pair_bw.webp',['study','library','gallery']],
  ['victorian_ancestor_portrait','victorian_ancestor_portrait_bw.webp',['gallery','hall','study']],
  ['electrified_madman','electrified_madman_bw.webp',['laboratory','study']]
].map(([id,file,roomBias])=>Object.freeze({id,canonicalId:id,url:'assets/portraits/'+file,category:'portrait',roomBias,orientation:'portrait',blackWhite:true,onePerHouse:true,weight:1})));
/** Botanical entries are reserved placeholders, NOT converted or deployable assets. */
export const BOTANICAL_ART_PENDING = Object.freeze([
  'venus_flytrap_ellis_1769','sundew_darwin_1875','cobra_lily_1920',
  'pitcherplant_macfarlane_1908','pitcher_flower_details_1908',
  'nepenthes_rafflesiana_1824','butterwort_sturm',
  'bladderwort_britton_1913','sarracenia_clusius_1601','sundew_flora_batava'
].map(id=>Object.freeze({id,canonicalId:id,category:'botanical',status:'pending-image-file',blackWhite:true})));
export function canonicalArtworkId(art){
  return String(art?.canonicalId||art?.id||'').replace(/(?:_bw|_color)$/,'');
}
export function createHouseArtworkRegistry(artworks=PORTRAIT_ART_SEED){
  const used=new Set();
  return {
    claim(criteria={}){
      const room=criteria.roomType||'';
      const categories=criteria.category?[criteria.category]:null;
      const candidates=artworks.filter(a=>a.blackWhite===true && a.status!=='pending-image-file' && a.url && !used.has(canonicalArtworkId(a)) && (!categories||categories.includes(a.category)));
      const preferred=candidates.filter(a=>a.roomBias?.includes(room));
      const chosen=(preferred.length?preferred:candidates)[0]||null;
      if(chosen) used.add(canonicalArtworkId(chosen));
      return chosen;
    },
    reserve(artworkId){const key=canonicalArtworkId({id:artworkId});if(!key||used.has(key))return false;used.add(key);return true;},
    get usedIds(){return [...used];},
    get remaining(){return artworks.filter(a=>a.url&&!used.has(canonicalArtworkId(a))).length;}
  };
}
export function selectFrameRule(roomType){return ROOM_FRAME_RULES[roomType]||ROOM_FRAME_RULES.default;}
export function artworkLibraryReady(artworks=PORTRAIT_ART_SEED){return new Set(artworks.filter(a=>a.url&&a.blackWhite).map(canonicalArtworkId)).size>=FRAME_COLLECTION_POLICY.artworkTarget;}
export function mayAutomaticallyPlaceFrames(artworks=PORTRAIT_ART_SEED){return FRAME_COLLECTION_POLICY.enableAutoPlacement && artworkLibraryReady(artworks);}
