# Project Features and Quality Assurance

The AUPP Student Management System is a course demonstration using fictional student records, HTML, CSS, and vanilla JavaScript. It has no framework, build step, or runtime package dependencies and is not an official AUPP service.

## Feature mapping

| Requirement | Implementation |
| --- | --- |
| Semantic HTML and shared shell | `index.html`; sidebar, navbar, main, footer, native dialog, notifications |
| Organized CSS | `base.css`, `layout.css`, `components.css`, `pages.css`, `responsive.css` |
| ES6 modules | `js/app.js` bootstraps `main.js`; explicit relative imports throughout |
| Page navigation | `router.js`; six pages plus an edit route, safe hash decoding |
| Dashboard | `pages/dashboard.js`; totals, statuses, all majors, recent records |
| Student CRUD | `services/studentService.js`; validation, normalization, local/remote selection |
| Separate persistence | `services/storageService.js`; compatible original keys and explicit storage errors |
| Student REST API | `api/studentsApi.js`, `api/http.js`; GET/POST/PUT/DELETE, JSON, timeouts |
| MockAPI field mapping | `services/studentService.js`; maps `fullName`/`academicYear` and numeric GPA to the app's existing view model |
| Countries API | `api/countriesApi.js`; CountriesNow with a built-in fallback and a user-facing warning |
| Sample data | `data/sampleStudents.js`; 64 fictional students across eight majors |
| Shared add/edit form | `pages/studentForm.js`; required fields and inline accessible errors |
| Validation | `utils/validation.js`; trimmed input, email, unique student ID, year, status, GPA 0–4 |
| Search, filters, sorting, pagination | `pages/students.js`, `utils/studentQueries.js`; pure queries, focused result updates |
| Profiles and confirmation | `components/studentProfile.js`, `components/modal.js`; native modal focus and cancellation |
| Statistics and charts | `components/charts.js`; shared by dashboard and analytics, including empty data |
| CSV export | `utils/csv.js`; exports the filtered/sorted result, quotes values and escapes formula prefixes |
| Printable analytics | `pages/analytics.js` and print rules in `responsive.css` |
| Settings | `pages/settings.js`, `services/settingsService.js`; test connections before saving |
| Themes and mobile layout | Shared navbar and sidebar; saved theme, mobile backdrop and navigation state |
| Error handling | Visible startup/load recovery, service errors, field errors, reusable notifications |
| Listener lifecycle | Each page uses an AbortSignal; table actions use event delegation |
| Team documentation | README architecture walkthrough, file responsibilities, API contract, four-member division |

## Refactor fixes

- Replaced the malformed HTTPS regex that stopped the original app module from parsing and left content blank.
- Added initial loading content, an import/startup error boundary, and data-load recovery. Settings and Help remain reachable when records cannot load.
- Split the former monolithic JavaScript and stylesheet by responsibility; removed the replaced `js/api.js` and `css/style.css` after checking their replacements.
- Centralized field options, formatting, validation, student tables, metrics, charts, dialogs, and notifications.
- Removed duplicate per-row handlers and the Settings reset listener that could accumulate or be consumed by an unrelated modal click.
- Preserved existing browser storage keys and avoided reseeding a deliberately empty collection.
- Report corrupt or unavailable browser storage instead of silently discarding records.
- Render all eight sample majors and give empty status charts a neutral state.
- Avoid a second GET after a successful write, so an unrelated refresh failure does not encourage duplicate submissions.
- Validate API response shapes and internal IDs; handle PUT/DELETE 204 responses and request timeouts.
- Guard pending data changes and ignore outdated load results after changing sources.
- Keep the search input mounted while updating results, preserving cursor/focus.
- Escape user-controlled HTML and protect CSV cells from spreadsheet formula interpretation.

## Automated verification

The full automated suite passed **20 of 20 checks** against the running VS Code Live Server on port 5500, including HTML/CSS/module asset requests. Without `CAMPUSFLOW_URL`, the one HTTP asset check is skipped. No packages are installed.

```sh
CAMPUSFLOW_URL=http://127.0.0.1:5500/ node --test tests/*.test.mjs
```

Coverage includes:

- JavaScript syntax for every module.
- Existing import targets, no circular imports, and no orphaned modules.
- All five CSS files, the favicon, HTML, and JavaScript served successfully with suitable MIME types.
- Initial sample loading, existing-data preservation, and empty collections.
- Local create/read/update/delete, stable IDs/timestamps, and persistence.
- Case-insensitive student ID uniqueness and validation boundaries.
- Corrupt JSON, malformed records, duplicate internal IDs, and storage write failures.
- Search, combined filters, sorting, pagination, statistics, and all-major charts.
- HTML escaping, CSV quoting/formula prefixes, date handling, and malformed hashes.
- Mocked remote CRUD methods, encoded IDs, 204 responses, source isolation, and connection validation.
- HTTP errors, invalid JSON, timeouts, missing POST IDs, and country fallback behavior.

