import { useState, useEffect, useRef, type CSSProperties } from "react";
export function BackgroundArt({
  kind,
  paused = false,
}: {
  kind: number;
  paused?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "100px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={
        "background-art background-" +
        (kind + 1) +
        (paused || !inView ? " background-still" : "")
      }
      aria-hidden="true"
    >
      <div className="bg-mist mist-a" />
      <div className="bg-mist mist-b" />
      <div className="bg-folds">
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} style={{ "--i": i } as CSSProperties} />
        ))}
      </div>
      <div className="bg-stars">
        {Array.from({ length: 28 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--i": i,
                left: `${(i * 37 + 3) % 98}%`,
                top: `${(i * 29 + 9) % 96}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <svg
        className="bg-contours"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 18 }, (_, i) => (
          <path
            key={i}
            d={`M -200 ${90 + i * 25} C 150 ${-180 + i * 33}, 300 ${700 - i * 17}, 620 ${340 + i * 12} S 1050 ${-80 + i * 34}, 1450 ${100 + i * 24}`}
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </svg>
      <div className="bg-grid-plane" />
      <div className="bg-horizon" />
      <div className="bg-vignette" />
    </div>
  );
}
