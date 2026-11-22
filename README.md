# CampusFlow — AUPP Student Management System

CampusFlow is a student-built INFO 251 Web Development II project for viewing and managing fictional student records. It uses React, Vite, and Firebase Authentication with an AUPP-inspired responsive design.

> This is an academic demo, not an official AUPP service. Google sign-in gates the website interface, but the shared MockAPI endpoint is public and has no authentication or authorization. Anyone with its URL may read or change shared records. Use fictional data only.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm. Developed with Node.js 24.21.0 and npm 11.19.0.

```bash
npm install
cp .env.example .env.local
# Set the Firebase web app values in .env.local, then:
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. For a production bundle use `npm run build`; `npm run preview` serves the `dist/` build. Vercel uses `npm run build` and `dist` as the output directory.

If Firebase has not been configured, the app deliberately shows the login page with a setup message and disables Google sign-in. It never substitutes a fake login.

## Firebase Google sign-in setup

1. In [Firebase Console](https://console.firebase.google.com/), create or select the coursework Firebase project and register a **Web app**.
2. In **Authentication → Sign-in method**, enable **Google** and select a support email.
3. In **Authentication → Settings → Authorized domains**, ensure `localhost` is present. Add the exact Vercel preview hostname shown in Vercel for the `react-migration` branch, and add the production hostname only when production migration is approved.
4. Copy the Web app config values into `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
5. Restart `npm run dev`. For the branch preview, add the same variables in Vercel **Project Settings → Environment Variables**, selecting **Preview**. Redeploy the preview after saving them.
6. Test a real Google sign-in, refresh the page to confirm the session persists, and use the account menu to sign out.

These Firebase web-app values identify the public client configuration and are sent to the browser. They are not service-account credentials or private keys. Do not add a Firebase Admin SDK key, service-account JSON, OAuth client secret, or other server credential to this frontend. The `.env.local` file is ignored by Git; `.env.example` contains placeholders only.

Google sign-in proves the signed-in account identity. CampusFlow does not define administrator roles or grant role-based permissions. All signed-in users see the same app interface. The React route gate is not server-side access control.

## Authentication and student data security

There are three separate concerns:

- **Authentication:** Firebase verifies which Google account signed in. The app uses Firebase's auth-state listener and local browser persistence. Protected React content is withheld while Firebase checks the session.
- **Authorization:** this coursework version has no role or record-level authorization rules.
- **Data protection:** student records remain on the existing public MockAPI endpoint: `https://6af863ea9bdd097c326ed47b.mockapi.io/students`. The service does not validate Firebase tokens, so visitors can call it directly without signing into CampusFlow. Route protection does not make these records private.

Use fictional records only. Do not store real student data in this public resource. Protecting shared records requires a trusted backend that verifies Firebase ID tokens and applies authorization rules, or a database with authenticated access rules. That server-side layer is outside this frontend-only coursework implementation. Existing remote records have not been migrated, reset, or overwritten.

## Project structure

- `src/main.jsx` initializes React and the Firebase auth provider.
- `src/contexts/AuthContext.jsx` subscribes to auth state once and exposes sign-in/logout actions.
- `src/components/ProtectedRoute.jsx` holds the loading gate and returns the login page until a user is signed in.
- `src/pages/Login.jsx` is the responsive AUPP-branded Google sign-in screen.
- `src/components/UserMenu.jsx` displays the real Google profile and sign-out action.
- `src/services/firebase.js` reads the Vite client config and initializes Firebase only when all values exist.
- `src/services/authService.js` wraps Firebase Auth operations; its injectable functions make auth tests straightforward.
- `src/App.jsx`, `src/components/`, and `src/pages/` provide the authenticated student application.
- `src/api/` contains fetch-based MockAPI and CountriesNow requests.
- `src/services/studentService.js` keeps student operations separate from UI rendering.
- `src/data/` contains the 64 fictional demo records generator and student options.
- `src/utils/` contains validation, formatting, data queries, CSV export, and auth error messages.
- `src/styles/` contains the responsive light and charcoal dark themes.

React function components use props, JSX lists, controlled form inputs, `useState`, `useEffect`, and `useMemo`. The app keeps its simple hash navigation and does not add a routing or global-state library.

## Student features and data modes

The dashboard shows totals, status, GPA average, major chart, and recent students. The directory supports student profiles, CRUD forms, duplicate ID checks, search, filters, sorting, pagination, and CSV export. Analytics shows major, status, and year charts. Settings can switch between shared API and local Demo Mode, change theme, and reset local demo data. CountriesNow country names have a built-in fallback.

A first visit uses API Mode. API requests use GET, POST, PUT, and DELETE. Errors remain visible and do not silently switch data sources. Demo Mode stores its 64 fictional records in this browser only; mode changes never upload sample students. Existing storage names are preserved: `campusflow_students_v1`, `campusflow_api_url`, `campusflow_data_mode`, and `campusflow_theme`.

## Tests

```bash
npm test
npm run build
```

Tests cover student CRUD using mocked HTTP responses, validation, filters, stats, CSV, country fallback, React component output, route-gate loading/guest/signed-in states, Firebase service listener cleanup, persistence setup, mocked Google popup/logout, and auth error messages. Mock tests are not proof of a real Google OAuth login. The live public MockAPI should not be mutated by automated tests.
