# Stair Transition Stage 3 — measured landing alignment

Reads the exported stair-world GLBs and the prior landing positions. Computes the last tread surface, measured vertical gap, and horizontal reach to the existing landing pad **for each connection**. Only makes a tiny non-playable visual candidate where the seam is close enough to investigate. No invented full landing, no blueprint changes and no gameplay certification.

Results: 
- connection_022: vertical rise 0.0447m, top-tread-to-pad horizontal gap 0.964m — BLOCKED_ALIGNMENT_REQUIRES_ENGINEERING
- connection_023: vertical rise 0.0447m, top-tread-to-pad horizontal gap 0.964m — BLOCKED_ALIGNMENT_REQUIRES_ENGINEERING
- connection_024: vertical rise 0.0793m, top-tread-to-pad horizontal gap 0.7267m — BLOCKED_ALIGNMENT_REQUIRES_ENGINEERING
- connection_025: vertical rise 0.0447m, top-tread-to-pad horizontal gap 0.964m — BLOCKED_ALIGNMENT_REQUIRES_ENGINEERING

Unresolved: collider route across last tread and upper-floor walking slab, safe floor edge, headroom, door clearance. Prior authored landings are *proposals*, not validated connected walkways.
