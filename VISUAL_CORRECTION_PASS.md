# Black Hollow Forge — Visual Correction Pass

Screenshot-driven corrections for the Estate / Ground Floor / Grand Entrance Hall viewer.

## Verified source-code defect

`gothicFixtures.populate(nav.rooms, verticalLevels)` previously ran **before** `verticalLevels` was computed from the authored floor heights. The fixture generator fell back to `floor * 3.048`, while exported GLB floors were translated using computed source-specific heights. This could make chandeliers float above or below their intended rooms.

## Changes

- Populate fixtures **after** deriving actual floor elevations from the student `.haunt`.
- Each fixture wrapper tracks its authored room/floor and follows Single Floor, Whole House, Exploded Floors, and special scene visibility; smoke synchronizes to visible fixtures.
- Correct explode-mode fixture vertical offset without modifying source geometry.
- Disable the debug grid on initial load (toggle remains).
- Default inspection lighting to Gaslit Twilight instead of Daylight; increase hemisphere ground illumination slightly to reduce featureless black surfaces.
- Update stale 0.9 / five-pass heading to 1.0 Visual Correction.
- Preserve the `.haunt` source and architectural GLBs intact.

## Limitations

The fixes are code-reviewed and syntax-tested but not yet rendered and inspected in a live browser. They do not replace mesh craftsmanship or verify that all chandelier meshes clear every architectural detail. Such validation needs before-and-after screenshots and direct on-device interaction.
