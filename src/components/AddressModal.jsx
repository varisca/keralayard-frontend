import { useState, useEffect } from "react";
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

const AddressModal = ({ isOpen, onClose, onSuccess, editAddressId, userId }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Load existing address if editing ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (!editAddressId) {
      setForm(initialForm);
      setErrors({});
      setLoadingEdit(false);
      return;
    }

    const loadAddress = async () => {
      setLoadingEdit(true);
      try {
        const snap = await getDoc(doc(db, "addresses", editAddressId));
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
          onClose();
        }
      } catch (err) {
        console.error("Failed to load address:", err);
        toast.error("Failed to load address details");
        onClose();
      } finally {
        setLoadingEdit(false);
      }
    };
    loadAddress();
  }, [isOpen, editAddressId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fill all required fields correctly");
      return;
    }
    if (!userId) {
      toast.error("User session not found. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId,
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

      let savedAddress = null;
      if (editAddressId) {
        await updateDoc(doc(db, "addresses", editAddressId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        savedAddress = { id: editAddressId, ...payload };
        toast.success("Address updated successfully! 🏠", {
          style: { background: "#1B6B3A", color: "#fff", borderRadius: "12px" },
        });
      } else {
        const docRef = await addDoc(collection(db, "addresses"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        savedAddress = { id: docRef.id, ...payload };
        toast.success("Address added successfully! 🏠", {
          style: { background: "#1B6B3A", color: "#fff", borderRadius: "12px" },
        });
      }
      
      if (onSuccess) {
        onSuccess(savedAddress);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      {/* Background dismiss */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Modal box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-primary text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg">
              {editAddressId ? "🏠 Edit Address" : "🏠 Add Shipping Address"}
            </h3>
            <p className="text-white/80 text-xs mt-0.5">
              Enter your shipping destination details below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body (Scrollable) */}
        {loadingEdit ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-8 h-8 animate-spin text-primary mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs">Loading address details…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Contact Detail Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 flex items-center gap-1">
                <span>👤</span> Contact Info
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="e.g. Priya Menon"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                    errors.fullName ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className={`flex items-center rounded-xl border-2 bg-white overflow-hidden transition-colors ${
                  errors.phone ? "border-red-300" : "border-gray-200 focus-within:border-primary"
                }`}>
                  <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 font-medium">+91</span>
                  <input
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
                    className="flex-1 px-3.5 py-2.5 outline-none text-dark placeholder-gray-300 text-sm bg-transparent"
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
            </div>

            {/* Address Detail Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1 flex items-center gap-1">
                <span>📍</span> Shipping Address
              </h4>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Address Line 1 <span className="text-red-400">*</span>
                </label>
                <input
                  name="addressLine1"
                  type="text"
                  placeholder="House No., Building, Street name"
                  value={form.addressLine1}
                  onChange={handleChange}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                    errors.addressLine1 ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary"
                  }`}
                />
                {errors.addressLine1 && <p className="text-xs text-red-400 mt-1">{errors.addressLine1}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Address Line 2 <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="addressLine2"
                  type="text"
                  placeholder="Apartment, colony, area"
                  value={form.addressLine2}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-dark placeholder-gray-300 outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Landmark <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  name="landmark"
                  type="text"
                  placeholder="Near temple, opposite school, etc."
                  value={form.landmark}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-dark placeholder-gray-300 outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="city"
                    type="text"
                    placeholder="e.g. Kochi"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                      errors.city ? "border-red-300" : "border-gray-200 focus:border-primary"
                    }`}
                  />
                  {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white text-dark placeholder-gray-300 outline-none transition-colors text-sm ${
                      errors.pincode ? "border-red-300" : "border-gray-200 focus:border-primary"
                    }`}
                  />
                  {errors.pincode && <p className="text-xs text-red-400 mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  State <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className={`w-full px-3.5 py-2.5 rounded-xl border-2 bg-white text-dark outline-none transition-colors text-sm appearance-none cursor-pointer pr-10 ${
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

              <label className="flex items-center gap-3 cursor-pointer group select-none pt-1">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  form.isDefault ? "bg-primary border-primary" : "border-gray-300 bg-white group-hover:border-primary"
                }`}>
                  {form.isDefault && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-dark font-semibold">Set as default delivery address</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/95 transition-all text-sm cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : editAddressId ? "Update Address 🏠" : "Save Address 🏠"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressModal;
