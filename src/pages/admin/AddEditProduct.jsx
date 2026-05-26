import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Save,
  Package,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase/firebase";
import { useAppContext } from "../../context/AppContext";
import { uploadImageWithFallback } from "../../utils/imageUpload";
import toast from "react-hot-toast";

const DEFAULT_MEASUREMENT_OPTIONS = ["g", "kg", "ml", "L", "piece", "pack", "box", "bottle", "jar"];

const splitWeight = (value = "", unitOptions = DEFAULT_MEASUREMENT_OPTIONS) => {
  const trimmed = value.trim();
  const unit = [...unitOptions]
    .sort((a, b) => b.length - a.length)
    .find((option) => trimmed.toLowerCase().endsWith(option.toLowerCase()));

  if (!unit) return { amount: trimmed, unit: unitOptions[0] || "g" };

  return {
    amount: trimmed.slice(0, -unit.length).trim(),
    unit,
  };
};

// Toggle component
const Toggle = ({ checked, onChange, activeColor = "#1B6B3A" }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer`}
    style={{ backgroundColor: checked ? activeColor : "#D1D5DB" }}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, user } = useAppContext();

  useEffect(() => {
    if (user?.role === "employee") {
      toast.error("Access denied. Employees have view-only catalog rights.");
      navigate("/admin/products");
    }
  }, [user, navigate]);

  const isEditMode = !!id;

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("cat_general");
  const [mrp, setMrp] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stock, setStock] = useState("");
  const [weightAmount, setWeightAmount] = useState("");
  const [measurementUnit, setMeasurementUnit] = useState(DEFAULT_MEASUREMENT_OPTIONS[0]);
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]); // array of URLs

  // Local UI States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedCategory =
    (categories && categories.find((c) => c.id === categoryId)) || null;
  const measurementOptions =
    selectedCategory?.measurementOptions?.length > 0
      ? selectedCategory.measurementOptions
      : DEFAULT_MEASUREMENT_OPTIONS;

  // Auto slug generation on name change (only for adding)
  const handleNameChange = (val) => {
    setName(val);
    if (!isEditMode) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Load product if editing
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setSlug(data.slug || "");
          setDescription(data.description || "");
          setCategoryId(data.categoryId || "cat_general");
          setMrp(data.mrp !== undefined ? data.mrp.toString() : "");
          setSellingPrice(data.sellingPrice !== undefined ? data.sellingPrice.toString() : "");
          setStock(data.stock !== undefined ? data.stock.toString() : "");
          const parsedWeight = splitWeight(data.weight || "", DEFAULT_MEASUREMENT_OPTIONS);
          setWeightAmount(parsedWeight.amount);
          setMeasurementUnit(parsedWeight.unit);
          setFeatured(!!data.featured);
          setActive(data.active !== undefined ? !!data.active : true);
          setTags(data.tags ? data.tags.join(", ") : "");
          setImages(data.images || []);
        } else {
          toast.error("Product not found");
          navigate("/admin/products");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    if (!measurementOptions.includes(measurementUnit)) {
      setMeasurementUnit(measurementOptions[0] || DEFAULT_MEASUREMENT_OPTIONS[0]);
    }
  }, [measurementOptions, measurementUnit]);

  // Upload image to Storage
  const handleImageUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const result = await uploadImageWithFallback({
        storage,
        file,
        path: `products/${Date.now()}_${file.name}`,
        skipStorage: !auth.currentUser,
      });

      setImages((prev) => [...prev, result.url]);
      toast.success(result.storageBacked ? "Image uploaded successfully!" : "Image saved locally for this product.");
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image URL
  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Product name is required");
    if (!slug.trim()) return toast.error("Slug is required");
    if (!sellingPrice) return toast.error("Selling price is required");
    if (!stock) return toast.error("Stock quantity is required");
    if (!weightAmount.trim()) return toast.error("Weight/volume amount is required");

    const selectedCategory = (categories && categories.find((c) => c.id === categoryId)) || { id: "cat_general", name: "General" };
    const finalWeight = `${weightAmount.trim()}${measurementUnit}`;

    setSaving(true);
    try {
      const productId = id || `prod_${slug.replace(/-/g, "_")}`;

      const tagArray = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const payload = {
        id: productId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        images: images.length > 0 ? images : [null],
        mrp: parseFloat(mrp) || parseFloat(sellingPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock, 10) || 0,
        featured,
        active,
        tags: tagArray,
        weight: finalWeight,
        measurementUnit,
      };

      await setDoc(doc(db, "products", productId), payload);
      toast.success(isEditMode ? "Product updated!" : "Product added successfully! 🌿");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Loader2 size={36} className="animate-spin text-[#1B6B3A] mb-3" />
        <p className="text-sm font-medium">Fetching product info...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            {isEditMode ? `Updating fields for "${name}"` : "Create a new authentic Kerala grocery listing"}
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Fields (Col Span 2) */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-2">
              General Information
            </h2>

            {/* Product Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Product Title / Name
              </label>
              <input
                type="text"
                placeholder="e.g. Extra-Virgin Wood-Pressed Coconut Oil"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                URL Slug (lowercase & hyphenated)
              </label>
              <input
                type="text"
                placeholder="extra-virgin-coconut-oil"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 font-mono text-gray-600"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Description / Product Story
              </label>
              <textarea
                placeholder="Describe the product's origin, taste, and use cases..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-2">
              Pricing, Inventory & Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Selling Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="249"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  required
                  min="0"
                />
              </div>

              {/* MRP */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Original MRP (₹)
                </label>
                <input
                  type="number"
                  placeholder="299"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stock */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Stock Units Available
                </label>
                <input
                  type="number"
                  placeholder="85"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  required
                  min="0"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Weight / Volume
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="500"
                    value={weightAmount}
                    onChange={(e) => setWeightAmount(e.target.value)}
                    className="min-w-0 flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                    required
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={measurementUnit}
                    onChange={(e) => setMeasurementUnit(e.target.value)}
                    className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white cursor-pointer"
                  >
                    {measurementOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Categorization, Images & Status (Col Span 1) */}
        <div className="space-y-5">
          {/* Images Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-2">
              Product Images
            </h2>

            {/* Upload Area */}
            <label className="border border-dashed border-gray-200 hover:border-green-500 rounded-2xl p-4 flex flex-col items-center gap-1.5 cursor-pointer transition-colors text-center">
              {uploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-[#1B6B3A]" />
                  <span className="text-xs text-gray-500 mt-1">Uploading file...</span>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700">Upload Image Cover</span>
                  <span className="text-[10px] text-gray-400">supports PNG, JPG, JPEG</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {/* Images Grid */}
            {images.filter((img) => img !== null).length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images
                  .filter((img) => img !== null)
                  .map((url, index) => (
                    <div
                      key={index}
                      className="relative border border-gray-100 rounded-lg aspect-square bg-gray-50 overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 rounded-full text-white transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Categorization & Tags */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-2">
              Categorization
            </h2>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase block">
                Product Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 bg-white cursor-pointer"
              >
                <option value="cat_general">General / No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || "🥥"} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. snack, banana, organic"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
              />
            </div>
          </div>

          {/* Product Visibility Status */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 border-b border-gray-50 pb-2">
              Visibility & Status
            </h2>

            {/* Featured Product */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Featured Product</p>
                <p className="text-xs text-gray-400">Show on homepage collections</p>
              </div>
              <Toggle checked={featured} onChange={setFeatured} activeColor="#D4A017" />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Active Status</p>
                <p className="text-xs text-gray-400">Visible to customer buyers</p>
              </div>
              <Toggle checked={active} onChange={setActive} activeColor="#1B6B3A" />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="md:col-span-3 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B6B3A] hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? "Save Changes" : "Publish Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
