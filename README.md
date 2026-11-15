# Runion foundations

Design tokens for the Runion design system, generated from the Figma file **Runion**,
plus the custom React + TypeScript components the prototype is built from (step 2). Screens come next.

## Prototype (step 3): onboarding flow

```bash
npm run dev
```

Open http://127.0.0.1:5173/. On a laptop it shows a 402×874 phone-sized screen; on a phone it fills the screen.
The component gallery is at http://127.0.0.1:5173/#/gallery.

| Screen | Link | Figma page |
|---|---|---|
| Splash (full logo → short logo, tap to skip) | `#/` | ↳ Intro |
| Intro slides 1–3 (swipe, arrows, Skip, Get started) | `#/intro/1` … `#/intro/3` | ↳ Slider |
| Log in / Sign up tabs | `#/auth/login`, `#/auth/signup` | ↳ Log in / Sign up |
| Email code (sign up only; 6 boxes, resend after 60 s) | `#/verify` | ↳ Sign up - Validation code |
| Profile setup 1/4 – 3/4, then review 4/4 (avatar + one card per step with "Edit", Back / Create) | `#/profile/1` … `#/profile/4` | ↳ User-profile configuration |
| All set (no longer in the flow) | `#/done` | not in Figma |
| Home placeholder (after log in, with Log out) | `#/home` | not in Figma yet (design to come) |

**Flow:** Log in (email or Google) → Home placeholder. Sign up with email → code → profile 1–3 → review → Create → Home placeholder. Sign up with Google → profile 1–3 → review → Create → Home placeholder.

**Behaviour (no real backend):** any valid-looking email continues; any 6-digit code is accepted; "with Google" is simulated.
"Use my current location" fills a sample value instead of asking the browser.
Profile step 1: first name, last name, gender and running area are required; "Next" shows an error under each missing one.
The photo is optional: without one, the avatar shows the initials of first + last name, or the user icon while both are empty.
What the tester types stays in that browser tab only (`sessionStorage`), and the profile photo stays in memory; nothing is sent anywhere.
"Log out" on Home clears it all.

