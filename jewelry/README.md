# Jewelry studio UI

All visible studio UI is implemented in this shared package. This is a new kit
extension, not a claim that every component existed in the original kit.

## Public exports

Import from `@anasamin822/jewelry-ui-kit/jewelry`:

- `JewelryStudio`: complete stateful composition, camera controls, loading,
  comparison overlays, inspector, product/metal choices and summaries.
- `StudioHeader`, `StudioDock`: header slots and controlled keyboard-accessible tabs.
- `StudioCart`: configuration snapshots, modal, shared count and removal.
- `JewelryColorPicker`: HEX/HSV editing, swatches and saved colors.
- `DesignTools`: tool orchestration, share/export notices and size guide.
- `StonePanel`, `EngravingPanel`, `SizePanel`, `ComparePanel`, `SharePanel`:
  controlled tool surfaces. They accept data/callbacks, not renderer imports.
- `BackgroundArt`, `StageUnavailable`, `StageError`: decorative and fallback UI.
- Shared design types/defaults/validation, catalog and product-color palette.

The earlier `@anasamin822/jewelry-ui-kit/studio` entry remains available for `SpecCard`,
`ChoiceCard`, `SectionHeading`, `JewelryMark`, `GemMark`, `MetalOrb`, `StudioHint`.
Core `Button`, `IconButton` and icons remain at their existing entry points.

## Renderer boundary

`JewelryStudio` accepts `renderStage(props)` and `captureFrame(standardView?)`.
The package does not import the app, Three.js or the SDK. Another renderer can
implement these interfaces without moving UI out of the kit. The jewelry app
adapter renders this one kit component and provides the renderer and capture.
Its error boundary uses kit fallback components. Only the 3D view host and
renderer logic stay in the app.

## Styles and tokens

The entry loads the existing kit foundation, shared studio styles, stage and
background styles. Studio decorative color literals are now shared CSS tokens
in `product-kit.css`, preserving their exact prior values. Material and swatch
HEX defaults live in `jewelryPalette`, since the renderer and editable color
values require actual colors rather than CSS variable strings. User-selected
colors and generated HSV colors remain dynamic data, not hardcoded UI chrome.

The visit-only cart has no checkout, payment, pricing or backend.
