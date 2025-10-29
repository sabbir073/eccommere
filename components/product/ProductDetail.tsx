'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
}

interface ProductDetailProps {
  product: {
    name: string;
    images?: ProductImage[];
  };
}

// This component only handles the IMAGE GALLERY
export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(
    product.images?.find(img => img.is_primary) || product.images?.[0]
  );

  return (
    <div className="sticky top-4">
      {/* Main Image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        {selectedImage ? (
          <Image
            src={selectedImage.image_url}
            alt={selectedImage.alt_text || product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {product.images && product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {product.images.slice(0, 4).map((image: ProductImage) => (
            <div
              key={image.id}
              className={`aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-75 transition ${
                selectedImage?.id === image.id ? 'ring-2 ring-primary-600' : ''
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || product.name}
                width={150}
                height={150}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
