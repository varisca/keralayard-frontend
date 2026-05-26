import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Calendar,
  Eye,
  TrendingUp,
  ShoppingBag,
  Loader2,
  X,
  MapPin,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import toast from "react-hot-toast";

// Curated status colors matching standard order timelines
const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-purple-100 text-purple-700 border-purple-200",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  packed: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped: "bg-pink-100 text-pink-700 border-pink-200",
  "out-for-delivery": "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // CRM Detail view states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'orders'
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // Load real-time users & orders from Firestore
  useEffect(() => {
    // 1. Listen to customers (real data only — no mock seeding)
    const unsubUsers = onSnapshot(collection(db, "customers"), (snapshot) => {
      const userList = [];
      snapshot.forEach((docSnap) => {
        userList.push({ ...docSnap.data(), uid: docSnap.id });
      });
      setUsers(userList);
    }, (err) => {
      console.error("Failed to subscribe to customers collection:", err);
      setLoading(false);
    });

    // 2. Listen to orders to aggregate metrics
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderList = [];
      snapshot.forEach((docSnap) => {
        orderList.push({ ...docSnap.data(), id: docSnap.id });
      });
      setOrders(orderList);
      setLoading(false);
    }, (err) => {
      console.warn("Failed to subscribe to orders collection:", err);
      setLoading(false); // Safeguard: turn off spinner even if permission is denied
    });

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, []);

  // Fetch addresses of selected customer when opened
  useEffect(() => {
    if (!selectedCustomer) {
      setCustomerAddresses([]);
      return;
    }
    setAddressesLoading(true);
    const q = query(
      collection(db, "addresses"),
      where("userId", "==", selectedCustomer.uid)
    );
    getDocs(q)
      .then((snap) => {
        const list = [];
        snap.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id });
        });
        setCustomerAddresses(list);
        setAddressesLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load customer addresses:", err);
        setAddressesLoading(false);
      });
  }, [selectedCustomer]);

  // Aggregate stats per user
  const userStats = useMemo(() => {
    return users.map((user) => {
      const userOrders = orders.filter(
        (o) =>
          o.userId === user.uid ||
          o.address?.fullName?.toLowerCase() === user.name?.toLowerCase()
      );
      const totalSpend = userOrders.reduce((sum, o) => sum + o.amount, 0);
      return {
        ...user,
        orderCount: userOrders.length,
        totalSpend,
      };
    });
  }, [users, orders]);

  // Search filter
  const filteredUsers = useMemo(() => {
    return userStats.filter(
      (u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [userStats, search]);

  // Filter orders placed by the selected customer
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.userId === selectedCustomer.uid ||
        o.address?.fullName?.toLowerCase() === selectedCustomer.name?.toLowerCase()
    );
  }, [selectedCustomer, orders]);

  // Helpers
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.seconds
      ? new Date(dateString.seconds * 1000)
      : new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {filteredUsers.length} registered buyer{filteredUsers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Analytics Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Customer Base</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{users.length}</p>
          </div>
        </div>

        {/* Total Orders Placed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Total Orders</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{orders.length}</p>
          </div>
        </div>

        {/* Avg Spent Per Customer */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Avg. Purchase</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">
              {users.length > 0
                ? formatINR(orders.reduce((sum, o) => sum + o.amount, 0) / users.length)
                : formatINR(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer names or email addresses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
          />
        </div>
      </div>

      {/* Customers List table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin text-[#1B6B3A] mb-3" />
          <p className="text-sm font-medium">Fetching customer directory...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl text-gray-400 text-center">
          <Users size={40} className="mb-3 opacity-40 mx-auto" />
          <p className="font-medium">No customers found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold">User Info</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Joined Date</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Orders</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Spending</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((userStatsItem) => (
                  <tr key={userStatsItem.uid} className="hover:bg-gray-50/50 transition-colors">
                    {/* User profile with Avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                          {userStatsItem.photoURL ? (
                            <img
                              src={userStatsItem.photoURL}
                              alt={userStatsItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-sm">
                              {userStatsItem.name ? userStatsItem.name[0].toUpperCase() : "U"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 leading-tight truncate max-w-[200px]">
                            {userStatsItem.name || "Anonymous User"}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">
                            {userStatsItem.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{formatDate(userStatsItem.createdAt)}</span>
                      </div>
                    </td>

                    {/* Total orders */}
                    <td className="px-5 py-3.5 text-center font-bold text-gray-700">
                      {userStatsItem.orderCount}
                    </td>

                    {/* Total spending */}
                    <td className="px-5 py-3.5 font-bold text-[#1B6B3A] whitespace-nowrap">
                      {formatINR(userStatsItem.totalSpend)}
                    </td>

                    {/* Eye Profile action button */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCustomer(userStatsItem);
                          setActiveTab("details");
                        }}
                        className="p-1.5 bg-gray-50 hover:bg-[#1B6B3A]/10 hover:text-[#1B6B3A] text-gray-400 rounded-lg transition-colors cursor-pointer"
                        title="View Customer Profile"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Customer Details Slide-Over Modal ── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 p-0 animate-fade-in">
          {/* Dismiss overlay */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setSelectedCustomer(null)}
          />

          {/* Slide-over panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-right">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-lg border border-green-100 shadow-sm flex-shrink-0">
                  {selectedCustomer.name ? selectedCustomer.name[0].toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">
                    {selectedCustomer.name || "Customer Profile"}
                  </h2>
                  <p className="text-gray-400 text-xs truncate mt-0.5">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Navigation Strips */}
            <div className="flex border-b border-gray-100 flex-shrink-0 bg-white shadow-xs">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "details"
                    ? "border-[#1B6B3A] text-[#1B6B3A]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/20"
                }`}
              >
                👤 Profile Details
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "border-[#1B6B3A] text-[#1B6B3A]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/20"
                }`}
              >
                📦 Orders List ({customerOrders.length})
              </button>
            </div>

            {/* Modal Body content scrollable */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50/40 space-y-5">
              {activeTab === "details" ? (
                <div className="space-y-5">
                  {/* Total Metrics Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Purchases
                      </p>
                      <p className="text-xl font-black text-gray-800 mt-1">
                        {customerOrders.length} order{customerOrders.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Spending
                      </p>
                      <p className="text-xl font-black text-[#1B6B3A] mt-1">
                        {formatINR(selectedCustomer.totalSpend)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Information detail log */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1.5">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Account ID</p>
                        <p className="text-gray-800 font-mono font-medium truncate mt-0.5">
                          {selectedCustomer.uid}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Joined Date</p>
                        <p className="text-gray-800 mt-0.5">
                          {formatDateTime(selectedCustomer.createdAt)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400 font-bold uppercase text-[9px]">Email Address</p>
                        <p className="text-gray-800 mt-0.5 font-medium">
                          {selectedCustomer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping addresses collections */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase border-b border-gray-50 pb-1.5 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      Saved Delivery Addresses ({customerAddresses.length})
                    </h3>
                    {addressesLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 size={20} className="animate-spin text-[#1B6B3A]" />
                      </div>
                    ) : customerAddresses.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-5 bg-white border border-dashed border-gray-200 rounded-2xl">
                        No saved shipping addresses found
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {customerAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-xs relative overflow-hidden"
                          >
                            {addr.isDefault && (
                              <span className="absolute top-0 right-0 bg-green-600 text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-bl">
                                Default
                              </span>
                            )}
                            <p className="font-semibold text-gray-800 text-xs">
                              {addr.fullName}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">📞 {addr.phone}</p>
                            <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                              {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}
                              {addr.city}, {addr.state} -{" "}
                              <span className="font-bold font-mono text-gray-700">
                                {addr.pincode}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Order details list */
                <div className="space-y-3">
                  {customerOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
                      <ShoppingBag size={32} className="mb-2 opacity-35" />
                      <p className="text-xs font-semibold">No order logs found for this customer</p>
                    </div>
                  ) : (
                    customerOrders.map((order) => {
                      const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600";
                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-[#1B6B3A]/30 transition-all duration-150"
                        >
                          {/* Order Brief ID + status */}
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2.5 mb-3">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase font-mono block leading-none">
                                Order ID
                              </span>
                              <span className="text-xs font-bold font-mono text-gray-800 leading-none inline-block mt-1">
                                #{order.id.replace("order_", "").toUpperCase().slice(0, 8)}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColor}`}
                            >
                              {order.status.replace(/-/g, " ")}
                            </span>
                          </div>

                          {/* Items sub list */}
                          <div className="space-y-1.5 mb-3">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs text-gray-600"
                              >
                                <span className="truncate pr-4 font-medium">
                                  {item.name} × {item.qty}
                                </span>
                                <span className="font-bold text-gray-800 flex-shrink-0">
                                  {formatINR(item.qty * item.sellingPrice)}
                                </span>
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <p className="text-[10px] text-gray-400 italic">
                                ...and {order.items.length - 3} other items
                              </p>
                            )}
                          </div>

                          {/* Summary payment metrics */}
                          <div className="border-t border-gray-50 pt-2.5 mt-1 flex justify-between items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 text-xs">
                            <div>
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                                Payment Method
                              </span>
                              <span className="font-bold text-gray-700 mt-0.5 inline-block capitalize">
                                💳 {order.paymentMethod || "Cash"} ({order.paymentStatus || "Pending"})
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">
                                Total Paid
                              </span>
                              <span className="font-black text-sm text-[#1B6B3A] mt-0.5 inline-block">
                                {formatINR(order.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 px-4 bg-[#1B6B3A] hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center cursor-pointer active:scale-95"
              >
                Close Profile View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
