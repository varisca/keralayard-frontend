import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { dummyProducts } from "../assets/keralaData";
import { db, auth } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import toast from "react-hot-toast";
import AddressModal from "../components/AddressModal";

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23F0F4F0'/%3E%3Ctext x='40' y='44' font-size='28' text-anchor='middle' fill='%231B6B3A'%3E🌿%3C/text%3E%3C/svg%3E";

// ─── Breadcrumb ────────────────────────────────────────────────────────────
const Breadcrumb = ({ step }) => {
  const steps = ["Cart", "Checkout", "Confirmation"];
  return (
    <nav className="flex items-center gap-2 text-sm mb-8">
      {steps.map((s, i) => (
        <span key={s} className="flex items-center gap-2">
          {i > 0 && (
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
          <span
            className={`font-medium ${
              i < step
                ? "text-primary"
                : i === step
                ? "text-dark font-bold"
                : "text-gray-400"
            }`}
          >
            {i < step ? (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {s}
              </span>
            ) : s}
          </span>
        </span>
      ))}
    </nav>
  );
};

// ─── Order confirmed state ─────────────────────────────────────────────────
const OrderSuccess = ({ orderNumber, onContinue }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in">
    {/* Checkmark animation */}
    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in">
      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    </div>
    <h2 className="text-2xl md:text-3xl font-bold text-dark mb-2">Order Placed! 🎉</h2>
    <p className="text-gray-500 mb-2 text-center">
      Your Kerala Yard order has been placed successfully.
    </p>
    <p className="text-sm text-gray-400 mb-1">Order Number</p>
    <p className="text-lg font-bold text-primary mb-8 bg-primary/10 px-6 py-2 rounded-full">
      #{orderNumber}
    </p>
    <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
      You'll pay <span className="font-semibold text-dark">cash on delivery</span> when your
      package arrives. We'll send updates to your email.
    </p>
    <div className="flex gap-4 flex-wrap justify-center">
      <button
        onClick={() => onContinue("orders")}
        className="btn-primary px-8 py-3 rounded-xl"
      >
        View My Orders
      </button>
      <button
        onClick={() => onContinue("shop")}
        className="px-8 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition cursor-pointer"
      >
        Continue Shopping
      </button>
    </div>
  </div>
);

const Checkout = () => {
  const {
    cartItems,
    products,
    user,
    clearCart,
    navigate,
    currency,
    getCartAmount,
  } = useAppContext();

  const displayUser = user && !user.isStaff ? user : null;

  const allProducts = products.length > 0 ? products : dummyProducts;

  // ── Cart array ─────────────────────────────────────────────────────────────
  const cartArray = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = allProducts.find((p) => p.id === id);
      return product ? { ...product, quantity: qty } : null;
    })
    .filter(Boolean);

  // ── Address state ──────────────────────────────────────────────────────────
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressDropdown, setAddressDropdown] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // ── Order state ────────────────────────────────────────────────────────────
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (confirmed) {
      window.scrollTo(0, 0);
    }
  }, [confirmed]);

  // ── Load addresses ─ real-time so newly added addresses appear instantly ──────────
  const [addressesLoading, setAddressesLoading] = useState(true);

  useEffect(() => {
    if (!displayUser) {
      setAddressesLoading(false);
      return;
    }
    const q = query(
      collection(db, "addresses"),
      where("userId", "==", displayUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const addrs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAddresses(addrs);
        // Auto-select default or first address
        if (addrs.length > 0 && !selectedAddress) {
          setSelectedAddress(addrs.find((a) => a.isDefault) || addrs[0]);
        }
        setAddressesLoading(false);
      },
      (err) => {
        console.error("Failed to load addresses:", err);
        setAddressesLoading(false);
      }
    );
    return () => unsub();
  }, [displayUser?.uid]);

  // ── Redirect if cart empty ─────────────────────────────────────────────────
  useEffect(() => {
    if (!confirmed && cartArray.length === 0) {
      navigate("/cart");
    }
  }, [cartArray, confirmed]);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const subtotal = getCartAmount();
  const deliveryCharge = subtotal > 0 && subtotal < 299 ? 40 : 0;
  const tax = Math.round(subtotal * 0.02 * 100) / 100;
  const total = Math.round((subtotal + deliveryCharge) * 100) / 100;

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    // Always read the UID directly from Firebase Auth at order time.
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      toast.error("Please sign in to place an order");
      return;
    }

    setPlacing(true);

    const localId = generateOrderId();
    const customOrderId = `order_${localId.toLowerCase()}`;

    try {
      const { doc: fsDoc, setDoc: fsSetDoc } = await import("firebase/firestore");
      const payload = {
        id: customOrderId,
        userId: currentUid,
        userEmail: auth.currentUser?.email || "",
        userName: auth.currentUser?.displayName || "",
        items: cartArray.map((p) => ({
          id: p.id,
          name: p.name,
          qty: p.quantity,
          sellingPrice: p.sellingPrice,
          mrp: p.mrp,
          weight: p.weight,
        })),
        address: selectedAddress,
        amount: total,
        status: "placed",
        paymentMethod: "cod",
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await fsSetDoc(fsDoc(db, "orders", customOrderId), payload);
      setOrderNumber(localId);
      clearCart();
      setConfirmed(true);
      toast.success("Order placed successfully! 🎉", {
        duration: 4000,
        style: { background: "#1B6B3A", color: "#fff", borderRadius: "12px" },
      });
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Failed to place order. Please check your connection and try again.", {
        style: { background: "#DC2626", color: "#fff", borderRadius: "12px" },
      });
    } finally {
      setPlacing(false);
    }
  };

  const generateOrderId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return "KY" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  const handleContinue = (dest) => {
    if (dest === "orders") navigate("/my-orders");
    else { navigate("/products"); window.scrollTo(0, 0); }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return [addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode]
      .filter(Boolean)
      .join(", ");
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
        <Breadcrumb step={2} />
        <OrderSuccess orderNumber={orderNumber} onContinue={handleContinue} />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <Breadcrumb step={1} />
        <h1 className="text-2xl md:text-3xl font-bold text-dark mb-8">Review &amp; Confirm Order</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left: Items + Address + Payment ─────────────────────────────── */}
          <div className="flex-1 space-y-6">
            {/* Order items */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <h2 className="font-bold text-dark">Order Items ({cartArray.length})</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {cartArray.map((product) => {
                  const imageUrl = product.images?.[0] || PLACEHOLDER;
                  return (
                    <div key={product.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-warm overflow-hidden border border-gray-100">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = PLACEHOLDER; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark text-sm leading-tight line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{product.weight}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">Qty: {product.quantity}</p>
                        <p className="font-bold text-primary text-sm">
                          {currency}{product.sellingPrice * product.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <h2 className="font-bold text-dark">Delivery Address</h2>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={() => setAddressDropdown((v) => !v)}
                    className="text-sm text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              <div className="px-5 py-4 relative">
                {addressesLoading ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                    <svg className="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading addresses…
                  </div>
                ) : addresses.length === 0 ? (
                  /* ── No saved addresses: show Add button that opens modal ── */
                  <div className="text-center py-6">
                    <span className="text-4xl">📭</span>
                    <p className="text-gray-500 text-sm mt-3 mb-4">
                      No saved addresses yet. Add one to continue.
                    </p>
                    <button
                      onClick={() => setAddressModalOpen(true)}
                      className="btn-primary px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Delivery Address
                    </button>
                  </div>
                ) : selectedAddress ? (
                  <div>
                    <p className="font-bold text-dark">{selectedAddress.fullName}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {formatAddress(selectedAddress)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">📱 {selectedAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No address selected</p>
                )}

                {/* Address dropdown */}
                {addressDropdown && addresses.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 bg-white border border-gray-200 rounded-b-xl shadow-lg overflow-hidden animate-scale-in mx-5">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => { setSelectedAddress(addr); setAddressDropdown(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-warm transition cursor-pointer ${
                          selectedAddress?.id === addr.id ? "bg-primary/10 border-l-2 border-primary" : ""
                        }`}
                      >
                        <p className="font-semibold text-dark">{addr.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{formatAddress(addr)}</p>
                      </button>
                    ))}
                    <button
                      onClick={() => { setAddressDropdown(false); setAddressModalOpen(true); }}
                      className="w-full text-left px-4 py-3 text-sm text-primary font-semibold hover:bg-primary/5 transition cursor-pointer border-t border-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add New Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="text-lg">💳</span>
                <h2 className="font-bold text-dark">Payment Method</h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    💵
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-dark">Cash on Delivery</p>
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        COD
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Pay cash when your order arrives at your doorstep
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Price summary ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[360px] lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
              <div className="bg-primary px-6 py-4">
                <h2 className="text-lg font-bold text-white">Price Breakdown</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-dark">{currency}{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <span className="font-medium text-dark">{currency}{deliveryCharge}</span>
                    )}
                  </div>
                  {/* <div className="flex justify-between text-gray-600">
                    <span>Tax (2%)</span>
                    <span className="font-medium text-dark">{currency}{tax}</span>
                  </div> */}
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                    <span className="font-bold text-dark text-base">Total Payable</span>
                    <span className="font-bold text-primary text-xl">{currency}{total}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    This is a <strong>Cash on Delivery</strong> order. No online payment
                    is required now. Please have exact change ready.
                  </p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full btn-primary py-4 text-base rounded-xl font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Placing Order…
                    </span>
                  ) : (
                    "Place Order 🌿"
                  )}
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600 cursor-pointer py-1 transition"
                >
                  ← Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inline Add-Address Modal ──────────────────────────────────────────── */}
      <AddressModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSuccess={(savedAddr) => {
          // onSnapshot listener will pick it up automatically;
          // also immediately select the newly saved address
          setSelectedAddress(savedAddr);
        }}
        editAddressId={null}
        userId={displayUser?.uid}
      />
    </>
  );
};

export default Checkout;
