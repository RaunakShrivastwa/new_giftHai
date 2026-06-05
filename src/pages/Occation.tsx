import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

interface Product {
  id: number;
}

interface OccasionItem {
  id: number;
  name: string;
  description: string;
  categoryImage: string;
  count: number;
  products: Product[];
  icon: string;
}

const Occation = () => {
  const [occationData, setOccationData] = useState<OccasionItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/categories/by/icons/1")
      .then((res) => res.json())
      .then((data: OccasionItem[]) => setOccationData(data))
      .catch((err) => console.error(err));
  }, []);

  if (occationData.length === 0) return null;

  const BASE_URL = "http://localhost:8080";

  return (
    <section className="py-16 lg:py-20">
      <div className="w-full mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <span
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--pink-600)" }}
          >
            Shop by occasion
          </span>
          <h2
            className="mt-3 font-serif text-4xl md:text-5xl"
            style={{ color: "var(--pink-900)" }}
          >
            Who is this gift for?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Each collection is thoughtfully curated for that special someone in
            your life.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-5">
          <Link
            to="/products"
            className="group relative aspect-[4/5] lg:aspect-auto lg:row-span-2 rounded-[2rem] overflow-hidden transition-shadow"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <img
              src={`${BASE_URL}${occationData[0].categoryImage}`}
              alt={occationData[0].name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(131,24,67,0.8), rgba(131,24,67,0.2), transparent)",
              }}
            />
            <div className="absolute bottom-0 p-8 lg:p-10 text-white">
              <div className="text-4xl mb-3">{occationData[0].icon}</div>
              <h3 className="font-serif text-3xl lg:text-4xl">
                {occationData[0].name}
              </h3>
              <p className="mt-2 text-white/85 max-w-sm">
                {occationData[0].description}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-full bg-white transition-all"
                style={{ color: "var(--pink-700)" }}
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {occationData.slice(1).map((occ) => (
            <Link
              key={occ.id}
              to="/products"
              className="group relative aspect-[16/10] rounded-[2rem] overflow-hidden transition-shadow"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <img
                src={`${BASE_URL}${occ.categoryImage}`}
                alt={occ.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(131,24,67,0.75), rgba(131,24,67,0.1), transparent)",
                }}
              />
              <div className="absolute bottom-0 p-6 text-white">
                <div className="text-2xl mb-1">{occ.icon}</div>
                <h3 className="font-serif text-2xl">{occ.name}</h3>
                <p className="text-sm text-white/80">{occ.description}</p>
              </div>
              <ChevronRight className="absolute top-5 right-5 w-5 h-5 text-white/80" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Occation;
