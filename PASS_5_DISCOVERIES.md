# Pass 5 — Searchable Furniture and Discoveries

- Data: `houses/ferres-estate/navigation/searchable_discoveries.json`
- Demo: `searchable_discoveries.html`
- Portable state engine: `discovery_runtime.mjs`
- 30 object records and 38 seeded, deterministic discoveries, with some empty spaces.
- Source `.haunt` SHA-256: `83ce1300ba6c0617591eea2b4851d5b2bafc1b7ecb2da994c9404266b51b4b3d` (unchanged).
- Interaction stages: open → search → read/take; save/load JSON; emitted events carry object, room, and item IDs.
- No canonical story mission linkage is invented. Game runtime must enforce reach, physics, quest prerequisites, and persistence; the demo does not do so.
- This pass does not modify exported floor GLBs.
