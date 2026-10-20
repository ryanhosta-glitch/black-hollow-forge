# Pass 4 — Room Identity Engine 2.0

* `room_identity_v2.py` provides a deterministic, reusable compiler for room intelligence + furnishing-plan JSON.
* `room_identity_v2.html` filters 26 room records by floor, functional type, and search terms.
* `houses/ferres-estate/navigation/room_identity_v2.json` exports stable room IDs, stylistic/architectural accents, aging themes, and interaction concepts with placement context.
* Suggestions never override student-authored dimensions, finishes, doors, or floorplans.
* New functionality is a planning layer, **not** yet new furniture geometry, gameplay interaction, or collision validation.
* Run for any compatible mansion with: `python room_identity_v2.py <room_intelligence.json> <furnishing_plan.json> <output.json>`.

Next: Pass 5 — Searchable Furniture & Discoveries, integrating discoverable contents with the furniture IDs.
