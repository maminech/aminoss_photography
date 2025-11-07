import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const formData = await req.formData();
    const uploadGroupId = formData.get('uploadGroupId') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const message = formData.get('message') as string;
    const files = formData.getAll('files') as File[];
    
    // Validation
    if (!uploadGroupId || !uploaderName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 photos allowed' },
        { status: 400 }
      );
    }
    
    // Verify gallery
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: params.eventId },
    });
    
    if (!gallery || !gallery.guestUploadEnabled) {
      return NextResponse.json(
        { error: 'Event not found or uploads disabled' },
        { status: 403 }
      );
    }
    
    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPG, PNG, WEBP allowed.` },
          { status: 400 }
        );
      }
      
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum 10MB per photo.` },
          { status: 400 }
        );
      }
    }
    
    // Upload files to Cloudinary
    const uploads = [];
    
    for (const file of files) {
      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `events/${params.eventId}/guest-uploads/${uploadGroupId}`,
            resource_type: 'auto',
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      // Create thumbnail URL
      const thumbnailUrl = uploadResult.secure_url.replace(
        '/upload/',
        '/upload/w_400,h_400,c_fill,q_auto,f_auto/'
      );
      
      // Create database entry
      const upload = await prisma.guestUpload.create({
        data: {
          galleryId: params.eventId,
          uploadGroupId,
          uploaderName,
          message,
          cloudinaryId: uploadResult.public_id,
          fileUrl: uploadResult.secure_url,
          thumbnailUrl,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          fileSize: uploadResult.bytes,
          status: 'pending',
        },
      });
      
      uploads.push({
        id: upload.id,
        fileUrl: upload.fileUrl,
        thumbnailUrl: upload.thumbnailUrl,
      });
    }
    
    return NextResponse.json({
      success: true,
      uploadedCount: uploads.length,
      uploads,
      uploadGroupId,
    });
    
  } catch (error: any) {
    console.error('Guest upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos', details: error.message },
      { status: 500 }
    );
  }
}
