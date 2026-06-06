import React, { useState, useEffect } from "react";
import {
  Package,
  X,
  Loader2,
  FileText,
  ShoppingBag,
  User,
  Heart,
  Gift,
} from "lucide-react";

interface OrderItem {
  id: number;
  userId: number;
  totalAmount: number;
  transactionId: string;
  productId: number;
  coverId: number | null;
  feelingId: number | null;
  freeMessage: string;
  createdAt: string;
  status: string;
}

// Updated interface to include feeling and giftCover objects
interface OrderDetail {
  user: {
    fname: string;
    lname: string;
    email: string;
    address: Array<{ state: string; pincode: string; landmark: string }>;
    mobileNumbers: string[];
  };
  product: {
    title: string;
    description: string;
    price: number;
    productImage: string;
    color: string;
  };
  giftCover: {
    id: number;
    coverImage: string;
    name: string;
    price: number;
  } | null;
  feeling: {
    id: number;
    media: string;
  } | null;
  totalPrice: number;
  message: string;
  transactionId: string;
}

export default function ProfileOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    if (selectedOrderId !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedOrderId]);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8080/api/p/orders", {
      method: "GET",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized access.");
        return res.json();
      })
      .then((data) => data?.content && setOrders(data.content))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedOrderId) return;
    setLoadingDetail(true);
    setDetailData(null);

    fetch(`http://localhost:8080/api/p/orders/${selectedOrderId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setDetailData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingDetail(false));
  }, [selectedOrderId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-3 w-full max-w-4xl mx-auto px-4 md:px-0">
      {/* --- Order List --- */}
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => setSelectedOrderId(order.id)}
          className="bg-white rounded-2xl border p-4 md:p-5 flex items-center gap-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
          style={{ borderColor: "var(--pink-100)" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--pink-100)", color: "var(--pink-700)" }}
          >
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline gap-3 mb-1">
              <div
                className="font-medium truncate"
                style={{ color: "var(--pink-900)" }}
              >
                Order #{order.id}
              </div>
              <div
                className="font-semibold shrink-0"
                style={{ color: "var(--pink-700)" }}
              >
                ₹{order.totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-muted-foreground truncate mb-2">
              TXN: {order.transactionId}
            </div>
            <div className="text-xs flex items-center gap-2">
              <span className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-50"
                style={{ color: "var(--pink-600)" }}
              >
                { order.status || "Processing" }
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* --- Backdrop overlay --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300`}
        style={{
          zIndex: 9998,
          display: selectedOrderId !== null ? "block" : "none",
        }}
        onClick={() => setSelectedOrderId(null)}
      />

      {/* --- Drawer Panel --- */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md md:max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 transform ${
          selectedOrderId !== null ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ zIndex: 9999 }}
      >
        {loadingDetail && (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        )}

        {!loadingDetail && detailData && (
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Details
                </h2>
                <p className="text-xs text-gray-500">
                  ID: {detailData.transactionId}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" /> Items ordered
                </h3>
                <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={`http://localhost:8080${detailData.product.productImage}`}
                      alt={detailData.product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-snug">
                      {detailData.product.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Color: {detailData.product.color}
                    </p>
                    <div className="text-sm font-semibold text-gray-900 mt-1">
                      ₹{detailData.product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Gift Cover Section */}
              {detailData.giftCover && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5" /> Premium Gift Cover
                  </h3>
                  <div className="flex gap-4 p-3 bg-pink-50/40 rounded-xl border border-pink-100/60 items-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={`http://localhost:8080${detailData.giftCover.coverImage}`}
                        alt="Gift Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-900">
                        {detailData.giftCover.name || "Custom Wrap"}
                      </h4>
                      <p className="text-xs text-pink-700 font-medium">
                        + ₹{detailData.giftCover.price}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW: Feel / Dynamic Media Card Section */}
              {detailData.feeling && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Attached QR / Digital
                    Experience
                  </h3>
                  <div className="border border-dashed border-pink-200 bg-pink-50/20 p-3 rounded-xl flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg border overflow-hidden p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={`http://localhost:8080${detailData.feeling.media}`}
                        alt="Feeling QR / Media"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-pink-800 block mb-0.5">
                        Custom Digital Media Attached
                      </span>
                      This order includes a scanable interactive component
                      previewed on the left.
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Message */}
              {detailData.message && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Personal Message
                  </h3>
                  <div className="p-4 rounded-xl italic text-sm text-pink-900 bg-pink-50 border border-pink-100">
                    "{detailData.message}"
                  </div>
                </div>
              )}

              {/* Delivery Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Delivery Details
                </h3>
                <div className="border rounded-xl p-4 space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="block font-medium text-gray-900">
                      {detailData.user.fname} {detailData.user.lname}
                    </span>
                    <span className="text-xs text-gray-500">
                      {detailData.user.email}
                    </span>
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                    <span className="block text-xs font-medium text-gray-400 mb-0.5">
                      Address
                    </span>
                    {detailData.user.address.map((addr, idx) => (
                      <p
                        key={idx}
                        className="text-xs leading-relaxed text-gray-600"
                      >
                        {addr.landmark}, {addr.state} -{" "}
                        <span className="font-mono">{addr.pincode}</span>
                      </p>
                    ))}
                  </div>
                  <hr className="border-gray-100" />
                  <div>
                    <span className="block text-xs font-medium text-gray-400 mb-0.5">
                      Contact
                    </span>
                    <p className="text-xs font-mono text-gray-600">
                      {detailData.user.mobileNumbers.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="p-6 border-t bg-gray-50 sticky bottom-0 mt-auto">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Grand Total
                </span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{detailData.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
