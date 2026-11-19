# Inhabit art plan: everything we might generate

The complete wish list of art for Inhabit, written 2026-11-11 for the Higgsfield
unlimited trial (ends **2026-11-14 07:46 UTC**). Nothing here is decided yet: read it,
cross out what you don't want, and the rest becomes the generation brief.

Priorities: **P0** needed before launch · **P1** the first shop content · **P2** nice to have
later. Counts are rough. "Still" = one image, "loop" = one 4-5 s video that starts and
ends on the same frame.

## Implementation update — 2026-11-17

The user selected **finish dragons and starter room, then playtest** for this run.
The old unlimited-trial/provider instructions below are historical. This batch
uses built-in Codex image generation from the approved v2 references, local
cutout, four-frame animated WebP assembly and the existing blue recolour script.
It does not claim new Seedance video loops or the entire P1/P2 wish list.

- Teen and grown: distinct four-view sheets, five expressions and the five core
  pose cycles (idle, walk, stroll, water, sleep), lavender and blue.
- Young: corrected long-necked sleeping pose and four-frame breathing cycle.
- Room: day/night backdrops, starter bed, round rug and unlit/lit lamp. Home
  entry, saved placement toggles and sleep-on-bed behavior are implemented.
- Stage art is used on Home, in portraits and in widget stills. Original baby
  and young video loops remain for poses that already have them.
- P1 outfits, new plant species, worlds, paid decor/furniture and badges remain
  open. See `reference/art-integration-status.md` for the current audit.

## 0. How we generate now

The trial's unlimited generations **do not work from Claude Code**. Higgsfield's connector
only allows them in **claude.ai chat, Claude Cowork or ChatGPT**. So the work splits:

1. **You, in claude.ai:** add the Higgsfield connector (Settings → Connectors, signed in as
   the new account). Open a chat and paste one batch brief at a time. That chat runs the
   generations on the unlimited allowance.
2. **Me, here:** I write the briefs (prompts, settings, reference ids), then pull every
   finished result from the account through the connector, cut it out, name it, and wire it
   into the app. No credits are spent from here.

Models the unlimited trial covers:

| Kind | Model | Why we'd use it |
|---|---|---|
| Stills | Nano Banana Pro, Nano Banana 2.1 | Best at keeping a character identical from references |
| Stills | GPT Image 2.6 | Has a **transparent background** option: may skip the green-screen cutout |
| Stills | Seedream 5.5 | Also transparent PNG output; good at edits ("add a scarf") |
| Loops | Seedance 2.5 | What made every current loop. 4-30 s, up to 1080p, start and end frame |
| Loops | Seedance 2.0 / 2.0 Mini | Fallback |

Grok Image, which drew the current dragon, is **not** in the trial. The very first job is a
style-match test: redraw the young dragon with Nano Banana Pro from the approved sheet and
compare side by side. If it doesn't match, every new still is an edit of existing art
rather than a fresh drawing.

**Test batch before anything else (T1-T6)**

| # | Test | Decides |
|---|---|---|
| T1 | Young dragon front view, Nano Banana Pro vs GPT Image 2.6 vs Seedream 5.5, from the approved sheet | Which still model matches our style |
| T2 | Same still with transparent background vs chroma green | Whether we can drop the cutout step |
| T3 | Young idle loop at 720p vs 1080p, 5 s | Resolution and whether 1080p helps the cutout |
| T4 | One loop at 8 s | Whether longer loops are allowed on unlimited and worth it |
| T5 | "Add a red scarf" edit of the young front still | Whether outfits can be edits of base art |
| T6 | Grow-up clip: start frame baby idle, end frame young idle | Whether transitions can be videos at all |

## 1. Style bible (goes into every prompt)

**Character:** lavender body, pale mint belly with soft horizontal lines, mint wing
membranes with lavender edges, warm gold horns and one row of gold spikes from the back of
the head to the tail tip, one small gold nub on top of the head, dark plum eyes with a
white highlight, rosy cheeks, little gold claws. Stands and walks upright on two back legs,
never on four. Kind, never scary.

**Style:** soft flat 2D illustration with gentle cel shading, no outlines, no text, no
labels, no shadows on the ground.

