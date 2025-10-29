'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh',
    is_default: false,
    address_type: 'both' as 'shipping' | 'billing' | 'both',
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/users/addresses');
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/users/addresses/${editingId}`
        : '/api/users/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showError(editingId ? 'Address updated!' : 'Address added!');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchAddresses();
      } else {
        showError(data.error || 'Failed to save address');
      }
    } catch (err) {
      showError('Failed to save address');
    }
  };

  const handleEdit = (address: any) => {
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      email: address.email || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country,
      is_default: address.is_default,
      address_type: address.address_type,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirm('Delete this address?'); if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/users/addresses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setAddresses(addresses.filter((addr) => addr.id !== id));
      } else {
        showError(data.error || 'Failed to delete address');
      }
    } catch (err) {
      showError('Failed to delete address');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Bangladesh',
      is_default: false,
      address_type: 'both',
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Addresses</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          + Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.address_line2}
                  onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <select
                  required
                  className="input-field"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="">Select City</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address Type</label>
                <select
                  className="input-field"
                  value={formData.address_type}
                  onChange={(e) => setFormData({ ...formData, address_type: e.target.value as any })}
                >
                  <option value="both">Shipping & Billing</option>
                  <option value="shipping">Shipping Only</option>
                  <option value="billing">Billing Only</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_default" className="text-sm">
                  Set as default address
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Address' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-bold mb-2">No Addresses Yet</h2>
          <p className="text-gray-600 mb-6">Add your first address for faster checkout</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg p-6 border-2 ${
                address.is_default ? 'border-primary-600' : 'border-gray-200'
              }`}
            >
              {address.is_default && (
                <span className="inline-block bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded mb-3">
                  Default
                </span>
              )}

              <div className="mb-4">
                <p className="font-bold text-lg">{address.full_name}</p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                {address.email && <p className="text-sm text-gray-600">{address.email}</p>}
              </div>

              <div className="text-sm text-gray-700 mb-4">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}
                  {address.postal_code && `, ${address.postal_code}`}
                </p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {address.address_type === 'both' ? 'Shipping & Billing' :
                   address.address_type === 'shipping' ? 'Shipping Only' : 'Billing Only'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-primary-600 hover:underline text-sm"
                >
                  Edit
                </button>
                {!address.is_default && (
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
