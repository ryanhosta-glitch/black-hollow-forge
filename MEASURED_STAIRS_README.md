# Measured stair upgrade

The walk-test now samples the visible stair run by actual accumulated horizontal length, rather than treating every route segment as an equal distance. It moves at a distance-based rate and refuses stair tests with a riser over 0.19m, tread under 0.25m, or clear width under 0.8m. Stair geometry is still a guided visual test and not mesh collision or certified headroom.

Open stair_feasibility.html for per-link diagnostics. The original blueprint was not changed.
