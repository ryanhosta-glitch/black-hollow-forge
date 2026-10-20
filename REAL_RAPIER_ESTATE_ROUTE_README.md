# Ferre’s Estate — derived stair collision routes

This build extracts tread positions directly from four exported `stair_world_connection_*.glb` files, transforms them to estate-world coordinates, and generates small inclined collision-candidate segments between successive tread centers. The original ornate staircase models and source `.haunt` are untouched.

Inspect `houses/ferres-estate/navigation/stair_rapier_route_candidates.json` for ordered path positions and per-segment blockers. The preview GLBs are in `houses/ferres-estate/geometry/stair_collision_candidate_*.glb`.

**Do not enable the collision candidates in gameplay.** In particular, turn transitions, endpoint landings, physical sweep tests, and overhead clearance have not been certified; any shaft/segment failures are included in the report. Inclined collision strips may not reliably handle sharp switchback and spiral turns without correctly sized intermediate landing surfaces.

The next step is to construct landing-aware physical collision shapes and exercise a Rapier player capsule in a real browser/physics run, with passing ascending and descending paths.
