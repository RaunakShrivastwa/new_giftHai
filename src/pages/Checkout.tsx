import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, CreditCard, Heart } from "lucide-react";
import { toast } from "sonner";

import { type CartItem, useCart } from "../lib/cart";
import { RootState } from "../store/dataStore";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Checkout() {
  const { items, subtotal, clear, remove } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [placed, setPlaced] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  const recipientName = useMemo(
    () => (user ? `${user.fname || ""} ${user.lname || ""}`.trim() : ""),
    [user],
  );
  const phoneNumber = useMemo(
    () => (user ? (user.mobileNumbers?.[0] ?? "") : ""),
    [user],
  );

  

  const checkoutState = location.state as { checkoutItem?: CartItem } | null;
  const checkoutItems = checkoutState?.checkoutItem
    ? [checkoutState.checkoutItem]
    : items;
  const currentSubtotal = checkoutItems.reduce(
    (sum, i) =>
      sum +
      (i.basePrice + i.coverPrice + i.qrAddon + (i.feelingPrice ?? 0)) * i.qty,
    0,
  );

  
  console.log("mmmmmmmm ", checkoutItems);

  useEffect(() => {
    if (!user) return;
    const rawAddress = user.address?.[0];

    if (typeof rawAddress === "string") {
      setAddressLine1(rawAddress);
      return;
    }

    setAddressLine1(
      rawAddress?.line1 ||
        rawAddress?.street ||
        rawAddress?.address1 ||
        rawAddress?.address ||
        "",
    );
    setAddressLine2(rawAddress?.line2 || rawAddress?.address2 || "");
    setCity(rawAddress?.city || "");
    setPostcode(
      rawAddress?.postcode || rawAddress?.zip || rawAddress?.pin || "",
    );
  }, [user]);

  const shipping = currentSubtotal >= 75 || currentSubtotal === 0 ? 0 : 9;
  const discountedSubtotal = Math.max(0, currentSubtotal - discount);
  const total = discountedSubtotal + shipping;

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage("Please enter a coupon code.");
      setDiscount(0);
      return;
    }

    if (code === "GIFT10") {
      const amount = Math.floor(currentSubtotal * 0.1);
      setDiscount(amount);
      setCouponMessage(`10% discount applied — ₹${amount} off`);
      return;
    }

    setDiscount(0);
    setCouponMessage("Invalid coupon code.");
  };

 const placeOrder = async (e: FormEvent<HTMLFormElement>) => {
   e.preventDefault();

   const token = localStorage.getItem("token");
   if (!token) {
     toast.error("Please login again to place your order.");
     return;
   }

   // Load Razorpay SDK
   const isScriptLoaded = await loadRazorpayScript();
   if (!isScriptLoaded) {
     toast.error("Razorpay SDK failed to load. Are you online?");
     return;
   }

   try {
     setPlacingOrder(true);

     // 1. Hit your Spring Boot backend to create the PENDING DB entries and Razorpay orders
     const orderPromises = checkoutItems.map((item) => {
       const unitPrice =
         item.basePrice +
         item.coverPrice +
         item.qrAddon +
         (item.feelingPrice ?? 0);
       const itemTotal = unitPrice * item.qty;
       const savedOrder = item.giftOrderJson;
       const productId = savedOrder?.productId ?? item.productId;
       let coverId: any = savedOrder?.coverId ?? item.coverId ?? 0;
       const giftMessage = savedOrder?.giftMessage ?? item.message ?? "";

       if (typeof coverId === "string") {
         coverId = null;
       }

       const payload = {
         userId: savedOrder?.userId ?? user?.id ?? null,
         totalAmount: checkoutItems.length === 1 ? total : itemTotal,
         productId: Number.isNaN(Number(productId))
           ? productId
           : Number(productId),
         coverId: coverId,
         feelingId: savedOrder?.feelingId ?? null,
         freeMessage: giftMessage,
       };

       return fetch(`${BASE_URL}/api/p/orders`, {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(payload),
       }).then(async (res) => {
         if (!res.ok) throw new Error("Order setup failed");
         return res.json(); // Returns the ProductOrder object saved in backend
       });
     });

     const createdOrders = await Promise.all(orderPromises);

     // If handling multiple items checkout simultaneously, you can map them.
     // For simplicity of checkout UI configuration, we use the first item or pass an overarching ID.
     const referenceOrder = createdOrders[0];

     // 2. Open Razorpay checkout configuration setup
     const options = {
       key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure your public key id is here
       amount: referenceOrder.totalAmount * 100, // Matching paise configuration
       currency: "INR",
       name: "Gift Hai Be",
       description: "Purchase Payment",
       order_id: referenceOrder.transactionId, // This is the ID returned by backend rzpOrder.get("id")
       handler: async function (response: any) {
         // This function executes when payment succeeds
         toast.success("Payment Received!");

         // OPTIONAL BUT RECOMMENDED: Verify payment on your backend here
         // await fetch(`${BASE_URL}/api/p/orders/verify`, { method: "POST", body: ... })

         setPlaced(true);
         if (checkoutState?.checkoutItem) {
           remove(checkoutState.checkoutItem.key);
         } else {
           clear();
         }
         toast.success("Order placed with love 💕");
         setTimeout(() => navigate("/profile/orders"), 1500);
       },
       prefill: {
         name: recipientName || "User Name",
         contact: phoneNumber || "",
       },
       theme: {
         color: "#db2777", // Pink primary brand color targeting your CSS layout
       },
       modal: {
         ondismiss: () => {
           setPlacingOrder(false);
           toast.error("Payment window closed.");
         },
       },
     };

     const rzp1 = new (window as any).Razorpay(options);
     rzp1.open();
   } catch (error) {
     const message =
       error instanceof Error ? error.message : "Order creation failed";
     toast.error(message);
     setPlacingOrder(false);
   }
 };

  if (checkoutItems.length === 0 && !placed) {
    return (
      <main className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1
          className="font-serif text-3xl"
          style={{ color: "var(--pink-900)" }}
        >
          Nothing to checkout
        </h1>
        <p className="mt-3 text-muted-foreground">
          Add a gift to your cart before proceeding to checkout.
        </p>
      </main>
    );
  }

  if (placed) {
    return (
      <main className="max-w-xl mx-auto px-6 py-20 text-center">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white"
          style={{ background: "var(--gradient-rose)" }}
        >
          <Check className="w-8 h-8" />
        </div>
        <h1
          className="mt-6 font-serif text-4xl"
          style={{ color: "var(--pink-900)" }}
        >
          Order confirmed!
        </h1>
        <p className="mt-3 text-muted-foreground">
          We'll wrap it with love and deliver soon. Redirecting…
        </p>
      </main>
    );
  }

  const inputCls = "rounded-xl border px-4 py-3 text-sm outline-none";
  const inputStyle = { borderColor: "var(--pink-200)" } as React.CSSProperties;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <h1
        className="font-serif text-4xl mb-8"
        style={{ color: "var(--pink-900)" }}
      >
        Checkout
      </h1>

      <form
        onSubmit={placeOrder}
        className="grid lg:grid-cols-[1fr_400px] gap-10"
      >
        <div className="space-y-8">
          {/* user details */}
          <section
            className="bg-white rounded-2xl border p-6"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <h2
              className="font-serif text-xl mb-4"
              style={{ color: "var(--pink-900)" }}
            >
              Delivery details
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                value={recipientName || "Root user"}
                readOnly
                placeholder="Recipient name"
                className={`${inputCls} bg-slate-50 text-slate-700`}
                style={inputStyle}
              />
              <input
                value={phoneNumber || "N/A"}
                placeholder="Phone"
                className={`${inputCls} bg-slate-50 text-slate-700`}
                style={inputStyle}
              />
              <input
                required
                value={[user?.address?.[0]?.landmark || ""]}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Address line 1"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
              <input
                required
                value={[user?.address?.[0]?.state || ""]}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className={inputCls}
                style={inputStyle}
              />
              <input
                required
                value={[user?.address?.[0]?.pincode || "000000"]}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode"
                className={inputCls}
                style={inputStyle}
              />
              <input
                value={addressLine2}
                readOnly={!addressLine1}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Address line 2"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
            </div>
          </section>

          <section
            className="bg-white rounded-2xl border p-6"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <h2
              className="font-serif text-xl mb-4 flex items-center gap-2"
              style={{ color: "var(--pink-900)" }}
            >
              <CreditCard
                className="w-5 h-5"
                style={{ color: "var(--pink-600)" }}
              />{" "}
              Payment
            </h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
               
                placeholder="Card number"
                className={`sm:col-span-2 ${inputCls}`}
                style={inputStyle}
              />
              <input
                
                placeholder="MM / YY"
                className={inputCls}
                style={inputStyle}
              />
              <input
               
                placeholder="CVC"
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Demo only — no card will be charged.
            </p>
          </section>
        </div>

        <aside
          className="bg-white rounded-2xl border p-6 h-fit lg:sticky lg:top-24"
          style={{
            borderColor: "var(--pink-100)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <h2
            className="font-serif text-xl mb-4"
            style={{ color: "var(--pink-900)" }}
          >
            Order summary
          </h2>

          <div className="space-y-4 max-h-72 overflow-auto pr-2">
            {checkoutItems.map((i) => {
              const unitPrice =
                i.basePrice + i.coverPrice + i.qrAddon + (i.feelingPrice ?? 0);
              const linePrice = unitPrice * i.qty;

              return (
                <div
                  key={i.key}
                  className="rounded-3xl border p-4"
                  style={{ borderColor: "var(--pink-100)" }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={BASE_URL + i.image}
                      alt={i.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        style={{ color: "var(--pink-900)" }}
                      >
                        {i.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Qty {i.qty} · ₹{unitPrice} each
                      </div>
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--pink-700)" }}
                    >
                      ₹{linePrice}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-medium">Wrap:</span> {i.coverName}
                      {i.coverPrice ? ` (+₹${i.coverPrice})` : " (free)"}
                    </div>
                    {i.message && (
                      <div>
                        <span className="font-medium">Message:</span> "
                        {i.message}"{" "}
                        <span className="text-slate-400">(free)</span>
                      </div>
                    )}
                    {(i.feelingPrice ?? 0) > 0 && (
                      <div>
                        <span className="font-medium">Feeling upload:</span> +₹
                        {i.feelingPrice}
                      </div>
                    )}
                    {i.qrAddon > 0 && (
                      <div>
                        <span className="font-medium">QR keepsake:</span> +₹
                        {i.qrAddon}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="mt-5 rounded-3xl border bg-slate-50 p-4"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <label className="text-sm font-medium text-slate-700">
              Apply coupon
            </label>
            <div className="mt-3 flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className={`${inputCls} flex-1 bg-white`}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={applyCoupon}
                className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
            {couponMessage && (
              <p className="mt-3 text-xs text-slate-600">{couponMessage}</p>
            )}
          </div>

          <div
            className="mt-4 pt-4 border-t space-y-2 text-sm"
            style={{ borderColor: "var(--pink-100)" }}
          >
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{currentSubtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? "Free 💕" : `₹${shipping}`}</span>
            </div>
            <div
              className="flex justify-between items-baseline pt-2 border-t mt-2"
              style={{ borderColor: "var(--pink-100)" }}
            >
              <span className="text-sm text-muted-foreground">Total</span>
              <span
                className="font-serif text-2xl"
                style={{ color: "var(--pink-700)" }}
              >
                ₹{total}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={placingOrder}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-semibold"
            style={{
              background: "var(--gradient-rose)",
              boxShadow: "var(--shadow-soft)",
              opacity: placingOrder ? 0.7 : 1,
            }}
          >
            <Heart className="w-4 h-4" fill="currentColor" />{" "}
            {placingOrder ? "Placing Order..." : `Place Order · ₹${total}`}
          </button>
        </aside>
      </form>
    </main>
  );
}



const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};