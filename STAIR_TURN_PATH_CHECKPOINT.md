# Black Hollow Forge — Landing-Aware Turn Checkpoint

The prior ramp candidate contained two 0.6753 m plan-distance jumps at each switchback's half-landing. This checkpoint preserves original tread-center vertices, inserts intermediate 3D route samples at each turn, and exports preview GLBs.

**Critical:** Subdividing a line alone does not create supported floor area, repair headroom, or install physics. The preview GLBs are diagnostic centerlines, not walking collision meshes. The exported landing mesh must be sampled for actual support under a capsule, then the generated colliders must be tested with Rapier. Missing shaft clearance or headroom are blockers, not automatically repaired. No staircase receives gameplay certification here.

See `houses/ferres-estate/navigation/stair_turn_path_candidates.json` and `stair_turn_path_qa.json`.
