// Export Runion foundations from Figma.
//
// Run inside the Figma file via the Desktop Bridge plugin (figma_execute).
// The returned object is saved as figma/foundations.raw.json, then
// `npm run tokens` regenerates tokens/ and preview/ from it.
//
// Output shape:
//   collections.<name>.modes : mode names, in Figma order
//   collections.<name>.rows  : [variableName, typeLetter (C|F|S), ...one value per mode]
//       value forms: "#rrggbb[aa]" | number | string
//                    "@other/variable"                 (alias)
//                    { alias: "other/variable", opacity } (alias with opacity, 0–100)
//   textStyles   : local text styles, with the variables they are bound to
//   effectStyles : local effect styles
// Variable scopes are not exported (not used in code).

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = {};
vars.forEach(v => { byId[v.id] = v; });

async function nameOf(id) {
  if (byId[id]) return byId[id].name;
  const v = await figma.variables.getVariableByIdAsync(id); // e.g. library variables
  return v ? v.name : id;
}
function hex(c) {
  const h = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : '');
}
async function fmt(val) {
  if (val && val.type === 'VARIABLE_ALIAS') return '@' + await nameOf(val.id);
  if (val && typeof val === 'object' && val.color && val.color.type === 'VARIABLE_ALIAS') {
    return { alias: await nameOf(val.color.id), opacity: val.opacity };
  }
  if (val && typeof val === 'object' && 'r' in val) return hex(val);
  return val;
}

const collections = {};
for (const c of cols) {
  const rows = [];
  for (const id of c.variableIds) {
    const v = byId[id];
    if (!v) continue;
    const values = [];
    for (const m of c.modes) values.push(await fmt(v.valuesByMode[m.modeId]));
    rows.push([v.name, v.resolvedType[0], ...values]);
  }
  collections[c.name] = { modes: c.modes.map(m => m.name), rows };
}

async function bound(a) { return a ? await nameOf(a.id) : undefined; }
const textStyles = [];
for (const s of await figma.getLocalTextStylesAsync()) {
  const b = s.boundVariables || {};
  textStyles.push({
    name: s.name,
    family: s.fontName.family,
    style: s.fontName.style,
    size: s.fontSize,
    lineHeight: s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight.value + (s.lineHeight.unit === 'PIXELS' ? 'px' : '%'),
    letterSpacing: s.letterSpacing.value + (s.letterSpacing.unit === 'PIXELS' ? 'px' : '%'),
    paragraphSpacing: s.paragraphSpacing,
    textCase: s.textCase,
    textDecoration: s.textDecoration,
    // fontStyle is how Figma links a weight variable ("regular", "semibold", "bold") to a text style.
    bound: { size: await bound(b.fontSize), lineHeight: await bound(b.lineHeight), family: await bound(b.fontFamily), weight: await bound(b.fontWeight), fontStyle: await bound(b.fontStyle) },
  });
}

const effectStyles = (await figma.getLocalEffectStylesAsync()).map(s => ({
  name: s.name,
  effects: s.effects.filter(e => e.visible).map(e => ({
    type: e.type,
    radius: e.radius,
    x: e.offset ? e.offset.x : undefined,
    y: e.offset ? e.offset.y : undefined,
    spread: e.spread,
    color: e.color ? hex(e.color) : undefined,
    // Blurs: NORMAL (uniform) or PROGRESSIVE (from startRadius at startOffset to radius at endOffset,
    // offsets are 0–1 fractions of the layer box).
    blurType: e.blurType,
    startRadius: e.startRadius,
    startOffset: e.startOffset,
    endOffset: e.endOffset,
  })),
}));

return {
  source: { file: figma.root.name, fileKey: figma.fileKey, exportedAt: new Date().toISOString().slice(0, 10) },
  collections,
  textStyles,
  effectStyles,
};
