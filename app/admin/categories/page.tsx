'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';
import IconSelector from '@/components/admin/IconSelector';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    is_active: true,
    display_order: '0',
    icon: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.flat);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parent_id: '',
      is_active: true,
      display_order: '0',
      icon: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });

      // Auto-generate slug from name
      if (name === 'name' && !editingId) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData((prev) => ({ ...prev, slug }));
      }
    }
  };

  const handleIconChange = (icon: string) => {
    setFormData({ ...formData, icon });
  };

  const handleAddCategory = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditCategory = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parent_id: category.parent_id?.toString() || '',
      is_active: category.is_active,
      display_order: category.display_order?.toString() || '0',
      icon: category.icon || '',
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      meta_keywords: category.meta_keywords || '',
    });
    setEditingId(category.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryData = {
      ...formData,
      parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
      display_order: parseInt(formData.display_order),
    };

    try {
      const url = editingId
        ? `/api/categories/${editingId}`
        : '/api/categories';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      const data = await response.json();

      if (data.success) {
        showError(
          editingId
            ? 'Category updated successfully!'
            : 'Category created successfully!'
        );
        resetForm();
        fetchCategories();
      } else {
        showError(data.error || 'Failed to save category');
      }
    } catch (err) {
      showError('Failed to save category');
      console.error(err);
    }
  };

  const deleteCategory = async (id: number, name: string) => {
    const result = await showDeleteConfirm(name);
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Category deleted successfully');
        fetchCategories();
      } else {
        showError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      showError('Failed to delete category');
    }
  };

  const toggleCategoryStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchCategories();
      } else {
        showError(data.error || 'Failed to update category');
      }
    } catch (err) {
      showError('Failed to update category');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          {!showAddForm && (
            <button onClick={handleAddCategory} className="btn-primary">
              + Add New Category
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  required
                  className="input-field"
                  value={formData.slug}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="input-field"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Parent Category
                </label>
                <select
                  name="parent_id"
                  className="input-field"
                  value={formData.parent_id}
                  onChange={handleInputChange}
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((cat) => cat.id !== editingId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  min="0"
                  className="input-field"
                  value={formData.display_order}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <IconSelector
                  value={formData.icon}
                  onChange={handleIconChange}
                />
              </div>
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">SEO Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    className="input-field"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    rows={2}
                    className="input-field"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    className="input-field"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Active</div>
                  <div className="text-sm text-gray-600">
                    Category will be visible on the website
                  </div>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">No categories found</p>
            <button onClick={handleAddCategory} className="btn-primary">
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {category.icon && (
                          <span className="text-xl">{category.icon}</span>
                        )}
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.parent_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toggleCategoryStatus(category.id, category.is_active)
                        }
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          category.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id, category.name)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Tree View */}
      {categories.length > 0 && !showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Category Hierarchy</h2>
          <CategoryTree
            categories={categories.filter((cat) => !cat.parent_id)}
            allCategories={categories}
          />
        </div>
      )}
    </div>
  );
}

// Category Tree Component
function CategoryTree({
  categories,
  allCategories,
  level = 0,
}: {
  categories: any[];
  allCategories: any[];
  level?: number;
}) {
  return (
    <ul className={`space-y-1 ${level > 0 ? 'ml-6 mt-1' : ''}`}>
      {categories.map((category) => {
        const children = allCategories.filter(
          (cat) => cat.parent_id === category.id
        );

        return (
          <li key={category.id}>
            <div className="flex items-center gap-2 py-1">
              {level > 0 && (
                <span className="text-gray-400">└</span>
              )}
              {category.icon && <span>{category.icon}</span>}
              <span className={level === 0 ? 'font-semibold' : ''}>
                {category.name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  category.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {children.length > 0 && (
              <CategoryTree
                categories={children}
                allCategories={allCategories}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
