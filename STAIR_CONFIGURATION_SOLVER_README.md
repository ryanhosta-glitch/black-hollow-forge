# Staircase Configuration Solver — Pass 1

Run: `python multi_stair_solver.py houses/ferres-estate/source.haunt houses/ferres-estate/navigation/stair_layout_solver.json houses/ferres-estate/navigation/stair_multi_layout_solver.json`

This executable solver evaluates straight, L, U, three-flight, and spiral footprint envelopes with 90° rotations for existing discovered stair links. The prior stair link report supplies the authored width/depth/rise and room IDs. Full architectural geometry, entry/exit, collision, overhead clearance, slab cuts and code compliance remain NOT verified.

No student-authored source is modified. A footprint-fitting candidate is not an actual built staircase or proof of gameplay reachability. Import from additional student houses requires that house's own stair-link discovery data; this release does not claim universal `.haunt` compatibility for the input adapter.

Open `stair_configuration_solver.html` on GitHub Pages for a mobile-friendly comparison.
