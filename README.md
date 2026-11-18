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

No 3D renderer, proprietary SDK, application history, 3D product assets,
credentials, checkout, pricing, payment or order backend is included. The cart
resets on page reload. Sizing/carat values are visual design inputs, not a
manufacturing or calibrated fitting specification. This repository contains
source; it is not an npm release or a hosted interactive preview.
