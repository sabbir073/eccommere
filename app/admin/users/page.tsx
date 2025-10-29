'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';
import { showSuccess, showError, showDeleteConfirm } from '@/lib/sweetalert';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'customer',
    is_verified: false,
  });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        showError(data.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      role: 'customer',
      is_verified: false,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditUser = (user: any) => {
    setFormData({
      email: user.email,
      password: '', // Don't pre-fill password
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      is_verified: user.is_verified,
    });
    setEditingId(user.id);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password for new users
    if (!editingId && !formData.password) {
      showError('Password is required for new users');
      return;
    }

    const userData = {
      ...formData,
    };

    // Don't send empty password on edit
    if (editingId && !formData.password) {
      delete (userData as any).password;
    }

    try {
      const url = editingId
        ? `/api/admin/users/${editingId}`
        : '/api/admin/users';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(
          editingId
            ? 'User updated successfully!'
            : 'User created successfully!'
        );
        resetForm();
        fetchUsers();
      } else {
        showError(data.error || 'Failed to save user');
      }
    } catch (err) {
      showError('Failed to save user');
      console.error(err);
    }
  };

  const deleteUser = async (id: number, email: string) => {
    const result = await showDeleteConfirm(email);
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('User deleted successfully');
        fetchUsers();
      } else {
        showError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      showError('Failed to delete user');
    }
  };

  const toggleVerification = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      } else {
        showError(data.error || 'Failed to update user');
      }
    } catch (err) {
      showError('Failed to update user');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading && users.length === 0) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-gray-600">Manage user accounts</p>
          </div>
          {!showAddForm && (
            <button onClick={handleAddUser} className="btn-primary">
              + Add New User
            </button>
          )}
        </div>

        {/* Filters */}
        {!showAddForm && (
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={handleSearchChange}
                className="input-field"
              />
            </div>
            <div className="w-48">
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="input-field"
              >
                <option value="">All Roles</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? 'Edit User' : 'Add New User'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  required
                  className="input-field"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  required
                  className="input-field"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                className="input-field"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password {editingId ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                name="password"
                required={!editingId}
                className="input-field"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
              />
              {!editingId && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <select
                  name="role"
                  required
                  className="input-field"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={formData.is_verified}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-medium">Verified</div>
                    <div className="text-sm text-gray-600">
                      Email verified status
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update User' : 'Create User'}
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600 mb-4">No users found</p>
            {!showAddForm && (
              <button onClick={handleAddUser} className="btn-primary">
                Add Your First User
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {user.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.order_count || 0}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleVerification(user.id, user.is_verified)
                          }
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            user.is_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.is_verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:underline text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.email)}
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
