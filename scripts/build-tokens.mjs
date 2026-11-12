#!/usr/bin/env node
/**
 * Build Runion foundation tokens from the Figma export.
 *
 *   input   figma/foundations.raw.json   (output of figma/export-foundations.js, run in Figma)
 *   output  tokens/tokens.json           resolved token data (for JS/TS, docs, tooling)
 *           tokens/tokens.css            CSS custom properties + light/dark themes + text classes
 *           preview/index.html           visual check of every foundation
 *
 * Policy: MIRROR FIGMA AS-IS. Names and values are never corrected here.
 * Anything that looks wrong is reported (console + tokens.json "issues" + preview),
 * so the fix happens in Figma and flows back on the next export.
 *
 * The only translations are the ones CSS requires:
 *   - numbers become px
 *   - font-weight words become numbers (regular 400, semibold 600, bold 700)
 *   - font families get a system fallback stack
 *   - alias-with-opacity becomes color-mix()
 *
 * Usage:  node scripts/build-tokens.mjs [--check]
 *   --check  exit with code 1 if any "error" issue is found (for CI); still writes output.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW_PATH = path.join(ROOT, 'figma/foundations.raw.json');
const OUT_TOKENS = path.join(ROOT, 'tokens');
const OUT_PREVIEW = path.join(ROOT, 'preview');
const CHECK = process.argv.includes('--check');

let raw;
try {
  raw = JSON.parse(await readFile(RAW_PATH, 'utf8'));
} catch (err) {
  console.error(`Could not read ${path.relative(ROOT, RAW_PATH)}: ${err.message}`);
  process.exit(2);
}
for (const key of ['source', 'collections', 'textStyles', 'effectStyles']) {
  if (!(key in raw)) { console.error(`Raw export is missing "${key}". Re-run figma/export-foundations.js.`); process.exit(2); }
}

/* ------------------------------------------------------------------ helpers */

/** Figma variable path -> CSS custom property name. "sizes/radius/rd-16" -> "--sizes-radius-rd-16" */
const cssName = name => '--' + name.trim().toLowerCase()
  .replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/-$/, '');

const TYPE = { C: 'color', F: 'number', S: 'string', B: 'boolean' };
const WEIGHT_WORDS = { thin: 100, extralight: 200, light: 300, regular: 400, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };
const STYLE_WEIGHT = { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Black: 900 };
const FALLBACK_STACK = 'system-ui, sans-serif';

const isFamily = name => /font[- ]?family/i.test(name);
const isWeight = name => /font[- ]?weight/i.test(name);
const isAliasRef = val => typeof val === 'string' && val.startsWith('@');
const isAliasOpacity = val => val !== null && typeof val === 'object' && 'alias' in val;
const lastSeg = name => name.split('/').pop();

