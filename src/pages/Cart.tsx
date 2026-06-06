import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../lib/cart";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 9;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <ShoppingBag
          className="w-16 h-16 mx-auto"
          style={{ color: "var(--pink-400)" }}
        />
        <h1
          className="mt-6 font-serif text-4xl"
          style={{ color: "var(--pink-900)" }}
        >
          Your cart is empty
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find a gift that says exactly what you feel 💕
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-medium"
          style={{
            background: "var(--gradient-rose)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          Shop gifts <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <h1
        className="font-serif text-4xl mb-8"
        style={{ color: "var(--pink-900)" }}
      >
        Your Cart ({items.length})
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-4">
          {items.map((it) => {
            const linePrice =
              (it.basePrice +
                it.coverPrice +
                it.qrAddon +
                (it.feelingPrice ?? 0)) *
              it.qty;
            return (
              <div
                key={it.key}
                className="bg-white rounded-2xl border p-4 flex gap-4 shadow-sm"
                style={{ borderColor: "var(--pink-100)" }}
              >
                <img
                  src={BASE_URL + it.image}
                  alt={it.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3
                        className="font-medium"
                        style={{ color: "var(--pink-900)" }}
                      >
                        {it.name}
                      </h3>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Wrap: {it.coverName}
                        {it.coverPrice ? ` (+₹${it.coverPrice})` : ""}
                        {it.qrAddon ? ` · QR keepsake (+₹${it.qrAddon})` : ""}
                      </div>
                      {it.message && (
                        <div
                          className="text-xs italic mt-1.5 line-clamp-2"
                          style={{ color: "var(--pink-700)" }}
                        >
                          "{it.message}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => remove(it.key)}
                      className="h-fit"
                      style={{ color: "var(--pink-600)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center rounded-full"
                        style={{ background: "var(--pink-50)" }}
                      >
                        <button
                          onClick={() => setQty(it.key, it.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ color: "var(--pink-700)" }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => setQty(it.key, it.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center"
                          style={{ color: "var(--pink-700)" }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div
                        className="font-semibold"
                        style={{ color: "var(--pink-700)" }}
                      >
                        ₹{linePrice}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/checkout", { state: { checkoutItem: it } })
                      }
                      className="w-full rounded-full border border-pink-200 px-3 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-50"
                    >
                      Buy this gift
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside
          className="bg-white rounded-2xl border p-6 h-fit sticky top-24"
          style={{
            borderColor: "var(--pink-100)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2
            className="font-serif text-2xl mb-4"
            style={{ color: "var(--pink-900)" }}
          >
            Order summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free 💕" : `₹${shipping}`}</span>
            </div>
          </div>
          <div
            className="mt-4 pt-4 border-t flex justify-between items-baseline"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <span className="text-sm text-muted-foreground">Total</span>
            <span
              className="font-serif text-2xl"
              style={{ color: "var(--pink-700)" }}
            >
              ₹{total}
            </span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold"
            style={{
              background: "var(--gradient-rose)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/products"
            className="mt-3 w-full inline-flex items-center justify-center text-sm hover:underline"
            style={{ color: "var(--pink-700)" }}
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
