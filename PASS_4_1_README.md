# Forge 4.1 — Victorian Geometry QA Sprint

The browser Universal CASA Compiler gains 10 named glTF PBR-style material slots, wall baseboards/cornices/rails, foundations, wall stiles, static furniture silhouettes for recognized furniture types, and sloping roof slabs for top-floor rooms. Full Forge 3.6 high-detail renderer is preserved separately and is **not yet unified**.

**Not certified:** roof intersection/holes, staircase traversal, furniture collision, game loader. Furniture markers use fractional room coordinates as a fallback and may need re-mapping for alternative blueprint schemas. Built models intentionally remain QA and `gameplayCertified:false`.

Browser verification and walking tests remain necessary.
