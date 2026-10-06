# Inhabit: build plan

Status: plan v2, rewritten 2026-09-27 around the Inhabit concept. Supersedes the Hatchling plan (kept in `reference/hatchling-plan-v1.md`).
Pace: one step at a time. Each step ends with something visible, then waits for a go-ahead.

## 1. The idea in one paragraph

Inhabit is a habit app where a small companion creature lives with you in a garden.
Every habit you keep is a plant in that garden. When you do a habit, the companion tends it and gains a little energy.
A full day of care sends the companion out on a short journey, and it comes back with one gift for the garden.
Over weeks the companion grows up and the garden fills in. Nothing ever shames you: plants rest, they never die, and the companion is always glad to see you.

Sources: the concept comes from the user's earlier Inhabit docs (`~/Documents/dev/inhabit/docs/product/`). The feel and pacing come from Finch (`reference/finch-walkthrough.md`). No Finch wording, art or names are copied.

## 2. Rules the product never breaks

1. **Zero punishment.** No red badges, no "streak lost", no sad companion. Missed days show as rest, never as failure.
2. **The companion is not you.** It is a separate creature who notices your effort. That is what makes the app feel alive on day one with no friends.
3. **Nothing earned is ever taken away.** Growth stages and garden items never regress. Currency never expires or goes negative.
4. **One main reward per day.** Doing more habits does not flood the garden. The day has a shape and an ending.
5. **Fun over compliance.** The app opens into the world, not into a list.

## 3. The companion (built first)

| Thing | Rule |
|---|---|
| Species | A baby dragon (decided 2026-09-27). Lavender, mint, warm gold and plum, matching the app theme |
| Hatching | Pick an egg colour, tap to hatch, name it, pick one trait |
| Care energy | Each habit done gives 5 energy. Custom sizes come later |
| Full bar | 15 as a baby, rising with each stage |
| Journey | A full bar sends the dragon out for a few hours. It returns with a short story, diamonds and the day's gift |
| Growth | Stages advance on full-care days, not on calendar days, so a slow week only pauses growth |
| Mood | Reflects today only: content, happy, proud, sleepy at night. There is no sad state |
| Reactions | Tapping it, completing a habit, and its return each get a small response |

Stage table (starting point, tuned later):

| Stage | Full-care days to advance | Full bar | Journey length |
|---|---|---|---|
| Baby | 7 | 15 | 8 h |
| Young | 15 | 20 | 7 h |
| Teen | 20 | 25 | 6 h |
| Grown | stays | 30 | 6 h |

## 4. The garden (built second)

| Thing | Rule |
|---|---|
| Habit plants | Each habit is one plant. Creating a habit plants a seed |
| Plant stage | Sprout, growing, budding, bloom. Advances with care and never goes back |
| Plant mood | From the last 7 days. A resting plant is a closed bud, never wilted |
| Props | Gifts from journeys fill a fixed set of garden spots. When full, a gift upgrades a spot instead of adding clutter |
| Companion in the garden | Walks to the plant you just cared for, visits resting plants more often, sits down when the day is done, sleeps at night |

## 5. Screens

Tabs: **Home, Quests, Shop, Friends, Companion.** Settings live in a menu from Home.

- **Home**: the companion (later the garden around it), the care bar or journey countdown, today's habits below.
- **Quests**: daily and special quests that pay currency. Seasonal events later.
- **Shop**: outfits for the companion, decor for the garden, a small daily rotation.
- **Friends**: a "coming soon" placeholder in v1.
- **Companion**: name, trait, stage, streak, collections.

Onboarding: welcome, egg, hatch, name, trait, a Finch-style quiz (your name, then About you, Energy, How life is, Support, with follow-ups for the first two support areas), a generated starter plan of three habits, reminder time, first day. The quiz was added at the user's request on 2026-09-27; its answers pick the starter habits and the reminder time. No account and no hard paywall in v1.

## 6. Tech

Currency is **diamonds** (decided 2026-09-27). Earned from journeys, quests and check-ins; spent in the shop.

Expo SDK 57, TypeScript, expo-router, pnpm. On-device data only in v1: expo-sqlite's key-value store now (`src/lib/storage.ts`, works on web too); Drizzle tables once habit history needs querying. Pure TypeScript rules engine with unit tests. Reanimated and Lottie for motion. Companion art from Higgsfield: one still and one idle loop first, more only when a screen needs it.

## 7. Steps, in order

Companion phase:

| # | Step | You'll see |
|---|---|---|
| 1 | ~~Empty five-tab app~~ | Done 2026-09-27 |
| 2 | ~~Rename to Inhabit and reshape the tabs~~ | Done 2026-09-27 |
| 3 | ~~Companion rules engine: energy, stages, journeys, gifts, mood~~ | Done 2026-09-27 (`src/engine/`, 24 tests, `pnpm test`) |
| 4 | ~~Save everything on the phone~~ | Done 2026-09-27 (expo-sqlite key-value store; Drizzle tables deferred until habit history needs them) |
| 5 | ~~Home works: habit list, care bar, journey countdown~~ | Done 2026-09-28, with the real dragon art and code animations |
| 6 | ~~Add and edit habits~~ | Done 2026-09-28 (time of day, days of the week, suggestions, edit, delete) |
| 7 | ~~Dev time-travel button~~ | Done 2026-09-29 (Companion tab: +1h, +6h, +1 day, +1 week, back to real time) |
| 8 | ~~Hatching onboarding~~ | Done 2026-09-28 (plus quiz, plan, reminders, Day 1, streak) |
| 9 | ~~First companion art: one still, then one idle loop~~ | Done 2026-09-28 (idle and walk loops) |
| 10 | Companion reactions and celebrations | It responds to taps and completed habits |

Garden phase:

| # | Step | You'll see |
|---|---|---|
| 11 | ~~Habits become plants in the scene~~ | Done 2026-09-29 (4 species, up to 12 spots around the dragon) |
| 12 | ~~Plant stages and resting buds~~ | Done 2026-09-29 (sprout 0, growing 3, budding 7, bloom 14 completions; rests after 3 quiet days) |
| 13 | ~~Journey gifts fill garden spots~~ | Done 2026-09-30 (7 gifts with their own spots, upgrades up to level 3, lantern glows at night) |
| 14 | ~~Companion walks to the plant you tended~~ | Done 2026-10-01 (walks over, waters it, walks back) |
| 15 | ~~Quests and shop~~ | Done 2026-10-02 (4 daily quests, 7 milestones, seed shop) |

Later: friends visiting gardens with one gift a day, paid garden themes previewed through friends, widget, accounts and sync.

## 8. Decisions

1. **Creature: baby dragon.** Decided 2026-09-27. The user names it during hatching.
2. **Currency: diamonds.** Decided 2026-09-27.
3. **Default world: garden**, per the earlier Inhabit decision. Other worlds become paid themes later.
4. **One lavender dragon for now.** Finch recolours the pet to match the egg; the user wants six colour variants later (2026-09-27). Until then the egg colour is a keepsake only.
