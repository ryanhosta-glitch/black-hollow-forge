# Clearance and game-preparation gate

The universal compiler now exports explicit evidence about player clearance instead of relying only on a room connectivity graph. It does not mark a package GAME READY.

## Prepared systems

- `forge_playability.mjs`: pure source-preserving room/capsule checks; same-floor overlap detection; conservative 22 cm grids with a 24 cm radius, 1.75 m player height and 5 cm wall allowance; connected free regions inside each room; matched portal width, alignment and approach checks; elevator arrivals; room entry and artwork/authored gameplay interaction approaches. Export compressed route waypoints. Room/cell caps fail closed.
- Stair safety stays explicit: unverified authored stairs are sealed and use the existing component elevator. The report verifies that the stair room is reachable through that fallback. This does not certify authored stair climbing. Existing signature Hall twin-flight traversal tests still pass.
- `forge_gameplay_contract.mjs`: safe locations for Founder, Seer, porcelain doll, spellbook, crystal ball and exit, excluding locked floors. Founder/exit prefer the main entry room. A one-room house stages roles at one clear interaction point, rather than stacking six objects. Authored anchors are preserved and route-checked. Role/ID conflicts are failures. No quest, portrait identity or Floor 13 unlock is silently invented.
- The gameplay binding helper requires the correct scene, room, height and proximity, checks standing clearance and emits an event for game-owned logic. All generated roles remain explicitly unbound until the actual game supplies assets and behavior.
- `forge_package_budget.mjs`: static GLB bytes, primitives, triangles/instances and texture-size reports with configurable project planning budgets. These are estimates, not measured draw-call/FPS promises. Metadata/ZIP overhead and repeated template placements are not fully modeled.
- The loader adapter reads the new reports and gameplay contract, exposes checked interaction/clearance helpers, and keeps full gameplay certification false.
- The walking lab shows static route results before WebGL starts and blocks unsafe preview entry. Furniture collision and analytic routes now use the same circle-versus-box primitive. Existing hinged-leaf logic is unchanged.

New exports: `qa/playability.json`, `navigation/walk_routes.json`, `gameplay/slots.json`, `qa/package_budget.json`, `qa/readiness_stages.json`. All have manifest references and are covered by the package SHA-256 inventory. Source input remains untouched.

## Verification

- Four populated student submissions: all static route checks and package planning budgets pass; each receives six prepared role locations. Nine empty submissions remain rejected.
- Real Navigation 2 + Three.js CPU harness: Bat Manor 9/9 controller paths; Moonveil 53/53; Haunted Estate 8/8; Aycers 19/19. The separate one-room fixture passes 3/3 paths. Tests include bidirectional doorway crossings, declared furniture collisions and no frame-to-frame teleports. Steering resets only yaw/speed at the existing position, never warps to a target waypoint.
- Exported GLBs are parsed with real GLTFLoader. Across the one-room and Moonveil fixtures, 26 + 613 positions pass downward floor support, vertical headroom and radial clearance checks at three heights. Additional three-lane rays check the exported shared apertures for decorative obstructions. This is sampled geometry evidence, not continuous mesh/capsule physics certification.
- Tests deliberately fail blocked elevator arrivals, split room regions, overlapping rooms, exhausted analysis budgets, bad gameplay locations, duplicate gameplay records, invalid/out-of-range/wrong-scene interactions and malformed/over-budget GLBs.
- Actual compiler handler is executed for complete exports. All new manifest dependencies and hashes are checked. The adapter loads a compiled fixture and emits a proximity-checked interaction event.
- Existing door/camera, signature GLTFLoader/Hall stair, decoration and interaction state suites pass.

Commands:

```
node forge_playability_test.mjs
node forge_controller_walkthrough_test.mjs /path/to/three.module.mjs [collection.json]
FORGE_TEST_EXPORT_DIR=/tmp/forge-physical-exports node forge_access_plan_test.mjs
node forge_mesh_clearance_test.mjs /path/to/three.module.mjs /path/to/GLTFLoader.mjs
node forge_decoration_test.mjs
node navigation2_viewer_test.mjs /path/to/three.module.mjs
node signature_scenes_test.mjs /path/to/three.module.mjs /path/to/GLTFLoader.mjs
node locked_study_3d_test.mjs
```

## Actual Black Hollow integration remains open

Inspected `ryanhosta-glitch/black-hollow-2` at `66dc1158628300418c0db17cef5019211ad38d10`. Its current entry point accepts .haunt/JSON and generates the scene in the game. Its architectural coordinates/player height use feet-scale world units, while the Forge GLBs are meters. The game has its own `buildWorld`, `collision`, `canTravel`, quest handlers, elevator logic and save state. Simply reading repaired.haunt from CASA and calling the existing loader would rebuild the house and would NOT fulfill the prepared-geometry workflow.

The remaining game work must load compiled assets, deliberately reconcile units, install the exported collider/door/elevator contracts, bind the six gameplay locations to existing quest handlers and preserve game saves/audio/haunting systems. No game repository files were changed in this pass. No claim is made that creating the Forge adapter completes these integrations.

The live Work browser can load Moonveil and its preparation report but clicking Start still reports `Error creating WebGL context`. The separate cloud browser also cannot reach a localhost workspace preview. New scene/UI behavior therefore needs a WebGL-capable browser check before merging. Leave this PR reviewable and unmerged until that gate is satisfied.
