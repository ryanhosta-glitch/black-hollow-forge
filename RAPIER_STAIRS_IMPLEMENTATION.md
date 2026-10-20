# Rapier Stair Physics — implementation checkpoint

- New `rapier_stair_lab.html` is a 3D real Rapier physics character-controller **calibration test scene**: separate visible treads, a continuous triangular-mesh ramp proxy, lower/upper floors, kinematic capsule, collision-based movement, autostep, gravity, slope limit, ground snapping, mobile keys and display overlay.
- Keyboard: W/S forward/back, A/D rotate, Q/E strafe. On mobile, touch buttons and swipe canvas to turn. Autowalk tests traversing the sample ramp.
- Rapier version locked to @dimforge/rapier3d-compat 0.17.3 via jsDelivr; Three.js 0.170.0 via jsDelivr; both require network.
- The prototype intentionally does NOT wire onto student stair routes (four remain NOT CERTIFIED). Existing GLBs are unchanged.
- Physics proxy is generated geometry, not the source architectural model; rendering the detailed treads independently tests the architecture/gameplay separation.
- **Pending actual browser verification**: CDN import compatibility, collision ascent/descent, landing transition, capsule clearance, and safe fit of collision proxy in each authored shaft. Do not claim playable mansion stairs until validated.
- To install on actual estate: derive each flight centerline from stair GLB tread surfaces, fit proxies inside the authored shaft, generate collision for rails/posts/ceiling and landings, confirm entrance/exit, and verify real browser traversal both directions. For spiral stairs follow the curve with segmented surfaces (never a direct straight ramp).
