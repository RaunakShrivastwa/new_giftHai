import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import { fetchProducts, searchProductsByQuery } from "../slice/ProductSlice";
import { AppDispatch, RootState } from "../store/dataStore";

export default function Products() {
  const { categories } = useSelector((state: RootState) => state.categories);
  const dispatch = useDispatch<AppDispatch>();
  const [params, setParams] = useSearchParams();

  // Grab pagination & filter rules from your URL query params
  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const page = parseInt(params.get("page") || "1", 10);

  // Select data from Redux Store
  const { products, loading, error, totalPages, totalElements } = useSelector(
    (state: RootState) => state.products,
  );

  // Dynamic dispatch orchestration depending on parameter states
  useEffect(() => {
    if (q) {
      // If a search query is present, fall back to Elasticsearch tracking
      dispatch(searchProductsByQuery(q));
    } else {
      // Regular paginated database retrieval (with or without category filters)
      dispatch(
        fetchProducts({
          page: page - 1,
          size: 12,
          category: category || undefined,
        }),
      );
    }
  }, [dispatch, page, category, q]);

  // Clean update of query parameters in the address bar
  const setQuery = (next: Record<string, string | undefined>) => {
    const currentParams = Object.fromEntries(params.entries());
    const merged = { ...currentParams, ...next };
    const out: Record<string, string> = {};

    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        out[k] = v;
      }
    });
    setParams(out);
  };

  const safePage = Math.min(page, totalPages || 1);

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
          className="font-serif text-4xl md:text-5xl animate-fade-in"
          style={{ color: "var(--pink-900)" }}
        >
          {category ? category : "All Gifts"}
          {q && (
            <span className="italic" style={{ color: "var(--pink-600)" }}>
              {" "}
              · "{q}"
            </span>
          )}
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalElements} beautiful gifts
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() =>
            setQuery({ category: undefined, page: "1", q: undefined })
          }
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition duration-200 ${
            !category && !q ? "text-white" : "bg-white"
          }`}
          style={
            !category && !q
              ? {
                  background: "var(--pink-600)",
                  borderColor: "var(--pink-600)",
                }
              : { color: "var(--pink-800)", borderColor: "var(--pink-200)" }
          }
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id || c.name}
            onClick={() =>
              setQuery({ category: c.name, page: "1", q: undefined })
            }
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition duration-200 ${
              category === c.name ? "text-white" : "bg-white"
            }`}
            style={
              category === c.name
                ? {
                    background: "var(--pink-600)",
                    borderColor: "var(--pink-600)",
                  }
                : { color: "var(--pink-800)", borderColor: "var(--pink-200)" }
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Network UI Processing */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground animate-pulse">
          Loading beautiful options... 🌸
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          Error loading products: {error}. Please try again later.
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No gifts found. Try another search or category 💕
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group">
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm"
                style={{ background: "var(--pink-100)" }}
              >
                <img
                  src={
                    p.productImage.startsWith("http")
                      ? p.productImage
                      : BASE_URL + p.productImage
                  }
                  alt={p.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {p.bestseller && (
                  <span
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur"
                    style={{ color: "var(--pink-700)" }}
                  >
                    Bestseller
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <h3
                  className="text-sm font-medium truncate max-w-[70%]"
                  style={{ color: "var(--pink-900)" }}
                  title={p.title}
                >
                  {p.title}
                </h3>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--pink-700)" }}
                >
                  ₹{p.price}
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Star
                  className="w-3 h-3 fill-current"
                  style={{ color: "var(--pink-500)" }}
                />
                {p.rating != null ? p.rating.toFixed(1) : "0.0"} ·{" "}
                {p.reviews || 0} reviews
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls - Hidden during explicit text searches */}
      {!loading && !error && !q && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            disabled={safePage === 1}
            onClick={() => setQuery({ page: String(safePage - 1) })}
            className="w-10 h-10 rounded-full bg-white border flex items-center justify-center disabled:opacity-40 transition"
            style={{
              borderColor: "var(--pink-200)",
              color: "var(--pink-700)",
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setQuery({ page: String(n) })}
              className={`w-10 h-10 rounded-full text-sm font-medium transition duration-200 ${
                n === safePage ? "text-white" : "bg-white border"
              }`}
              style={
                n === safePage
                  ? {
                      background: "var(--pink-600)",
                      borderColor: "var(--pink-600)",
                    }
                  : {
                      borderColor: "var(--pink-200)",
                      color: "var(--pink-700)",
                    }
              }
            >
              {n}
            </button>
          ))}

          <button
            disabled={safePage === totalPages}
            onClick={() => setQuery({ page: String(safePage + 1) })}
            className="w-10 h-10 rounded-full bg-white border flex items-center justify-center disabled:opacity-40 transition"
            style={{
              borderColor: "var(--pink-200)",
              color: "var(--pink-700)",
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </main>
  );
}
