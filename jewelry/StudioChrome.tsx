import type { ReactNode } from "react";
export function StudioHeader({ children }: { children: ReactNode }) {
  return (
    <header className="js-header glass">
      <div className="js-brand">
        <span>J</span>
        <div>
          Jewelry Studio<small>JEWELRY / DESIGN STUDIO</small>
        </div>
      </div>
      <span className="js-header-note">
        <span className="kit-atelier-wordmark">THE PERSONAL ATELIER</span>
        <em>Design in real time.</em>
      </span>
      {children}
    </header>
  );
}
export function StudioDock({
  category,
  onChange,
}: {
  category: string;
  onChange: (value: string) => void;
}) {
  return (
    <nav
      className="js-category-tabs"
      role="tablist"
      aria-label="Customize jewelry"
    >
      {[
        "Piece",
        "Metal",
        "Colour",
        "Stone",
        "Engrave",
        "Size",
        "Compare",
        "Share",
      ].map((c, i) => (
        <button
          key={c}
          id={"js-category-" + c}
          role="tab"
          aria-controls="js-options"
          aria-selected={category === c}
          tabIndex={category === c ? 0 : -1}
          onClick={() => {
            onChange(c);
          }}
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
              e.preventDefault();
              const tabs = [
                "Piece",
                "Metal",
                "Colour",
                "Stone",
                "Engrave",
                "Size",
                "Compare",
                "Share",
              ];
              const next =
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? tabs.length - 1
                    : (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
                      tabs.length;
              onChange(tabs[next]);
              requestAnimationFrame(() => {
                const target = document.getElementById(
                  "js-category-" + tabs[next],
                );
                target?.focus();
                target?.scrollIntoView({
                  block: "nearest",
                  inline: "nearest",
                  behavior: "instant",
                });
              });
            }
          }}
        >
          {c}
        </button>
      ))}
    </nav>
  );
}
