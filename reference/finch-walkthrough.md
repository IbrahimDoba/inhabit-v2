# Finch walkthrough

Source: the user's 10-minute iPhone recording of Finch v3.73 (Sep 27, 2026), from first launch through onboarding into the app. Re-read frame by frame on 2026-09-27; the full screen-by-screen notes, with every option and on-screen line verbatim, are in `reference/finch-notes/` (four files in time order).

Reference only. Inhabit copies structure and mechanics, never Finch's wording, art or names.

## 1. Onboarding, in order (0:00 to 5:48)

| # | Time | Screen | What happens |
|---|---|---|---|
| 1 | 0:00 | Splash | Pet head logo and wordmark. |
| 2 | 0:03 | Welcome | Tagline, "Hatch a new pet" button, "Login" link, terms line. |
| 3 | 0:05 | Choose your egg | 6 speckled eggs in a ring around a baby bird. **The bird recolours live to match the tapped egg**; the hatched pet keeps that colour. |
| 4 | 0:11 | Account | Phone number by default, email as an alternative, "Skip" on every account screen. |
| 5 | 0:35 | Verify | 6-digit code with iOS autofill, 30 s resend countdown, auto-submits. |
| 6 | 0:51 | Password | Two fields, inline red errors, success shown inside the button. |
| 7 | 1:17 | Hatch | Automatic, no taps: crack, squash, then the bird mid-hop over a soft sunburst with "You hatched a birb!". |
| 8 | 1:21 | Pronouns | he/him, she/her, they/them. Pronouns are used in later copy. |
| 9 | 1:24 | Name | Prefilled random name, Shuffle and Next side by side, "You can change this later." |
| 10 | 1:30 | Trait | 6 traits with emoji. **Each tap plays a trait-specific pose** (thinking, headband, hearts, desk and scroll, boombox, hugging a heart). |
| 11 | 1:48 | Your name | Chat style: the pet asks your name in a speech bubble. |
| 12 | 1:53 | What is self-care? | Two big coloured answer bubbles, tap to answer, no Next. Both answers are "right". |
| 13 | 2:06 | Stat reward | Pet hugs a heart; toast "+3.2 Compassion" (trait stats with decimals). |
| 14 | 2:10 | Notification primer | Mock notification from the pet ("Remember to drink water!"), "Turn on notifications" / "Maybe later", then the iOS prompt. |
| 15 | 2:15 | Quiz intro | "Let's learn a bit about you!", pet curious about how it can grow with you. |
| 16 | 2:17 | Quiz | See section 2. |
| 17 | 4:32 | Generating plan | Ring fills around the pet over about 3 s; "45 million+ people" and scrolling review cards. |
| 18 | 4:36 | Starter plan | Notepad card "<name>'s starter plan", 7 generic easy goals (not tied to the quiz answers), pet says "You got this", "Let's do it!". |
| 19 | 4:40 | Paywall | Three soft-sell screens (each with a pet costume and a laurel badge), then a trial timeline, $69.99 struck to $34.99/yr, "Skip this one-time offer" link. Says 7 days free, then 3 days. |
| 20 | 4:54 | Attribution | "How did you hear about us?" 10+ sources. Comes after the paywall. |
| 21 | 5:01 | Friends pitch | Three benefits, then contacts sync with the iOS prompt (Finch draws an arrow at "Continue"). |
| 22 | 5:06 | Day 1 | Full-bleed blue, "DAY 1 / Happy <weekday>!", a tilted "A gentle reminder" affirmation card, "Help <pet> gain full energy today so he can go out to explore and grow!", "Start today". Staggered fade-in. |
| 23 | 5:10 | Streak | Dark "0" flips to blue "1 DAY STREAK", pet drops in with rays, week strip with today ticked. |
| 24 | 5:15 | Streak goal | Commit to 2 / 5 / 7 / 14 days (Baby steps, Strong start, Clearly committed, Unstoppable streak). The pet's bubble reacts to the choice. |
| 25 | 5:22 | Widget | "Make your habits stick!" sheet, then a 3-step how-to-add-a-widget tutorial. |
| 26 | 5:35 | First goals on Home | User completes 3 goals: confetti, bolts fly to the energy bar, toast "First time completion!" with a rotating headline, counter animates 0 to 5 to 10. |
| 27 | 5:46 | Energy MAX | Whole screen turns into a celebration: bar reads MAX, "Woohoo! <pet> munched on Corn and energized for Day 1", **+140 stones** flying to the counter. |
| 28 | 5:53 | Growing up | "<pet> is growing up a little!", card "Evolve into Toddler, 7 full-energy days, 1 / 7". |
| 29 | 5:59 | Adventure | "Start Adventure!": pet walks off with a backpack, "New adventure started!", countdown **8:00:00**. |

## 2. The quiz

