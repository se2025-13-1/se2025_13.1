import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "./Icons";
import { Category } from "../types";
import { apiClient } from "../services/apiClient";

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    image_url: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded state cho hierarchical view
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getCategoryTree();
      if (res.data && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form open
  const handleOpenForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        parent_id: category.parent_id || "",
        image_url: category.image_url || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", parent_id: "", image_url: "" });
    }
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", parent_id: "", image_url: "" });
    setFormError(null);
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update
        await apiClient.updateCategory(editingCategory.id, {
          name: formData.name,
          parent_id: formData.parent_id || null,
          image_url: formData.image_url || undefined,
        });
      } else {
        // Create
        await apiClient.createCategory({
          name: formData.name,
          parent_id: formData.parent_id || null,
          image_url: formData.image_url || undefined,
        });
      }
      handleCloseForm();
      await fetchCategories();
    } catch (err: any) {
      setFormError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This will also remove all subcategories.`
      )
    ) {
      try {
        await apiClient.deleteCategory(id);
        await fetchCategories();
      } catch (err) {
        alert("Failed to delete category");
        console.error(err);
      }
    }
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Filter categories recursively
  const filterCategoriesRecursive = (cats: any[], term: string): any[] => {
    if (!term.trim()) return cats;

    return cats
      .filter((cat) => cat.name.toLowerCase().includes(term.toLowerCase()))
      .map((cat) => ({
        ...cat,
        children: filterCategoriesRecursive(cat.children || [], term),
      }))
      .concat(
        cats
          .filter((cat) => !cat.name.toLowerCase().includes(term.toLowerCase()))
          .flatMap((cat) => filterCategoriesRecursive(cat.children || [], term))
      );
  };

  // Get flattened categories for parent dropdown
  const getFlattened = (cats: any[] = []): any[] => {
    return cats.flatMap((cat) => [cat, ...getFlattened(cat.children)]);
  };

  // Render category item recursively - uses children from backend tree
  const renderCategoryItem = (category: any, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div
        key={category.id}
        className="border-b border-slate-100 last:border-b-0"
      >
        <div
          className="flex items-center space-x-3 px-6 py-4 hover:bg-slate-50 transition-colors"
          style={{ paddingLeft: `${24 + level * 32}px` }}
        >
          {/* Expand button */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {expandedIds.has(category.id) ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronRight size={18} className="text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Category info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800 truncate">
              {category.name}
            </h3>
            {category.image_url && (
              <p className="text-xs text-slate-400 truncate">
                {category.image_url}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenForm(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => handleDelete(category.id, category.name)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && expandedIds.has(category.id) && (
          <div className="bg-slate-50">
            {category.children.map((child: any) =>
              renderCategoryItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategoriesRecursive(
    categories as any[],
    searchTerm
  );
  const flatCategoriesList = getFlattened(categories as any[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          Categories Management
        </h1>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500">
          Loading categories...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
            <span className="text-4xl">🏷️</span>
          </div>
          <p>No categories found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {filteredCategories.map((cat) => renderCategoryItem(cat))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Form Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCategory ? "Edit Category" : "New Category"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Electronics"
                />
              </div>

              {/* Parent Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Parent Category (Subcategory)
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None (Top-level)</option>
                  {flatCategoriesList
                    .filter((c: any) => c.id !== editingCategory?.id)
                    .map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>

              {/* Preview */}
              {formData.image_url && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
