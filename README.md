# CampusFlow — Student Management System

An INFO 251 Web Development II final project built with HTML, CSS, and vanilla JavaScript ES6 modules. No framework, build step, or npm dependencies are needed to run the website.

## Run with VS Code Live Server

1. Open the `student-management-system` folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**, or click **Go Live**.
3. Open the URL shown by Live Server, normally `http://127.0.0.1:5500/index.html`.
4. On a fresh browser origin, Demo Mode creates 64 fictional students. Changes persist in that browser's localStorage.

Alternatively, run `python3 -m http.server 5500` in this folder and open `http://localhost:5500`.

Do not open `index.html` through `file://`: browsers require HTTP for ES6 imports. Use the same hostname and port to keep accessing your saved data; `localhost`, `127.0.0.1`, and different ports have separate storage.

## Features

- Dashboard with totals, average GPA, all majors, statuses, and recent students.
- Student directory with name/ID/email search, combined filters, sorting, pagination, profiles, and CSV export.
- Add, edit, and delete students; validate required fields, email, unique student IDs, year, status, and GPA 0–4.
- Analytics with printable reports.
- Settings for the API connection, theme, and confirmed sample-data reset.
- Help page, responsive navigation, accessible dialogs, inline validation, and notifications.
- REST Countries lookup with a built-in country list when the service is unavailable.
- Optional student REST API with GET, POST, PUT, and DELETE.

## Project structure

```text
student-management-system/
├── index.html                   # Persistent semantic application shell
├── assets/icons/favicon.svg     # Local app icon
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
│   │   ├── sidebar.js          # Navigation state and connection indicator
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
| `campusflow_api_url` | Saved remote resource URL, empty for Demo Mode |
| `campusflow_theme` | `light` or `dark` |

An empty student array stays empty; samples are only created when no local collection exists. Damaged stored data is reported without being silently overwritten. **Reset Demo Data** explicitly replaces local students after confirmation and never changes remote records.

To use a MockAPI resource:

1. Create a `students` resource in your MockAPI project.
2. Add the fields below. MockAPI supplies the internal `id`.
3. Paste its full HTTPS resource URL into **Settings**. The URL must not contain credentials, query parameters, or fragments.
4. Use **Test Connection** to inspect it without changing the saved source. **Save API Endpoint** validates a successful GET before switching.
5. Use **Switch to Demo Mode** to return to the existing local collection.

| Field | Meaning |
| --- | --- |
| `id` | Unique internal identifier, used for PUT and DELETE |
| `studentId` | Human-readable student number, unique ignoring case |
| `name`, `email` | Student name and email |
| `major`, `country` | Major and country labels |
| `year` | `1` through `5` |
| `gpa` | Number from `0` through `4`, stored as text by the form |
| `status` | `Active`, `Inactive`, or `Graduated` |
| `createdAt` | ISO timestamp, preserved when editing |

The endpoint must allow browser CORS requests. GET returns an array of objects with unique internal IDs. POST returns the saved object including its ID. PUT returns the updated object or HTTP 204. DELETE may return JSON, an empty response, or HTTP 204. Student requests time out after 12 seconds; countries use 8 seconds and then fall back.

Switching sources does not transfer data. Client-side uniqueness checks use the loaded remote records; a real multi-user backend must enforce uniqueness too. This course project has no authentication or access control, so use fictional data and never embed API secrets.

## Testing

The application needs only a browser. Development checks optionally use Node.js 22.7 or newer, with no packages to install:

```sh
node --test tests/*.test.mjs
```

To also verify every deployed local module, stylesheet, and icon through Live Server, leave it running and use:

```sh
CAMPUSFLOW_URL=http://127.0.0.1:5500/ node --test tests/*.test.mjs
```

The HTTP asset check is skipped when `CAMPUSFLOW_URL` is absent. Remote API tests mock `fetch`; they never modify a real endpoint. The manual QA procedure and verification results are in [PROJECT_FEATURES.md](PROJECT_FEATURES.md).

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

At startup, the app requests `https://restcountries.com/v3.1/all?fields=name`, removes duplicate names, and sorts them. Add and Edit use the same country options. The selected country is preserved if the request finishes while a form is open. Network errors, invalid responses, and timeouts use the built-in fallback list, which includes Cambodia and neighboring countries. An existing student's country remains selectable even when it is absent from the fallback.

## Known limitations

- This is a browser-based course demonstration, without login, authorization, or a private student database. Use fictional records.
- Demo data belongs to one browser origin. Clearing browser storage removes it; CSV export provides a readable copy, but CSV import is not included.
- A real MockAPI endpoint has not been supplied for this project. GET/POST/PUT/DELETE are implemented and tested with mocked responses; live student API integration is not claimed. Configure and test a disposable resource in Settings before presenting remote CRUD.
- Remote uniqueness checks apply to the loaded dataset. Concurrent users need server-side validation, and external changes appear after reloading.
- REST Countries may reject browser requests or be unavailable. The fallback keeps forms usable; the browser can still log external network/CORS errors.
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
