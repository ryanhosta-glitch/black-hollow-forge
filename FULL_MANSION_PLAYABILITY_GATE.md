# Full Mansion Playability — Initial Gate

This release adds a conservative graph audit and route tracing page. It does NOT certify physical gameplay.

Run `python playability_route_gate.py houses/ferres-estate` (or specify another compiled house). Exit 2 signals a graph/manifest failure. Original .haunt stays unchanged.

An actual playable route requires continuous capsule-collision testing, stair headroom checks, threshold/swing clearance, and the same production physics shapes in Black Hollow.
