# CampusFlow — AUPP Student Management System

CampusFlow is a student-built Web Development II project for viewing and managing fictional student records. It keeps the AUPP-inspired orange sidebar, logo, and campus photograph while using React to render a simpler responsive dashboard.

> This is an academic demo, not an official AUPP service. The shared MockAPI endpoint is public and has no authentication. Anyone with its URL may read, add, edit, or delete records. Use fictional data only.

## Requirements

- Node.js 20.19+ (or Node.js 22.12+)
- npm

The migration was developed with Node.js 24.21.0 and npm 11.19.0.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`). Use `npm run build` for the production bundle and `npm run preview` to serve that bundle locally. Vercel can build this Vite project using `npm run build`; its output folder is `dist`.

## React structure

- `src/main.jsx` starts React and imports the stylesheets.
- `src/App.jsx` owns the selected page, loaded students, theme, loading and error states, and notifications.
- `src/components/` contains reusable navigation, header, forms, table, statistic card, charts, and confirmation dialog.
- `src/pages/` contains the dashboard, directory, analytics, settings, and help views.
- `src/api/` contains fetch-based HTTP, MockAPI, and CountriesNow requests.
- `src/services/` connects the UI to student operations and preserves the previous browser storage keys.
- `src/data/` keeps the 64 fictional demo students and the student field options.
- `src/utils/` contains validation, formatting, CSV export, and directory/statistics calculations.
- `src/styles/` contains the existing responsive AUPP-inspired styles, organized by purpose.
- `public/images/` and `public/icons/` hold the original project assets.

React function components receive data and event handlers through props. The app uses `useState` for changing UI data, `useEffect` for initial API/theme setup, and `useMemo` for directory filtering. Forms are controlled React inputs; the student API and browser storage remain outside the view components.

## Data modes and API

A first visit uses API Mode at:

`https://6af863ea9bdd097c326ed47b.mockapi.io/students`

The app loads shared records on startup. Add, edit, and delete use MockAPI `POST`, `PUT`, and `DELETE`; a successful save updates the React state. API failures stay visible and do not silently change to local data. Use **Settings → Switch to Demo Mode** to use local browser storage instead. Demo mode initializes 64 fictional students and keeps changes in this browser. Neither switching modes nor starting the app uploads demo records to MockAPI. **Reset Demo Data** only replaces the local demo collection; it does not affect remote records.

The previous localStorage names are retained so compatible browser settings and demo data survive the migration: `campusflow_students_v1`, `campusflow_api_url`, `campusflow_data_mode`, and `campusflow_theme`.

Countries are fetched from CountriesNow. If that public service is unavailable, the form displays the built-in country list and shows a notification.

## Features

- Student dashboard totals, average GPA, major bars, status chart, and recently added records
- Student profiles, validated add/edit forms, and delete confirmation
- Search, major/year/status filters, sorting, pagination, and CSV export
- Analytics by major, status, and year, with print support
- Light and charcoal dark themes, responsive navigation, and mobile layout
- API loading and error states, notifications, and offline country options

## Test and build

```bash
npm test
npm run build
```

The Node built-in test suite covers the data services, API request behavior with mocked responses, validation, filters, statistics, CSV formatting, country fallback, route parsing, and source structure. No test creates, edits, or deletes a record on the public database. Use **Settings → Test Connection** for a read-only check against the configured endpoint.

## From the original vanilla version

This branch replaces the original DOM-rendered vanilla JavaScript interface with Vite, React, and JSX. Existing project images, visual styles, API/data rules, localStorage keys, and demo data generator are retained. The vanilla implementation has been removed from the React branch so there is only one application entry point. The existing production site on `main` is unchanged; this migration is developed separately on `react-migration` for review.
