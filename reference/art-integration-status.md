# Asset integration audit — 2026-11-17

This is the Inhabit **v2** Expo app at `/Users/apple/dev/hatchling`
(`IbrahimDoba/inhabit-v2`). The old Swift garden assets in
`~/Documents/dev/inhabit` are a different art direction and are not used here.

## Current batch, from ART-PLAN.md priority order

1. **P0 dragon stages:** teen and grown turnarounds, five expressions each,
   idle / journey walk / garden stroll / water / sleep animation strips.
2. **P0 young sleep:** replace the baby-looking sleep with the long-necked young
   character; preserve the old animation as a source rather than overwriting it.
3. **Colour variants:** recolour the new lavender material to blue with the
   existing local script, preserving mint, gold and alpha.
4. **First house:** matching empty day/night room backdrops plus a starter bed,
   rug and unlit/lit lamp. Add the room entry and furniture toggles after the
   assets are generated.
5. **Integration and animation:** feet-aligned pose changes, growth-specific
   portraits, widget stills, sleeping on the bed, light changes and furniture
   transitions. Keep the existing baby/young video loops.
6. **Then test:** typecheck, lint, unit tests, native emulator play-through,
   recording and frame review. Fix defects found during that pass.

## Generation method

Built-in image generation, conditioned on `assets/approved/dragon-young-sheet.png`
and then the new stage's turnaround. No Higgsfield API calls or expired-trial
assumptions. Prompts: `assets/prompts/codex-stage` and `codex-house`.
Raw outputs: `assets/generated/codex-stage` and `codex-house` (gitignored).
`prepare-codex-stage-art.py` cuts generated frames and assembles transparent
animated WebPs; it does not draw substitute characters. These are four-frame
illustrated cycles, not newly generated Seedance videos. The first frame is the
Reduce Motion fallback. The existing colour script makes the blue set.

## The remaining wish list is not this batch

The art plan also lists P1 reaction clips, eleven outfit sets, shop decorations,
four additional plant species, eight purchasable room furnishings, seaside and
forest worlds, badges and marketing art. P2 includes more poses, upgrades,
seasonal content and postcards. Keep those entries open until their assets and
product behavior are actually present; do not mark the entire plan complete on
strength of the launch-stage art pass.

## Completed verification

- iPhone 17 simulator, installed v2 dev client (`com.ibrahimdoba.inhabit`),
  served by the v2 Metro bundle. Played the actual native app using XCUITest
  taps and drags; did not substitute the old Swift target or a web mockup.
- Checked baby/young/teen/grown stage selection, teen/grown portraits and home
  art, teen journey walking, teen/grown garden stroll and watering, and the
  corrected young sleep plus grown sleep on the bed. Reviewed exported native
  recording frames for pose changes and transparent compositing.
- Placed/removed bed and rug, revisited the room to confirm saved choices,
  restored all starter furnishings, and checked day/night room art and lamp.
- Completed and undid habits, filled the bar, continued the celebration, sent
  the dragon exploring, used the developer return shortcut, read the story,
  collected diamonds, and watched the new garden gift arrive.
- Fixed issues found: room and homecoming status-bar contrast, the story
  card's competing layout/rotation transforms, stale stage copy, Android widget
  proportions, hidden animation cleanup, and repeat bonus diamonds after undo.
  A persisted daily rewarded-habit ledger now prevents repeated payouts while
  retaining previously earned rewards. Legacy saves initialize from today's
  ticks. Regression tests cover main rewards, extra rewards, legacy saves and
  the next day. Native retesting kept 142 diamonds unchanged across two
  undo/re-tick cycles. Replayed the homecoming to confirm light status text and
  no new story-card animation warning.
- Final checks: `pnpm typecheck`, `EXPO_NO_DOTENV=1 pnpm lint`,
  `pnpm test --runInBand` (59 tests, 7 suites), and `git diff --check` pass.
  Both colours' asset references, frame counts and dimensions match. The
  interactive driver completed without XCTest failures; it is a manual driver,
  not a comprehensive automated UI assertion suite.
- Evidence (gitignored): `assets/generated/v2-playtest/playtest-highlights.mp4`
  (26 seconds, 402 × 874, 30 fps), full native recording and xcresult in the same
  folder, frame-review contact sheets, and numbered native screenshots.
  `19-story-fixed.png` shows the corrected homecoming; `09-grown-night-room.png`
  and `17-young-night-room.png` show the new sleep art in the furnished room.
- Limits: live play used the lavender dragon on iOS. Blue art was checked as
  files; Android widgets and a physical device were not played. New stage
  animations are four-frame loops, so motion is less fluid than the retained
  baby/young video-derived loops. The simulator save contains playtest rewards
  and habits; developer time and sky previews were returned to real time/Auto.

## 2026-11-17, second pass: shop art

Generated with Codex image generation (prompts in `assets/prompts/codex-shop/`, file list in
`assets/prompts/codex-shop/REPORT.md`) and wired in:

- **Plants:** lavender, poppy, lily, peony (5 stages each) in `plant-sprites.ts`, `plants.ts`, the picker and the shop.
- **Garden decor:** 10 pieces in `assets/images/decor/`, catalogue and spots in `src/constants/decor.ts`, drawn by
  `src/components/scene/garden-decor.tsx` (swing and chime sway, fairy lights twinkle, campfire flickers at night).
  `birdhouse-night` was skipped by the generator, so the birdhouse has no lit version.
- **Den furniture:** 9 new pieces in `assets/images/house/`; model in `src/lib/room.ts` (one piece per slot, old saves
  still load), art and positions in `src/constants/room-art.ts`.
- **Badges:** 12 in `assets/images/badges/`; rules in `src/engine/badges.ts`, shelf on the Companion tab.
- **Engine:** `buyItem` and `ownedItems` in `src/engine/companion.ts`.

Still open from ART-PLAN: new dragon reactions, grow-up clips, outfits, bed-sleep art, seaside and forest worlds,
the remaining 17 badges, marketing art, and smoother (more than 4-frame) teen and grown loops.
