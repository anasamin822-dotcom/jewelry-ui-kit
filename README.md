# Jewelry UI Kit

React components and theme used by the jewelry design studio, extracted into a
standalone source repository. This is a renderer-independent kit, not a full
3D app. The extraction has neutral branding and a separate package namespace.

## Included

- Button, icon, field, input, select, range, switch, segmented-control, swatch
  and dialog primitives.
- Complete studio shell, header, keyboard-accessible dock, specification and
  choice cards, hints, camera-control UI and decorative backgrounds.
- Visit-only configuration cart, color picker, stone, engraving, size guide,
  compare and share panels.
- Shared theme tokens, typography, product-color defaults and design types.
- TypeScript and ESLint checks. The font license is in `fonts/OFL.txt`.

## Use

```tsx
import { JewelryStudio } from "@anasamin822/jewelry-ui-kit/jewelry";

<JewelryStudio
  renderStage={(props) => <YourRenderer {...props} />}
  captureFrame={(standardView) => captureYourRenderer(standardView)}
/>;
```

`YourRenderer` and `captureYourRenderer` are integration placeholders, not
included implementations. Copy/link this package into a React TypeScript
workspace using the package namespace above. The source uses browser APIs.
See [component exports and renderer contract](jewelry/README.md).

```sh
npm install --ignore-scripts
npm run typecheck
npm run lint
```

## Scope

No proprietary SDK, application history, external 3D product assets,
credentials, checkout, pricing, payment or order backend is included. The cart
resets on page reload. Sizing/carat values are visual design inputs, not a
manufacturing or calibrated fitting specification. This repository contains source plus a static interactive preview. It is not an npm release.
The demo uses a neutral Canvas 2D placeholder, not a 3D engine. Camera/motion controls
are hidden in the demo because there is no 3D renderer. Comparison and PNG export
use the placeholder image. The rest of the components are interactive.


## Black Studio reference study

Run `npm run dev` and open `/black.html` for a separate black-mode 3D concept.
The existing `/index.html` kit gallery remains unchanged.

- Uses the kit Button, SectionHeading, MetalOrb, JewelryColorPicker and theme foundation.
- Original Three.js procedural ring, loose faceted gemstone, bare setting and rough stone pedestal.
- Gem and metal tones, three cuts, stone scale, polished/satin finish, orbit,
  camera views, zoom, optional rotation, reset and canvas PNG export.
- Hold-to-compare is available on desktop. The mobile inspector scrolls internally.
- Reduced-motion preference disables automatic rotation.

This is an independent visual prototype, not the reference site's implementation.
No VictorShell code, SDK, upstream ring models, license config or credentials are included.
The earlier CC0 pendant, pearl necklace and bracelet GLBs are reused exactly; see public/models/studio/LICENSES.md.
Classic Solitaire and Halo Setting remain independent procedural dummy rings, not the upstream ring GLBs.
The dummy gemstone shading is stylized, not physically accurate diamond optics.
No carat calibration, manufacturing output, checkout, backend or saved designs.
Three.js is MIT-licensed. Run `npm run typecheck`, `npm run lint` and `npm run build`.


### Compact guided flow

The black page now uses a bottom step panel: Piece, Ring style (rings only),
Stone, Metal, Colour. Choices advance automatically. The final Add to cart
records a configuration snapshot in a visit-only front-end cart. No checkout,
payment or persistence after reload. Header image export and scene switcher
are removed. Imported CC0 collection models retain their original stones.
