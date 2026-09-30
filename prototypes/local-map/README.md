# Mizuhana shopping-street prototype

A standalone proof of concept; no userscript installation and no Map-page or save changes.

## Try it

Download `mizuhana-shopping-street.html` and open it in a browser. It contains all its CSS and JavaScript and works offline. Alternatively, serve this folder and open `index.html`.

The starting seed is `mizuhana-shopping-01`. Enter another seed and choose **Generate street**. Reusing the same seed reproduces the road, 8–12 lots, five reusable building types, and trees exactly (generator v1). Click a footprint, or Tab to it and press Enter/Space, to view placeholder details. Selected buildings have a double contrasting outline, and keyboard focus has a dashed outline. On narrow screens the map scrolls horizontally and details move below it.

## Structure

- `street.js`: pure seeded generator, placeholder details, SVG renderer and delegated input handlers. Exposes `MizuhanaStreet.generate(seed)` and `mount(container)` in the browser, with CommonJS exports for tests.
- `street.css`: isolated styling using the HUD's semantic color-token names and Moriyama palette.
- `index.html`: separate responsive testing page.
- `mizuhana-shopping-street.html`: portable bundle of those three files.
- `street.test.cjs`: run with `node prototypes/local-map/street.test.cjs` from the repository root.

No dependencies, network requests, timers, random rerolls, storage writes, or hooks into the existing HUD. Coordinates are schematic and not canonical locations. The road is a densely sampled shallow sine curve; bounded lots follow its tangent in non-overlapping slots on each side. The generator uses string hashing and an integer PRNG, never Math.random.

## Validation

Verified seed fingerprint and repeatability; 1,000 seeds for counts, reusable types, bounds and lot overlap; actual mount handlers for click, Space, selection changes and regeneration using a small DOM double. SVG drawing rendered and inspected. Full browser/device visual and touch testing remains pending; these tests do not substitute for a browser.
