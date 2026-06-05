import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/dataStore";
import { fetchCategories } from "../slice/categorySlice";
import Loader from "./Loader";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Category() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.categories,
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return null;
  }

  if (categories.length === 0) {
    return (
      <div
        className="py-12 text-center text-sm font-medium"
        style={{ color: "var(--pink-700)" }}
      >
        There is no category
      </div>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="w-full mx-auto px-6">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-5">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id || cat.name}
              // FIXED: Removed .toLowerCase() so casing perfectly aligns with your API database expectations
              to={`/products?category=${encodeURIComponent(cat.name)}&page=1`}
              className="group text-center block"
            >
              <div
                className="aspect-square rounded-2xl overflow-hidden mb-2 shadow-sm transition-all duration-300 group-hover:shadow-md"
                style={{ background: "var(--pink-100)" }}
              >
                <img
                  src={
                    cat.categoryImage.startsWith("http")
                      ? cat.categoryImage
                      : BASE_URL + cat.categoryImage
                  }
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <div
                className="text-xs md:text-sm font-medium truncate px-1"
                style={{ color: "var(--pink-900)" }}
                title={cat.description || cat.name}
              >
                {cat.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
