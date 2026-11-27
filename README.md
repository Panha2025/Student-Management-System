# CampusFlow — AUPP Student Management System

CampusFlow is an INFO 251 Web Development II project for managing fictional student records. It uses React, Vite, and an AUPP-inspired responsive design. The website opens directly to the dashboard; no sign-in setup is required.

**Repository:** [Panha2025/Student-Management-System](https://github.com/Panha2025/Student-Management-System)

**Preview:** [react-migration on Vercel](https://student-management-system-git-react-migration-vendora10.vercel.app/) (Vercel may require project access.)

**Contributors:** Attribution and development history are preserved in Git.

> This is an academic demo, not an official AUPP service. The shared MockAPI endpoint is public and has no authentication or authorization. Anyone with its URL may read or change shared records. Use fictional data only.

## Technologies

React, JavaScript/JSX, Vite, CSS, Fetch API, MockAPI, CountriesNow, browser localStorage, and Node's built-in test runner.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm. Developed with Node.js 24.21.0 and npm 11.19.0.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. A first visit uses the shared API. To work with local sample data, open **Settings → Switch to Demo Mode**.

Run `npm test` for automated checks, `npm run build` for a production bundle, or `npm run preview` to serve the bundle locally. Vercel uses `npm run build` and `dist` as its output directory.

## Project structure

- `src/main.jsx` starts React and imports the app styles.
- `src/App.jsx` owns hash-based page navigation, student data, loading/error states, theme, and notifications.
- `src/components/` contains reusable navigation, header, student table and form, charts, stat cards, and confirmation dialog.
- `src/pages/` contains dashboard, student directory, analytics, settings, and help views.
- `src/api/` contains Fetch API wrappers for MockAPI and CountriesNow.
- `src/services/` separates student operations, data settings, and localStorage.
- `src/data/` contains the 64 fictional demo students generator and student field options.
- `src/utils/` contains validation, formatting, directory queries, and CSV export.
- `src/styles/` contains the responsive AUPP-inspired light and charcoal dark themes.
- `public/images/` and `public/icons/` contain the project assets.

The app uses React function components, props, JSX lists, controlled form inputs, `useState`, `useEffect`, and `useMemo`. Student API and browser storage logic stay outside the view components. Simple hash navigation avoids an extra routing dependency.

## Features and data modes

- Dashboard totals, average GPA, major and status charts, and recently added students
- Student profiles, validated add/edit forms, delete confirmation, search, filters, sorting, pagination, and CSV export
- Analytics by major, status, and academic year, with print support
- Settings for shared API/local demo mode, theme, and local demo reset
- CountriesNow country options with a built-in fallback
- Responsive navigation, light/dark themes, loading/error states, and notifications

API Mode uses `https://6af863ea9bdd097c326ed47b.mockapi.io/students` for GET, POST, PUT, and DELETE. Errors stay visible; the app does not silently fall back to demo data. Demo Mode keeps 64 fictional students in browser localStorage. Switching modes never uploads demo records. Existing storage keys are retained: `campusflow_students_v1`, `campusflow_api_url`, `campusflow_data_mode`, and `campusflow_theme`.

## Student data safety

The public MockAPI resource has no login, authentication, or authorization rules. The website is open to all visitors, and the endpoint is also directly accessible to anyone who knows its URL. Never store real student data in this project. Protecting real records would require a trusted backend or a database with authenticated access rules. Existing remote records have not been reset or changed by this review.

## Tests

```bash
npm test
npm run build
```

The test suite covers React component output and navigation, student CRUD using mocked HTTP responses, Demo/API mode behavior, validation, filters, statistics, CSV formatting, CountriesNow fallback, and source imports. Tests do not mutate the live MockAPI database.
