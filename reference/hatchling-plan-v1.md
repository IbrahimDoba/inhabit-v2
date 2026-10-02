# Hatchling: build plan

Working title: **Hatchling**. Mascot: **Ember**, a baby dragon.
Status: plan awaiting approval (2026-09-26). Nothing beyond the untouched Expo template has been built.

## 1. What we are building

A self-care habit app in the style of Finch: a pet hatches from an egg and grows as the user completes small daily goals. Warm, guilt-free tone. iOS and Android from one Expo codebase.

Keep from Finch: pet + energy + adventure loop, daily goals, check-ins, reflections, breathing, shop and wardrobe, gentle streaks, an onboarding that ends in a paywall.
Change: our own character, world, copy, currency, art. No copied strings or assets.

## 2. Locked decisions

- Expo SDK 57, React Native 0.86, TypeScript, expo-router, pnpm with `node-linker=hoisted`.
- Data on device only in v1 (expo-sqlite + drizzle-orm). Accounts, sync and friends come later.
- Character and backdrop art generated with Higgsfield: GPT Image for stills, Seedance 2.5 image-to-video for loops. User will sign up.
- Working title Hatchling; rename before store submission.

## 3. Core loop spec

### Goals and energy

| Goal size | Energy |
|-----------|--------|
| Tiny      | 2      |
| Small     | 3      |
| Medium    | 5      |
| Big       | 8      |

Days roll over at the user's "day start" hour (default 04:00 local). Goals repeat daily, on weekdays, or on custom days; one-off goals are allowed.

### Stages

| Stage   | Adventures to advance | Full bar | Adventure length |
|---------|-----------------------|----------|------------------|
| Baby    | 7                     | 15       | 8 h              |
| Toddler | 15                    | 20       | 7 h              |
| Child   | 20                    | 25       | 6 h              |
| Teen    | 25                    | 30       | 6 h              |
| Adult   | stays                 | 30       | 6 h              |

Adult is reached after 67 adventures. The pet never regresses and never dies.

### Adventures

A full bar sends the pet off automatically with a short send-off animation. Leftover energy carries into the next bar. On return: a short story (pool of about 60 templates keyed by location), 20 to 40 embers, and a 10% chance of a rare accessory. A local notification fires at return time. If the app is opened after return time, `reconcile()` lands the adventure and shows the return sheet.

### Currency: embers

Earned: adventure return, first check-in of the day (+5), reflection (+5), 7-day streak bonus (+30). Spent on wardrobe, home decor and backdrops.

### Streaks

Consecutive days with at least one completed goal. A missed day freezes the streak instead of resetting it when a rest token is available (one granted per week). Copy never scolds.

## 4. Screens

Onboarding (about 14 pages): welcome → hatch new / I already have a pet → pick egg (8 colours) → tap to crack (3 taps) → meet Ember → name → what brings you here (multi-select) → areas of support (multi-select) → pick first 3 goals from suggestions → reminder time → notification permission → paywall placeholder (skippable) → day 1 celebration.

Tabs: Home · Goals · Town · Insights · You.

- Home: backdrop with the animated pet, energy bar, today's goals with check-off, adventure status. Sheets: celebration, adventure return story, check-in, reflection.
- Goals: goals grouped by time of day; editor (name, emoji, size, schedule, reminder); suggestion library; journeys (multi-day guided goal sets).
- Town: Shop (wardrobe, decor, backdrops), Wardrobe (dress the pet), Home (place decor). Friends card shows "coming soon".
- Insights: mood trend, goals completed per week, streak, reflection tags.
- You: pet profile, stats, settings (day start, reminders, sounds, haptics, export/backup), about, crisis resources link.

## 5. Architecture

```
src/
  domain/      pure TypeScript: pet, energy, adventures, streaks, currency. No React. Unit tested.
  data/        drizzle schema, migrations, repositories over expo-sqlite
  state/       zustand stores hydrated from repositories, selectors
  features/    per-feature UI: home, goals, onboarding, town, insights, settings
  components/  design-system primitives: Text, Button, Card, Sheet, ProgressBar
  theme/       tokens for colour, type, spacing, radii, motion; light and dark
  assets/      video loops, lottie json, images, sounds
app/           expo-router routes only, thin wrappers around features
```

Time: timestamps stored as UTC ISO strings. Day keys computed from the day-start hour and device timezone. A single `reconcile(now)` runs on every app foreground: rolls over days, lands returned adventures, reschedules notifications.

## 6. Data model

