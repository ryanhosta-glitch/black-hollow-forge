# Physical Walking Lab (experimental)

Open `walk_collision_lab.html` through an HTTP server (for example, GitHub Pages). The lab reads the student-authored room bounds and wall openings from the compiler collision JSON. It renders floor slabs and wall segments and simulates a 32cm-radius body using incremental swept 2D movement and wall penetration correction. WASD, arrows and touch arrows move; drag rotates the viewpoint. Gravity acts against the ground plane.

**Not certified:** Stair treads and landings are not traversed and no teleport is used; physics is simplified (vertical y fixed to ground) and not real mesh-accurate GLB collision. Doors are represented as gaps; moving door leaves, furniture clearance and multi-floor collision are pending. Repeated physical route checks still require browser testing. This module does not modify any `.haunt` file or game integration.
