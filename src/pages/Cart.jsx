import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { dummyProducts } from "../assets/keralaData";
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import AddressModal from "../components/AddressModal";

// ─── Placeholder image for products without images ─────────────────────────
const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23F0F4F0'/%3E%3Ctext x='40' y='44' font-size='28' text-anchor='middle' fill='%231B6B3A'%3E🛒%3C/text%3E%3C/svg%3E";

// ─── Smart weight/volume display based on quantity ──────────────────────────
// e.g. "500ml" × 2 → "1L", "500g" × 3 → "1.5kg", "250g" × 1 → "250g"
const formatWeight = (weight, quantity) => {
  if (!weight || quantity <= 1) return weight || "";
  const match = weight.toString().match(/^([\d.]+)\s*(ml|l|g|kg|L)$/i);
  if (!match) return weight;

  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  const total = value * quantity;

  if (unit === "ml") {
    return total >= 1000 ? `${total / 1000}L` : `${total}ml`;
  }
  if (unit === "l") {
    return `${total}L`;
  }
  if (unit === "g") {
    return total >= 1000 ? `${total / 1000}kg` : `${total}g`;
  }
  if (unit === "kg") {
    return `${total}kg`;
  }
  return `${total}${unit}`;
};

const Cart = () => {
  const {
    cartItems,
    products,
    removeFromCart,
    updateCartItem,
    getCartAmount,
    getCartCount,
    user,
    setShowUserLogin,
    navigate,
    currency,
  } = useAppContext();

  const displayUser = user && !user.isStaff ? user : null;

  // Use keralaData products as source-of-truth
  const allProducts = products.length > 0 ? products : dummyProducts;

  // ── Derived cart array ─────────────────────────────────────────────────────
  const cartArray = Object.entries(cartItems)
    .filter(([id, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = allProducts.find((p) => p.id === id);
      return product ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean);

  // ── Address state ──────────────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  
  // Reusable Address Modal popup states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  // ── Real-time address listener (no extra getDocs round-trip) ──────────────
  useEffect(() => {
    if (!displayUser) {
      setAddresses([]);
      setSelectedAddress(null);
      setAddressLoading(false);
      return;
    }
    setAddressLoading(true);
    const q = query(
      collection(db, "addresses"),
      where("userId", "==", displayUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const addrs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAddresses(addrs);
        // Auto-select default or first address (only when no address is selected yet)
        setSelectedAddress((prev) => {
          if (prev) {
            // Keep selection if it still exists in the updated list
            const stillExists = addrs.find((a) => a.id === prev.id);
            return stillExists || addrs.find((a) => a.isDefault) || addrs[0] || null;
          }
          return addrs.find((a) => a.isDefault) || addrs[0] || null;
        });
        setAddressLoading(false);
      },
      (err) => {
        console.error("Failed to load addresses:", err);
        setAddressLoading(false);
      }
    );
    return () => unsub();
  }, [displayUser?.uid]);

  // ── Pricing calculations ───────────────────────────────────────────────────
  const subtotal = getCartAmount();
  const deliveryCharge = subtotal > 0 && subtotal < 1000 ? 40 : 0;
  const total = Math.round((subtotal + deliveryCharge) * 100) / 100;

  // ── Proceed to checkout ────────────────────────────────────────────────────
  const handleProceed = () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!displayUser) {
      setShowUserLogin(true);
      return;
    }
    navigate("/checkout");
  };

  // ── Format address for display ─────────────────────────────────────────────
  const formatAddress = (addr) => {
    if (!addr) return "No address selected";
    const parts = [
      addr.addressLine1,
      addr.addressLine2,
      addr.city,
      addr.state,
      addr.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // ── Empty cart state ───────────────────────────────────────────────────────
  if (cartArray.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 animate-fade-in">
        {/* Shopping bag icon */}
        <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <svg
            className="w-14 h-14 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.928-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">
          Looks like you haven't added any Kerala Yard products yet. Explore our
          handpicked collection!
        </p>
        <button
          onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}
          className="btn-primary px-8 py-3 text-base rounded-xl"
        >
          Shop Now 🌿
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto animate-fade-in">
      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-dark">Your Cart</h1>
        <span className="bg-primary text-white text-sm font-semibold px-3 py-1 rounded-full">
          {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Cart items list ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_auto] gap-4 pb-3 border-b border-gray-200 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Product</span>
            <span className="text-center">Qty</span>
            <span className="text-center">Subtotal</span>
            <span></span>
          </div>

          {/* Cart rows */}
          <div className="divide-y divide-gray-100">
            {cartArray.map((product) => {
              const imageUrl = product.images?.[0] || PLACEHOLDER;
              const itemSubtotal = product.sellingPrice * product.quantity;

              return (
                <div
                  key={product.id}
                  className="relative my-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm animate-fade-in md:my-0 md:grid md:grid-cols-[3fr_1fr_1fr_auto] md:items-center md:gap-4 md:rounded-none md:border-0 md:border-b md:border-gray-100 md:bg-transparent md:px-0 md:py-4 md:shadow-none"
                >
                  {/* Product info */}
                  <div className="flex items-start gap-3 pr-9 md:items-center md:gap-4 md:pr-0">
                    <div
                      onClick={() => {
                        navigate(`/products/${product.categoryName?.toLowerCase().replace(/\s+/g, "-") || "all"}/${product.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="cursor-pointer w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl bg-warm-dark overflow-hidden border border-gray-200 hover:border-primary transition"
                    >
                      <img
                        src={imageUrl || PLACEHOLDER}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-dark text-sm leading-tight line-clamp-2 md:text-base">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {product.weight && formatWeight(product.weight, product.quantity)}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1 md:text-base">
                        {currency}{product.sellingPrice}
                      </p>
                      {/* Mobile subtotal */}
                      <p className="text-xs text-gray-500 md:hidden">
                        Subtotal: <span className="font-semibold text-dark">{currency}{itemSubtotal}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls — Blinkit style */}
                  <div className="mt-3 flex items-center justify-between md:mt-0 md:justify-center">
                    <p className="text-xs text-gray-500 md:hidden">Qty</p>
                    <div className="inline-flex items-center border border-primary rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          if (product.quantity === 1) {
                            removeFromCart(product.id);
                            toast.success("Item removed from cart", { icon: "🗑️" });
                          } else {
                            updateCartItem(product.id, product.quantity - 1);
                          }
                        }}
                        className="w-10 h-9 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-10 h-9 flex items-center justify-center font-bold text-primary text-sm select-none border-x border-primary">
                        {product.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItem(product.id, product.quantity + 1)}
                        className="w-10 h-9 flex items-center justify-center text-primary font-bold text-lg hover:bg-primary/10 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <p className="hidden md:block text-center font-semibold text-dark">
                    {currency}{itemSubtotal}
                  </p>

                  {/* Remove button */}
                  <button
                    onClick={() => {
                      updateCartItem(product.id, 0);
                      toast.success("Item removed", { icon: "🗑️" });
                    }}
                    className="absolute right-2 top-2 rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer md:static md:self-center"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Continue shopping */}
          <button
            onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}
            className="mt-6 flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Continue Shopping
          </button>
        </div>

        {/* ── Order Summary sidebar ──────────────────────────────────────────── */}
        <div className="w-full lg:w-[380px] lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <h2 className="text-lg font-bold text-white">Order Summary</h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({getCartCount()} items)</span>
                  <span className="font-medium text-dark">{currency}{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery charge</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-semibold">FREE</span>
                  ) : (
                    <span className="font-medium text-dark">{currency}{deliveryCharge}</span>
                  )}
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                    Free delivery on orders of {currency}1000 or more.
                  </p>
                )}
                {/* <div className="flex justify-between text-gray-600">
                  <span>Tax (2%)</span>
                  <span className="font-medium text-dark">{currency}{tax}</span>
                </div> */}
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-dark text-base">Total</span>
                  <span className="font-bold text-primary text-lg">{currency}{total}</span>
                </div>
              </div>

              {/* ── Delivery address ──────────────────────────────────────── */}
              <div className="border border-gray-200 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    📍 Delivery Address
                  </p>
                  {addresses.length > 0 ? (
                    <button
                      onClick={() => setShowAddressDropdown((v) => !v)}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                    >
                      {showAddressDropdown ? "Close" : "Change"}
                    </button>
                  ) : (
                    <button
                      onClick={() => { setEditAddressId(null); setIsAddressModalOpen(true); }}
                      className="text-xs text-primary font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      ➕ Add
                    </button>
                  )}
                </div>

                {addressLoading ? (
                  <div className="skeleton h-10 rounded-lg animate-pulse" />
                ) : selectedAddress ? (
                  <div>
                    <p className="font-semibold text-dark text-sm">{selectedAddress.fullName}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                      {formatAddress(selectedAddress)}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">📱 {selectedAddress.phone}</p>
                  </div>
                ) : (
                  <div className="py-2 flex flex-col gap-2">
                    <p className="text-gray-400 text-xs italic leading-tight">No saved addresses found. Please add one to proceed.</p>
                    <button
                      type="button"
                      onClick={() => { setEditAddressId(null); setIsAddressModalOpen(true); }}
                      className="w-full btn-primary py-2 text-xs rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
                    >
                      ➕ Add Delivery Address
                    </button>
                  </div>
                )}

                {/* Address dropdown */}
                {showAddressDropdown && addresses.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-scale-in">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => { setSelectedAddress(addr); setShowAddressDropdown(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-warm transition-colors cursor-pointer ${
                          selectedAddress?.id === addr.id ? "bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                      >
                        <p className="font-semibold text-dark">{addr.fullName}</p>
                        <p className="text-gray-500 text-xs truncate">{formatAddress(addr)}</p>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded mt-1 inline-block">
                            Default
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => { setEditAddressId(null); setIsAddressModalOpen(true); setShowAddressDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors cursor-pointer border-t border-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add New Address
                    </button>
                  </div>
                )}
              </div>

              {/* ── Payment method ─────────────────────────────────────────── */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  💳 Payment Method
                </p>
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">💵</span>
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay when your order arrives</p>
                  </div>
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    COD
                  </span>
                </div>
              </div>

              {/* ── Proceed button ─────────────────────────────────────────── */}
              <button
                onClick={handleProceed}
                className="w-full btn-primary py-4 text-base rounded-xl font-bold tracking-wide"
              >
                Proceed to Checkout →
              </button>

              {/* Security note */}
              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Safe & Secure Checkout
              </p>
            </div>
          </div>

          {/* Kerala promise badge */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
            {[
              { icon: "🌿", label: "100% Authentic" },
              { icon: "🚚", label: "Fast Delivery" },
              // { icon: "↩️", label: "Easy Returns" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-xl">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Reusable Address Modal Popup */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={(savedAddr) => {
          // onSnapshot already refreshed the list; just select immediately
          if (savedAddr) setSelectedAddress(savedAddr);
        }}
        editAddressId={editAddressId}
        userId={displayUser?.uid}
      />
    </div>
  );
};

export default Cart;
