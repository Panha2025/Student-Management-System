# CampusFlow feature and architecture notes

CampusFlow is the React/Vite edition of the AUPP-inspired Student Management System. It is an INFO 251 coursework demo with direct access and fictional records.

## Pages and features

- **Dashboard:** total, active/inactive counts, average GPA, major chart, status chart, recent students, and quick add action.
- **Student directory:** profiles, add/edit forms, delete confirmation, search, major/year/status filters, sorting, pagination, and CSV export.
- **Analytics:** charts by major, status, and academic year with print support.
- **Settings:** API connection test, API/Demo mode switch, theme, and local-only demo reset.
- **Help:** concise usage and public-data limitations.
- **Forms:** required values, email, GPA, academic year/status, and duplicate student ID validation.

## Data and APIs

- API Mode uses `https://6af863ea9bdd097c326ed47b.mockapi.io/students` for GET, POST, PUT, and DELETE.
- Demo Mode stores the preserved 64 fictional records in localStorage.
- No demo records are uploaded to MockAPI. Failed API requests stay visible; they do not silently switch data modes.
- CountriesNow supplies country options, with a built-in fallback.
- Existing remote records were not changed.

The MockAPI resource is public and unauthenticated. Anyone who knows the URL may read or modify records, independent of whether they use this website. Use fictional data only; real data would require a backend or data service with access rules.

## React concepts

The app uses function components, JSX, props, controlled forms, event handlers, `useState`, `useEffect`, and `useMemo`. Hash navigation is kept simple and all API/storage operations are separate from rendered UI. No authentication or sign-in configuration is required.