Shell: back button, a 4-section progress bar with check nodes (About you, Energy & activity, How's life, Support areas) whose sections resize when follow-ups are added, and a small section label. The pet idles with a "?" head tilt and shows a lightbulb when you pick something. Single-select shows a green check and moves on by itself; multi-select uses "+" circles and a Next that is grey until something is picked. Some options are exclusive, "Prefer not to answer" is a plain text link, and "Other" opens a text field.

| Section | Questions |
|---|---|
| About you | Age (7 ranges) · Gender (plus "Prefer not to answer") · Used the app before? |
| Energy & activity | Sleep hours · How easy it is to get out of bed · How active you are (includes "I have conditions that limit my movement") |
| How's life | How often you feel overwhelmed · How many people you can lean on · How happy you are with your routine |
| Support areas | Mental health challenges (multi, clinical list, "I'm not sure", exclusive "I don't have mental health issues") · Support areas (10, multi) · then **one follow-up per chosen area**, each multi-select with 7 to 12 options and "Other" |

The user picked all 10 areas and got 6 follow-ups (confidence, overwhelm, healthy eating, staying active, procrastinating on, why you put things off). Exact options are in `reference/finch-notes/1-launch-to-quiz.md` and `2-quiz-end-to-first-goals.md`.

## 3. Core loop as observed

- Each goal gives **5 energy**; the baby bar is **15**, so 3 goals fill it on day one.
- Completing a goal: tap the check, the card leaves the list, confetti, bolts fly to the bar, a toast with a rotating headline ("Nicely done!", "You're awesome!", "Hooray!", "You did it!") and "First time completion!". The energy counter counts up.
- Full bar: MAX celebration, +140 stones on the first full day, the evolution card, then "Start Adventure!".
- While away: Home swaps the energy bar for an "Adventuring, back in 7:59:55" card with a dotted track to a "?". Tapping the pet shows "<pet> is away on an adventure! He will share a story when done!"
- Goals keep working while away and still pay stones (+3 and +1 seen). The adventure timer may shorten with completions (uncertain; the numbers suggest it).
- Tapping a done goal opens a sheet: Undo complete, See stats, Reflect, Edit.
- Growth: 7 full-energy days to go from Baby to Toddler.

## 4. App structure

Tabs: **Home, Quests, Shop, Friends, Bag, <pet name>** (6). A hamburger on Home opens a menu page.

- **Home:** forest scene with the pet (parallax, collapses on scroll), energy or adventure card, "N goals left for today!" with filter and view icons, goals grouped by time of day (Start the day, Any time) in collapsible sections, each section with its own "+". Cards have a drag handle, emoji, title, area, "5⚡" and a check button. A dismissible "Buddy up" promo sits between sections. "+ Add a goal" at the bottom. The currency pill appears top-right when scrolled.
- **Add a goal:** composer "Enter a new goal...", suggestion list grouped by chips (Easy wins, Calm, Connection, Gratitude). Picking one fills in the card with its defaults (Any time, Daily). Sheets: self-care area (9 areas plus "Create a new area"), time of day (Start the day, Afternoon, Evening, Bedtime, Any time, plus a "Remind me" toggle), time picker with Morning 9:00 / Afternoon 1:00 / Evening 8:00 presets, repeat (Does not repeat, Every day, Every weekday, Every week on <day>, Every month on the <date>, Custom; ends Never or On a date). "Goal added" toast.
- **Quests:** seasonal banner (locked, unlocks in 3 days), seasonal activity (time capsule), daily quests with a reset countdown and Claim (+25 for "Complete a goal"), special quests each with a Hint modal and a x100 reward (evolve, first clothing, first decoration, first micropet, visit 2 locations, friendship points).
- **Shop:** Outfit or Furniture shop, each with a shopkeeper, 6 items that refresh on a countdown, one free reroll, prices 300 / 500 / 900, Plus-only items, an "Everyday Collection", and a try-on preview on the pet or in its room.
- **Friends:** pitch modal, then the pet in a tree nest with empty "???" friend slots, "+ Add friend", and an invite reward micropet.
- **Bag:** Mail, Outfits, Furniture, locked Colours and Micropets. Mail holds the time capsule.
- **Pet tab:** profile postcard (name, pronouns, friend code), streak, collections (Micropets 0/69, Discovery 1/123, Locations 1/27).
- **Menu:** name card with friend code, widget promo, Activities (breathe, soundscapes, movements, timers, kindness, first aid), My self-care areas, My goals, Insights, Newsletters, History (day view with done goals struck through), Plus banner, community, notifications (morning check-in 7:00am, sleep wind down 9:00pm), profile, preferences (celebration style, sound, haptics, disable animations), your data (daily cloud backup), **Pause mode** ("take a break and preserve your progress"), support tools ("Repair last broken streak").

## 5. Look and feel

- White onboarding with one bright green 3D button (darker lip); blue full-bleed screens for Day 1 and streak moments; green forest for Home; teal for Quests; purple or yellow per shop.
- Rounded cards with emoji on every option. The pet is on almost every screen and reacts: "?" head tilt, lightbulb, heart hug, wave, hop.
- Rewards are loud: confetti, gems flying to the counter, toasts with the pet's face, whole-screen celebrations.
- Staggered fade-ins: text first, then the button a beat later.
- The paywall and Plus upsells appear in many places (onboarding, shop, menu, locked goal ideas).
