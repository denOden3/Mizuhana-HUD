# Mizuhana Workspace — v0.8.0 testing build

[Install the testing userscript](https://raw.githubusercontent.com/denOden3/Mizuhana-HUD/main/mizuhana-testing.user.js)

Install this as an update to your existing Mizuhana script. The HUD header says **TESTING**. The stable file and its automatic update link remain separate, so friends using stable do not receive this experiment automatically.

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
- In **Map records**, record known regions and locations. Discovery stages are unknown → generic type → proper name → known details. Canonical names/anchors stay fixed; discovery, conditions and accessibility can change. Flexible local shops/homes are established once and reused.
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
