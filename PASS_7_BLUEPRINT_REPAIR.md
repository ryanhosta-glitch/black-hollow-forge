# Pass 7 — Blueprint Repair Intelligence

Run `python blueprint_repair_intelligence.py houses/ferres-estate/source.haunt --output houses/ferres-estate/blueprint_repair_report.json`.

The report is **non-mutating**, with stable issue IDs, severity-ranked recommendations and original source SHA256. It checks room dimensions, identifiers, opening positions, shared-door pairing, simple floor door-graph connectivity and game-entry references. It does **not** establish collision, freeform open-plan edges or cross-floor stair continuity, and never applies repairs without approval. View `blueprint_repair.html` on GitHub Pages.
