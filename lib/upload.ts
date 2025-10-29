import { Client } from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

export async function uploadToCPanel(file: File, folder: string = 'products'): Promise<string> {
  const client = new Client();

  try {
    // Connect to cPanel FTP
    await client.access({
      host: process.env.CPANEL_FTP_HOST || '',
      user: process.env.CPANEL_FTP_USER || '',
      password: process.env.CPANEL_FTP_PASSWORD || '',
      port: parseInt(process.env.CPANEL_FTP_PORT || '21'),
    });

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
    const remotePath = `/uploads/${folder}/${filename}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create readable stream from buffer
    const stream = Readable.from(buffer);

    // Upload file
    await client.uploadFrom(stream, remotePath);
    await client.close();

    // Return public URL
    const baseUrl = process.env.CPANEL_IMAGE_BASE_URL || '';
    return `${baseUrl}/${folder}/${filename}`;
  } catch (error) {
    console.error('Upload failed:', error);
    await client.close();
    throw new Error('Failed to upload image');
  }
}

export async function deleteFromCPanel(fileUrl: string): Promise<boolean> {
  const client = new Client();

  try {
    await client.access({
      host: process.env.CPANEL_FTP_HOST || '',
      user: process.env.CPANEL_FTP_USER || '',
      password: process.env.CPANEL_FTP_PASSWORD || '',
      port: parseInt(process.env.CPANEL_FTP_PORT || '21'),
    });

    // Extract path from URL
    const baseUrl = process.env.CPANEL_IMAGE_BASE_URL || '';
    const relativePath = fileUrl.replace(baseUrl, '');
    const remotePath = `/uploads${relativePath}`;

    await client.remove(remotePath);
    await client.close();

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    await client.close();
    return false;
  }
}

// For local development - save to public folder
export async function uploadLocal(file: File, folder: string = 'products'): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const timestamp = Date.now();
  const ext = path.extname(file.name);
  const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}
