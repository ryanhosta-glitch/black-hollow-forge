# Black Hollow Forge — Final Stair Safety Gate checkpoint

This package adds a conservative **stair_safety_gate.html** and `houses/ferres-estate/navigation/stair_final_safety_gate.json`, recording prerequisite alignment, vertical gaps, and outstanding swept-player collision and headroom checks. All four routes remain NOT GAMEPLAY CERTIFIED. No production collision or unguided continuous stair movement was added in this checkpoint. Preserve the student .haunt; next development priority is exterior architectural quality.

# Black Hollow Forge — Structural Renaissance Preview

This checkpoint is an incremental, source-preserving foundation for the proposed ten-pass structural reconstruction. **It is NOT completion of all ten major passes.**

## Implemented and testable
- Same Forge `index.html`, GLBs, source `.haunt`, Main Hall, Conservatory and `playtest.html` as previous release.
- Improved `walktest.html` cross-room traversal through authored open doorway apertures, with E as fallback.
- Visible diagnostic tread/railing models in architect-authored stair rooms rather than empty rooms.
- Vertical stair links only offered when occupying a stair room; E remains a nonphysical floor transition.
- Named on-screen stair QA label and honest diagnostic caveat.
- Separate `RECONSTRUCTION_QA.json` with topology results and explicit unsatisfied physical gameplay criteria.

## Not implemented yet
Actual capsule collision on full GLB geometry, physically climbable stairs spanning floors, roof rebuild, new sculpted lions, botanical asset replacement, animation, runtime performance validation, or original game v8.5.19 integration. These require subsequent passes. The screenshots demonstrated all of these are material defects, not completed features.

## Running
Copy all files to GitHub Pages root. `/walktest.html` is the architectural collision preview, `/index.html` the decorated Forge model viewer, and `/playtest.html` the quest graph prototype. Requires online Three.js.


## Renaissance continuation — guided vertical stair traversal
- New destination buttons inside authored stair rooms, including bidirectional destinations when available.
- Choose the stair landing and hold W to follow a multi-segment path through the authored room footprint; player height changes in 28 increments and switches to the correct destination floor at the end. S reverses progress.
- This is a physically moving camera **guided inspection route**, NOT yet exact stair-tread collision or verified headroom. The game must not treat this as full stair validation.
- Existing door traversal, source .haunt, full estate and specialty GLBs preserved.
- Still pending: real aligned stair mesh, floor slab openings, capsule collider, exterior/roof reconstruction, assets/materials, browser QA.


## Structural staircase alignment checkpoint
The new `walktest.html` renders a temporary visible stair route when choosing a vertical connection. The visible treads and guided camera movement use the same sampled footprint path, including reverse travel. This addresses the mismatch where a QA route was invisible or unrelated to static stair props. The generated treads are a traversal visualization, not individually simulated collision geometry, and cut floor slabs and permanent connected stair assets are still pending. No changes to source `.haunt` data.


## Ceiling void and shaft alignment checkpoint
The first-person walk inspection now constructs ceiling undersides in ordinary spaces and reserves diagnostic ceiling voids in authored stair rooms with vertical links. It compares the horizontal footprint overlap of linked stair spaces and reports misalignment in Inspection diagnostics. These are **inspection-only** surfaces. Exported architectural GLBs are NOT cut, actual slab holes are not yet modeled, and guided stair routes remain distinct from true collision. Source `.haunt` unchanged.

## Landing guard engineering checkpoint
- Validates overlap of the **upper and lower** authored staircase footprints against a minimum clear landing envelope of 0.95 m × 1.20 m. The original source .haunt is unchanged.
- Generates `navigation/landing_audit.json` and marks undersized or nonoverlapping vertical connectors as blocked, not fully playable.
- The guided walk preview will show a blocked warning rather than invent a safe landing for failed entries.
- Does **not** yet generate a proper landing slab, test door approach vectors, cut exported GLBs, or perform capsule collision; `gameplayValidated` remains false.

## Landing Construction checkpoint
Generated `navigation/landing_construction.json` establishes non-destructive candidate platform footprints at both ends of every eligible authored vertical stair link; `walktest.html` renders both pads in the inspection scene. Failed overlap blocks the route. This is not a certified player path: door access, swept capsule clearance, actual GLB floor cuts and permanent collision remain outstanding. Source `.haunt` preserved.


## Landing approach audit checkpoint
- New `navigation/landing_approach_audit.json` tests every authored door-to-landing approach on both ends of each vertical stair connection. Requires sufficient authored door width, approach position inside the room, capsule-radius inset and an unobstructed straight footprint route to the landing center.
- Guided stair preview blocks links without an approach candidate at both ends. It reports specific geometric findings instead of proceeding by topology alone.
- Important: a footprint approach candidate does **not** certify real physical travel: furniture, hinges, 3D headroom, stairs, GLB cutouts and mesh colliders remain untested. `gameplayValidated` remains false. No original `.haunt` edits.


