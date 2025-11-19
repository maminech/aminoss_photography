import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx',
  api_key: process.env.CLOUDINARY_API_KEY || '816775898924348',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mbU--NngMju5dzFgvO_LExO7nnc',
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allow up to 60 seconds for upload
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    console.log('🔵 Guest upload API called for event:', params.eventId);
    
    const formData = await req.formData();
    const uploadGroupId = formData.get('uploadGroupId') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const message = formData.get('message') as string;
    const files = formData.getAll('files') as File[];
    
    console.log('📦 Upload request data:', {
      uploadGroupId,
      uploaderName,
      messageLength: message?.length,
      fileCount: files.length,
      eventId: params.eventId,
      fileTypes: files.map(f => f.type),
      fileSizes: files.map(f => `${(f.size / 1024).toFixed(2)}KB`)
    });
    
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
    console.log('🔍 Looking up gallery:', params.eventId);
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: params.eventId },
    });
    
    console.log('📂 Gallery found:', {
      exists: !!gallery,
      guestUploadEnabled: gallery?.guestUploadEnabled,
      name: gallery?.name
    });
    
    if (!gallery) {
      console.error('❌ Gallery not found:', params.eventId);
      return NextResponse.json(
        { error: 'Event not found. Please check the QR code or link.' },
        { status: 404 }
      );
    }
    
    if (!gallery.guestUploadEnabled) {
      console.error('❌ Guest uploads disabled for gallery:', params.eventId);
      return NextResponse.json(
        { error: 'Guest uploads are currently disabled for this event.' },
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
    
    console.log('☁️ Starting Cloudinary uploads...');
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`📤 Uploading file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `events/${params.eventId}/guest-uploads/${uploadGroupId}`,
              resource_type: 'auto',
              transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
              ],
            },
            (error: any, result: any) => {
              if (error) {
                console.error(`❌ Cloudinary upload error for ${file.name}:`, error);
                reject(error);
              } else {
                console.log(`✅ Cloudinary upload success for ${file.name}:`, result?.public_id);
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
      
      // Create thumbnail URL
      const thumbnailUrl = uploadResult.secure_url.replace(
        '/upload/',
        '/upload/w_400,h_400,c_fill,q_auto,f_auto/'
      );
      
        // Create database entry
        console.log(`💾 Saving to database: ${uploadResult.public_id}`);
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
        
        console.log(`✅ Database entry created: ${upload.id}`);
        
        uploads.push({
          id: upload.id,
          fileUrl: upload.fileUrl,
          thumbnailUrl: upload.thumbnailUrl,
        });
      } catch (fileError: any) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        throw new Error(`Failed to upload ${file.name}: ${fileError.message}`);
      }
    }
    
    console.log(`✅ All uploads completed. Total: ${uploads.length}`);
    
    return NextResponse.json({
      success: true,
      uploadedCount: uploads.length,
      uploads,
      uploadGroupId,
    });
    
  } catch (error: any) {
    console.error('❌ Guest upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      eventId: params.eventId
    });
    
    // More specific error messages
    let errorMessage = 'Failed to upload photos';
    
    if (error.message?.includes('Cloudinary')) {
      errorMessage = 'Failed to upload photos to cloud storage. Please try again.';
    } else if (error.message?.includes('Prisma') || error.message?.includes('database')) {
      errorMessage = 'Failed to save photos to database. Please try again.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try with fewer or smaller photos.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
