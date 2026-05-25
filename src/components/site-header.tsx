import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Package,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

import { useCart } from "../lib/cart";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/products?category=flowers", label: "Flowers" },
  { to: "/products?category=cakes", label: "Cakes" },
  { to: "/products?category=personalised", label: "Personalised" },
];

export function SiteHeader() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div
        className="relative overflow-hidden border-b backdrop-blur-md"
        style={{
          background: "var(--gradient-rose)",
          borderColor: "rgba(255,255,255,0.15)",
          boxShadow: "var(--shadow-glow)",
        }}
      >
        {/* Moving Shine */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-1/3 h-full w-1/3 rotate-12 bg-white/20 blur-2xl animate-[shine_6s_linear_infinite]" />
        </div>

        {/* Soft Glow Background */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_65%)]" />

        <div className="relative flex flex-wrap items-center justify-center gap-3 py-3 px-6 text-center">
          {/* Pulsing Dot */}
          <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,1)] animate-pulse" />

          {/* Animated Text */}
          <p className="text-[11px] sm:text-sm tracking-[0.22em] uppercase font-semibold text-white animate-[floatText_3s_ease-in-out_infinite]">
            Free Worldwide Shipping on Orders Over $75
          </p>

          {/* Divider */}
          <div className="hidden sm:block h-4 w-px bg-white/30" />

          {/* Elegant Secondary Text */}
          <p className="hidden sm:block text-sm text-pink-50 font-serif italic animate-[fadeGlow_4s_ease-in-out_infinite]">
            Hand-wrapped with love
          </p>
        </div>
      </div>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b"
        style={{ borderColor: "var(--pink-100)" }}
      >
        <div className="w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
              style={{ color: "var(--pink-700)" }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 font-serif text-xl tracking-tight"
              style={{ color: "var(--pink-800)" }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white"
                style={{
                  background: "var(--gradient-rose)",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <Heart className="w-4 h-4" fill="currentColor" />
              </span>
              <span className="hidden sm:inline">Bloom &amp; Bow</span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm">
            {NAV.map((n, i) => (
              <Link
                key={i}
                to={n.to}
                className="hover:opacity-70 transition uppercase tracking-wide text-xs font-medium"
                style={{ color: "var(--pink-800)" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <form
              onSubmit={onSearch}
              className="hidden md:flex items-center rounded-full px-3 py-1.5 border"
              style={{
                background: "var(--pink-50)",
                borderColor: "var(--pink-100)",
              }}
            >
              <Search
                className="w-4 h-4"
                style={{ color: "var(--pink-500)" }}
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search gifts…"
                className="bg-transparent outline-none text-sm px-2 w-40"
              />
            </form>

            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-pink-50"
              style={{ color: "var(--pink-800)" }}
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--pink-600)" }}
                >
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-pink-50"
                  style={{ color: "var(--pink-800)" }}
                >
                  <span
                    className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center"
                    style={{ background: "var(--gradient-rose)" }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                </button>
                {userMenu && (
                  <div
                    onMouseLeave={() => setUserMenu(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border p-2 z-50"
                    style={{ borderColor: "var(--pink-100)" }}
                  >
                    <div
                      className="px-3 py-2 border-b"
                      style={{ borderColor: "var(--pink-100)" }}
                    >
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-pink-50"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      to="/profile/orders"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-pink-50"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                    <Link
                      to="/profile/settings"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-pink-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-sm rounded-lg hover:bg-pink-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white"
                  style={{ background: "var(--pink-600)" }}
                >
                  <UserIcon className="w-3.5 h-3.5" /> Sign in
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full border"
                  style={{
                    borderColor: "var(--pink-300)",
                    color: "var(--pink-700)",
                  }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </button>
              <nav className="flex flex-col gap-1 mt-8">
                {NAV.map((n, i) => (
                  <Link
                    key={i}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-pink-50"
                    style={{ color: "var(--pink-900)" }}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
