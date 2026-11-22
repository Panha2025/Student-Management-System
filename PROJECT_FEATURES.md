# CampusFlow feature and architecture notes

CampusFlow is the React/Vite edition of the AUPP-inspired Student Management System. It is an INFO 251 coursework demo and uses fictional records.

## Sign-in and app access

- Firebase Authentication's Google provider handles real OAuth sign-in.
- An auth-state listener restores the signed-in user after refresh; browser local persistence is selected before opening the Google popup.
- The app shows a loading gate until Firebase resolves the current user. Guests see the login screen instead of the dashboard and cannot open app pages through hash navigation.
- The account menu displays the signed-in Google name, email, and profile photo when supplied. Sign-out returns the app to login.
- There are no administrator roles or authorization rules. Successful sign-in identifies a user but does not grant a special role.

Firebase values are loaded from Vite `VITE_FIREBASE_*` environment variables. `.env.example` documents the required client config. Never put Firebase Admin credentials or OAuth secrets in this frontend. Real OAuth requires a Firebase project, Google provider enabled, authorized hostnames, and environment values in local/Vercel settings.

## Student features

- **Dashboard:** total, active/inactive counts, mean GPA, major chart, status chart, and recently added records.
- **Directory:** profiles, validated add/edit, delete confirmation, search, major/year/status filters, sorting, pagination, and CSV export.
- **Analytics:** charts by major, status, and academic year; print support.
- **Settings:** API connection check, shared API/local demo switch, appearance, and local-only sample reset.
- **Countries:** CountriesNow options with an offline fallback list.

## Data mode and limits

- API Mode reads `https://6af863ea9bdd097c326ed47b.mockapi.io/students` and sends CRUD requests through `fetch()`.
- Demo Mode uses the preserved 64 fictional demo students in browser localStorage.
- No demo records are uploaded to the API. API errors do not silently fall back to demo mode.
- The public MockAPI resource has no auth or access rules. Authentication protects only CampusFlow's React interface; users can call the endpoint directly. Do not enter real student data. Proper data authorization requires a trusted server that verifies Firebase ID tokens or a database with authenticated access policies.
- Existing remote records are unchanged by the migration.

## React concepts

The app uses function components, JSX, props, controlled forms, event handlers, `useState`, `useEffect`, `useMemo`, and Firebase's auth-state listener. A small hash router is kept instead of adding a routing dependency. API and storage services are separate from rendered UI.
