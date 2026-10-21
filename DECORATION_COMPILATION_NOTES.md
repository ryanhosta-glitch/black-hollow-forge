# Furnished CASA and cemetery preparation

The universal browser compiler now packages a deterministic decoration plan, detailed shared furniture GLBs from the existing Victorian catalog, framed WebP photographs, warm fixture geometry, a static light plan, and cemetery grounds. It retains the original source and adds a separate decoration change report. Existing access and signature navigation remain intact.

## Five passes delivered

1. Catalog furniture: six reusable detailed models, role-aware placement, no generated furniture on circulation/stair/crypt routes, explicit collision bounds. The planner conservatively reserves portal routes, leaf sweeps and arrival areas. Authored supported furniture retains position, object ID and metadata; unsafe placements are retained and flagged. Unsupported types or ambiguous rotations remain in source and the issues report and block readiness rather than being silently replaced.
2. Artwork: seven verified shipped monochrome WebP photographs, one allocation per artwork per house, brass frames and inspect anchors. The older default photo allocator no longer selects seven missing color files. No portrait is silently assigned Founder/Seer quest behavior. Authored decoration records needing binding are preserved in source and reported.
3. Cemetery: four stepped/arched/cross/obelisk headstone forms, three angular skeletal tree forms, paths from ground-level exterior portals, a perimeter clearance zone and terrain outside the house envelope. Ground elevation follows the main/ground floor rather than the basement. Deterministic bounded density, with physical object records. These are procedural cemetery assets, not photorealistic tree scans.
4. Finishes/performance: existing Victorian carvings, velvet and brass furniture reused, warm hanging fixture geometry, shared furniture templates in exports, grouped cemetery material draws, instancing in inspection rendering and at most three new point lights per visible floor. No new shadow maps or FPS claims. Static lighting preparation is exported; lightmaps are not baked.
5. Compile/validate: all referenced furniture/art resources packaged and included in the SHA-256 inventory. Export includes `decoration/plan.json`, `navigation/decoration_collision.json`, `navigation/interactions.json`, `lighting/static_plan.json`, `qa/decoration.json`, `qa/decoration_changes.json`, `geometry/decoration.glb`, and `geometry/artwork.glb`. Manifest advertises `EXT_texture_webp`. Game adapter loads placements and extra geometry and exposes `decorationCanOccupy` for the consumer's architecture collision callback.

## Inspection

Forge → import house / furnishings and elevator test → Try Moonveil → Start in Grand Hall. The house floors now use the same placement plan and existing furniture catalog, artwork textures and cemetery shapes. House furniture collision is wired into the Navigation 2 `canOccupy` callback. Signature Hall/cabin behavior remains separate. Grounds are exported for game-side exterior support; this lab does not certify outdoor walking.

Moonveil: 7 furniture objects, 7 unique portraits, 56 cemetery objects, main ground at 3.048 m, 12/12 rooms reachable through 3 house elevator entrances. One-room fixture: 1 portrait and 37 cemetery objects; furniture is deliberately omitted where clearance checks leave no safe catalog footprint. Small rooms do not get forced clutter.

## Validation and remaining gate

Passed deterministic/source-preservation checks; route, sweep and elevator-arrival clearance; colliders for furniture; real WebP headers and <100 KiB photo budgets; varied cemetery forms; main floor elevation; actual compiler export/package dependency and SHA-256 checks; student batch; Navigation 2 regressions; signature GLTFLoader/twin-stair regression; interaction state suite; six furniture GLBs parsed with real GLTFLoader; syntax/whitespace checks.

The Work browser can load the live Moonveil access UI, but attempting Start in Grand Hall reports `Error creating WebGL context`. Its separate browser cannot reach the workspace localhost server either. New visual changes are therefore NOT browser-rendered verified. Do not merge this visual PR until a WebGL-enabled browser confirms the new scene and texture appearance, furniture and doorway clearance, stairs/elevator behavior and acceptable responsiveness.

Physics certification, quest integration and full legacy game loader remain pending. Unsupported authored placements/decorations are not certified. No full GAME READY claim is made.

Rebuild templates: `node tools/build_furniture_assets.mjs /path/to/three.module.mjs`.
Checks: `node forge_decoration_test.mjs`; `node forge_access_plan_test.mjs [collection.json]`; existing navigation and signature test commands.
