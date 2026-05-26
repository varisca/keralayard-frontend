import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { db } from "../firebase/firebase";
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

// ─── All Indian states ──────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ─── Initial form state ─────────────────────────────────────────────────────
const initialForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "Kerala",
  pincode: "",
  isDefault: false,
};

const AddAddress = () => {
  const { user, navigate } = useAppContext();

  // Read query params: ?id=addressId&back=/profile
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");
  const backUrl = params.get("back") || "/profile";
  const isEditMode = Boolean(editId);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  // ── Load existing address if editing ────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const loadAddress = async () => {
      try {
        const snap = await getDoc(doc(db, "addresses", editId));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            fullName: data.fullName || "",
            phone: data.phone || "",
            addressLine1: data.addressLine1 || "",
            addressLine2: data.addressLine2 || "",
            landmark: data.landmark || "",
            city: data.city || "",
            state: data.state || "Kerala",
            pincode: data.pincode || "",
            isDefault: data.isDefault || false,
          });
        } else {
          toast.error("Address not found");
          navigate(backUrl);
        }
      } catch (err) {
        console.error("Failed to load address:", err);
        toast.error("Failed to load address");
        navigate(backUrl);
      } finally {
        setLoadingEdit(false);
      }
    };
    loadAddress();
  }, [editId]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state) newErrors.state = "Please select a state";
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";
    return newErrors;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before saving");
      return;
    }
    if (!user) {
      toast.error("Please sign in to save an address");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: user.uid,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state,
        pincode: form.pincode.trim(),
        isDefault: form.isDefault,
      };

      if (isEditMode) {
        await updateDoc(doc(db, "addresses", editId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success("Address updated! 🏠", {
          style: { background: "#1B6B3A", color: "#fff", borderRadius: "12px" },
        });
      } else {
        await addDoc(collection(db, "addresses"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success("Address saved! 🏠", {
          style: { background: "#1B6B3A", color: "#fff", borderRadius: "12px" },
        });
      }
      navigate(backUrl);
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingEdit) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm">Loading address…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={() => navigate(backUrl)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary font-medium mb-4 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-dark">
          {isEditMode ? "Edit" : "Add"} Shipping <span className="text-primary">Address</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          All fields marked with <span className="text-red-400">*</span> are required
        </p>
      </div>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Section: Contact */}
          <div className="px-6 py-4 bg-primary/5 border-b border-gray-100">
            <h2 className="font-bold text-dark text-sm flex items-center gap-2">
              <span>👤</span> Contact Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Priya Menon"
                value={form.fullName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                  errors.fullName ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center rounded-xl border-2 bg-white overflow-hidden transition-colors ${
                errors.phone ? "border-red-300" : "border-gray-200 focus-within:border-primary"
              }`}>
                <span className="px-3 py-3 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">+91</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((prev) => ({ ...prev, phone: val }));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  maxLength={10}
                  className="flex-1 px-4 py-3 outline-none text-dark placeholder-gray-300 text-sm bg-transparent"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Section: Address */}
          <div className="px-6 py-4 bg-primary/5 border-y border-gray-100">
            <h2 className="font-bold text-dark text-sm flex items-center gap-2">
              <span>📍</span> Address Details
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Address Line 1 <span className="text-red-400">*</span>
              </label>
              <input
                name="addressLine1"
                type="text"
                placeholder="House No., Building, Street name"
                value={form.addressLine1}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                  errors.addressLine1 ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.addressLine1 && <p className="text-xs text-red-400 mt-1">{errors.addressLine1}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                name="addressLine2"
                type="text"
                placeholder="Apartment, colony, area"
                value={form.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-dark placeholder-gray-300 outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Landmark <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                name="landmark"
                type="text"
                placeholder="Near temple, opposite school, etc."
                value={form.landmark}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-dark placeholder-gray-300 outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  name="city"
                  type="text"
                  placeholder="e.g. Kochi"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                    errors.city ? "border-red-300" : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  name="pincode"
                  type="text"
                  placeholder="682001"
                  value={form.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm((prev) => ({ ...prev, pincode: val }));
                    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: "" }));
                  }}
                  maxLength={6}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                    errors.pincode ? "border-red-300" : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.pincode && <p className="text-xs text-red-400 mt-1">{errors.pincode}</p>}
              </div>
            </div>

            {/* State dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                State <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-white text-dark outline-none transition-colors text-sm appearance-none cursor-pointer pr-10 ${
                    errors.state ? "border-red-300" : "border-gray-200 focus:border-primary"
                  }`}
                >
                  <option value="">Select state…</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
              {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state}</p>}
            </div>

            {/* Set as default */}
            <label className="flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  form.isDefault ? "bg-primary border-primary" : "border-gray-300 bg-white group-hover:border-primary"
                }`}>
                  {form.isDefault && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-dark font-medium">Set as my default delivery address</span>
            </label>
          </div>

          {/* ── Action buttons ───────────────────────────────────────────────── */}
          <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3.5 text-base rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </span>
              ) : (
                isEditMode ? "Update Address 🏠" : "Save Address 🏠"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="px-6 py-3.5 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 justify-center">
        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Your address is stored securely and used only for delivery purposes
      </div>
    </div>
  );
};

export default AddAddress;