function weightNumber(val, where) {
  if (/^\d+$/.test(String(val))) return Number(val);
  const n = WEIGHT_WORDS[String(val).toLowerCase().replace(/[\s_-]/g, '')];
  if (n === undefined) throw new Error(`Unknown font weight "${val}" in ${where}`);
  return n;
}
function withAlpha(hex, pct) {
  const base = hex.slice(0, 7);
  const a0 = hex.length === 9 ? parseInt(hex.slice(7), 16) / 255 : 1;
  return base + Math.round(a0 * (pct / 100) * 255).toString(16).padStart(2, '0');
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* -------------------------------------------------------- index variables */

const vars = new Map();
const cssNames = new Map();
const skipped = [];
for (const [collection, col] of Object.entries(raw.collections)) {
  for (const row of col.rows) {
    const [name, t, ...values] = row;
    if (values.length !== col.modes.length) throw new Error(`${collection}/${name}: expected ${col.modes.length} values, got ${values.length}`);
    const type = TYPE[t];
    if (!type) throw new Error(`${collection}/${name}: unknown type letter "${t}"`);
    // Strings that are not font family/weight are not design tokens (e.g. placeholder text).
    if (type === 'string' && !isFamily(name) && !isWeight(name)) { skipped.push({ collection, name, value: values[0] }); continue; }
    if (vars.has(name)) throw new Error(`Variable "${name}" exists in more than one collection`);
    const css = cssName(name);
    if (cssNames.has(css)) throw new Error(`"${name}" and "${cssNames.get(css)}" both map to ${css}`);
    cssNames.set(css, name);
    vars.set(name, { name, collection, type, css, modes: Object.fromEntries(col.modes.map((m, i) => [m, values[i]])) });
  }
}
function ref(name, from) {
  const v = vars.get(name);
  if (!v) throw new Error(`${from} references "${name}", which is not in the export (library variable or skipped token?)`);
  return v;
}

/** Resolve a variable to its final value in a given mode (falls back to the target collection's first mode). */
function resolve(v, mode, seen = new Set()) {
  if (seen.has(v.name)) throw new Error(`Alias cycle: ${[...seen, v.name].join(' -> ')}`);
  seen.add(v.name);
  const modes = raw.collections[v.collection].modes;
  const val = v.modes[modes.includes(mode) ? mode : modes[0]];
  if (isAliasRef(val)) return resolve(ref(val.slice(1), v.name), mode, seen);
  if (isAliasOpacity(val)) return withAlpha(resolve(ref(val.alias, v.name), mode, seen), val.opacity);
  if (v.type === 'string' && isWeight(v.name)) return weightNumber(val, v.name);
  return val;
}

/** A variable's value in one mode, as CSS. Aliases stay as var() so the chain is visible in devtools. */
function cssValue(v, val) {
  if (isAliasRef(val)) return `var(${ref(val.slice(1), v.name).css})`;
  if (isAliasOpacity(val)) return `color-mix(in srgb, var(${ref(val.alias, v.name).css}) ${val.opacity}%, transparent)`;
  switch (v.type) {
    case 'color': return val;
    case 'number': return val === 0 ? '0' : `${val}px`;
    case 'string':
      if (isFamily(v.name)) return `"${val}", ${FALLBACK_STACK}`;
      return String(weightNumber(val, v.name));
    default: return String(val);
  }
}

/* ------------------------------------------------------------- text styles */

const textStyles = raw.textStyles.map(ts => {
  const weight = STYLE_WEIGHT[ts.style.replace(/\s/g, '')];
  if (weight === undefined) throw new Error(`Text style "${ts.name}": unknown font style "${ts.style}"`);
  const b = ts.bound || {};
  const pick = (boundName, literal) => boundName ? `var(${ref(boundName, ts.name).css})` : literal;
  const lh = ts.lineHeight === 'auto' ? 'normal' : ts.lineHeight.endsWith('%') ? String(parseFloat(ts.lineHeight) / 100) : ts.lineHeight;
  const ls = ts.letterSpacing.endsWith('%') ? `${parseFloat(ts.letterSpacing) / 100}em` : (parseFloat(ts.letterSpacing) === 0 ? '0' : ts.letterSpacing);
  const decl = {
    'font-family': pick(b.family, `"${ts.family}", ${FALLBACK_STACK}`),
    'font-size': pick(b.size, `${ts.size}px`),
    'line-height': pick(b.lineHeight, lh),
    // Figma links weight through fontStyle ("regular"/"semibold"/"bold"); both map to a numeric CSS weight token.
    'font-weight': (b.weight || b.fontStyle) ? `var(${ref(b.weight || b.fontStyle, ts.name).css})` : String(weight),
    'letter-spacing': ls,
  };
  const tc = { UPPER: 'uppercase', LOWER: 'lowercase', TITLE: 'capitalize' }[ts.textCase];
  if (tc) decl['text-transform'] = tc;
  const td = { UNDERLINE: 'underline', STRIKETHROUGH: 'line-through' }[ts.textDecoration];
  if (td) decl['text-decoration'] = td;
  return { ...ts, weight, className: 'text-' + cssName(ts.name).slice(2), decl };
});

/* ----------------------------------------------------------------- effects */

const effects = raw.effectStyles.map(es => {
  const blurs = es.effects.filter(e => e.type === 'BACKGROUND_BLUR' || e.type === 'LAYER_BLUR');
  const shadows = es.effects.filter(e => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW');
  let kind, value, mask = null;
  if (shadows.length && !blurs.length) {
    kind = 'shadow';
    value = shadows.map(e => `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${e.x}px ${e.y}px ${e.radius}px ${e.spread || 0}px ${e.color}`).join(', ');
  } else if (blurs.length === 1 && !shadows.length) {
    const e = blurs[0];
    kind = e.type === 'BACKGROUND_BLUR' ? 'backdrop-blur' : 'blur';
    value = `${e.radius}px`;
    if (e.blurType === 'PROGRESSIVE') mask = progressiveMask(e, es.name);
  } else {
    throw new Error(`Effect style "${es.name}" mixes effect types; extend build-tokens.mjs to support it`);
  }
  return { name: es.name, css: cssName(es.name), cls: 'effect-' + cssName(es.name).slice(2), kind, value, mask, effects: es.effects };
});

/**
 * CSS has no progressive blur. Approximation: blur at full radius, faded in with a gradient mask
 * running from startOffset to endOffset (0–1 fractions of the box). startRadius > 0 becomes the
 * mask's starting opacity. Visually close, not identical to Figma.
 */
function progressiveMask(e, name) {
  const s = e.startOffset || { x: 0.5, y: 0 }, t = e.endOffset || { x: 0.5, y: 1 };
  const dx = t.x - s.x, dy = t.y - s.y;
  if (!dx && !dy) throw new Error(`Effect style "${name}": progressive blur has identical start and end offsets`);
  const angle = Math.round(((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360); // CSS: 0deg = to top
  // Stop positions along the gradient line (0% = where the gradient starts). Diagonals use the full box.
  const along = dx === 0 ? (v => (dy > 0 ? v.y : 1 - v.y)) : dy === 0 ? (v => (dx > 0 ? v.x : 1 - v.x)) : null;
  const [p0, p1] = along ? [along(s), along(t)] : [0, 1];
  const a = e.radius ? Math.min(1, (e.startRadius || 0) / e.radius) : 0;
  const pct = v => `${Math.round(v * 100)}%`;
  return `linear-gradient(${angle}deg, rgb(0 0 0 / ${a}) ${pct(p0)}, #000 ${pct(p1)})`;
}

/* ------------------------------------------------------------------ issues */

const issues = [];
const issue = (severity, title, detail, items) => issues.push({ severity, title, detail, items });

// 1. Size tokens whose name promises a number the value doesn't deliver (rd-16 = 18px).
{
  const bad = [];
  for (const v of vars.values()) {
    if (v.type !== 'number') continue;
    const m = lastSeg(v.name).match(/^(?:[a-z]{2}-)?(\d+)$/);
    if (!m) continue;
    for (const mode of raw.collections[v.collection].modes) {
      const r = resolve(v, mode);
      if (r !== Number(m[1])) { bad.push(`${v.name} = ${r}px`); break; }
    }
  }
  if (bad.length) issue('error', 'Size name does not match its value', 'The number in the token name differs from the value it resolves to.', bad);
}
// 2. Numbered colour aliases pointing at a different step (color/200 -> neutral/300).
{
  const bad = [];
  for (const v of vars.values()) {
    if (v.type !== 'color' || !/^\d+$/.test(lastSeg(v.name))) continue;
    for (const val of Object.values(v.modes)) {
      if (isAliasRef(val) && /^\d+$/.test(lastSeg(val)) && lastSeg(val) !== lastSeg(v.name)) { bad.push(`${v.name} → ${val.slice(1)}`); break; }
    }
  }
  if (bad.length) issue('error', 'Numbered colour points to a different step', 'A numbered alias references a palette step with another number.', bad);
}
// 3. Duplicate values inside one palette scale (neutral/500 = neutral/600).
{
  const bad = [];
  const groups = {};
  for (const v of vars.values()) {
    if (v.type !== 'color' || isAliasRef(v.modes[Object.keys(v.modes)[0]])) continue;
    const g = v.name.split('/').slice(0, -1).join('/');
    (groups[g] ||= []).push(v);
  }
  for (const list of Object.values(groups)) {
    const byVal = {};
    for (const v of list) (byVal[resolve(v, Object.keys(v.modes)[0])] ||= []).push(v.name);
    for (const [hex, names] of Object.entries(byVal)) if (names.length > 1) bad.push(`${names.join(' = ')} (${hex})`);
  }
  if (bad.length) issue('error', 'Duplicate colour in a palette scale', 'Two steps of the same scale have the same value, so the scale skips a step.', bad);
}
// 4. Text style names whose size prefix doesn't match the font size (body-xxs/* at 12px).
{
  const SIZE_OF = Object.fromEntries([...vars.values()]
    .filter(v => v.name.startsWith('font-size/'))
    .map(v => [v.name.replace(/^font-size\/(heading\/)?/, '').replace('/', '-').replace(/^body\//, ''), resolve(v, 'Mode 1')]));
  const bad = [];
  for (const ts of textStyles) {
    const key = ts.name.split('/')[0];
    const expected = SIZE_OF[key] ?? SIZE_OF[key.replace(/^body-/, '')];
    if (expected !== undefined && expected !== ts.size) bad.push(`${ts.name} is ${ts.size}px (name implies ${expected}px)`);
  }
  if (bad.length) issue('error', 'Text style name does not match its size', 'The size in the style name differs from its font size.', bad);
}
// 5. Font tokens defined in more than one collection.
//    (Weights written as words are fine: Figma links them to text styles as font-style names.)
{
  // Only raw values count as a definition; a variable that aliases another one is a reference, not a duplicate.
  const isRaw = v => Object.values(v.modes).some(x => !isAliasRef(x) && !isAliasOpacity(x));
  const famCols = new Set([...vars.values()].filter(v => isFamily(v.name) && isRaw(v)).map(v => v.collection));
  const wtCols = new Set([...vars.values()].filter(v => isWeight(v.name) && isRaw(v)).map(v => v.collection));
  const dup = [];
  if (famCols.size > 1) dup.push(`font family in: ${[...famCols].join(', ')}`);
  if (wtCols.size > 1) dup.push(`font weight in: ${[...wtCols].join(', ')}`);
  if (dup.length) issue('warn', 'Typography defined twice', 'The same font tokens exist in more than one collection. Text styles use the "typography" collection.', dup);
}
// 6. Effect styles with identical values.
{
  const byVal = {};
  for (const e of effects) (byVal[JSON.stringify(e.effects)] ||= []).push(e.name);
  const dup = Object.values(byVal).filter(n => n.length > 1).map(n => n.join(' = '));
  if (dup.length) issue('warn', 'Identical effect styles', 'Different effect names with the same values. CSS cannot do a progressive blur natively, so these render the same in code.', dup);
}
// 7. Shadows: intentionally not checked. Runion has no shadow styles yet by design decision (2026-11-12),
//    so a missing shadow is not a defect. Shadow effect styles are still exported if they are added later.
// 8. Non-token strings skipped.
if (skipped.length) issue('info', 'Skipped non-token variables', 'String variables that are not font family/weight are not exported to CSS.', skipped.map(s => `${s.collection}/${s.name} = "${s.value}"`));

/* -------------------------------------------------------------- tokens.json */

const refOut = val => isAliasRef(val) ? `{${val.slice(1)}}` : isAliasOpacity(val) ? { ref: `{${val.alias}}`, opacity: val.opacity } : val;
const tokensJson = {
  $description: 'Runion foundation tokens. GENERATED by scripts/build-tokens.mjs from figma/foundations.raw.json — do not edit by hand.',
  $source: raw.source,
  collections: Object.fromEntries(Object.entries(raw.collections).map(([c, col]) => [c, {
    modes: col.modes,
    tokens: Object.fromEntries([...vars.values()].filter(v => v.collection === c).map(v => [v.name, {
      type: v.type,
      css: v.css,
      value: Object.fromEntries(Object.entries(v.modes).map(([m, x]) => [m, refOut(x)])),
      resolved: Object.fromEntries(col.modes.map(m => [m, resolve(v, m)])),
    }])),
  }])),
  textStyles: Object.fromEntries(textStyles.map(ts => [ts.name, {
    className: ts.className,
    fontFamily: ts.family, fontWeight: ts.weight, fontSize: ts.size, lineHeight: ts.lineHeight,
    letterSpacing: ts.letterSpacing, paragraphSpacing: ts.paragraphSpacing, bound: ts.bound, css: ts.decl,
  }])),
  effects: Object.fromEntries(effects.map(e => [e.name, { css: e.css, className: e.cls, kind: e.kind, value: e.value, ...(e.mask ? { mask: e.mask } : {}) }])),
  issues,
};

/* --------------------------------------------------------------- tokens.css */

const singleMode = [...vars.values()].filter(v => raw.collections[v.collection].modes.length === 1);
const themed = [...vars.values()].filter(v => raw.collections[v.collection].modes.length > 1);
const themeCols = Object.entries(raw.collections).filter(([, c]) => c.modes.length > 1);
if (themeCols.length > 1) throw new Error('More than one multi-mode collection; theme mapping needs updating');
const [themeColName, themeCol] = themeCols[0] || [null, { modes: [] }];
const lightMode = themeCol.modes.find(m => /light/i.test(m)) || themeCol.modes[0];
const darkMode = themeCol.modes.find(m => /dark/i.test(m));

const block = (list, mode, indent = '  ') => list.map(v => `${indent}${v.css}: ${cssValue(v, v.modes[mode] ?? v.modes[Object.keys(v.modes)[0]])};`).join('\n');
const groupedBlock = (list, mode, indent) => {
  let out = '', cur = null;
  for (const v of list) {
    if (v.collection !== cur) { cur = v.collection; out += `${out ? '\n' : ''}${indent}/* ${cur} */\n`; }
    out += `${indent}${v.css}: ${cssValue(v, v.modes[mode] ?? v.modes[Object.keys(v.modes)[0]])};\n`;
  }
  return out.trimEnd();
};

const css = `/*
 * Runion foundation tokens — GENERATED, do not edit by hand.
 * Source: Figma "${raw.source.file}" (exported ${raw.source.exportedAt})
 * Rebuild: npm run tokens
 *
 * Themes: follows the OS setting by default. Force one with data-theme="light" | "dark"
 * on <html> or on any container (themes can be nested).
 * Mirrors Figma as-is — see tokens.json "issues" for known inconsistencies.
 */

:root {
${groupedBlock(singleMode, 'Mode 1', '  ')}

  /* effects */
${effects.map(e => `  ${e.css}: ${e.value};${e.mask ? `\n  ${e.css}-mask: ${e.mask};` : ''}`).join('\n')}
}

/* ${themeColName}: ${lightMode} (default) */
:root,
[data-theme="light"] {
  color-scheme: light;
${block(themed, lightMode)}
}
${darkMode ? `
/* ${themeColName}: ${darkMode} — from OS preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${block(themed, darkMode, '    ')}
  }
}

/* ${themeColName}: ${darkMode} — forced */
[data-theme="dark"] {
  color-scheme: dark;
${block(themed, darkMode)}
}
` : ''}
/* Text styles (one class per Figma text style) */
${textStyles.map(ts => `.${ts.className} {\n${Object.entries(ts.decl).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`).join('\n')}

/*
 * Effect styles (one class per Figma effect style).
 * Progressive blurs use a mask, which also fades the element's own content:
 * put the class on a background layer behind the content, not on the content itself.
 */
${effects.map(e => {
  const d = e.kind === 'shadow' ? [`box-shadow: var(${e.css})`]
    : e.kind === 'blur' ? [`filter: blur(var(${e.css}))`]
    : [`-webkit-backdrop-filter: blur(var(${e.css}))`, `backdrop-filter: blur(var(${e.css}))`];
  if (e.mask) d.push(`-webkit-mask-image: var(${e.css}-mask)`, `mask-image: var(${e.css}-mask)`);
  return `.${e.cls} {\n${d.map(x => `  ${x};`).join('\n')}\n}`;
}).join('\n')}
`;

/* ------------------------------------------------------------ preview page */

const paletteGroups = {};
for (const v of vars.values()) {
  if (v.type === 'color' && v.collection !== themeColName) (paletteGroups[v.name.split('/').slice(0, -1).join('/')] ||= []).push(v);
}
const semanticGroups = {};
for (const v of themed.filter(t => t.type === 'color')) {
  const parts = v.name.split('/');
  const g = parts.length > 2 ? parts[1] : 'plain';
  (semanticGroups[g] ||= []).push(v);
}
const fmtRef = val => isAliasRef(val) ? val.slice(1) : isAliasOpacity(val) ? `${val.alias} @ ${val.opacity}%` : val;
const toNum = v => resolve(v, lightMode);
const spacing = themed.filter(v => v.name.startsWith('sizes/spacing/')).sort((a, b) => toNum(a) - toNum(b));
const radius = themed.filter(v => v.name.startsWith('sizes/radius/')).sort((a, b) => toNum(a) - toNum(b));
const borders = themed.filter(v => v.name.startsWith('sizes/border/'));
// Mark tokens named on the left side of an error item (before "→") so the preview can flag them.
const knownNames = new Set([...vars.keys(), ...textStyles.map(t => t.name)]);
const flagged = new Set(issues.filter(i => i.severity === 'error')
  .flatMap(i => i.items.flatMap(s => s.split('→')[0].split(/\s+/).filter(w => knownNames.has(w)))));
const flag = name => flagged.has(name) ? ' <span class="flag" title="See issues">!</span>' : '';

const semanticPanel = (mode, theme) => `
  <div class="panel" data-theme="${theme}">
    <h3 class="text-body-md-semi-bold">${esc(mode)}</h3>
    ${Object.entries(semanticGroups).map(([g, list]) => `
    <div class="sem-group">
      <p class="eyebrow">${esc(g)}</p>
      ${list.map(v => `
      <div class="sem-row">
        <span class="chip check"><span style="background:var(${v.css})"></span></span>
        <span class="sem-name">${esc(v.name)}${flag(v.name)}</span>
        <span class="sem-val mono">${esc(fmtRef(v.modes[mode]))}<br><b>${esc(resolve(v, mode))}</b></span>
      </div>`).join('')}
    </div>`).join('')}
  </div>`;

const preview = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Runion Foundations</title>
<meta name="description" content="Generated preview of Runion design tokens: colour, typography, spacing, radius, borders and effects.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>
  /* Preview chrome only — built from the tokens themselves */
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--color-background-primary-default, #fff); color: var(--color-foreground-primary-default, #0f172a);
         font-family: var(--font-family-primary, system-ui, sans-serif); font-size: 16px; line-height: 1.5; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 16px 80px; }
  header { position: sticky; top: 0; z-index: 5; background: var(--color-background-primary-translucent);
           backdrop-filter: blur(var(--blur-glass-uniform-lg, 16px)); -webkit-backdrop-filter: blur(var(--blur-glass-uniform-lg, 16px));
           border-bottom: 1px solid var(--color-background-primary-hover); }
  .bar { max-width: 1120px; margin: 0 auto; padding: 12px 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .bar h1 { margin: 0; font-size: 18px; font-weight: 600; flex: 1 1 auto; }
  .bar nav { display: flex; gap: 4px; flex-wrap: wrap; }
  .bar nav a { color: var(--color-foreground-primary-muted); text-decoration: none; font-size: 14px; padding: 4px 8px; border-radius: var(--sizes-radius-rd-8); }
  .bar nav a:hover { background: var(--color-background-primary-hover); color: var(--color-foreground-primary-default); }
  .seg { display: inline-flex; border: 1px solid var(--color-border-primary-default); border-radius: var(--sizes-radius-rd-8); overflow: hidden; }
  .seg button { font: inherit; font-size: 13px; padding: 4px 10px; border: 0; background: transparent; color: inherit; cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--color-brand-primary-default); color: var(--color-foreground-primary-inverse); }
  .seg button:focus-visible, .bar nav a:focus-visible { outline: 2px solid var(--color-brand-primary-default); outline-offset: 2px; }
  section { padding-top: 48px; scroll-margin-top: 64px; }
  section > h2 { margin: 0 0 4px; }
  .lede { margin: 0 0 24px; color: var(--color-foreground-primary-muted); }
  .eyebrow { margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-foreground-primary-muted); }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
  .meta { color: var(--color-foreground-primary-muted); font-size: 14px; margin: 4px 0 0; }
  .flag { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; font-size: 11px; font-weight: 700;
          background: var(--color-status-error-default); color: #fff; vertical-align: 1px; margin-left: 4px; }

  /* issues */
  .issues { display: grid; gap: 12px; }
  .issue { border: 1px solid var(--color-background-primary-high-contrast); border-left-width: 4px; border-radius: var(--sizes-radius-rd-8); padding: 12px 16px; }
  .issue.error { border-left-color: var(--color-status-error-default); }
  .issue.warn { border-left-color: var(--color-status-warning-default); }
  .issue.info { border-left-color: var(--color-status-info-default); }
  .issue h3 { margin: 0; font-size: 16px; }
  .issue p { margin: 4px 0 0; color: var(--color-foreground-primary-muted); font-size: 14px; }
  .issue ul { margin: 8px 0 0; padding-left: 18px; }
  .issue li { font-size: 13px; }

  /* palette */
  .scale { margin-bottom: 24px; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
  .swatch { border: 1px solid var(--color-background-primary-hover); border-radius: var(--sizes-radius-rd-8); overflow: hidden; }
  .swatch .c { height: 56px; }
  .swatch .l { padding: 6px 8px; }
  .swatch .l b { display: block; font-size: 13px; font-weight: 600; }

  /* semantic */
  .themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 16px; }
  .panel { background: var(--color-background-primary-default); color: var(--color-foreground-primary-default);
           border: 1px solid var(--color-background-primary-high-contrast); border-radius: var(--sizes-radius-rd-12); padding: 16px; }
  .panel h3 { margin: 0 0 12px; }
  .sem-group { margin-bottom: 16px; }
  .sem-row { display: grid; grid-template-columns: 32px 1fr auto; gap: 10px; align-items: center; padding: 6px 0;
             border-top: 1px solid var(--color-background-primary-hover); }
  .sem-name { font-size: 13px; overflow-wrap: anywhere; }
  .sem-val { text-align: right; color: var(--color-foreground-primary-muted); }
  .sem-val b { color: var(--color-foreground-primary-default); font-weight: 600; }
  .chip { width: 32px; height: 32px; border-radius: var(--sizes-radius-rd-8); overflow: hidden; border: 1px solid var(--color-background-primary-high-contrast); }
  .chip span { display: block; width: 100%; height: 100%; }
  .check { background: repeating-conic-gradient(#cbd5e1 0 25%, #fff 0 50%) 0 0 / 10px 10px; }

  /* type */
  .type-row { display: grid; grid-template-columns: minmax(160px, 220px) 1fr; gap: 16px; padding: 16px 0; border-top: 1px solid var(--color-background-primary-hover); align-items: baseline; }
  .type-row .sample { margin: 0; overflow-wrap: anywhere; }
  @media (max-width: 640px) { .type-row { grid-template-columns: 1fr; gap: 4px; } }

  /* sizes */
  .size-row { display: grid; grid-template-columns: minmax(150px, 200px) 56px 1fr; gap: 12px; align-items: center; padding: 6px 0; }
  .size-row .bar-fill { height: 16px; background: var(--color-brand-primary-default); border-radius: 2px; min-width: 1px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 12px; }
  .tile { text-align: center; }
  .tile .shape { height: 96px; background: var(--color-status-info-bg); border: 1px solid var(--color-status-info-default); margin-bottom: 6px; }
  .tile .bshape { height: 64px; border-style: solid; border-color: var(--color-foreground-primary-default); border-radius: var(--sizes-radius-rd-8); margin-bottom: 6px; }

  /* effects */
  .glass-stage { position: relative; border-radius: var(--sizes-radius-rd-12); padding: 24px; overflow: hidden;
                 background: radial-gradient(circle at 20% 30%, var(--color-orange-400) 0 14%, transparent 15%),
                             radial-gradient(circle at 70% 60%, var(--color-stormy-teal-400) 0 18%, transparent 19%),
                             repeating-linear-gradient(45deg, var(--color-deep-space-blue-500) 0 12px, var(--color-blue-300) 12px 24px); }
  .glass-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
  .glass { position: relative; isolation: isolate; padding: 16px; min-height: 120px; border-radius: var(--sizes-radius-rd-12); overflow: hidden;
           background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.5); color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
  .glass-bg { position: absolute; inset: 0; z-index: -1; }
  .glass b { display: block; font-size: 13px; overflow-wrap: anywhere; }
  footer { margin-top: 64px; color: var(--color-foreground-primary-muted); font-size: 13px; }
</style>
</head>
<body>
<header>
  <div class="bar">
    <h1>Runion foundations</h1>
    <nav aria-label="Sections">
      <a href="#issues">Issues</a><a href="#palette">Palette</a><a href="#semantic">Semantic</a><a href="#type">Type</a>
      <a href="#spacing">Spacing</a><a href="#radius">Radius</a><a href="#border">Border</a><a href="#effects">Effects</a>
    </nav>
    <div class="seg" role="group" aria-label="Theme">
      <button type="button" data-set="auto" aria-pressed="true">Auto</button>
      <button type="button" data-set="light" aria-pressed="false">Light</button>
      <button type="button" data-set="dark" aria-pressed="false">Dark</button>
    </div>
  </div>
</header>
<main class="wrap">
  <p class="meta">Generated from Figma file <b>${esc(raw.source.file)}</b>, exported ${esc(raw.source.exportedAt)}. Mirrors Figma as-is.
    ${vars.size} tokens · ${textStyles.length} text styles · ${effects.length} effects.</p>

  <section id="issues">
    <h2 class="text-h3">Issues found in Figma</h2>
    <p class="lede">Detected automatically on every build. Fix them in Figma, re-export, and they disappear from this list.
      Tokens marked <span class="flag">!</span> below are affected.</p>
    <div class="issues">
      ${issues.map(i => `
      <div class="issue ${i.severity}">
        <h3>${esc(i.title)} <span class="mono">· ${i.severity}</span></h3>
        <p>${esc(i.detail)}</p>
        ${i.items.length ? `<ul>${i.items.map(x => `<li class="mono">${esc(x)}</li>`).join('')}</ul>` : ''}
      </div>`).join('')}
    </div>
  </section>

  <section id="palette">
    <h2 class="text-h3">Palette</h2>
    <p class="lede">Raw colours from the <span class="mono">base</span> collection. Use semantic tokens in components, not these.</p>
    ${Object.entries(paletteGroups).map(([g, list]) => `
    <div class="scale">
      <p class="eyebrow">${esc(g)}</p>
      <div class="swatches">
        ${list.map(v => `
        <div class="swatch">
          <div class="c" style="background:var(${v.css})"></div>
          <div class="l"><b>${esc(lastSeg(v.name))}${flag(v.name)}</b><span class="mono">${esc(resolve(v, 'Mode 1'))}</span></div>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </section>

  <section id="semantic">
    <h2 class="text-h3">Semantic colours</h2>
    <p class="lede">The <span class="mono">${esc(themeColName)}</span> collection, shown in both modes side by side. Each row: reference → resolved value.</p>
    <div class="themes">
      ${semanticPanel(lightMode, 'light')}
      ${darkMode ? semanticPanel(darkMode, 'dark') : ''}
    </div>
  </section>

  <section id="type">
    <h2 class="text-h3">Typography</h2>
    <p class="lede">One CSS class per Figma text style, e.g. <span class="mono">.${esc(textStyles[0]?.className)}</span>.</p>
    ${textStyles.map(ts => `
    <div class="type-row">
      <div>
        <b class="mono">.${esc(ts.className)}</b>${flag(ts.name)}
        <p class="meta mono">${ts.size}/${esc(ts.lineHeight)} · ${ts.weight} · ${esc(ts.family)}</p>
      </div>
      <p class="sample ${ts.className}">Run together, finish stronger</p>
    </div>`).join('')}
  </section>

  <section id="spacing">
    <h2 class="text-h3">Spacing</h2>
    <p class="lede">The bar width uses the token directly.</p>
    ${spacing.map(v => `
    <div class="size-row"><span class="mono">${esc(v.css)}${flag(v.name)}</span><span class="mono">${toNum(v)}px</span><span class="bar-fill" style="width:var(${v.css})"></span></div>`).join('')}
  </section>

  <section id="radius">
    <h2 class="text-h3">Radius</h2>
    <div class="tiles">
      ${radius.map(v => `
      <div class="tile"><div class="shape" style="border-radius:var(${v.css})"></div>
        <span class="mono">${esc(lastSeg(v.name))}${flag(v.name)}</span><br><span class="mono meta">${toNum(v)}px</span></div>`).join('')}
    </div>
  </section>

  <section id="border">
    <h2 class="text-h3">Border width</h2>
    <div class="tiles">
      ${borders.map(v => `
      <div class="tile"><div class="bshape" style="border-width:var(${v.css})"></div>
        <span class="mono">${esc(lastSeg(v.name))}</span><br><span class="mono meta">${toNum(v)}px</span></div>`).join('')}
    </div>
  </section>

  <section id="effects">
    <h2 class="text-h3">Effects</h2>
    <p class="lede">Background blurs, one class per style (e.g. <span class="mono">.${esc(effects[0]?.cls)}</span>).
      Progressive blurs are approximated with a gradient mask (CSS has no native progressive blur), and the same radius
      may look slightly softer or sharper than in Figma, so compare visually.</p>
    <div class="glass-stage">
      <div class="glass-grid">
        ${effects.filter(e => e.kind === 'backdrop-blur').map(e => `
        <div class="glass">
          <span class="glass-bg ${e.cls}" aria-hidden="true"></span>
          <b>${esc(e.name)}</b><span class="mono">${esc(e.value)}${e.mask ? ' · progressive' : ''}</span></div>`).join('')}
      </div>
    </div>
  </section>

  <footer>Generated by scripts/build-tokens.mjs. Do not edit by hand.</footer>
</main>
<script>
  (function () {
    var root = document.documentElement, btns = document.querySelectorAll('[data-set]');
    function apply(mode) {
      if (mode === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.set === mode)); });
      try { localStorage.setItem('runion-theme', mode); } catch (e) {}
    }
    var saved = 'auto';
    try { saved = localStorage.getItem('runion-theme') || 'auto'; } catch (e) {}
    apply(saved);
    btns.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.set); }); });
  })();
</script>
</body>
</html>
`;

/* ------------------------------------------------------------------- write */

await mkdir(OUT_TOKENS, { recursive: true });
await mkdir(OUT_PREVIEW, { recursive: true });
await writeFile(path.join(OUT_TOKENS, 'tokens.json'), JSON.stringify(tokensJson, null, 2) + '\n');
await writeFile(path.join(OUT_TOKENS, 'tokens.css'), css);
await writeFile(path.join(OUT_PREVIEW, 'index.html'), preview);

const count = s => issues.filter(i => i.severity === s).length;
console.log(`Built ${vars.size} tokens, ${textStyles.length} text styles, ${effects.length} effects from "${raw.source.file}" (${raw.source.exportedAt}).`);
console.log(`Issues: ${count('error')} error, ${count('warn')} warn, ${count('info')} info`);
for (const i of issues) {
  console.log(`  [${i.severity}] ${i.title}`);
  for (const x of i.items) console.log(`      ${x}`);
}
if (CHECK && count('error')) process.exit(1);
