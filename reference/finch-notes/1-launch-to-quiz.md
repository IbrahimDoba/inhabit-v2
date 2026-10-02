# Finch recording notes, part 1 (0:00 to 3:44)

Source: sheets s000-s011, plus extra raw frames checked for gaps (0:06-0:10, 0:33-0:35, 1:11-1:21, 1:27-1:30, 1:47-1:50, 1:56-2:05, 2:11-2:20, 2:22-2:53, 3:00-3:05, 3:17-3:20, 3:30-3:39). 

## Global visual language (applies throughout)

- White background, very light grey (#F2F2F4-ish) cards/inputs with ~12-16px radius, thin light-grey border.
- Primary button: full-width (minus ~16-24px gutters), Finch green (~#52C04F), white bold label, rounded ~12px, with a darker green bottom edge/"3D" shadow (Duolingo-style pressed-look lip). Disabled button: flat light grey fill, pale grey label, no lip.
- Secondary button: light grey fill, dark grey label, same grey lip (e.g. "Shuffle", "Maybe later").
- Bold rounded sans (looks like Nunito/Rubik-like heavy weight) for titles; regular weight grey for subtitles.
- Green check-in-circle (white tick on green disc) = selected; grey "+" in a small light-grey circle = unselected multi-select option.
- The pet ("birb") is a round, chubby, pastel lavender bird (colour follows the chosen egg; here purple), dot eyes, tiny yellow beak, stubby wings, grey feet, soft grey elliptical ground shadow. It is almost always centred, above the title.
- Idle animation throughout the questionnaire: the bird alternates between neutral stance and a head-tilt with one eye squinting plus a black "?" popping up beside its head (left or right side alternates). Roughly every 1-2 s. This is the default "curious" idle.

---

## 1. Launch / splash (0:00 to ~0:02)

- iOS status bar visible (12:20, screen-recording red dot in Dynamic Island).
- Very light grey (#F4F4F8-ish) full-screen background.
- Centre: Finch logo = grey round bird head (grey feathers cap, white face, two black dot eyes, orange/red cheek circles, small yellow beak) with wordmark "Finch" beneath in a rounded, slightly playful bold font.
- No buttons. Standard static launch screen.

## 2. Welcome / auth choice (0:03 to 0:04)

- Background switches to pure white (fade transition from splash, presumably).
- Centre (slightly above middle): same grey bird-head logo, larger.
- Title: **"Finch"** (bold, large).
- Subtitle: "Your new self-care best friend."
- Lower third:
  - Primary green button: **"Hatch a new pet"**
  - Text link (dark grey, no button chrome): **"Login"**
  - Legal line (small grey): "By continuing, you agree to our **Terms of Service** and **Privacy Policy**" (the two link phrases in green).
- User taps "Hatch a new pet".

## 3. Choose your Finch Egg (0:05 to ~0:10)

- Title: **"Choose your Finch Egg!"**
- Subtitle (3 lines, centred grey): "Finches are lively, social, and inquisitive. They symbolize energy and brighter days ahead."
- Layout: six speckled eggs arranged in a hexagon/circle around a full-body baby bird in the centre. Egg positions and colours (clockwise from top): top = blue, upper-right = orange, lower-right = pink, bottom = mint green, lower-left = purple/lavender, upper-left = grey. Each egg has darker same-hue spots.
- Selected egg sits inside a rounded light-grey square tile (selection highlight). Default selection on entry = grey egg (upper-left), centre bird is grey.
- **Centre bird recolours live to match the selected egg** (grey -> blue -> orange -> green -> purple seen 0:05-0:10 as user taps through). Single select, no auto-advance.
- Bottom: green primary button **"Hatch egg"**.
- User finally selects the purple/lavender egg (lower-left) and taps Hatch egg.

## 4. Account creation: "Almost ready to hatch!" (0:11 to ~0:34)

- Top-right: text button **"Skip"** (grey). No back button on the first account step (back chevron appears on later steps).
- Pet: the chosen purple speckled egg (static), centred near top.
- Title: **"Almost ready to hatch!"**
- Subtitle: "Create an account to hatch your Finch, find friends, and save your progress"
- Input (grey rounded field, centred placeholder text): default mode is **"Phone number"** with numeric iOS keypad (0:12-0:13).
- Link below field (green, small): **"Use email instead"** -> switches field to **"Email"** placeholder, and link text changes to **"Use phone number instead"** (0:15).
- Button: **"Next"**, disabled (grey) until input valid; turns green once a valid-looking email is typed (0:32 at "...@gmail.co" becomes enabled; exact validation rule uncertain, seems to be basic email regex).
- Input has centred text, green cursor, clear (x in grey circle) button at right once non-empty.
- Standard iOS keyboard with QuickType suggestions; nothing custom.
- On tap Next: button content becomes a small grey spinner, button greyed (0:33-0:35 loading ~2 s).

## 5. Email verification: "We emailed you" (0:35 to ~0:50)

- Now has a **back button** top-left (chevron in a light-grey circle) and "Skip" top-right.
- Egg illustration same as before.
- Title: **"We emailed you"**
- Subtitle: "We sent a code to ibrahimdoba55@gmail.com to verify your email"
- Input placeholder: **"6-digit code"**, numeric keypad with iOS "From Gmail 019953" one-time-code autofill suggestion (so field uses textContentType oneTimeCode).
- Under field: grey countdown text **"Resend code in 30s"** ticking down (30s -> 24s -> 20s -> 16s). Presumably becomes a tappable "Resend code" at 0 (not seen).
- "Next" disabled until 6 digits.
- Email arrives as iOS notification banner ("Finch Care App - Verify your email address - To verify your email address, enter this code in the Finch app: 019953 If you didn...").
- Uncertain: after entering 6 digits it seems to auto-submit (we jump from "0199" at 0:49 to Create password at 0:51 without seeing a Next tap).

## 6. Create password (0:51 to ~1:16)

- Back chevron + Skip.
- Egg illustration.
- Title: **"Create password"**
- Subtitle: "Keep your account secure by creating a password"
- Two fields: **"Password"** and **"Re-enter password"**, each with an eye-slash (show/hide) icon at the right. Masked dots.
- Inline validation errors in red, small, centred under the relevant field:
  - "Password must be at least 6 characters" (under first field while typing, 0:55)
  - "Passwords do not match" (under second field, 1:04)
- Next disabled until valid, then green (1:06-1:09).
- On tap: spinner in grey button for ~5-6 s (1:10-1:15), then button shows **green checkbox emoji + "Success!"** (1:16) in the grey button. Then auto-advance.
- Unrelated iOS notification ("Salat Time - Dhuhr 12:22 PM") overlaps at top: ignore, not part of the app.

## 7. Hatching animation (1:17 to ~1:21)

- Screen clears to white, only the big purple egg centred (larger than before, mid-screen).
- 1:17-1:18: a dark zig-zag crack appears at the top of the egg.
- 1:19: egg squashes (flattened, wider "squash" frame), crack extends across; implies wobble/squash-and-stretch shake.
- 1:20: egg gone; baby purple bird stands centre with a **soft lavender radial sunburst / light rays** behind it. Bird is mid-hop (one foot kicked up, wings out) = celebration. Text below: **"You hatched a birb!"** (bold). Sound likely (chirp/fanfare), uncertain.
- Auto-transitions (no button) to next screen after ~1-2 s.

## 8. Pronouns (1:21 to ~1:24)

- Bird centred top (neutral stance), no rays.
- Title: **"You hatched a birb!"**
- Subtitle: "Your birb's pronouns"
- Three option cards (full width, stacked):
  1. **he/him** (heart icon)
  2. **she/her**
  3. **they/them**
- Selection look: selected card has a light-blue/cyan border, heart icon filled light blue, text dark, and a blue check-circle at right. Unselected: grey outline heart, grey text. Note the accent here is **blue, not green**.
- he/him appears already selected when the screen first renders (1:21), so likely a default preselection (uncertain; may have been tapped instantly).
- Single select, requires the green **"Next"** at bottom.

## 9. Name your birb (1:24 to ~1:30)

- 1:24: transitional frame, bird only (content fades in after).
- Title: **"What do you want to name your baby birb?"** (2 lines)
- Subtitle: "You can change this later."
- Text field prefilled with a random name (seen "Apricot", then "Sparkles", then briefly "Hope"), centred text, clear (x) button.
- Two buttons side by side: **"Shuffle"** (grey secondary, left) and **"Next"** (green, right). Shuffle cycles random name suggestions. Keyboard opens (text keyboard).
- User keeps **Sparkles**.

## 10. Choose a trait (1:30 to ~1:47)

- Title: **"Choose a trait for Sparkles"** (uses pet name)
- Subtitle: "Sparkles cares about…"
- Six option rows (emoji left, label, full width cards):
  1. 🤔 **Curiosity**
  2. 😎 **Resilience**
  3. 😍 **Compassion**
  4. 🧐 **Logic**
  5. 🤠 **Confidence**
  6. 😌 **Security**
- Single select. Selected row: green border, emoji enlarges, label goes bold, green check-circle right. Next always green (a default is preselected: Logic seems to be the initial one at 1:30; uncertain).
- **Key detail: the bird performs a trait-specific animation/pose each time an option is tapped:**
  - Curiosity: wing on chin, thinking; "?" marks floating above (1:31, 1:35)
  - Resilience: black headband (ninja/sweatband), fists up, determined (1:36)
  - Compassion: floating red hearts around it, blushing/happy (1:38)
  - Logic: sitting at a small wooden desk writing on a long paper scroll with a quill/pen (1:33, 1:40, 1:46)
  - Confidence: dancing with a blue boombox/radio, music notes floating, eyes closed happy (1:42-1:43)
  - Security: hugging a red heart / holding something to chest, content (1:44)
- User ends on **Logic**, taps Next.

## 11. Chat intro: pet asks your name (1:48 to ~1:52)

- Layout switches to a "conversation" style: grey speech bubble at top (left-aligned tail at bottom-left), bird below it centred.
- Bubble text: **"Cheep cheep, thanks for hatching me. If my name is Sparkles, what's your name?"**
- Bird: waving a wing (1:48 frame shows wing raised, eyes happy), then neutral.
- Input placeholder: **"Name for Sparkles's human…"** (note the literal "Sparkles's"), caps keyboard.
- Next disabled until text, then green. User types "Silver" (inferred from next bubble).

## 12. Chat: What is self-care? (1:53 to ~2:05)

- Bubble: **"Nice to meet you, Silver! They call me a self-care pet. What is self-care?"**
- Bird idles with "?" alternating left/right, head tilt.
- Two large coloured answer "reply bubbles" stacked in the lower half (full width, rounded ~16px, white text, left-aligned, no icons):
  1. Orange (#E89A2E-ish): **"Self-care means doing what you can, even when you're not feeling your best."**
  2. Magenta/pink (#E0298A-ish): **"Self-care means taking care of your body, mind, and relationships, while having fun!"**
- They fade/slide in (1:54 shows them at ~40% opacity, 1:55 fully opaque). Tap an option = answer; no Next button. Both answers are "correct" (flavour).
- The user waited ~10 s then tapped one (which one is uncertain; the reward that follows is Compassion either way).

## 13. Reward: "Wow! When you take care of yourself…" (2:06 to ~2:09)

- Bubble: **"Wow! When you take care of yourself, you take care of me, too! Let's do it together, cheep!"**
- Bird hugging a big red heart, eyes closed happy (^ ^), swaying/bouncing (foot lifts between frames).
- **Stat toast**: cyan/sky-blue (#3FD2F5-ish) rounded pill card under the bird with 😍 emoji at left: small line "Sparkles gained", bold line **"+3.2 Compassion"**. It fades in (2:06 faint -> 2:07 full).
- Next button fades in after ~1 s (2:07 ghost -> 2:08 full green). Then Next.

## 14. Notification primer: "Get reminders from Sparkles" (2:10 to ~2:14)

- Title top-left-ish (large bold): **"Get reminders from Sparkles"**
- Mock iOS notification card: grey rounded rectangle, app icon (grey Finch bird face) at left, bold **"From Sparkles"**, "now" at right, body **"Remember to drink water!"**
- Bird below, waving/hopping excitedly.
- Buttons at bottom: green **"Turn on notifications"**, grey **"Maybe later"**.
- Tapping "Turn on notifications" triggers the system iOS permission alert (2:13-2:14): **"“Finch” Would Like to Send You Notifications"** / "Notifications may include alerts, sounds, and icon badges. These can be configured in Settings." / **Don't Allow** | **Allow**. Background dims grey. User taps Allow (next screen continues).

## 15. Transition card: "Let's learn a bit about you!" (2:15 to ~2:16)

- Bird hugging red heart (same happy pose as reward), centred mid-screen.
- Title: **"Let's learn a bit about you!"**
- Subtitle: "Sparkles is curious about how he can grow with you." (uses chosen pronoun "he")
- Green **"Next"** at bottom.

## 16. Questionnaire shell (2:17 onward)

- Header row: back chevron in light-grey circle (left), then a **segmented progress bar**: thin light-grey track with 3 node circles dividing it into 4 sections. Green fill grows left to right; each completed section's node becomes a green circle with a white check. Fill advances by a partial step per answered question within the current section.
- Small uppercase grey section label centred under bar: **ABOUT YOU**, **ENERGY & ACTIVITY**, **HOW'S LIFE**, **SUPPORT AREAS**.
- **The bar re-scales dynamically**: at 3:16 (after choosing support areas) the three check nodes shift left (from about 25/50/75% to about 18/35/53%) because follow-up questions were appended to the Support Areas section. So section widths are proportional to question counts.
- Bird centred under label with idle "?" head-tilt animation. When the list is long, the page scrolls and the bird/title scroll away under the fixed header.
- Single-select questions: **no Next button; tapping auto-advances**. The tapped row briefly shows the green border + green check (e.g. 2:30 "Sometimes easy…") then the next question slides in.
- Multi-select questions: rows have a grey "+" at right; selected rows get green border + green check; a green **Next** pinned at bottom is disabled (grey) until at least one selection.

### 16a. Age (2:17 to ~2:20) — ABOUT YOU, single select, auto-advance
- **"How old are you?"** / subtitle "This helps us personalize your experience"
- Options (centred text, no emoji): **Under 18**, **18-24**, **25-34**, **35-44**, **45-54**, **55-64**, and a 7th card cut off at the bottom edge (almost certainly "65+", not visible: uncertain). List scrolls.

### 16b. Gender (2:21) — ABOUT YOU, single select
- **"What's your gender?"**
- **Male**, **Female**, **Non-binary** (centred text cards), then plain grey text link **"Prefer not to answer"** (no card).

### 16c. Prior use (2:22 to ~2:24) — ABOUT YOU, single select
- **"Have you used Finch before?"**
- 🍼 **"No, this is my first time!"**
- 🍲(pot/bowl emoji) **"Yes, but I'm starting fresh"**
- On answer, first node turns into a green check and label switches to ENERGY & ACTIVITY.

### 16d. Sleep (2:25 to ~2:27) — ENERGY & ACTIVITY, single select
- **"How long do you usually sleep at night?"**
- 😴 **Less than 5 hours**
- 🛌 **5-7 hours**
- 🌙 **7-9 hours**
- 🌞 **More than 9 hours**

### 16e. Getting up (2:28 to ~2:30) — ENERGY & ACTIVITY, single select
- **"How easy is it for you to get out of bed?"**
- 🐬 **"Very easy, I get up pretty quickly"**
- 🌱/🪴 (sprout on a pole, possibly a potted seedling) **"Sometimes easy, some days can be hard"** (user selected: green border + check shown)
- 🧸 **"Hard, I often struggle to get out of bed"**

### 16f. Activity (2:31 to ~2:39) — ENERGY & ACTIVITY, single select
- **"How active are you during the day?"**
- 🏃 **"I'm on the move most of the day"**
- 🚶 **"I balance being stationary with some movement"**
- 🪑 **"I don't move much and want to be more active"**
- 🌻 **"I have conditions that limit my movement"**

### 16g. Overwhelm (2:40 to ~2:43) — HOW'S LIFE, single select
- **"How often do you feel overwhelmed?"**
- 😫 **"I feel overwhelmed several times a week"**
- 🙁 **"I have a few stressful days each month"**
- 😌 **"I manage and overcome stress pretty well"**

### 16h. Support network (2:44 to ~2:48) — HOW'S LIFE, single select
- **"How many people can you lean on for support in tough times?"**
- 🌳 **3 or more**
- 🌿 **2**
- 🌱 **1**
- 🍃 (leaf blowing in wind) **Just me**

### 16i. Routine happiness (2:49 to ~2:53) — HOW'S LIFE, single select
- **"How happy are you with your current routine?"**
- 🥳 **"Completely, I take care of myself well"**
- 😌 **"Slightly, I'd like to see some improvements"**
- 😮 **"Not at all, I expect to see a major change"**

### 16j. Mental health challenges (2:54 to ~3:00) — SUPPORT AREAS, MULTI select
- **"Do you struggle with any of these mental health challenges?"** (bird has no subtitle)
- Centred-text cards with "+" at right (no emoji). Two-line cards have a small grey parenthetical subtitle:
  1. **Depression**
  2. **Bipolar Disorder**
  3. **Anxiety**
  4. **ADHD** / "(Attention-deficit/hyperactivity)"
  5. **PTSD** / "(Post-traumatic stress)"
  6. **OCD** / "(Obsessive-compulsive)"
  7. **Other** (+)
  8. **I'm not sure** (+)
  9. **I don't have mental health issues** (no "+" icon: likely exclusive option)
  10. Plain grey text link **"Prefer not to answer"** (no card)
- Next disabled until selection. User picks **I'm not sure** (green border + check), Next goes green (3:00).

### 16k. Support areas (3:01 to ~3:15) — SUPPORT AREAS, MULTI select
- **"What areas would you like support with?"**
- Emoji rows with "+":
  1. 🌻 **Self-acceptance and confidence**
  2. 😴 **Sleep better**
  3. 🎯 **Boost focus and productivity**
  4. 🙏 **Appreciate the good things**
  5. 🍎 **Build healthy eating habits**
  6. 🌱 **Build and keep a routine**
  7. 👟 **Be more active**
  8. 🏔️ **Manage stress and anxiety**
  9. ☎️ **Strengthen social skills and connections**
  10. 🪥 **Stay fresh and clean**
- When the first option is tapped the bird shows a **lightbulb idea** pose: wing to chin, yellow 💡 above head (3:06). This "lightbulb" reaction recurs on each multi-select follow-up question when the first item is chosen (3:21, 3:36).
- User selected all 10 (3:15), then Next. This caused the progress bar re-scale noted above.

### 16l. Follow-up: self-acceptance (3:16 to ~3:28) — SUPPORT AREAS, MULTI select
- **"Which topics make it harder for you to feel confident or accept yourself?"**
  1. 🔋(green battery/medkit-like) **Energy levels**
  2. 🧡 **Body image**
  3. ☎️ **Social skills**
  4. 👟 **Fitness level**
  5. 💪 **Overall health**
  6. 👫 **Relationships**
  7. 🏔️ **Chronic pain**
  8. 🎯 **Time management and procrastination**
  9. 🌶️ **Managing emotions**
  10. ✈️ **Motivation**
  11. ••• **Other**
- User picked Energy levels, Body image, Social skills.

### 16m. Follow-up: overwhelm (3:29 to ~3:43) — SUPPORT AREAS, MULTI select
- **"What tends to overwhelm you the most?"**
  1. 🌸 **Lack of time for yourself**
  2. 🤹 **Too many responsibilities**
  3. 🔭 **Perfectionism and high expectations**
  4. 🤝 **Relationship issues**
  5. 🏫 **Work or school stress**
  6. 👨‍👩‍👧 **Taking care of others**
  7. 🏛️ **Financial concerns**
  8. 📈 **Major life changes**
  9. 🤔 **Making decisions**
  10. 🕊️/🦅 (bird-like emoji, uncertain) **Mental or physical health issues**
  11. ••• **Other**
- **"Other" free text**: selecting Other gives it the green border/check AND inserts a grey free-text input directly below it (cursor active, keyboard opens, 3:33). Next is green while Other is selected even with empty text. User then deselects Other (3:35 Next back to disabled; input presumably collapses).
- User then picks Too many responsibilities, Perfectionism and high expectations, Financial concerns.

### 16n. Follow-up: healthy eating (3:44, continues in part 2) — SUPPORT AREAS, MULTI select
- **"What makes it hard for you to stick to healthy eating?"**
  1. 🥘 **I struggle with portions**
  2. 🍴 **I tend to skip meals**
  3. 🕐 **No time to cook or plan meals**
  4. 🥦 **I don't enjoy healthy food**
  5. 🍿 **I snack too often**
  (list continues off-screen)
- Implies: one follow-up question is generated per selected support area (self-acceptance, stress/overwhelm, eating, ...). Order so far follows the support-area list order, skipping sleep/focus/appreciate (uncertain whether those have follow-ups later or none).

---

## Things easy to miss

- Egg colour choice recolours the preview bird immediately; hatched bird keeps that colour.
- Account step is mid-flow (after egg choice, before hatching), with a "Skip" on every account screen. Phone number is default, email alternative.
- OTP code field supports iOS autofill; resend countdown 30s.
- Password step: success state rendered inside the button ("✅ Success!").
- Hatch sequence: crack -> squash -> sunburst + hop + "You hatched a birb!". No button; auto-advance.
- Pronoun accent is blue, not green; he/him appears preselected.
- Name screen has Shuffle random names.
- Trait selection has a unique pet animation per trait (strong delight moment).
- Chat-style onboarding uses the chosen pet name and user name in bubbles; answers are big coloured tappable bubbles, no Next.
- Stat reward toast "Sparkles gained +3.2 Compassion" (decimal stat values).
- Soft notification primer before the system prompt, with a fake "From Sparkles: Remember to drink water!" preview.
- Pronoun used in copy ("how he can grow").
- Questionnaire: single-select auto-advances after showing a check; multi-select needs Next; exclusive options lack "+"; "Prefer not to answer" is a text link.
- Progress bar is 4 sections with check nodes and re-scales when conditional follow-ups get added.
- Bird's idle "?" head tilt runs continuously; lightbulb pose on first multi-select pick.

