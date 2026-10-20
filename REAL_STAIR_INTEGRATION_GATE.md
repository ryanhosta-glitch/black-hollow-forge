# Exported Stair Integration Gate

This checkpoint checks actual exported GLB stair meshes, their authored shaft placement, the upper-floor slab-cut status and the player route validation status. None of the staircases is claimed playable.

- connection_022: 19 meshes, gap 0.0447 m, blockers: UPPER_SLAB_UNCUT, CAPSULE_CONTINUITY_NOT_VALIDATED, FLOOR_TRANSITION_GAP
- connection_023: 19 meshes, gap 0.0447 m, blockers: UPPER_SLAB_UNCUT, CAPSULE_CONTINUITY_NOT_VALIDATED, FLOOR_TRANSITION_GAP
- connection_024: 18 meshes, gap 0.0793 m, blockers: UPPER_SLAB_UNCUT, CAPSULE_CONTINUITY_NOT_VALIDATED, FLOOR_TRANSITION_GAP
- connection_025: 19 meshes, gap 0.0447 m, blockers: UPPER_SLAB_UNCUT, CAPSULE_CONTINUITY_NOT_VALIDATED, FLOOR_TRANSITION_GAP

**Next engineering work:** exact floor slab voids, world-coordinate stair collider geometry, and deterministic capsule route tests using those same collision bodies.


## Follow-up shaft repair
The four targeted full-room floor panels have been removed from the exported floor GLBs. Review `STAIR_SLAB_REPAIR_QA.json`. The older gate above is historic (pre-repair); the geometry now has voids but no certified landing connections.
