# VitaPact: requirements

Draft 0.4 · 11 October 2026 · English translation of the Italian working document (source of truth: https://claude.ai/code/artifact/9858c955-752a-4c09-96e1-cc9ea4d7c9dc)

## 1. Context and goals

VitaPact is a desktop app for Windows that works fully offline. It helps a small group of friends keep healthy habits and hold each other accountable with a weekly report shared through a QR code.

VitalityMaxxing is a pact between friends, and it becomes the heart of the product. Each person tracks sleep, training, clean eating and sun exposure. Each person weighs in every Sunday on an empty stomach. At the end of the week, each person sends the others a summary. When someone slows down, the group can see it and encourages them to come back.

**Measurable goals for version 1.0**

- The daily check-in can be completed in under 30 seconds.
- The Sunday weigh-in is requested explicitly when the app is opened on a Sunday.
- The weekly report is generated with one click and can be shared as a PNG image with a QR code.
- A friend's report is imported by loading the image with the QR code, with no connection at all.
- A private Noteboard that never leaves the device, not even in the QR code.
- Zero network requests: no server, no account, no telemetry.

**Product spirit:** this is not a punishing challenge. It is an easy way to feel good together. No teasing: the stake is friendly ("whoever falls behind buys the pizza"), and someone who skips a week must never feel at fault. Someone who comes back after a hard week is highlighted, not judged.

**Principles taken from competitors** (from the project's competitor analysis):

- Simplicity: a 30-second check-in, four pillars and nothing else.
- Friends receive the weekly summary, never the individual days.
- A weekly score instead of a streak that resets: a missed day counts for little.
- No account and no cloud, which are already strengths of VitaPact.
- A stake and a weekly check-in with friends, the model that works best for commitments between people.

**Open source:** the code will be published under the GPL-3.0 licence (question 8). Anyone who modifies and redistributes it must keep it open source. So security and privacy must hold up even with the code visible to everyone.

**Out of scope for 1.0:** mobile app, new pillars such as hydration or steps (the code allows for them as future modules), automatic data backups (they will come with the mobile apps; file export is already in, RF-19), sync between devices, integration with smartwatches or smart scales, push notifications.

## 2. Project name

The chosen name is **VitaPact** (decision D1). The repository will be called `vitapact` and the Windows app identifier will be `com.vitapact.app`. Before publishing, we should check that the name is not a registered trademark.

## 3. Users and usage scenarios

The typical user is an adult who uses a Windows PC every day. They belong to a group of 2-10 friends who have set themselves a shared challenge.

1. **First launch.** The user picks a nickname and personal goals (hours of sleep, workouts per week, minutes of sun). No sign-up.
2. **Groups.** On their own device, the user creates one or more groups (e.g. "Five-a-side", "Office"), each with its own stake (e.g. "whoever falls behind buys the pizza"). They add friends to the groups as they import their reports. Each group has a challenge that restarts every month.
3. **Evening check-in.** Every evening the user opens the app and logs the day: the previous night's sleep, training, eating quality, minutes in the sun.
4. **Sunday morning.** On opening, the app asks for the weigh-in on an empty stomach, before breakfast. If the user postpones it, a warning stays visible and they can catch up on the following days.
5. **Sunday evening.** The user generates the weekly report, saves the image with the QR code and sends it to friends on WhatsApp or Telegram.
6. **Importing a friend.** The user receives a friend's image, loads it into the app and sees the updated group ranking and the monthly ranking of each group.
7. **The comeback.** After a hard week, the user starts logging again. Their report carries the "Comeback (Rientro)" mark. In their friends' rankings their effort is highlighted, and that month they cannot be the one who pays.
8. **Session with the psychologist.** After the session, the user writes notes in the Noteboard, optionally protected by a password. The notes never end up in the report or in the QR code.

## 4. Functional requirements

The document lists 29 requirements (RF-01 … RF-29). Version 1.0 covers all of them: 25 mandatory (Must), 3 important (Should), 1 optional (Could). Draft 0.4 changes RF-07 (weigh-in until Tuesday), RF-19 (export and import to a file, D35) and RF-26 (who pays each weekend).

| ID    | Area         | Requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Priority |
| ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| RF-01 | Profile      | On first launch the user picks a nickname and sets goals: hours of sleep (default 7.5), workouts per week (default 3), minutes of sun per day (default 20).                                                                                                                                                                                                                                                                                                                    | Must     |
| RF-02 | Profile      | On first launch a user UUID is generated and never changes. It distinguishes friends with the same nickname and is visible in the settings.                                                                                                                                                                                                                                                                                                                                    | Must     |
| RF-03 | Check-in     | For each day the user logs: hours of sleep, sleep quality (1-5), training yes/no with type and duration in minutes, clean eating (1-5), minutes in the sun.                                                                                                                                                                                                                                                                                                                    | Must     |
| RF-04 | Check-in     | Past days of the current week can be edited. Closed weeks are read-only.                                                                                                                                                                                                                                                                                                                                                                                                       | Should   |
| RF-05 | Weigh-in     | On Sunday, on opening, a dialog asks for the weight in kg (one decimal place) with the confirmation "on an empty stomach, before breakfast".                                                                                                                                                                                                                                                                                                                                   | Must     |
| RF-06 | Weigh-in     | If postponed, a warning stays visible on every screen until the weigh-in is entered.                                                                                                                                                                                                                                                                                                                                                                                           | Must     |
| RF-07 | Weigh-in     | The week's weigh-in can be caught up until the Tuesday of the following week. It counts for that week and is not marked as late.                                                                                                                                                                                                                                                                                                                                               | Must     |
| RF-08 | Statistics   | Weekly view with averages, days on target, and a chart of weight over the last 12 weeks.                                                                                                                                                                                                                                                                                                                                                                                       | Must     |
| RF-09 | Score        | Each week gets a score from 0 to 100 and a verdict. The score weights live in a single configuration file that can be changed without touching the screens.                                                                                                                                                                                                                                                                                                                    | Must     |
| RF-10 | Report       | The weekly report is a PNG image with a QR code that holds nickname, UUID, generation date, period and the week's summary (section 9).                                                                                                                                                                                                                                                                                                                                         | Must     |
| RF-11 | Report       | Nickname, UUID and period are printed in plain text under the QR code, so whoever receives the image knows whose it is before loading it.                                                                                                                                                                                                                                                                                                                                      | Must     |
| RF-12 | Friends      | A friend's report is imported by loading their image (PNG or JPG): the app reads the QR code and saves the summary.                                                                                                                                                                                                                                                                                                                                                            | Must     |
| RF-13 | Friends      | Group ranking for the current week and history for each friend.                                                                                                                                                                                                                                                                                                                                                                                                                | Must     |
| RF-14 | Friends      | A friend with no report for more than 8 days appears as "Waiting (In attesa)", with no verdicts and no negative flags.                                                                                                                                                                                                                                                                                                                                                         | Must     |
| RF-15 | Friends      | No teasing: verdicts and messages are always encouraging, even for low scores (section 9).                                                                                                                                                                                                                                                                                                                                                                                     | Must     |
| RF-16 | Friends      | Removing a friend and all their reports.                                                                                                                                                                                                                                                                                                                                                                                                                                       | Must     |
| RF-17 | Noteboard    | Notes with title, text, date and an optional tag. They are also useful for privately tracking activities the app does not consider. Search, edit, delete.                                                                                                                                                                                                                                                                                                                      | Must     |
| RF-18 | Noteboard    | Optional password for the Noteboard only: the notes are encrypted on disk. The rest of the app has no password.                                                                                                                                                                                                                                                                                                                                                                | Should   |
| RF-19 | Data         | Export and import of all data to a JSON file the user chooses, offline, with the schema version and validation; before overwriting existing data the app asks for confirmation. Automatic backups stay for the future mobile apps.                                                                                                                                                                                                                                             | Must     |
| RF-20 | Data         | Full data deletion with double confirmation.                                                                                                                                                                                                                                                                                                                                                                                                                                   | Must     |
| RF-21 | Reminder     | A single Windows evening notification if the day's check-in has not been done. It can be turned off.                                                                                                                                                                                                                                                                                                                                                                           | Could    |
| RF-22 | Language     | English interface. All texts live in translation files (i18n approach), so Italian can be added without changing the code.                                                                                                                                                                                                                                                                                                                                                     | Must     |
| RF-23 | Modularity   | Each pillar (sleep, training, eating, sun) is its own module. Adding a new one, such as hydration or steps, does not require rewriting the screens.                                                                                                                                                                                                                                                                                                                            | Must     |
| RF-24 | Installation | No feature and no installation requires administrator rights.                                                                                                                                                                                                                                                                                                                                                                                                                  | Must     |
| RF-25 | Groups       | On their own device, the user creates one or more groups, each with a name and a free-text stake (e.g. "buys the pizza"). A friend can be in several groups. Groups never leave the device.                                                                                                                                                                                                                                                                                    | Must     |
| RF-26 | Who pays     | Each group has a monthly ranking (average of weekly scores). Each weekend it shows who pays: the person with the lowest weekly score, excluding whoever paid the previous weekend and whoever is on a comeback (section 9). The phrase that announces it changes every weekend and is always encouraging (section 9.1). The rule is identical in every app, so with the same reports and the same members everyone sees the same result. The text never uses the word "loser". | Must     |
| RF-27 | Comeback     | If the previous week scored below 50 and the current week improves by at least 15 points, the report carries the "Comeback" mark, highlighted in friends' rankings.                                                                                                                                                                                                                                                                                                            | Must     |
| RF-28 | QR security  | The report in the QR code is signed by its author, so nobody can modify it or pretend to be someone else (section 10.1).                                                                                                                                                                                                                                                                                                                                                       | Must     |
| RF-29 | Mobile       | The layout already suits small screens and touch, so the screens can be reused in the future mobile apps.                                                                                                                                                                                                                                                                                                                                                                      | Should   |

## 5. Screens in detail

The app has 5 main screens, reachable from an always-visible sidebar, plus 2 modal dialogs. Minimum window size: 1024 x 700 px. The labels here were in Italian for the review. In the app they will be in English, taken from the translation files.

### 5.0 Reference model (approved)

All screens use the same skeleton: a fixed sidebar on the left, a header with the title and the week context, a card-based content area on a grid, and the main action at the bottom right. If you approve this model, I will describe each screen in detail on top of it, using the same React components.

_Diagram: mockup of the Today screen, light theme, English text (see the source document)._

The elements of the model become the shared components: sidebar and header (AppShell, PageHeader), warning (WarningBanner), pillar cards (PillarCard), week strip (WeekStrip), main button. The other screens only change the content of the grid.

### 5.1 Welcome (first launch only)

- Three steps: nickname, personal goals, privacy explanation ("everything stays on this PC").
- Button "Accept **your** VitaPact." ("Accetta il **tuo** VitaPact.").
- Above the button, the motto: "Join the VitalityMaxxing lifestyle" ("Entra anche tu nello stile di vita VitalityMaxxing"). The same motto appears in small type at the bottom of the shared report image.

### 5.2 Today

- At the top: date, week number, days left until Sunday.
- Four side-by-side cards, one per pillar (Sleep (Sonno), Training (Allenamento), Eating (Alimentazione), Sun (Sole)), each with its own colour and an icon.
  - Sleep: hours field (step 0.5) and 5 stars for quality.
  - Training: yes/no toggle, type menu (Gym (Palestra), Running (Corsa), Cycling (Bici), Swimming (Nuoto), Team sports (Sport di squadra), Other (Altro)), duration in minutes.
  - Eating: 1-5 scale with labels (from "Disaster (Disastro)" to "Spotless (Pulitissima)").
  - Sun: minutes with quick buttons 10/20/30/60.
- Button "Save day (Salva giornata)". The card turns green when the goal is reached.
- Strip of the 7 days of the week with one dot per day: filled if logged, empty if missing.

### 5.3 Week

- Week selector with forward and back arrows.
- Large score (0-100) with the verdict at the top of the screen: it is the first thing the user sees. Below it, a single line with the four pillars in small type (sleep, training, eating, sun).
- Seven clickable tiles, one per day (Mon-Sun), each with the day's score (0-100) and a dot coloured by score band. No table: details appear only when a day is clicked. That opens the day's summary with the values of the four pillars and the button to edit them (if the week is still open). The day score uses the same weights as the weekly score, without the weigh-in. On a rest day, training does not lower the score.
- Line chart of weight over the last 12 Sundays.
- Button "Create report (Crea resoconto)" that opens the report modal.

### 5.4 Friends

- At the top, the group selector (a user can have several). For the selected group: the stake, the current month's ranking with the average of weekly scores, and the weekend card with who pays and the phrase of the week (section 9.1), for example "This weekend Marco is buying the pizza: see you Saturday!".
- Button "Add report (Aggiungi resoconto)" that opens the file picker for the image received from the friend.
- Weekly ranking: position, nickname, score, encouraging verdict, weight change. Someone on a comeback has a "Comeback" badge, and their row is highlighted with the improvement in points. Someone who has not sent their report yet appears as "Waiting".
- Click on a friend: history of their weekly scores and weight trend.
- A "You (Tu)" row is always present in the ranking for comparison.

### 5.5 Noteboard

- Two-column layout: list of notes on the left with search and tag filter, editor on the right. Each note has a date and an optional tag (e.g. "Psychologist (Psicologa)", "Activity (Attività)") to privately track what the app does not measure.
- Padlock at the top: set password, lock now, remove password.
- Fixed banner: "These notes are never shared or included in the QR code (Queste note non vengono mai condivise né incluse nel QR)".

### 5.6 Settings

- Editable nickname and goals, read-only UUID.
- Groups: create, rename, delete; stake and members of each group.
- Fingerprint of your key (groups of 4 characters) to compare in person with friends (section 10).
- "Export data" and "Import data": save everything to a JSON file the user chooses, or load it back; importing asks for confirmation before overwriting (RF-19).
- Delete all data.
- About: version, open source licence, link to the code, where the data is stored on disk.

### 5.7 Modals

- **Sunday weigh-in:** kg field, required checkbox "I weighed myself on an empty stomach, before breakfast (Mi sono pesato a digiuno, prima della colazione)", buttons "Save (Salva)" and "Later (Più tardi)". On the following days, the same dialog reopens from the warning to catch up on the weigh-in.
- **Report:** preview of the card (nickname, week, score, 4 indicators, weight, QR code and, under the QR code, nickname, UUID and period in plain text), buttons "Save image (Salva immagine)" and "Close (Chiudi)".
- **New group:** asks for the name and the stake, then lets the user choose which already-imported friends belong to it. When a report from a new friend arrives, the app asks which groups to add them to.

## 6. Colour palette, typography and UI guidelines

We start with the light theme: warm beige as the base, soft greens as the main colour, and a natural tone for each pillar. The goal is an app that evokes wellbeing and nature, not a statistics dashboard. The dark theme will be designed later.

**Inspiration:** wellbeing apps such as Headspace and Finch for the warmth of the colours, Apple Health for the per-category cards, Notion for the clean layout.

| Role        | Colour  | Use                                    |
| ----------- | ------- | -------------------------------------- |
| Background  | #F5F0E6 | Window background, warm beige          |
| Surface     | #FFFDF8 | Cards and panels                       |
| Sidebar     | #EDE4D3 | Navigation                             |
| Border      | #E2D8C5 | Separators and outlines                |
| Text        | #2F3B2F | Main text, near-black green            |
| Muted text  | #5E6858 | Labels and notes                       |
| Base green  | #8FC79A | Main buttons, logged days              |
| Dark green  | #3E7A4E | Confirmation text ("goal reached")     |
| Light green | #DCEFD6 | Active menu item, highlights, comeback |
| Warning     | #E3B25A | Weigh-in to do                         |
| Sleep       | #A3A1D9 | Lavender                               |
| Training    | #E8A07E | Peach                                  |
| Eating      | #9CC77A | Leaf green                             |
| Sun         | #EBC06A | Honey                                  |
| Error       | #C97B66 | Clay, used rarely                      |

Main text and confirmation text exceed a 4.5:1 contrast ratio on the background (WCAG AA). On green buttons the text is dark.

_Diagram: palette, 15 roles, light theme (see the source document)._

The pillar colours are soft and natural (lavender, peach, leaf, honey). They are recognisable at a glance without ever shouting.

**Typography:** Inter (bundled with the app, no download), 14 px for text, 20 px for section titles, 48 px for the score. Tabular numbers to align columns.

**Rules:** 12 px rounded corners on cards, spacing in multiples of 8 px, line icons (Lucide), text/background contrast of at least 4.5:1 (WCAG AA), everything usable by keyboard.

**Consistency across screens (D3):** colours, spacing and radii are defined only once, in the theme of the component library (section 7). Every screen uses only shared components, never its own styles, so the style stays identical everywhere.

### 6.1 Light theme tokens

Every visual value in the app is a token with an English name. It is defined only once in `shared/ui/tokens` and passed both to the Mantine theme and to CSS variables. Screens use only token names, never a hand-written colour or size. This way the dark theme, when it comes, will be a second set of values on the same names.

**Colours**

| Token                   | Palette role | Value   | Where it is used                                      |
| ----------------------- | ------------ | ------- | ----------------------------------------------------- |
| `color.bg`              | Background   | #F5F0E6 | Background of all screens                             |
| `color.surface`         | Surface      | #FFFDF8 | Cards, modals, input fields                           |
| `color.sidebar`         | Sidebar      | #EDE4D3 | Sidebar and bottom bar on mobile                      |
| `color.border`          | Border       | #E2D8C5 | Card and field borders, separators                    |
| `color.text`            | Text         | #2F3B2F | Main text, also on top of the greens and the warning  |
| `color.textMuted`       | Muted text   | #5E6858 | Labels, dates, help text                              |
| `color.primary`         | Base green   | #8FC79A | Score ring, progress bars, active menu item           |
| `color.primaryStrong`   | Dark green   | #3E7A4E | Main button (white text), links, focus ring           |
| `color.primarySoft`     | Light green  | #DCEFD6 | Selections, "Comeback" badge, weekend card background |
| `color.warning`         | Warning      | #E3B25A | Weigh-in-to-do banner                                 |
| `color.danger`          | Error        | #C97B66 | Validation errors, delete confirmation                |
| `color.pillar.sleep`    | Sleep        | #A3A1D9 | Icon, bar and border of the Sleep card                |
| `color.pillar.training` | Training     | #E8A07E | Icon, bar and border of the Training card             |
| `color.pillar.food`     | Eating       | #9CC77A | Icon, bar and border of the Eating card               |
| `color.pillar.sun`      | Sun          | #EBC06A | Icon, bar and border of the Sun card                  |

Pillar colours never carry text on top. They colour icons, bars and borders, while the numbers stay in `color.text`. The red `color.danger` never appears on scores or verdicts, only on errors and destructive actions.

**Sizes**

| Group   | Tokens and values                                                                                 | Rule                                                           |
| ------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Spacing | `space.1` 4 px, `space.2` 8, `space.3` 12, `space.4` 16, `space.5` 24, `space.6` 32, `space.7` 48 | Always multiples of 4; 16 px inside cards, 24 px between cards |
| Radii   | `radius.sm` 8 px, `radius.md` 12, `radius.lg` 16, `radius.full`                                   | Fields 8, cards 12, modals 16, chips and badges fully rounded  |
| Shadows | `shadow.card` 0 1 2 at 6% of the text colour, `shadow.modal` 0 8 24 at 12%                        | One shadow per level, no coloured shadows                      |
| Motion  | `motion.fast` 150 ms, `motion.base` 250 ms, ease-out curve                                        | With Windows "reduce motion", animations are turned off        |
| Focus   | 2 px ring in `color.primaryStrong`, 2 px offset                                                   | Visible on every keyboard-focusable element                    |
| Layout  | sidebar 240 px, bottom bar 64 px, content at most 960 px wide                                     | Below 768 px the sidebar becomes the bottom bar (RF-29)        |
| Touch   | minimum clickable area 44 × 44 px                                                                 | Applies on desktop already, for the future mobile app          |

**Typography**

| Token          | Size / line height | Weight | Use                                  |
| -------------- | ------------------ | ------ | ------------------------------------ |
| `font.display` | 48 / 56 px         | 700    | Large score for the week and the day |
| `font.h1`      | 24 / 32 px         | 600    | Screen title                         |
| `font.h2`      | 18 / 26 px         | 600    | Card title                           |
| `font.body`    | 14 / 20 px         | 400    | Normal text, fields, buttons (500)   |
| `font.small`   | 12 / 16 px         | 500    | Labels, dates, badges                |

Typeface: Inter, bundled with the app (no download). Numbers for scores, hours and weights use tabular figures, so they do not jump around when they change.

**Icons:** Lucide, 20 px, stroke 1.75. One per pillar and per menu item: Moon (sleep), Dumbbell (training), Salad (eating), Sun (sun), Scale (weigh-in), CalendarDays (week), Users (friends), NotebookPen (Noteboard), Settings (settings). New icons are chosen only from Lucide.

**Mantine theme:** primary colour `sage`, a scale of 10 shades generated from the three greens of the palette; default radius `md`; Inter typeface; spacing and shadows from the tokens above. The theme and the component variants live in `shared/ui`, so no screen sets its own styles.

### 6.2 Shared components

All components live in `shared/ui` and come in two levels. **Base** components wrap Mantine and know nothing about VitaPact. **Domain** components are built on the base ones and know about pillars, scores and groups. Screens compose only these two levels (D3).

**Base components**

| Component            | What it does                                                 | Variants and states                                                                                      | Screens                               |
| -------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| AppShell             | App frame: navigation bar, banner, content                   | Sidebar above 768 px, bottom bar below                                                                   | All                                   |
| NavItem              | Menu item with icon and label                                | Normal, active (`color.primary` background)                                                              | All                                   |
| PageHeader           | Screen title, subtitle and action on the right               | With or without action                                                                                   | All                                   |
| Card                 | Container with border, radius 12 and padding 16              | Normal, highlighted (coloured left border), clickable                                                    | All                                   |
| Button               | Action                                                       | Primary (dark green), secondary (outlined), subtle (text only), destructive; loading and disabled states | All                                   |
| IconButton           | Icon-only action with a label for screen readers             | Subtle, outlined                                                                                         | Week, Friends, Noteboard              |
| NumberField          | Number with unit and step                                    | Hours (0.5), minutes (5), kg (0.1); error under the field                                                | Today, Weigh-in, Onboarding, Settings |
| ScaleInput           | 1 to 5 dot scale, keyboard-usable                            | Empty, selected                                                                                          | Today                                 |
| YesNoToggle          | Yes/no choice with two buttons                               | Yes, no, not set                                                                                         | Today                                 |
| ChipGroup            | Choice among short labels                                    | Single (training type), multiple (note tags)                                                             | Today, Noteboard                      |
| TextField / TextArea | Free text                                                    | With counter, error                                                                                      | Onboarding, Friends, Noteboard        |
| PasswordField        | Password with show/hide                                      | Error                                                                                                    | Noteboard, Settings                   |
| Select               | Choice from a list                                           | With search                                                                                              | Friends, Settings                     |
| Badge                | Short label                                                  | Neutral, "Comeback" (light green), "Waiting" (grey)                                                      | Week, Friends                         |
| Banner               | Fixed message at the top                                     | Warning (yellow), info (light green)                                                                     | All (weigh-in)                        |
| Modal                | Window over the screen                                       | Small (confirmations), medium (forms)                                                                    | All                                   |
| ConfirmDialog        | Confirmation of an action                                    | Simple, double (type a word to confirm)                                                                  | Friends, Noteboard, Settings          |
| Toast                | Short confirmation at the bottom, disappears after 4 seconds | Success, error                                                                                           | All                                   |
| EmptyState           | Empty screen with icon, phrase and action                    | With or without button                                                                                   | Week, Friends, Noteboard              |
| FilePicker           | Choosing or dragging an image                                | Idle, reading, error                                                                                     | Friends                               |

**Domain components**

| Component               | What it does                                                                             | Depends on                                            | Screens                 |
| ----------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| PillarCard              | Pillar card with icon, colour and fields; the fields come from the pillar module (RF-23) | Card, NumberField, ScaleInput, YesNoToggle, ChipGroup | Today, day detail       |
| ScoreRing               | 0-100 ring with a large number and the verdict below                                     | Tokens `font.display`, `color.primary`                | Today, Week, day detail |
| VerdictLabel            | Encouraging verdict for the score band (section 9)                                       | i18n                                                  | Week, Friends, report   |
| DayTile                 | Day of the week with its score; clickable                                                | Card, band colours                                    | Week                    |
| WeekStrip               | Seven DayTiles from Monday to Sunday, today highlighted                                  | DayTile                                               | Week                    |
| PillarSummary           | Row for one pillar: weekly average and days on target                                    | Pillar tokens                                         | Week                    |
| TrendChart              | Line chart of weight or scores over the last 12 weeks                                    | Chart.js                                              | Week, Friends           |
| WeighInBanner           | Weigh-in-to-do banner until Tuesday (RF-06, RF-07)                                       | Banner                                                | All                     |
| WeighInDialog           | Weight entry with the "empty stomach" reminder                                           | Modal, NumberField                                    | All                     |
| ReportPreview           | Preview of the PNG with QR code, nickname, UUID and period; save and copy                | Card, Button                                          | Week                    |
| ReportImport            | Reads the QR code from an image, previews whose it is, confirms                          | Modal, FilePicker                                     | Friends                 |
| GroupSelector           | Group choice and access to "New group"                                                   | Select                                                | Friends                 |
| RankingList / FriendRow | Ranking with position, nickname, score, verdict, badge                                   | Card, Badge, VerdictLabel                             | Friends                 |
| PayerCard               | Weekend card: who pays and the phrase of the week (9.1)                                  | Highlighted Card, `color.primarySoft`                 | Friends                 |
| NoteList / NoteEditor   | List with search and note editor                                                         | Card, TextField, TextArea, ChipGroup                  | Noteboard               |
| LockScreen              | Unlocking the Noteboard with a password                                                  | PasswordField                                         | Noteboard               |
| KeyFingerprint          | Signing key fingerprint in groups of 4 characters                                        | Card                                                  | Settings                |

Rules: names and props in English; no text written inside the component, only i18n keys; every component has its own test (behaviour and accessibility) before a screen uses it.

### 6.3 Screen composition

Each screen is an AppShell with a PageHeader and, below it, the components listed here from top to bottom. A screen that needs a new piece adds it to `shared/ui`, never to its own package.

| Screen          | Components, top to bottom                                                                                                                                                                               | Modals                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Welcome (5.1)   | VitalityMaxxing motto, nickname TextField, three goal NumberFields, primary Button                                                                                                                      | None                                                                               |
| Today (5.2)     | WeighInBanner (if needed), day ScoreRing, four PillarCards, "Save" Button, Toast                                                                                                                        | WeighInDialog                                                                      |
| Week (5.3)      | Week ScoreRing with VerdictLabel, WeekStrip, PillarSummary per pillar, weight TrendChart, "Create report" Button                                                                                        | Day detail (PillarCards read-only or editable), ReportPreview                      |
| Friends (5.4)   | GroupSelector, PayerCard, RankingList with FriendRow and Badge, "Add report" Button, EmptyState if the group is empty                                                                                   | ReportImport, New group, friend history with TrendChart, ConfirmDialog for removal |
| Noteboard (5.5) | LockScreen (if protected), search TextField, NoteList, "New note (Nuova nota)" Button, EmptyState                                                                                                       | NoteEditor, ConfirmDialog                                                          |
| Settings (5.6)  | Profile Card (TextField, NumberField), groups Card, Noteboard Card (PasswordField), KeyFingerprint, about Card (version, GPL-3.0 licence), destructive "Delete all data (Cancella tutti i dati)" Button | New group, double ConfirmDialog                                                    |

## 7. Technology stack and frameworks

Confirmed: **Tauri 2** with a **React + TypeScript** single page application built with **Vite** (D2, D3). Yes, Tauri 2 produces real Windows executables: a per-user `.exe` installer (NSIS) that needs no administrator rights, and the app executable, which also works on its own as a portable version. No MSI package (Rei's choice).

**What Tauri gives us on Windows**

| Aspect        | How it works                                                                                    | Effect for us                             |
| ------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Executables   | NSIS installer (\~10 MB) and portable executable                                                | Covers D16: both versions                 |
| Permissions   | Installer in "current user only" mode, data in `%LOCALAPPDATA%`                                 | No administrator rights (RF-24)           |
| Web engine    | Uses WebView2, already present in Windows 10 and 11; the installer downloads it only if missing | No browser to ship                        |
| System access | Plugins with permissions declared one by one: we will use only file save and file open          | Minimal attack surface, no network access |
| Build         | Must be done on Windows or on a Windows machine in CI (GitHub Actions)                          | See question 1 in section 13              |

The most useful point for the architecture: **almost all the code is TypeScript**. Rust stays a thin shell that opens the window and registers the plugins. So the team works in one language, and the logic can be tested without starting the app.

**Architecture by screen**

One package per screen, each with its own components, its own state and small functions focused on the requirements it covers. Screens do not import each other. They share only the interface components and the core.

| Package            | Contains                                                                                                    | Requirements covered         |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| screens/onboarding | First launch: nickname, goals, privacy                                                                      | RF-01, RF-02                 |
| screens/today      | Daily check-in, weigh-in warning and dialog                                                                 | RF-03, 04, 05, 06, 07        |
| screens/week       | Statistics, score, weight chart, report generation                                                          | RF-08, 09, 10, 11            |
| screens/friends    | Groups, import from image, monthly ranking, who pays on the weekend, history                                | RF-12 … RF-16, RF-25 … RF-27 |
| screens/noteboard  | Notes, tags, search, password                                                                               | RF-17, RF-18                 |
| screens/settings   | Profile, groups, Noteboard password, key fingerprint, about, deletion                                       | RF-20, RF-28                 |
| shared/ui          | Theme, tokens and shared components from section 6.2 (base and domain), the only place that imports Mantine | Single style (D3)            |
| shared/i18n        | Translation files (English now, Italian later)                                                              | RF-22                        |
| core/src/pillars   | One module per pillar: fields, goal, colour, icon, contribution to the score                                | RF-23                        |
| core/src/scoring   | Score calculation with the weights in a configuration file                                                  | RF-09                        |
| core/src/report    | Creating and reading the QR content, with validation, and the PNG image                                     | RF-10, RF-12                 |
| core/src/storage   | Access to the local database, one function per operation; export and import to a file                       | All                          |
| core/src/groups    | Monthly ranking, who pays on the weekend, comeback, phrase selection (section 9)                            | RF-25, RF-26, RF-27          |
| core/src/crypto    | Keys and report signing, key fingerprint, note encryption                                                   | RF-18, RF-28                 |
| platform           | The only place that uses Tauri: file save, image open, notifications; ready for a mobile version            | RF-12, RF-21, RF-29          |

The core areas are folders of a single package, `@vitapact/core` (`core/src/pillars`, `scoring`, `report`, `storage`, `groups`, `crypto`), as Rei decided with PR #2 (D36). The import rules also apply between folders, so the boundaries are still checked.

_Diagram: architecture, 5 layers, one package per screen (see the source document)._

Each layer uses only the layers below it: a screen can use shared and core, never another screen. The reviewer agent checks this rule on every feature.

**Mobile outlook**

Today only the Windows desktop version is released, but Tauri 2 also builds Android and iOS apps from the same project. To avoid rewriting anything when the mobile apps arrive (with automatic backups), these rules apply from the start:

- Every screen works from 360 px wide upwards. On narrow screens the sidebar becomes a bottom bar.
- Touchable buttons and fields of at least 44 x 44 px. No feature reachable only by hovering the mouse.
- The core does not know which platform it runs on. Saving and opening files go through a small platform module, which on mobile will use the system share sheet.
- Storage goes through the storage folder of @vitapact/core, so export and backup live in a single place.

**Libraries (approved)**

| Area            | Choice                                                 | Reason                                                                                         |
| --------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| UI components   | Mantine 9, wrapped in shared/ui (question 2)           | Ready-made, consistent components, built-in light/dark theme, no CSS to write screen by screen |
| State           | Zustand                                                | Minimal, one small store per screen                                                            |
| Storage         | IndexedDB via Dexie.js                                 | Robust, queryable by date                                                                      |
| Translations    | i18next with react-i18next                             | Standard for React, one file per language                                                      |
| Charts          | Chart.js                                               | Lightweight, enough for lines and bars                                                         |
| QR generation   | qrcode                                                 | Generates the PNG                                                                              |
| QR reading      | jsQR                                                   | Reads the QR code from the loaded image, without network                                       |
| Note encryption | Web Crypto API (AES-GCM, PBKDF2)                       | Native                                                                                         |
| Testing         | Vitest (logic and components), Playwright (full flows) | Integrated with Vite                                                                           |
| Windows package | Tauri bundler                                          | Installer and portable                                                                         |

## 8. Data model and local storage

All data lives in a local IndexedDB database with 7 tables. Weeks follow the ISO standard (Monday-Sunday, e.g. 2026-W41), so the weigh-in Sunday always closes the week.

| Table         | Key               | Main fields                                                                                      | Leaves the device?                                 |
| ------------- | ----------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| profile       | fixed id "me"     | userId (UUID), nickname, goals per pillar, theme, hideWeight, signing key pair, createdAt        | Only UUID, nickname and public key, in the QR code |
| groups        | random id         | name, stake, member UUIDs, createdAt                                                             | Never                                              |
| dailyEntries  | date (YYYY-MM-DD) | one value for each active pillar (e.g. sleep, training, eating, sun), updatedAt                  | No, only aggregates                                |
| weighIns      | ISO week          | weightKg, measuredOn (actual day of the weigh-in), fastingConfirmed                              | Only weight and change, in the QR code             |
| friends       | friend's UUID     | nickname, public key, firstSeenAt, lastReportAt                                                  | No                                                 |
| friendReports | UUID + week       | the summary read from the QR code (section 9), including the comeback mark, importedAt           | No                                                 |
| notes         | random id         | title, body, date, tag, createdAt, updatedAt; if protected: ciphertext and initialisation vector | Never                                              |

**Data rules**

- One entry per day. Saving again overwrites it.
- Day values are stored per pillar: a new pillar adds a key without changing the table schema (RF-23).
- The weigh-in is tied to the week, not the day. If caught up on Tuesday, it still counts for the week it belongs to, with no late marks (RF-07).
- Who pays and comebacks are not stored. They are recalculated from the reports every time, so a late report updates everything by itself.
- An imported report for the same UUID and the same week replaces the previous one.
- The private signing key never leaves the device. Groups and rankings exist only on the device.
- Protected notes store only the ciphertext. The key is derived from the password and stays in memory only while the app is open.
- The schema has a version number to handle future migrations.
- The export is a JSON file with the schema version; import validates it and rejects damaged files or unknown versions (RF-19).

## 9. Weekly report and QR format

The report is a PNG image with a QR code that holds only the weekly summary, never individual days or notes. The QR code starts with `VPACT1.` followed by the compressed data, signed by the author (section 10.1). That is about 400 characters, well within the capacity of a QR code readable from an image.

| Field                            | Example                              | Meaning                                                                                         |
| -------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| v                                | 1                                    | Format version                                                                                  |
| uid                              | 3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90 | UUID generated on the app's first launch                                                        |
| nick                             | Rei                                  | Nickname chosen by the user                                                                     |
| generatedOn                      | 2026-10-11                           | Date the report was generated                                                                   |
| week / from / to                 | 2026-W41 / 2026-10-05 / 2026-10-11   | ISO week and period                                                                             |
| logged                           | 6                                    | Days logged out of 7                                                                            |
| sleepAvg / sleepOk               | 7.2 / 5                              | Average hours of sleep and days on target                                                       |
| trainDone / trainGoal / trainMin | 3 / 3 / 165                          | Workouts done, goal, total minutes                                                              |
| cleanOk                          | 4                                    | Days with eating rated 4 or 5                                                                   |
| sunOk                            | 3                                    | Days with sun on target                                                                         |
| weight / delta                   | 78.4 / -0.6                          | Weight for the week and change in kg; the absolute weight is omitted if the user hides it (D11) |
| score / prevScore                | 62 / 34                              | Score for this week and the previous one                                                        |
| comeback                         | true                                 | Comeback mark (RF-27)                                                                           |
| pub / sig                        | public key / signature               | Who wrote the report, and proof that it has not been modified                                   |

The QR code holds no information about groups: each device decides on its own which groups to put a friend in.

**Shared image:** PNG 1080 x 1350 (portrait, suited to chats) with nickname, week, score, verdict, the four indicators, the weight and the QR code. Under the QR code, in plain text: nickname, UUID and period (D10). The import reads only valid `VPACT1.` QR codes. If a future version arrives, the app asks the user to update.

**Score (weights confirmed, D8):** logging consistency 15, sleep 25, training 25, eating 20, sun 10, weigh-in done 5. The weights live in a configuration file and can be changed without touching anything else.

```latex
\text{score} = 15\frac{logged}{7} + 25\frac{sleepOk}{7} + 25\min\left(1, \frac{trainDone}{trainGoal}\right) + 20\frac{cleanOk}{7} + 10\frac{sunOk}{7} + 5\cdot weighIn
```

**Verdicts and messages (RF-15):** only encouraging, even with low scores. We write the phrases ourselves, in English in the app, about 5 per band, in the translation files. Examples (in Italian in the original, for review):

| Score  | Verdict                         | Example message                                  |
| ------ | ------------------------------- | ------------------------------------------------ |
| 85-100 | In great shape (In gran forma)  | "A textbook week!"                               |
| 70-84  | On it (Sul pezzo)               | "Great consistency, keep it up."                 |
| 50-69  | Solid base (Buona base)         | "You're there: a few more days and you'll fly."  |
| 30-49  | Light week (Settimana leggera)  | "It happens. On Monday we start again together." |
| 0-29   | Pause week (Settimana di pausa) | "The group is waiting for you, no rush."         |

**Groups, monthly ranking and who pays on the weekend (RF-25, RF-26).** Each group lives only on the device, and one person can be in several groups. Every app applies the same rules to the same reports, so anyone with the same friends in the group sees the same result without any connection.

- **Monthly ranking:** average of each member's weekly scores in the month. Each week counts for the month of its Sunday. It restarts from zero on the first of the month.
- **Who pays this weekend:** decided every week, as soon as the reports arrive.

1. Consider the group members who have sent the week's report. Anyone who has not sent it stays "Waiting", with no penalty.
2. Exclude whoever paid the previous weekend (never the same person twice in a row) and whoever is on a comeback.
3. Whoever has the lowest weekly score among the rest pays.
4. On a tie, whoever logged fewer days pays. If they are still tied, or if everyone is excluded, nobody pays that weekend.

**Comeback (RF-27).** A report is a comeback when the previous week scored below 50 and the current week improves by at least 15 points (e.g. from 34 to 62). In friends' rankings, the row has the "Comeback" badge and shows the improvement ("+28 points"). That weekend, they cannot be the one who pays in any group.

### 9.1 The weekend phrase

Every weekend the phrase that announces who pays is different, but it is the same on all devices, with no need to sync them. It must be a message people want to read, not a sentence passed on someone: we also think of people going through a hard time.

**How it is chosen (deterministic):**

1. The phrases live in the translation files, with two placeholders: {name} (who pays) and {stake} (the group's stake, e.g. "the pizza", "the beer").
2. The phrase index is calculated from the ISO week and the UUID of who pays: same data, same phrase, in every app.
3. If the index matches the previous weekend's, the next phrase is taken, so it never repeats two weekends in a row.
4. There are two versions: one that friends read, and a warmer one that only the person who pays reads.

**Tone rules:** never mention the score, never words like "lost", "failed" or "fault", no sarcasm, gender-neutral phrases, always a positive ending. Every new phrase goes through your review before it enters the app.

| For whom | Example (in English in the app)                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Friends  | "Looks like {name} had a bit of an uphill week: this weekend {stake} is on {name}. Here's to the next one!"                                       |
| Friends  | "Busy week for {name}? It happens to everyone. This weekend it's {name}'s turn to treat us to {stake}: a great excuse to get together."           |
| Friends  | "This weekend's turn goes to {name}: {stake} is on them, we laugh, and on Monday we all start again together."                                    |
| Friends  | "Weekend's coming: {stake} is on {name}. The group has your back!"                                                                                |
| Who pays | "This week went the way it went, and that happens to everyone. This weekend {stake} is on you: enjoy the evening, next week you're in the clear." |
| Who pays | "It's your turn to treat everyone to {stake}, but remember we're here to feel good together. On Monday we start again, one step at a time."       |

For 1.0 I propose 12 phrases for friends and 6 for the person who pays.

## 10. Privacy, security and non-functional requirements

The app makes no network connections at all. This is a technical constraint enforced by the Content Security Policy and by Tauri's permissions, not just a promise.

| ID     | Requirement                   | Verification criterion                                                                                         |
| ------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| RNF-01 | No network requests           | Content Security Policy that blocks every connection; automated test that fails on any outgoing request        |
| RNF-02 | Notes never shared            | The report package has no access to the notes table; a test checks this                                        |
| RNF-03 | Encryption of protected notes | AES-GCM 256-bit, key from PBKDF2 with 310,000 iterations and a random salt                                     |
| RNF-04 | Forgotten password            | No recovery possible: explicit warning when it is set                                                          |
| RNF-05 | Safe import                   | Every QR field validated for type and limits; text always shown as text, never as HTML                         |
| RNF-06 | Performance                   | Startup in under 2 seconds, saving a check-in in under 100 ms                                                  |
| RNF-07 | Compatibility                 | Windows 10 (22H2) and Windows 11, 64-bit                                                                       |
| RNF-08 | No administrator              | Installation for the current user, data in the user's folder                                                   |
| RNF-09 | Size                          | Installer under 15 MB                                                                                          |
| RNF-10 | Accessibility                 | WCAG AA contrast, full keyboard navigation                                                                     |
| RNF-11 | Data reliability              | No data loss on sudden shutdown (file export is available, RF-19; automatic backup comes with the mobile apps) |
| RNF-12 | Translations                  | No visible text written directly in the code; a test flags missing keys                                        |
| RNF-13 | Code readability              | Explicit names instead of comments, short single-purpose functions, checked by the reviewer agent (section 11) |
| RNF-14 | Tests per feature             | Every RF requirement has at least one test that checks it specifically                                         |

The data lives in the Windows user folder (`%LOCALAPPDATA%\com.vitapact.app`). Anyone with access to the PC under the same account can read unprotected data. For sensitive notes, the password is recommended.

### 10.1 Protecting the QR code without a cloud

I propose a single protection: the report's **personal signature**, with the data kept to a minimum. No secret phrase and no prior exchange between devices are needed.

There are three risks to cover: someone modifying the numbers in a report, someone pretending to be another friend, and a stranger finding the image in a forwarded chat and reading the data.

| Strategy                             | How it works                                                                                                                                                                                                                                                      | Protects against                          | Limits                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| 1. Integrity check only              | A checksum discards damaged QR codes                                                                                                                                                                                                                              | Read errors                               | Anyone can read and modify                                         |
| 2. Personal signature (proposed)     | Each app has a key pair (ECDSA P-256, Web Crypto) and signs its reports. A friend's first report records their public key; later ones must carry the same signature. Optionally, friends compare the key fingerprint in person, written in groups of 4 characters | Changes to the numbers and identity theft | Whoever finds the image can read the summary                       |
| 3. Per-recipient encryption (future) | Using the public keys already received, the QR code holds an encrypted copy for each friend                                                                                                                                                                       | Reading by strangers as well              | The QR code grows by about 100 characters per friend; more complex |

**Why the signature is enough.** The summary holds only weekly averages, no detailed data and no notes, and anyone who wants can hide their absolute weight (D11). The signature guarantees that what you read was really written by that friend and has not been touched. One limit remains: no technique can stop someone from entering false data in their own app. The challenge rests on trust between friends.

Since the code is open source, only standard Web Crypto API algorithms are used: security comes from the keys, not from keeping the code secret.

## 11. Proposed development phases

We start from the screens and the requirements (F0). Then we set up the project with tests and the review pipeline. Only after that do we write the screen code, one feature at a time and always with TDD.

_Diagram: development phases, 5 phases, 4 gates (see the source document)._

Each phase ends with a Windows build that can be tried out. No line of app code is written before Gate 1.

### Feature cycle and reviewer agent

Each screen is split into small features (e.g. "Today: save sleep"). Every feature follows the same cycle. At the end, a reviewer agent acts as architect and team leader: it checks the code and writes guidelines that apply to all later features.

_Diagram: feature cycle, 6 steps, agent review (see the source document)._

1. **Read the guidelines.** The developer reads the team's guidelines file before starting. It is the project's shared memory.
2. **Tests first (red).** Write the tests that describe the feature, tied to the RF requirement it covers. They fail because the code does not exist yet.
3. **Minimal code (green).** Write the simplest code that makes the tests pass.
4. **Clean-up.** Clear names, short single-purpose functions, no duplication. The code must explain itself. Comments only for the "why", never for the "what".
5. **Agent review.** The reviewer agent checks readability, names, function size, respect for package boundaries, use of shared components and test coverage. If it finds problems, the feature goes back to step 4 with precise instructions.
6. **Learning.** Once the review is approved, the agent updates the guidelines file with the rules that emerged (e.g. "calculation functions live in core, never in screens"). The next feature starts from these rules, so the way of working is not lost between sessions.

In practice, the reviewer agent is a dedicated Claude Code agent with its own instructions file in the repository. The guidelines file is versioned together with the code, so every rule has a history.

### 11.1 Agents and tasks

Version 1.0 is built with 23 tasks assigned to 7 agents, one per lane. Within a lane, tasks run from top to bottom. Different lanes in the same phase work in parallel.

_Diagram: task plan, 7 agents, 23 tasks, 4 gates (see the source document)._

No phase starts until Rei approves the previous one. The Architect works on all phases from F1 onwards.

**Task list**

Each task follows the feature cycle described above. "Done" counts only after the Architect's review; at each task the Architect updates the guidelines file. The column says what else must be true. Tasks with the same dependencies can start in parallel.

| ID  | Phase | Agent                    | Deliverable                                                                                            | Depends on       | Done when                                                                                      |
| --- | ----- | ------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------- |
| T00 | F0    | Senior dev (this thread) | Detailed description of each screen: empty states, errors, key texts                                   | Palette approved | Rei approves the document (gate 1)                                                             |
| T01 | F1    | Setup                    | Tauri 2 + React + TypeScript + Vite skeleton, one empty package per screen, navigation                 | T00              | The app opens on Windows and you can navigate between the 6 empty screens                      |
| T02 | F1    | Setup                    | Tokens and Mantine theme from section 6.1                                                              | T01              | A test checks that every token exists and that text/background contrasts pass AA               |
| T03 | F1    | Setup                    | i18n with the English file                                                                             | T01              | A test fails if a key in use is missing from the file                                          |
| T04 | F1    | Setup                    | Vitest, Playwright and CI on GitHub Actions with a Windows build                                       | T01              | Every push runs the tests and produces the installer and the portable version                  |
| T05 | F1    | Architect                | Guidelines file, CLAUDE.md, reviewer agent instructions, PR template                                   | T01              | Rei has read and approved them                                                                 |
| T06 | F1    | Setup                    | Lint, formatting, import boundary rule                                                                 | T01              | CI fails if a screen imports another screen or Mantine (gate 2)                                |
| T07 | F2    | Core                     | Local storage with Dexie: 7 tables and schema version (section 8); export and import to a file (RF-19) | T04              | Read, write, migration and export round-trip tests are green                                   |
| T08 | F2    | Core                     | Modules for the 4 pillars and their registry (RF-23)                                                   | T07              | A test pillar can be added without touching any other code                                     |
| T09 | F2    | Core                     | Weekly and daily score, weights from configuration, verdict bands                                      | T08              | The cases in section 9, rest days included, are green tests                                    |
| T10 | F2    | Core                     | Report: VPACT1 data, signing and verification, QR code, PNG image                                      | T09              | A report that is created, saved and read back comes back identical; a modified one is rejected |
| T11 | F2    | Core                     | Groups: monthly ranking, who pays, comeback, phrase selection                                          | T09, T10         | The 4 who-pays rules and the deterministic phrase (9.1) are green tests                        |
| T12 | F2    | Core                     | Password-based note encryption                                                                         | T07              | Without the right password the text cannot be read; the key never ends up on disk              |
| T13 | F2    | UI                       | Base components from section 6.2                                                                       | T02, T03         | Every component has behaviour and accessibility tests                                          |
| T14 | F2    | UI                       | Domain components from section 6.2                                                                     | T13, T08         | Same as T13 (gate 3, together with T07-T12)                                                    |
| T15 | F3    | Screens                  | Welcome                                                                                                | T14, T07         | Complete first launch, profile saved                                                           |
| T16 | F3    | Screens                  | Today and weigh-in                                                                                     | T14, T09         | Check-in saved, weigh-in banner until Tuesday                                                  |
| T17 | F3    | Screens                  | Week, day detail, report                                                                               | T14, T10         | Every day opens and the PNG is saved                                                           |
| T18 | F3    | Screens                  | Friends, groups, import                                                                                | T14, T11         | Import, ranking and weekend card work                                                          |
| T19 | F3    | Screens                  | Noteboard                                                                                              | T13, T12         | Searchable notes, password protection                                                          |
| T20 | F3    | Screens                  | Settings                                                                                               | T13, T10, T11    | Groups, key fingerprint, export and import data, deletion with double confirmation             |
| T21 | F4    | Release                  | End-to-end tests of the 8 scenarios in section 3                                                       | T15-T20          | The 8 scenarios pass on the Windows build                                                      |
| T22 | F4    | Release                  | Installer, portable version, README, LICENSE GPL-3.0, CONTRIBUTING in English                          | T21              | Rei approves the open source release (gate 4)                                                  |

The screen agents work one per screen, in parallel, each only in its own package. No agent starts before Rei approves this split.

## 12. Rei's decisions (D1-D36)

The decisions from both reviews are already reflected in the document. D4, D5, D12 and D13 changed in the second review. From D18 onwards they are new.

| #   | Question                    | Decision                                                                                                          |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| D1  | Product and repository name | VitaPact                                                                                                          |
| D2  | Container                   | Tauri 2                                                                                                           |
| D3  | Framework                   | React with shared components reused the same way on every screen, preferably from an existing library             |
| D4  | Theme                       | Light first, with beige and greens; dark later                                                                    |
| D5  | Palette                     | Light palette from section 6, approved                                                                            |
| D6  | Clean eating                | 1-5 scale                                                                                                         |
| D7  | Hydration and steps         | Not for now; modular code to add them in the future (RF-23)                                                       |
| D8  | Score weights               | Confirmed 15/25/25/20/10/5, easy to change                                                                        |
| D9  | Late weigh-in               | Yes, can be caught up, without marking it as late                                                                 |
| D10 | Name in the QR code         | Nickname chosen by the user; under the QR code, nickname, UUID and period in plain text                           |
| D11 | Weight in the QR code       | Weight and change, with an option to hide the absolute weight                                                     |
| D12 | Teasing                     | None: only encouraging messages                                                                                   |
| D13 | Phrases                     | Fixed and encouraging, written by us                                                                              |
| D14 | Password                    | Only for the Noteboard, also used to privately track activities the app does not cover                            |
| D15 | Executable code signing     | Not for now                                                                                                       |
| D16 | Distribution                | Installer and portable version, no administrator rights                                                           |
| D17 | Mockup                      | First a generic mockup for the style; if approved, each screen described in detail on the same components         |
| D18 | Stake                       | Friendly, like "whoever falls behind buys the pizza", without making anyone feel at fault                         |
| D19 | Comeback                    | Nobody pays two weeks in a row; whoever comes back after a hard week is highlighted and flagged in the QR code    |
| D20 | Backup                      | Automatic backups postponed to the mobile apps; file export comes into 1.0 (D35)                                  |
| D21 | Platform                    | Desktop now, designed with mobile already in mind                                                                 |
| D22 | Code                        | Open source                                                                                                       |
| D23 | Motto                       | "Join the VitalityMaxxing lifestyle" ("Entra anche tu nello stile di vita VitalityMaxxing") on the welcome screen |
| D24 | Week screen                 | Score front and centre, and clickable days with their score                                                       |
| D25 | Component library           | Mantine 9, used only inside shared/ui (question 12)                                                               |
| D26 | Catching up the weigh-in    | Until the Tuesday of the following week                                                                           |
| D27 | Licence                     | GPL-3.0                                                                                                           |
| D28 | Project language            | Everything in English on GitHub: code, tests, guidelines, documents; brainstorming stays in Italian               |
| D29 | Build                       | GitHub Actions for release builds, a Windows PC for development                                                   |
| D30 | Month of a week             | The month of its Sunday counts                                                                                    |
| D31 | Missing report              | "Waiting", left out of the who-pays calculation, no penalty                                                       |
| D32 | Noteboard tags              | Free-form, with suggestions from tags already used                                                                |
| D33 | Design system               | Light theme with tokens and shared components from section 6                                                      |
| D34 | Who pays                    | Every weekend, whoever has the lowest weekly score; the month is only a ranking (question 11)                     |
| D35 | Data export                 | Export and import to a local JSON file in 1.0 (RF-19); automatic backups stay for the mobile apps (D20)           |
| D36 | Core package                | A single @vitapact/core package with one folder per area (PR #2)                                                  |

## 13. Remaining questions

Twelve points to close before Gate 1, each with my proposal. The first three are the ones from draft 0.2 that are still open.

| #   | Question                                                                                                                                                          | My proposal                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Rei's answer                                                                                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tauri builds the Windows executable only on Windows. Do you have a Windows PC where we can install Node and Rust, or do we build automatically on GitHub Actions? | GitHub Actions for release builds, a Windows PC for development                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Yes                                                                                                                                                                                                                                                                                                                                           |
| 2   | Component library: Mantine 9 or shadcn/ui (based on Tailwind)?                                                                                                    | Mantine 9, wrapped in shared/ui. MIT licence, created and led by Vitaly Rtishchev with the community; 358 releases since May 2021, one major per year (8.0 in May 2025, 9.0 in March 2026, latest 9.7.2 on 11 October 2026); about 2.8 million downloads a week ([npm](https://www.npmjs.com/package/@mantine/core), [pkgpulse](https://www.pkgpulse.com/packages/%40mantine/core)). Mobile: yes, Tauri mobile shows the same web interface in the phone's WebView. Risk: a single main maintainer; screens never import Mantine, so replacing it touches only shared/ui. Alternative: shadcn/ui (code copied into the project, on Radix and Tailwind). | It depends on Mantine. Is it a library that is constantly updated? Who makes it? How widely is it used? Let's think it through before we base the whole structure on it. Even though the app is offline, we will need to review how it works. Will we be able to port the app to mobile with Mantine? Otherwise we use a different framework. |
| 3   | Until when can a week's weigh-in be caught up?                                                                                                                    | Until the following Saturday; if the report had already been generated, it is regenerated                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Until Tuesday of the following week                                                                                                                                                                                                                                                                                                           |
| 4   | Does a week that spans two months count for the month of its Sunday?                                                                                              | Yes, so every week belongs to only one month                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Yes                                                                                                                                                                                                                                                                                                                                           |
| 5   | Does someone who does not send their report count in the who-pays calculation?                                                                                    | No: they stay "Waiting", with no penalty                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | I agree with the proposal                                                                                                                                                                                                                                                                                                                     |
| 6   | Comeback thresholds: previous week below 50 and at least +15 points?                                                                                              | Yes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes                                                                                                                                                                                                                                                                                                                                           |
| 7   | QR protection: is the personal signature enough, with the data kept to a minimum (section 10.1)?                                                                  | Yes; per-recipient encryption stays a future option                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Yes                                                                                                                                                                                                                                                                                                                                           |
| 8   | Open source licence: MIT (permissive) or GPL-3.0 (anyone who modifies it must stay open source)?                                                                  | MIT, the simplest for the community                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | GPL-3.0. The code must always be open source, otherwise the app loses its point.                                                                                                                                                                                                                                                              |
| 9   | Language for code, tests and the reviewer agent's guidelines                                                                                                      | English, to open up to the community; project documents in Italian                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | English, everything in English. The project documents will have to move to English. For now we are brainstorming in Italian, but eventually everything on GitHub will be in English.                                                                                                                                                          |
| 10  | Noteboard tags: free-form or from a fixed list?                                                                                                                   | Free-form, with suggestions from tags already used                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | I agree with the proposal.                                                                                                                                                                                                                                                                                                                    |
| 11  | Who pays: every weekend, whoever has the lowest weekly score, while the month stays a ranking with no paying?                                                     | Yes: the stake is played every weekend, the month measures consistency                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Yes, as advised                                                                                                                                                                                                                                                                                                                               |
| 12  | Do you confirm Mantine 9 inside shared/ui, given the data in question 2?                                                                                          | Yes; if it ever needs replacing, only shared/ui is touched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Yes, it seems the safest path to me                                                                                                                                                                                                                                                                                                           |
