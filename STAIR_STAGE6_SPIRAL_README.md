# Stage 6 — Spiral 024 approach redesign

Rebuilt a *preview-only* connector within authored stairwell bounds, widening lateral support from 0.504 m to 0.72 m. Its position is derived from measured exported tread and landing bounds. The source .haunt and original stair mesh were **not modified**.

**Important:** The authored final tread is 0.564 m wide laterally, less than the 0.64 m capsule diameter under Stage5’s conservative full-footprint rule. Thus this pass addresses the connector bottleneck but cannot certify transition from tread to connector. Source coordinate transforms, triangle-based support, headroom and game collision remain unverified.

All four staircases remain uncertified. The Stage6 preview GLB is not installed as a gameplay collision surface.
