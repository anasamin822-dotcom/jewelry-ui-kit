import { jewelryPalette } from "./palette";
export type Design = {
  piece: number;
  metal: string;
  tone: string;
  shape: string;
  gem: string;
  carat: number;
  engraving: string;
  size: number;
};
export const initialDesign: Design = {
  piece: 0,
  metal: "Gold",
  tone: jewelryPalette.gold,
  shape: "Round",
  gem: jewelryPalette.stone,
  carat: 1.2,
  engraving: "",
  size: 7,
};
export function readDesign(): Design {
  try {
    const raw = JSON.parse(decodeURIComponent(location.hash.slice(1)));
    return cleanDesign(raw);
  } catch {
    return initialDesign;
  }
}
export function cleanDesign(x: Partial<Design>): Design {
  return {
    piece:
      Number(x.piece) === 3
        ? 0
        : Math.max(0, Math.min(4, Math.floor(Number(x.piece) || 0))),
    metal: ["Gold", "Silver", "Platinum", "Rose gold", "Brass"].includes(
      x.metal || "",
    )
      ? x.metal!
      : "Gold",
    tone: /^#[a-f\d]{6}$/i.test(x.tone || "") ? x.tone! : initialDesign.tone,
    shape: ["Round", "Oval", "Pear"].includes(x.shape || "")
      ? x.shape!
      : "Round",
    gem: /^#[a-f\d]{6}$/i.test(x.gem || "") ? x.gem! : initialDesign.gem,
    carat: Math.max(0.5, Math.min(3, Number(x.carat) || 1.2)),
    engraving: String(x.engraving || "").slice(0, 18),
    size: Math.max(5, Math.min(9, Math.round(Number(x.size) || 7))),
  };
}
