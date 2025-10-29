'use client';

import { useEffect, useState } from 'react';
import Loading from '@/components/ui/Loading';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setProfileData({
          first_name: data.data.first_name,
          last_name: data.data.last_name,
          email: data.data.email,
          phone: data.data.phone || '',
        });
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Profile updated successfully');
        fetchUser();
      } else {
        showError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      showError('Failed to update profile');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('New passwords do not match!');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showError('Password must be at least 6 characters!');
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.current_password,
          newPassword: passwordData.new_password,
          confirmPassword: passwordData.confirm_password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Password changed successfully');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        showError(data.error || 'Failed to change password');
      }
    } catch (err) {
      showError('Failed to change password');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'info'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'info' && (
            <form onSubmit={handleUpdateProfile} className="max-w-2xl">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, first_name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, last_name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Changing your email will require verification
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={fetchUser}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    value={passwordData.current_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        current_password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        new_password: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input-field"
                    value={passwordData.confirm_password}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirm_password: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary"
                  >
                    {updating ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: '',
                      })
                    }
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Account Status</p>
            <p className="font-semibold">
              {user?.is_verified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-yellow-600">⚠ Not Verified</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Member Since</p>
            <p className="font-semibold">
              {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Account Type</p>
            <p className="font-semibold capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
