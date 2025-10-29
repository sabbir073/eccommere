import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToCPanel, uploadLocal } from '@/lib/upload';

// POST /api/upload - Upload image
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Only admins can upload images
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    let imageUrl: string;

    // Use cPanel upload in production, local upload in development
    if (process.env.NODE_ENV === 'production' && process.env.CPANEL_FTP_HOST) {
      imageUrl = await uploadToCPanel(file, folder);
    } else {
      imageUrl = await uploadLocal(file, folder);
    }

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
      },
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
