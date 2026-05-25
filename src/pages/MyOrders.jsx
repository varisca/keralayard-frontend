import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { dummyOrders } from "../assets/keralaData";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

// ── Order status pipeline ────────────────────────────────────────────────
const STATUS_STEPS = [
  "placed",
  "confirmed",
  "packed",
  "out for delivery",
  "delivered",
];

const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  "out for delivery": "Out for Delivery",
  delivered: "Delivered",
  shipped: "Out for Delivery", // alias
  processing: "Confirmed",     // alias
  cancelled: "Cancelled",
};

// Normalise status string to one of our known keys
const normaliseStatus = (raw = "") => {
  const s = raw.toLowerCase().trim();
  if (s === "shipped") return "out for delivery";
  if (s === "processing") return "confirmed";
  return s;
};

// ── Status Badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = normaliseStatus(status);
  const configs = {
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-600 border-red-200",
    placed: "bg-blue-100 text-blue-600 border-blue-200",
    confirmed: "bg-yellow-100 text-yellow-700 border-yellow-200",
    packed: "bg-orange-100 text-orange-600 border-orange-200",
    "out for delivery": "bg-purple-100 text-purple-600 border-purple-200",
  };
  const cls =
    configs[s] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {STATUS_LABELS[s] || status}
    </span>
  );
};

// ── Active Order Status Timeline ──────────────────────────────────────────
const StatusTimeline = ({ status }) => {
  const normStatus = normaliseStatus(status);
  const currentIdx = STATUS_STEPS.indexOf(normStatus);

  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex items-center min-w-max gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex items-center">
              {/* Step dot */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isCurrent
                      ? "bg-white border-primary text-primary ring-4 ring-primary/20"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium text-center max-w-[64px] leading-tight ${
                    isCurrent
                      ? "text-primary font-bold"
                      : isCompleted
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`h-0.5 w-10 sm:w-14 mx-1 rounded-full transition-all ${
                    isCompleted ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Format date ──────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// ── Active Order Card ─────────────────────────────────────────────────────
const ActiveOrderCard = ({ order, currency }) => {
  const totalItems = order.items?.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0) || 0;

  return (
    <div className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden mb-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 px-5 py-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">ORDER ID</p>
          <p className="text-sm font-bold text-dark font-mono">#{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium mb-0.5">ORDER DATE</p>
          <p className="text-sm font-semibold text-dark">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">ITEMS</p>
          <p className="text-sm font-semibold text-dark">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium mb-0.5">TOTAL</p>
          <p className="text-base font-bold text-primary">
            {currency}{order.amount}
          </p>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="px-5 py-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Tracking
        </p>
        <StatusTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Items
        </p>
        <div className="flex flex-col gap-2">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                {item.qty || item.quantity || 1}
              </span>
              <span className="truncate">{item.name || item.productId}</span>
              <span className="ml-auto text-gray-400 flex-shrink-0 font-medium">
                {currency}{(item.sellingPrice || item.offerPrice || 0) * (item.qty || item.quantity || 1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── History Order Card ────────────────────────────────────────────────────
const HistoryOrderCard = ({ order, currency }) => {
  const [expanded, setExpanded] = useState(false);
  const totalItems = order.items?.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 animate-fade-in">
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <p className="text-xs text-gray-400 mb-0.5">ORDER ID</p>
          <p className="text-sm font-bold text-dark font-mono">#{order.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">DATE</p>
          <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">ITEMS</p>
          <p className="text-sm text-gray-700">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">TOTAL</p>
          <p className="text-sm font-bold text-primary">{currency}{order.amount}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Items
          </p>
          <div className="flex flex-col gap-2.5">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                  ×{item.qty || item.quantity || 1}
                </span>
                <span className="truncate text-gray-700">
                  {item.name || item.productId}
                </span>
                <span className="ml-auto text-gray-500 flex-shrink-0">
                  {currency}
                  {(item.sellingPrice || item.offerPrice || 0) *
                    (item.qty || item.quantity || 1)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Delivered to
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {order.address.fullName} — {order.address.addressLine1}
                {order.address.addressLine2
                  ? `, ${order.address.addressLine2}`
                  : ""}
                , {order.address.city}, {order.address.state} –{" "}
                {order.address.pincode}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const MyOrders = () => {
  const { user, currency, navigate } = useAppContext();
  const displayUser = user && !user.isStaff ? user : null;

  // Use dummyOrders as initial state (Firebase is placeholder)
  const [orders, setOrders] = useState(dummyOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!displayUser) {
      // Still show demo orders for unauthenticated preview
      setOrders(dummyOrders);
      setLoading(false);
      return;
    }

    // Attempt real-time Firestore listener
    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", displayUser.uid)
      );
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            // No real orders yet — keep dummies for demo
            setOrders(dummyOrders);
          } else {
            const realOrders = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            // Sort newest first
            realOrders.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(realOrders);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Orders listener error:", err);
          // Fallback to dummy data
          setOrders(dummyOrders);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Firestore setup error:", err);
      setOrders(dummyOrders);
      setLoading(false);
    }

    return () => unsubscribe();
  }, [displayUser]);

  // Split orders by active vs history
  const activeOrders = orders.filter((o) => {
    const s = normaliseStatus(o.status);
    return s !== "delivered" && s !== "cancelled";
  });

  const historyOrders = orders.filter((o) => {
    const s = normaliseStatus(o.status);
    return s === "delivered" || s === "cancelled";
  });

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-warm pt-10 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="skeleton h-8 w-40 rounded mb-8" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 animate-pulse"
            >
              <div className="skeleton h-5 w-48 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-warm flex flex-col items-center justify-center py-24 text-center px-4">
        <span className="text-7xl mb-4">🛍️</span>
        <h2 className="text-2xl font-bold text-dark mb-2">No orders yet</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          Looks like you haven't placed any orders yet. Start exploring our
          authentic Kerala products!
        </p>
        <button
          onClick={() => navigate("/products")}
          className="btn-primary px-8 py-3"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-dark">My Orders</h1>
          <div className="w-16 h-1 bg-primary rounded-full mt-2" />
        </div>

        {/* ── Active Orders Section ──────────────────────────────── */}
        {activeOrders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse-soft" />
              <h2 className="text-lg font-bold text-dark">
                Active Orders
              </h2>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                {activeOrders.length}
              </span>
            </div>

            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                currency={currency}
              />
            ))}
          </section>
        )}

        {/* ── Order History Section ──────────────────────────────── */}
        {historyOrders.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg font-bold text-dark">Order History</h2>
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                {historyOrders.length}
              </span>
            </div>

            {historyOrders.map((order) => (
              <HistoryOrderCard
                key={order.id}
                order={order}
                currency={currency}
              />
            ))}
          </section>
        )}

        {/* ── Shop more CTA ──────────────────────────────────────── */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate("/products")}
            className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-2.5 rounded-full text-sm font-medium transition-all"
          >
            Continue Shopping →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
