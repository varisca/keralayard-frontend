import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { signInWithGoogle, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOutUser } from "../../firebase/firebase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      const firebaseUser = result.user;

      // Check role in Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        toast.success("Welcome back, Admin! 🌿");
        navigate("/admin");
      } else {
        // Not an admin — sign out immediately
        await signOutUser();
        toast.error("Access Denied. You are not an admin.", {
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff" },
        });
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#16213E" }}
      >
        {/* Top green accent bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: "#1B6B3A" }} />

        <div className="px-8 py-10 flex flex-col items-center gap-6">
          {/* Logo & Badge */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Kerala Yard Leaf Logo */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: "#1B6B3A" }}
              >
                🌿
              </div>
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight leading-none">
                  Kerala Yard
                </h1>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "#D4A017", color: "#1A1A2E" }}
                >
                  ADMIN
                </span>
              </div>
            </div>

            <div className="text-center mt-2">
              <h2 className="text-white text-2xl font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-sm mt-1">
                Manage your Kerala Yard store
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/10" />

          {/* Info text */}
          <p className="text-gray-400 text-sm text-center">
            Sign in with your authorized Google account to access the admin
            dashboard.
          </p>

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.2 17.8 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.1z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.5 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.9-6z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.6-5.9c-2.1 1.4-4.8 2.2-7.9 2.2-6.2 0-11.5-3.7-13.5-9l-7.9 6C6.6 42.6 14.6 48 24 48z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Footer note */}
          <p className="text-gray-600 text-xs text-center">
            Only authorized administrators can access this panel.
            <br />
            Unauthorized access is strictly prohibited.
          </p>
        </div>

        {/* Bottom accent */}
        <div
          className="h-1 w-full"
          style={{
            background: "linear-gradient(to right, #1B6B3A, #D4A017, #1B6B3A)",
          }}
        />
      </div>
    </div>
  );
};

export default AdminLogin;
