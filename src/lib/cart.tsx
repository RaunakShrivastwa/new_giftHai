import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  coverId: string;
  coverName: string;
  coverPrice: number;
  message: string;
  qrAddon: number; // 5 if QR added, else 0
  qty: number;
};

type Ctx = {
  items: CartItem[];
  add: (it: Omit<CartItem, "key" | "qty"> & { qty?: number }) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "bb_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: Ctx["add"] = (it) => {
    const key = `${it.productId}-${it.coverId}-${Date.now()}`;
    setItems((prev) => [...prev, { ...it, qty: it.qty ?? 1, key }]);
  };
  const remove = (key: string) => setItems((p) => p.filter((i) => i.key !== key));
  const setQty = (key: string, qty: number) =>
    setItems((p) => p.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce(
    (s, i) => s + (i.basePrice + i.coverPrice + i.qrAddon) * i.qty,
    0,
  );

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}