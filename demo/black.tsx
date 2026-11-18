import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../controls";
import { IconSymbols } from "../IconSymbols";
import { SectionHeading, MetalOrb } from "../studio";
import { JewelryColorPicker } from "../jewelry/JewelryColorPicker";
import { BlackStage, type StageApi, type StudioDesign } from "./BlackStage";
import "../product-kit.css";
import "../product-react.css";
import "../studio.css";
import "./black.css";
const initial: StudioDesign = {
  metal: "#e0e3e8",
  gem: "#1644b8",
  shape: "Round",
  size: 1,
  scene: "Ring",
  finish: "Polished",
};
function BlackStudio() {
  const [design, setDesign] = useState<StudioDesign>(initial),
    [tab, setTab] = useState("Stone"),
    [rotating, setRotating] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(false),
    [compare, setCompare] = useState(false),
    [notice, setNotice] = useState(""),
    [activeView, setActiveView] = useState("Studio");
  const api = useRef<StageApi | null>(null);
  const update = (patch: Partial<StudioDesign>) => {
    setDesign((d) => ({ ...d, ...patch }));
    setNotice("");
  };
  const save = () => {
    try {
      const a = document.createElement("a");
      a.href = api.current!.capture();
      a.download = "noir-jewelry-design.png";
      a.click();
      setNotice(
        "Image saved. This is a concept render, not a production specification.",
      );
    } catch {
      setNotice("Image could not be saved in this browser.");
    }
  };
  return (
    <div className="noir-app">
      <IconSymbols />
      <header className="noir-header">
        <a
          className="noir-brand"
          href="./black.html"
          aria-label="Jewelry Studio home"
        >
          <span className="noir-logo">J</span>
          <span>
            Jewelry Studio<small>THE BLACK COLLECTION</small>
          </span>
        </a>
        <div className="noir-header-mid">
          <span className="live-dot" />
          Independent 3D concept
        </div>
        <Button variant="primary" onClick={save} disabled={!ready || error}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
          </svg>
          Save image
        </Button>
      </header>
      <main className="noir-layout">
        <section className="noir-stage" aria-label="Live jewelry preview">
          <div className="noir-stage-copy">
            <div className="noir-eyebrow">
              <span />
              01 / SOLITAIRE STUDY
            </div>
            <h1>A little less ordinary.</h1>
            <p>One stone. Your point of view.</p>
          </div>
          <BlackStage
            design={compare ? initial : design}
            rotating={rotating}
            onReady={() => setReady(true)}
            onError={() => setError(true)}
            api={api}
          />
          <div className="noir-waterline">
            <span>
              NOIR /{" "}
              {design.scene === "Ring"
                ? "SOLITAIRE"
                : design.scene.toUpperCase()}
            </span>
            <span>PROCEDURAL 3D · CONCEPT ONLY</span>
          </div>
          {(!ready || error) && (
            <div className="noir-loading" role="status">
              {error
                ? "3D is unavailable in this browser. Try a WebGL-enabled browser."
                : "Preparing your studio…"}
            </div>
          )}
          <div
            className="noir-scene-switch"
            role="group"
            aria-label="Preview scene"
          >
            {(["Ring", "Gemstone", "Setting"] as const).map((s, i) => (
              <button
                key={s}
                aria-label={s}
                aria-pressed={design.scene === s}
                onClick={() => update({ scene: s })}
              >
                <span>0{i + 1}</span>
                {s}
              </button>
            ))}
          </div>
          <div className="noir-viewbar">
            <button
              className="noir-orbit"
              aria-label={rotating ? "Pause rotation" : "Rotate preview"}
              aria-pressed={rotating}
              onClick={() => setRotating(!rotating)}
            >
              <span aria-hidden="true">{rotating ? "Ⅱ" : "↻"}</span>
              {rotating ? "Pause" : "Rotate"}
            </button>
            <span className="noir-view-divider" />
            {["Studio", "Front", "Profile", "Top"].map((v) => (
              <button
                key={v}
                className="noir-camera"
                aria-pressed={activeView === v}
                onClick={() => {
                  setActiveView(v);
                  setRotating(false);
                  if (v === "Studio") api.current?.reset();
                  else api.current?.view(v);
                }}
              >
                {v}
              </button>
            ))}
            <button
              aria-label="Zoom in"
              onClick={() => api.current?.zoom(0.88)}
            >
              +
            </button>
            <button
              aria-label="Zoom out"
              onClick={() => api.current?.zoom(1.12)}
            >
              −
            </button>
          </div>
          <div className="noir-drag">
            Drag to orbit <span>·</span> Scroll to zoom
          </div>
        </section>
        <aside className="noir-inspector" aria-label="Design controls">
          <div className="noir-inspector-title">
            <span className="noir-eyebrow">DESIGN / 001</span>
            <h2>The solitaire</h2>
            <p>Your stone, set your way.</p>
          </div>
          <nav
            className="noir-tabs"
            role="tablist"
            aria-label="Customize design"
          >
            {["Stone", "Metal", "Details"].map((t, i) => (
              <button
                key={t}
                id={"tab-" + t}
                role="tab"
                aria-selected={tab === t}
                tabIndex={tab === t ? 0 : -1}
                aria-controls="noir-controls"
                onClick={() => setTab(t)}
                onKeyDown={(e) => {
                  if (
                    !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const next =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? 2
                        : (i + (e.key === "ArrowRight" ? 1 : 2)) % 3;
                  const value = ["Stone", "Metal", "Details"][next];
                  setTab(value);
                  requestAnimationFrame(() =>
                    document.getElementById("tab-" + value)?.focus(),
                  );
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <div
            className="noir-control-scroll"
            id="noir-controls"
            role="tabpanel"
            aria-labelledby={"tab-" + tab}
          >
            {tab === "Stone" ? (
              <>
                <SectionHeading
                  eyebrow="THE CENTERPIECE"
                  title="A shade of you"
                />
                <div className="noir-field-label">
                  Gem color <span>Visual tone</span>
                </div>
                <div className="noir-gems">
                  {[
                    { name: "Sapphire", color: "#1644b8" },
                    { name: "Emerald", color: "#15865d" },
                    { name: "Ruby", color: "#ac1746" },
                    { name: "Diamond", color: "#e1ebfa" },
                  ].map((g) => (
                    <button
                      key={g.name}
                      aria-label={g.name}
                      aria-pressed={design.gem === g.color}
                      onClick={() => update({ gem: g.color })}
                    >
                      <span
                        style={{ "--gem": g.color } as React.CSSProperties}
                      />
                      <small>{g.name}</small>
                    </button>
                  ))}
                </div>
                <JewelryColorPicker
                  value={design.gem}
                  onChange={(gem) => update({ gem })}
                />
                <div className="noir-field-label">
                  Cut <span>3 options</span>
                </div>
                <div className="noir-cuts">
                  {(["Round", "Oval", "Emerald"] as const).map((shape) => (
                    <button
                      key={shape}
                      aria-pressed={design.shape === shape}
                      onClick={() => update({ shape })}
                    >
                      <span
                        className={"noir-cut-icon cut-" + shape.toLowerCase()}
                      />
                      {shape === "Emerald" ? "Step" : shape}
                    </button>
                  ))}
                </div>
                <label className="noir-scale">
                  Stone scale <output>{design.size.toFixed(2)}×</output>
                  <input
                    type="range"
                    aria-label="Stone scale"
                    min="0.8"
                    max="1.25"
                    step="0.01"
                    value={design.size}
                    onChange={(e) => update({ size: Number(e.target.value) })}
                  />
                </label>
                <p className="noir-footnote">
                  A visual proportion, not a carat weight.
                </p>
              </>
            ) : tab === "Metal" ? (
              <>
                <SectionHeading
                  eyebrow="THE SETTING"
                  title="Made of contrast"
                />
                <div className="noir-field-label">
                  Metal color <span>Visual tone</span>
                </div>
                <div className="noir-metals">
                  {[
                    { name: "Platinum", tone: "#e0e3e8" },
                    { name: "Gold", tone: "#d5af63" },
                    { name: "Rose", tone: "#c88d79" },
                  ].map((m) => (
                    <button
                      key={m.name}
                      aria-pressed={design.metal === m.tone}
                      onClick={() => update({ metal: m.tone })}
                    >
                      <MetalOrb tone={m.tone} />
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
                <JewelryColorPicker
                  value={design.metal}
                  onChange={(metal) => update({ metal })}
                />
                <div className="noir-field-label">Surface finish</div>
                <div className="noir-finish">
                  {(["Polished", "Satin"] as const).map((f) => (
                    <button
                      key={f}
                      aria-pressed={design.finish === f}
                      onClick={() => update({ finish: f })}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="noir-footnote">
                  Colors suggest a material. They are not a metal-purity
                  specification.
                </p>
              </>
            ) : (
              <>
                <SectionHeading
                  eyebrow="YOUR COMPOSITION"
                  title="The finer details"
                />
                <dl className="noir-specs">
                  <div>
                    <dt>Study</dt>
                    <dd>{design.scene}</dd>
                  </div>
                  <div>
                    <dt>Stone cut</dt>
                    <dd>
                      {design.shape === "Emerald" ? "Step" : design.shape}
                    </dd>
                  </div>
                  <div>
                    <dt>Stone scale</dt>
                    <dd>{design.size.toFixed(2)}×</dd>
                  </div>
                  <div>
                    <dt>Finish</dt>
                    <dd>{design.finish}</dd>
                  </div>
                  <div>
                    <dt>Renderer</dt>
                    <dd>Independent WebGL</dd>
                  </div>
                </dl>
                <p className="noir-explainer">
                  An original procedural ring, cut gemstone and stone pedestal.
                  A design study inspired by your reference, not a scanned or
                  manufacturing-ready model.
                </p>
                <Button
                  onClick={() => {
                    setDesign(initial);
                    api.current?.reset();
                    setActiveView("Studio");
                    setNotice("Design reset");
                  }}
                >
                  Reset design
                </Button>
              </>
            )}
          </div>
          <footer className="noir-inspector-footer">
            <Button
              className="noir-compare"
              aria-pressed={compare}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setCompare(true);
              }}
              onPointerUp={() => setCompare(false)}
              onPointerCancel={() => setCompare(false)}
              onBlur={() => setCompare(false)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setCompare(true);
                }
              }}
              onKeyUp={() => setCompare(false)}
            >
              ◐ &nbsp; {compare ? "Original design" : "Hold to compare"}
            </Button>
            <span className="noir-local-note">
              No SDK. No checkout. Just your idea.
            </span>
          </footer>
        </aside>
      </main>
      <div className="noir-status" role="status">
        {notice}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<BlackStudio />);
