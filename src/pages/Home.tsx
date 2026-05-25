import { Link } from "react-router-dom";
import { ArrowRight, Heart, Star, Gift, Truck, PenLine, Flower2, ChevronRight } from "lucide-react";

import { BannerCarousel } from "@/components/banner-carousel";
import { PRODUCTS } from "@/lib/products";
import mumImg from "@/assets/gift-mum.jpg";
import loveImg from "@/assets/gift-love.jpg";
import birthdayImg from "@/assets/gift-birthday.jpg";
import hamperImg from "@/assets/gift-hamper.jpg";

const OCCASIONS = [
  { slug: "love", label: "For My Love", subtitle: "Romantic gifts that say it all", emoji: "💕", image: loveImg },
  { slug: "couples", label: "For Couples", subtitle: "Share the moment together", emoji: "👫", image: hamperImg },
  { slug: "mother", label: "For Mum", subtitle: "Celebrate the one who cares", emoji: "🌸", image: mumImg },
  { slug: "birthday", label: "Birthdays", subtitle: "Make their day unforgettable", emoji: "🎂", image: birthdayImg },
];

const PROMISES = [
  { icon: Gift, title: "Wrapped with love", body: "Every gift is hand-wrapped with ribbon, tissue and a personal note." },
  { icon: Flower2, title: "Fresh & beautiful", body: "Flowers, candles and keepsakes curated for meaningful moments." },
  { icon: Truck, title: "Delivered anywhere", body: "Free worldwide shipping over $75. Same-day local delivery available." },
  { icon: PenLine, title: "Personal message", body: "We handwrite your note in beautiful calligraphy on a gift card." },
];

const REVIEWS = [
  { quote: "My girlfriend was in tears. The roses, the candle, the note — perfect. Best gift I've ever given.", author: "Rahul M.", for: "Anniversary gift" },
  { quote: "Sent this to my mum on Mother's Day. She called me crying happy tears.", author: "James T.", for: "Mother's Day bouquet" },
  { quote: "Couples hamper arrived perfectly wrapped. Date night was absolutely magical.", author: "Priya & Dev", for: "Couples hamper" },
];

export default function Home() {
  const bestsellers = PRODUCTS.slice(0, 8);

  return (
    <main className="text-foreground">
      <BannerCarousel />

      <section className="py-12 lg:py-16">
        <div className="w-full mx-auto px-6">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
            {[
              { label: "Cakes", img: birthdayImg, cat: "cakes" },
              { label: "Flowers", img: mumImg, cat: "flowers" },
              { label: "Candles", img: loveImg, cat: "candles" },
              { label: "Hampers", img: hamperImg, cat: "hampers" },
              { label: "Jewelry", img: mumImg, cat: "jewelry" },
              { label: "Personalised", img: hamperImg, cat: "personalised" },
              { label: "Birthday", img: birthdayImg, cat: "" },
              { label: "Anniversary", img: loveImg, cat: "" },
            ].map((c) => (
              <Link key={c.label} to={c.cat ? `/products?category=${c.cat}` : "/products"} className="group text-center">
                <div className="aspect-square rounded-2xl overflow-hidden mb-2 shadow-sm transition-shadow" style={{ background: "var(--pink-100)" }}>
                  <img src={c.img} alt={c.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="text-xs md:text-sm font-medium" style={{ color: "var(--pink-900)" }}>{c.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="w-full mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--pink-600)" }}>Shop by occasion</span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl" style={{ color: "var(--pink-900)" }}>Who is this gift for?</h2>
            <p className="mt-4 text-muted-foreground">Each collection is thoughtfully curated for that special someone in your life.</p>
          </div>

          <div className="mt-12 grid lg:grid-cols-2 gap-5">
            <Link to="/products" className="group relative aspect-[4/5] lg:aspect-auto lg:row-span-2 rounded-[2rem] overflow-hidden transition-shadow" style={{ boxShadow: "var(--shadow-soft)" }}>
              <img src={OCCASIONS[0].image} alt={OCCASIONS[0].label} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(131,24,67,0.8), rgba(131,24,67,0.2), transparent)" }} />
              <div className="absolute bottom-0 p-8 lg:p-10 text-white">
                <div className="text-4xl mb-3">{OCCASIONS[0].emoji}</div>
                <h3 className="font-serif text-3xl lg:text-4xl">{OCCASIONS[0].label}</h3>
                <p className="mt-2 text-white/85 max-w-sm">{OCCASIONS[0].subtitle}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-full bg-white transition-all" style={{ color: "var(--pink-700)" }}>
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>

            {OCCASIONS.slice(1).map((occ) => (
              <Link key={occ.slug} to="/products" className="group relative aspect-[16/10] rounded-[2rem] overflow-hidden transition-shadow" style={{ boxShadow: "var(--shadow-soft)" }}>
                <img src={occ.image} alt={occ.label} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(131,24,67,0.75), rgba(131,24,67,0.1), transparent)" }} />
                <div className="absolute bottom-0 p-6 text-white">
                  <div className="text-2xl mb-1">{occ.emoji}</div>
                  <h3 className="font-serif text-2xl">{occ.label}</h3>
                  <p className="text-sm text-white/80">{occ.subtitle}</p>
                </div>
                <ChevronRight className="absolute top-5 right-5 w-5 h-5 text-white/80" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-y" style={{ background: "var(--pink-50)", borderColor: "var(--pink-100)" }}>
        <div className="w-full mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PROMISES.map((p) => (
            <div key={p.title} className="text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border mb-4 shadow-sm" style={{ borderColor: "var(--pink-200)", color: "var(--pink-600)" }}>
                <p.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg" style={{ color: "var(--pink-900)" }}>{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="w-full mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--pink-600)" }}>Most gifted</span>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl" style={{ color: "var(--pink-900)" }}>Gifts people love to give.</h2>
            </div>
            <Link to="/products" className="text-sm font-medium hover:underline inline-flex items-center gap-1" style={{ color: "var(--pink-700)" }}>
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestsellers.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="group">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm transition-shadow" style={{ background: "var(--pink-100)" }}>
                  <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {p.tag && (
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur" style={{ color: "var(--pink-700)" }}>
                      {p.tag}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center" style={{ color: "var(--pink-600)" }}>
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate" style={{ color: "var(--pink-900)" }}>{p.name}</h3>
                  <span className="text-sm font-semibold" style={{ color: "var(--pink-700)" }}>${p.price}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-current" style={{ color: "var(--pink-500)" }} />
                  {p.rating.toFixed(1)} · {p.reviews}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20" style={{ background: "var(--gradient-soft)" }}>
        <div className="w-full mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--pink-600)" }}>Loved by thousands</span>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl" style={{ color: "var(--pink-900)" }}>Real gifts. Real tears. Real joy.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <div key={r.author} className="bg-white rounded-3xl p-7 border" style={{ boxShadow: "var(--shadow-soft)", borderColor: "var(--pink-100)" }}>
                <div className="flex gap-0.5 mb-3" style={{ color: "var(--pink-500)" }}>
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">"{r.quote}"</p>
                <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--pink-100)" }}>
                  <div className="text-sm font-medium" style={{ color: "var(--pink-900)" }}>{r.author}</div>
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
