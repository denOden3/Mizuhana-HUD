# Mizuhana Workspace — v0.8.1 testing build

[Install the testing userscript](https://raw.githubusercontent.com/denOden3/Mizuhana-HUD/main/mizuhana-testing.user.js)

Install this as an update to your existing Mizuhana script. The HUD header says **v0.8.1 · TESTING**. The stable file and its automatic update link remain separate, so friends using stable do not receive this experiment automatically.

On first launch, the testing script copies the existing Mizuhana saves into a separate testing store and migrates every slot. The original stable store is left intact. Progress and configuration made while testing stay in the testing saves. [Reinstall stable](https://raw.githubusercontent.com/denOden3/Mizuhana-HUD/main/mizuhana.user.js) to return to the stable HUD and its saves. Keep one Mizuhana script enabled at a time.

## Try the workspace

1. Open Home and choose **Customize Tracker**. Toggle values, reorder them, try Energy/Satiety as number, bar, or both, and try compact/verbose clock labels. **Restore Default Tracker** restores the starting configuration.
2. Use the icon rail beneath the Tracker to open Location, Tasks, Current Look, Pet, Memo, Shopping Target, Inventory, Relationships, or Weather. Several compact panels can stay open. Clicking an icon jumps within the dock. The dock settings control changes panel visibility and order.
3. Choose **Expand**. The editor temporarily occupies the narration workspace. **Close** or Escape brings back the previous Home/Map state and reading position. Location opens Map; Current Look opens its appearance editor.
4. In Tasks, choose up to three tasks for the compact panel. Add/remove tasks without advancing time.
5. Save a Memo and checklist, toggle a checklist item, then reload and switch save slots. Each slot should retain its own notes, checklist, panels and Tracker choices.
6. Record a known item/price in Inventory, then add a Shopping Target. Leaving price blank uses that item's recorded price. Choose the compact target and check the remaining amount against current money. Unrecorded prices stay unknown.
7. Record a companion in Pet. Choose its compact fields and up to two actions. Actions are placed into the editable chat composer; they do not silently change bond or needs. No real-time absence decay is applied.

## Try the map

- Open Map and switch **Island / Region / Local**. Island geography follows the canonical crescent island and regional positions. Regional landmarks are fixed; local places and their records belong to the save.
- These are schematic maps, not surveyed maps or painted production assets. Coordinates position overlays on the drawings; travel times are only shown when recorded. Regional backgrounds render only for the active view.
- In **Settings → Advanced → Map Records**, record known regions and locations. Discovery stages are unknown → generic type → proper name → known details. Canonical names/anchors stay fixed; discovery, conditions and accessibility can change. Flexible local shops/homes are established once and reused.
- Use the 3×3 compass for contextual nearby destinations. Its center is the current node. Clicking a cell or marker selects information, without moving the character or changing time.
- **Plan Route** highlights recorded open connections. Close a route or destination and verify it is excluded. Conditions can record weather/tide dependencies. No live weather feed or automatic tide engine is connected in this build.
- **Go Here** places a travel request in the composer. Review and send it to the narrator to resolve travel.
- NPC markers appear only for recorded shared, scheduled, or last-known locations at known nodes. They are not live omniscient tracking.

## Narrator updates

In Settings → Advanced, use **Copy workspace narrator protocol** and paste it into the roleplay chat once. It adds the supported tasks, inventory, relationships, pets, weather and map fields to the existing state-block protocol. Empty systems display “Not recorded”; the HUD does not fabricate data to fill a widget.

## Check on desktop and phone

- Test all five themes and all three text sizes.
- Ensure the narration still scrolls internally, choices remain reachable, panel rails swipe horizontally and the dock scrolls vertically.
- Open an expanded editor on a phone and show the keyboard. The chat composer must stay outside the HUD; entered form values should survive resizing.
- Check desktop Destination has no outer vertical scrollbar and mobile Destination still scrolls. Its description remains justified.
- Check keyboard focus, selected states, save switching, and reloading.

## Verification completed

Syntax, migrated save isolation, slot separation, permanent local records, canonical anchor protection, unknown-location masking, route closures, narrator patches, panel dock behavior, memo/checklist storage, shopping prices, pet/travel requests, workspace scroll restoration, balanced editor markup and composer-bound calculations passed automated checks.

Calculated minimum reading contrast for the new panel/choice surfaces: Nagihama 4.95:1; Isanami 4.99:1; Moriyama 4.55:1; Hanaharumi 5.59:1; Mizuhana 7.18:1. Focus indicators also passed the 3:1 panel contrast check.

Actual desktop/phone visual and gesture testing is still pending. This is an experimental build, not a stable release.
## v0.8.1 — HUD Comfort & Map Interaction Polish

This testing-only pass caps the preferred HUD size to the visible space above the actual composer on desktop, compact, and mobile. It responds to composer growth, window resizing, and the mobile keyboard without rebuilding an open editor. When the composer cannot be found, a conservative protected area remains.

- Open every sidebar panel and scroll the dock until the last card is reachable. The icon rail remains separately swipeable and shows active panels.
- On mobile, scroll toward the top of the dock and continue toward the Tracker. Only the portion of a vertical gesture beyond the dock boundary transfers to the parent HUD; horizontal gestures and multi-touch are left alone.
- Island / Region / Local now share a segmented scale control. Each scale is directly keyboard-selectable, and selection has a border, underline, and stronger type.
- A single marker click selects details. A double-click enters the next geographic level when a known closer map exists. A double-click on empty map space picks the nearest eligible geographic anchor to the pointer. Local is the closest implemented level; no building interiors are invented.
- On touch devices, select a location then use the visible **Zoom in**, **Open Regional Map**, or **Open Local Map** controls. Ordinary tapping and scrolling never initiate travel.
- **Map Records** is now in **Settings → Advanced**. Close or Escape returns to Settings, including when opened from title-screen Settings. Existing records and route tools remain.
- The two technical map captions are gone; genuine descriptions and undiscovered-location messages remain.
- Island art support is ready but disabled until approved artwork exists. The current schematic remains the fallback. The development constant `ISLAND_MAP_ART` accepts an explicitly approved HTTPS asset aligned to the existing 1000 × 650 coordinate space. The image uses the same full-canvas transform as SVG routes and normalized HTML markers. Loading failure restores the schematic; regional/local views do not request island art. No artwork or canonical geography was changed.
- Character Creation was not started. The approved future identity interview and the broader Designing flow remain deferred.

Automated checks cover save isolation, three-layout/keyboard composer bounds, five-theme shared page markup, map-selection DOM stability, marker/pointer inspection, discovery masking, touch boundary transfer, Settings return, and artwork success/failure fallback. Existing Destination flow and mobile containment rules remain intact. The unchanged palettes passed text/background and focus contrast checks in all five themes.

Actual desktop/mobile rendering, composer usability, and touch/trackpad gestures still need player testing. Run `node tests/workspace.test.cjs` for the automated suite.
