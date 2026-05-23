import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  FolderOpen,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
// Presets for Kerala-style pastel colors
// ─────────────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { value: "#FFF3E0", label: "Orange-Warm" },
  { value: "#F0F8F0", label: "Coconut-Green" },
  { value: "#FFF8E1", label: "Spice-Gold" },
  { value: "#E8F5E9", label: "Leaf-Green" },
  { value: "#E3F2FD", label: "Backwater-Blue" },
  { value: "#FCE4EC", label: "Mixture-Pink" },
  { value: "#F3E5F5", label: "Matta-Purple" },
  { value: "#FFFDE7", label: "Mango-Yellow" },
];

const EMOJI_PRESETS = ["🍌", "🥥", "🌶️", "🥣", "❄️", "🧆", "🌾", "🫙", "🍛", "🫓", "☕", "🍯"];

const Categories = () => {
  const { categories, categoriesLoading } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("🥥");
  const [bgColor, setBgColor] = useState("#FFF3E0");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Handle Name change -> auto Slug
  const handleNameChange = (val) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName("");
    setSlug("");
    setIcon("🥥");
    setBgColor("#FFF3E0");
    setImageFile(null);
    setImageUrl("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat) => {
    setIsEditing(true);
    setCurrentId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "🥥");
    setBgColor(cat.bgColor || "#FFF3E0");
    setImageFile(null);
    setImageUrl(cat.image || "");
    setModalOpen(true);
  };

  // File selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // File upload to storage
  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const storageRef = ref(storage, `categories/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Failed to upload image. Using fallback.");
      return "";
    } finally {
      setUploading(false);
    }
  };

  // Save Category
  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");
    if (!slug.trim()) return toast.error("Slug is required");

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      const categoryId = currentId || `cat_${slug.replace(/-/g, "_")}`;
      const payload = {
        id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        icon,
        bgColor,
        image: finalImageUrl || null,
      };

      await setDoc(doc(db, "categories", categoryId), payload);
      toast.success(isEditing ? "Category updated!" : "Category created successfully! 🌿");
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error("Failed to save category. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "categories", deleteTarget.id));
      toast.success(`Category "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Failed to delete category.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your Kerala Yard store categories
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ backgroundColor: "#1B6B3A" }}
        >
          <Plus size={17} />
          Add Category
        </button>
      </div>

      {/* Loading state */}
      {categoriesLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 size={36} className="animate-spin text-[#1B6B3A] mb-3" />
          <p className="text-sm font-medium">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-100 rounded-2xl text-gray-400">
          <FolderOpen size={40} className="mb-3 opacity-40" />
          <p className="font-medium">No categories found</p>
          <p className="text-sm">Click the button above to add your first category.</p>
        </div>
      ) : (
        /* Category Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Background accent decor */}
              <div
                className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                style={{ backgroundColor: category.bgColor }}
              />

              <div className="space-y-4">
                {/* Visual Circle (Emoji / Image Cover) */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: category.bgColor }}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML = `<span class="text-3xl">${category.icon || "🥥"}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-3xl">{category.icon || "🥥"}</span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1 font-mono">
                    slug: {category.slug}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 font-mono">
                    id: {category.id}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-gray-50">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-[#1B6B3A] rounded-lg transition-colors cursor-pointer"
                >
                  <Edit size={13} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(category)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add/Edit Category Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Category Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Banana Chips"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="banana-chips"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 font-mono"
                  required
                />
              </div>

              {/* Background Color Curated Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Background Theme Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setBgColor(preset.value)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        bgColor === preset.value
                          ? "border-[#1B6B3A] scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-gray-200 appearance-none bg-transparent"
                  />
                </div>
              </div>

              {/* Icon / Emoji Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Category Emoji Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_PRESETS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${
                        icon === e ? "bg-green-100 text-[#1B6B3A]" : "hover:bg-gray-100"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase block">
                  Category Image Cover (Optional)
                </label>
                <div className="border border-dashed border-gray-200 rounded-xl p-3 flex flex-col items-center gap-2">
                  {imageUrl && !imageFile ? (
                    <div className="flex items-center gap-3 w-full bg-gray-50 p-2 rounded-lg">
                      <img
                        src={imageUrl}
                        alt="Current"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="text-xs text-gray-500 truncate flex-1">
                        Current Image Cover
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-red-500 hover:text-red-700 text-xs font-bold uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={22} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {imageFile ? imageFile.name : "Select an image cover to upload"}
                      </span>
                      <label className="cursor-pointer text-xs font-bold text-[#1B6B3A] hover:underline">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: "#1B6B3A" }}
                >
                  {(saving || uploading) && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isEditing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Category</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-5">
              Are you sure you want to delete category{" "}
              <span className="font-semibold">"{deleteTarget.name}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
