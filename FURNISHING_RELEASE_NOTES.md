# Beautiful but Abandoned — room furnishing checkpoint

- Shared source `furnishing_engine.py` creates room-aware decoration overlays for all compatible house packages; `furnishing_inspector.html` currently previews Ferre’s Estate as the regression house.
- Floors 0–3 get separate *decorative* GLB overlays, with their own placement manifest.
- Deliberately leaves stairwells and corridors empty, stays toward room edges and avoids recorded door centers.
- No authored `.haunt` file or existing model was modified.
- Objects are lightweight Victorian proxy furniture, not polished original-game PBR assets. Placement is **not** physically collision-certified; furniture is intentionally NOT enabled by default in the gameplay walktest.
- Original game textures still need full baking/export integration.
- Upload the full extracted folder to GitHub repository root; use `furnishing_inspector.html` to review.
