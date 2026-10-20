# Black Hollow Forge — External Stair Systems Research and Implementation Decision

## Decision
Use **dual geometry**: original authored stair GLBs remain the visible architecture; compiler-produced simplified collision shapes serve the walking controller. The physics proxies must never erase, replace, widen, or silently move the student's source design. Reject routes that cannot fit.

## Engine lessons (external research)
- **Unity CharacterController** explicitly handles step offsets, slope limits and skin width. Too-small contact skin produces sticking. [Unity](https://docs.unity.com/en-us/engine/6000.0/manual/physics-section/physics-overview/character-control-section/class-character-controller)
- **Rapier JavaScript Kinematic Character Controller** exposes `enableAutostep(maxHeight, minWidth, includeDynamicBodies)` and `enableSnapToGround(distance)`. Auto-step requires a reachable horizontal top surface, not just a low riser. [Rapier](https://rapier.rs/docs/user_guides/javascript/character_controller/)
- **Godot CharacterBody3D** uses floor snapping to keep a body grounded. [Godot](https://docs.godotengine.org/en/stable/classes/class_characterbody3d.html)
- **Unreal** separates simple and triangle-mesh collision: visual details need not be the walkable collision mesh. [Unreal](https://dev.epicgames.com/documentation/en-us/unreal-engine/simple-versus-complex-collision?application_version=4.27)
- **three-mesh-bvh** allows collision intersection against original mesh triangles for *verification* of new generated proxies. Beware local vs world coordinates. [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)

## Proposed Forge implementation
1. Obtain an **authored stair centerline** or extract one from verified tread elevations and polygons, in estate-world coordinates, not guessed from the candidate bounding box.
2. Build a strictly local **walking-surface proxy**: one inclined hull or piecewise walkable planes for straight/switchback flights; arc-following convex segments for spirals. No shortcut through the spiral's empty center.
3. Include **real walls, rails, posts and ceiling slabs** as blocking collision. Simplifying steps does not grant permission to walk through architecture.
4. Character settings are *initial tuning candidates*, not validated defaults: radius 0.32 m, height 1.74 m, step offset 0.22 m, skin 0.02 m, downhill snap 0.25 m; cap slope conservatively and tune with automated routes. Rapier autostep can only operate when grounded.
5. For landing seam, test both **horizontal continuity** and **height continuity**. Add a connector only if verified to stay within student geometry, avoid the shaft void, and not create an unrequested shortcut.
6. Run walk simulation 3× each direction at slow/fast speeds and multiple fixed time steps; log capsule height, contact normal, headroom, lateral drift, velocity, collision separation and ground status.
7. A corridor is **certified** only after both GLB geometry tests and a continuous real browser motion trace pass with no teleports, wall penetrations, unsupported steps or clipping.

## Important
The four actual Ferre's Estate stair routes are **NOT gameplay certified**. Earlier union-footprint tests were preliminary; they don't establish stair headroom, usable character-controller movement, or correctness of original triangle collision. This pass is a documented engineering strategy and diagnostic, **not a purported completed physics solution**.

## Specific action on each route
- **connection_022 (switchback)**: measured continuous sloped proxy plus solid room/shaft boundaries; landing separation 0.964 m, vertical seam 0.045 m. Still uncertified.
- **connection_023 (switchback)**: measured continuous sloped proxy plus solid room/shaft boundaries; landing separation 0.964 m, vertical seam 0.045 m. Still uncertified.
- **connection_024 (spiral)**: sampled curved walkline with segmented convex proxies, never straight shortcut; landing separation 0.727 m, vertical seam 0.079 m. Still uncertified.
- **connection_025 (switchback)**: measured continuous sloped proxy plus solid room/shaft boundaries; landing separation 0.964 m, vertical seam 0.045 m. Still uncertified.
