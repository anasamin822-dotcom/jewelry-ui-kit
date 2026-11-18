import { jewelryPalette, jewelryMetals } from "./palette";
import { StudioHeader, StudioDock } from "./StudioChrome";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { Button, IconButton } from "../controls";
import { readDesign, initialDesign } from "./JewelryDesign";
import type { Design } from "./JewelryDesign";
import { DesignTools } from "./JewelryTools";
import { JewelryColorPicker } from "./JewelryColorPicker";
import { IconSymbols } from "../IconSymbols";
import { BackgroundArt } from "./StudioBackground";
import { pieces } from "./catalog";
import { StudioCart } from "./StudioCart";
import "../product-kit.css";
import "../product-react.css";
import "./stage.css";
import "./background.css";
import "../studio.css";
import {
  ChoiceCard,
  JewelryMark,
  MetalOrb,
  SpecCard,
  SectionHeading,
  StudioHint,
} from "../studio";
const metalTones: string[] = [
  jewelryPalette.gold,
  jewelryPalette.silver,
  jewelryPalette.roseGold,
];
const metals = jewelryMetals;
export type JewelryStageProps = {
  sdkMode: boolean;
  lite: boolean;
  reduced: boolean;
  piece: number;
  tone: string;
  finish: string;
  paused: boolean;
  zoom: number;
  reset: number;
  view: string;
  onReady: () => void;
  design: Design;
};
export type JewelryStudioProps = {
  renderStage: (props: JewelryStageProps) => ReactNode;
  captureFrame: (standardView?: boolean) => string;
};
export function JewelryStudio({
  renderStage,
  captureFrame,
}: JewelryStudioProps) {
  const [lite] = useState(() => {
      try {
        return (
          localStorage.getItem("jewelry-quality") !== "full" &&
          (innerWidth < 768 ||
            localStorage.getItem("jewelry-quality") === "lite")
        );
      } catch {
        return innerWidth < 768;
      }
    }),
    [previous, setPrevious] = useState(""),
    [start] = useState(readDesign),
    [stone, setStone] = useState(() => readDesign()),
    [baselineImage, setBaselineImage] = useState(""),
    [baseline, setBaseline] = useState<Design | null>(null),
    [compare, setCompare] = useState(false);
  const cartRef = useRef<{ add: () => void }>(null);
  const [hint, setHint] = useState(() => {
    try {
      return !localStorage.getItem("studio-hint-seen");
    } catch {
      return true;
    }
  });
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if (
        (event.target as HTMLElement).closest(
          "input,textarea,select,button,dialog",
        ) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (event.code === "Space") {
        event.preventDefault();
        setPaused((v) => !v);
      }
      if (["1", "2", "3"].includes(event.key)) {
        setView(["Front", "Profile", "Top"][Number(event.key) - 1]);
        setPaused(true);
      }
      if (event.key.toLowerCase() === "r") {
        setView("Front");
        setZoom(4.9);
        setReset((n) => n + 1);
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, []);
  const [metal, setMetal] = useState(start.metal),
    [category, setCategory] = useState("Piece"),
    [view, setView] = useState("Front");
  const [piece, setPiece] = useState(start.piece),
    [tone, setTone] = useState(start.tone),
    [finish, setFinish] = useState("Satin"),
    [paused, setPaused] = useState(false),
    [zoom, setZoom] = useState(4.9),
    [reset, setReset] = useState(0),
    [ready, setReady] = useState(false),
    [visible, setVisible] = useState(!document.hidden);
  const [reduced, setReduced] = useState(
    matchMedia("(prefers-reduced-motion:reduce)").matches,
  );
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion:reduce)"),
      change = () => setReduced(m.matches),
      vis = () => setVisible(!document.hidden);
    m.addEventListener("change", change);
    document.addEventListener("visibilitychange", vis);
    return () => {
      m.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  const design: Design = useMemo(
    () => ({ ...stone, piece, tone, metal }),
    [stone, piece, tone, metal],
  );
  const applyDesign = (d: Design) => {
    if (d.piece !== piece) setReady(false);
    setPiece(d.piece);
    setMetal(d.metal);
    setTone(d.tone);
    setStone(d);
    setZoom(4.9);
    setReset((n) => n + 1);
  };
  const loaded = useCallback(() => {
    requestAnimationFrame(() => setReady(true));
  }, []);
  const capturePrevious = () => {
    try {
      setPrevious(captureFrame());
    } catch {
      setPrevious("");
    }
  };
  const resetAll = () => {
    setView("Front");
    setMetal("Gold");
    setTone(metalTones[0]);
    setStone(initialDesign);
    setFinish("Satin");
    setZoom(4.9);
    setReset((n) => n + 1);
  };
  const toneName =
    ["Yellow gold", "White gold", "Rose gold"][metalTones.indexOf(tone)] ||
    tone.toUpperCase();
  return (
    <div className="js-app kit-atelier">
      <IconSymbols />
      <StudioHeader>
        <StudioCart cartRef={cartRef} design={design} finish={finish} />
      </StudioHeader>
      <main className="js-workspace">
        <section className="js-stage" aria-label="Interactive jewelry preview">
          <BackgroundArt kind={3} paused={paused || reduced || !visible} />
          <div className="js-orbit orbit-a" />
          <div className="js-orbit orbit-b" />
          <div className="js-stage-label">
            <span className="js-eyebrow">
              {pieces[piece].label.toUpperCase() + " / 0" + (piece + 1)}
            </span>
            <h1>
              Your signature.
              <br />
              <em>Every detail.</em>
            </h1>
          </div>
          <div className="js-podium" />
          <div className="kit-stage-index">
            <span>COLLECTION 01</span>
            <strong>{pieces[piece].name}</strong>
            <span>↗ INTERACTIVE 3D</span>
          </div>
          {hint && (
            <StudioHint
              onClose={() => {
                setHint(false);
                try {
                  localStorage.setItem("studio-hint-seen", "1");
                } catch {
                  /* Optional storage. */
                }
              }}
            />
          )}
          <div className="kit-stage-spec">
            <span style={{ background: tone }} />
            {metal}
            <i />{" "}
            {piece === 0
              ? `${stone.shape} / ${stone.carat.toFixed(1)} ct`
              : "Studio edition"}
          </div>
          <nav className="js-camera-presets" aria-label="Camera angle">
            {["Front", "Profile", "Top"].map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  setPaused(true);
                }}
              >
                {v}
              </button>
            ))}
            <button
              onClick={() => {
                setZoom(3.2);
                setPaused(true);
              }}
            >
              Close-up
            </button>
          </nav>
          <div
            className={
              "js-canvas " +
              (ready ? "ready" : "") +
              (compare && baseline ? " js-compare-canvas" : "")
            }
          >
            {renderStage({
              sdkMode: false,
              lite,
              reduced,
              piece,
              tone,
              finish,
              paused: paused || reduced || !visible,
              zoom: compare && baseline ? 4.9 : zoom,
              reset,
              view,
              onReady: loaded,
              design,
            })}
            {compare && baseline && (
              <>
                <span className="js-current-label">Current B</span>
                <div className="js-compare-pane">
                  <span>Saved A</span>
                  <img src={baselineImage} alt="Captured design A" />
                </div>
              </>
            )}
          </div>
          {previous && (
            <img
              className={"js-previous " + (ready ? "done" : "")}
              src={previous}
              alt=""
            />
          )}
          {!ready && (
            <div className="js-loading js-skeleton" role="status">
              <span className="js-skeleton-ring" />
              <span>
                Jewelry Studio<small>Preparing your jewelry</small>
              </span>
            </div>
          )}
          <div
            className="js-viewbar glass"
            role="group"
            aria-label="Preview camera controls"
          >
            <Button
              className="icon-btn"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "Resume motion" : "Pause motion"}
              aria-pressed={paused}
            >
              <span aria-hidden="true">{paused ? "▷" : "Ⅱ"}</span>
            </Button>
            <IconButton
              icon="search"
              label="Zoom in"
              onClick={() => setZoom((v) => Math.max(3.2, v - 0.5))}
              disabled={zoom <= 3.2}
            />
            <Button
              className="icon-btn"
              aria-label="Zoom out"
              onClick={() => setZoom((v) => Math.min(6.5, v + 0.5))}
              disabled={zoom >= 6.5}
            >
              <span aria-hidden="true">−</span>
            </Button>
            <IconButton
              icon="rotate"
              label="Reset preview"
              onClick={resetAll}
            />
          </div>
          <p className="js-gesture">Drag to rotate · Pinch to zoom</p>
        </section>
        <aside
          className="js-inspector panel"
          data-category={category}
          aria-label="Jewelry product controls"
        >
          <div className="kit-inspector-intro">
            <SectionHeading
              eyebrow="DESIGN WORKSPACE"
              title="Make it personal."
              trailing={<span className="kit-step-counter">01 / 04</span>}
            />
            <SpecCard
              name={pieces[piece].label}
              metal={metal}
              shape={stone.shape}
              carat={stone.carat}
              size={stone.size}
              tone={tone}
              ring={piece === 0}
            />
          </div>
          <div
            className="js-option-panel"
            id="js-options"
            role="tabpanel"
            aria-labelledby={"js-category-" + category}
            key={category}
          >
            <SectionHeading
              eyebrow="CUSTOMIZE"
              title={
                category === "Piece"
                  ? "Choose your piece"
                  : category === "Metal"
                    ? "The perfect finish"
                    : category === "Stone"
                      ? "A brilliant detail"
                      : category === "Share"
                        ? "Keep your creation"
                        : category
              }
              trailing={<span className="kit-live-dot">LIVE</span>}
            />
            {category === "Piece" ? (
              <div
                className="js-option-strip"
                role="group"
                aria-label="Jewelry piece"
              >
                {pieces.map((p, i) =>
                  i === 3 ? null : (
                    <ChoiceCard
                      key={p.file}
                      selected={i === piece}
                      label={p.name}
                      detail={
                        i === 0
                          ? "Your signature"
                          : i === 1
                            ? "Light & delicate"
                            : i === 2
                              ? "A modern classic"
                              : "A little character"
                      }
                      onClick={() => {
                        if (i !== piece) {
                          capturePrevious();
                          setReady(false);
                          setPiece(i);
                          setView("Front");
                          setZoom(4.9);
                          setReset((n) => n + 1);
                        }
                      }}
                    >
                      <JewelryMark kind={p.name} />
                    </ChoiceCard>
                  ),
                )}
              </div>
            ) : category === "Metal" ? (
              <div className="js-option-strip" role="group" aria-label="Metal">
                {metals.map((m) => (
                  <ChoiceCard
                    key={m.name}
                    selected={metal === m.name}
                    label={m.name}
                    detail={m.finish}
                    onClick={() => {
                      setMetal(m.name);
                      setTone(m.color);
                      setFinish(m.finish);
                    }}
                  >
                    <MetalOrb tone={m.color} />
                  </ChoiceCard>
                ))}
              </div>
            ) : category === "Colour" ? (
              <div className="js-color-option">
                <JewelryColorPicker value={tone} onChange={setTone} />
                <span>{toneName}</span>
              </div>
            ) : (
              <DesignTools
                captureFrame={captureFrame}
                category={category}
                onAddToCart={() => cartRef.current?.add()}
                design={design}
                onChange={setStone}
                onApply={applyDesign}
                onCamera={() => {
                  setHint(false);
                  setView("Engraving");
                  setZoom(3.2);
                  setPaused(true);
                }}
                baseline={baseline}
                onBaseline={() => {
                  setBaselineImage(captureFrame(true));
                  setBaseline({ ...design });
                }}
                comparing={compare}
                onCompare={() => {
                  setView("Front");
                  setPaused(true);
                  setCompare((v) => !v);
                }}
              />
            )}
            {category === "Metal" && (
              <div
                className="kit-finish-row"
                role="group"
                aria-label="Surface finish"
              >
                {["Satin", "Chrome", "Matte"].map((value) => (
                  <button
                    key={value}
                    aria-pressed={finish === value}
                    onClick={() => setFinish(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
            <div className="js-selection-summary" aria-live="polite">
              {pieces[piece].label} <i /> {metal} <i /> {tone.toUpperCase()}
              {piece === 0 && (
                <>
                  {" "}
                  <i /> US {stone.size}
                </>
              )}
            </div>
          </div>
          <div className="kit-keyboard-note">
            <span>STUDIO SHORTCUTS</span>
            <span>
              <kbd>1</kbd>
              <kbd>2</kbd>
              <kbd>3</kbd> views · <kbd>R</kbd> reset
            </span>
          </div>
          <StudioDock
            category={category}
            onChange={(value) => {
              setCategory(value);
              setHint(false);
            }}
          />
        </aside>
      </main>
    </div>
  );
}
