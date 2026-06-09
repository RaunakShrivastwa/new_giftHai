import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Package,
  Settings,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  ChevronDown,
  ChevronRight,
  Bell,
  IndianRupee,
  Building2,
  MoreHorizontal,
  Search,
  Navigation,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useCart } from "../lib/cart";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/dataStore";
import { searchProductsByQuery } from "../slice/ProductSlice";
import { logout } from "../slice/authSlice";
import { toast } from "sonner";
import SearchFilter from "../util/SearchFilter";

// Fix Leaflet default marker icon broken by Vite/webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NAV = [
  { to: "/products?category=birthday", label: "Birthday" },
  { to: "/products?category=occasions", label: "Occasions" },
  { to: "/products?category=anniversary", label: "Anniversary" },
  { to: "/products?category=flowers", label: "Flowers" },
  { to: "/products?category=cakes", label: "Cakes" },
  { to: "", label: "Personalized" },
  { to: "/products?category=plants", label: "Plants" },
  { to: "/products?category=balloons", label: "Balloon n Services" },
  { to: "/products?category=chocolates", label: "Chocolates" },
  { to: "/products?category=luxe", label: "LUXE" },
  { to: "/products?category=hampers", label: "Hampers" },
  { to: "/products?category=lifestyle", label: "Lifestyle" },
  { to: "/products?category=international", label: "International" },
];

/* ─── Types ──────────────────────────────────────────────────────────── */
interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    pedestrian?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

/* ─── Free Delivery Badge SVG ────────────────────────────────────────── */
function FreeDeliveryBadge() {
  return (
    <svg
      width="52"
      height="64"
      viewBox="0 0 52 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2 L50 2 L50 54 L26 62 L2 54 Z"
        fill="#f5c842"
        stroke="#d4a820"
        strokeWidth="1.5"
      />
      <path
        d="M5 5 L47 5 L47 52 L26 59 L5 52 Z"
        fill="none"
        stroke="#d4a820"
        strokeWidth="0.75"
        strokeDasharray="2 1"
      />
      <text
        x="26"
        y="24"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize="11"
        fontWeight="900"
        fill="#5c3d00"
      >
        FREE
      </text>
      <line x1="8" y1="30" x2="44" y2="30" stroke="#d4a820" strokeWidth="1" />
      <text
        x="26"
        y="42"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#5c3d00"
      >
        DELIVERY
      </text>
    </svg>
  );
}

/* ─── useLocationPicker hook ─────────────────────────────────────────── */
function useLocationPicker() {
  const [location, setLocation] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"main" | "map">("main");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPlaces = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          q,
        )}&countrycodes=in&addressdetails=1&limit=6&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      const data: LocationResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(val), 400);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const addr = data.address;
          const city =
            addr.city ||
            addr.town ||
            addr.suburb ||
            addr.village ||
            addr.county ||
            "Your Location";
          const label = addr.state ? `${city}, ${addr.state}` : city;
          setLocation(label);
          setOpen(false);
          setView("main");
          toast.success(`Delivering to ${label}`);
        } catch {
          toast.error("Could not fetch location details.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow access.");
        } else {
          toast.error("Unable to get your location.");
        }
      },
      { timeout: 10000 },
    );
  };

  const pickResult = (r: LocationResult) => {
    const addr = r.address;
    const city =
      addr?.city || addr?.town || addr?.suburb || r.display_name.split(",")[0];
    const label = addr?.state ? `${city}, ${addr.state}` : city;
    setLocation(label);
    setOpen(false);
    setView("main");
    setQuery("");
    setResults([]);
    toast.success(`Delivering to ${label}`);
  };

  const pickFromMap = (label: string) => {
    setLocation(label);
    setOpen(false);
    setView("main");
    toast.success(`Delivering to ${label}`);
  };

  const openMap = () => setView("map");
  const closeMap = () => setView("main");

  // Close dropdown on outside click (handled in panel)
  const closeDropdown = () => {
    setOpen(false);
    setView("main");
    setQuery("");
    setResults([]);
  };

  return {
    location,
    open,
    setOpen,
    view,
    openMap,
    closeMap,
    closeDropdown,
    query,
    handleQueryChange,
    results,
    gpsLoading,
    searchLoading,
    useCurrentLocation,
    pickResult,
    pickFromMap,
  };
}