## New: Non-destructive landing repair planner
`houses/ferres-estate/navigation/landing_repair_plan.json` searches alternative landing-center positions **inside both authored stair footprints** with player-radius clearance and door approach checks. Each link is classified as keep existing, reposition candidate, or requires a supernatural connection. The walktest visual landing pad and guided stair route use the same selected repair center. It refuses connections without candidate geometry. This is a **repair plan and preview**, not a physical stair mesh exported into GLB, nor a gameplay certification. The original `.haunt` is not modified.


## Shared stair landing geometry checkpoint
`navigation/stair_geometry_contract.json` is the single source for eight exported stair landing pads and their identically positioned simplified collision proxies. Four `geometry/stair_landings_floor_XX.glb` models contain those pads in floor-local coordinates. `manifest.json` advertises the new assets. **The pads are auxiliary overlay models, not yet merged into floor GLBs or automatically drawn by the present viewers.** No stairs/ceiling cuts have been fabricated. All four flights remain BLOCKED for gameplay until a clearance-validated stair layout solver generates tread geometry and real cutouts. See `STAIR_CONTRACT_QA.json`. Source `.haunt` unchanged.


## Staircase parametric layout solver screening
Open `stair_audit.html` for design-space screening. `navigation/stair_layout_solver.json` records four links, room footprints, risers, candidate straight-switchback or spiral calculations and reasons for failure. This is **not exported stair geometry** and does **not** claim playable physical collision. No main floor GLBs or game scripts changed in this checkpoint. Any failed scheme requires revised routing or a supernatural access plan within the generated layer; original blueprint unchanged.


## New staircase candidate mesh export
Open `stair_candidates.html` to inspect modeled stair candidates. The new two-flight U-turn screening treats the end landings as different-floor approaches, rather than adding both landing depths to the full flight run. `navigation/stair_candidate_layouts.json` records the exported meshes and outstanding certification checks. These geometries are **not** integrated into the main GLBs, have **no permanent floor slab cuts**, and are **not gameplay-certified**.


## Stair Integration Safety Gate (current checkpoint)
- NEW `stair_integration.html` displays exported candidate staircase GLBs alongside authored landing pads and schematic two-floor surfaces. Turn pads/floors on or off for alignment inspection. **The candidate stair GLBs are not integrated into the permanent house floor GLBs.**
- NEW `navigation/stair_integration_gate.json` binds the four staircase candidates to their lower/upper room IDs, landing collision references, and blocking conditions.
- NEW `navigation/stair_tread_collision_candidates.json` provides local-space mesh bounding-box proxies. These are **not production-ready physics** (spiral geometry particularly).
- The safety gate explicitly blocks all four stairs until cut floor openings, world placement, door approaches, and player-sized swept collision are verified. Existing guided stair preview remains available. Original student `.haunt` is untouched.


## Estate-world stair placement checkpoint
New `stair_world_alignment.html` allows inspecting stair candidate GLBs placed at the authored stair-room midpoint and floor elevation, rather than only in local coordinates. `navigation/stair_world_placement.json` contains per-connection transforms, landings, authored shaft bounding rectangles, world AABBs, and difference between top of candidate mesh and upper floor. Four new world-space GLBs are included and referenced in the manifest. This DOES NOT cut permanent upper slab openings or certify player collision. The original `.haunt` is byte-identical.


## Stair slab cutout checkpoint
The exported floor GLBs for the upper stairwell levels now have stairwell openings cut in their stair-room floor slab geometry. `navigation/stair_slab_openings.json` is the per-opening collision handoff contract. Use `stair_slab_inspector.html` to inspect the modified GLBs. This is not a fully navigable staircase and does not pass gameplay certification; proper landing connection, collisions, and headroom checks remain.


## Stair continuity assembly
`stair_continuity.html` inspects a unified 3D GLB combining all four floor models (elevated into world space), four stair flight models, and deduplicated landings. The handoff contract `navigation/stair_continuity.json` verifies shaft containment and overlaps between upper landings and cut openings. This is NOT physical player collision certification. The original student .haunt is unchanged.


## Victorian Exterior Reconstruction
Added four externally positioned façade GLBs and roof dormer GLB. Viewer loads these as an additive exterior visualization layer, leaving modified staircase floor GLBs intact. Because the blueprint contains no authored windows, added windows are explicitly decorative blind elements, not architectural cutouts. The visual QA audit is at houses/ferres-estate/navigation/exterior_visual_audit.json. No claims of game collision or visual acceptance for these ornaments.


## Architectural five-pass push (new)
See ARCHITECTURAL_UPGRADE.md and ARCHITECTURAL_FIVE_PASS_QA.json. Real Forge-generated window cutouts are now placed in room walls for compatible blueprints. Prior stair data and extra inspector pages preserved. Structural roof and photoreal materials remain future work.


## Gothic Revival roof pass
The Forge compiler now applies Gothic Revival roof ornaments universally while preserving all authored roof type/rise/footprint data. Ferre Estate roof GLB and its manifest are regenerated. See GOTHIC_ROOF_PASS.md for limitations.
