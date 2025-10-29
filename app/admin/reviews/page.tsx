'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Loading from '@/components/ui/Loading';
import Pagination from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';

import { showSuccess, showError, showWarning, showInfo, showConfirm, showDeleteConfirm } from '@/lib/sweetalert';
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchReviews(1, filter);
  }, [filter]);

  const fetchReviews = async (page: number, filterStatus: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');

      if (filterStatus === 'pending') {
        params.set('approved', 'false');
      } else if (filterStatus === 'approved') {
        params.set('approved', 'true');
      }

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data.reviews || []);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        showError(data.error || 'Failed to load reviews');
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: number) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: true }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Review approved successfully');
        fetchReviews(pagination.page, filter);
      } else {
        showError(data.error || 'Failed to approve review');
      }
    } catch (err) {
      showError('Failed to approve review');
    }
  };

  const unapproveReview = async (id: number) => {
    const result = await showConfirm('Unapprove this review?'); if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: false }),
      });

      const data = await response.json();

      if (data.success) {
        showError('Review unapproved');
        fetchReviews(pagination.page, filter);
      } else {
        showError(data.error || 'Failed to unapprove review');
      }
    } catch (err) {
      showError('Failed to unapprove review');
    }
  };

  const deleteReview = async (id: number) => {
    const result = await showConfirm('Delete this review? This cannot be undone.'); if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Review deleted successfully');
        fetchReviews(pagination.page, filter);
      } else {
        showError(data.error || 'Failed to delete review');
      }
    } catch (err) {
      showError('Failed to delete review');
    }
  };

  if (loading) {
    return <Loading />;
  }

  const pendingCount = reviews.filter((r) => !r.is_approved).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Reviews Moderation</h1>
            <p className="text-gray-600">Manage customer product reviews</p>
          </div>
          {pendingCount > 0 && filter === 'all' && (
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded font-semibold">
              {pendingCount} Pending Review{pendingCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded font-medium ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600">
              {filter === 'pending'
                ? 'No pending reviews'
                : filter === 'approved'
                ? 'No approved reviews yet'
                : 'No reviews yet'}
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  !review.is_approved ? 'border-l-4 border-yellow-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    {/* Product Info */}
                    <div className="mb-3">
                      <Link
                        href={`/products/${review.product_slug}`}
                        className="text-primary-600 hover:underline font-semibold"
                      >
                        {review.product_name}
                      </Link>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500">
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({review.rating}/5)
                      </span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h3 className="font-semibold mb-2">{review.title}</h3>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    {/* Reviewer Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">
                        {review.user_name || 'Anonymous'}
                      </span>
                      <span>•</span>
                      <span>{formatDate(review.created_at)}</span>
                      {review.verified_purchase && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">
                            ✓ Verified Purchase
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded ${
                        review.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t">
                  {!review.is_approved ? (
                    <button
                      onClick={() => approveReview(review.id)}
                      className="btn-primary text-sm"
                    >
                      Approve Review
                    </button>
                  ) : (
                    <button
                      onClick={() => unapproveReview(review.id)}
                      className="btn-secondary text-sm"
                    >
                      Unapprove
                    </button>
                  )}

                  <Link
                    href={`/products/${review.product_slug}`}
                    target="_blank"
                    className="btn-secondary text-sm"
                  >
                    View Product
                  </Link>

                  <button
                    onClick={() => deleteReview(review.id)}
                    className="text-red-600 hover:text-red-700 text-sm px-3"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center pt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  baseUrl="/admin/reviews"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Summary */}
      {reviews.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {pagination.total || reviews.length}
            </div>
            <div className="text-gray-600">
              Total Review{pagination.total !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {reviews.filter((r) => !r.is_approved).length}
            </div>
            <div className="text-gray-600">Pending Approval</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {reviews.filter((r) => r.is_approved).length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
        </div>
      )}
    </div>
  );
}
