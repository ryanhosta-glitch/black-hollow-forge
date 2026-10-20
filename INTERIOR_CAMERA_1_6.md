# Black Hollow Forge 1.6 — Automatic Interior Room Camera

Selecting an estate room now automatically switches to Single Floor view and places the camera inside its authored bounding rectangle at eye height (~1.62 m, constrained by ceiling height). Camera target looks toward the far interior corner. The original layout and all GLB files remain unchanged. The Room camera preset also resets to this interior view. Front, Side, Detail, Overhead, Fit Scene presets remain available for inspection.

Limitations: This camera placement uses student room bounds, not raycast clearance against furniture or doors. It is an inspection camera, not collision-certified player movement. Verify sight lines in browser for unusually narrow or furnished rooms.
