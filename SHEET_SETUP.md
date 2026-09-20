# Editing the site from a Google Sheet

The site's content (`src/siteConfig.js`) is auto-generated from a Google
Sheet. Edit the sheet, rebuild, and the site updates — no code, no backend,
no database.

## One-time setup (you, the developer)

1. **Create the sheet.** Make a new Google Sheet, then create 6 tabs named
   exactly: `General`, `Lists`, `Evaluation`, `Grading`, `Resources`,
   `Classes`.

2. **Seed it with the current content.** For each tab: `File > Import >
   Upload`, choose the matching file from [`sheet-template/`](sheet-template),
   and import as **"Replace current sheet"** (make sure the target tab is
   selected first) or **"Insert new sheet(s)"** then rename it to match.

3. **Share it for reading.** `Share` (top right) → under "General access"
   choose **"Anyone with the link"** → role **Viewer**. The build script reads
   the sheet anonymously over HTTPS; nothing needs to be publishable or public
   beyond "anyone with the link can view."

4. **Point the project at it.** Copy the spreadsheet ID from the sheet's URL
   (`https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`) into
   [`sheet.config.json`](sheet.config.json):
   ```json
   { "spreadsheetId": "THIS_PART" }
   ```

5. **Test it locally:**
   ```bash
   npm run sync-config   # fetches the sheet, rewrites src/siteConfig.js
   npm run dev           # check it in the browser
   ```

6. **Deploy to GitHub Pages** (once, per repo):
   - Push this project to a GitHub repo.
   - Repo `Settings > Pages > Source` → **GitHub Actions**.
   - If the repo is a project page (not `<user>.github.io`), set `base:
     '/<repo-name>/'` in `vite.config.js` (see the comment there).
   - The included workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml))
     builds and deploys automatically on every push to `main`, and can also
     be run on demand — see below.

## Day-to-day (the non-developer editing content)

1. Open the Google Sheet, edit any cell, save (Sheets autosaves).
2. Go to the GitHub repo → **Actions** tab → **"Update site"** workflow →
   **Run workflow** → **Run workflow** (green button).
3. Wait ~1 minute. The live site now reflects the sheet.

No local setup, no command line, no pull requests needed for content changes.

## Sheet reference

### `General` — one row per single-value field

| Key | Value |
|---|---|
| `professor.name` | Miryam Elizabeth |
| `professor.initials` | ME |
| `professor.email` | ... |
| `course.code` | ... |
| `course.title` | ... |
| `course.term` | ... |
| `landing.description` | ... |
| `landing.dates` | ... |
| `landing.horarios` | ... |
| `landing.ubicacion` | ... |
| `overview.objectives` | ... |
| `overview.software` | ... |
| `overview.project.resume` | ... |
| `overview.project.detail` | ... |
| `overview.project.team` | ... |
| `politics.rules` | ... |
| `politics.ia` | *(rich content — see below)* |

Don't rename or remove the `Key` values — the build script looks them up by
name. Text in any `Value`/`Text` cell can use `**bold**`, `++underline++`,
`*italic*`, `` `code` ``, and `[link text](https://...)`, same as before.

### `Lists` — one row per bullet point

For fields that are just a bulleted list (`overview.learning`,
`overview.structure`, `overview.help`, `politics.activities`,
`politics.attendance`, `politics.timing`, `politics.integrity`,
`politics.discipline`): add a row with the field's `Key` and the bullet's
`Text`. To add a bullet, insert a new row with the same `Key`. To remove one,
delete its row. Order follows row order.

### `Evaluation`, `Grading`, `Resources` — small tables

Add/remove/edit rows directly; columns match the fields they represent
(`Percent`/`Label`, `Label`/`Percent`/`Color`, `Label`/`Href`/`Icon`). `Color`
values are Mantine color strings like `blue.6` or `gray.4`.

### `Classes` — one row per session

> **Watch out for the `date` column (and any other text that looks like a
> date or number).** Google Sheets auto-detects text like `Viernes 1 de
> Agosto, 2026` as an actual date and silently rewrites it — including
> recalculating the weekday name, which may not match what you typed. Before
> typing into the `date` column, select it and set **Format > Number > Plain
> text** so Sheets leaves your text alone.

Columns: `id`, `number`, `title`, `date`, `objective`, `material`,
`activity`, `homework`.

- `id` should be short and URL-safe (e.g. `tema-3`) — it's used in the page
  link `/clases/tema-3`.
- `material`, `activity`, `homework` (and `politics.ia` in `General`) accept
  **rich content** in a single cell, using these line rules:
  - A plain line becomes a standalone paragraph.
  - A line starting with `- ` becomes a bullet; consecutive `- ` lines group
    into one bulleted list.
  - A blank line just ends the current bullet list (visual break only).
  - A line with exactly three backticks (```` ``` ````) starts or ends a
    verbatim code block (for things like assignment header templates) —
    text inside isn't reformatted.
  - Leave `homework` blank if a class has no homework yet.

  Example cell content:
  ```
  Aquí puedes descargar las presentaciones ⬇️
  - [Enlace 1](https://...)
  - [Enlace 2](https://...)
  ```

## Re-running manually / troubleshooting

- `npm run sync-config` re-fetches and rewrites `src/siteConfig.js` any time;
  it also runs automatically before `npm run build`.
- `src/siteConfig.js` is now generated — don't hand-edit it, your changes
  will be overwritten on the next sync. Edit the sheet instead.
- If the sync fails with an HTTP error, double-check `sheet.config.json`'s
  `spreadsheetId` and that the sheet's sharing is "Anyone with the link:
  Viewer".
