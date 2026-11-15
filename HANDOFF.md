# Runion prototype: handoff

Status as of **13 November 2026**. Read this first when continuing in a new session or account.
Technical details (commands, screens, component list, Figma differences) are in [README.md](README.md).

## Where things stand

| Step | Status |
|---|---|
| 1. Foundations (tokens from Figma) | ✅ Done · 0 errors · `npm run tokens` |
| 2. Components (custom React + TypeScript) | ✅ Done · 9 components (incl. Avatar) + Storybook |
| 3. Onboarding prototype | ✅ Done · log in → Home placeholder · sign up → code → profile 1–3 → review (4/4) → Create → Home placeholder |
| 4. Home after log in | ⏳ Placeholder at `#/home`; the user will provide the design |
| 5. Animations | ⏸ Later: decide which ones are designed in Figma first |

Not needed, by decision (13 Nov 2026): Git and a backend. Everything stays simulated.

## Open at the end of the 13 Nov 2026 session

Waiting on the user:
- **Review step texts:** confirm or replace "Review your profile" (title) and "Tell us about yourself" (first card); Figma has "Preview subtitle" in both.
- **"Where do you usually run?" card:** code shows two rows (location, notifications: Yes / No); Figma has one row labelled "Pace" / "Label".
- **"Create" destination:** code goes to the Home placeholder; Figma doesn't show what follows.
- **"All set" screen** (`src/screens/AllSet.*`, route `#/done`): unused now. Delete or keep?
- **Home design** for `#/home` (the user will send it).

Figma issues reported, not yet fixed (code mirrors Figma or follows the clear pattern; see README "Figma quirks"):
- Review step: stepper reads "5/5" (should be 4/4); avatar uses the Size=40px variant stretched to 120px; layer typo "Cotainer-values".
- Avatar: Rounded radius is a raw 4 (not `rd-4`); 24px text binds `font-weight/semi-bold`, `scale/20`, `paragraph-spacing/body/sm`; 40–80px line height binds `scale/26`; 120px uses `paragraph-spacing/body/lg`; badge position outliers (Circular 24/32/60, Rounded/Square 60, 24px Icon, Image variants).

Done and verified this session: log-in/sign-up flow split, step 1 required fields, Avatar component (all variants + badge),
profile picture layout, Slider rebuilt to the new Figma (2–10 km, live value label, edge-to-edge marks), tokens re-exported (0 issues),
review step + sticky bottom button bar on all profile steps.

## Rules agreed with the user

- **The Runion Figma file stays in draft.** Never publish the library, move it out of Drafts or share it. Don't add "publish" steps to instructions.
- **Mirror Figma as-is.** The build never "corrects" token names or values; problems are reported, and fixed in Figma.
- **No MUI and no UI library.** Custom components, styled only with `tokens/tokens.css`. Icons: Phosphor (`@phosphor-icons/react`), the same set as Figma.
- **No shadows yet, by decision.** Don't report missing shadows as a defect.
- **Kept on purpose in Figma:** the unused font variables. (`String-text` was removed from Figma on 13 Nov 2026; the token build now reports 0 issues.)
- **When asked to "check again":** re-read Figma and say what's still missing, in chat. No preview or screenshots unless asked.
- **Tell the user before any scan of the whole Figma file** (79 pages, about 190,000 layers).
- **Hifi pages** (Hifi, ↳ Intro, ↳ Slider, ↳ Log in / Sign up, ↳ Sign up - Validation code, ↳ User-profile configuration) are the source for screens. For design-system audits, ask before including them.
- **Storybook and the prototype are for the user only**: run them locally, don't publish.
- **Don't leave dev servers running** after checking something; the user runs them from VS Code.

## Figma

- File: **Runion** (the file key is in `figma/foundations.raw.json`). Access goes through the **Figma Desktop Bridge** plugin, which must be open in Figma Desktop.
- Collections: `base` (raw values), `alias` (Light-mode / Dark-mode), `typography` (aliases `base` for font family and weight).
- Restore point in version history: **"Before typography alias fix"**.
- Working tips:
  - make one Figma call at a time;
  - heavy `exportAsync` calls (several SVGs with outlined text) disconnect the bridge, so export one asset per call;
  - photos: use `figma_capture_screenshot` and copy the saved PNG. Images inside rotated frames come out tilted; straighten them with `sips -r ±15` and a centre crop.

## Project layout

```
figma/              export script (run in Figma) + raw export (source of truth for tokens)
scripts/            build-tokens.mjs → tokens/ + preview/
tokens/             tokens.css, tokens.json (generated, don't edit)
src/components/     components (one folder each, with CSS module + stories)
src/screens/        prototype screens
src/app/            hash router, onboarding state, phone frame
src/gallery/        component gallery (#/gallery)
src/assets/         logo SVGs, Google icon, intro photos
.storybook/         Storybook config (theme switch, phone viewports, telemetry off)
```

## Not taken from Figma (confirm with design)

- Google "G" icon: the Figma export kept failing, so the standard Google sign-in mark is used.
- White short logo for dark mode: Figma has none; it's made from the White logo's colour `#F1F5F9`.
- The other options in the Gender, Pace and Distance lists (Figma shows one selected value each).
- "Use my current location" fills a sample value; Google sign-in, email and code are simulated.
- The Home placeholder (after log in and after "Create"). The old "All set" screen (`#/done`) is no longer in the flow.
- Review step: the title "Review your profile" and the location/notification rows (Figma has placeholder text there, see README).
- All current animations (splash timing, slide fades, hover/press). Suggested next: design the splash and slide transitions in Figma, and add motion tokens (for example fast 120 ms, normal 250 ms, slow 400 ms, plus one easing).
- Phone adaptations: full-width tabs use 8px side padding; disabled checkbox uses the disabled colour; the active MobileStepper dot is filled.
