# Road to Boylston

**26.2 Miles. 15 Years. One Finish Line.**

A private-by-default, mobile-first marathon preparation and Boston 2028 charity tracking progressive web app (PWA). Built for a returning runner beginning in November 2026, progressing through a 5K, 10K, half marathon, a first full marathon, then a hoped-for Boston Marathon charity entry on **Monday, April 17, 2028**.

![Badge: no external services required](https://img.shields.io/badge/runtime-no%20dependencies-91dabf) ![Badge: local first](https://img.shields.io/badge/data-IndexedDB-85b6fc)

## What is included

- **Today:** real calendar-day session, warm-up, main session, cooldown, start/pause timer while the page is active, activity logging, actual week mileage, adherence, and motivational progress.
- **Calendar:** month/week views, workout detail editing, skips, rescheduling, planned vs. actual sessions, and recovery days.
- **Training blocks:** beginner run/walk progression in reviewable four-week blocks, with 10K, half, first-marathon, and Boston phase options. Next blocks are never advanced automatically. Pain/fatigue and missed sessions trigger conservative warnings.
- **Activity history:** running, run/walk, walking, strength, bike, elliptical, cross-training, recovery, race logs; distance, duration, calculated pace, perceived effort, energy, and optional detail fields.
- **Progress:** weekly/monthly running charts, cumulative distance and pace trends, training adherence, weekly review, race milestones, and race-result records.
- **Boston:** countdown, entry status pipeline, separate charity acceptance vs. entry confirmations, three explicitly *unverified* example charities, application details, donation and pledge ledger, editable fundraising goals, amount needed per week, and editable My Why.
- **Data management:** IndexedDB persistence, versioned JSON backup export/import (merge or replace), destructive-action confirmation, offline app-shell cache, and a dark/light theme.
- **Accessibility:** keyboardable native controls, contrast-aware labels, mobile safe areas, reduced-motion setting, and responsive layout.

## Important privacy and reliability information

This is a **local-first app**, not an online account. It does not transmit your workout, note, or donation data to a server. Each browser profile and device keeps a **separate** IndexedDB database. Using the same GitHub Pages URL on your iPhone and computer **does not synchronize your data**. To move data, export a JSON backup on one device, then import that backup on the other. Clearing browser data, changing browser profiles, or uninstalling the PWA can erase local records. Back up regularly.

The **code repository itself may be public**, so **do not commit your real backup JSON, donor data, passwords, private diary entries, or personal information into this repo**. The default My Why text is a nonidentifying starter; edit your personal 2013 recollection inside the app, where it stays in your device's storage.

No Apple Health, Strava, Oura, GPS, payment, charity monitoring, or cloud-sync integration is claimed to work. No fake account or fake alerts are supplied.

## Quick launch on GitHub Pages (no terminal required)

1. Download the `road-to-boylston.zip` delivered with this project and **extract it** on your PC. Open the extracted `road-to-boylston` folder. You should see `index.html`, `src`, `assets`, `.github`, and other files.
2. Sign in at [github.com](https://github.com). Click **+ → New repository**. Name it **`road-to-boylston`**. Make it public if you want free, straightforward GitHub Pages hosting; leave **Initialize with README** unchecked.
3. Create the repository. On the empty repository page click **uploading an existing file** / **Add file → Upload files**. Drag in the **contents** of the extracted folder, *not the ZIP itself*. Include the `.github/workflows/deploy.yml` file and folders. Commit to the `main` branch. If the web uploader has trouble with folders or hidden files, use GitHub Desktop (instructions below).
4. Open repository **Settings → Pages → Build and deployment → Source → GitHub Actions**. The supplied deployment workflow tests and publishes the files. If it ran before you enabled Pages, go to **Actions → Test and publish Road to Boylston → Run workflow**.
5. In **Actions**, confirm the latest run's **test** and **deploy** jobs are green. Open:

   `https://YOUR_USERNAME.github.io/road-to-boylston/`

   Replace `YOUR_USERNAME` with your real GitHub username. The repository must be named `road-to-boylston` for that exact URL. Use Settings → Pages to see the actual published link.

6. Complete first-time onboarding, select your running days, and record a test workout. Open Settings → Export JSON backup to save a copy.
7. On **iPhone**, open the URL in **Safari**. Tap **Share → Add to Home Screen → Add**. Reopen from the new Home Screen icon. Use Safari's own installation flow; an iOS home screen installation is not a distinct cloud account.

### More reliable option: GitHub Desktop (recommended for uploading folders)

1. Install [GitHub Desktop](https://desktop.github.com/) and sign in.
2. Choose **File → Add local repository**. If the app says it isn't a Git repository, create a repository from that folder, choose the name `road-to-boylston`, and retain the existing files.
3. Commit changes, click **Publish repository**, then configure Settings → Pages → GitHub Actions in the browser as above. Do not add workout backups or sensitive notes to commits.

## Run locally

No npm package installation is needed. ES module imports require an HTTP server (double-clicking `index.html` as `file://` is not reliable).

Using Python 3:

```bash
cd road-to-boylston
python -m http.server 4173
```

Open `http://localhost:4173/`. On Windows, `py -m http.server 4173` may be used if Python was installed via the Python launcher. Alternatively open the folder in VS Code with a local Live Server extension.

## Source layout

```text
road-to-boylston/
├── index.html                    # HTML app shell
├── manifest.webmanifest          # installable PWA metadata
├── sw.js                         # offline app-shell cache
├── assets/                       # icons
├── src/
│   ├── app.js                    # views, forms, navigation and events
│   ├── styles.css                # mobile responsive UI and themes
│   ├── training.js               # training rules and initial milestones
│   ├── metrics.js                # pace, adherence, chart data and fundraising
│   ├── date.js                   # local calendar-day handling
│   └── storage.js                # IndexedDB and backup validation
├── tests/                         # Node tests incl. render smoke harness
├── scripts-build.js              # builds self-contained static dist/
└── .github/workflows/deploy.yml   # tests + Pages publishing
```

**Engineering choice:** The requested preferred stack was React/TypeScript/Vite/Tailwind. This release intentionally uses modular browser-native JavaScript, CSS, IndexedDB and zero runtime dependencies. For a single-user static PWA it removes package churn, external CDN reliance, build-time complexity, and the possibility that an npm install prevents deployment. This is a deliberate substitution, not a claim that React/TypeScript was implemented. Node is needed only for automated tests or creating a `dist/` directory.

## Testing

With Node.js 20+:

```bash
npm run check   # JS syntax + unit tests + UI-render smoke test
npm run build   # produces dist/ for GitHub Pages
```

Node uses its built-in test runner; `npm install` is unnecessary. Tests cover calendar dates/DST, initial and future block logic, pace/unit conversion, adherence, fundraising calculations, backups, race records, the coach's safety prompts and UI screen rendering. These tests do **not** replace human testing on iOS Safari and Chromium. See `docs/TESTING.md` for the actual validation record and manual smoke-test checklist.

### Updating your site

Edit the source and push or upload the changed files to `main`. GitHub Actions reruns tests and deploys if checks pass. The page's service worker will install updated app-shell assets. If you change `sw.js` cached assets, update its `CACHE` version string to force a fresh cache; manually reload your installed Home Screen app after a new deployment. Source updates should not clear IndexedDB. Export a backup first if modifying storage schema.

### JSON backup and restore

In **Settings → Export JSON backup**, save the `.json` file in iCloud Drive or another safe folder. In **Settings → Restore or merge a JSON backup**, select the saved file and choose:

- **Merge**: import records with new IDs and retain all existing records (matching IDs are not overwritten). Current settings and My Why remain unchanged.
- **Replace**: swap the browser data with the entire backup (requires confirmation). Current settings and My Why are replaced by the backup values.

The backup schema is `schemaVersion: 1`. Other versions, duplicate IDs, malformed dates, and invalid workout numbers are rejected. Importing potentially untrusted JSON is not a general-purpose data conversion tool. Save backups off-device.

## Future cloud sync

Supabase could eventually enable a genuine sign-in, Postgres row-level security tied to authenticated `auth.uid()`, per-user tables, conflict resolution, offline-first synchronization, and encrypted transport. **There is no current Supabase project, login, or sync**; never put Supabase service-role keys or secrets in GitHub Pages. Add cloud sync only after testing privacy/security rules and migration of local data.

## Fitness notes

Training progression is conservative and **not medical clearance**. This app initially schedules three short run/walk sessions per week (configurable), with optional strength work and rest. Later running phases are unlocked by **user approval of four-week blocks** rather than continuous automatic mileage increases. A complete personalized marathon build, race readiness, medical concerns, fueling, and return-to-running limitations should be reviewed with a qualified clinician or running coach when appropriate. Stop exercise and seek medical evaluation for **exertional chest pain, fainting, or unusual breathlessness**. For persistent or increasing discomfort, seek assessment before increasing activity.

The first full marathon is a **personal target**, not a prerequisite to submit Boston charity applications. The Boston date is April 17, 2028; charity eligibility, deadlines and fundraising commitments must be confirmed with official 2028 resources.

Official references: [B.A.A. Boston Marathon](https://www.baa.org/races/boston-marathon/) · [B.A.A. Qualification info (2028 date)](https://www.baa.org/races/boston-marathon/qualify/)

## Known limitations

This version does not include cross-device sync, automated charity monitoring, verified charity application data, real background workout alarms on iOS, route recording, smartwatch integrations, interactive GPS, or donation payments. The first release prioritizes working local tracking rather than an untested complex cloud backend. The in-browser timer is intended for a foreground page only. Training phases are editable four-week progression blocks, **not** an automatically prescribed 20-week individualized marathon training plan. Update race dates and charity entries only from official sources.
