# AUPP Student Management System — Academic Project Demo

An INFO 251 Web Development II final project built with HTML, CSS, and vanilla JavaScript ES6 modules. It uses AUPP imagery for an academic project mockup and is not an official AUPP service. No framework, build step, or npm dependencies are needed to run the website.

The campus photo is from [AUPP's campus announcement](https://www.aupp.edu.kh/wp-content/uploads/AUPP-Building.jpg). The unmodified university block logo is from the [AUPP logos page](https://www.aupp.edu.kh/aupp-logos/).

## Run with VS Code Live Server

1. Open the `student-management-system` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**, or click **Go Live**.
3. Open the URL shown by Live Server, normally `http://127.0.0.1:5500/index.html`.
4. On a fresh browser origin, the app loads the shared MockAPI database. Choose Demo Mode in Settings to use 64 fictional students saved only in that browser.

Alternatively, run `python3 -m http.server 5500` in this folder and open `http://localhost:5500`.

Do not open `index.html` through `file://`: browsers require HTTP for ES6 imports. Use the same hostname and port to keep accessing your saved data; `localhost`, `127.0.0.1`, and different ports have separate storage.

## Features

- Dashboard with totals, average GPA, all majors, statuses, and recent students.
- Student directory with name/ID/email search, combined filters, sorting, pagination, profiles, and CSV export.
- Add, edit, and delete students; validate required fields, email, unique student IDs, year, status, and GPA 0–4.
- Analytics with printable reports.
- Settings for the API connection, theme, and confirmed sample-data reset.
- Help page, responsive navigation, accessible dialogs, inline validation, and notifications.
- Public country lookup with a built-in country list when the service is unavailable.
- Shared MockAPI student database with GET, POST, PUT, and DELETE; optional local Demo Mode.

## Project structure

```text
student-management-system/
├── index.html                   # Persistent semantic application shell
├── assets/
│   ├── icons/favicon.svg        # Local app icon
│   └── images/                  # AUPP logo and campus photograph
├── css/
│   ├── base.css                 # Tokens, reset, typography, theme, accessibility
│   ├── layout.css               # Sidebar, navbar, main area, footer
│   ├── components.css           # Buttons, cards, tables, charts, dialogs, fields
│   ├── pages.css                # Dashboard, directory, form, settings layouts
│   └── responsive.css           # Mobile, reduced motion, and print styles
├── js/
│   ├── app.js                   # Small bootstrap with visible startup recovery
│   ├── main.js                  # Composition, application state, page lifecycle
│   ├── router.js                # Hash parsing, route names, navigation
│   ├── api/
│   │   ├── http.js              # JSON requests, timeout, network errors
│   │   ├── studentsApi.js       # Student HTTP endpoints only
│   │   └── countriesApi.js      # Country lookup and offline fallback
│   ├── data/
│   │   ├── sampleStudents.js    # Deterministic fictional data generator
│   │   └── studentOptions.js    # Majors, years, statuses, fields, countries
│   ├── services/
│   │   ├── studentService.js    # Student CRUD, normalization, source selection
│   │   ├── storageService.js    # All localStorage reads/writes and storage errors
│   │   └── settingsService.js   # Test and commit connection changes
│   ├── components/
│   │   ├── sidebar.js          # Navigation state and mobile menu
│   │   ├── navbar.js           # Date, title, and saved theme
│   │   ├── modal.js            # Shared native dialog and confirmation behavior
│   │   ├── notifications.js    # Toast messages
│   │   ├── page.js             # Headers, select options, status badges
│   │   ├── studentTable.js     # Shared table and delegated row actions
│   │   ├── studentProfile.js   # Student profile dialog
│   │   └── charts.js           # Shared metric cards and CSS charts
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── students.js
│   │   ├── studentForm.js      # One form for both add and edit
│   │   ├── analytics.js
│   │   ├── settings.js
│   │   └── help.js
│   └── utils/
│       ├── validation.js      # Input cleanup, student and endpoint validation
│       ├── formatting.js      # HTML escaping, names, GPA, dates
│       ├── studentQueries.js  # Pure filtering, sorting, paging, statistics
│       └── csv.js             # Safe CSV serialization and download
├── tests/
│   ├── regression.test.mjs    # Domain, storage, mocked HTTP, recovery checks
│   └── structure.test.mjs     # Syntax, imports, cycles, references, HTTP assets
├── .gitignore                 # Excludes archives, local settings, secrets, and temporary files
├── .editorconfig              # Consistent two-space formatting
├── README.md
└── PROJECT_FEATURES.md
```

## How the modules work together

`app.js` loads `main.js` and displays a useful message if startup fails. `main.js` owns state and passes each page only the data and callbacks it needs. Pages render HTML using reusable components. Services apply student rules and select either local storage or the remote API. API modules handle requests; the storage service owns persistence. Utilities and sample-data modules are independent of the UI.

A save follows this flow:

```text
Student form → validation → student service → storage service OR students API
                                                ↓
Directory/dashboard ← application state ← confirmed saved record
```

The app uses the successful write response rather than making a second GET part of the save. This prevents a failed follow-up read from incorrectly reporting that an already-completed save failed. A page's event listeners use an `AbortSignal`, so navigation removes the old listeners. Directory search updates only the result area and preserves input focus.

Routes are `#dashboard`, `#students`, `#add`, `#edit/<internal-id>`, `#analytics`, `#settings`, and `#help`. Reloading any route works without server rewrites. Unknown or malformed routes safely return to the dashboard.

## Data and API configuration

The existing localStorage keys are retained:

| Key | Purpose |
| --- | --- |
| `campusflow_students_v1` | Local student array |
| `campusflow_api_url` | Selected student resource URL while API Mode is active |
| `campusflow_data_mode` | `api` or `demo`; a missing key defaults to the shared MockAPI endpoint |
| `campusflow_theme` | `light` or `dark` |

An empty student array stays empty; samples are only created when no local collection exists. Damaged stored data is reported without being silently overwritten. **Reset Demo Data** explicitly replaces local students after confirmation and never changes remote records.

The `students` resource is `https://6af863ea9bdd097c326ed47b.mockapi.io/students`. First visits and browser profiles upgrading from older versions connect to this fixed endpoint automatically. Settings offers **Test Connection**, **Connect to Shared MockAPI**, and **Switch to Demo Mode**; visitors do not need to enter a URL. Demo Mode choices made in this version persist in that browser until the user switches back to MockAPI.

**Public database warning:** this course project has no authentication or access control. Anyone who can access the public endpoint may read, add, edit, or delete shared records. Use fictional records only; do not store real student information. Demo Mode is local to one browser and does not change or copy records to MockAPI.

The MockAPI schema has `id` (generated by MockAPI), `createdAt` (date), `studentId` (string), `fullName` (string), `email` (email), `major` (string), `academicYear` (string), `gpa` (number), `country` (string), and `status` (string). No default `avatar` field is used. Resource creation does not seed records.

| Field | Meaning |
| --- | --- |
| `id` | Unique internal identifier, used for PUT and DELETE |
| `studentId` | Human-readable student number, unique ignoring case |
| `fullName`, `email` | Student name and email (`fullName` maps to the app's `name` property) |
| `major`, `country` | Major and country labels |
| `academicYear` | `1` through `5` (`academicYear` maps to the app's `year` property) |
| `gpa` | JSON number from `0` through `4`; the form formats it as text |
| `status` | `Active`, `Inactive`, or `Graduated` |
| `createdAt` | ISO timestamp, preserved when editing |

The endpoint must allow browser CORS requests. GET returns an array of objects with unique internal IDs. POST returns the saved object including its ID. PUT returns the updated object or HTTP 204. DELETE may return JSON, an empty response, or HTTP 204. Student requests time out after 12 seconds; countries use 8 seconds and then fall back.

API Mode is the default when the current mode preference is absent, including for profiles that contain only a legacy endpoint setting. It loads only the remote collection and sends CRUD requests there, so other visitors see successful changes when they refresh. Demo Mode uses the existing 64 fictional students and localStorage. Switching sources does not transfer data, and demo records are never uploaded automatically. A failed API request shows a retryable error and does not switch to Demo Mode. An empty remote collection is shown as empty. Client-side uniqueness checks use the loaded remote records; a real multi-user backend must enforce uniqueness too. There are no API secrets in the client.

## Testing

The application needs only a browser. Development checks optionally use Node.js 22.7 or newer, with no packages to install:

```sh
node --test tests/*.test.mjs
```

To also verify every deployed local module, stylesheet, and icon through Live Server, leave it running and use:

```sh
CAMPUSFLOW_URL=http://127.0.0.1:5500/ node --test tests/*.test.mjs
```

The HTTP asset check is skipped when `CAMPUSFLOW_URL` is absent. Automated remote API tests mock `fetch` and never modify the live endpoint. To check the shared service without changing its data, use **Test Connection** in Settings. Test CRUD in Demo Mode or a separate disposable MockAPI project; do not add test records to the class database. Never use actual student data. The manual QA procedure and verification results are in [PROJECT_FEATURES.md](PROJECT_FEATURES.md).

## Web Development II concepts

| Concept | Where to explain it |
| --- | --- |
| DOM manipulation | Pages update the content area with reusable HTML; directory searches update just the results. |
| Event handling | Form submit, search input, filter change, and delegated table clicks call focused handlers. |
| Fetch API | `api/http.js` sends HTTP requests; student and country API modules select endpoints. |
| async/await | Services wait for requests and persistence before the UI reports success. |
| CRUD operations | Demo mode reads/writes localStorage; remote mode uses GET, POST, PUT, and DELETE. |
| Form validation | Shared rules check required fields, email, GPA, year, status, and duplicate student IDs. |
| Error handling | Try/catch, timeouts, inline errors, notifications, and startup recovery keep failures visible. |

## Country API

At startup, the app requests country names from `https://countriesnow.space/api/v0.1/countries/positions`, removes duplicates, and sorts them. Add and Edit use the same country options. The selected country is preserved if the request finishes while a form is open. Network errors, invalid responses, and timeouts show a notice and use the built-in fallback list, which includes Cambodia and neighboring countries. An existing student's country remains selectable even when it is absent from the fallback.

## Known limitations

- This is a browser-based course demonstration, without login, authorization, or a private student database. Use fictional records.
- Demo data belongs to one browser origin. Clearing browser storage removes it; CSV export provides a readable copy, but CSV import is not included.
- MockAPI has no authentication or access control in this course setup. Anyone who knows the public URL may read or change its fictional records.
- Remote uniqueness checks apply to the loaded dataset. Concurrent users need server-side validation, and external changes appear after reloading.
- The public CountriesNow service may be unavailable or change its response. The app displays a notice and uses the fallback country list.
- CSV export starts a browser download. Browser download restrictions or a canceled save dialog can prevent a file from being saved.
- ES6 modules and native dialogs require a modern browser and HTTP serving, such as VS Code Live Server.

## Repository

Source repository: [Panha2025/Student-Management-System](https://github.com/Panha2025/Student-Management-System).

The project runs directly from the repository files. Pushing source code does not itself enable a hosted website; no build system or hosting service is required for the Live Server presentation.

## Working as a four-student team

| Member | Main area | Explain during presentation |
| --- | --- | --- |
| 1 | `index.html`, shell components, dashboard | Semantic HTML, hash routing, reusable UI |
| 2 | `api/`, `services/`, sample data | Async/await, CRUD, persistence, error handling |
| 3 | Student pages and utilities | Validation, search, filters, sorting, pagination |
| 4 | CSS, analytics, tests, documentation | Responsive layout, statistics, accessibility, QA |

Read `index.html`, `app.js`, `main.js`, and one page first. Follow its callbacks into the service layer. Put shared behavior in components or utilities, keep HTTP calls in `api/`, and keep storage access in `storageService.js`. Use two-space indentation and descriptive names. Add tests for behavior changes and update the feature mapping when features change.

A 12–15 minute presentation can cover the problem, architecture, dashboard, search, add/edit/delete, analytics, mobile layout, and the local/remote data-source distinction.
