# Road to Boylston v1.0: Testing Record

## Automated checks actually performed

- `node --check` for `src/app.js`, `src/training.js`, `src/metrics.js`, `src/storage.js`: **PASS**.
- `npm test` on the local Node v22.16.0 runtime: **13 tests passed, 0 failed**.
- `npm run build`: **PASS**, `dist/` created with all app assets.
- HTTP serving: local Python HTTP server returned HTTP 200 for app root.
- UI smoke render via a Node DOM/IndexedDB shim: **PASS**. Five tabs and the workout, charity, fundraising, and notes navigation rendered. The test confirms JavaScript view generation, not mobile browser layouts.

## Validation not completed in this environment

An attempt to load the local app through the available Chromium 144 + Python Playwright failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR`, including for local `http://localhost` and `file://` URLs. The browser's execution environment disallowed that navigation. Therefore **full browser end-to-end functionality, visual layout on an iPhone-size viewport, offline behavior, and device-persistence scenarios have NOT been verified by a real browser in this session**. Do not interpret the above unit tests as proof of those scenarios.

## Human smoke-test checklist after deployment

- [ ] On iPhone Safari, load `/road-to-boylston/` and complete onboarding with three running days.
- [ ] Reload; onboarding remains completed and the same calendar appears.
- [ ] Today shows a real scheduled activity; tap a plan to view warm-up and cooldown.
- [ ] Add a 1.50 mi / 20-minute run. Verify preview pace `13:20 / mi` and the corresponding dashboard/progress updates.
- [ ] Edit the run's duration to 15 minutes; pace updates to `10:00 / mi` and charts refresh.
- [ ] Delete the run, confirm, and verify stats decrease.
- [ ] View calendar Month and Week; select days, reschedule a workout and mark one skipped.
- [ ] Add/edit a race and record a finish time; review the personal record section.
- [ ] Create/edit a charity application, its status and last-verified date.
- [ ] Add a $100 received donation and $50 pledged. Verify received = $100, pledged = $50 and remaining is calculated using received only.
- [ ] Edit fundraising goals and deadline; verify amount-per-week calculation.
- [ ] Edit My Why and reload. Confirm text remains.
- [ ] Export a JSON backup; import it using merge mode and confirm that identical IDs do not duplicate.
- [ ] Restore a backup using replace mode on a *separate test profile* and verify settings and data are restored.
- [ ] Try an invalid `.json` and verify a safe error is shown without overwriting data.
- [ ] With the app previously loaded, turn on Airplane Mode and reopen from Home Screen; verify previously loaded plan/logs are accessible.
- [ ] Update the deployed app and verify old local records persist.
- [ ] Test 375px and 430px mobile widths in Safari, plus keyboard and reduced-motion accessibility.
- [ ] Test service worker update and `https://USERNAME.github.io/road-to-boylston/` subpath directly.

## Verification boundaries

No GitHub repository was created or deployed by this packaging process. External charity application status was not verified. Only local code packaging and the automated tests listed above were completed here.
