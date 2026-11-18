import { GemMark } from "../studio";
import { useRef, useState, type Ref } from "react";
import { cleanDesign } from "./JewelryDesign";
import type { Design } from "./JewelryDesign";
import { JewelryColorPicker } from "./JewelryColorPicker";
export function DesignTools({
  captureFrame,
  category,
  design,
  onChange,
  onApply,
  onCamera,
  baseline,
  onBaseline,
  comparing,
  onCompare,
  onAddToCart,
}: {
  captureFrame: (standardView?: boolean) => string;
  category: string;
  design: Design;
  onChange: (d: Design) => void;
  onApply: (d: Design) => void;
  onCamera: () => void;
  baseline: Design | null;
  onBaseline: () => void;
  comparing: boolean;
  onCompare: () => void;
  onAddToCart: () => void;
}) {
  const [notice, setNotice] = useState(""),
    [saved] = useState<Design[]>(() => {
      try {
        const a = JSON.parse(localStorage.getItem("jewelry-designs") || "[]");
        return Array.isArray(a) ? a.slice(0, 5).map(cleanDesign) : [];
      } catch {
        return [];
      }
    }),
    [guide, setGuide] = useState(false),
    dialog = useRef<HTMLDialogElement>(null);
  const change = (x: Partial<Design>) => onChange({ ...design, ...x });
  const ring = design.piece === 0;
  const share = async () => {
    const url =
      location.origin +
      location.pathname +
      "#" +
      encodeURIComponent(JSON.stringify(design));
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Design link copied");
    } catch {
      setNotice("Copy the design link below");
    }
    setLink(url);
  };
  const [link, setLink] = useState("");
  const download = () => {
    try {
      const a = document.createElement("a");
      a.href = captureFrame();
      a.download = "jewelry-design.png";
      a.click();
      setNotice("Image downloaded");
    } catch {
      setNotice("Preview is not ready. Try again.");
    }
  };
  return (
    <div className="js-feature-tools">
      {["Stone", "Engrave", "Size"].includes(category) && !ring ? (
        <div className="js-tool-disabled">
          These tools customize the ring.{" "}
          <button onClick={() => onApply({ ...design, piece: 0 })}>
            Switch to ring
          </button>
        </div>
      ) : category === "Stone" ? (
        <StonePanel design={design} change={change} />
      ) : category === "Engrave" ? (
        <EngravingPanel design={design} change={change} onCamera={onCamera} />
      ) : category === "Size" ? (
        <SizePanel
          design={design}
          change={change}
          onOpenGuide={() => {
            setGuide(true);
            dialog.current?.showModal();
          }}
        />
      ) : category === "Compare" ? (
        <ComparePanel
          onBaseline={onBaseline}
          setNotice={setNotice}
          baseline={baseline}
          comparing={comparing}
          onCompare={onCompare}
        />
      ) : category === "Share" ? (
        <SharePanel
          onAddToCart={onAddToCart}
          share={share}
          download={download}
          saved={saved}
          onApply={onApply}
          link={link}
        />
      ) : null}
      <span className="js-tool-notice" role="status">
        {notice}
      </span>
      <RingSizeGuide
        dialogRef={dialog}
        guide={guide}
        onClose={() => {
          dialog.current?.close();
          setGuide(false);
        }}
      />
    </div>
  );
}

