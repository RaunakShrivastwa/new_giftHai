import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchFilter from "../util/SearchFilter";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BannerType {
  id: number;
  tagName: string;
  title: string;
  description: string;
  action: string;
  bannerImage: string;
}

export function BannerCarousel() {
  const [slides, setSlides] = useState<BannerType[]>([]);
  const [current, setCurrent] = useState(0);

  // Load banners
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/banner`);
        setSlides(res.data || []);
      } catch (error) {
        console.error("Failed to load banners:", error);
      }
    };

    loadSlides();
  }, []);

  // Auto slide
  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="w-full h-[420px] sm:h-[500px] md:h-[600px] flex items-center justify-center bg-gray-100">
        <h2 className="text-xl font-semibold text-gray-500">
          Loading banners...
        </h2>
      </section>
    );
  }

  return (
    <section className="relative w-full">
      {/* Outer Slider Wrapper */}
      <div className="relative w-full h-[420px] sm:h-[500px] md:h-[600px] overflow-hidden">
        {/* --- SEARCH FILTER: FIXED TOP CENTER --- */}
        <div className="absolute small_filter top-6 md:top-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-[90%] sm:max-w-md px-4">
          <SearchFilter />
        </div>

        {slides.map((sl, idx) => (
          <div
            key={sl.id}
            className={`absolute inset-0 transition-all duration-700 ${
              idx === current
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            {/* Background Image */}
            <img
              src={`${BASE_URL}${sl.bannerImage}`}
              alt={sl.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

            {/* Content */}
            {/* Added pt-16 to prevent the top-centered search bar from overlapping slide text on mobile */}
            <div className="relative z-10 h-full flex items-center px-6 sm:px-12 lg:px-20 pt-16 sm:pt-0">
              <div className="max-w-2xl text-white w-full">
                <span
                  className="inline-flex items-center px-4 py-1 rounded-full bg-white/90 text-xs uppercase tracking-[0.25em] font-bold"
                  style={{ color: "var(--pink-700)" }}
                >
                  {sl.tagName}
                </span>

                <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  {sl.title}
                </h1>

                <p className="mt-3 text-base sm:text-xl text-white/90 leading-relaxed">
                  {sl.description}
                </p>

                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-sm font-semibold shadow-xl hover:scale-105 transition-all duration-300"
                  style={{ color: "var(--pink-700)" }}
                >
                  {sl.action}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Left Button */}
        <button
          onClick={() =>
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 transition"
        >
          <ChevronLeft
            className="w-5 h-5"
            style={{ color: "var(--pink-700)" }}
          />
        </button>

        {/* Right Button */}
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 transition"
        >
          <ChevronRight
            className="w-5 h-5"
            style={{ color: "var(--pink-700)" }}
          />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
