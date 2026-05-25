import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";

const TABS = [
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/profile/orders", label: "My Orders", icon: Package },
  { to: "/profile/settings", label: "Settings", icon: Settings },
];

export default function ProfileLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) {
    return (
      <main className="max-w-md mx-auto text-center px-6 py-24">
        <h1 className="font-serif text-3xl" style={{ color: "var(--pink-900)" }}>Please sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">Sign in to view your profile.</p>
        <Link to="/login" className="mt-6 inline-block px-6 py-3 rounded-full text-white font-medium" style={{ background: "var(--gradient-rose)" }}>Sign in</Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full text-white flex items-center justify-center font-serif text-2xl" style={{ background: "var(--gradient-rose)" }}>
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--pink-900)" }}>Hi, {user.name} 🌸</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = pathname === t.to;
            return (
              <Link key={t.to} to={t.to} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0 transition" style={active ? { background: "var(--pink-100)", color: "var(--pink-800)" } : { color: "var(--pink-900)" }}>
                <t.icon className="w-4 h-4" /> {t.label}
              </Link>
            );
          })}
        </nav>
        <div><Outlet /></div>
      </div>
    </main>
  );
}
