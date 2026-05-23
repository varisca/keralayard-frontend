import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Calendar,
  Shield,
  UserCheck,
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import toast from "react-hot-toast";

const MOCK_CUSTOMERS = [
  {
    uid: "user_demo_001",
    name: "Priya Menon",
    email: "priya.menon@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&q=80",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "user_demo_002",
    name: "Arjun Nair",
    email: "arjun.nair@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "user_demo_003",
    name: "Kavitha Pillai",
    email: "kavitha.pillai@example.com",
    role: "customer",
    photoURL: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&h=120&fit=crop&q=80",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uid: "user_demo_004",
    name: "Deepak Varma",
    email: "deepak.varma@example.com",
    role: "admin",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&q=80",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Load real-time users & orders from Firestore
  useEffect(() => {
    // 1. Listen to users
    const unsubUsers = onSnapshot(collection(db, "users"), async (snapshot) => {
      if (snapshot.empty || snapshot.size <= 1) {
        console.log("Seeding mock customer base...");
        try {
          for (const c of MOCK_CUSTOMERS) {
            await setDoc(doc(db, "users", c.uid), {
              ...c,
              createdAt: c.createdAt || new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Failed seeding users:", err);
        }
      } else {
        const userList = [];
        snapshot.forEach((doc) => {
          userList.push({ ...doc.data(), uid: doc.id });
        });
        setUsers(userList);
      }
    });

    // 2. Listen to orders to aggregate metrics
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderList = [];
      snapshot.forEach((doc) => {
        orderList.push({ ...doc.data(), id: doc.id });
      });
      setOrders(orderList);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, []);

  // Aggregate stats per user
  const userStats = useMemo(() => {
    return users.map((user) => {
      const userOrders = orders.filter(
        (o) => o.userId === user.uid || o.address?.fullName?.toLowerCase() === user.name?.toLowerCase()
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

  // Toggle Admin role
  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === "admin" ? "customer" : "admin";
    try {
      await updateDoc(doc(db, "users", userId), {
        role: nextRole,
      });
      toast.success(`Role updated successfully to ${nextRole.toUpperCase()}`);
    } catch (err) {
      console.error("Role update failed:", err);
      toast.error("Failed to update role");
    }
  };

  // Helpers
  const formatINR = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {filteredUsers.length} active registered buyer{filteredUsers.length !== 1 ? "s" : ""}
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
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
          <p className="text-xs text-gray-400">Try modifying search term</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold">User Info</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Joined Date</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Role</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Orders</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Spending</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                    {/* User profile with Avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1B6B3A] text-white flex items-center justify-center font-bold text-sm">
                              {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 leading-tight truncate max-w-[200px]">
                            {user.name || "Anonymous User"}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        <Shield size={10} />
                        {user.role}
                      </span>
                    </td>

                    {/* Total orders */}
                    <td className="px-5 py-3.5 text-center font-bold text-gray-700">
                      {user.orderCount}
                    </td>

                    {/* Total spending */}
                    <td className="px-5 py-3.5 font-bold text-[#1B6B3A] whitespace-nowrap">
                      {formatINR(user.totalSpend)}
                    </td>

                    {/* Role action buttons */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleRole(user.uid, user.role)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                          user.role === "admin"
                            ? "bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600"
                            : "bg-[#1B6B3A]/10 hover:bg-[#1B6B3A]/20 text-[#1B6B3A]"
                        }`}
                        title={user.role === "admin" ? "Revoke Admin Power" : "Make Administrator"}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Lock size={12} />
                            Demote
                          </>
                        ) : (
                          <>
                            <Unlock size={12} />
                            Promote
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
