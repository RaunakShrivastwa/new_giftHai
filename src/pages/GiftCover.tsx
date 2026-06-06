import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

type ApiGiftCover = {
  id: number;
  coverImage: string;
  name: string;
  description: string;
  price: number;
  usedUser: number;
};

export type SelectedGiftCover = ApiGiftCover & {
  image: string;
};

type Props = {
  setGiftCover: (cover: SelectedGiftCover | null) => void;
  onClose: () => void;
};

const GiftCover = ({ setGiftCover, onClose }: Props) => {
  const [selectedCover, setSelectedCover] = useState<ApiGiftCover | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [covers, setCovers] = useState<ApiGiftCover[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchGiftCover = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/gift/covers`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setCovers(Array.isArray(data) ? data : data.data ?? []);
      } catch (error) {
        console.error("Error fetching gift cover:", error);
        toast.error("Failed to load gift covers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGiftCover();
  }, [API_BASE_URL, token]);

  const handleContinue = () => {
    if (!selectedCover) {
      toast.error("Please select a gift cover before continuing.");
      return;
    }

    setGiftCover({
      ...selectedCover,
      image: `${API_BASE_URL}${selectedCover.coverImage}`,
    });
    onClose();
  };

  return (
    <div
      className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white"
      style={{ maxHeight: "90vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2
            className="font-serif text-2xl font-semibold"
            style={{ color: "var(--pink-900)" }}
          >
            Select Gift Cover
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose one premium cover for your gift
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 hover:bg-black/5"
          aria-label="Close gift cover modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-5" style={{ maxHeight: "66vh" }}>
        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--pink-600)" }}
            />
          </div>
        ) : covers.length === 0 ? (
          <div className="flex min-h-60 items-center justify-center text-sm text-muted-foreground">
            No gift covers available right now.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {covers.map((cover) => {
              const isSelected = selectedCover?.id === cover.id;

              return (
                <button
                  type="button"
                  onClick={() => setSelectedCover(cover)}
                  className="relative overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5"
                  style={{
                    borderColor: isSelected
                      ? "var(--pink-600)"
                      : "var(--pink-100)",
                    boxShadow: isSelected ? "var(--shadow-soft)" : undefined,
                  }}
                  key={cover.id}
                >
                  {isSelected && (
                    <span
                      className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold"
                      style={{ color: "var(--pink-700)" }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Selected
                    </span>
                  )}

                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={`${API_BASE_URL}${cover.coverImage}`}
                      alt={cover.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-h-48 flex-col p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "var(--pink-900)" }}
                      >
                        {cover.name}
                      </h3>
                      <span
                        className="shrink-0 text-sm font-semibold"
                        style={{ color: "var(--pink-700)" }}
                      >
                        ₹{cover.price}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted-foreground">
                      {cover.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
                      <span>
                        Used by{" "}
                        <strong>{cover.usedUser.toLocaleString()}</strong>{" "}
                        users
                      </span>
                      <span
                        className="rounded-full border px-3 py-1 font-medium"
                        style={{
                          borderColor: "var(--pink-300)",
                          color: "var(--pink-700)",
                        }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border bg-white px-5 py-2 text-sm font-medium"
          style={{
            borderColor: "var(--pink-300)",
            color: "var(--pink-700)",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="rounded-full px-6 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--gradient-rose)" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default GiftCover;