/* ─── MapPicker (Leaflet) ─────────────────────────────────────────────── */
function MapPicker({
  onConfirm,
  onBack,
}: {
  onConfirm: (label: string) => void;
  onBack: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      const addr = data.address;
      const parts = [
        addr.road || addr.pedestrian || addr.suburb,
        addr.city || addr.town || addr.village || addr.county,
        addr.state,
      ].filter(Boolean);
      setAddress(parts.join(", ") || data.display_name);
    } catch {
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [20.5937, 78.9629],
      5,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Try GPS to center map
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);
        placeMarker(map, latitude, longitude);
        reverseGeocode(latitude, longitude);
      },
      () => {
        // GPS denied — stay at India center, let user click
      },
    );

    function placeMarker(m: L.Map, lat: number, lng: number) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(m);
        markerRef.current = marker;
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });
      }
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      placeMarker(map, lat, lng);
      reverseGeocode(lat, lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [reverseGeocode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Map header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: "1px solid #f3f4f6",
          flexShrink: 0,
          background: "#fff",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#6b7280",
            padding: "4px",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <ChevronRight
            style={{
              width: "16px",
              height: "16px",
              transform: "rotate(180deg)",
            }}
          />
        </button>
        <span style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a1a" }}>
          Pin your delivery location
        </span>
      </div>

      {/* Hint bar */}
      <div
        style={{
          padding: "7px 14px",
          background: "#fffbeb",
          borderBottom: "1px solid #fef3c7",
          flexShrink: 0,
        }}
      >
        <p style={{ margin: 0, fontSize: "11px", color: "#92400e" }}>
          📍 Click anywhere on the map or drag the pin to set your delivery
          address
        </p>
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 0 }} />

      {/* Address confirm bar */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #f3f4f6",
          flexShrink: 0,
          background: "#fff",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#9ca3af",
              fontSize: "12px",
              marginBottom: "8px",
            }}
          >
            <Loader2
              style={{
                width: "13px",
                height: "13px",
                animation: "loc-spin 1s linear infinite",
              }}
            />
            Fetching address…
          </div>
        ) : address ? (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            <MapPin
              style={{
                width: "13px",
                height: "13px",
                color: "#dc2626",
                flexShrink: 0,
                marginTop: "2px",
              }}
            />
            <span
              style={{ fontSize: "12px", color: "#374151", lineHeight: 1.4 }}
            >
              {address}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 8px" }}>
            Click on the map to select a location
          </p>
        )}

        <button
          disabled={!address || loading}
          onClick={() => address && onConfirm(address)}
          style={{
            width: "100%",
            padding: "9px",
            borderRadius: "8px",
            border: "none",
            background: address && !loading ? "#1d4ed8" : "#e5e7eb",
            color: address && !loading ? "#fff" : "#9ca3af",
            fontSize: "13px",
            fontWeight: "600",
            cursor: address && !loading ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}
        >
          Confirm this location
        </button>
      </div>
    </div>
  );
}

/* ─── LocationPanel (desktop dropdown) ──────────────────────────────── */
type LocPicker = ReturnType<typeof useLocationPicker>;

