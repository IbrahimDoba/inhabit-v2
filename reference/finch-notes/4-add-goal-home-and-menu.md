# Finch recording notes, part 4: 8:04 to 10:03 (sheets s034-s046)

Timestamps are m:ss from the contact sheets. Frames are about 1 s apart, with occasional gaps (for example 8:05 to 8:09, 8:32 to 8:36, and 8:55 is missing).

---

## 1. Goal creation card: "Take a shower" (8:04, 8:12-8:13, 8:18)

**Purpose:** a quick-add goal composer. At 8:04 the user is part-way through adding a goal. The screen before it (in part 3) is probably a goal-suggestion list.

**Layout**
- Full-screen blue background (medium sky blue, about #1E9BE0). A small round white-on-blue "x" close button sits top-right, above the card.
- A white rounded card sits in the upper half of the screen:
  - Top-left: the goal icon, a blue rounded-square "blob" with a white bathtub or shower illustration.
  - Title field: **"Take a shower"**. It is editable, the text cursor is green and the keyboard is up. It is bold and dark.
  - Three metadata rows, each with a small circular pastel icon and grey text:
    - Toothbrush/brush icon (light blue): **"Hygiene"**. This is the category or self-care area.
    - Green clock icon: **"Any time"** at 8:04. After the change at 8:11 it reads **"Start the day"** (8:12 onward).
    - Green recycle/repeat arrows icon: **"Daily"**.
  - Footer strip (light grey): **"More options"** as grey text link on the left, and a green pill button **"Save"** (white text, darker green bottom edge for a 3D look) on the right.
- The iOS keyboard shows QuickType suggestions "shower", showers, showered.

**Mechanics**
- Tapping each metadata row opens its own bottom sheet (Time of day, Repeat). Tapping "Hygiene" presumably opens a category picker, but this was not seen.
- The card stays visible (dimmed, and shifted up behind the sheet) while the sheets are open.
- 8:12: the card is dimmed (grey overlay) while a sheet dismisses. 8:13: back to normal with "Start the day" applied.
- 8:18: back on the card after the Repeat sheet. The values are still Hygiene / Start the day / Daily. "Save" is then tapped, which leads to the Home screen at 8:19 with a toast.

## 2. "Time of day" bottom sheet (8:05, 8:11)

- Background is dimmed to dark navy. The goal card peeks behind at the top, and the dimmed "x" is visible.
- White sheet with an "x" close at top-left and no title bar. Inside is a white rounded panel:
  - Header row: green clock icon + **"Time of day"**.
  - A 2x2 grid of option tiles, each with an illustrated icon above a label:
    - **"Start the day"** (orange sun)
    - **"Afternoon"** (green mountain with an orange sun)
    - **"Evening"** (sunset: orange semicircle over blue lines)
    - **"Bedtime"** (purple crescent moon with sparkles)
  - A full-width tile below: **"Any time"**. At 8:05 it is selected, shown by a green outline border.
- A separate panel below: bell icon (orange/yellow) + **"Remind me"** with an iOS-style toggle, off at 8:05.
- At 8:11: **"Start the day"** is selected (green border). "Remind me" is toggled ON (green) with the subtitle **"9:00am"** in green. A second "Time" sheet is sliding in or out at the bottom (its "x" and "Time" header are visible).

## 3. "Time" reminder picker sheet (8:09)

- Stacked sheet on top of the Time of day sheet, with "x" top-left and the centered title **"Time"**.
- An iOS wheel picker with hour / minute / AM-PM columns. The selected row reads **9 : 00 AM**. Neighbouring values visible: 7/58, 8/59, 10/01 PM, 11/02.
- Three preset chips (light grey rounded rectangles, bold label and time below):
  - **"Morning" 9:00am**
  - **"Afternoon" 1:00pm**
  - **"Evening" 8:00pm**
- A full-width green **"Save"** button.
- Flow: turning on Remind me opens this picker. Save returns to Time of day with "Remind me 9:00am" shown.
- Uncertain: whether choosing "Start the day" sets the reminder default to 9:00am. The picker showed 9:00 AM before the tile was visibly selected.

## 4. "Repeat" bottom sheet (8:14, 8:16, 8:17)

- Sheet with an "x" at top-left and the centered title **"Repeat"**. Its background is light grey and it contains white grouped panels:
  - **"Does not repeat"** (single-row panel)
  - **"Ends"** with value **"Never"** and a chevron (down arrow, grey). At 8:16 it is expanded: "Never" turns green with an up chevron, and the sub-rows are **"Never"** (green check) and **"On a date"** (right chevron).
  - Options panel: **"Every day"** (green filled circle check), **"Every weekday"**, **"Every week on Sun"**, **"Every month on the 27th"**, **"Custom..."**. The recording date is Sun Sep 27, so these options are generated from the current date.
- 8:17: Ends collapsed again, still Never / Every day. The sheet closes at 8:18.

## 5. Home screen (goals list) after adding a goal (8:19 to 8:36)

**Overall layout (Home tab)**
- Green background (grass green, about #7CC35A). The top of the screen is a scene area (forest) that scrolls away. At 8:19-8:36 the list is scrolled up so the scene is hidden or blurred at the top.
- Top-left: a hamburger menu icon (three white lines in a rounded square) that stays fixed. Top-right, when scrolled: a **gem/rainbow-crystal currency pill** (white pill, iridescent crystal icon, count in dark blue). It appears at 8:26 with **265**, then **268** (8:28, 8:30) and **269** (8:31) as rewards land.
- Blurred header remnants at 8:19/8:21/8:22 show the "Adventuring" progress bar and "5 goals left for today!".
- **Goals header row** (8:22): calendar icon + **"5 goals left for today!"** (white bold). On the right are a sliders/filter icon and a 4-dot grid icon (a view toggle, or maybe arrange). This later changes to **"3 goals left for today!"** (8:37).
- **Section "Start the day"** (small white label, thin divider line, "+" circle on the right to add a goal to that section):
  - Goal card: blue bathtub icon, **"Take a shower"**, subtitle **"Hygiene"** (grey). Right side: **"5"** with a small orange lightning bolt (the energy reward), and a square white check button with a green checkmark. The check button is a light-grey raised square.
  - A drag-handle dotted grip sits at the far left edge of each card (tiny vertical dots).
- **Promo card** (darker green rounded panel, "x" top-right to dismiss): title **"Building habits is better together"**, body **"With friends by your side, no goal is out of reach!"**, a white pill button **"Buddy up"**. Artwork: the lavender pet (Sparkles) hugging a smaller grey/lavender bird friend. Both are smiling, with pink cheeks.
- **Section "Any time"** with a dropdown chevron (collapsible) and a "+" on the right:
  - **"Drink water"** (glass of water icon), 5 energy + check
  - **"Take a stretch break"** (giraffe icon), 5 energy + check
  - **"Do one thing that makes me happy"** (smiling face icon, two lines), 5 energy + check
  - **"Take 3 deep breaths"** (green leaf/breath icon), 5 energy + check
- At the bottom of the list: a darker green pill row with a "+" and **"Add a goal"** (8:21, 8:36).
- **Bottom tab bar** (green, white icons with labels): **Home** (orange house, selected state has a lighter rounded highlight behind it), **Quests** (scroll or compass card icon), **Shop** (red/white striped storefront), **Friends** (green tree), **Bag** (red sack or apple-like bag), **Sparkles** (lavender pet face, which is the pet's name). There are 6 tabs.

**Toast at 8:19:** a dark rounded snackbar over the list: pet avatar (lavender bird face) + **"Goal added"** with a sparkle emoji. The new goal appears in the "Start the day" section at the top.

**Completion flow (8:22 to 8:31)**
- 8:22 and 8:25: the full list has 5 open goals: Take a shower, Drink water, Take a stretch break, Do one thing that makes me happy, and Take 3 deep breaths. The unchecked check button is a white/light-grey raised square with a green check glyph.
- 8:23-8:24: the list scrolls down to show the top scene (forest, pet walking with a red backpack) and the **"Adventuring"** bar with **"back in 7:57:36"** / **"7:57:35"**.
- Between 8:25 and 8:26 the user checks off **Drink water** and **Do one thing that makes me happy** in quick succession.
- 8:26: Drink water has already disappeared from the list. Completed goals collapse out of the Home list. Confetti (purple, pink and multicolour rectangles plus rainbow-crystal sprites) bursts around the "Do one thing..." card. The gem counter pill appears top-right showing **265**. A dark snackbar sits above the tab bar: a purple flag/ribbon icon, **"Hooray!"** (bold) / **"First time completion!"**, and a round "..." button on the right.
- 8:28: the counter shows **268**, and the pill is semi-transparent as it pops or fades in. The snackbar is unchanged.
- 8:29: the confetti is gone. "Do one thing..." is still in the list, fading.
- 8:30: "Do one thing..." has collapsed out, leaving Take a stretch break and Take 3 deep breaths. A second confetti burst plays with rainbow-crystal sprites flying toward the counter (still **268**). The snackbar changes to the pet-face avatar + **"You did it!"** / **"First time completion!"** + "...". This is the second completion's toast, so toasts queue one per completion.
- 8:31: the counter ticks to **269** and heavy confetti continues.
- Interpretation (uncertain): each completion gives rainbow-crystal currency, with the counter animating up in steps (265 to 268 to 269). The toast text rotates ("Hooray!", "You did it!"). "First time completion!" marks a goal's first-ever completion. The "5 lightning" on each card is energy for the pet's adventure. It is shown as a per-goal reward and is separate from the gem counter.
- 8:37: the header now reads **"3 goals left for today!"** (shower, stretch break, deep breaths). The History page at 9:44 confirms Drink water and "Do one thing..." were completed, along with Get out of bed, Brush teeth and Wash my face, which were done before this part.
- **Completed-goal action sheet (8:32)**: tapping the snackbar's "..." button (most likely) opens a bottom sheet over dimmed Home: an "x" top-left, the goal icon (smiley) with a green check badge, the title **"Do one thing that makes me happy"**, the subtitle **"Completed Today, Sep 27"**, and a list of rows:
  - curved-arrow icon **"Undo complete"**
  - bar-chart icon **"See stats"**
  - pen icon **"Reflect"**
  - pencil icon **"Edit"**
- 8:36: the sheet is closed. The list shows Take a shower (Start the day), the promo card, then Any time: Take a stretch break and Take 3 deep breaths, then "+ Add a goal". Completed items are hidden from the list. The header is blurred.

## 6. Home screen, scene view: pet adventuring (8:37 to 8:43)

- Scrolled to top. A large illustrated forest scene fills the upper about 45%: tall trees, pine trees, red-and-white mushrooms, flowers, grass, a small bird on a branch, and a tree stump.
- **Pet (Sparkles):** a lavender round bird with small wings, a red backpack or bedroll on its back, and a small red neckerchief or scarf. At 8:37 it faces left, walking. At 8:38-8:43 it walks right to left and back across the forest clearing (position shifts between frames: center-left, then center, then right). It is a looping walking animation, with the pet "on an adventure". The eyes are dot eyes, the expression content.
- **Adventure card** (translucent green panel under the scene): **"Adventuring"** on the left, **"back in 7:37:22"** on the right, counting down live (7:37:21, :20, :19, :18, :17, :16, one second per frame). Below is a progress track: a yellow lightning-bolt circle at the left, the pet face token right next to it (progress near the start), a dotted line, and a yellow **"?"** circle at the end (the mystery destination or reward).
- Below it: **"3 goals left for today!"** header, "Start the day", Take a shower, and the "Building habits is better together" promo card peeking.
- **Tapping the scene or pet (8:39-8:40, 8:42-8:43):** a dark toast appears mid-screen: **"Sparkles is away on an adventure! He will share a story when done!"** The pet's pronoun is **"He"**.
- Countdown drift: 7:57:36 at 8:23 and 7:37:22 at 8:37 is 20 min over 14 s of recording, so goal completions shortened the adventure timer. Each completion's energy speeds up the adventure (inferred from the numbers; the drop happened during the completion burst).

## 7. Hamburger menu (side/main menu page) (8:44 to 9:03)

Opened via the top-left hamburger. It is a full-screen page with a pale blue-grey background (about #CFDCEA), a back chevron "<" at top-left, and white rounded grouped cards.

**Top section (8:44):**
- Card: **"Sparkles & Silver"** (pet name & user name, with a lighter "&"), and below it the friend code **"KFVK1B824Q"** with a small copy icon.
- Purple promo banner: pet avatar illustration (the bird with a heart and phone) + **"Add the widget"** / **"Stay connected to Sparkles from your home screen!"** + a white **"Add"** button.
- 2-column grid of tiles (white, icon + label):
  - **"Activities"** (blue lightning tile), **"My Self-Care Areas"** (colored dots)
  - **"My Goals"** (orange checkbox clipboard), **"Insights"** (bar chart)
  - **"Newsletters"** (newspaper), **"History"** (calendar)
- **Finch PLUS** banner (blue/indigo): **"Finch"** + a **"PLUS"** badge pill, **"Plus Users are 2x more likely to stick with self-care goals"**, and a white **"Try for free"** button. This is a paywall prompt.
- **COMMUNITY** (section label in small caps):
  - egg icon **"Did someone invite you?"** >
  - envelope-with-heart icon **"Invite friends"** >
  - people icon **"Join our Finch communities"** >
  - rainbow icon **"Become a Guardian"** / subtitle **"Sponsor Finch Plus for others"** >
  - gift icon **"Shop Finch Merch"** >
- **ACCOUNT**:
  - bell **"Notifications"** >
  - pet face **"Profile"** >
  - ruler/triangle **"Preferences"** >
  - purple floppy **"Your data"** >
  - wheat/plant icon **"Pause mode"** / **"Take a break and preserve your progress."** with a toggle (off)
- **SUBSCRIPTION**:
  - sparkle icon **"Finch Plus"** with the value **"None"**
  - **"Restore Finch Plus purchase"** >
- **SUPPORT**:
  - orange gear **"Support tools"** >
  - blue question circle **"Help center"** >
  - green document **"About"** >
  - red speech bubble **"Report issue"** >
- Footer (centered grey): **"Finch v3.73.210 (1681)"** / **"Latest Asset Pack: september-2026:2"**.

**Sub-flows:**
- 8:53-8:54: tapping **Report issue** opens a bottom sheet over the dimmed menu: "x", **"Include Backup File?"**, **"Including your backup file can help us resolve issues faster."**, a green button **"Yes, report with Backup File"**, and a grey button **"No, report without Backup File"**. It is dismissed with x (8:56 is back on the menu).
- 8:57: **About** page with the header **"About"** and rows **"Privacy"** >, **"Terms of use"** >, **"Science behind Finch"** >.
- 8:58-8:59: **Help center** page (slides in from the right, shown as a push animation at 8:58): **"FAQ"** >, **"Report issue"** >.
- 9:00-9:01: **Support Tools** page with the section **"TOOLS"** and one row: **"Repair last broken streak"** >.
- 9:03: tapping **Restore Finch Plus purchase** shows a dark toast at the bottom: **"Checking past purchases (may take up to 10 seconds)..."**.
- Sub-pages push in from the right with the same pale-blue background, a back chevron and a centered title.

## 8. Restore purchase: brief Plus paywall flash (9:03 to 9:08)

- 9:03-9:04: after **Restore Finch Plus purchase** is tapped, the dark toast reads **"Checking past purchases (may take up to 10 seconds)..."**.
- 9:05-9:06: a **Finch Plus paywall** slides in from the right, as a full-screen indigo/purple page. It is only partly on screen in the frames, so it was probably shown and then dismissed, or it was part of the restore flow. Full content (from raw f0547):
  - Artwork: three pastel birds (green, yellow, blue) with sprouts or flowers on their heads, smiling and eyes closed.
  - Headline: **"People with Plus are 2x better at sticking with their goals!"**, with "2x better" in yellow/orange.
  - Benefit list (a darker indigo card, each row with a round character illustration):
    - **"Unlock your potential"** / "Turbo-charge your self-care with over 150 more exercises" (a bird with a padlock)
    - **"Daily deals"** / "Discounts and customizations, just for you" (a clothing item with a price tag)
    - **"Support our mission"** / "Help us keep making Finch the best app we can!" (a bird holding a heart)
  - Urgency strip (pink/magenta): **"Limited-time 40% off! Expires in 11h 29m"**
  - Primary button: **"Try for $0.00"** (light lavender, large)
  - Secondary text link: **"Maybe later"**
- 9:07-9:09: back on the menu with a dark toast **"Purchase restored!"**. The Finch Plus row still reads **"None"**, so nothing was actually restored.

## 9. "Your Data" page (9:09 to 9:11)

- Title **"Your Data"**, back chevron.
- **CLOUD BACKUPS** group:
  - **"Last Backup"**: "Today at 12:26pm"
  - **"Next Backup"**: "Tomorrow at 12:26pm"
  - **"Advanced Data Protection"**: "Off" >
  - **"Only Backup on WiFi"**: toggle ON (green)
- Caption: **"Backups happen automatically every 24 hours when the app is open. Learn More."** ("Learn More." is underlined.)
- **LOCAL DATA** group:
  - folder icon **"Manual Backup"** / "Create or load a backup file" >
  - tools icon **"Advanced Management"** / "Tools for power users" >
- 9:11: pops back (slide-right transition).

## 10. "Preferences" page (9:12 to 9:15)

- Title **"Preferences"**.
- **APP EXPERIENCE**:
  - "Manage your visitors" >
  - "Celebration" / "Choose how you'd like to celebrate your goals and good vibes." >
  - "Seasonal events" >
  - "Enable Quizzes in Activities": toggle OFF
  - "Enable daily check-in streaks": ON
  - "Auto tagging": ON
  - "Muted tags" >
  - "Muted exercises" >
  - "Add pet widget to home screen" >
  - "Waking hours" >
  - "Enable community event reminders": ON
- **APP SETTINGS**:
  - "App lock": OFF
  - "Metric system": ON
  - "Sound effects": ON
  - "Haptic vibration": ON
  - "Disable animations": OFF
- Anything below "Disable animations" was not visible.

## 11. "Profile" page (9:18)

- Title **"Profile"**.
- **YOUR PET**: "Pet name": **Sparkles** >; "Pet pronouns": **He/Him** >; "Friend code": **KFVK1B824Q** (no chevron).
- **YOU**: "Your name": **Silver** >; "Your birthday": **Not Set** >; "Email & Password": **i\*\*\*5@gmail.com** >; "Phone number": **None** >.
- Caption: **"Add your phone number to connect with friends and keep your account secure"**.
- White button **"Verify phone number"**, and a grey button with red text **"Delete Account"**.

## 12. "Notifications" page (9:21 to 9:22)

- Title **"Notifications"**. Section **PUSH NOTIFICATIONS**:
  - "Morning check in" / **7:00am** (green subtext): ON
  - "Sleep wind down" / **9:00pm**: ON
  - "Sparkles' Newsletters" >
  - "Messages from Sparkles": ON
  - "Good vibes": ON
  - "Streak reminders": ON
  - "Question updates": ON
- Separate card: "Email Notifications": **Not Set** >.

## 13. Shop Finch Merch: external web (9:23 to 9:28)

- Tapping **Shop Finch Merch** opens an in-app Safari view (SFSafariViewController) at **shop.finchcare.com**, with an "x" close and a loading bar. Its bottom toolbar has back, share, x and compass. It is blank or white while loading (9:25), then the user closes it.
- 9:28 onward: a dark toast **"Visit shop.finchcare.com for merch!"** persists across the menu and the Guardian page, up to about 9:31.

## 14. "Become a Guardian" page (9:29 to 9:32)

- A full page with a rainbow hero illustration (sparkles, clouds). Characters: a red/orange bird with a big heart, a small grey bird, a yellow bird in a pink bonnet holding a heart, and a blue bird carrying a basket of hearts. There are baskets of hearts in the foreground.
- Title (white with a heavy black outline, cartoon style): **"Become a Guardian"**. Subtitle (teal): **"Sponsor Finch Plus for those who cannot afford it"**.
- Cream/beige lower panel:
  - **"SEPTEMBER 2026 FUNDRAISER"** (small caps, brown)
  - At 9:29-9:30 it is loading: a spinner, an empty progress bar, "0% to next milestone", "0 / 0 achieved".
  - Loaded (9:31): **"14,114 of 21,075 sponsorships raised"** (14,114 large and bold). A progress bar about 2/3 filled has a star milestone marker, **"67% to next milestone"**, and **"1 / 4 achieved"** with an info or arrow circle.
  - Big green button **"Gift Sponsorships"**
  - Card: **"Interested in getting sponsored?"** / "We hold a raffle for free access to Plus for people who won't be able to afford it, sponsored by our amazing Guardians." with a tan button **"Enter the raffle"**.
  - Below that, cut off: bold text starting "Past Guardianship..." (uncertain).
- 9:32: slides back out.

## 15. "Join our Finch communities" page (9:34)

- Title **"Join our Finch communities"**. Rows, each with a brand icon and chevron: **"Join Discord Server"**, **"Join Facebook Group"**, **"Join Subreddit"**, **"Join Heylo Group"**, **"Follow Finch on Instagram"**, **"Follow Finch on TikTok"**.
- A separate card: star icon **"Rate Finch on App Store"** >.

## 16. "Sparkles' Newsletters" (9:41 to 9:43)

- A white page with a back chevron and an orange **bell icon** at top-right (probably a newsletter notification toggle). Centered newspaper icon (blue), title **"Sparkles' Newsletters"**, subtitle **"Personalized for you."**. The list is empty, with no newsletters yet. It pops back at 9:43.

## 17. History (day view) (9:44 to 9:47)

- Opens as a modal from the menu's **History** tile. Green header with an "x" at left, a centered calendar icon + **"Today, Sep 27"** dropdown chevron, and a sliders/filter icon at right.
- Week strip: M 21, T 22, W 23, T 24, F 25, S 26, **S 27**. Today is highlighted in a lighter rounded box, with the day letter in a white circle and a dot below it.
- Light grey body:
  - Flag-on-green icon + **"8 Goals"** with a green "+" at right.
  - Completed goals, with struck-through grey titles, a green check badge on the icon, subtitle "First time completion!" and a "..." menu: **Get out of bed** (sunflower), **Brush teeth** (toothbrush), **Wash my face** (soap), **Drink water**, **Do one thing that makes me happy**.
  - Incomplete goals, each with a repeat icon + "daily": **Take a shower**, **Take 3 deep breaths**, **Take a stretch break**.
  - Pen icon **"No reflections"** with a green "+".
- 9:48: closes back to the menu.

## 18. "My Self-Care Areas" (9:49 to 9:50)

- Modal with a teal header illustration: Sparkles in a straw sun hat watering potted plants at a window with curtains. Speech bubble: **"Nourish what matters to you, cheep!"** (the pet says "cheep" as a verbal tic). There is an "x" at top-left. It fades in at 9:49.
- Title **"My Self-Care Areas"**.
- A card with a blue circle toothbrush icon, **"Hygiene"**, and a dotted progress line ending in a small circle at right (area progress, empty).
- A dashed card: "+" **"Start a new area"**.

## 19. "Activities" hub (9:53 to 9:57)

- There is no title. The background is a purple-to-pink sky gradient with clouds and white birds. The hero shows a brown bird character in an aviator cap and goggles with a red scarf, flying an orange/yellow propeller plane. It is not Sparkles (lavender), but it may be a costume or promo pet (uncertain).
- A 2x4 grid of pale pink pill tiles, each with an icon and a label:
  - **Goal Ideas** (flag in green hole), **Reflections** (fountain pen)
  - **Breathe** (leaf with wind), **Soundscapes** (music notes)
  - **Movements** (red sneaker), **Timers** (clock)
  - **Act of Kindness** (daisy), **First Aid Kit** (medical kit)
- 9:55: **Goal Ideas** opens as a green modal with an "x", a flag icon and the title **"Goal Ideas"**. The cards are white, each with a round green icon, a title, a subtitle and a "..." menu:
  - **"Goals of the day"**: "Feel prepared by starting your day mindfully." (unlocked)
  - **"New day, new you"**: "Set goals for tomorrow to feel prepared." (unlocked)
  - **"Sleep goals"**: "Set the right intentions to sleep better tonight." (padlock, so locked or Plus)
  - **"Get active, be happy"**: "Set a goal to energize yourself with movement!" (padlock)
  - **"Connect with a loved one"**: "Set time today for those who matter." (padlock)
- 9:56-9:57: back to the Activities grid. 9:58-9:59: back to the menu top (Sparkles & Silver card).

## 20. Back to Home (10:00 to 10:01), recording ends (10:02 to 10:03)

- Home scene: forest, with Sparkles (red backpack) walking. At 10:00 it is at left-center facing right, at 10:01 slightly moved. A leaf drifts in the air.
- **"Adventuring" back in 7:35:59** then **7:35:58**. At 8:43 it was 7:37:16 (drift is consistent with real time, about 77 s elapsed).
- "3 goals left for today!", Start the day: Take a shower (5 energy), and the promo "Building habits is better together" card, then the tab bar.
- 10:02-10:03: iOS Control Center is pulled down (carrier T2 Mobile, 40% battery, screen-record button active), and the recording stops. This is not app UI.

## Things easy to miss

- The 6 tabs are Home, Quests, Shop, Friends, Bag and **Sparkles** (the last tab is named after the pet). In this range the user **never opens the Quests, Shop, Friends, Bag or Sparkles tabs**. Everything outside Home is reached from the hamburger menu.
- The menu is a stack of many small pushed pages with a consistent pale-blue background, white grouped rows and a back chevron.
- The Plus upsell appears in 3 places: the "Finch PLUS / Try for free" banner in the menu, the paywall (40% off, 11h 29m countdown, "Try for $0.00"), and padlocks on Goal Ideas.
- Seasonal and date-driven content: "Latest Asset Pack: september-2026:2", "SEPTEMBER 2026 FUNDRAISER", and the Repeat options that use today's weekday and date.
- The pet speaks through toasts and speech bubbles in the third person ("Sparkles is away on an adventure! He will share a story when done!") and in the first person with "cheep!".
- Each goal row has a drag handle, which suggests reordering. Each section has its own "+" to add a goal directly into that time-of-day group.
- The Goals header has a filter (sliders) icon and a grid icon next to "N goals left for today!".
- The dismissible "Buddy up" promo card is inserted between the goal sections.
