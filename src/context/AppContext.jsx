import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, signInWithGoogle, signOutUser } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { dummyProducts } from "../assets/keralaData";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const navigate = useNavigate();
  const location = useLocation();

  // ── Session States ────────────────────────────────────────────────────────
  const [staffUser, setStaffUser] = useState(() => {
    const saved = localStorage.getItem("ky_admin_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom admin session:", e);
      }
    }
    return null;
  });

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firebaseUserAdmin, setFirebaseUserAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Derive active session state based on route
  const isAdminPath = location.pathname.startsWith("/admin");
  const user = isAdminPath ? staffUser : firebaseUser;
  const isAdmin = isAdminPath
    ? (staffUser ? (staffUser.role === "admin" || staffUser.role === "employee") : false)
    : firebaseUserAdmin;

  // ── Staff Auto-Seeder ─────────────────────────────────────────────────────
  useEffect(() => {
    const seedStaff = async () => {
      try {
        const usersRef = collection(db, "users");
        const snap = await getDocs(query(usersRef));
        if (snap.empty) {
          console.log("Seeding default employee credentials...");
          await setDoc(doc(db, "users", "admin_keralayard_com"), {
            uid: "admin_keralayard_com",
            name: "Kerala Yard Admin",
            email: "admin@keralayard.com",
            password: "admin@123",
            role: "employee",
            active: true,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Users/Staff seeding failed/already done:", err);
      }
    };
    seedStaff();
  }, []);

  // ── Auth listener (Google Auth and database check for shoppers) ─────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setAuthLoading(true);
      try {
        if (fbUser) {
          // Check if this is an administrative staff session currently logged in
          const saved = localStorage.getItem("ky_admin_session");
          let isStaffSession = false;
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.email === fbUser.email) {
                isStaffSession = true;
              }
            } catch (e) {
              console.error("Failed to check active staff session:", e);
            }
          }

          if (isStaffSession) {
            // Shopper storefront session should ignore this administrative session
            setFirebaseUser(null);
            setFirebaseUserAdmin(false);
            setAuthLoading(false);
            return;
          }

          setFirebaseUser(fbUser);
          
          // Check / create customer record in /customers collection
          const userRef = doc(db, "customers", fbUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // First login — create customer document
            await setDoc(userRef, {
              uid: fbUser.uid,
              name: fbUser.displayName,
              email: fbUser.email,
              photoURL: fbUser.photoURL,
              role: "customer",
              createdAt: serverTimestamp(),
            });
          }
          // Storefront users are never admin — admin access uses staff login
          setFirebaseUserAdmin(false);

          // Load cart from Firestore
          const cartRef = doc(db, "carts", fbUser.uid);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            setCartItems(cartSnap.data().items || {});
          }
        } else {
          setFirebaseUser(null);
          setFirebaseUserAdmin(false);
          setCartItems({});
        }
      } catch (err) {
        console.error("Auth listener connection/permission error:", err);
        // Fallback: If fbUser is valid, populate locally to prevent full lockouts
        if (fbUser) {
          setFirebaseUser(fbUser);
        }
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Categories Sync ───────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "categories"), async (snapshot) => {
      if (snapshot.empty) {
        // Seed categories
        console.log("Seeding categories into Firestore...");
        try {
          const { categories: staticCategories } = await import("../assets/keralaData");
          setCategories(staticCategories);
          setCategoriesLoading(false);
          for (const c of staticCategories) {
            await setDoc(doc(db, "categories", c.id), c);
          }
        } catch (err) {
          console.error("Error seeding categories:", err);
        }
      } else {
        const catList = [];
        snapshot.forEach((doc) => {
          catList.push({ ...doc.data(), id: doc.id });
        });
        setCategories(catList);
        setCategoriesLoading(false);
      }
    }, (error) => {
      console.warn("Categories sync failed, using static fallback:", error);
      const loadFallback = async () => {
        try {
          const { categories: staticCategories } = await import("../assets/keralaData");
          setCategories(staticCategories);
        } catch (err) {
          console.error("Error loading fallback categories:", err);
        }
        setCategoriesLoading(false);
      };
      loadFallback();
    });
    return () => unsub();
  }, []);

  // ── Products Sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), async (snapshot) => {
      if (snapshot.empty) {
        // Seed products
        console.log("Seeding products into Firestore...");
        setProducts(dummyProducts);
        setProductsLoading(false);
        try {
          for (const p of dummyProducts) {
            await setDoc(doc(db, "products", p.id), p);
          }
        } catch (err) {
          console.error("Error seeding products:", err);
        }
      } else {
        const prodList = [];
        snapshot.forEach((doc) => {
          prodList.push({ ...doc.data(), id: doc.id });
        });
        setProducts(prodList);
        setProductsLoading(false);
      }
    }, (error) => {
      console.warn("Products sync failed, using dummy fallback:", error);
      setProducts(dummyProducts);
      setProductsLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Cart sync to Firestore ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const syncCart = async () => {
      try {
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { userId: user.uid, items: cartItems, updatedAt: serverTimestamp() }, { merge: true });
      } catch (err) {
        console.error("Cart sync error:", err);
      }
    };
    const timer = setTimeout(syncCart, 500); // debounce 500ms
    return () => clearTimeout(timer);
  }, [cartItems, user]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      return updated;
    });
    toast.success("Added to cart!", {
      icon: "🛒",
      style: { borderRadius: "12px", background: "#1B6B3A", color: "#fff" },
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  }, []);

  const updateCartItem = useCallback((itemId, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }
      return { ...prev, [itemId]: quantity };
    });
  }, []);

  const clearCart = useCallback(() => setCartItems({}), []);

  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  }, [cartItems]);

  const getCartAmount = useCallback(() => {
    let total = 0;
    for (const itemId in cartItems) {
      const product = products.find((p) => p.id === itemId);
      if (product && cartItems[itemId] > 0) {
        total += product.sellingPrice * cartItems[itemId];
      }
    }
    return Math.round(total * 100) / 100;
  }, [cartItems, products]);

  // ── Auth helpers ──────────────────────────────────────────────────────────
  const login = async () => {
    try {
      await signInWithGoogle();
      setShowUserLogin(false);
      toast.success("Welcome to Kerala Yard! 🌿");
    } catch (err) {
      toast.error("Login failed. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setFirebaseUser(null);
      setFirebaseUserAdmin(false);
      setStaffUser(null);
      setCartItems({});
      localStorage.removeItem("ky_admin_session");
      navigate("/");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const value = {
    currency,
    navigate,
    user,
    setUser: (val) => {
      if (isAdminPath) setStaffUser(val);
      else setFirebaseUser(val);
    },
    isAdmin,
    authLoading,
    showUserLogin,
    setShowUserLogin,
    login,
    logout,
    products,
    productsLoading,
    categories,
    categoriesLoading,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartCount,
    getCartAmount,
    searchQuery,
    setSearchQuery,
    // Legacy compat
    isSeller: isAdmin,
    setIsSeller: (val) => {
      if (isAdminPath) {
        // derived
      } else {
        setFirebaseUserAdmin(val);
      }
    },
    axios: null, // deprecated — use Firebase SDK
    fetchProducts: () => {},
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
