import { Package } from "lucide-react";

const MOCK = [
  { id: "BB-1042", date: "May 22, 2026", status: "Delivered", total: 128, items: "Pink Rose Box + QR keepsake" },
  { id: "BB-1029", date: "May 14, 2026", status: "On its way", total: 86, items: "Mother's Bloom Bouquet" },
];

export default function ProfileOrders() {
  return (
    <div className="space-y-3">
      {MOCK.map((o) => (
        <div key={o.id} className="bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-sm" style={{ borderColor: "var(--pink-100)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--pink-100)", color: "var(--pink-700)" }}><Package className="w-5 h-5" /></div>
          <div className="flex-1">
            <div className="flex justify-between items-baseline gap-3">
              <div className="font-medium" style={{ color: "var(--pink-900)" }}>{o.id}</div>
              <div className="font-semibold" style={{ color: "var(--pink-700)" }}>₹{o.total}</div>
            </div>
            <div className="text-xs text-muted-foreground">{o.items}</div>
            <div className="text-xs mt-1"><span className="text-muted-foreground">{o.date}</span> · <span className="font-medium" style={{ color: "var(--pink-600)" }}>{o.status}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}
