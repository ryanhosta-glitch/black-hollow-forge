# Stair Route Clearance Gate — engineering checkpoint

This pass corrects a false-positive risk in the guided walk test. Before any guided ascent, the walk test now samples the full route at 8 cm intervals and checks capsule-width clearance against BOTH authored floor stair-room footprints. Turns exceeding 30 degrees are rejected because the current procedural route creates climbing treads around corners without a level landing. Degenerate segments and landing endpoint clearance are also rejected.

**Expected behavior:** The previously generated U-shaped test stairs are likely to be BLOCKED until real level turn platforms and a compliant stair design exist. This is intentionally safer than a false claim that a staircase works. The inspector pages and original exported meshes remain available. This is NOT the complete collision engine, and no routes are asserted as gameplay-certified.

Original student .haunt files are unchanged. The desktop and mobile controls remain.
