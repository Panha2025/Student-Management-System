# CampusFlow feature and architecture notes

CampusFlow is the React/Vite edition of the AUPP-inspired Student Management System. It is a university demo and must use fictional student records.

## Pages and features

- **Dashboard:** total, active and inactive counts; mean GPA; students by major; status chart; recently added students; quick link to add a record.
- **All Students:** student profile view, edit/delete actions, search, major/year/status filters, sorting, pagination, CSV export, and empty state.
- **Add/Edit Student:** controlled form fields, required-field/email/GPA/year/status validation, unique student ID validation, country list with fallback, and save feedback.
- **Analytics:** live summary cards, major/year/status charts, and print report.
- **Settings:** API connection check, switch between shared API and local demo records, theme toggle, and local-only demo reset.
- **Help:** short usage overview and shared database limitations.

## Data behavior

- API Mode is the first-visit default and reads `https://6af863ea9bdd097c326ed47b.mockapi.io/students`.
- API operations use `fetch()` and `async/await`; remote records are never seeded, reset, or automatically replaced by local records.
- Demo Mode stores data under the compatible `campusflow_students_v1` localStorage key. Its generator produces 64 fictional demo students.
- API mode and demo mode remain separate. An API failure is shown to the user and does not change modes.
- CountriesNow provides country options. A built-in list remains available when the service cannot be reached.

## React learning concepts

The app uses function components, props, JSX lists with stable keys, controlled form values, conditional rendering, `useState`, `useEffect`, `useMemo`, event callbacks, and fetch-based asynchronous services. There is no router or state-management package; simple hash navigation is kept in `src/router.js`.

## Security and scope

The MockAPI endpoint is public and unauthenticated. Any person who knows the URL may read or modify shared records. Never use real student information or private credentials. This project is not an official AUPP service and has no authentication or authorization layer.
