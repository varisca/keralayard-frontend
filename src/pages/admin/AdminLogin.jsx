import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
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
      const staffRef = collection(db, "staff");
      const q = query(staffRef, where("email", "==", email.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        toast.error("Invalid email or password", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
        return;
      }

      let matchedUser = null;
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.password === password.trim()) {
          matchedUser = { ...data, id: docSnap.id };
        }
      });

      if (matchedUser) {
        if (!matchedUser.active) {
          toast.error("Access denied. Your account is suspended.", {
            style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
          });
          return;
        }

        let finalUid = matchedUser.uid;
        try {
          const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
          const { auth } = await import("../../firebase/firebase");
          const { doc, setDoc } = await import("firebase/firestore");
          
          let userCredential;
          try {
            // 1. Try to sign in with standard Firebase Email/Password Auth
            userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
            console.log("Logged in existing Firebase Auth user:", userCredential.user.uid);
          } catch (signInErr) {
            // 2. If user doesn't exist, automatically register them in Firebase Auth
            if (
              signInErr.code === "auth/user-not-found" || 
              signInErr.code === "auth/invalid-credential" ||
              signInErr.code === "auth/invalid-email"
            ) {
              try {
                userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
                console.log("Registered new Firebase Auth user on-the-fly:", userCredential.user.uid);
              } catch (createErr) {
                console.warn("Auto-registration in Firebase Auth failed:", createErr);
                throw createErr;
              }
            } else {
              throw signInErr;
            }
          }
          
          finalUid = userCredential.user.uid;
          
          // Write the role to the /users collection under this authenticated UID
          await setDoc(doc(db, "users", finalUid), {
            uid: finalUid,
            name: matchedUser.name,
            email: matchedUser.email,
            photoURL: matchedUser.photoURL || null,
            role: matchedUser.role, // "admin" or "employee"
            createdAt: new Date().toISOString(),
          });
          console.log("Successfully authenticated staff session in Firebase Auth:", finalUid);
        } catch (authErr) {
          console.warn("Firebase Auth Email/Password authentication failed, using local mock fallback:", authErr);
        }

        const sessionPayload = {
          uid: finalUid,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          photoURL: matchedUser.photoURL || null,
          isStaff: true,
        };

        // Persist session
        localStorage.setItem("ky_admin_session", JSON.stringify(sessionPayload));
        
        toast.success(`Welcome back, ${matchedUser.name}! 🌿`);
        
        // Use full reload to securely sync AppContext on boot
        window.location.href = "/admin";
      } else {
        toast.error("Invalid email or password", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
      }
    } catch (err) {
      console.error("Custom login error:", err);
      toast.error("Login verification failed. Check database connection.");
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
