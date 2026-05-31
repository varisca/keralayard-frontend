import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import toast from "react-hot-toast";


// Map granular statuses → simplified 4-step pipeline for display
const ADMIN_STATUS_FLOW = [
  "placed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

// Normalise any legacy status to the simplified pipeline
const normalizeOrderStatus = (status = "placed") => {
  const s = status.toString().toLowerCase().trim().replace(/\s+/g, "-");
  if (["placed", "confirmed", "order-placed"].includes(s)) return "placed";
  if (["processing", "packed", "preparing"].includes(s)) return "preparing";
  if (["shipped", "out-for-delivery"].includes(s)) return "shipped";
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "placed";
};

const STATUS_COLORS = {
  placed:    "bg-blue-100 text-blue-700 border-blue-200",
  preparing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped:   "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load orders in real-time from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderList = [];
      snapshot.forEach((d) => {
        const data = d.data();
        orderList.push({
          ...data,
          id: d.id,
          status: normalizeOrderStatus(data.status),
        });
      });
      // Sort by date descending — newest first
      orderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(orderList);
      setLoading(false);
    }, (error) => {
      console.error("Orders sync failed:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.address?.fullName.toLowerCase().includes(search.toLowerCase()) ||
        order.address?.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || order.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    const nextStatus = normalizeOrderStatus(newStatus);
    const previousOrders = orders;
    const previousSelectedOrder = selectedOrder;
    const updatedAt = new Date().toISOString();

    setUpdatingStatus(true);

    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, status: nextStatus, updatedAt }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: nextStatus, updatedAt }));
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt,
      });
      toast.success(`Order status updated to "${nextStatus.replace(/-/g, " ")}"`);
    } catch (err) {
      console.error("Firestore updateDoc status error:", err);
      setOrders(previousOrders);
      setSelectedOrder(previousSelectedOrder);
      toast.error("Could not save order status. Please check Firestore rules and try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Toggle payment status
  const handleTogglePayment = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    const previousOrders = orders;
    const previousSelectedOrder = selectedOrder;
    const updatedAt = new Date().toISOString();

    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus: nextStatus, updatedAt }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, paymentStatus: nextStatus, updatedAt }));
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        paymentStatus: nextStatus,
        updatedAt,
      });
      toast.success(`Payment status marked as ${nextStatus.toUpperCase()}`);
    } catch (err) {
      console.error("Firestore updateDoc payment status error:", err);
      setOrders(previousOrders);
      setSelectedOrder(previousSelectedOrder);
      toast.error("Could not save payment status. Please try again.");
    }
  };

  // Update payment method
  const handleUpdatePaymentMethod = async (orderId, newMethod) => {
    const previousOrders = orders;
    const previousSelectedOrder = selectedOrder;
    const updatedAt = new Date().toISOString();

    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, paymentMethod: newMethod, updatedAt }
          : o
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, paymentMethod: newMethod, updatedAt }));
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        paymentMethod: newMethod,
        updatedAt,
      });
      toast.success(`Payment method updated to "${newMethod}"`);
    } catch (err) {
      console.error("Firestore updateDoc payment method error:", err);
      setOrders(previousOrders);
      setSelectedOrder(previousSelectedOrder);
      toast.error("Could not save payment method. Please try again.");
    }
  };

  // Helpers
  const displayPaymentMethod = (method) => {
    if (!method) return "Cash";
    const m = method.toLowerCase();
    if (m === "cod" || m === "cash") return "Cash";
    return "Online Payment";
  };

  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Filter strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, customer name, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              statusFilter === "all" ? "bg-[#1B6B3A] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Orders
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === "all" ? "bg-white text-[#1B6B3A] font-bold" : "bg-gray-200 text-gray-700 font-semibold"}`}>
              {orders.length}
            </span>
          </button>
          {ADMIN_STATUS_FLOW.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === status
                    ? "bg-[#1B6B3A] text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span>{status.replace(/-/g, " ")}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === status ? "bg-white text-[#1B6B3A] font-bold" : "bg-gray-200 text-gray-700 font-semibold"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin text-[#1B6B3A] mb-3" />
          <p className="text-sm font-medium">Fetching orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl text-gray-400">
          <ShoppingBag size={40} className="mb-3 opacity-40" />
          <p className="font-medium">No orders matching the filters</p>
        </div>
      ) : (
        <>
        <div className="md:hidden space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold text-gray-500 truncate">
                    #{order.id.replace("order_", "").toUpperCase()}
                  </p>
                  <p className="font-semibold text-gray-900 mt-1 truncate">
                    {order.address?.fullName || "Guest Customer"}
                  </p>
                  <p className="text-xs text-gray-500">{order.address?.phone || "N/A"}</p>
                </div>
                <p className="text-base font-bold text-[#1B6B3A] flex-shrink-0">
                  {formatINR(order.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="text-gray-400 font-bold uppercase">Placed</p>
                  <p className="text-gray-700 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-2">
                  <p className="text-gray-400 font-bold uppercase">Payment</p>
                  <button
                    type="button"
                    onClick={() => handleTogglePayment(order.id, order.paymentStatus)}
                    className={`mt-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus?.toUpperCase() || "PENDING"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <select
                  value={order.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/25"
                >
                  {ADMIN_STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <select
                    value={displayPaymentMethod(order.paymentMethod)}
                    onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                    className="min-w-0 flex-1 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="h-9 w-9 inline-flex items-center justify-center bg-gray-50 hover:bg-[#1B6B3A]/10 hover:text-[#1B6B3A] text-gray-500 rounded-xl transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold">Order ID</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Customer Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Contact Number</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Order Date & Time</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Amount</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Order Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Payment Method</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Payment Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-gray-700 text-xs">
                        #{order.id.replace("order_", "").toUpperCase()}
                      </td>

                      {/* Customer Name */}
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {order.address?.fullName || "Guest Customer"}
                      </td>

                      {/* Contact Number */}
                      <td className="px-5 py-4 text-gray-600 font-medium">
                        {order.address?.phone || "N/A"}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Total Amount */}
                      <td className="px-5 py-4 font-bold text-gray-800">
                        {formatINR(order.amount)}
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4 text-center">
                        <select
                          value={order.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-full border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/25"
                          style={{
                            borderColor: order.status === 'delivered' ? '#A7F3D0' : '#D1D5DB',
                            color: order.status === 'delivered' ? '#047857' : '#374151',
                          }}
                        >
                          {ADMIN_STATUS_FLOW.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-4">
                        <select
                          value={displayPaymentMethod(order.paymentMethod)}
                          onChange={(e) => handleUpdatePaymentMethod(order.id, e.target.value)}
                          className="px-2 py-1 text-xs font-semibold border border-gray-200 rounded-xl bg-white cursor-pointer focus:outline-none"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Online Payment">Online Payment</option>
                        </select>
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              order.paymentStatus === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus?.toUpperCase() || "PENDING"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePayment(order.id, order.paymentStatus)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                          >
                            Toggle
                          </button>
                        </div>
                      </td>

                      {/* View Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-gray-50 hover:bg-[#1B6B3A]/10 hover:text-[#1B6B3A] text-gray-400 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* ── Order Detail Slide-Over Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-0 animate-fade-in">
          {/* Overlay Dismissal */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedOrder(null)} />

          {/* Slide-over panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase font-mono">
                  Order ID
                </span>
                <h2 className="font-bold text-gray-800 text-lg leading-tight">
                  #{selectedOrder.id.replace("order_", "").toUpperCase()}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Order Status Controller */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Clock size={13} />
                    Current Status:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                      STATUS_COLORS[selectedOrder.status] || "bg-gray-100"
                    }`}
                  >
                    {selectedOrder.status.replace(/-/g, " ")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Update Progress State
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white cursor-pointer"
                    >
                      {ADMIN_STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1 flex items-center gap-1.5">
                  <User size={13} />
                  Delivery & Contact
                </h3>
                <div className="bg-white border border-gray-100 rounded-xl p-3.5 space-y-2">
                  <p className="font-semibold text-gray-800 text-sm">
                    {selectedOrder.address?.fullName}
                  </p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    📞 {selectedOrder.address?.phone}
                  </p>
                  <div className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                    <MapPin size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {selectedOrder.address?.addressLine1},<br />
                      {selectedOrder.address?.addressLine2 && `${selectedOrder.address.addressLine2}, `}
                      {selectedOrder.address?.city}, {selectedOrder.address?.state} -{" "}
                      <span className="font-semibold">{selectedOrder.address?.pincode}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1 flex items-center gap-1.5">
                  <ShoppingBag size={13} />
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="bg-white p-3 flex justify-between items-center gap-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-800 leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {item.qty} units × {formatINR(item.sellingPrice)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        {formatINR(item.qty * item.sellingPrice)}
                      </span>
                    </div>
                  ))}
                  {/* Summary amount row */}
                  <div className="bg-gray-50/50 p-3 flex justify-between items-center border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500">Subtotal Amount</span>
                    <span className="text-sm font-extrabold text-[#1B6B3A]">
                      {formatINR(selectedOrder.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1 flex items-center gap-1.5">
                  <CreditCard size={13} />
                  Payment Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Method</span>
                    <select
                      value={displayPaymentMethod(selectedOrder.paymentMethod)}
                      onChange={(e) => handleUpdatePaymentMethod(selectedOrder.id, e.target.value)}
                      className="mt-1 w-full px-2 py-1 text-xs font-bold border border-gray-200 rounded-lg bg-white cursor-pointer focus:outline-none"
                    >
                      <option value="Cash">🤝 Cash</option>
                      <option value="Online Payment">💳 Online Payment</option>
                    </select>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Status</span>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-xs font-extrabold capitalize ${
                          selectedOrder.paymentStatus === "paid" ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleTogglePayment(selectedOrder.id, selectedOrder.paymentStatus)
                        }
                        className="text-[10px] text-[#1B6B3A] hover:underline font-semibold cursor-pointer"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meta information */}
              <div className="border-t border-gray-50 pt-4 flex items-center gap-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Placed: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            {/* Modal Footer actions */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-3 flex-shrink-0">
              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" ? (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Mark as Delivered
                </button>
              ) : null}
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2 px-4 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
