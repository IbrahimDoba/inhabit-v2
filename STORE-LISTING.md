# App Store listing draft

Paste these into App Store Connect (app id 6838778514). Character limits are Apple's.
The three URLs work once the server change that adds the website is deployed.

## App information

| Field | Value |
| --- | --- |
| Name (30) | DragonDen Garden: Habit Pet |
| Subtitle (30) | Grow a dragon with your habits |
| Primary category | Health & Fitness |
| Secondary category | Lifestyle |
| Age rating | 4+ (answer "None" to every content question) |
| Copyright | 2026 (your name or company) |
| Support URL | https://inhabit-api.dailzero.com/support |
| Marketing URL | https://inhabit-api.dailzero.com/ |
| Privacy Policy URL | https://inhabit-api.dailzero.com/privacy |

If you add your own domain in Dokploy, use it in all three URLs instead.

## Promotional text (170)

Hatch an egg, name your dragon and watch it grow as you keep small daily habits. A cozy habit tracker with a garden to plant and a den to furnish.

## Keywords (100)

tracker,routine,streak,daily,goals,self care,cute,cozy,egg,hatch,reminder,planner,focus,virtual,calm

The words in the name and subtitle (dragon, garden, habit, pet, grow) are already searched, so they are not repeated here.

## Description (4000)

Keep your habits. Raise a dragon.

DragonDen Garden is a habit tracker with a companion who grows up alongside you. Pick an egg, hatch it, give your dragon a name, and start with a few small habits chosen for you.

A PLAN THAT FITS YOU
Answer a short quiz and DragonDen Garden picks three to five tiny habits for the things you care about, with a reason for each. Keep them, swap them, or write your own.

A DRAGON THAT GROWS UP
Your dragon starts as a hatchling and grows into a teenager and then a full-grown dragon. Send it on journeys and it brings diamonds home.

A GARDEN AND A DEN
Plant lavender, daisies, cherry trees and more, and watch each one go from sprout to bloom. Spend diamonds on a bed, a lamp, a rug and other furniture to make the den your own.

GENTLE REMINDERS
Each habit gets its own reminder at a time of day that suits it. Reminders are spaced out so your phone stays calm, and you can turn any of them off.

STREAKS AND QUESTS
See your streak on the home screen and work toward the goal you set. Quests give you small things to aim for.

ON YOUR HOME SCREEN
A widget shows your dragon and what is left to do today.

PRIVATE BY DESIGN
No ads. No tracking. No account needed. Your habits are saved on your phone. Adding an email address is optional and only keeps a backup for a new phone.

DRAGONDEN PLUS (OPTIONAL)
- 50% more diamonds from every journey
- The Plus collection: peony seeds, the garden archway and bridge, and the cloud bed
- Support a tiny team making more for your dragon

DragonDen Plus is an auto-renewing subscription, billed monthly or yearly. Payment is charged to your Apple Account at confirmation of purchase. The subscription renews automatically unless it is cancelled at least 24 hours before the end of the current period. You can manage or cancel it in your App Store account settings.

Terms of Use: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
Privacy Policy: https://inhabit-api.dailzero.com/privacy

## What's New (first version)

The first release of DragonDen Garden. Hatch your egg and say hello.

## Screenshots

Apple needs the 6.9-inch size (1320 x 2868). Six is enough. Suggested order and captions:

1. Home with the dragon in the garden: "Keep your habits. Raise a dragon."
2. The "Picked for you" habits screen: "A plan chosen for you"
3. The three dragon ages side by side: "Watch it grow up"
4. The den with furniture placed: "Make the den your own"
5. The garden with plants in bloom: "Grow a garden"
6. Quests or the home screen widget: "Small goals, every day"

Take them on the iPhone 17 Pro Max simulator from a release build, so the developer warning bar is not in the picture.

## App Privacy answers

"Do you or your third-party partners collect data from this app?" Yes.

| Data type | Collected | Linked to the user | Used for tracking | Purpose |
| --- | --- | --- | --- | --- |
| Email address | Yes, only if the person adds one | Yes | No | App functionality |
| Other user content (habits, dragon, garden, set-up answers) | Yes, only if the person adds an email | Yes | No | App functionality |
| Purchase history | Yes (RevenueCat) | No | No | App functionality |
| User ID (the anonymous id RevenueCat makes) | Yes | No | No | App functionality |

Everything else: not collected.

## App Review notes

No sign-in is needed to use the app. All features work without an account.

The optional account (Settings, Save your dragon) uses a 6-digit code sent by email, with no password. The account can be deleted in the app at Settings, Save your dragon, Delete account.

DragonDen Plus is offered on the Plus screen (Settings, DragonDen Plus). Restore purchases, Terms and Privacy links are at the bottom of that screen.

Reminders are local notifications scheduled on the device.

## Subscriptions

Create these in App Store Connect under Monetization, Subscriptions.

Subscription group name: DragonDen Plus

| | Monthly | Yearly |
| --- | --- | --- |
| Reference name | Plus Monthly | Plus Yearly |
| Product ID | dragonden_plus_monthly | dragonden_plus_yearly |
| Duration | 1 month | 1 year |
| Price (current test values) | US$9.99 | US$79.99 |
| Display name (30) | DragonDen Plus Monthly | DragonDen Plus Yearly |
| Description (45) | More diamonds and the Plus collection | More diamonds and the Plus collection |

Each subscription also needs one screenshot of the Plus screen for review.

Product IDs cannot be changed or reused after they are created.
