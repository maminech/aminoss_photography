import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Page, ExportOptions, PDFExportResult } from '@/types/photobook';

/**
 * Export photobook pages to high-quality PDF
 */
export async function exportToPDF(
  pages: Page[],
  options: ExportOptions
): Promise<PDFExportResult> {
  const { dpi = 300, colorMode = 'CMYK', bleed = true, quality = 'high' } = options;

  // Calculate dimensions (8.5" x 11" @ 300 DPI)
  const pageWidth = 8.5; // inches
  const pageHeight = 11; // inches
  const pixelsPerInch = dpi;
  
  const widthPx = pageWidth * pixelsPerInch;
  const heightPx = pageHeight * pixelsPerInch;

  // Create PDF with high quality settings
  const pdf = new jsPDF({
    orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
    unit: 'in',
    format: [pageWidth, pageHeight],
    compress: quality === 'high' ? false : true
  });

  // Render each page
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    
    if (i > 0) {
      pdf.addPage();
    }

    try {
      // Create temporary container for rendering
      const container = document.createElement('div');
      container.style.width = `${widthPx}px`;
      container.style.height = `${heightPx}px`;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.backgroundColor = page.backgroundColor || '#ffffff';
      document.body.appendChild(container);

      // Render page content
      const pageElement = await renderPageToCanvas(page, container, widthPx, heightPx);
      
      // Convert to image
      const canvas = await html2canvas(pageElement, {
        width: widthPx,
        height: heightPx,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: page.backgroundColor || '#ffffff',
        logging: false
      });

      // Add to PDF
      const imgData = canvas.toDataURL('image/jpeg', quality === 'high' ? 1.0 : 0.92);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);

      // Cleanup
      document.body.removeChild(container);
    } catch (error) {
      console.error(`Error rendering page ${i + 1}:`, error);
    }
  }

  // Generate blob and download
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `photobook_${new Date().toISOString().split('T')[0]}.pdf`;
  link.click();
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);

  return {
    url,
    size: pdfBlob.size,
    pages: pages.length
  };
}

/**
 * Render page to HTML for canvas conversion
 */
async function renderPageToCanvas(
  page: Page,
  container: HTMLElement,
  width: number,
  height: number
): Promise<HTMLElement> {
  const pageElement = document.createElement('div');
  pageElement.style.width = '100%';
  pageElement.style.height = '100%';
  pageElement.style.padding = page.padding || '40px';
  pageElement.style.backgroundColor = page.backgroundColor || '#ffffff';
  pageElement.style.display = 'grid';
  pageElement.style.gridTemplateColumns = `repeat(${page.gridColumns}, 1fr)`;
  pageElement.style.gridTemplateRows = `repeat(${page.gridRows}, 1fr)`;
  pageElement.style.gap = '16px';

  // Add slots
  for (const slot of page.slots) {
    const slotElement = document.createElement('div');
    slotElement.style.gridColumn = `span ${slot.span?.col || 1}`;
    slotElement.style.gridRow = `span ${slot.span?.row || 1}`;
    slotElement.style.borderRadius = slot.borderRadius || '8px';
    slotElement.style.overflow = 'hidden';
    slotElement.style.position = 'relative';

    if (slot.photo) {
      const img = document.createElement('img');
      img.src = slot.photo.url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = slot.fit || 'cover';
      img.style.objectPosition = slot.position || 'center';
      img.crossOrigin = 'anonymous';

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(resolve, 5000); // Timeout after 5s
      });

      slotElement.appendChild(img);

      // Add caption if present
      if (slot.caption) {
        const caption = document.createElement('div');
        caption.textContent = slot.caption;
        caption.style.position = 'absolute';
        caption.style.bottom = '0';
        caption.style.left = '0';
        caption.style.right = '0';
        caption.style.padding = '16px';
        caption.style.background = 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)';
        caption.style.color = 'white';
        caption.style.fontSize = '14px';
        caption.style.fontWeight = '500';
        slotElement.appendChild(caption);
      }
    }

    pageElement.appendChild(slotElement);
  }

  container.appendChild(pageElement);
  return pageElement;
}

/**
 * Export single page as high-res image
 */
export async function exportPageAsImage(
  page: Page,
  dpi: number = 300
): Promise<Blob> {
  const widthPx = 8.5 * dpi;
  const heightPx = 11 * dpi;

  const container = document.createElement('div');
  container.style.width = `${widthPx}px`;
  container.style.height = `${heightPx}px`;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  try {
    const pageElement = await renderPageToCanvas(page, container, widthPx, heightPx);
    
    const canvas = await html2canvas(pageElement, {
      width: widthPx,
      height: heightPx,
      scale: 1,
      useCORS: true,
      backgroundColor: page.backgroundColor || '#ffffff'
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/png',
        1.0
      );
    });
  } finally {
    document.body.removeChild(container);
  }
}
