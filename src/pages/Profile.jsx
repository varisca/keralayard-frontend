import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { dummyAddresses } from "../assets/keralaData";
import toast from "react-hot-toast";

// ─── Avatar initials helper ────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ─── Member since date ─────────────────────────────────────────────────────
const getMemberSince = (user) => {
  if (!user?.metadata?.creationTime) return "Kerala Yard Member";
  const date = new Date(user.metadata.creationTime);
  return `Member since ${date.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`;
};

// ─── Tab names ─────────────────────────────────────────────────────────────
const TABS = ["Personal Info", "My Addresses", "Quick Links"];

const Profile = () => {
  const { user, logout, navigate } = useAppContext();

  const [activeTab, setActiveTab] = useState(0);
  const [phone, setPhone] = useState(user?.phoneNumber || "");
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Use dummy addresses since Firestore is placeholder
  const addresses = dummyAddresses;

  const handleSavePhone = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setSavingPhone(true);
    // TODO: save to Firestore user doc when Firebase is configured
    await new Promise((r) => setTimeout(r, 600));
    setSavingPhone(false);
    setPhoneEditing(false);
    toast.success("Phone number updated!");
  };

  const handleDeleteAddress = (id) => {
    // TODO: delete from Firestore when Firebase is configured
    toast.success("Address removed (demo mode)");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-6 py-2 rounded-xl"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* ── Profile header ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Green banner */}
        <div className="h-24 kerala-gradient relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
        </div>

        <div className="px-6 pb-6 -mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          {/* Avatar */}
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex-shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">
                {getInitials(user.displayName || user.email)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0 sm:mb-1">
            <h1 className="text-xl font-bold text-dark">
              {user.displayName || "Kerala Yard User"}
            </h1>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {getMemberSince(user)}
            </p>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === i
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-dark hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div className="animate-fade-in">
        {/* ── Personal Info ─────────────────────────────────────────────────── */}
        {activeTab === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <span>👤</span> Personal Information
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Full Name (read-only from Google) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="text-dark font-medium">{user.displayName || "—"}</span>
                  <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Google Account</span>
                </div>
              </div>

              {/* Email (read-only from Google) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span className="text-dark font-medium">{user.email}</span>
                  <span className="ml-auto text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                </div>
              </div>

              {/* Phone (editable) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                {phoneEditing ? (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-primary">
                      <span className="text-gray-500 text-sm">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="9876543210"
                        className="flex-1 outline-none text-dark font-medium placeholder-gray-300"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="btn-primary px-4 rounded-xl text-sm disabled:opacity-60"
                    >
                      {savingPhone ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setPhoneEditing(false)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3" />
                    </svg>
                    <span className={`font-medium ${phone ? "text-dark" : "text-gray-400"}`}>
                      {phone ? `+91 ${phone}` : "Not provided"}
                    </span>
                    <button
                      onClick={() => setPhoneEditing(true)}
                      className="ml-auto text-primary text-sm font-semibold hover:underline cursor-pointer"
                    >
                      {phone ? "Edit" : "Add"}
                    </button>
                  </div>
                )}
              </div>

              {/* Google sign-in note */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-700">
                  Name and email are managed by your <strong>Google Account</strong> and cannot be changed here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── My Addresses ──────────────────────────────────────────────────── */}
        {activeTab === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <span>📍</span> My Addresses
              </h2>
              <button
                onClick={() => navigate("/add-address")}
                className="btn-primary px-4 py-2 text-sm rounded-xl flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add New
              </button>
            </div>

            <div className="p-6">
              {addresses.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl">📭</span>
                  <p className="text-gray-400 mt-3 mb-4">No saved addresses yet</p>
                  <button
                    onClick={() => navigate("/add-address")}
                    className="btn-primary px-6 py-2 rounded-xl text-sm"
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`relative rounded-xl border-2 p-4 transition ${
                        addr.isDefault
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      <p className="font-bold text-dark">{addr.fullName}</p>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">📱 {addr.phone}</p>
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={() => navigate("/add-address")}
                          className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs text-red-400 font-semibold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Quick Links ───────────────────────────────────────────────────── */}
        {activeTab === 2 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📦",
                title: "My Orders",
                desc: "Track your Kerala Yard deliveries",
                action: () => navigate("/my-orders"),
                color: "bg-green-50 border-green-200",
                iconBg: "bg-primary/10",
              },
              {
                icon: "🏠",
                title: "Manage Addresses",
                desc: "Add or edit delivery addresses",
                action: () => setActiveTab(1),
                color: "bg-blue-50 border-blue-200",
                iconBg: "bg-blue-100",
              },
              {
                icon: "💬",
                title: "Help & Support",
                desc: "Questions? We're here to help",
                action: () => toast("Support: support@keralayard.com 🌿"),
                color: "bg-amber-50 border-amber-200",
                iconBg: "bg-accent/10",
              },
              {
                icon: "🌿",
                title: "About Kerala Yard",
                desc: "Our story, mission & values",
                action: () => navigate("/"),
                color: "bg-emerald-50 border-emerald-200",
                iconBg: "bg-emerald-100",
              },
            ].map(({ icon, title, desc, action, color, iconBg }) => (
              <button
                key={title}
                onClick={action}
                className={`text-left p-5 rounded-2xl border-2 ${color} hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <p className="font-bold text-dark">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                <div className="flex items-center gap-1 text-primary text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Account danger zone ───────────────────────────────────────────── */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Account Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm hover:bg-red-50 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
