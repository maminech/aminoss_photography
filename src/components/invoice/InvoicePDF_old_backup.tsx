'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import invoiceConditions from '@/lib/invoiceConditions.json';

// Register fonts (using system fonts as fallback)
Font.register({
  family: 'Playfair Display',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFlD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDTbtPf_btv.ttf',
      fontWeight: 400,
    },
  ],
});

Font.register({
  family: 'Lato',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.ttf',
      fontWeight: 700,
    },
  ],
});

// Styles matching the PDF design - Professional white background
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Lato',
  },
  header: {
    marginBottom: 20,
    borderTop: '3px solid #3b4c9e',
    paddingTop: 20,
  },
  logoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'Playfair Display',
    color: '#000000',
    marginBottom: 5,
  },
  companyTagline: {
    fontSize: 10,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 9,
    color: '#444444',
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: 'Playfair Display',
    color: '#d4af37',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'right',
    marginTop: 5,
  },
  
  // Client and Event Info Section
  infoSection: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 15,
  },
  infoColumn: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    border: '1px solid #e0e0e0',
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#d4af37',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoLabel: {
    fontSize: 9,
    color: '#888888',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 10,
    color: '#000000',
    marginBottom: 8,
    fontWeight: 600,
  },
  
  // Services Table
  table: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    padding: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 700,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#f8f8f8',
  },
  tableCell: {
    fontSize: 10,
    color: '#333333',
  },
  descriptionCell: {
    flex: 3,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  unitPriceCell: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalCell: {
    flex: 1.5,
    textAlign: 'right',
    fontWeight: 700,
  },
  
  // Summary Section
  summarySection: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  summaryBox: {
    width: 280,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 5,
    border: '1px solid #e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 10,
    color: '#000000',
    fontWeight: 600,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTop: '2px solid #d4af37',
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#000000',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#d4af37',
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 3,
    marginTop: 8,
  },
  remainingLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#856404',
  },
  remainingValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#856404',
  },
  
  // Conditions Section
  conditionsSection: {
    marginBottom: 25,
    flexDirection: 'row',
    gap: 15,
  },
  conditionsColumn: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    border: '1px solid #e0e0e0',
  },
  conditionsTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#d4af37',
    marginBottom: 10,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  conditionItem: {
    fontSize: 8,
    color: '#444444',
    lineHeight: 1.6,
    marginBottom: 5,
  },
  conditionItemArabic: {
    fontSize: 9,
    color: '#444444',
    lineHeight: 1.8,
    marginBottom: 6,
    textAlign: 'right',
    fontFamily: 'Lato', // Fallback for Arabic
  },
  
  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#999999',
  },
  footerHeart: {
    color: '#d4af37',
  },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePDFProps {
  invoiceData: {
    invoiceNumber: string;
    issueDate: string;
    clientName: string;
    clientEmail?: string;
    clientPhone: string;
    clientAddress?: string;
    eventType: string;
    eventDate: string;
    eventLocation: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: string;
    notes?: string;
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoiceData }) => {
  const remainingAmount = invoiceData.totalAmount - invoiceData.paidAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Innov8 Production</Text>
              <Text style={styles.companyTagline}>
                Creative Wedding & Event Photography
              </Text>
              <Text style={styles.contactInfo}>
                📍 Moknine, Sousse, Tunisia{'\n'}
                📧 innov8production@gmail.com{'\n'}
                📱 +216 55 985 565
              </Text>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>FACTURE</Text>
              <Text style={styles.invoiceNumber}>{invoiceData.invoiceNumber}</Text>
              <Text style={styles.invoiceNumber}>
                Date: {new Date(invoiceData.issueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </View>

        {/* Client and Event Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Client</Text>
            <Text style={styles.infoLabel}>Nom:</Text>
            <Text style={styles.infoValue}>{invoiceData.clientName}</Text>
            {invoiceData.clientEmail && (
              <>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{invoiceData.clientEmail}</Text>
              </>
            )}
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>{invoiceData.clientPhone}</Text>
            {invoiceData.clientAddress && (
              <>
                <Text style={styles.infoLabel}>Adresse:</Text>
                <Text style={styles.infoValue}>{invoiceData.clientAddress}</Text>
              </>
            )}
          </View>

          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>Événement</Text>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{invoiceData.eventType}</Text>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(invoiceData.eventDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.infoLabel}>Lieu:</Text>
            <Text style={styles.infoValue}>{invoiceData.eventLocation}</Text>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderCell, styles.quantityCell]}>QTÉ</Text>
            <Text style={[styles.tableHeaderCell, styles.unitPriceCell]}>
              PRIX UNITAIRE
            </Text>
            <Text style={[styles.tableHeaderCell, styles.totalCell]}>TOTAL</Text>
          </View>

          {invoiceData.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
              ]}
            >
              <Text style={[styles.tableCell, styles.descriptionCell]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.unitPriceCell]}>
                {item.unitPrice.toFixed(3)} TND
              </Text>
              <Text style={[styles.tableCell, styles.totalCell]}>
                {item.total.toFixed(3)} TND
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total:</Text>
              <Text style={styles.summaryValue}>
                {invoiceData.subtotal.toFixed(3)} TND
              </Text>
            </View>

            {invoiceData.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Remise:</Text>
                <Text style={styles.summaryValue}>
                  -{invoiceData.discount.toFixed(3)} TND
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {invoiceData.totalAmount.toFixed(3)} TND
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Acompte / Montant payé:</Text>
              <Text style={styles.summaryValue}>
                {invoiceData.paidAmount.toFixed(3)} TND
              </Text>
            </View>

            {remainingAmount > 0 && (
              <View style={styles.remainingRow}>
                <Text style={styles.remainingLabel}>Reste à payer:</Text>
                <Text style={styles.remainingValue}>
                  {remainingAmount.toFixed(3)} TND
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Conditions Générales */}
        <View style={styles.conditionsSection}>
          <View style={styles.conditionsColumn}>
            <Text style={styles.conditionsTitle}>
              {invoiceConditions.french.title}
            </Text>
            {invoiceConditions.french.content.map((condition, index) => (
              <Text key={index} style={styles.conditionItem}>
                {condition}
              </Text>
            ))}
          </View>

          <View style={styles.conditionsColumn}>
            <Text style={styles.conditionsTitle}>
              {invoiceConditions.arabic.title}
            </Text>
            {invoiceConditions.arabic.content.map((condition, index) => (
              <Text key={index} style={styles.conditionItemArabic}>
                {condition}
              </Text>
            ))}
          </View>
        </View>

        {/* Notes */}
        {invoiceData.notes && (
          <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#ffffff', borderRadius: 5, border: '1px solid #e0e0e0' }}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 5, color: '#d4af37' }}>
              NOTES:
            </Text>
            <Text style={{ fontSize: 9, color: '#444444', lineHeight: 1.5 }}>
              {invoiceData.notes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Innov8 Production - Made with{' '}
            <Text style={styles.footerHeart}>❤</Text> in Tunisia
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
