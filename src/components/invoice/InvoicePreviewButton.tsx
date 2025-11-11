'use client';

import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Upload, Loader2, X } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePreviewProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    issueDate: string | Date;
    clientName: string;
    clientEmail?: string | null;
    clientPhone: string;
    clientAddress?: string | null;
    eventType: string;
    eventDate: string | Date;
    eventLocation: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    notes?: string | null;
  };
}

export function InvoicePreviewButton({ invoice }: InvoicePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const invoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    issueDate: typeof invoice.issueDate === 'string' 
      ? invoice.issueDate 
      : invoice.issueDate.toISOString(),
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail || undefined,
    clientPhone: invoice.clientPhone,
    clientAddress: invoice.clientAddress || undefined,
    eventType: invoice.eventType,
    eventDate: typeof invoice.eventDate === 'string'
      ? invoice.eventDate
      : invoice.eventDate.toISOString(),
    eventLocation: invoice.eventLocation,
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    paymentStatus: invoice.paymentStatus,
    notes: invoice.notes || undefined,
  };

  const handleUploadToCloudinary = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Invoice PDF uploaded successfully to Cloudinary!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again later.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="btn-secondary flex items-center gap-2 text-sm px-3 py-1.5"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>

        <PDFDownloadLink
          document={<InvoicePDF invoiceData={invoiceData} />}
          fileName={`${invoice.invoiceNumber}.pdf`}
        >
          {({ loading }) => (
            <button
              disabled={loading}
              className="btn-secondary flex items-center gap-2 text-sm px-3 py-1.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download
            </button>
          )}
        </PDFDownloadLink>

        <button
          onClick={handleUploadToCloudinary}
          disabled={isUploading}
          className="btn-secondary flex items-center gap-2 text-sm px-3 py-1.5"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </button>
      </div>

      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold">Invoice Preview - {invoice.invoiceNumber}</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PDFViewer width="100%" height="100%" className="border-0">
                  <InvoicePDF invoiceData={invoiceData} />
                </PDFViewer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
