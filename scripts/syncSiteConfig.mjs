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
// Each tab and the header columns it must have. The gviz endpoint silently returns the
// FIRST tab when the requested name doesn't exist, so the column check is what catches
// a missing or misnamed tab.
const TABS = {
  General: ['Key', 'Value'],
  Sidebar: ['page', 'label', 'icon'],
  Pages: ['page', 'content'],
  Classes: ['id', 'number', 'title', 'date'],
};

async function loadTab(name, requiredColumns, spreadsheetId) {
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
  const columns = parsed.meta.fields ?? [];
  const missing = requiredColumns.filter((c) => !columns.includes(c));
  if (missing.length) {
    throw new Error(
      `Sheet tab "${name}" is missing column(s): ${missing.join(', ')}. ` +
        `Make sure a tab named exactly "${name}" exists with those headers in row 1 (see SHEET_SETUP.md).`
    );
  }
  return parsed.data;
}

// URL-safe anchor id for a heading, e.g. "Evaluación del Curso" -> "evaluacion-del-curso".
function slugify(text) {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'seccion'
  );
}

// One multi-line cell of "rich" content, one block per line (Markdown-like):
//   "# text" / "## text" / "### text" -> title / subtitle / minor heading
//   "- text" or "* text"             -> bullet item (consecutive ones group into one list)
//   "1. text"                         -> numbered item (consecutive ones group into one list)
//   "| a | b |"                       -> table row (consecutive ones group into one table)
//   ``` ... ```                       -> a verbatim code block (own lines, not parsed for markup)
//   blank line                        -> ends the current list/table (just a visual break)
//   anything else                     -> a standalone paragraph
// usedIds is shared across a page's cards so heading anchors stay unique on that page.
function parseRichBlocks(text, usedIds = new Set()) {
  if (!text || !text.trim()) return undefined;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let current = null; // the list/table block consecutive lines are appended to
  let codeLines = null;

  const appendTo = (kind, value) => {
    if (!current || current.kind !== kind) {
      current = { kind, block: { [kind]: [] } };
      blocks.push(current.block);
    }
    current.block[kind].push(value);
  };

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
      current = null;
      continue;
    }
    if (trimmed === '```') {
      current = null;
      codeLines = [];
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      current = null;
      const base = slugify(heading[2].replace(/[*+`]/g, ''));
      let id = base;
      for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`;
      usedIds.add(id);
      blocks.push({ heading: heading[2].trim(), level: heading[1].length, id });
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      appendTo('list', bullet[1].trim());
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (numbered) {
      appendTo('orderedList', numbered[1].trim());
      continue;
    }

    if (trimmed.startsWith('|')) {
      const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
      appendTo('table', cells);
      continue;
    }

    current = null;
    blocks.push({ paragraph: trimmed });
  }

  if (codeLines !== null) blocks.push({ code: codeLines.join('\n') });

  return blocks;
}

function buildConfig(tabs) {
  const general = {};
  for (const row of tabs.General) {
    if (!row.Key) continue;
    general[row.Key] = (row.Value ?? '').trim();
  }
  const get = (key, fallback = '') => (general[key] !== undefined ? general[key] : fallback);

  // Each Pages row is one card; rows with the same `page` stack in sheet order.
  const pages = {};
  const pageIds = {};
  for (const row of tabs.Pages) {
    const page = (row.page ?? '').trim();
    if (!page) continue;
    const blocks = parseRichBlocks(row.content, (pageIds[page] ??= new Set()));
    if (blocks) (pages[page] ??= []).push(blocks);
  }

  // Sidebar rows, in sheet order. `page` doubles as the URL path, so it must be URL-safe.
  // `clases` is the built-in class list; every other page needs at least one Pages row.
  const sidebar = [];
  for (const row of tabs.Sidebar) {
    const page = (row.page ?? '').trim();
    if (!page) continue;
    if (!/^[a-z0-9-]+$/.test(page)) {
      throw new Error(
        `Sidebar page "${page}" must use only lowercase letters, numbers and "-" (it becomes the page URL).`
      );
    }
    if (page !== 'clases' && !pages[page]) {
      console.warn(`Warning: Sidebar page "${page}" has no rows in the Pages tab, so it will be empty.`);
    }
    sidebar.push({ page, label: (row.label ?? '').trim() || page, icon: (row.icon ?? '').trim().toLowerCase() });
  }
  if (sidebar.length === 0) throw new Error('The Sidebar tab has no rows — add at least one page.');

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
      sidebar,
      pages,
      classes,
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
  for (const [name, requiredColumns] of Object.entries(TABS)) {
    tabs[name] = await loadTab(name, requiredColumns, spreadsheetId);
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
