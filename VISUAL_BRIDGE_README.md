# Black Hollow Visual Bridge — Source-based checkpoint

This checkpoint ports the actual `floorTexture`, `wallTexture`, and `renaissanceWoodTexture` texture algorithms and their helpers from the original v8.5.19 game HTML into a standalone ES module loaded by the Forge **viewer**.

The Forge viewer now applies original-game algorithms to named **damask, wood, stone** meshes, with the existing Forge procedural fallback used for unmapped textures. The original game's **herringbone** function is extracted for later room-level mapping but is not applied indiscriminately to every wood surface.

This is not a GLB texture bake, and it does not alter room collision or blueprint data. Marble, glass, slate, plants, lighting, and more exact visual equivalence need a subsequent pass. Material assignment currently uses Forge mesh naming heuristics, not complete room identifiers, so some surfaces may remain visually inconsistent. The game source is read-only; not included in the distributed ZIP.

Open `index.html` through GitHub Pages or an HTTP server; the bridge is an ES module and should not be opened over file://.