- `pet(id, name, stage, adventures_done, energy, born_at, colour, pronoun)`
- `goals(id, title, emoji, size, schedule_kind, schedule_days, time_of_day, reminder_at, archived, created_at)`
- `goal_completions(id, goal_id, day_key, completed_at, energy_awarded)`
- `adventures(id, started_at, ends_at, returned_at, location_id, story_id, embers, find_item_id)`
- `check_ins(id, day_key, mood, note, tags, created_at)` with mood 1 to 5
- `reflections(id, day_key, prompt_id, text, created_at)`
- `transactions(id, amount, reason, created_at)`; wallet balance derived
- `items` static catalogue in code: `(id, kind, name, price, asset)`
- `inventory(item_id, acquired_at, equipped)`
- `settings(key, value)`
- `streak(current, longest, last_day_key, rest_tokens)`

## 7. Art and animation pipeline

Setup: create an account at higgsfield.ai (free credits at signup), then connect it to Claude Code:

```
claude mcp add --transport http --scope user higgsfield https://mcp.higgsfield.ai/mcp
```

The first tool call opens a browser OAuth flow. API keys are optional and only needed for scripted batch generation.

1. Character sheet (GPT Image): Ember, baby dragon, round body, stubby wings, big eyes, lavender #B8A9E8 / mint #A9E5C1 / warm gold #F2C14E / plum #3B2A4A, flat illustration with soft shading, no sticker outline. Expressions: neutral, happy, sleepy, proud, curious, sad-but-okay. Eggs in 8 colours, two crack states.
2. Backdrop (GPT Image): alpine meadow, hot spring, small cave home, morning light, plus a dusk variant, matched style.
3. Loops (Seedance 2.5 image-to-video, character composited on the backdrop, 720p, 4:5, 6 to 8 s, seamless): idle (tail sway, blink, smoke puff), happy (hop, wing flap, smoke ring), sleepy (curl up), walk left to right and back, depart (glide over the ridge), return (land), hatch (wobble, crack, reveal). One backdrop-only loop: steam drifting, grass sway, clouds still.

Pace: start with one still of Ember and one idle loop only. Add a clip only when a screen actually needs it. The list above is the eventual set, not the first order.

Delivery: H.264 MP4, muted, at most 3 MB each, played with expo-video on loop and cross-faded between states. Compositing character and backdrop in one clip avoids transparent video entirely.

UI motion: Reanimated 4 (energy bar fill, card press, egg shake, sheet transitions), Lottie from LottieFiles (confetti, sparkle, check-mark burst, hearts when petting), expo-haptics, expo-audio for short sound effects.

## 8. Milestones

| # | Milestone | Done when |
|---|-----------|-----------|
| M0 | Foundation: theme tokens, primitives, tab shell, sqlite + drizzle, domain package with tests | App boots on the iOS simulator with five tabs, `pnpm test` green |
| M1 | Core loop: goals CRUD, energy, adventure timer, return sheet, embers, streaks, day rollover, notifications, placeholder art | A full day can be simulated with a dev "time travel" menu and in tests |
| M2 | Onboarding: all pages, egg pick and hatch, name, questions, first goals, paywall placeholder | Fresh install to Home in under 2 minutes |
| M3 | Self-care tools: mood check-in, reflections with prompts, breathing, insights charts | Each tool awards embers and shows in Insights |
| M4 | Art pass: Higgsfield clips wired, Lottie celebrations, sounds, haptics, dark mode QA | No placeholder art left on shipped screens |
| M5 | Town: shop, wardrobe, decor, backdrops; data export and backup | Buy, equip and see it on the pet |
| M6 | Release prep: icon and splash, rename, EAS dev build on a real iPhone, Android via Expo Go or EAS, store copy, privacy | Installed on a real iPhone and an Android phone |
| Later | Accounts and sync, friends and good vibes, RevenueCat subscription, widgets, seasonal events | |

## 9. Testing

vitest for `src/domain` (energy, stages, adventures, streaks, reconcile). Typecheck and `expo lint` at every milestone. Manual: iOS simulator (installed), a real iPhone via Expo Go, an Android phone via Expo Go. Android emulator once the SDK is installed through Homebrew.

## 10. Risks

- Video transparency: solved by compositing, at the cost of one clip per backdrop variant.
- App size: keep total video under about 30 MB; move extra clips to on-demand download later.
- Finch IP: original name, character, copy and art only.
- Health category review: no medical claims; crisis resources link in settings.
- Device-only data is lost with the phone: export and backup in M5, sync later.

## 11. Needed from the user

1. Approve or edit this plan.
2. Confirm pet name (default Ember) and currency name (default embers).
3. Create the Higgsfield account, then run the `claude mcp add` command above.
4. Expo account (free) before M6; Apple Developer account ($99/yr) for TestFlight.
5. Keep or delete the `~/dev/hatchling` scaffold.
