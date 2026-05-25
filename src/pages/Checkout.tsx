import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check, CreditCard, Heart } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "../lib/cart";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);

  const shipping = subtotal >= 75 ? 0 : 9;
  const total = subtotal + shipping;

  if (items.length === 0 && !placed) {
    return (
      <main className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1
          className="font-serif text-3xl"
          style={{ color: "var(--pink-900)" }}
        >
          Nothing to checkout
        </h1>
        <Link
          to="/products"
          className="mt-6 inline-block underline"
          style={{ color: "var(--pink-600)" }}
        >
          Browse gifts
        </Link>
      </main>
    );
  }

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPlaced(true);
    clear();
    toast.success("Order placed with love 💕");
    setTimeout(() => navigate("/profile/orders"), 1500);
  };

  if (placed) {
    return (
      <main className="max-w-xl mx-auto px-6 py-20 text-center">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white"
          style={{ background: "var(--gradient-rose)" }}
        >
          <Check className="w-8 h-8" />
        </div>
        <h1
          className="mt-6 font-serif text-4xl"
          style={{ color: "var(--pink-900)" }}
        >
          Order confirmed!
        </h1>
        <p className="mt-3 text-muted-foreground">
          We'll wrap it with love and deliver soon. Redirecting…
        </p>
      </main>
    );
  }

  const inputCls = "rounded-xl border px-4 py-3 text-sm outline-none";
  const inputStyle = { borderColor: "var(--pink-200)" } as React.CSSProperties;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <h1
        className="font-serif text-4xl mb-8"
        style={{ color: "var(--pink-900)" }}
      >
        Checkout
      </h1>
      <form
        onSubmit={placeOrder}
        className="grid lg:grid-cols-[1fr_360px] gap-10"
      >
        <div className="space-y-8">
          <section
            className="bg-white rounded-2xl border p-6"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <h2
              className="font-serif text-xl mb-4"
              style={{ color: "var(--pink-900)" }}
            >
              Delivery details
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Recipient name"
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                placeholder="Phone"
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                placeholder="Address line 1"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
              <input
                placeholder="Address line 2"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
              <input
                required
                placeholder="City"
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                placeholder="Postcode"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </section>

          <section
            className="bg-white rounded-2xl border p-6"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <h2
              className="font-serif text-xl mb-4 flex items-center gap-2"
              style={{ color: "var(--pink-900)" }}
            >
              <CreditCard
                className="w-5 h-5"
                style={{ color: "var(--pink-600)" }}
              />{" "}
              Payment
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                required
                placeholder="Card number"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
              <input
                required
                placeholder="MM / YY"
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                placeholder="CVC"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo only — no card will be charged.
            </p>
          </section>
        </div>

        <aside
          className="bg-white rounded-2xl border p-6 h-fit lg:sticky lg:top-24"
          style={{
            borderColor: "var(--pink-100)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2
            className="font-serif text-xl mb-4"
            style={{ color: "var(--pink-900)" }}
          >
            Order summary
          </h2>
          <div className="space-y-3 max-h-64 overflow-auto pr-2">
            {items.map((i) => (
              <div key={i.key} className="flex gap-3 text-sm">
                <img
                  src={i.image}
                  alt={i.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div
                    className="font-medium truncate"
                    style={{ color: "var(--pink-900)" }}
                  >
                    {i.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {i.coverName} × {i.qty}
                  </div>
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--pink-700)" }}
                >
                  ${(i.basePrice + i.coverPrice + i.qrAddon) * i.qty}
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-4 border-t space-y-1.5 text-sm"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free 💕" : `$${shipping}`}</span>
            </div>
            <div
              className="flex justify-between items-baseline pt-2 border-t mt-2"
              style={{ borderColor: "var(--pink-100)" }}
            >
              <span className="text-sm text-muted-foreground">Total</span>
              <span
                className="font-serif text-2xl"
                style={{ color: "var(--pink-700)" }}
              >
                ${total}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold"
            style={{
              background: "var(--gradient-rose)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Heart className="w-4 h-4" fill="currentColor" /> Place Order · $
            {total}
          </button>
        </aside>
      </form>
    </main>
  );
}
