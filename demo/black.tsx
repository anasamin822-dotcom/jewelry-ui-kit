import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "../controls";
import { IconSymbols } from "../IconSymbols";
import { MetalOrb } from "../studio";
import { JewelryColorPicker } from "../jewelry/JewelryColorPicker";
import { BlackStage, type StageApi, type StudioDesign } from "./BlackStage";
import "../product-kit.css";
import "../product-react.css";
import "../studio.css";
import "./black.css";
const initial: StudioDesign = {
  piece: "Classic Solitaire",
  metal: "#e0e3e8",
  gem: "#1644b8",
  shape: "Round",
  size: 1,
  scene: "Ring",
  finish: "Polished",
};
function SelectionLabel({ text }: { text: string }) {
  const current = useRef<HTMLSpanElement>(null);
  const previous = useRef<HTMLSpanElement>(null);
  const last = useRef(text);
  useEffect(() => {
    if (last.current === text) return;
    if (previous.current) previous.current.textContent = last.current;
    last.current = text;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    previous.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
    current.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 });
  }, [text]);
  return <span className="noir-selection-label"><span ref={previous} aria-hidden="true" className="noir-label-previous" /><span ref={current}>{text}</span></span>;
}
function BlackStudio() {
  const [design, setDesign] = useState<StudioDesign>(initial),
    [step, setStep] = useState(0),
    [collapsed, setCollapsed] = useState(false),
    [rotating, setRotating] = useState(false),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false),
    [notice, setNotice] = useState(""),
    [activeView, setActiveView] = useState("Studio"),
    [cart, setCart] = useState<StudioDesign[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [colorTarget, setColorTarget] = useState("Gem");
  const cartDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (cartOpen) cartDialog.current?.showModal();
    else cartDialog.current?.close();
  }, [cartOpen]);
  const api = useRef<StageApi | null>(null);
  const ring =
    design.piece === "Classic Solitaire" || design.piece === "Halo Setting";
  const steps = ring
    ? ["Piece", "Ring style", "Stone", "Metal", "Colour"]
    : ["Piece", "Stone", "Metal", "Colour"];
  const current = steps[step] || "Colour";
  const panel = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLElement>(null);
  const stepLight = useRef<HTMLSpanElement>(null);
  const previousStep = useRef(step);
  useLayoutEffect(() => {
    const nav = progress.current;
    const moveLight = () => {
      const active = nav?.querySelector<HTMLElement>("[aria-current=step]");
      if (active && stepLight.current) {
        stepLight.current.style.width = active.offsetWidth + "px";
        stepLight.current.style.height = active.offsetHeight + "px";
        stepLight.current.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
      }
    };
    moveLight();
    const observer = new ResizeObserver(moveLight);
    if (nav) observer.observe(nav);
    return () => observer.disconnect();
  }, [step, ring, collapsed]);
  useEffect(() => {
    const direction = step >= previousStep.current ? 1 : -1;
    previousStep.current = step;
    if (!matchMedia("(prefers-reduced-motion:reduce)").matches) panel.current?.animate(
      [{ opacity: 0, transform: `translateX(${direction * 8}px)` }, { opacity: 1, transform: "translateX(0)" }],
      { duration: 200, easing: "ease-out" },
    );
  }, [step]);
  const update = (patch: Partial<StudioDesign>) => {
    setDesign((d) => ({ ...d, ...patch }));
    setNotice("");
  };
  const next = () => setStep((n) => Math.min(n + 1, steps.length - 1));
  const swatchPending = useRef(false);
  const pickSwatch = async (button: HTMLButtonElement, patch: Partial<StudioDesign>) => {
    if (swatchPending.current) return;
    swatchPending.current = true;
    update(patch);
    if (!matchMedia("(prefers-reduced-motion:reduce)").matches) {
      const icon = button.firstElementChild;
      icon?.animate([{ transform: "scale(.92)" }, { transform: "scale(1.025)", offset: .7 }, { transform: "scale(1)" }], { duration: 180, easing: "ease-out" });
      const glow = button.animate([{ filter: "drop-shadow(0 0 0 #a855f700)" }, { filter: "drop-shadow(0 0 5px #a855f766)", offset: .4 }, { filter: "drop-shadow(0 0 0 #a855f700)" }], { duration: 180 });
      await glow.finished.catch(() => {});
    }
    swatchPending.current = false;
    if (button.isConnected) next();
  };
  const finish = () => {
    setCart((items) => [...items, { ...design }]);
    setNotice(design.piece + " added to your cart");
    setCartOpen(true);
  };
  return (
    <div className="noir-app" onPointerDownCapture={(e) => {
      if (e.target instanceof Element && !e.target.closest(".noir-header, dialog")) e.currentTarget.dataset.interacting = "true";
    }} onPointerUpCapture={(e) => { e.currentTarget.dataset.interacting = "false"; }} onPointerCancelCapture={(e) => { e.currentTarget.dataset.interacting = "false"; }} onFocusCapture={(e) => { e.currentTarget.dataset.focused = String(e.target instanceof Element && e.target.matches(":focus-visible")); }} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.dataset.focused = "false"; }}>
      <IconSymbols />
      <header className="noir-header">
        <a
          className="noir-brand"
          href="./jewelry-configurator.html"
          aria-label="Jewelry Configurator home"
        >
          <span className="noir-logo">V</span>
          <span className="noir-brand-stack">VictorShell<small>Jewelry Configurator</small></span>
        </a>
        <Button
          className="noir-cart-button"
          aria-label={`Open cart, ${cart.length} items`}
          onClick={() => setCartOpen(true)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 4h2l2.5 11h11l2-8H6M9 20h.01M18 20h.01" />
          </svg>
          <span>{cart.length}</span>
        </Button>
      </header>
      <main className="noir-layout">
        <section className="noir-stage" aria-label="Live jewelry preview" aria-busy={busy || !ready}><div className="aurora-stage" aria-hidden="true"><i className="aurora-arch arch-one"/><i className="aurora-arch arch-two"/><i className="aurora-arch arch-three"/><i className="aurora-plinth"/>{Array.from({length:12},(_,i)=><i className="aurora-spark" key={i} style={{left:(7+i*19%88)+"%",top:(12+i*13%58)+"%",animationDelay:(i*.63)+"s"}}/>)}</div>
          <BlackStage
            design={design}
            rotating={rotating}
            onReady={() => setReady(true)}
            onError={() => setError(true)}
            onBusy={setBusy}
            onPartSelect={(part) => {
              setCollapsed(false);
              setStep(steps.indexOf(part));
              setNotice("");
            }}
            api={api}
          />
          {(!ready || error) && (
            <div className="noir-loading" role="status">
              {error
                ? "3D is unavailable in this browser. Try a WebGL-enabled browser."
                : "Preparing your studio…"}
            </div>
          )}
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
            <span className="noir-selection-summary" aria-label="Selected materials">
              <SelectionLabel text={ring ? ({ "#1644b8": "Sapphire", "#15865d": "Emerald", "#ac1746": "Ruby", "#e1ebfa": "Diamond" }[design.gem] || "Custom stone") : "Original stones"} />
              <span aria-hidden="true">·</span>
              <SelectionLabel text={({ "#e0e3e8": "Platinum", "#d5af63": "Gold", "#c88d79": "Rose" }[design.metal] || "Custom metal")} />
            </span>
            <span className="noir-orbit-hint">Drag to orbit · Scroll to zoom</span>
          </div>
        </section>
        <aside data-collapsed={collapsed} className="noir-flow" aria-label={"Build your jewelry: " + current + " options"}>
          <div ref={panel} id="studio-options" className="noir-flow-content" key={current} hidden={collapsed}>
            {current === "Piece" ? (
              <div className="noir-flow-choices">
                {(["Ring", "Pendant", "Pearls", "Bracelet"] as const).map(
                  (piece, i) => (
                    <button
                      key={piece}
                      aria-label={piece}
                      aria-pressed={piece === "Ring" ? ring : design.piece === piece}
                      onClick={() => {
                        update({
                          piece: piece === "Ring" ? "Classic Solitaire" : piece,
                          scene: "Ring",
                        });
                        setError(false);
                        setStep(1);
                      }}
                    >
                      <span
                        className={"noir-piece-symbol symbol-" + i}
                        aria-hidden="true"
                      >
                        {["◯", "♧", "◌", "◎"][i]}
                      </span>
                      <span>{piece}</span>
                      <span className="noir-choice-arrow">↗</span>
                    </button>
                  ),
                )}
              </div>
            ) : current === "Ring style" ? (
              <div className="noir-flow-choices two">
                {(["Classic Solitaire", "Halo Setting"] as const).map(
                  (piece) => (
                    <button
                      key={piece}
                      aria-label={piece}
                      aria-pressed={design.piece===piece}
                      onClick={() => {
                        update({ piece });
                        next();
                      }}
                    >
                      <span className="noir-piece-symbol" aria-hidden="true">
                        {piece === "Classic Solitaire" ? "♢" : "✧"}
                      </span>
                      <span>{piece}</span>
                      <span className="noir-choice-arrow">↗</span>
                    </button>
                  ),
                )}
              </div>
            ) : current === "Stone" ? (
              ring ? (
                <div className="noir-stone-step">
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
                        aria-pressed={design.gem===g.color}
                        onClick={(event) => { void pickSwatch(event.currentTarget, { gem: g.color }); }}
                      >
                        <span
                          style={{ "--gem": g.color } as React.CSSProperties}
                        />
                        <small>{g.name}</small>
                      </button>
                    ))}
                  </div>
                  <span className="noir-step-hint">
                    Choose a stone to continue
                  </span>
                </div>
              ) : (
                <div className="noir-fixed-stone">
                  <p>
                    {design.piece === "Pearls"
                      ? "Original pearl strand"
                      : design.piece === "Pendant"
                        ? "Original teardrop stone"
                        : "Original charm set"}
                    <small>
                      This collection model keeps its original stones and
                      display.
                    </small>
                  </p>
                  <Button onClick={next}>Keep original →</Button>
                </div>
              )
            ) : current === "Metal" ? (
              <div className="noir-metals">
                {[
                  { name: "Platinum", tone: "#e0e3e8" },
                  { name: "Gold", tone: "#d5af63" },
                  { name: "Rose", tone: "#c88d79" },
                ].map((m) => (
                  <button
                    key={m.name}
                    aria-label={m.name}
                    aria-pressed={design.metal===m.tone}
                    onClick={(event) => { void pickSwatch(event.currentTarget, { metal: m.tone }); }}
                  >
                    <MetalOrb tone={m.tone} />
                    <span>{m.name}</span>
                    <span className="noir-choice-arrow">↗</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="noir-final-step">
                <div className="noir-custom-zone">
                  <div className="noir-colour-target">
                    {(ring ? ["Gem", "Metal"] : ["Metal"]).map((target) => (
                      <button
                        key={target}
                        aria-pressed={(ring ? colorTarget : "Metal") === target}
                        onClick={() => setColorTarget(target)}
                      >
                        {target} colour
                      </button>
                    ))}
                  </div>
                  <JewelryColorPicker
                    value={
                      ring && colorTarget === "Gem" ? design.gem : design.metal
                    }
                    onChange={(value) =>
                      update(
                        ring && colorTarget === "Gem"
                          ? { gem: value }
                          : { metal: value },
                      )
                    }
                  />
                </div>
                <div className="noir-final-options">
                  {ring && (
                    <select
                      aria-label="Stone cut"
                      value={design.shape}
                      onChange={(e) =>
                        update({
                          shape: e.target.value as StudioDesign["shape"],
                        })
                      }
                    >
                      <option>Round</option>
                      <option>Oval</option>
                      <option value="Emerald">Step</option>
                    </select>
                  )}
                  <select
                    aria-label="Surface finish"
                    value={design.finish}
                    onChange={(e) =>
                      update({
                        finish: e.target.value as StudioDesign["finish"],
                      })
                    }
                  >
                    <option>Polished</option>
                    <option>Satin</option>
                  </select>
                </div>
                <Button
                  variant="primary"
                  disabled={!ready || busy || error}
                  onClick={finish}
                >
                  Add to cart <span>＋</span>
                </Button>
              </div>
            )}
          </div>
          <button className="noir-dock-toggle" aria-label={collapsed ? "Show options" : "Hide options"} aria-expanded={!collapsed} aria-controls="studio-options" onClick={() => setCollapsed(!collapsed)}><span aria-hidden="true">{collapsed ? "⌃" : "⌄"}</span></button>
          <nav ref={progress} className="noir-progress" aria-label="Design steps">
            <span ref={stepLight} className="noir-step-light" aria-hidden="true" />
            {steps.map((label, i) => (
              <button
                key={label}
                data-complete={i<step}
                aria-current={step === i ? "step" : undefined}
                disabled={i > step}
                onClick={() => { setCollapsed(false); setStep(i); }}
              >
                <span className="noir-step-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><defs><linearGradient id={"step-"+i} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f4eaff"/><stop offset=".4" stopColor="#c8a0f4"/><stop offset="1" stopColor="#633b96"/></linearGradient></defs><g fill={"url(#step-"+i+")"} stroke="#ecd9ff" strokeWidth=".8">{label==="Piece"?<><path d="m16 3 12 7v13l-12 7-12-7V10Z"/><path d="m4 10 12 7 12-7M16 17v13" fill="none"/></>:label==="Ring style"?<><ellipse cx="16" cy="20" rx="10" ry="8" fill="none" strokeWidth="5"/><path d="m10 5 3-3h6l3 3-6 8Z"/></>:label==="Stone"?<><path d="M3 11 9 4h14l6 7-13 18Z"/><path d="m3 11 13 18-7-18 7-7 7 7-7 18M3 11h26" fill="none"/></>:label==="Metal"?<><ellipse cx="16" cy="9" rx="12" ry="5"/><path d="M4 9v14c0 7 24 7 24 0V9c0 7-24 7-24 0Z"/><path d="M4 16c0 7 24 7 24 0" fill="none"/></>:<><path d="M16 2C12 9 5 14 5 21a11 11 0 0 0 22 0c0-7-7-12-11-19Z"/><path d="M11 17c-4 5-1 9 3 9" fill="none" strokeWidth="2"/></>}</g></svg></span>
                <span>{label}</span>
              </button>
            ))}
            {step > 0 && (
              <button
                className="noir-back"
                onClick={() => setStep((n) => n - 1)}
              >
                ← Back
              </button>
            )}
          </nav>
        </aside>
      </main>
      {
        <dialog
          aria-label="Your cart"
          ref={cartDialog}
          onCancel={() => setCartOpen(false)}
          className="noir-cart-backdrop"
          onClick={() => setCartOpen(false)}
        >
          <section
            className="noir-cart-panel"

            aria-label="Your cart"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <span className="noir-eyebrow">YOUR COLLECTION</span>
                <h2>
                  Your cart <small>{cart.length}</small>
                </h2>
              </div>
              <Button
                aria-label="Close cart"
                onClick={() => setCartOpen(false)}
              >
                ×
              </Button>
            </header>
            <p className="noir-cart-note">
              Designs are kept for this visit. No checkout or payment.
            </p>
            <div className="noir-cart-items">
              {cart.length === 0 ? (
                <p>Your collection starts with one idea.</p>
              ) : (
                cart.map((item, i) => (
                  <article key={i}>
                    <div
                      className="noir-cart-tone"
                      style={{ background: item.metal }}
                    >
                      <i style={{ background: item.gem }} />
                    </div>
                    <div>
                      <h3>{item.piece}</h3>
                      <p>
                        {item.shape === "Emerald" ? "Step" : item.shape} ·{" "}
                        {item.finish}
                      </p>
                      <div className="noir-cart-swatches">
                        <i style={{ background: item.gem }} />
                        <i style={{ background: item.metal }} />
                      </div>
                    </div>
                    <button
                      aria-label={"Remove " + item.piece}
                      onClick={() =>
                        setCart((items) => items.filter((_, j) => j !== i))
                      }
                    >
                      ×
                    </button>
                  </article>
                ))
              )}
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setCartOpen(false);
                setStep(0);
              }}
            >
              Create another piece →
            </Button>
          </section>
        </dialog>
      }
      <div className="noir-status" role="status">
        {notice}
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<BlackStudio />);
