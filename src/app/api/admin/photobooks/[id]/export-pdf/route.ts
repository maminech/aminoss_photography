import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const userRole = (session.user as any)?.role;
    if (!session || !userRole || userRole.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photobookId = params.id;

    const photobook = await prisma.photobook.findUnique({
      where: { id: photobookId },
      include: {
        pages: {
          orderBy: {
            pageNumber: 'asc'
          }
        }
      }
    });

    if (!photobook) {
      return new NextResponse('Photobook not found', { status: 404 });
    }

    // Get client and gallery info
    const client = await prisma.client.findUnique({
      where: { id: photobook.clientId },
      select: { name: true, email: true }
    });

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: photobook.galleryId },
      select: { name: true }
    });

    // Generate HTML for PDF
    const isPortrait = photobook.format === '20x30';
    const pageWidth = isPortrait ? '20cm' : '30cm';
    const pageHeight = isPortrait ? '30cm' : '30cm';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${photobook.title} - Photobook</title>
  <style>
    @page {
      size: ${pageWidth} ${pageHeight};
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      background: white;
    }
    
    .cover-page {
      width: ${pageWidth};
      height: ${pageHeight};
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .cover-page h1 {
      font-size: 48px;
      margin-bottom: 20px;
      font-weight: bold;
    }
    
    .cover-page .subtitle {
      font-size: 24px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    
    .cover-page .info {
      margin-top: 40px;
      font-size: 18px;
      opacity: 0.8;
    }
    
    .photobook-page {
      width: ${pageWidth};
      height: ${pageHeight};
      page-break-after: always;
      position: relative;
      background: white;
      padding: 20px;
    }
    
    .page-number {
      position: absolute;
      bottom: 10px;
      right: 20px;
      font-size: 14px;
      color: #666;
    }
    
    .photo-grid {
      width: 100%;
      height: 100%;
      display: grid;
      gap: 10px;
    }
    
    .photo-grid.full {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr;
    }
    
    .photo-grid.split {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
    }
    
    .photo-grid.triple {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr;
    }
    
    .photo-grid.quad {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    
    .photo-grid.collage-3 {
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 1fr 1fr;
    }
    
    .photo-container {
      position: relative;
      overflow: hidden;
      background: #f0f0f0;
      border-radius: 4px;
    }
    
    .photo-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .collage-3 .photo-container:first-child {
      grid-row: 1 / span 2;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <h1>${photobook.title}</h1>
    <div class="subtitle">${client?.name || 'Client'}</div>
    <div class="subtitle">${gallery?.name || 'Gallery'}</div>
    <div class="info">
      <div>${photobook.totalPages} Pages</div>
      <div>Format: ${photobook.format}</div>
    </div>
  </div>

  <!-- Photo Pages -->
  ${photobook.pages.map(page => {
    const photos = Array.isArray(page.photos) ? page.photos : [];
    return `
  <div class="photobook-page">
    <div class="photo-grid ${page.layoutType}">
      ${photos.map(photo => `
      <div class="photo-container">
        <img src="${photo.url}" alt="Photo ${photo.position || ''}" loading="lazy" />
      </div>
      `).join('')}
    </div>
    <div class="page-number">Page ${page.pageNumber}</div>
  </div>
    `;
  }).join('')}

  <script>
    // Auto-print dialog
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${photobook.title.replace(/[^a-z0-9]/gi, '_')}_photobook.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}
