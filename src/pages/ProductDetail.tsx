import { Link, useParams, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Check,
  Gift,
  Heart,
  Image as ImageIcon,
  QrCode,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import {
  GIFT_COVERS,
  PRODUCTS,
  type Product as LocalProduct,
} from "../lib/products";
import { type CartItem, type GiftOrderJson, useCart } from "../lib/cart";
import { Gift3DPreview } from "../components/gift-3d-preview";
import UploadFeeling from "./Feeling/UploadFeeling";
import GiftCover, { type SelectedGiftCover } from "./GiftCover";
import { selectProductById } from "../slice/ProductSlice";
import type { RootState } from "../store/dataStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const QR_ADDON_PRICE = 5;
const FEELING_ADDON_PRICE = 100;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const selectedProduct = useSelector((state: RootState) =>
    id ? selectProductById(state, id) : undefined,
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const product: LocalProduct | undefined = selectedProduct
    ? {
        id: String(selectedProduct.id),
        slug: String(selectedProduct.id),
        name: selectedProduct.title,
        price: selectedProduct.price,
        image: selectedProduct.productImage,
        category: "personalised",
        tag: selectedProduct.bestseller ? "Bestseller" : undefined,
        rating: selectedProduct.rating,
        reviews: selectedProduct.reviews,
        description: selectedProduct.description,
      }
    : undefined;
  const { add } = useCart();
  const navigate = useNavigate();

  const [coverId, setCoverId] = useState(GIFT_COVERS[0].id);
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [hasQR, setHasQR] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomXY, setZoomXY] = useState({ x: 50, y: 50 });
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [giftCover, setGiftCover] = useState<SelectedGiftCover | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [userFeeling, setUserFeeling] = useState<unknown>(null);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto text-center py-32 px-6">
        <h1
          className="font-serif text-4xl"
          style={{ color: "var(--pink-900)" }}
        >
          Gift not found 💔
        </h1>
        <Link
          to="/products"
          className="mt-6 inline-block underline"
          style={{ color: "var(--pink-600)" }}
        >
          Back to all gifts
        </Link>
      </div>
    );
  }

  const cover = GIFT_COVERS.find((c) => c.id === coverId)!;
  const activeCoverName = giftCover?.name ?? cover.name;
  const activeCoverPrice = giftCover?.price ?? cover.price;
  const feelingPrice = userFeeling ? FEELING_ADDON_PRICE : 0;
  const total =
    (product.price +
      activeCoverPrice +
      feelingPrice +
      (hasQR ? QR_ADDON_PRICE : 0)) *
    qty;

  const qrValue = useMemo(() => {
    if (!hasQR) return undefined;
    const payload = {
      name: product.name,
      msg: message || "With love 💕",
      ts: Date.now(),
    };
    return `bloombow://gift?${btoa(JSON.stringify(payload))}`;
  }, [hasQR, message, product.name]);

  const similar = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  const createGiftOrderJson = (): GiftOrderJson => {
    const uploadedFeelingId =
      typeof userFeeling === "object" &&
      userFeeling !== null &&
      "id" in userFeeling
        ? (userFeeling as { id?: string | number }).id
        : null;
    const feelingId =
      uploadedFeelingId === null || uploadedFeelingId === undefined
        ? null
        : Number(uploadedFeelingId);

    return {
      userId: user?.id ?? null,
      productId: Number.isNaN(Number(product.id))
        ? product.id
        : Number(product.id),
      qty,
      coverId: giftCover
        ? giftCover.id
        : Number.isNaN(Number(cover.id))
          ? cover.id
          : Number(cover.id),
      feelingId:
        feelingId === null || Number.isNaN(feelingId) ? null : feelingId,
      giftMessage: message,
      qrKeepsakeAdded: hasQR,
      totalAmount: total,
      transactionID: `TXN_${Date.now()}`,
      orderStatus: "Paid",
      createdAt: new Date().toISOString(),
    };
  };

  const buildCartItem = (): CartItem => ({
    key: `checkout-${Date.now()}`,
    productId: product.id,
    name: product.name,
    image: product.image,
    basePrice: product.price,
    coverId: giftCover ? String(giftCover.id) : cover.id,
    coverName: activeCoverName,
    coverPrice: activeCoverPrice,
    message,
    feelingPrice,
    qrAddon: hasQR ? QR_ADDON_PRICE : 0,
    qty,
    giftOrderJson: createGiftOrderJson(),
  });

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Please upload an image under 2MB");
      return;
    }
    const r = new FileReader();
    r.onload = () => setPhotoDataUrl(r.result as string);
    r.readAsDataURL(f);
  };

  const handleAdd = () => {
    add(buildCartItem());
    toast.success(`${product.name} added to cart 💕`);
  };

  const buyNow = () => {
    const item = buildCartItem();
    add(item);
    navigate("/checkout", { state: { checkoutItem: item } });
  };

  return (
    <main className="w-full mx-auto px-4 sm:px-6 py-10">
      <div className="text-xs text-muted-foreground mb-6">
        <Link to="/">Home</Link> / <Link to="/products">Shop</Link> /{" "}
        <span style={{ color: "var(--pink-900)" }}>{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div
            className="relative aspect-square rounded-3xl overflow-hidden cursor-zoom-in"
            style={{
              background: "var(--pink-100)",
              boxShadow: "var(--shadow-soft)",
            }}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoomXY({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
          >
            <img
              src={BASE_URL + product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={
                zoom
                  ? {
                      transform: "scale(2)",
                      transformOrigin: `${zoomXY.x}% ${zoomXY.y}%`,
                    }
                  : undefined
              }
            />
            {product.tag && (
              <span
                className="absolute top-4 left-4 text-xs uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/90 backdrop-blur"
                style={{ color: "var(--pink-700)" }}
              >
                {product.tag}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            🔍 Hover the image to zoom
          </p>
        </div>

        <div>
          <h1
            className="font-serif text-3xl md:text-4xl"
            style={{ color: "var(--pink-900)" }}
          >
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <div
              className="flex items-center gap-1"
              style={{ color: "var(--pink-600)" }}
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1 text-foreground font-medium">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              · {product.reviews} reviews
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <div
              className="font-serif text-4xl"
              style={{ color: "var(--pink-700)" }}
            >
              ₹{total}
            </div>
            {(activeCoverPrice > 0 || feelingPrice > 0 || hasQR) && (
              <span className="text-xs text-muted-foreground">
                ₹{product.price} + ₹
                {activeCoverPrice + feelingPrice + (hasQR ? QR_ADDON_PRICE : 0)}{" "}
                add-ons × {qty}
              </span>
            )}
          </div>
          <p className="mt-5 text-sm text-foreground/80 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-7">
            <div className="flex gap-3 flex-wrap">
              {GIFT_COVERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCoverId(c.id);
                    setGiftCover(null);
                  }}
                  title={c.name}
                  className={`relative w-12 h-12 rounded-2xl border-2 transition ${!giftCover && coverId === c.id ? "scale-110" : "border-white shadow-sm"}`}
                  style={{
                    background: c.swatch,
                    borderColor:
                      !giftCover && coverId === c.id
                        ? "var(--pink-600)"
                        : undefined,
                  }}
                >
                  {!giftCover && coverId === c.id && (
                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* write your feelings */}
          <UploadFeeling onUpload={(data: unknown) => setUserFeeling(data)} />

          {/* write free message */}
          <div className="mt-6">
            <label
              className="text-sm font-semibold flex items-center justify-between mb-2"
              style={{ color: "var(--pink-900)" }}
            >
              <span>Your message (free) ✨</span>
              <span className="text-xs text-muted-foreground">
                {message.length}/180
              </span>
            </label>
            <textarea
              value={message}
              maxLength={180}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share what you feel… we'll handwrite it on a card."
              rows={3}
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none resize-none"
              style={{ borderColor: "var(--pink-200)" }}
            />
          </div>

          <div className="mt-5">
            <div
              className="flex items-center justify-between p-4 rounded-2xl border"
              style={{
                background: "var(--pink-50)",
                borderColor: "var(--pink-200)",
              }}
            >
              <div className="flex items-start gap-3">
                <QrCode
                  className="w-5 h-5 mt-0.5"
                  style={{ color: "var(--pink-600)" }}
                />
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--pink-900)" }}
                  >
                    Add a QR keepsake (+₹{QR_ADDON_PRICE})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Generate a QR with your message
                    {photoDataUrl ? " + photo" : ""}, attached to the gift.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setHasQR((v) => !v)}
                className="relative w-11 h-6 rounded-full transition"
                style={{
                  background: hasQR ? "var(--pink-600)" : "var(--pink-200)",
                }}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${hasQR ? "left-5" : "left-0.5"}`}
                />
              </button>
            </div>

            {hasQR && (
              <div
                className="mt-3 flex items-center gap-4 p-3 rounded-2xl bg-white border"
                style={{ borderColor: "var(--pink-100)" }}
              >
                <div
                  className="p-1.5 bg-white border rounded-lg"
                  style={{ borderColor: "var(--pink-100)" }}
                >
                  <QRCodeSVG value={qrValue!} size={72} fgColor="#831843" />
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full font-medium"
                    style={{
                      background: "var(--pink-100)",
                      color: "var(--pink-700)",
                    }}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />{" "}
                    {photoDataUrl
                      ? "Change photo"
                      : "Upload a photo (optional)"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onUpload}
                  />
                  <div className="text-[10px] text-muted-foreground mt-1.5">
                    QR encodes your message + photo link.
                  </div>
                </div>
                {photoDataUrl && (
                  <img
                    src={photoDataUrl}
                    alt="upload"
                    className="w-14 h-14 rounded-lg object-cover border"
                    style={{ borderColor: "var(--pink-100)" }}
                  />
                )}
              </div>
            )}
          </div>

          <div className="mt-7 flex items-center gap-3">
            <div
              className="flex items-center bg-white border rounded-full"
              style={{ borderColor: "var(--pink-200)" }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 font-semibold"
                style={{ color: "var(--pink-700)" }}
              >
                −
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 font-semibold"
                style={{ color: "var(--pink-700)" }}
              >
                +
              </button>
            </div>

            {/* choose cover */}
            <button
              onClick={() => setShowCoverModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border text-sm font-medium"
              style={{
                borderColor: "var(--pink-300)",
                color: "var(--pink-700)",
              }}
            >
              <Gift className="w-4 h-4" />{" "}
              {giftCover ? giftCover.name : "Choose Gift Cover"}
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border text-sm font-medium"
              style={{
                borderColor: "var(--pink-300)",
                color: "var(--pink-700)",
              }}
            >
              <Sparkles className="w-4 h-4" /> 3D Gift Preview
            </button>
          </div>

          {giftCover && (
            <div
              className="mt-4 flex flex-col gap-4 rounded-2xl border bg-white p-3 sm:flex-row sm:items-center"
              style={{
                borderColor: "var(--pink-200)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <img
                src={giftCover.image}
                alt={giftCover.name}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--pink-600)" }}
                    >
                      Chosen cover
                    </p>
                    <h3
                      className="mt-1 text-sm font-semibold"
                      style={{ color: "var(--pink-900)" }}
                    >
                      {giftCover.name}
                    </h3>
                  </div>
                  <span
                    className="shrink-0 text-sm font-semibold"
                    style={{ color: "var(--pink-700)" }}
                  >
                    ₹{giftCover.price}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {giftCover.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoverModal(true)}
                className="w-full rounded-full border px-4 py-2 text-xs font-medium sm:w-auto"
                style={{
                  borderColor: "var(--pink-300)",
                  color: "var(--pink-700)",
                }}
              >
                Change
              </button>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border-2 font-semibold"
              style={{
                borderColor: "var(--pink-600)",
                color: "var(--pink-700)",
              }}
            >
              <Heart className="w-4 h-4" /> Add to Cart
            </button>
            <button
              onClick={buyNow}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold"
              style={{
                background: "var(--gradient-rose)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              Buy Now ₹{total} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="w-4 h-4" style={{ color: "var(--pink-600)" }} />{" "}
            Free shipping over ₹75 · Same-day local delivery
          </div>
        </div>
      </div>

      {/* gift cover modal */}
      {showCoverModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowCoverModal(false)}
        >
          <GiftCover
            setGiftCover={setGiftCover}
            onClose={() => setShowCoverModal(false)}
          />
        </div>
      )}

      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full relative"
            style={{ background: "var(--pink-50)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4"
            >
              <X className="w-5 h-5" />
            </button>
            <h3
              className="font-serif text-2xl mb-2"
              style={{ color: "var(--pink-900)" }}
            >
              Your gift, all wrapped up
            </h3>
            <Gift3DPreview
              coverSwatch={cover.swatch}
              coverName={cover.name}
              qrValue={qrValue}
            />
            {message && (
              <div
                className="mt-4 mx-auto max-w-xs text-center text-sm italic bg-white rounded-2xl p-4 border"
                style={{
                  color: "var(--pink-700)",
                  borderColor: "var(--pink-100)",
                }}
              >
                "{message}"
              </div>
            )}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <section className="mt-20">
          <h2
            className="font-serif text-2xl md:text-3xl mb-6"
            style={{ color: "var(--pink-900)" }}
          >
            You may also love
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {similar.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="group">
                <div
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: "var(--pink-100)" }}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <h3
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--pink-900)" }}
                  >
                    {p.name}
                  </h3>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--pink-700)" }}
                  >
                    ₹{p.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
