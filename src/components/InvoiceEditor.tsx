'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Save, Printer, Download, Edit2, Check, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';

// Dynamically import InvoicePreviewButton to avoid SSR issues with @react-pdf/renderer
const InvoicePreviewButton = dynamic(
  () => import('./invoice/InvoicePreviewButton').then((mod) => ({ default: mod.InvoicePreviewButton })),
  { ssr: false }
);

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientAddress?: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  termsConditions?: string;
}

interface InvoiceEditorProps {
  booking: any;
  existingInvoice?: Invoice;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

export default function InvoiceEditor({ booking, existingInvoice, onClose, onSave }: InvoiceEditorProps) {
  const [isEditing, setIsEditing] = useState(!existingInvoice);
  const [isSaving, setIsSaving] = useState(false);
  const [invoice, setInvoice] = useState<Partial<Invoice>>(() => {
    if (existingInvoice) return existingInvoice;
    
    console.log('📋 Creating new invoice for booking:', {
      name: booking.name,
      packagePrice: booking.packagePrice,
      events: booking.events?.length || 0,
      eventType: booking.eventType
    });
    
    // Generate items from ALL events if available
    const items: InvoiceItem[] = [];
    let subtotal = 0;
    
    if (booking.events && Array.isArray(booking.events) && booking.events.length > 0) {
      // Create line item for each event
      booking.events.forEach((event: any, index: number) => {
        const packageType = event.packageType ? (event.packageType === 'aymen' ? 'Par Aymen' : 'Par Équipe') : '';
        const packageLevel = event.packageLevel ? event.packageLevel.toUpperCase() : '';
        const packageInfo = packageType && packageLevel ? ` - ${packageType} ${packageLevel}` : '';
        const timeSlot = event.timeSlot || '';
        
        // Try to get price from multiple sources
        const itemPrice = event.packagePrice || booking.packagePrice || 0;
        
        items.push({
          description: `Événement ${index + 1}: ${event.eventType}${packageInfo} - ${new Date(event.eventDate).toLocaleDateString('fr-FR')} (${timeSlot})`,
          quantity: 1,
          unitPrice: itemPrice,
          total: itemPrice
        });
        subtotal += itemPrice;
      });
    } else {
      // Fallback to single event
      const itemPrice = booking.packagePrice || 0;
      items.push({
        description: `Service photographique - ${booking.eventType}${booking.packageName ? ` (${booking.packageName})` : ''}`,
        quantity: 1,
        unitPrice: itemPrice,
        total: itemPrice
      });
      subtotal = itemPrice;
    }
    
    return {
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      clientAddress: booking.location,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      eventLocation: booking.location,
      items,
      subtotal,
      taxRate: 0, // TVA removed as per client feedback
      taxAmount: 0,
      discount: 0,
      totalAmount: subtotal,
      paidAmount: 0,
      paymentStatus: 'unpaid',
      issueDate: new Date().toISOString().split('T')[0],
      termsConditions: 'Un acompte de 30% est requis pour confirmer la réservation.'
    };
  });

  // Recalculate all item totals on mount to ensure consistency
  useEffect(() => {
    if (invoice.items && invoice.items.length > 0) {
      const newItems = invoice.items.map(item => ({
        ...item,
        total: Number(item.quantity) * Number(item.unitPrice)
      }));
      
      const { subtotal, taxAmount, totalAmount } = calculateTotals(newItems, invoice.taxRate || 0, invoice.discount || 0);
      
      setInvoice(prev => ({
        ...prev,
        items: newItems,
        subtotal,
        taxAmount,
        totalAmount
      }));
    }
  }, []); // Run once on mount

  const calculateTotals = (items: InvoiceItem[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = 0; // TVA removed
    const totalAmount = subtotal - discount;
    return { subtotal, taxAmount, totalAmount };
  };

  // Recalculate all item totals on mount to ensure consistency
  useEffect(() => {
    if (invoice.items && invoice.items.length > 0) {
      const needsRecalculation = invoice.items.some(item => 
        item.total !== (Number(item.quantity) * Number(item.unitPrice))
      );
      
      if (needsRecalculation) {
        const newItems = invoice.items.map(item => ({
          ...item,
          total: Number(item.quantity) * Number(item.unitPrice)
        }));
        
        const { subtotal, taxAmount, totalAmount } = calculateTotals(newItems, invoice.taxRate || 0, invoice.discount || 0);
        
        setInvoice(prev => ({
          ...prev,
          items: newItems,
          subtotal,
          taxAmount,
          totalAmount
        }));
      }
    }
  }, []); // Run once on mount

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...(invoice.items || [])];
    
    // Convert string to number for numeric fields
    const numericValue = (field === 'quantity' || field === 'unitPrice') 
      ? (typeof value === 'string' ? parseFloat(value) || 0 : value)
      : value;
    
    newItems[index] = {
      ...newItems[index],
      [field]: numericValue
    };
    
    // Always recalculate item total after any change to quantity or unitPrice
    newItems[index].total = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);

