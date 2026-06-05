import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Star,
  Gift,
  Truck,
  PenLine,
  Flower2,
  ChevronRight,
  Cat,
} from "lucide-react";

import { BannerCarousel } from "../components/banner-carousel";
import { PRODUCTS } from "../lib/products";
import mumImg from "../assets/gift-mum.jpg";
import loveImg from "../assets/gift-love.jpg";
import birthdayImg from "../assets/gift-birthday.jpg";
import hamperImg from "../assets/gift-hamper.jpg";
import Category from "./category";
import Occation from "./Occation";
import HighLighted from "./HighLighted";

const OCCASIONS = [
  {
    slug: "love",
    label: "For My Love",
    subtitle: "Romantic gifts that say it all",
    emoji: "💕",
    image: loveImg,
  },
  {
    slug: "couples",
    label: "For Couples",
    subtitle: "Share the moment together",
    emoji: "👫",
    image: hamperImg,
  },
  {
    slug: "mother",
    label: "For Mum",
    subtitle: "Celebrate the one who cares",
    emoji: "🌸",
    image: mumImg,
  },
  {
    slug: "birthday",
    label: "Birthdays",
    subtitle: "Make their day unforgettable",
    emoji: "🎂",
    image: birthdayImg,
  },
];

const PROMISES = [
  {
    icon: Gift,
    title: "Wrapped with love",
    body: "Every gift is hand-wrapped with ribbon, tissue and a personal note.",
  },
  {
    icon: Flower2,
    title: "Fresh & beautiful",
    body: "Flowers, candles and keepsakes curated for meaningful moments.",
  },
  {
    icon: Truck,
    title: "Delivered anywhere",
    body: "Free worldwide shipping over $75. Same-day local delivery available.",
  },
  {
    icon: PenLine,
    title: "Personal message",
    body: "We handwrite your note in beautiful calligraphy on a gift card.",
  },
];

const REVIEWS = [
  {
    quote:
      "My girlfriend was in tears. The roses, the candle, the note — perfect. Best gift I've ever given.",
    author: "Rahul M.",
    for: "Anniversary gift",
  },
  {
    quote:
      "Sent this to my mum on Mother's Day. She called me crying happy tears.",
    author: "James T.",
    for: "Mother's Day bouquet",
  },
  {
    quote:
      "Couples hamper arrived perfectly wrapped. Date night was absolutely magical.",
    author: "Priya & Dev",
    for: "Couples hamper",
  },
];

export default function Home() {
  const bestsellers = PRODUCTS.slice(0, 8);

  return (
    <main className="text-foreground">
      <BannerCarousel />

      <Category />

      <Occation />

      <HighLighted />

      {/* <section className="py-16 lg:py-24">
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
                  <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
                    style={{ color: "var(--pink-600)" }}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
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
        </div>
      </section> */}

      <section
        className="py-16 lg:py-20"
        style={{ background: "var(--gradient-soft)" }}
      >
        <div className="w-full mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span
              className="text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--pink-600)" }}
            >
              Loved by thousands
            </span>
            <h2
              className="mt-3 font-serif text-4xl md:text-5xl"
              style={{ color: "var(--pink-900)" }}
            >
              Real gifts. Real tears. Real joy.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div
                key={r.author}
                className="bg-white rounded-3xl p-7 border"
                style={{
                  boxShadow: "var(--shadow-soft)",
                  borderColor: "var(--pink-100)",
                }}
              >
                <div
                  className="flex gap-0.5 mb-3"
                  style={{ color: "var(--pink-500)" }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  "{r.quote}"
                </p>
                <div
                  className="mt-5 pt-4 border-t"
                  style={{ borderColor: "var(--pink-100)" }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--pink-900)" }}
                  >
                    {r.author}
                  </div>
                  <div className="text-xs text-muted-foreground">{r.for}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
