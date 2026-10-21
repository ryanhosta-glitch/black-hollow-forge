# Navigation 2.0 migration audit — 2026-10-21

## Verified by source inspection

- **WORKING REFERENCE:** `navigation2_victorian_lab.html` contains tested continuous W/S locomotion, A/D turns, automated doors, visual collider checking, camera obstruction retraction and temporary doorway camera dip. This page remains the baseline.
- **GAME PREVIEW ONLY:** `black_hollow_navigation_game_preview.html` is an independent copy of the controller; it is not the full Black Hollow game. It is not yet importing the newly compiled navigation collision / door contract to drive physics, but builds estate wall colliders locally from room openings.
- **LEGACY STILL ACTIVE:** `index.html` imports `createCinematicWalkthrough` from `forge_cinematic_walkthrough.js`. The old viewer controller has NOT been removed or replaced. Removing this import without integrating the scene and UI lifecycle would break the current main page.
- **FORGE COMPILER:** `universal_casa_compiler.html` now exports repaired source, doorway metadata, walls, preliminary stair geometry, stair shafts, roof cap, repair logs and reachability QA. The compiler still labels `gameplayCertified:false`, appropriately.
- **BRIDGE FIXED IN THIS PASS:** `game_import/forge_house_adapter.mjs` previously required `manifest.integrity` and `boundsFeet`, which older house packages supply but the Forge 5.2 compiler does not. It now accepts both `bounds` and `boundsFeet`, and retrieves collision, doorway, and stair resources when provided.
- **DISCOVERY FIXED IN THIS PASS:** main Forge tools drawer now directly links to the Nav2 lab, game preview and current compiler.

## Remaining migration blockers

1. Replace the old `createCinematicWalkthrough` wiring on `index.html` with a standalone shared Navigation 2.0 controller module, preserving active Forge scene, input, player, camera, and feature lifecycle. Only remove old source after functional equivalence is demonstrated.
2. Make game preview and game import use the compiled `navigation/collision.json` and `navigation/doorways.json` as authoritative collision and door data. Present preview uses hard-coded rebuilding logic.
3. Complete and certify continuous staircase traversal on generated stair meshes: preview's separate guided stair mode does not mean gameplay stair physics is integrated.
4. Verify the compiled GLB's model-space collisions correspond with repaired door aperture, stair cutouts and roof meshes; QA reports currently check blueprint geometry and connectivity, not live Three.js contact resolution.
5. Reconcile dynamic doors, camera occlusion, furniture collision, exterior shell and actual player radius across compiler and game.
6. Perform a real browser test of a freshly compiled CASA exported from an uploaded .haunt, using the game importer. `loadForgeContract` loads a published directory, not .casa ZIP directly.
7. The original Black Hollow v8.5 game's scripts are not in this repository. Replacing its movement code cannot be claimed from edits to Forge alone.

## Safety policy

Do not delete legacy controller until the main Forge page and separate game have migrated, passed regression tests, and retained a rollback. Do not claim GAME READY while physics certification is false.
