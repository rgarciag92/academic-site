# Course Site

A single-course homepage (React + Vite + Mantine): a sidebar-navigated
"faculty portal" where students can see the course schedule, assignments
and deadlines, grading policy, and materials, alongside the professor's
contact info and office hours.

## Setup

This project was scaffolded by hand (no internet access at generation
time), so dependencies aren't installed yet. From the project folder:

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Customize

**`src/siteConfig.js`** holds all the course content — but it's now
**auto-generated from a Google Sheet**, so a non-developer (e.g. the
professor) can update the site without touching code. See
[`SHEET_SETUP.md`](SHEET_SETUP.md) for how the sheet is laid out and how to
publish a change. `npm run sync-config` regenerates the file from the sheet
(it also runs automatically before `npm run build`); don't hand-edit
`siteConfig.js` directly, since the next sync will overwrite it.

**`src/theme.js`** — the accent color (currently Mantine blue) and font
(Inter throughout).

## Structure

```
src/
  main.jsx                    # mounts MantineProvider + App
  App.jsx                      # AppShell: header + sidebar + active section
  theme.js                      # Mantine theme (blue accent, Inter)
  siteConfig.js                  # all editable content
  index.css                       # minimal global reset
  components/
    Sidebar.jsx                    # nav: Overview / Schedule / Assignments / Grading / Resources
    CourseHeader.jsx                 # course title, term badge, professor contact card
    sections/
      Overview.jsx                    # course description
      Schedule.jsx                     # weekly topics list
      Assignments.jsx                   # assignments with due dates + status
      Grading.jsx                        # grading breakdown bar + legend
      Resources.jsx                       # materials & links list
```

Navigation is handled with local React state (no router) — clicking a
sidebar item swaps which section renders in the main pane. On mobile,
the sidebar collapses behind a burger menu in the header and closes
automatically after a selection. If you later want shareable URLs per
section (e.g. `/schedule`), swap the `useState` in `App.jsx` for
`react-router-dom`.

## Stack

- [Vite](https://vitejs.dev) — build tool / dev server
- [React 19](https://react.dev)
- [Mantine 9](https://mantine.dev) — AppShell, NavLink, Paper, Badge, etc.
- [Tabler Icons](https://tabler.io/icons) — icon set used throughout
