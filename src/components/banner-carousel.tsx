import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SLIDES = [
  {
    tag: "Anniversary",
    title: "Celebrate Your Bond",
    accent: "Beautiful Anniversary Gifts",
    image: "https://wallpapercave.com/wp/wp4411048.jpg",
    cta: "Gift Now",
  },
  {
    tag: "Mother's Day",
    title: "She Gave You Everything",
    accent: "Give Her A Moment To Cherish",
    image: "https://wallpapercave.com/wp/tOOxqW1.jpg",
    cta: "Shop For Mum",
  },
  {
    tag: "Birthdays",
    title: "Make Their Day",
    accent: "Unforgettable",
    image: "https://wallpapercave.com/wp/wp15502547.jpg",
    cta: "Birthday Gifts",
  },
  {
    tag: "2 Hour Delivery",
    title: "Last Minute? No Problem.",
    accent: "Express Pink Gifts in 2 Hours",
    image: "https://wallpapercave.com/wp/wp13255178.jpg",
    cta: "Shop Express",
  },
];

export function BannerCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full">
      <div className="relative w-full h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden">
        {SLIDES.map((sl, idx) => (
          <div
            key={sl.tag}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src={sl.image}
              alt={sl.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
            <div className="relative h-full w-full px-6 sm:px-12 lg:px-20 flex flex-col justify-center max-w-3xl">
              <span
                className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-[10px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: "var(--pink-700)" }}
              >
                {sl.tag}
              </span>
              <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight drop-shadow-lg">
                {sl.title}
              </h1>
              <p
                className="mt-3 font-serif italic text-xl sm:text-2xl md:text-3xl leading-tight drop-shadow"
                style={{ color: "var(--pink-100)" }}
              >
                {sl.accent}
              </p>
              <Link
                to="/products"
                className="mt-6 inline-flex w-fit items-center gap-2 px-7 py-3.5 rounded-full bg-white font-semibold shadow-xl transition"
                style={{ color: "var(--pink-700)" }}
              >
                {sl.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        <button
          onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center z-10"
          style={{ color: "var(--pink-700)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setI((p) => (p + 1) % SLIDES.length)}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center z-10"
          style={{ color: "var(--pink-700)" }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
