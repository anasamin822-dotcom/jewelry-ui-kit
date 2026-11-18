import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { Button } from "../controls";
import { JewelryMark } from "../studio";
import type { Design } from "./JewelryDesign";
import { pieces } from "./catalog";

type CartItem = { id: number; design: Design; finish: string };
export function StudioCart({
  design,
  finish,
  cartRef,
}: {
  design: Design;
  finish: string;
  cartRef: Ref<{ add: () => void }>;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const nextId = useRef(0);
  const add = () => {
    setItems((old) => [
      ...old,
      { id: ++nextId.current, design: { ...design }, finish },
    ]);
    dialog.current?.showModal();
  };
  useImperativeHandle(cartRef, () => ({ add }));
  return (
    <>
      <Button className="kit-cart-add" variant="primary" onClick={add}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          aria-hidden="true"
        >
          <path
            d="M3 4h2l2 11h11l2-8H6M9 20h.01M17 20h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Add to Cart{" "}
        <span
          className="kit-cart-count"
          aria-label={items.length + " items in cart"}
        >
          {items.length}
        </span>
      </Button>
      <dialog
        ref={dialog}
        className="kit-cart-dialog"
        aria-labelledby="kit-cart-title"
      >
        <header>
          <div>
            <span>YOUR SELECTION</span>
            <h2 id="kit-cart-title">Cart ({items.length})</h2>
          </div>
          <Button
            aria-label="Close cart"
            onClick={() => dialog.current?.close()}
          >
            ×
          </Button>
        </header>
        <p className="kit-cart-note">
          Saved for this visit only. No order or payment has been placed.
        </p>
        <div className="kit-cart-items">
          {items.length ? (
            items.map((item) => (
              <article key={item.id}>
                <JewelryMark kind={pieces[item.design.piece].name} />
                <div>
                  <h3>{pieces[item.design.piece].label}</h3>
                  <p>
                    {item.design.metal} · {item.finish}
                  </p>
                  <p>
                    Metal color{" "}
                    <span
                      style={{ background: item.design.tone }}
                      className="kit-cart-swatch"
                    />{" "}
                    {item.design.tone.toUpperCase()}
                  </p>
                  {item.design.piece === 0 && (
                    <>
                      <p>
                        {item.design.shape} · {item.design.carat.toFixed(1)} ct
                        · US {item.design.size}
                      </p>
                      <p>
                        Stone color{" "}
                        <span
                          style={{ background: item.design.gem }}
                          className="kit-cart-swatch"
                        />{" "}
                        {item.design.gem.toUpperCase()}
                      </p>
                      {item.design.engraving && (
                        <p>Engraving: {item.design.engraving}</p>
                      )}
                    </>
                  )}
                </div>
                <Button
                  aria-label={
                    "Remove " + pieces[item.design.piece].label + " from cart"
                  }
                  onClick={() =>
                    setItems((old) =>
                      old.filter((entry) => entry.id !== item.id),
                    )
                  }
                >
                  Remove
                </Button>
              </article>
            ))
          ) : (
            <p>Your cart is empty. Close this panel to keep designing.</p>
          )}
        </div>
        <Button
          className="kit-cart-continue"
          onClick={() => dialog.current?.close()}
        >
          Continue designing
        </Button>
      </dialog>
    </>
  );
}
