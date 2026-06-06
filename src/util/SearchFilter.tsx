import { useEffect, useState, useRef, ChangeEvent, FormEvent } from "react";
import { Search, Loader2, History } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../store/dataStore";
import { searchProductsByQuery } from "../slice/ProductSlice";
import axios from "axios";

type AutocompleteResponse = string[];

const RECENT_SEARCHES_KEY = "recent_product_searches";
const MAX_RECENT_ITEMS = 5;

export default function SearchFilter() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AutocompleteResponse>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // 2. Click Outside Logic (Dropdown ko close karne ke liye)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Debounced API Call Logic (Yahan se automatic open hone ka trigger hata diya hai)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    const delayDebounceTimer = setTimeout(async () => {
      try {
        const response = await axios.get<AutocompleteResponse>(
          `http://localhost:8080/autocomplete?str=${encodeURIComponent(query)}`,
        );
        setSuggestions(response.data || []);
        // NOTE: Agar user typing kar raha hai aur dropdown already open hai (kyunki usne input par click kiya tha),
        // tabhi suggestions load honge. Automatic bina click kiye dropdown nahi khulega.
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceTimer);
  }, [query]);

  const saveToRecentSearches = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = [
      trimmed,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_ITEMS);

    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const executeSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setIsOpen(false);
    saveToRecentSearches(trimmedValue);
    dispatch(searchProductsByQuery(trimmedValue));
    navigate(`/products?q=${encodeURIComponent(trimmedValue)}`);
  };

  const handleSelectSuggestion = (value: string) => {
    setQuery(value);
    executeSearch(value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    executeSearch(query);
  };

  // UI rendering conditions
  const isSearching = query.trim().length > 0;
  const showRecent = !isSearching && recentSearches.length > 0;
  const showSuggestions = isSearching && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full pl-5 pr-2 py-1.5 border backdrop-blur-md w-full shadow-lg"
        style={{
          background: "rgba(255, 241, 242, 0.95)",
          borderColor: "var(--pink-200)",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          // CRITICAL FIX: Ab dropdown STRICTLY sirf tabhi true hoga jab user box par click (focus) karega
          onFocus={() => setIsOpen(true)}
          placeholder="Write Your Feelings Here..."
          className="bg-transparent outline-none text-sm flex-grow w-full placeholder:text-pink-400"
          style={{ color: "var(--pink-600)" }}
        />

        {/* Action Icon Area */}
        <div className="flex items-center justify-center ml-2">
          {isLoading ? (
            <div className="p-2">
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-2 rounded-full hover:bg-pink-100/50 text-pink-500 disabled:opacity-40 disabled:hover:bg-transparent transition duration-200"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestion Dropdown Panel */}
      {isOpen && (showRecent || showSuggestions) && (
        <div className="suggestion_box">
          {/* CASE A: Input empty hai + user ne click kiya -> Recent Searches dikhao */}
          {showRecent && (
            <>
              <div className="px-2 py-1 text-xs font-semibold text-pink-400 uppercase tracking-wider select-none">
                Recent Searches
              </div>
              {recentSearches.map((item, index) => (
                <div
                  key={`recent-${index}`}
                  onClick={() => handleSelectSuggestion(item)}
                  className="item cursor-pointer hover:bg-rose-50 p-2 rounded flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-pink-400 flex-shrink-0 icons" />
                  <span
                    className="truncate text-sm"
                    
                  >
                    {item}
                  </span>
                </div>
              ))}
            </>
          )}

          {/* CASE B: User type kar raha hai -> API Backend Suggestions dikhao */}
          {showSuggestions &&
            suggestions.map((item, index) => (
              <div
                key={`suggest-${index}`}
                onClick={() => handleSelectSuggestion(item)}
                className="item cursor-pointer hover:bg-rose-50 p-2 rounded flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-pink-300 flex-shrink-0" />
                <span
                  className="truncate text-sm"
                  style={{ color: "var(--pink-700)" }}
                >
                  {item}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