**Assets from Figma:** logo (Full, Short, White) as SVG; the 9 intro photos as JPEG (straightened, since Figma exports them tilted).
Not from Figma: the white Short logo (made from the White logo's colour) and the Google "G" (standard Google sign-in mark, because the Figma export failed).
**Sample content not in Figma:** the other options in the Gender, Pace and Distance lists (Figma shows one selected value each).

## Components (step 2)

```bash
npm install
```

```bash
npm run dev
```

Then open http://127.0.0.1:5173/ to see every component and variant (light/dark switch at the top).
`npm run typecheck` checks types; `npm run build` makes a production build in `dist/`.

### Storybook

```bash
npm run storybook
```

Then open http://127.0.0.1:6006/. Each component has a **Docs** page (props table from the TypeScript types and comments, plus every story) and stories with **Controls** for every Figma property.

- **Theme:** the "Theme" button in the toolbar switches Light / Dark.
- **Phone sizes:** the viewport button offers Phone (375), Large phone (430) and Tablet (768).
- **Accessibility:** the Accessibility tab lists automatic checks for the open story (reported, never blocking).
- **Static build:** `npm run build-storybook` writes a shareable static site to `storybook-static/`.
- Telemetry is turned off in `.storybook/main.ts`.
- After editing `.storybook/` files, restart Storybook.

Versions: Storybook 10.6.5 (React + Vite). `package.json` overrides Storybook's docs plugin
(`@joshwooding/vite-plugin-react-docgen-typescript`) to 0.9.1, which removes two moderate `npm audit` findings in its old dependencies.
Remove the override once Storybook ships with 0.9.1 or later.

| Component | File | Notes |
|---|---|---|
| `Button` | `src/components/Button` | solid / outlined / ghost · 6 colours · large / medium / small · start/end icon · loading |
| `IconButton` | `src/components/IconButton` | same variants · large / medium / small / xsmall · `aria-label` required |
| `Tabs`, `TabPanel` | `src/components/Tabs` | standard / scrollable / fullWidth · icon left / up / right · arrow keys, Home/End |
| `FormField`, `TextField`, `PasswordField`, `TextArea`, `Select`, `FormLabel`, `FormHelperText` | `src/components/FormField` | label + helper above, message below · error / success / disabled · large / medium |
| `Divider` | `src/components/Divider` | horizontal / vertical |
| `Slider` | `src/components/Slider` | native range input · optional step marks · left label = live value (Figma "Active"), right label = max · thumb stays inside the bar · marks at every step, ends included |
| `Checkbox`, `FormControlLabel`, `FormGroup` | `src/components/Checkbox` | checked / indeterminate / disabled · label start/end · group error / disabled |
| `MobileStepper` | `src/components/MobileStepper` | dots (back/next) or text |
| `Avatar`, `getInitials` | `src/components/Avatar` | photo → initials → user icon (also if the photo fails to load) · circular / rounded / square · 24–120px · optional success badge |

- **No UI library.** Styling uses only the variables in `tokens/tokens.css` (CSS modules per component).
- **Icons:** [Phosphor Icons](https://phosphoricons.com) via `@phosphor-icons/react` (MIT), the same set the Figma file uses.
- **Accessibility:** native elements where possible (`button`, `input type=checkbox|range`, `select`, `fieldset`); WAI-ARIA tabs pattern for Tabs.

### Where the code differs from Figma on purpose
- **Checkbox disabled:** Figma keeps the enabled icon colour; code uses `status/disabled/on-transparent` so it reads as unavailable.
- **Tabs on phones:** Full Width tabs use 8px side padding instead of 28px so 4 tabs fit at 375px; Standard tabs scroll when they don't fit. (Figma has no small-screen variant for these.)
- **Slider:** only the single-value Medium slider is built (no range / two thumbs, no Small size). Figma has no disabled variants, so disabled uses the disabled tokens. Figma has no hover/focus states for the thumb; keyboard focus adds an outline so the slider stays usable without a mouse.
- **MobileStepper dots:** the active dot is filled and the others outlined; in Figma all dots look the same.

### Figma quirks mirrored as-is
- IconButton Ghost + Secondary uses the default foreground colour (Button Ghost + Secondary uses brand/secondary).
- Text field placeholder is `body-sm`, smaller than the `body-md` value text.
- Checkbox Small / Medium / Large are all 28×28 in Figma, so the code has no size option.
- Avatar Rounded (4) and Square (0) corner radii are raw values in Figma, not radius tokens (Circular uses `rd-80`).
- Slider: Figma names the full-width bar `_SliderTrack` (brand/primary) and the filled part `_SliderRail` (brand/secondary), the opposite of the usual convention; the code uses the same names and colours.
- Avatar badge sizes are raw values in Figma (ring 8 / 12 / 24 / 32 px; the 24px avatar has no ring).

### Avatar badge position (code follows the pattern, Figma has outliers)
Code: Circular → the badge's outer corner sits on the avatar's corner; Rounded / Square → the badge is centred on the corner.
Figma variants that don't follow it: Circular 24 / 32 / 60, Rounded and Square 60, the 24px Icon variants, the Image variants,
and a few half-pixel offsets (32px Icon, 120px). Align them in Figma and the code needs no change.
## Files

| Path | What it is | Edit? |
|---|---|---|
| `figma/export-foundations.js` | Script run inside Figma (Desktop Bridge) that exports variables, text styles and effects | Yes |
| `figma/foundations.raw.json` | Raw export from Figma: the source of truth for code | No (re-export) |
| `scripts/build-tokens.mjs` | Turns the raw export into tokens, CSS and the preview, and reports issues | Yes |
| `tokens/tokens.css` | CSS custom properties, light/dark themes, one class per text style | No (generated) |
| `tokens/tokens.json` | All tokens with references and resolved values per mode, plus `issues` | No (generated) |
| `preview/index.html` | Visual check of every foundation | No (generated) |

## Using the tokens

```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="tokens/tokens.css">
```

```css
.card {
  background: var(--color-background-primary-contrast);
  color: var(--color-foreground-primary-default);
  padding: var(--sizes-spacing-sp-16);
  border-radius: var(--sizes-radius-rd-12);
  border: var(--sizes-border-br-1) solid var(--color-border-primary-default);
}
```

```html
<h1 class="text-h1">Title</h1>
<p class="text-body-md-regular">Body copy</p>
```

- **Naming:** the Figma path with `/` and spaces replaced by `-`, e.g. `color/brand/primary/default` becomes `--color-brand-primary-default`.
- **Themes:** follow the OS setting by default. Force one with `data-theme="light"` or `data-theme="dark"` on `<html>` or on any container. Themes can be nested.
- **In components, use the semantic tokens** (`alias` collection: `--color-foreground-*`, `--color-brand-*`, `--color-status-*`, `--sizes-*`), not the raw palette (`--color-neutral-500`, `--scale-16`).

## Updating from Figma

1. Open the Runion file in Figma Desktop and run the Desktop Bridge plugin.
2. Ask Claude to re-run `figma/export-foundations.js` and save the result to `figma/foundations.raw.json`.
3. Rebuild:

```bash
npm run tokens
```

4. Check `preview/index.html` (serve the folder with `npm run preview`, then open http://localhost:4310/preview/).

`npm run tokens:check` exits with an error if any "error" issue remains. Use it in CI later.

## Policy: mirror Figma as-is

The build never corrects names or values. It only applies the translations CSS needs:

- numbers become `px`
- font-weight words become numbers (`regular` 400, `semibold` 600, `bold` 700). Words are correct in Figma, where they link to text styles as font-style names.
- font families get a `system-ui, sans-serif` fallback
- an alias with opacity becomes `color-mix()`
- progressive blurs become a blur plus a gradient mask (an approximation, see Caveats)

Known inconsistencies are detected on every build and listed in the preview and in `tokens.json` → `issues`.
As of the latest 2026-11-13 export, there are **no issues** (0 error, 0 warn, 0 info).

Fixed in Figma since the first export: `String-text` ("&lt;AvatarGroup&gt;", not a design token) removed, `rd-16` (now 16px), `color/200` (now `neutral/200`), `body-xxs/*` renamed to `body-xs/*`,
and `neutral/600` (now `#475569`, so it no longer duplicates `neutral/500`).
The `typography` font family and weight variables now alias the `base` ones (`type/font family/body`, `type/font weight/*`),
so `base` is the single source for fonts: change a font or weight there only.
Fix the rest in Figma, re-export, and they disappear from the list.

Not flagged on purpose: **shadows**. Runion has no shadow styles yet by decision, so their absence is not a defect.
If shadow effect styles are added in Figma later, the export picks them up and the build turns them into `box-shadow` tokens.

## Effects

One class per Figma effect style, e.g. `.effect-blur-glass-uniform-lg` or `.effect-blur-glass-progressive-lg`.
Progressive blurs use `mask-image`, which also fades the element's own content, so put the class on a background layer:

```html
<div class="panel" style="position: relative; isolation: isolate">
  <span class="effect-blur-glass-progressive-lg" style="position: absolute; inset: 0; z-index: -1"></span>
  Content stays sharp
</div>
```

## Caveats

- Blur radius: Figma's background blur and CSS `backdrop-filter: blur()` may not render the same radius with identical softness. Compare visually before relying on exact parity.
- Progressive blur: CSS has no native progressive blur. The code fades a full-strength blur in with a gradient mask, which looks close to Figma's (blur 0 at the top, full at the bottom) but is not identical.
- Paragraph spacing from text styles is in `tokens.json` but is not applied by the `.text-*` classes, so they don't add margins inside components.
- Variable scopes are not exported (not needed in code).
