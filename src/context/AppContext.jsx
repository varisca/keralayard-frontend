import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, signInWithGoogle, signOutUser } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";
import { dummyProducts } from "../assets/keralaData";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserLogin, setShowUserLogin] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check admin claim via Firestore user doc (custom claims alternative for web)
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        let isUserAdmin = false;
        if (userSnap.exists()) {
          isUserAdmin = userSnap.data().role === "admin";
        } else {
          // Auto-admin for local dev / testing if email contains admin or lawrence
          const shouldBeAdmin = firebaseUser.email?.toLowerCase().includes("admin") || 
                              firebaseUser.email?.toLowerCase().includes("lawrence");
          
          // Create user doc on first login
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: shouldBeAdmin ? "admin" : "customer",
            createdAt: serverTimestamp(),
          });
          isUserAdmin = shouldBeAdmin;
        }
        setIsAdmin(isUserAdmin);

        // Load cart from Firestore
        const cartRef = doc(db, "carts", firebaseUser.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          setCartItems(cartSnap.data().items || {});
        }
      } else {
        // Temporary mock session for testing purposes
        setUser({
          uid: "test_user_123",
          displayName: "Lawrence Test",
          email: "lawrence@test.com",
          photoURL: null,
        });
        setIsAdmin(true);
        setCartItems({});
      }
      setAuthLoading(false);
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
      setUser(null);
      setIsAdmin(false);
      setCartItems({});
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
    setUser,
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
    setIsSeller: setIsAdmin,
    axios: null, // deprecated — use Firebase SDK
    fetchProducts: () => {},
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