**Stills:** 2k, square unless it's a sheet. Background: transparent if T2 passes, otherwise
one flat chroma green (#00B140) filling the frame. The whole subject inside the frame with
space on every side.

**Loops:** Seedance 2.5, 720p (or 1080p after T3), 4-5 s, silent, camera locked, subject
stays in the same spot and size, flat green background, "ends in exactly the starting pose
so the clip loops seamlessly". Start frame and end frame are the same still.

**Scenes:** 16:9 or taller, flat sky colour so `key-sky.py` can replace it with the coded
sky, no characters in the scene.

## 2. The dragon, stage by stage

What exists and what's missing. Every stage should end up with the same full set.

| Stage | Turnaround (front, ¾, side, back) | Expressions (5) | Loops (idle, walk, stroll, water, sleep) | Priority |
|---|---|---|---|---|
| Baby | ✅ all 4 | ✅ | ✅ all 5 | done |
| Young | front + side only | ✅ | ✅ 5; sleep corrected 2026-11-17 (frame cycle) | P2 ¾ and back |
| Teen | ✅ all 4 | ✅ all 5 | ✅ all 5 (four-frame cycles) | P0 complete 2026-11-17 |
| Grown | ✅ all 4 | ✅ all 5 | ✅ all 5 (four-frame cycles) | P0 complete 2026-11-17 |

Per new stage: 1 turnaround sheet + 1 expression sheet + 5 pose stills + 5 loops ≈ **12
generations**, plus retries.

**Design notes so the stages read as different ages** (the young one was first mistaken
for the baby, so push harder):

- **Teen:** taller and lankier than young; head about a fifth of the height; horns longer
  and starting to curve; wings bigger than the body; a slightly longer snout; a cheeky,
  confident grin; maybe a tuft or two of longer spikes on the head. Think "gangly
  teenager".
- **Grown:** broad chest, long strong neck, large wings that fold like a cloak, long horns
  with a gentle twist, a calm wise face with narrower eyes, a few extra small gold spikes
  along the jaw, maybe a lighter lavender patch on the chest. Still smiling, still gentle,
  but clearly the adult. Big enough that the Home scene scales it down.

### 2.1 New animations (every stage, ideally)

Beyond the five poses the app already uses. Each is one still then one loop.

| Pose | What happens | Where it shows | Type | Priority |
|---|---|---|---|---|
| **hello** | lifts a paw and waves, little bounce | tap reaction on Home, quest "say hi" | loop | P1 |
| **hop** | happy two-foot hop with wing flap | ticking a habit, MAX moment | loop | P1 |
| **cheer** | arms up, wings out, bouncing, sparkly eyes | MAX moment, growing up, quest claimed | loop | P1 |
| **sit** | sits on its tail, looks around slowly, blinks | day done, nothing left to do | loop | P1 |
| **yawn** | big yawn, stretches arms and wings | dusk, waking up | loop | P1 |
| **hug** | hugs itself and sways, hearts rise | tickle combo reaction | loop | P2 |
| **look** | second idle: looks left, looks right, scratches head | idle variety | loop | P2 |
| **dig** | pats soil, plants a seed, pats it down | new habit created | loop | P2 |
| **carry** | walks on the spot carrying a wrapped gift | homecoming walk-in | loop | P2 |
| **play** | chases a butterfly in place, hops at it | garden ambient | loop | P2 |
| **umbrella** | holds a big leaf over its head, rain | rain weather | loop | P2 |
| **wait** | stands by the path, looks into the distance, tail sways | first open after days away (gentle, never sad) | loop | P2 |
| **read** | sits reading a little book, turns a page | quiz and journal screens | loop | P2 |
| **nightcap** | sleep loop wearing a nightcap | at night with the sleep outfit | loop | P2 |

### 2.2 Transitions (one-shot clips, start frame ≠ end frame)

| Clip | Start → end | Priority |
|---|---|---|
| grow up baby → young | baby idle still → young idle still, glow and sparkle | P1 (if T6 works) |
| grow up young → teen | same | P1 |
| grow up teen → grown | same | P1 |
| fall asleep (per stage) | idle → curled sleep | P2 |
| wake up (per stage) | sleep → stretch → idle | P2 |
| hatch | stays code-animated | - |

### 2.3 Colour variants (two eggs)

**Decided 2026-11-11:** onboarding offers **two eggs**, so there are two dragon colours:
**lavender** (the current art) and one more. Suggested second colour: **sky blue** with a
pale butter-yellow belly and the same gold horns (pink is the alternative). The other four
egg images stay unused; PLAN decision 4 is replaced by this.

**Done, no generation needed:** `scripts/recolour.py` hue-shifts the lavender art (stills
and animated WebPs) into `assets/images/dragon-blue/`, keeping the gold horns, mint belly
and shading (`assets/generated/hue-compare/young-idle-hue-compare.png` shows blue, pink and
mint). Every new lavender asset, including the Teen and Grown sets, gets its blue twin by
rerunning the script, so the second colour never costs a generation. The app picks the
colour from the egg (`src/constants/dragon-colours.ts`).

**Other creatures** (a fox, an owl, a cat…) are out of scope for v1. Listed only so it's
not forgotten.

## 3. Outfits (Shop: "Outfits for {name}")

**Decided 2026-11-11:** the shop has four categories: **hats, shirts, leggings,
backpacks** (plus seasonal extras later).

**The constraint.** The dragon is a set of video clips, so a hat drawn as an overlay
won't follow its head. Every item has to be *in* the clips: one edited still per pose
("the same dragon wearing a red beanie") and one loop per pose, **5 stills + 5 loops per
item per stage.** Combinations multiply that: a hat *and* a shirt *and* leggings would
need clips for every mix, which is impossible to pre-render. So for now the dragon
**wears one item at a time**; the shop still shows the four categories, and later a
layered 2D rig (the way Finch draws its bird) would let items stack. If the rig is wanted,
that's a separate build, not art.

Items should also show on the Companion portrait and the widget. Each needs a **shop
thumbnail**: the item alone, square, transparent (1 still each).

| Category | Items | Priority |
|---|---|---|
| Hats | red beanie, straw sun hat, flower crown, party hat, bucket hat, wizard hat, crown, explorer hat with goggles, nightcap | P1: beanie, sun hat, flower crown, party hat · P2: rest |
| Shirts | cosy knit sweater, striped tee, raincoat, hoodie, denim jacket, overalls, kimono, pyjama top | P1: sweater, striped tee, raincoat · P2: rest |
| Leggings | striped leggings, star-print leggings, rainbow socks, denim shorts, pyjama bottoms | P1: striped, star-print · P2: rest |
| Backpacks | tiny canvas backpack, leaf backpack, satchel, star backpack, explorer pack with a rolled blanket | P1: canvas, leaf · P2: rest |
| Seasonal | santa hat, reindeer antlers, pumpkin hat, bunny ears, heart glasses, graduation cap, scarf | P2 |

Hero set (P1): **11 items** × 5 stills × 5 loops × 2 stages (young and teen, or whichever
ship) ≈ **110 stills + 110 loops**, plus 11 thumbnails. Baby outfits only if people keep
the baby long enough to buy them (7 days). Because this is the biggest block, it runs
after the stages and the house.

Each outfit also needs a **shop thumbnail**: the item alone on a transparent background,
square (1 still each).

## 4. Garden decor (Shop: "More decorations")

Each is one still on green or transparent, small on screen (40-70 px), drawn in the same
style as the current props (bench, fence, flowers, lantern, mushrooms, pond, stones). Items
that light up need a **night version** too.

| Group | Items | Priority |
|---|---|---|
| Seating and structure | swing, hammock between posts, tea table with two cups, picnic blanket, little wooden bridge, archway with climbing roses, garden gate, stepping stones, low stone wall | P1: swing, archway, bridge · P2: rest |
| Water | birdbath, fountain, rain barrel, well with roof, lily pond upgrade | P1: birdbath · P2: rest |
| Lights (day + night) | fairy lights on posts, lamp post, campfire with flicker loop, paper lanterns, glass jar of fireflies | P1: fairy lights, campfire · P2: rest |
| Wildlife | birdhouse, bird feeder, bug hotel, beehive, snail shell house | P1: birdhouse · P2: rest |
| Whimsy | gnome, scarecrow, wind chime, pinwheel, signpost with arrows, mailbox, sundial, telescope on a tripod, sand castle, mushroom ring | P1: gnome, wind chime · P2: rest |
| Planters | terracotta pots, window box, wheelbarrow of flowers, topiary ball, bonsai on a stand | P2 |
| Seasonal | pumpkins, snowman, string of hearts, egg basket, lantern tree | P2 |

P1 ≈ **10 stills** (+ 3 night versions). Full list ≈ **45 stills**.

Existing gift props could get **upgrade tiers** drawn properly instead of just scaling:
3 tiers × 7 props = 21 stills (P2).

## 5. Plants (Shop seeds)

Each species is **5 stills**: sprout, growing, budding, bloom, resting (closed bud). Eight
species exist. New candidates:

| Species | Mood it could mean | Priority |
|---|---|---|
| Lavender | calm | P1 |
| Poppy | rest | P1 |
| Lily | kindness | P1 |
| Peony | abundance | P1 |
| Hydrangea | gratitude | P2 |
| Iris | courage | P2 |
| Marigold | warmth | P2 |
| Lotus (sits on the pond) | stillness | P2 |
| Strawberry (fruit at bloom) | sweetness | P2 |
| Pumpkin vine (seasonal) | harvest | P2 |
| Snowdrop (seasonal) | hope | P2 |
| Succulent in a pot | patience | P2 |
| Fern | growth | P2 |
| Orchid | focus | P2 |

P1 = 4 species = **20 stills**. Everything = 14 species = 70 stills. Each new species also
needs a **seed packet** thumbnail for the shop if we want nicer shop cards than the bloom
image (optional, 1 still each).

## 6. The house

**Decided 2026-11-11: in v1.** A button on Home opens the house screen: the dragon's room,
where it sleeps at night and where furniture from the shop goes. The exterior can also sit
at the back of the garden and upgrade as the dragon grows (tapping it opens the same
screen).

**Interior (P1, the "home" screen):**

| Item | Count | Priority |
|---|---|---|
| Room backdrop: a round cosy den with a window, a rug and space for furniture; day and night (window glow, moonlight) | 2 stills | P1 |
| Dragon asleep in a bed (per stage, replaces the curled sleep when it owns a bed) | 1 still + 1 loop per stage | P1 |
| Starter furniture: simple bed, round rug, small lamp (lamp has a night version) | 4 stills | P1 |
| Shop furniture: 3 bed styles, 3 rugs, 2 lamps, bookshelf, toy chest, plant pot, 3 wall pictures, clock, 2 cushions, tea set, little piano, telescope by the window | ≈ 20 stills, lit ones ×2 | P1 first 8, P2 rest |
| Room themes (wallpaper and floor swaps): forest, sea, night sky, candy | 4 × 2 stills | P2 |

**Exterior, 5 levels** (each a still, day and night versions, windows glowing at night):

| Level | Look | Unlocked by |
|---|---|---|
| 1 | a little tent made of a big leaf | hatching |
| 2 | a hollow log with a round door | first full week |
| 3 | a cosy mushroom cottage | Young |
| 4 | a stone cottage with a chimney and flower boxes | Teen |
| 5 | a small tower house with a balcony | Grown |

= 10 stills (P2; the room comes first). Plus 2 details: door open and closed, smoke from
the chimney (code).

## 7. Worlds and backgrounds

The garden has day and night layers plus two journey strips. **Each new world needs the
same four:** garden day, garden night, trail far, trail near (seamless strips), all with a
flat sky for `key-sky.py`. The plant spots and gift spots must stay roughly where they are,
so every world needs an open flat area in the same place.

| World | Feel | Priority |
|---|---|---|
| Meadow garden (current) | spring, picket fence, hills | done |
| Seaside | sand, dune grass, a little pier, sea on the horizon | P1 |
| Forest glade | tall trees, mossy stones, dappled light | P1 |
| Cherry orchard | pink trees, petals, a wooden swing | P2 |
| Mountain meadow | alpine flowers, peaks, a stream | P2 |
| Snowy village | snow, warm windows, pines | P2 (winter event) |
| Sky garden | floating island, clouds below | P2 |
| Zen garden | raked gravel, maple, stone lantern | P2 |
| Lavender fields | purple rows, a windmill | P2 |
| Mushroom hollow | giant glowing mushrooms, night-first | P2 |

**Seasons for the current garden** (same layout, different dressing): summer, autumn,
winter = 3 × (day + night + 2 strips) = **12 stills** (P2). Spring is the current art.

**Weather** stays code (rain and snow particles), but a wet-ground and a snow-covered
variant of the garden day layer would sell it: 2 stills (P2).

P1 = 2 worlds = **8 stills**. Everything ≈ 50 stills.

## 8. Journey postcards

The homecoming story is text today. A small illustrated postcard per destination would make
every return different. **Without the dragon in them**, so one set serves every stage and
colour.

Twelve places: wildflower hill, river bend, old oak, village market, lighthouse, cave of
crystals, waterfall, lavender farm, mountain pass, night fair with lanterns, apple orchard,
lily lake. Postcard frame drawn in code. = **12 stills** (P2).

## 9. Badges and collections

The Companion tab's "collections" has nothing to show yet. Badge stickers in the same
flat style, square on transparent, used on the Companion tab, quests and share cards:

- Streaks: 3, 7, 14, 30, 60, 100, 365 days (7)
- Growth: hatched, young, teen, grown (4)
- Garden: first bloom, 5 blooms, every species, all 7 gifts, garden full (5)
- Journeys: first, 10, 50, every postcard (4)
- Habits: first habit, 100 ticks, 1,000 ticks, perfect week, perfect month (5)
- Seasonal: one per event (4)

≈ **29 stills** (P1 for the first 12, P2 the rest). Each also needs a greyed "locked" look,
done in code.

## 10. Onboarding and interface art

| Item | Notes | Priority |
|---|---|---|
| Egg wobble loop, 6 colours | now code-animated stills; a real wobble with a crack glow would be cuter | P2 (6 loops) |
| Hatch burst | stays code | - |
| "Making your plan" illustration | the dragon at a tiny desk with a pencil, thinking | P2 (1 still, could be the `read` pose) |
| Day-1 affirmation card art | a soft sunrise over the garden, no dragon | P2 (1) |
| Tab bar icons | 5 illustrated icons, filled and outline: garden, scroll, shop bag, two dragons, dragon face | P2 (10 stills, only if we leave native SF Symbols) |
| Mood check-in icons | 5 gentle faces for the later mood feature | P2 (5), or Twemoji |
| Event banners | spring festival, summer, harvest, winter lights | P2 (4 wide stills) |
| App icon refresh | current plum icon is fine; a version with the grown dragon later | P2 |
| Widget art | small dragon stills per stage, already covered by expressions | - |
| Empty states | Friends tab "coming soon" hero: two dragons waving across a fence | P2 (1) |

## 11. Marketing and store listing

| Item | Size | Priority |
|---|---|---|
| Hero image: dragon in the full garden, golden hour | 16:9, 2k | P1 |
| Six dragons line-up (colour variants) | 16:9 | P2 |
| Growth line-up: baby → young → teen → grown side by side | 16:9 | P1 |
| Android feature graphic | 1024×500, from the hero | P1 |
| Screenshot backdrops (5-8) | soft gradients with props, screenshots dropped on top | P2 |
| Social sticker pack: 8 expressions as stickers | square, transparent | P2 |

## 12. Ambient critters

Tiny loops that make the garden feel alive. Each ≈ 24-40 px, so quality barely matters:
butterfly (now an icon), bee, ladybird, snail, two birds, dragonfly for the pond, fireflies
(code). ≈ **6 loops** (P2).

## 13. Totals

| Block | P0 | P1 | P2 |
|---|---|---|---|
| Tests | 6 gens | | |
| Dragon stages | ~26 (teen + grown + young sleep) | 10 new poses × 2 stages = 20 stills + 20 loops; 3 grow-up clips | ~40 more poses/views; variants |
| Outfits | | 8 hero ≈ 80 stills + 80 loops + 8 thumbs | ~25 more outfits |
| Decor | | ~13 stills | ~50 stills |
| Plants | | 20 stills | 50 stills |
| House | | 10 stills (if yes) | ~20 interior |
| Worlds | | 8 stills | ~45 stills |
| Postcards, badges, UI, marketing | | ~15 | ~70 |
| **Roughly** | **~32** | **~180 stills + ~105 loops** | **~300 stills + ~60 loops** |

Each loop takes about 2-5 minutes and the account runs up to 8 at once, so the P0 + P1 list
is doable in the trial window if the claude.ai chat is kept busy. P2 is a wish list.

## 14. Decisions

Made 2026-11-11:

1. **House:** in v1, a button on Home opens the room (section 6).
2. **Outfits:** hats, shirts, leggings, backpacks; one item worn at a time (section 3).
3. **Colours:** two eggs, two dragons; code hue-shift first (section 2.3).
4. **Everything else in the list:** proceed in priority order.

Still open:

- The **second dragon colour** (sky blue suggested; pink is the alternative).
- **Which two worlds** first (seaside and forest suggested).
- **Teen and grown looks:** the design notes in section 2, unless you send a reference.