    const { subtotal, taxAmount, totalAmount } = calculateTotals(newItems, invoice.taxRate || 0, invoice.discount || 0);
    
    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      taxAmount,
      totalAmount
    });
  };

  const addItem = () => {
    const newItems = [
      ...(invoice.items || []),
      { description: '', quantity: 1, unitPrice: 0, total: 0 }
    ];
    setInvoice({ ...invoice, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = (invoice.items || []).filter((_, i) => i !== index);
    const { subtotal, taxAmount, totalAmount } = calculateTotals(newItems, invoice.taxRate || 0, invoice.discount || 0);
    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      taxAmount,
      totalAmount
    });
  };

  const updateTaxRate = (taxRate: number) => {
    const { subtotal, taxAmount, totalAmount } = calculateTotals(invoice.items || [], taxRate, invoice.discount || 0);
    setInvoice({
      ...invoice,
      taxRate,
      taxAmount,
      totalAmount
    });
  };

  const updateDiscount = (discount: number) => {
    const { subtotal, taxAmount, totalAmount } = calculateTotals(invoice.items || [], invoice.taxRate || 0, discount);
    setInvoice({
      ...invoice,
      discount,
      totalAmount
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const endpoint = existingInvoice
        ? `/api/invoices/invoice/${existingInvoice.id}`
        : `/api/invoices/${booking.id}`;
      
      const method = existingInvoice ? 'PATCH' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) throw new Error('Failed to save invoice');
      
      const savedInvoice = await response.json();
      onSave(savedInvoice);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Erreur lors de la sauvegarde de la facture');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${invoice.invoiceNumber || 'facture'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-5xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold">
              {existingInvoice ? (isEditing ? 'Modifier la facture' : 'Facture') : 'Nouvelle facture'}
            </h2>
            {invoice.invoiceNumber && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                N° {invoice.invoiceNumber}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && existingInvoice && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
                
                {/* New Professional PDF Generation */}
                {invoice.id && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 rounded-lg border border-[#d4af37]/20">
                    <FileText className="w-4 h-4 text-[#d4af37]" />
                    <InvoicePreviewButton invoice={invoice as any} />
                  </div>
                )}
                
                <button
                  onClick={printInvoice}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
                <button
                  onClick={downloadPDF}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
              </>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Preview/Editor */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div id="invoice-preview" className="bg-white dark:bg-gray-900 rounded-lg p-8 space-y-8">
            {/* Company Header */}
            <div className="border-b-2 border-primary pb-6">
              <h1 className="text-4xl font-bold text-primary">INNOV8 PRODUCTION</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Creative Wedding & Event Photography<br />
                Tel: +216 55 985 565<br />
                Email: innov8production@gmail.com
              </p>
            </div>

            {/* Invoice Info & Client Info */}
            <div className="grid grid-cols-2 gap-8">
              {/* Client Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">FACTURÉ À:</h3>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={invoice.clientName}
                      onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Nom du client"
                    />
                    <input
                      type="email"
                      value={invoice.clientEmail || ''}
                      onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Email (optionnel)"
                    />
                    <input
                      type="tel"
                      value={invoice.clientPhone}
                      onChange={(e) => setInvoice({ ...invoice, clientPhone: e.target.value })}
                      className="input-field text-sm"
                      placeholder="Téléphone"
                    />
                    <textarea
                      value={invoice.clientAddress || ''}
                      onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })}
                      className="textarea-field text-sm"
                      rows={2}
                      placeholder="Adresse (optionnel)"
                    />
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="font-semibold">
                      {invoice.clientName}
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">Visiteur</span>
                    </p>
                    {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
                    <p>{invoice.clientPhone}</p>
                    {invoice.clientAddress && <p className="text-gray-600 dark:text-gray-400">{invoice.clientAddress}</p>}
                  </div>
                )}
              </div>

              {/* Invoice Details */}
              <div className="text-right">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3">DÉTAILS FACTURE:</h3>
                {isEditing ? (
                  <div className="space-y-2 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <label className="text-sm">Date d'émission:</label>
                      <input
                        type="date"
                        value={invoice.issueDate}
                        onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                        className="input-field text-sm w-40"
                      />
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <label className="text-sm">Type d'événement:</label>
                      <input
                        type="text"
                        value={invoice.eventType}
                        onChange={(e) => setInvoice({ ...invoice, eventType: e.target.value })}
                        className="input-field text-sm w-40"
                      />
                    </div>
                    <div className="flex justify-end items-center gap-2">
                      <label className="text-sm">Date événement:</label>
                      <input
                        type="date"
                        value={typeof invoice.eventDate === 'string' ? invoice.eventDate.split('T')[0] : ''}
                        onChange={(e) => setInvoice({ ...invoice, eventDate: e.target.value })}
                        className="input-field text-sm w-40"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Date:</span> {new Date(invoice.issueDate!).toLocaleDateString('fr-FR')}</p>
                    <p><span className="text-gray-500">Événement:</span> {invoice.eventType}</p>
                    <p><span className="text-gray-500">Date événement:</span> {new Date(invoice.eventDate!).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                    <th className="text-left py-3 text-sm font-bold">DESCRIPTION</th>
                    <th className="text-center py-3 text-sm font-bold w-24">QTÉ</th>
                    <th className="text-right py-3 text-sm font-bold w-32">PRIX UNIT.</th>
                    <th className="text-right py-3 text-sm font-bold w-32">TOTAL</th>
                    {isEditing && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="input-field text-sm w-full"
                            placeholder="Description du service"
                          />
                        ) : (
                          <span className="text-sm">{item.description}</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="input-field text-sm w-20 text-center"
                            min="0"
                            step="1"
                          />
                        ) : (
                          <span className="text-sm">{item.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                            className="input-field text-sm w-28 text-right"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        ) : (
                          <span className="text-sm">{item.unitPrice.toFixed(2)} DT</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold">{item.total.toFixed(2)} DT</span>
                      </td>
                      {isEditing && (
                        <td className="py-3">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEditing && (
                <button
                  onClick={addItem}
                  className="mt-4 btn-secondary text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une ligne
                </button>
              )}
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2 text-sm">
                  <span>Sous-total:</span>
                  <span className="font-semibold">{(invoice.subtotal || 0).toFixed(2)} DT</span>
                </div>
                {isEditing && (
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span>Remise:</span>
                    <input
                      type="number"
                      value={invoice.discount}
                      onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)}
                      className="input-field text-sm w-28 text-right"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                {!isEditing && invoice.discount! > 0 && (
                  <div className="flex justify-between py-2 text-sm text-red-600">
                    <span>Remise:</span>
                    <span className="font-semibold">-{(invoice.discount || 0).toFixed(2)} DT</span>
                  </div>
                )}
                <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-300 dark:border-gray-700">
                  <span>TOTAL:</span>
                  <span className="text-primary">{(invoice.totalAmount || 0).toFixed(2)} DT</span>
                </div>
                {!isEditing && (
                  <>
                    <div className="flex justify-between py-2 text-sm text-green-600 dark:text-green-400">
                      <span>Payé:</span>
                      <span className="font-semibold">{(invoice.paidAmount || 0).toFixed(2)} DT</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm">
                      <span>Reste à payer:</span>
                      <span className="font-semibold">{((invoice.totalAmount || 0) - (invoice.paidAmount || 0)).toFixed(2)} DT</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment Info */}
            {isEditing && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h3 className="text-sm font-bold mb-4">INFORMATIONS DE PAIEMENT</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Montant payé</label>
                    <input
                      type="number"
                      value={invoice.paidAmount}
                      onChange={(e) => setInvoice({ ...invoice, paidAmount: parseFloat(e.target.value) || 0 })}
                      className="input-field text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Méthode de paiement</label>
                    <select
                      value={invoice.paymentMethod || ''}
                      onChange={(e) => setInvoice({ ...invoice, paymentMethod: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="cash">Espèces</option>
                      <option value="bank_transfer">Virement bancaire</option>
                      <option value="check">Chèque</option>
                      <option value="credit_card">Carte bancaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Date de paiement</label>
                    <input
                      type="date"
                      value={invoice.paymentDate || ''}
                      onChange={(e) => setInvoice({ ...invoice, paymentDate: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">Notes</label>
                    <textarea
                      value={invoice.notes || ''}
                      onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                      className="textarea-field text-sm"
                      rows={2}
                      placeholder="Notes additionnelles..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Conditions générales</label>
                    <textarea
                      value={invoice.termsConditions || ''}
                      onChange={(e) => setInvoice({ ...invoice, termsConditions: e.target.value })}
                      className="textarea-field text-sm"
                      rows={3}
                      placeholder="Conditions de paiement et autres termes..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {invoice.notes && (
                    <div>
                      <h4 className="text-sm font-bold mb-2">NOTES:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.termsConditions && (
                    <div>
                      <h4 className="text-sm font-bold mb-2">CONDITIONS:</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.termsConditions}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Merci pour votre confiance!</p>
              <p className="mt-2">INNOV8 PRODUCTION - Creative Wedding & Event Photography</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