type PanelProps = {
  design: Design;
  change: (value: Partial<Design>) => void;
  onCamera: () => void;
  onOpenGuide: () => void;
  onBaseline: () => void;
  setNotice: (value: string) => void;
  baseline: Design | null;
  comparing: boolean;
  onCompare: () => void;
  onAddToCart: () => void;
  share: () => void;
  download: () => void;
  saved: Design[];
  onApply: (value: Design) => void;
  link: string;
};
export function StonePanel({
  design,
  change,
}: Pick<PanelProps, "design" | "change">) {
  return (
    <>
      <div className="kit-gem-shapes" role="group" aria-label="Stone shape">
        {["Round", "Oval", "Pear"].map((shape) => (
          <button
            key={shape}
            aria-pressed={design.shape === shape}
            onClick={() => change({ shape })}
          >
            <GemMark shape={shape} />
            <span>{shape}</span>
          </button>
        ))}
      </div>
      <label className="kit-select-shape">
        Shape
        <select
          aria-label="Gem shape"
          value={design.shape}
          onChange={(e) => change({ shape: e.target.value })}
        >
          {["Round", "Oval", "Pear"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <div className="js-gem-color">
        <JewelryColorPicker
          value={design.gem}
          onChange={(gem) => change({ gem })}
        />
      </div>
      <label>
        Carat {design.carat.toFixed(1)} ct
        <input
          aria-label="Carat size"
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={design.carat}
          onChange={(e) => change({ carat: Number(e.target.value) })}
        />
      </label>
      <small>Approximate visual carat scale.</small>
    </>
  );
}

export function EngravingPanel({
  design,
  change,
  onCamera,
}: Pick<PanelProps, "design" | "change" | "onCamera">) {
  return (
    <>
      <label>
        Engraving · {design.engraving.length}/18
        <input
          aria-label="Engraving text"
          maxLength={18}
          value={design.engraving}
          placeholder="Your words"
          onChange={(e) => change({ engraving: e.target.value })}
        />
      </label>
      <button onClick={onCamera}>Inspect text</button>
      <small></small>
    </>
  );
}

export function SizePanel({
  design,
  change,
  onOpenGuide,
}: Pick<PanelProps, "design" | "change" | "onOpenGuide">) {
  return (
    <>
      <label>
        US ring size {design.size}
        <input
          aria-label="Ring size"
          type="range"
          min="5"
          max="9"
          step="1"
          value={design.size}
          onChange={(e) => change({ size: Number(e.target.value) })}
        />
      </label>
      <button onClick={onOpenGuide}>Size chart</button>
      <small>Not a true-to-size screen ruler.</small>
    </>
  );
}

export function ComparePanel({
  onBaseline,
  setNotice,
  baseline,
  comparing,
  onCompare,
}: Pick<
  PanelProps,
  "onBaseline" | "setNotice" | "baseline" | "comparing" | "onCompare"
>) {
  return (
    <>
      <button
        onClick={() => {
          onBaseline();
          setNotice("Current design captured for comparison");
        }}
      >
        Capture design A
      </button>
      <button disabled={!baseline} aria-pressed={comparing} onClick={onCompare}>
        {comparing ? "Exit compare" : "Compare A / current"}
      </button>
      <small>
        {baseline
          ? "Captured A. Change any options to make design B."
          : "Capture A, then change your current design."}
      </small>
    </>
  );
}

export function SharePanel({
  onAddToCart,
  share,
  download,
  saved,
  onApply,
  link,
}: Pick<
  PanelProps,
  "onAddToCart" | "share" | "download" | "saved" | "onApply" | "link"
>) {
  return (
    <>
      <button onClick={onAddToCart}>Add to Cart</button>
      <button onClick={share}>Copy link</button>
      <button onClick={download}>Download image</button>
      {saved.length > 0 && (
        <label>
          Saved
          <select
            aria-label="Restore saved design"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value !== "") onApply(saved[Number(e.target.value)]);
            }}
          >
            <option value="" disabled>
              Restore...
            </option>
            {saved.map((d, i) => (
              <option value={i} key={i}>
                Design {i + 1} · {d.metal}
              </option>
            ))}
          </select>
        </label>
      )}
      {link && (
        <input
          aria-label="Design share link"
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
        />
      )}
    </>
  );
}

export function RingSizeGuide({
  dialogRef,
  guide,
  onClose,
}: {
  dialogRef: Ref<HTMLDialogElement>;
  guide: boolean;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      data-guide-open={guide}
      className="js-size-dialog"
      aria-labelledby="size-heading"
      onCancel={onClose}
    >
      <div>
        <h2 id="size-heading">Ring size guide</h2>
        <button aria-label="Close size guide" onClick={onClose}>
          ×
        </button>
      </div>
      <p>
        Measure the inside diameter of a ring that fits the same finger. Confirm
        your fit with a jeweler.
      </p>
      <table>
        <caption>Approximate US size conversion</caption>
        <thead>
          <tr>
            <th>US size</th>
            <th>Inside diameter</th>
          </tr>
        </thead>
        <tbody>
          {[
            [5, 15.7],
            [6, 16.5],
            [7, 17.3],
            [8, 18.1],
            [9, 19],
          ].map(([s, mm]) => (
            <tr key={s}>
              <td>{s}</td>
              <td>{mm.toFixed(1)} mm</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>This screen is not a calibrated ring sizer.</p>
    </dialog>
  );
}
