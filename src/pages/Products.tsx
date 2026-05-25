import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";

import { PRODUCTS, type Product } from "../lib/products";

const PER_PAGE = 12;
const CATEGORIES = [
  "flowers",
  "cakes",
  "candles",
  "personalised",
  "hampers",
  "jewelry",
] as const;

export default function Products() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const page = parseInt(params.get("page") || "1", 10);

  const filtered = useMemo(() => {
    let list: Product[] = PRODUCTS;
    if (category) list = list.filter((p) => p.category === category);
    if (q) {
      const qq = q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(qq));
    }
    return list;
  }, [q, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const setQuery = (next: Record<string, string | undefined>) => {
    const cur: Record<string, string> = {};
    if (q) cur.q = q;
    if (category) cur.category = category;
    cur.page = String(page);
    const merged = { ...cur, ...next };
    const out: Record<string, string> = {};
    Object.entries(merged).forEach(([k, v]) => {
      if (v) out[k] = v;
    });
    setParams(out);
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="flex flex-col gap-2 mb-8">
        <span
          className="text-xs uppercase tracking-[0.2em]"
          style={{ color: "var(--pink-600)" }}
        >
          Shop
        </span>
        <h1
          className="font-serif text-4xl md:text-5xl"
          style={{ color: "var(--pink-900)" }}
        >
          {category
            ? `${category[0].toUpperCase()}${category.slice(1)}`
            : "All Gifts"}
          {q && (
            <span className="italic" style={{ color: "var(--pink-600)" }}>
              {" "}
              · "{q}"
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} beautiful gifts
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4">
        <button
          onClick={() => setQuery({ category: undefined, page: "1" })}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition ${!category ? "text-white" : "bg-white"}`}
          style={
            !category
              ? {
                  background: "var(--pink-600)",
                  borderColor: "var(--pink-600)",
                }
              : { color: "var(--pink-800)", borderColor: "var(--pink-200)" }
          }
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setQuery({ category: c, page: "1" })}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition capitalize ${category === c ? "text-white" : "bg-white"}`}
            style={
              category === c
                ? {
                    background: "var(--pink-600)",
                    borderColor: "var(--pink-600)",
                  }
                : { color: "var(--pink-800)", borderColor: "var(--pink-200)" }
            }
          >
            {c}
          </button>
        ))}
      </div>

      {paged.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No gifts found. Try another category 💕
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paged.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group">
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm"
                style={{ background: "var(--pink-100)" }}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.tag && (
                  <span
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur"
                    style={{ color: "var(--pink-700)" }}
                  >
                    {p.tag}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h3
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--pink-900)" }}
                >
                  {p.name}
                </h3>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--pink-700)" }}
                >
                  ${p.price}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Star
                  className="w-3 h-3 fill-current"
                  style={{ color: "var(--pink-500)" }}
                />
                {p.rating.toFixed(1)} · {p.reviews}
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            disabled={safePage === 1}
            onClick={() => setQuery({ page: String(safePage - 1) })}
            className="w-10 h-10 rounded-full bg-white border flex items-center justify-center disabled:opacity-40"
            style={{ borderColor: "var(--pink-200)", color: "var(--pink-700)" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setQuery({ page: String(n) })}
              className={`w-10 h-10 rounded-full text-sm font-medium transition ${n === safePage ? "text-white" : "bg-white border"}`}
              style={
                n === safePage
                  ? {
                      background: "var(--gradient-rose)",
                      boxShadow: "var(--shadow-soft)",
                    }
                  : { borderColor: "var(--pink-200)", color: "var(--pink-700)" }
              }
            >
              {n}
            </button>
          ))}
          <button
            disabled={safePage === totalPages}
            onClick={() => setQuery({ page: String(safePage + 1) })}
            className="w-10 h-10 rounded-full bg-white border flex items-center justify-center disabled:opacity-40"
            style={{ borderColor: "var(--pink-200)", color: "var(--pink-700)" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </main>
  );
}
