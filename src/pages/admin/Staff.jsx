import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  ShieldAlert,
  Loader2,
  X,
  UserCheck,
  UserX,
  Key,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// Role Icon Component
// ─────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${
        isAdmin
          ? "bg-purple-100/70 text-purple-700 border-purple-200"
          : "bg-blue-100/70 text-blue-700 border-blue-200"
      }`}
    >
      <Shield size={12} className={isAdmin ? "text-purple-600" : "text-blue-600"} />
      {role}
    </span>
  );
};

const Staff = () => {
  const { user } = useAppContext();
  const isEmployee = user?.role === "employee";

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch staff list in real-time
  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsub = onSnapshot(
      usersRef,
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...docSnap.data(), id: docSnap.id });
        });
        // Sort alphabetically by name
        list.sort((a, b) => a.name.localeCompare(b.name));
        setStaff(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load staff list:", err);
        setLoading(false);
        toast.error("Database connection failed. Unable to fetch staff directory.");
      }
    );

    return () => unsub();
  }, []);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [staff, search]);

  // Open add modal
  const openAddModal = () => {
    if (isEmployee) return;
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("employee");
    setActive(true);
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (member) => {
    if (isEmployee) return;
    setIsEditing(true);
    setCurrentId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPassword(member.password);
    setRole(member.role || "employee");
    setActive(member.active !== undefined ? member.active : true);
    setModalOpen(true);
  };

  // Save Staff User
  const handleSave = async (e) => {
    e.preventDefault();
    if (isEmployee) return;
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password.trim()) return toast.error("Password is required");

    setSaving(true);
    try {
      const docId = currentId || `staff_${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      const payload = {
        uid: docId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        active,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", docId), payload, { merge: true });
      toast.success(isEditing ? "Staff user updated!" : "Staff user registered successfully! 🌿");
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving staff:", err);
      toast.error("Failed to save staff details. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (member) => {
    if (isEmployee) {
      return toast.error("Access denied. Employees have view-only rights.");
    }
    // Prevent self-deactivation
    if (member.email === user?.email) {
      return toast.error("Safety lock: You cannot deactivate your own active session!");
    }

    try {
      await updateDoc(doc(db, "users", member.id), {
        active: !member.active,
      });
      toast.success(`User status updated to ${!member.active ? "ACTIVE" : "SUSPENDED"}`);
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to modify user status.");
    }
  };

  // Delete Staff User
  const handleDelete = async () => {
    if (isEmployee) return;
    if (!deleteTarget) return;

    // Prevent self-deletion
    if (deleteTarget.email === user?.email) {
      toast.error("Safety lock: You cannot delete your own admin account!");
      setDeleteTarget(null);
      return;
    }

    try {
      await deleteDoc(doc(db, "users", deleteTarget.id));
      toast.success(`Account for "${deleteTarget.name}" permanently deleted`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete staff error:", err);
      toast.error("Failed to delete staff member.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Administer dashboard credentials and operator access privileges
          </p>
        </div>
        {!isEmployee && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ backgroundColor: "#1B6B3A" }}
          >
            <Plus size={17} />
            Register User
          </button>
        )}
      </div>

      {/* Role Restriction Banner for Employees */}
      {isEmployee && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-3 items-start">
          <ShieldAlert size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-950 text-sm">Employee View-Only Access</h4>
            <p className="text-orange-800 text-xs mt-0.5 leading-relaxed">
              Your account has Employee-level clearance. You can view the list of staff members,
              but cannot create new accounts, modify existing credentials, toggle active states, or delete users.
            </p>
          </div>
        </div>
      )}

      {/* Search Filter Box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff names or emails…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
          />
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin text-[#1B6B3A] mb-3" />
          <p className="text-sm font-medium">Fetching directory...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl text-gray-400 text-center">
          <Users size={40} className="mb-3 opacity-40 mx-auto" />
          <p className="font-medium">No users found</p>
          <p className="text-xs text-gray-400">Try modifying search term</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold">User Details</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Clearance Role</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Secret Password</th>
                  <th className="text-center px-5 py-3.5 font-semibold">Operator Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* User profile with initials */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center font-bold text-sm border border-green-100 shadow-sm flex-shrink-0">
                          {member.name ? member.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 leading-tight truncate max-w-[200px]">
                            {member.name}
                            {member.email === user?.email && (
                              <span className="ml-1.5 text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-3.5 text-left">
                      <RoleBadge role={member.role || "employee"} />
                    </td>

                    {/* Secret password displaying */}
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Key size={12} className="text-gray-400" />
                        <span>{isEmployee ? "••••••••" : member.password}</span>
                      </div>
                    </td>

                    {/* Status inline toggle */}
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(member)}
                        disabled={isEmployee}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          member.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } disabled:opacity-90 disabled:cursor-not-allowed`}
                        title={isEmployee ? "View only status" : "Toggle operator activation"}
                      >
                        {member.active ? (
                          <>
                            <UserCheck size={11} />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX size={11} />
                            Suspended
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      {!isEmployee ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit credentials"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            disabled={member.email === user?.email}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Read-Only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add/Edit Staff Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-gray-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">
                {isEditing ? "Edit Operator Details" : "Register Store Operator"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lawrence Nadar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white"
                  required
                />
              </div>

              {/* Email address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. employee@keralayard.com"
                  value={email}
                  disabled={isEditing}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>

              {/* Secret password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Operator Password
                </label>
                <input
                  type="text"
                  placeholder="admin@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white font-mono"
                  required
                />
              </div>

              {/* Role select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Clearance Level
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white cursor-pointer"
                >
                  <option value="employee">Employee (View-Only Catalog, Manage Orders)</option>
                  <option value="admin">Admin (Full Access & Credentials)</option>
                </select>
              </div>

              {/* Active Toggle status */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Operator Activation</p>
                  <p className="text-xs text-gray-400">Can log in and operate the panel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer`}
                  style={{ backgroundColor: active ? "#1B6B3A" : "#D1D5DB" }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: "#1B6B3A" }}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? "Save Changes" : "Register User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-5">
              Are you sure you want to permanently delete credentials for{" "}
              <span className="font-semibold">"{deleteTarget.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