Remote automated tests mock `fetch`; the live MockAPI check is documented separately below.

## Browser verification

Checked in Chrome and Safari over local HTTP. The main app session and a fresh isolated Safari test origin both loaded the site. The isolated preview server later stopped during the final cleanup; the original Live Server asset check had already passed in the complete automated run.

| Check | Observed result |
| --- | --- |
| Initial dashboard | 64 students, 50 active, 9 inactive, 5 graduated, average GPA 3.03 |
| Charts | All eight majors rendered; year totals rendered in Analytics |
| Routes | Dashboard, directory, add/edit, Analytics, Settings, Help rendered |
| Required fields | Blank submission produced inline errors and did not save |
| Create | Fictional `QA-REF-2026` record saved; directory count increased to 65 |
| Read/search/profile | Search found the test record; the profile showed the saved ID, major, year, GPA, and country |
| Update | Changed GPA from 3.85 to 3.95 and changed country to Thailand; the profile and analytics reflected the saved change |
| Delete | Opened the confirmation dialog and canceled; did not permanently delete the disposable QA record |
| Persistence | Reload retained the edited values. QA was isolated on port 5502; the original Live Server dataset remained untouched |
| Invalid endpoint | Visible HTTPS URL error; source stayed in Demo Mode |
| Theme | Dark styling rendered on Help; restored to light after checking |
| Mobile | Chrome iPhone 16 emulation at 393 × 852; menu opened, navigation closed it, and form stacked in one column |
| Console | No application JavaScript exceptions observed; external errors described below |

**Country API:** the previous REST Countries request failed in browser QA. CountriesNow's official API docs provide the public `/countries/positions` endpoint, and both its JSON response and the CampusFlow browser fetch succeeded. The Add Student selector listed the returned country names. The app uses the built-in fallback and a visible warning if a future request fails. An unrelated installed Chrome extension also logged a warning.

## MockAPI integration

The `students` resource was created in the supplied MockAPI project with the requested fields and no records. It has collection/item GET, POST, PUT, and DELETE endpoints enabled. Student API payloads use `fullName`, `academicYear`, and numeric `gpa`; the service maps those to the existing UI model (`name`, `year`, and formatted GPA text). The demo collection remains local and no sample records are copied to MockAPI.

The live check confirmed GET returned an empty array, POST created a fictional QA student with the canonical fields, PUT updated its name/GPA/country, and DELETE removed it. A page refresh kept the API record visible until cleanup; the endpoint returned an empty array afterward. Dashboard and Analytics recalculated for remote data, directory search and major filtering found the record, and the browser's demo mode still showed all 64 fictional students. API mode was restored after the demo check. CountriesNow returned its JSON collection in Chrome, and the Add Student selector listed and selected returned countries. Fallback country options and a user-facing notice cover outages.

CSV download was exercised in Safari; the downloaded filtered CSV contained one record, all eight fields, and the updated GPA and country. Print Report opened Safari print preview and was canceled. Theme, invalid endpoint, and mobile behavior were also checked in earlier browser QA.

## Repeatable manual checks for the team

Use fictional records on a disposable browser origin or test API.

1. Start Live Server and open the dashboard. Check counts and charts against the directory.
2. Open every navigation link, reload a deep route, and use Back/Forward.
3. Add a valid fictional student. Try blank fields, invalid email/GPA, and a duplicate student ID.
4. Search by ID, name, and email. Combine filters, change sorting, move between pages, then clear filters.
5. Open the profile, edit the record, reload, and verify its fields persisted.
6. Cancel a delete, then delete the test record and verify it disappears from search and statistics.
7. Export a filtered CSV and compare its rows to the full filtered result, not just the current page.
8. Open Analytics and Print Report; check the print preview and cancel the dialog.
9. Toggle theme, reload, and verify it persists. Test the mobile menu and keyboard access to dialogs.
10. Test a valid disposable API endpoint, an invalid URL, an unavailable service, and switching back to demo. Ensure local and remote data stay separate.
11. In a disposable demo origin, cancel and then confirm a sample reset. Navigate away/back and repeat to check listener cleanup.
12. Inspect Console and Network for application exceptions or missing local files. Distinguish external API/CORS and browser-extension messages from project errors.

The included storage is browser-local and the application has no authentication. Use fictional data for coursework.
