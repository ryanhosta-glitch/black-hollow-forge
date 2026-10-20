# Pass 1 — Door & Window Workshop

The compiler generates optional per-floor GLB components with Gothic window tracery, pane surrounds, authored door leaves, hardware and metadata declaring hinge anchors. They do **not** yet animate in the main game. The door leaf is a separate mesh but its origin is not its hinge pivot; the runtime must implement a hinge transform and collision-safe swing before activation. These overlays are not imported into the main floor collision mesh.

Open `navigation/door_window_workshop.json` to inspect IDs and limitations. Do not claim collision certification.
