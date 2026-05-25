import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t mt-20" style={{ background: "var(--pink-50)", borderColor: "var(--pink-100)" }}>
      <div className="w-full mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-serif text-2xl" style={{ color: "var(--pink-800)" }}>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white" style={{ background: "var(--gradient-rose)" }}>
              <Heart className="w-4 h-4" fill="currentColor" />
            </span>
            Bloom &amp; Bow
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Beautiful hand-wrapped gifts for the people you love most. Delivered with a personal note, worldwide.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--pink-600)" }}>Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products">All Gifts</Link></li>
            <li><Link to="/products?category=flowers">Flowers</Link></li>
            <li><Link to="/products?category=cakes">Cakes</Link></li>
            <li><Link to="/products?category=personalised">Personalised</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--pink-600)" }}>Account</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login">Sign in</Link></li>
            <li><Link to="/signup">Create account</Link></li>
            <li><Link to="/profile/orders">My Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground" style={{ borderColor: "var(--pink-100)" }}>
        © {new Date().getFullYear()} Bloom &amp; Bow · Made with 💕
      </div>
    </footer>
  );
}
