'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
import { showSuccess, showError, showWarning } from '@/lib/sweetalert';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    category_id: '',
    brand: '',
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: '5',
    weight: '',
    dimensions: '',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data.flat);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });

      // Auto-generate slug from name
      if (name === 'name' && !formData.slug) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData((prev) => ({ ...prev, slug }));
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      showWarning('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        showWarning(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showWarning(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: Date.now(),
        name: '',
        sku: '',
        price_modifier: '0',
        stock_quantity: '0',
      },
    ]);
  };

  const updateVariant = (id: number, field: string, value: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];

      if (images.length > 0) {
        setUploadingImages(true);

        for (const image of images) {
          const formData = new FormData();
          formData.append('file', image);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            imageUrls.push(uploadData.data.url);
          } else {
            throw new Error('Image upload failed');
          }
        }

        setUploadingImages(false);
      }

      // Create product
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: parseInt(formData.category_id),
        images: imageUrls,
        variants: variants.length > 0 ? variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          price_modifier: parseFloat(v.price_modifier),
          stock_quantity: parseInt(v.stock_quantity),
        })) : undefined,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (data.success) {
        await showSuccess('Product created successfully!');
        router.push('/admin/products');
      } else {
        showError(data.error || 'Failed to create product');
      }
    } catch (err) {
      showError('Failed to create product');
      console.error(err);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
        >
          ← Back to Products
        </button>
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name *
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
              <label className="block text-sm font-medium mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                required
                className="input-field"
                value={formData.slug}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version of the name (auto-generated)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Short Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                className="input-field"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Long Description
              </label>
              <textarea
                name="long_description"
                rows={6}
                className="input-field"
                value={formData.long_description}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  required
                  className="input-field"
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  className="input-field"
                  value={formData.brand}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Pricing & Inventory</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <input
                type="text"
                name="sku"
                className="input-field"
                value={formData.sku}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock_quantity"
                required
                min="0"
                className="input-field"
                value={formData.stock_quantity}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Price (৳) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                className="input-field"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Compare at Price (৳)
              </label>
              <input
                type="number"
                name="compare_price"
                min="0"
                step="0.01"
                className="input-field"
                value={formData.compare_price}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                Original price for showing discounts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cost Price (৳)
              </label>
              <input
                type="number"
                name="cost_price"
                min="0"
                step="0.01"
                className="input-field"
                value={formData.cost_price}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">For profit calculation</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                name="low_stock_threshold"
                min="0"
                className="input-field"
                value={formData.low_stock_threshold}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Shipping</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                min="0"
                step="0.01"
                className="input-field"
                value={formData.weight}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dimensions (L x W x H cm)
              </label>
              <input
                type="text"
                name="dimensions"
                placeholder="e.g. 10 x 5 x 3"
                className="input-field"
                value={formData.dimensions}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Product Images</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Images (Max 5, 5MB each)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="input-field"
                disabled={images.length >= 5}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Product Variants</h2>
            <button
              type="button"
              onClick={addVariant}
              className="btn-secondary text-sm"
            >
              + Add Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Add variants like sizes, colors, etc. (Optional)
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="border rounded p-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Red, Large"
                        required
                        className="input-field"
                        value={variant.name}
                        onChange={(e) =>
                          updateVariant(variant.id, 'name', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">SKU</label>
                      <input
                        type="text"
                        className="input-field"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(variant.id, 'sku', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price Modifier (৳)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={variant.price_modifier}
                        onChange={(e) =>
                          updateVariant(variant.id, 'price_modifier', e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariant(variant.id, 'stock_quantity', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    className="text-red-600 hover:text-red-700 text-sm mt-2"
                  >
                    Remove Variant
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">SEO</h2>

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
                rows={3}
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Status</h2>

          <div className="space-y-3">
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
                  Product will be visible on the website
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Featured</div>
                <div className="text-sm text-gray-600">
                  Show in featured products section
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="btn-primary"
          >
            {uploadingImages
              ? 'Uploading Images...'
              : loading
              ? 'Creating Product...'
              : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={loading || uploadingImages}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
