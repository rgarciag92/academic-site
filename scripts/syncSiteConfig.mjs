// Fetches content from the Google Sheet described in sheet.config.json and
// regenerates src/siteConfig.js. Run with `npm run sync-config`.
//
// Set USE_LOCAL_SHEET_TEMPLATE=1 to read from sheet-template/*.csv instead of
// the network — useful for testing the generator without a live sheet.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Papa from 'papaparse';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TABS = ['General', 'Lists', 'Evaluation', 'Grading', 'Resources', 'Classes'];
const RICH_GENERAL_KEYS = new Set(['politics.ia']);

async function loadTab(name, spreadsheetId) {
  let csvText;
  if (process.env.USE_LOCAL_SHEET_TEMPLATE) {
    csvText = fs.readFileSync(path.join(ROOT, 'sheet-template', `${name}.csv`), 'utf8');
  } else {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch sheet tab "${name}" (HTTP ${res.status}). ` +
          `Check sheet.config.json's spreadsheetId and that the sheet is shared as "Anyone with the link: Viewer".`
      );
    }
    csvText = await res.text();
  }
  const parsed = Papa.parse(csvText.trim(), { header: true, skipEmptyLines: true });
  return parsed.data;
}

// One multi-line cell of "rich" content:
//   blank line       -> ends the current bullet list (just a visual break)
//   "- text"         -> bullet list item (consecutive ones group into one list)
//   ``` ... ```      -> a verbatim code block (own lines, not parsed for markup)
//   anything else    -> a standalone paragraph
function parseRichBlocks(text) {
  if (!text || !text.trim()) return undefined;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let currentList = null;
  let codeLines = null;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (codeLines !== null) {
      if (trimmed === '```') {
        blocks.push({ code: codeLines.join('\n') });
        codeLines = null;
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    if (trimmed === '') {
      currentList = null;
      continue;
    }
    if (trimmed === '```') {
      codeLines = [];
      continue;
    }
    if (trimmed.startsWith('- ')) {
      if (!currentList) {
        currentList = [];
        blocks.push({ list: currentList });
      }
      currentList.push(trimmed.slice(2).trim());
      continue;
    }

    currentList = null;
    blocks.push({ paragraph: trimmed });
  }

  return blocks;
}

function buildConfig(tabs) {
  const general = {};
  for (const row of tabs.General) {
    if (!row.Key) continue;
    const value = RICH_GENERAL_KEYS.has(row.Key) ? parseRichBlocks(row.Value) : (row.Value ?? '').trim();
    general[row.Key] = value;
  }
  const get = (key, fallback = '') => (general[key] !== undefined ? general[key] : fallback);

  const lists = {};
  for (const row of tabs.Lists) {
    if (!row.Key || !row.Text) continue;
    (lists[row.Key] ??= []).push(row.Text.trim());
  }

  const evaluation = {};
  for (const row of tabs.Evaluation) {
    if (!row.Percent) continue;
    evaluation[Number(row.Percent)] = row.Label.trim();
  }

  const grading = tabs.Grading.filter((r) => r.Label).map((r) => ({
    label: r.Label.trim(),
    percent: Number(r.Percent),
    color: r.Color.trim(),
  }));

  const resources = tabs.Resources.filter((r) => r.Label).map((r) => ({
    label: r.Label.trim(),
    href: r.Href.trim(),
    icon: r.Icon.trim(),
  }));

  const classes = tabs.Classes.filter((r) => r.id).map((r) => {
    const entry = {
      id: r.id.trim(),
      number: Number(r.number),
      title: r.title.trim(),
      date: r.date.trim(),
      objective: (r.objective ?? '').trim(),
      material: parseRichBlocks(r.material) ?? [],
      activity: parseRichBlocks(r.activity) ?? [],
    };
    const homework = parseRichBlocks(r.homework);
    if (homework) entry.homework = homework;
    return entry;
  });

  return {
    professor: {
      name: get('professor.name'),
      initials: get('professor.initials'),
      email: get('professor.email'),
    },
    course: {
      code: get('course.code'),
      title: get('course.title'),
      term: get('course.term'),
      landing: {
        description: get('landing.description'),
        dates: get('landing.dates'),
        horarios: get('landing.horarios'),
        ubicacion: get('landing.ubicacion'),
      },
      overview: {
        objectives: get('overview.objectives'),
        learning: lists['overview.learning'] ?? [],
        structure: lists['overview.structure'] ?? [],
        evaluation,
        project: {
          resume: get('overview.project.resume'),
          detail: get('overview.project.detail'),
          team: get('overview.project.team'),
        },
        help: lists['overview.help'] ?? [],
        software: get('overview.software'),
      },
      politics: {
        rules: get('politics.rules'),
        activities: lists['politics.activities'] ?? [],
        attendance: lists['politics.attendance'] ?? [],
        timing: lists['politics.timing'] ?? [],
        integrity: lists['politics.integrity'] ?? [],
        discipline: lists['politics.discipline'] ?? [],
        ia: get('politics.ia', []),
      },
      classes,
      grading,
      resources,
    },
  };
}

// JSON.stringify produces valid JS literal syntax for strings/numbers/arrays/
// plain objects, so it's a safe base — we only add indentation and drop quotes
// around identifier-safe object keys to keep the output readable.
function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${padIn}${serialize(v, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }

  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const entries = keys.map((k) => {
      const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padIn}${safeKey}: ${serialize(value[k], indent + 1)}`;
    });
    return `{\n${entries.join(',\n')}\n${pad}}`;
  }

  return JSON.stringify(value);
}

async function main() {
  const { spreadsheetId } = JSON.parse(fs.readFileSync(path.join(ROOT, 'sheet.config.json'), 'utf8'));
  if (!process.env.USE_LOCAL_SHEET_TEMPLATE && (!spreadsheetId || spreadsheetId.startsWith('YOUR_'))) {
    throw new Error('Set spreadsheetId in sheet.config.json first — see SHEET_SETUP.md.');
  }

  const tabs = {};
  for (const name of TABS) {
    tabs[name] = await loadTab(name, spreadsheetId);
  }

  const site = buildConfig(tabs);
  const output =
    `// AUTO-GENERATED by scripts/syncSiteConfig.mjs from the Google Sheet.\n` +
    `// Do not edit by hand — changes here are overwritten on the next sync.\n` +
    `// To update content: edit the Google Sheet, then run \`npm run sync-config\`\n` +
    `// (this also runs automatically before \`npm run build\`).\n` +
    `export const site = ${serialize(site)};\n`;

  fs.writeFileSync(path.join(ROOT, 'src', 'siteConfig.js'), output);
  console.log('src/siteConfig.js updated from the Google Sheet.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
