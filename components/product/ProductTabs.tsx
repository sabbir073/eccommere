'use client';

import { useState } from 'react';

interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  first_name?: string;
  last_name?: string;
  guest_name?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

interface ProductTabsProps {
  description?: string;
  reviews?: Review[];
  totalReviews: number;
}

export default function ProductTabs({ description, reviews = [], totalReviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  return (
    <div className="py-8">
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('description')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'description'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === 'reviews'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Reviews ({totalReviews})
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            {description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
            ) : (
              <p className="text-gray-500 italic">No detailed description available.</p>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b last:border-b-0">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold text-lg">
                          {(review.first_name?.[0] || review.guest_name?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {review.first_name
                              ? `${review.first_name} ${review.last_name || ''}`
                              : review.guest_name}
                          </span>
                          <div className="flex text-yellow-500 text-sm">
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                          </div>
                          {review.is_verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Verified Purchase
                            </span>
                          )}
                        </div>

                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        )}

                        {review.comment && (
                          <p className="text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                        )}

                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to review this product!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
