import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const CANCELLATION_WINDOW_MS = 12 * 60 * 60 * 1000;

// ── Order status pipeline ────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "placed",    label: "Order Placed", icon: "📦" },
  { key: "preparing", label: "Preparing",    icon: "🍳" },
  { key: "shipped",   label: "Shipped",      icon: "🚚" },
  { key: "delivered", label: "Delivered",    icon: "✅" },
];

// Map old granular statuses → simplified 4-step pipeline
const normaliseStatus = (raw = "") => {
  const s = raw.toString().toLowerCase().trim().replace(/\s+/g, "-");
  if (["placed", "confirmed"].includes(s) || s === "order-placed") return "placed";
  if (["processing", "packed"].includes(s)) return "preparing";
  if (["shipped", "out-for-delivery"].includes(s)) return "shipped";
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "placed";
};

const getOrderDateMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getCancellationInfo = (order, now = Date.now()) => {
  const createdAtMs = getOrderDateMillis(order.createdAt);
  const status = normaliseStatus(order.status);
  const deadlineMs = createdAtMs + CANCELLATION_WINDOW_MS;
  const isFinal = status === "delivered" || status === "cancelled";

  return {
    canCancel: Boolean(createdAtMs) && !isFinal && now <= deadlineMs,
    remainingMs: Math.max(0, deadlineMs - now),
  };
};

const STATUS_LABELS = {
  placed:    "Order Placed",
  preparing: "Preparing",
  shipped:   "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ── Status Badge ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = normaliseStatus(status);
  const configs = {
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled:  "bg-red-100 text-red-600 border-red-200",
    placed:     "bg-blue-100 text-blue-600 border-blue-200",
    preparing:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    shipped:    "bg-purple-100 text-purple-600 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${configs[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {STATUS_LABELS[s] || status}
    </span>
  );
};

// ── Active Order Status Timeline ──────────────────────────────────────────
const StatusTimeline = ({ status }) => {
  const normStatus = normaliseStatus(status);
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === normStatus);

  return (
    <div className="flex items-center w-full mt-2">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent   = idx === currentIdx;
        const isLast      = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                isCompleted
                  ? "bg-primary border-primary"
                  : isCurrent
                  ? "bg-white border-primary ring-4 ring-primary/20"
                  : "bg-white border-gray-200"
              }`}>
                {isCompleted ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={isCurrent ? "" : "grayscale opacity-40"}>{step.icon}</span>
                )}
              </div>
              <span className={`text-[11px] font-semibold text-center whitespace-nowrap ${
                isCurrent ? "text-primary" : isCompleted ? "text-gray-600" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${isCompleted ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Format date ──────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return "—";
  const millis = getOrderDateMillis(iso);
  if (!millis) return "-";
  return new Date(millis).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatRemainingTime = (ms) => {
  const totalMinutes = Math.ceil(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m left`;
  if (minutes === 0) return `${hours}h left`;
  return `${hours}h ${minutes}m left`;
};

// ── Active Order Card ─────────────────────────────────────────────────────
const ActiveOrderCard = ({ order, currency, now, cancelling, onCancel }) => {
  const totalItems = order.items?.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0) || 0;
  const cancellation = getCancellationInfo(order, now);

  return (
    <div className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden mb-6 animate-fade-in-up">
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 px-5 py-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-0.5">ORDER ID</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-dark font-mono">#{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
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

      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-gray-500">
          {cancellation.canCancel
            ? `You can cancel this order for ${formatRemainingTime(cancellation.remainingMs)}.`
            : "The 12-hour cancellation window has closed."}
        </p>
        {cancellation.canCancel && (
          <button
            type="button"
            onClick={() => onCancel(order)}
            disabled={cancelling}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-white text-sm font-semibold hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
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
  const { currency, navigate } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  useEffect(() => {
    let unsubOrders = null;

    // onAuthStateChanged fires immediately with current auth state
    // (or null) and re-fires on every auth change — fully reactive.
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up any previous orders listener
      if (unsubOrders) {
        unsubOrders();
        unsubOrders = null;
      }

      const uid = firebaseUser?.uid;
      if (!uid) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid)
      );

      unsubOrders = onSnapshot(
        q,
        (snapshot) => {
          const realOrders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          realOrders.sort((a, b) => getOrderDateMillis(b.createdAt) - getOrderDateMillis(a.createdAt));
          setOrders(realOrders);
          setLoading(false);
        },
        (err) => {
          console.error("Orders listener error:", err);
          setOrders([]);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubOrders) unsubOrders();
    };
  }, []); // onAuthStateChanged handles all auth reactivity — no deps needed

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelOrder = async (order) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Please sign in to cancel your order");
      return;
    }

    if (order.userId && order.userId !== currentUser.uid) {
      toast.error("You can only cancel your own orders");
      return;
    }

    if (!getCancellationInfo(order).canCancel) {
      toast.error("Orders can only be cancelled within 12 hours of placing them");
      return;
    }

    const confirmed = window.confirm("Cancel this order? This action cannot be undone.");
    if (!confirmed) return;

    setCancellingOrderId(order.id);
    try {
      const timestamp = new Date().toISOString();
      await updateDoc(doc(db, "orders", order.id), {
        status: "cancelled",
        cancelledAt: timestamp,
        cancelledBy: currentUser.uid,
        updatedAt: timestamp,
      });
      toast.success("Order cancelled successfully");
    } catch (err) {
      console.error("Order cancellation failed:", err);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId("");
    }
  };

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

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
                now={now}
                cancelling={cancellingOrderId === order.id}
                onCancel={handleCancelOrder}
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