function LocationPanel({
  query,
  handleQueryChange,
  results,
  gpsLoading,
  searchLoading,
  useCurrentLocation,
  pickResult,
  pickFromMap,
  view,
  openMap,
  closeMap,
  closeDropdown,
}: LocPicker) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click only when not in map view
  useEffect(() => {
    if (view === "map") return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [view, closeDropdown]);

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        width: view === "map" ? "420px" : "320px",
        height: view === "map" ? "460px" : "auto",
        background: "#fff",
        borderRadius: "14px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
        border: "1px solid #e5e7eb",
        zIndex: 9999,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease, height 0.2s ease",
      }}
    >
      {view === "map" ? (
        <MapPicker onConfirm={pickFromMap} onBack={closeMap} />
      ) : (
        <>
          {/* Header + search */}
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                }}
              >
                Select Delivery Location
              </span>
              <button
                onClick={closeDropdown}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  padding: "2px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            {/* Search input */}
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "14px",
                  height: "14px",
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search city or area..."
                style={{
                  width: "100%",
                  paddingLeft: "32px",
                  paddingRight: searchLoading ? "32px" : "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
              {searchLoading && (
                <Loader2
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "13px",
                    height: "13px",
                    color: "#9ca3af",
                    animation: "loc-spin 1s linear infinite",
                  }}
                />
              )}
            </div>
          </div>

          {/* Use GPS */}
          <LocationOptionBtn
            icon={
              gpsLoading ? (
                <Loader2
                  style={{
                    width: "15px",
                    height: "15px",
                    color: "#3b82f6",
                    animation: "loc-spin 1s linear infinite",
                  }}
                />
              ) : (
                <Navigation
                  style={{ width: "15px", height: "15px", color: "#3b82f6" }}
                />
              )
            }
            iconBg="#eff6ff"
            label={
              gpsLoading ? "Detecting location…" : "Use my current location"
            }
            sublabel="Using GPS"
            labelColor="#1d4ed8"
            hoverBg="#f0f7ff"
            onClick={useCurrentLocation}
            disabled={gpsLoading}
            borderBottom
          />

          {/* Locate on map */}
          <LocationOptionBtn
            icon={
              <MapPin
                style={{ width: "15px", height: "15px", color: "#16a34a" }}
              />
            }
            iconBg="#f0fdf4"
            label="Locate on map"
            sublabel="Pin your exact delivery spot"
            labelColor="#15803d"
            hoverBg="#f0fdf4"
            onClick={openMap}
            borderBottom={results.length > 0 || query.length > 1}
          />

          {/* Search results */}
          {results.length > 0 && (
            <div style={{ maxHeight: "190px", overflowY: "auto" }}>
              {results.map((r, i) => {
                const addr = r.address;
                const city =
                  addr?.city ||
                  addr?.town ||
                  addr?.suburb ||
                  r.display_name.split(",")[0];
                const detail = r.display_name
                  .split(",")
                  .slice(1, 3)
                  .join(",")
                  .trim();
                return (
                  <button
                    key={i}
                    onClick={() => pickResult(r)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 16px",
                      background: "none",
                      border: "none",
                      borderBottom:
                        i < results.length - 1 ? "1px solid #f9fafb" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <MapPin
                      style={{
                        width: "14px",
                        height: "14px",
                        color: "#9ca3af",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {city}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#9ca3af",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {detail}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {query.length > 1 && !searchLoading && results.length === 0 && (
            <div
              style={{
                padding: "20px 16px",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              No results found. Try a different city name.
            </div>
          )}

          <div
            style={{
              padding: "8px 16px",
              borderTop: "1px solid #f3f4f6",
              marginTop: "auto",
              textAlign: "right",
            }}
          >
            <span style={{ fontSize: "10px", color: "#d1d5db" }}>
              Powered by OpenStreetMap
            </span>
          </div>
        </>
      )}

      <style>{`
        @keyframes loc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Reusable option button ─────────────────────────────────────────── */
function LocationOptionBtn({
  icon,
  iconBg,
  label,
  sublabel,
  labelColor,
  hoverBg,
  onClick,
  disabled = false,
  borderBottom = true,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sublabel: string;
  labelColor: string;
  hoverBg: string;
  onClick: () => void;
  disabled?: boolean;
  borderBottom?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 16px",
        background: "none",
        border: "none",
        borderBottom: borderBottom ? "1px solid #f3f4f6" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: "background 0.12s",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "none";
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "600", color: labelColor }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280" }}>{sublabel}</div>
      </div>
    </button>
  );
}

/* ─── Mobile Location Section (inside drawer) ───────────────────────── */
function MobileLocationSection({
  locPicker,
  onPickAndClose,
}: {
  locPicker: LocPicker;
  onPickAndClose: (r: LocationResult) => void;
}) {
  if (!locPicker.open) return null;

  return (
    <div style={{ padding: "0 12px 10px" }}>
      {locPicker.view === "map" ? (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            height: "380px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MapPicker
            onConfirm={(label) => {
              locPicker.pickFromMap(label);
            }}
            onBack={locPicker.closeMap}
          />
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          {/* Search */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "13px",
                  height: "13px",
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              />
              <input
                autoFocus
                type="text"
                value={locPicker.query}
                onChange={(e) => locPicker.handleQueryChange(e.target.value)}
                placeholder="Search city or area..."
                style={{
                  width: "100%",
                  paddingLeft: "30px",
                  paddingRight: "10px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
              />
            </div>
          </div>

          {/* GPS */}
          <button
            onClick={locPicker.useCurrentLocation}
            disabled={locPicker.gpsLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 14px",
              background: "none",
              border: "none",
              borderBottom: "1px solid #f3f4f6",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {locPicker.gpsLoading ? (
                <Loader2
                  style={{
                    width: "13px",
                    height: "13px",
                    color: "#3b82f6",
                    animation: "loc-spin 1s linear infinite",
                  }}
                />
              ) : (
                <Navigation
                  style={{ width: "13px", height: "13px", color: "#3b82f6" }}
                />
              )}
            </div>
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#1d4ed8" }}
            >
              {locPicker.gpsLoading
                ? "Detecting location…"
                : "Use my current location"}
            </span>
          </button>

          {/* Map */}
          <button
            onClick={locPicker.openMap}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "11px 14px",
              background: "none",
              border: "none",
              borderBottom:
                locPicker.results.length > 0 || locPicker.query.length > 1
                  ? "1px solid #f3f4f6"
                  : "none",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "7px",
                background: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MapPin
                style={{ width: "13px", height: "13px", color: "#16a34a" }}
              />
            </div>
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#15803d" }}
            >
              Locate on map
            </span>
          </button>

          {/* Results */}
          {locPicker.results.slice(0, 5).map((r, i) => {
            const addr = r.address;
            const city =
              addr?.city ||
              addr?.town ||
              addr?.suburb ||
              r.display_name.split(",")[0];
            const detail = r.display_name
              .split(",")
              .slice(1, 3)
              .join(",")
              .trim();
            return (
              <button
                key={i}
                onClick={() => onPickAndClose(r)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    i < locPicker.results.length - 1
                      ? "1px solid #f9fafb"
                      : "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <MapPin
                  style={{
                    width: "12px",
                    height: "12px",
                    color: "#9ca3af",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1a1a1a",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {city}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {detail}
                  </div>
                </div>
              </button>
            );
          })}

          {locPicker.query.length > 1 &&
            !locPicker.searchLoading &&
            locPicker.results.length === 0 && (
              <div
                style={{
                  padding: "14px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                No results found.
              </div>
            )}
        </div>
      )}
      <style>{`
        @keyframes loc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Scrollable Category Nav ─────────────────────────────────────────── */
function CategoryNav() {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollRight = () =>
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  return (
    <div className="hidden lg:flex items-center border-t border-gray-100 relative">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center overflow-x-auto scrollbar-none flex-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {NAV.map((n, i) => {
          const isActive = location.pathname + location.search === n.to;
          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            const trimmed = n.label.trim();
            dispatch(searchProductsByQuery(trimmed));
            navigate(`/products?q=${encodeURIComponent(trimmed)}`);
          };

          return (
            <button
              key={i}
              onClick={handleClick}
              className={`
                relative flex items-center gap-0.5 whitespace-nowrap px-3 py-3
                text-[13px] font-medium transition-colors flex-shrink-0 group
                ${
                  isActive
                    ? "text-[#1a5fa8]"
                    : "text-gray-700 hover:text-[#1a5fa8]"
                }
              `}
            >
              {n.label}
              <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-80" />
              <span
                className={`
                  absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-200
                  ${
                    isActive
                      ? "opacity-100 bg-[#1a5fa8]"
                      : "opacity-0 group-hover:opacity-100 bg-[#1a5fa8]"
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="flex-shrink-0 flex items-center justify-center w-8 h-full border-l border-gray-100 hover:bg-gray-50 transition-colors"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

/* ─── Main SiteHeader ────────────────────────────────────────────────── */
export function SiteHeader() {
  const { count } = useCart();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const locPicker = useLocationPicker();

  const isAdmin =
    user &&
    (user.role === "ADMIN" ||
      (Array.isArray(user.roles) && user.roles.includes("ADMIN")) ||
      user.role === "ROLE_ADMIN");

  const handleLogout = () => {
    setUserMenu(false);
    dispatch(logout());
    toast.success("Logged out successfully!", { className: "gift_toast" });
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim())
      navigate(`/products?q=${encodeURIComponent(searchQ.trim())}`);
  };

  return (
    <>
      {/* ══════════ LAYER 1 — Announcement bar ══════════ */}
      <div
        className="delivery_bg"
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            left: "-20px",
            top: "-10px",
            width: "160px",
            height: "100px",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-20px",
            top: "-10px",
            width: "180px",
            height: "110px",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        <div
          className="w-full p_wrapper_d_icon mx-auto px-4"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "flex-end",
            minHeight: "72px",
          }}
        >
          <div
            className="hidden sm:flex items-end gap-5 wrapper_d_icon left_d_icon"
            style={{ justifySelf: "start" }}
          >
            <div style={{ marginBottom: "4px" }}>
              <FreeDeliveryBadge />
            </div>
            <div>
              <img
                className="d_icon"
                src="https://res.cloudinary.com/dnk5iqeup/image/upload/v1780853411/delivery-bike-removebg-preview_eqs3ch.png"
                alt=""
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingBottom: "14px",
              paddingTop: "10px",
              textAlign: "center",
              alignSelf: "center",
            }}
          >
            <p
              className="d_text"
              style={{
                fontSize: "15px",
                fontWeight: "400",
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              <strong className="d_text" style={{ fontWeight: "900" }}>
                FREE DELIVERY!!!
              </strong>{" "}
              Enjoy ₹0 shipping with our free delivery time slots
            </p>
          </div>
          <div
            className="hidden sm:flex items-end gap-5 wrapper_d_icon"
            style={{ justifySelf: "end" }}
          >
            <div>
              <img
                className="d_icon"
                src="https://res.cloudinary.com/dnk5iqeup/image/upload/v1780853411/delivery-man-removebg-preview_pmcbs9.png"
                alt=""
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
            <div style={{ marginBottom: "4px" }}>
              <FreeDeliveryBadge />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ LAYER 2 — Utility header ══════════ */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div
          className="w-full mx-auto px-4 sm:px-6"
          style={{
            height: "72px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-600 flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://res.cloudinary.com/dnk5iqeup/image/upload/v1780836781/Gemini_Generated_Image_mn6xrmn6xrmn6xrm-removebg-preview_eoiwwq.png"
              alt="GiftHai"
              className="logo object-contain"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span
                style={{
                  color: "var(--pink-600)",
                  fontFamily: "Georgia, serif",
                  fontSize: "22px",
                  fontWeight: "900",
                  letterSpacing: "-0.5px",
                }}
              >
                GiftHai
              </span>
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  color: "var(--pink-600)",
                  textTransform: "uppercase",
                  fontWeight: "500",
                }}
              >
                gifts &amp; more
              </span>
            </div>
          </Link>

          {/* ── Location selector (desktop) ── */}
          <div
            style={{ position: "relative", flexShrink: 0 }}
            className="hidden md:block"
          >
            <button
              onClick={() => locPicker.setOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>🇮🇳</span>
              <div className="text-left">
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#1a1a1a",
                    lineHeight: 1.2,
                  }}
                >
                  {locPicker.location ? "Delivering to" : "Where to deliver?"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: locPicker.location ? "#16a34a" : "#cc2222",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    lineHeight: 1.2,
                    maxWidth: "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {locPicker.location ? (
                    <>
                      <MapPin
                        style={{ width: "11px", height: "11px", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {locPicker.location}
                      </span>
                    </>
                  ) : (
                    <>
                      Location missing <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </div>
              </div>
            </button>

            {locPicker.open && <LocationPanel {...locPicker} />}
          </div>

          {/* Divider */}
          <div
            className="hidden md:block flex-shrink-0"
            style={{ width: "1px", height: "36px", background: "#e5e7eb" }}
          />

          {/* Search */}
          <form onSubmit={onSearch} style={{ flex: 1, minWidth: 0 }}>
            <div
              className="search_parent"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                style={{
                  position: "absolute",
                  left: "14px",
                  width: "16px",
                  height: "16px",
                  color: "#9ca3af",
                  pointerEvents: "none",
                }}
              />
              <SearchFilter />
            </div>
          </form>

          {/* Icon cluster */}
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {/* My Reminders */}
            <Link
              to="/reminders"
              className="hidden lg:flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors group"
              style={{ gap: "2px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #9ca3af",
                  borderRadius: "6px",
                }}
              >
                <Bell
                  style={{ width: "14px", height: "14px", color: "#4b5563" }}
                />
              </div>
              <span
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                My Reminders
              </span>
            </Link>

            {/* INR */}
            <button
              className="hidden lg:flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
              style={{ gap: "2px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #9ca3af",
                  borderRadius: "6px",
                }}
              >
                <IndianRupee
                  style={{ width: "14px", height: "14px", color: "#4b5563" }}
                />
              </div>
              <span
                style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1 }}
              >
                INR
              </span>
            </button>

            {/* Corporate */}
            <Link
              to="/corporate"
              className="hidden lg:flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
              style={{ gap: "2px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #9ca3af",
                  borderRadius: "6px",
                }}
              >
                <Building2
                  style={{ width: "14px", height: "14px", color: "#4b5563" }}
                />
              </div>
              <span
                style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1 }}
              >
                Corporate
              </span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
              style={{ gap: "2px", position: "relative" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #9ca3af",
                  borderRadius: "6px",
                }}
              >
                <ShoppingCart
                  style={{ width: "14px", height: "14px", color: "#4b5563" }}
                />
                {count > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      minWidth: "16px",
                      height: "16px",
                      padding: "0 3px",
                      borderRadius: "9999px",
                      background: "#dc2626",
                      color: "#fff",
                      fontSize: "9px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
              <span
                className="hidden lg:block"
                style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1 }}
              >
                Cart
              </span>
            </Link>

            {/* User */}
            {user ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
                  style={{ gap: "2px" }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "1.5px solid #d1d5db",
                    }}
                  >
                    <img
                      src={
                        user.avtar?.startsWith("https")
                          ? user.avtar
                          : BASE_URL + user.avtar
                      }
                      alt={user.fname}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <span
                    className="hidden lg:block"
                    style={{
                      fontSize: "10px",
                      color: "#6b7280",
                      lineHeight: 1,
                    }}
                  >
                    {user.fname}
                  </span>
                </button>

                {userMenu && (
                  <div
                    onMouseLeave={() => setUserMenu(false)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      width: "224px",
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      border: "1px solid #f3f4f6",
                      padding: "8px",
                      zIndex: 50,
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid #f3f4f6",
                        marginBottom: "4px",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: "600" }}>
                        {user.fname} {user.lname}
                      </div>
                      <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {user.email}
                      </div>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenu(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 mb-1"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" /> My
                      Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <Package className="w-4 h-4 mr-2 text-gray-400" /> My
                      Orders
                    </Link>
                    <Link
                      to="/profile/settings"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-2 text-gray-400" />{" "}
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
                style={{ gap: "2px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #9ca3af",
                    borderRadius: "6px",
                  }}
                >
                  <UserIcon
                    style={{
                      width: "14px",
                      height: "14px",
                      color: "#4b5563",
                    }}
                  />
                </div>
                <span
                  className="hidden lg:block"
                  style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1 }}
                >
                  Hi Guest
                </span>
              </Link>
            )}

            {/* More */}
            <button
              className="hidden lg:flex flex-col items-center justify-center px-3 py-1 hover:bg-gray-50 rounded-lg transition-colors"
              style={{ gap: "2px" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid #9ca3af",
                  borderRadius: "6px",
                }}
              >
                <MoreHorizontal
                  style={{ width: "14px", height: "14px", color: "#4b5563" }}
                />
              </div>
              <span
                style={{ fontSize: "10px", color: "#6b7280", lineHeight: 1 }}
              >
                More
              </span>
            </button>
          </div>
        </div>

        {/* ══════════ LAYER 3 — Category Nav ══════════ */}
        <CategoryNav />

        {/* ══════════ Mobile Drawer ══════════ */}
        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => {
              setMenuOpen(false);
              locPicker.closeDropdown();
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ overflowY: "auto" }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span
                    className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center"
                    style={{ background: "#6b7c2e" }}
                  >
                    <img
                      src="https://res.cloudinary.com/dnk5iqeup/image/upload/v1780836781/Gemini_Generated_Image_mn6xrmn6xrmn6xrm-removebg-preview_eoiwwq.png"
                      alt="GiftHai"
                      className="w-6 h-6 object-contain brightness-200"
                    />
                  </span>
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "18px",
                      fontWeight: "900",
                      color: "#6b7c2e",
                    }}
                  >
                    GiftHai
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    locPicker.closeDropdown();
                  }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Location button in drawer */}
              <button
                onClick={() => locPicker.setOpen((v) => !v)}
                className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 hover:bg-gray-50 w-full text-left"
              >
                <span style={{ fontSize: "18px" }}>🇮🇳</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#1a1a1a",
                    }}
                  >
                    {locPicker.location ? "Delivering to" : "Where to deliver?"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: locPicker.location ? "#16a34a" : "#cc2222",
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {locPicker.location ? (
                      <>
                        <MapPin
                          style={{
                            width: "11px",
                            height: "11px",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {locPicker.location}
                        </span>
                      </>
                    ) : (
                      <>
                        Location missing <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </div>
                </div>
              </button>

              {/* Mobile location panel */}
              <MobileLocationSection
                locPicker={locPicker}
                onPickAndClose={(r) => {
                  locPicker.pickResult(r);
                  setMenuOpen(false);
                }}
              />

              {/* Search */}
              <form
                onSubmit={onSearch}
                className="px-4 py-3 border-b border-gray-100"
              >
                <div style={{ position: "relative" }}>
                  <Search
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "15px",
                      height: "15px",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search gifts..."
                    style={{
                      width: "100%",
                      paddingLeft: "36px",
                      paddingRight: "16px",
                      paddingTop: "9px",
                      paddingBottom: "9px",
                      fontSize: "13px",
                      border: "1px solid #d1d5db",
                      borderRadius: "9999px",
                      outline: "none",
                    }}
                  />
                </div>
              </form>

              {/* Nav links */}
              <nav className="flex-1 py-2">
                {NAV.map((n, i) => (
                  <Link
                    key={i}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-700 transition-colors"
                  >
                    {n.label}
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </Link>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-gray-100 p-4 space-y-2">
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold rounded-xl text-white"
                    style={{ background: "#6b7c2e" }}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" /> Switch to Admin
                    View
                  </Link>
                )}
                {!user && (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-xs font-semibold px-4 py-2.5 rounded-full text-white"
                      style={{ background: "#6b7c2e" }}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-xs font-semibold px-4 py-2.5 rounded-full border border-gray-300 text-gray-700"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2.5 text-sm rounded-xl text-red-600 border border-red-100 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
