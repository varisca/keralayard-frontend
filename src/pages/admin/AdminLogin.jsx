import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { db, auth } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { KeyRound, Mail, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return toast.error("Please enter both email and password");
    }

    setLoading(true);
    try {
      // ── Step 1: Authenticate via Firebase Auth ──────────────────────────
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim().toLowerCase(),
          password.trim()
        );
      } catch (authErr) {
        console.error("Firebase Auth error:", authErr.code);
        const msg =
          authErr.code === "auth/wrong-password" ||
          authErr.code === "auth/invalid-credential"
            ? "Invalid email or password"
            : authErr.code === "auth/user-not-found"
            ? "No admin account found with this email"
            : authErr.code === "auth/too-many-requests"
            ? "Too many failed attempts. Try again later."
            : "Login failed. Check your credentials.";
        toast.error(msg, {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
        return;
      }

      const firebaseUid = userCredential.user.uid;

      // ── Step 2: Look up role in the users collection ────────────────────
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email.trim().toLowerCase()));
      const snap = await getDocs(q);

      let userDoc = null;
      if (!snap.empty) {
        userDoc = snap.docs[0].data();
      }

      // ── Step 3: Verify role is admin or employee ────────────────────────
      const role = userDoc?.role;
      if (!role || (role !== "admin" && role !== "employee")) {
        // Signed in to Firebase Auth but not a staff member
        await auth.signOut();
        toast.error("Access denied. This account does not have staff privileges.", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
        return;
      }

      if (userDoc?.active === false) {
        await auth.signOut();
        toast.error("Access denied. Your account has been suspended.", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
        return;
      }

      // ── Step 4: Upsert users doc to ensure uid is synced ────────────────
      await setDoc(doc(db, "users", firebaseUid), {
        uid: firebaseUid,
        name: userDoc?.name || userCredential.user.displayName || "Admin",
        email: email.trim().toLowerCase(),
        photoURL: userCredential.user.photoURL || null,
        role,
        active: true,
      }, { merge: true });

      // ── Step 5: Save session to localStorage ────────────────────────────
      const sessionPayload = {
        uid: firebaseUid,
        name: userDoc?.name || userCredential.user.displayName || "Admin",
        email: email.trim().toLowerCase(),
        role,
        photoURL: userCredential.user.photoURL || null,
        isStaff: true,
      };
      localStorage.setItem("ky_admin_session", JSON.stringify(sessionPayload));

      toast.success(`Welcome back, ${sessionPayload.name}! 🌿`);
      window.location.href = "/admin";

    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: "#1A1A2E" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#1B6B3A" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#D4A017" }}
        />
      </div>

      {/* Login Card */}
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/5"
        style={{ backgroundColor: "#16213E" }}
      >
        {/* Top green accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />

        <div className="px-8 py-10 flex flex-col gap-6">
          {/* Logo & Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2.5">
              {/* Kerala Yard Leaf Logo */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-black/20"
                style={{ backgroundColor: "#1B6B3A" }}
              >
                🌿
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight leading-none">
                  Kerala Yard
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block"
                  style={{ backgroundColor: "#D4A017", color: "#1A1A2E" }}
                >
                  STAFF PORTAL
                </span>
              </div>
            </div>

            <div className="text-center mt-2">
              <h2 className="text-white text-xl font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs mt-1">
                Manage your Kerala Yard store operations
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/10" />

          {/* Login Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="admin@keralayard.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Secret Password
              </label>
              <div className="relative">
                <KeyRound
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all font-medium placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-[#1B6B3A] hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-black/25 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-gray-500 text-[10px] text-center mt-2 leading-relaxed">
            Only authorized administrators and employees can access this portal.
            <br />
            Unauthorized operations are strictly logged and audited.
          </p>
        </div>

        {/* Bottom accent */}
        <div
          className="h-1 w-full bg-gradient-to-r from-primary to-accent"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
