# Grand Interior Detailing — additive geometry

This compiler pass constructs room-scaled wall panel frames, shallow baseboards, multi-layer crown cornices, slender doorway reveals, and low-profile ceiling rosettes. Every wall interval is segmented around original authored openings. Stairs, elevator shafts and outside spaces are excluded. The original `.haunt` is not changed. The objects are decorative and lack physical collision; true browser appearance, clearance, and runtime GLB material fidelity require inspection.

Rebuild using `python forge.py houses/ferres-estate/source.haunt OUTPUT_DIRECTORY`. Existing compiled reference floors in the release are rebuilt below.


{
  "floor_00.glb": {
    "panelRails": 284,
    "cornices": 58,
    "doorReveals": 27,
    "medallionPieces": 3,
    "totalMeshes": 1074
  },
  "floor_01.glb": {
    "panelRails": 272,
    "cornices": 70,
    "doorReveals": 33,
    "medallionPieces": 12,
    "totalMeshes": 1445
  },
  "floor_02.glb": {
    "panelRails": 272,
    "cornices": 68,
    "doorReveals": 30,
    "medallionPieces": 12,
    "totalMeshes": 1434
  },
  "floor_03.glb": {
    "panelRails": 276,
    "cornices": 66,
    "doorReveals": 27,
    "medallionPieces": 12,
    "totalMeshes": 1427
  }
}