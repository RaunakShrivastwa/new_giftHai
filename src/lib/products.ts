export type GiftCover = {
  id: string;
  name: string;
  price: number;
  swatch: string; // CSS background
};

export const GIFT_COVERS: GiftCover[] = [
  { id: "blush",   name: "Blush Satin",      price: 0,   swatch: "linear-gradient(135deg,#fbcfe8,#f9a8d4)" },
  { id: "rose",    name: "Rose Velvet",      price: 4,   swatch: "linear-gradient(135deg,#f472b6,#db2777)" },
  { id: "pearl",   name: "Pearl White",      price: 3,   swatch: "linear-gradient(135deg,#ffffff,#fde7f3)" },
  { id: "peony",   name: "Peony Bloom",      price: 6,   swatch: "linear-gradient(135deg,#fda4af,#f472b6)" },
  { id: "ribbon",  name: "Silk Ribbon Wrap", price: 8,   swatch: "linear-gradient(135deg,#fce7f3,#ec4899)" },
];

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: "flowers" | "cakes" | "candles" | "personalised" | "hampers" | "jewelry";
  tag?: string;
  rating: number;
  reviews: number;
  description: string;
};

import heroImg from "@/assets/hero-gift.jpg";
import mumImg from "@/assets/gift-mum.jpg";
import loveImg from "@/assets/gift-love.jpg";
import candleImg from "@/assets/gift-candle.jpg";
import birthdayImg from "@/assets/gift-birthday.jpg";
import jewelryImg from "@/assets/gift-jewelry.jpg";
import hamperImg from "@/assets/gift-hamper.jpg";

const imgs = [heroImg, mumImg, loveImg, candleImg, birthdayImg, jewelryImg, hamperImg];

const NAMES = [
  "Pink Rose Box", "Blush Bouquet", "Rose Candle Set", "Pearl Keepsake",
  "Luxe Pink Hamper", "Birthday Surprise Box", "Mother's Bloom Bouquet",
  "Love Letter Jewelry", "Velvet Petal Cake", "Peony Dream Bundle",
  "Cherry Blossom Hamper", "Sweetheart Candle", "Rose Gold Necklace",
  "Pink Macaron Tower", "Heart Locket Box", "Whispering Tulips",
  "Strawberry Cream Cake", "Pink Champagne Set", "Sakura Gift Crate",
  "Forever Rose Dome", "Coral Bouquet", "Pearl & Pink Bracelet",
  "Birthday Cake Bouquet", "Mum's Spa Hamper", "Pink Teddy & Roses",
];

const CATS: Product["category"][] = ["flowers","cakes","candles","personalised","hampers","jewelry"];

export const PRODUCTS: Product[] = NAMES.map((name, i) => ({
  id: String(i + 1),
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  price: 29 + ((i * 17) % 180),
  image: imgs[i % imgs.length],
  category: CATS[i % CATS.length],
  tag: i % 4 === 0 ? "Bestseller" : i % 5 === 0 ? "New" : i % 7 === 0 ? "Limited" : undefined,
  rating: 4.4 + ((i * 7) % 6) / 10,
  reviews: 40 + ((i * 23) % 800),
  description:
    "Hand-wrapped with love, this gift is curated for life's most cherished moments. Beautifully presented in a pink keepsake box with a hand-tied satin ribbon and a personal note.",
}));

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id || p.slug === id);
}