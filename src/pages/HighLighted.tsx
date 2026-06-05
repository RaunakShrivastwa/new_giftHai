import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Star } from "lucide-react"; // Assuming lucide-react for icons
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 1. Define the shape of the data coming directly from your API
interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  productImage: string;
  color: string;
  tagline: string;
  rating: number;
  reviews: number;
  bestseller: boolean;
}

// 2. Define the shape of the product data your UI component expects
interface FormattedProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  tag: string | null;
}

const HighLighted: React.FC = () => {
  // Define states with explicit TypeScript types
  const [bestsellers, setBestsellers] = useState<FormattedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/v1/products/review/2?page=0&size=13  `)
      .then((res) => res.json())
      .then((data: ApiProduct[]) => {
        // Filter and transform backend keys to match the frontend UI contracts
        const formattedBestsellers: FormattedProduct[] = data.content
          .filter((product) => product.bestseller === true)
          .map((product) => ({
            id: product.id,
            name: product.title, // API 'title' mapped to UI 'name'
            image: product.productImage, // API 'productImage' mapped to UI 'image'
            price: product.price,
            rating: product.rating,
            reviews: product.reviews,
            tag: product.bestseller ? "Bestseller" : null,
          }));

        setBestsellers(formattedBestsellers);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Loading gifts...
      </div>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="w-full mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--pink-600)" }}
            >
              Most gifted
            </span>
            <h2
              className="mt-3 font-serif text-4xl md:text-5xl"
              style={{ color: "var(--pink-900)" }}
            >
              Gifts people love to give.
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-medium hover:underline inline-flex items-center gap-1"
            style={{ color: "var(--pink-700)" }}
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {bestsellers.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="group">
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm transition-shadow"
                style={{ background: "var(--pink-100)" }}
              >
                <img
                  src={BASE_URL + p.image}
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
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
                  style={{ color: "var(--pink-600)" }}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h3
                  className="text-sm font-medium truncate max-w-[70%]"
                  style={{ color: "var(--pink-900)" }}
                  title={p.name}
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
      </div>
    </section>
  );
};

export default HighLighted;
