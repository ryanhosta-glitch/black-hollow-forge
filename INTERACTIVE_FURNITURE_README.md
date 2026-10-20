# Interactive Victorian Furniture — showroom and interaction contract

Open `interactive_furniture_atelier.html` on GitHub Pages. The page demonstrates animated wooden drawers, hinged cabinet doors, a sittable reading chair, and an unsafe nursery chair that rejects sitting. All controls are mobile-friendly.

The reusable `interactive_furniture.js` module exports furniture state transitions, valid actions, and a game handoff contract. `houses/ferres-estate/navigation/furniture_interaction_proposals.json` identifies existing furnishing placements that *might* support interactions. These do **not** magically become interactive in the original Black Hollow runtime.

**Not completed:** physically validated chair sitting animations, collision meshes, furniture integration in GLB exports, actual room placement of the interactive models, persistence of opened drawers between sessions, or authentic antique texture baking. Existing furnishings are preserved; `.haunt` is untouched.
