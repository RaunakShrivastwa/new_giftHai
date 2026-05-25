export default function ProfileHome() {
  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--pink-100)" }}>
      <h2 className="font-serif text-2xl mb-4" style={{ color: "var(--pink-900)" }}>Profile details</h2>
      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--pink-600)" }}>Saved address</div>
          <p className="text-foreground/80">No address saved yet.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--pink-600)" }}>Wishlist</div>
          <p className="text-foreground/80">No gifts saved yet.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--pink-600)" }}>Reward points</div>
          <p className="text-foreground/80">120 pink petals 🌸</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--pink-600)" }}>Member since</div>
          <p className="text-foreground/80">May 2026</p>
        </div>
      </div>
    </div>
  );
}
