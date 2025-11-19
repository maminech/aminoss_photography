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

// Register fonts
Font.register({
  family: 'Playfair Display',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQZNLo_U2r.ttf',
      fontWeight: 700,
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

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Lato',
  },
  
  // Blue top border
  blueTopBorder: {
    width: '100%',
    height: 3,
    backgroundColor: '#3b5998',
    marginBottom: 20,
  },
  
  // Header section with company info and payment table
  headerSection: {
    marginBottom: 25,
  },
  
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  companyInfo: {
    flex: 1,
  },
  
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#3b5998',
    marginBottom: 3,
  },
  
  companyDetail: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.4,
  },
  
  // Payment history table (Montant payé / Date)
  paymentTable: {
    marginLeft: 'auto',
    width: 200,
  },
  
  paymentTableHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #cccccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  
  paymentHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  
  paymentTableRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  
  paymentCellAmount: {
    fontSize: 8,
    color: '#cc0000',
    flex: 1,
    textAlign: 'center',
  },
  
  paymentCellDate: {
    fontSize: 8,
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  
  // Contract title
  contractTitle: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'Playfair Display',
    color: '#3b5998',
    marginBottom: 5,
  },
  
  contractDate: {
    fontSize: 10,
    color: '#cc0000',
    marginBottom: 20,
  },
  
  // Client section
  clientSection: {
    marginBottom: 15,
  },
  
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 8,
  },
  
  clientName: {
    fontSize: 9,
    color: '#000000',
    marginBottom: 3,
  },
  
  clientDetail: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  
  // Event details row
  eventDetailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 15,
  },
  
  eventColumn: {
    flex: 1,
  },
  
  eventLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#666666',
    marginBottom: 2,
  },
  
  eventValue: {
    fontSize: 9,
    color: '#000000',
  },
  
  // Instagram links section
  instagramSection: {
    marginBottom: 15,
  },
  
  instagramLink: {
    fontSize: 7,
    color: '#3b5998',
    marginBottom: 3,
    textDecoration: 'underline',
  },
  
  // Plan mariage section
  planSection: {
    marginBottom: 15,
  },
  
  planTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
    marginBottom: 5,
  },
  
  planDetail: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  
  // Description/Services table
  servicesTable: {
    marginBottom: 20,
  },
  
  servicesHeader: {
    flexDirection: 'row',
    borderBottom: '1px solid #cccccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  
  servicesHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
  },
  
  serviceDescriptionHeader: {
    flex: 3,
  },
  
  servicePriceHeader: {
    flex: 1,
    textAlign: 'right',
  },
  
  servicesRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottom: '1px solid #eeeeee',
  },
  
  serviceDescription: {
    fontSize: 9,
    color: '#000000',
    flex: 3,
  },
  
  servicePriceCell: {
    flex: 1,
    textAlign: 'right',
  },
  
  servicePrice: {
    fontSize: 9,
    color: '#000000',
  },
  
  // Totals section
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  
  totalRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 5,
  },
  
  totalLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: '#000000',
  },
  
  totalValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#cc0000',
    minWidth: 80,
    textAlign: 'right',
  },
  
  acompteValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#00cc00',
  },
  
  // Conditions section - bilingual
  conditionsSection: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    padding: 10,
    border: '1px solid #cccccc',
    borderRadius: 3,
  },
  
  conditionsColumn: {
    flex: 1,
  },
  
  conditionItem: {
    fontSize: 7,
    color: '#333333',
    lineHeight: 1.5,
    marginBottom: 3,
  },
  
  conditionItemArabic: {
    fontSize: 8,
    color: '#333333',
    lineHeight: 1.7,
    marginBottom: 4,
    textAlign: 'right',
  },
});

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentHistory {
  amount: number;
  date: string;
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
    eventRemarks?: string;
    instagramLinks?: string[];
    planDetails?: string[];
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    paidAmount: number;
    paymentHistory?: PaymentHistory[];
    paymentStatus: string;
    notes?: string;
  };
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoiceData }) => {
  const remainingAmount = invoiceData.totalAmount - invoiceData.paidAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Blue top border */}
        <View style={styles.blueTopBorder} />
        
        {/* Header: Company Info and Payment Table */}
        <View style={styles.headerSection}>
          <View style={styles.companyRow}>
            {/* Company Info - Left */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>innov8 Production</Text>
              <Text style={styles.companyDetail}>
                Route Téboulba - près STEG MOKNINE
              </Text>
              <Text style={styles.companyDetail}>moknine-Monastir</Text>
              <Text style={styles.companyDetail}>55 98 55 65</Text>
              <Text style={styles.companyDetail}>53 08 29 05</Text>
            </View>
            
            {/* Payment History Table - Right */}
            {invoiceData.paymentHistory && invoiceData.paymentHistory.length > 0 && (
              <View style={styles.paymentTable}>
                <View style={styles.paymentTableHeader}>
                  <Text style={styles.paymentHeaderText}>Montant payé</Text>
                  <Text style={styles.paymentHeaderText}>Date</Text>
                </View>
                {invoiceData.paymentHistory.map((payment, index) => (
                  <View key={index} style={styles.paymentTableRow}>
                    <Text style={styles.paymentCellAmount}>{payment.amount}</Text>
                    <Text style={styles.paymentCellDate}>
                      {new Date(payment.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        {/* Contract Title */}
        <Text style={styles.contractTitle}>Contrat</Text>
        <Text style={styles.contractDate}>
          {new Date(invoiceData.issueDate).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </Text>
        
        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Client</Text>
          <Text style={styles.clientName}>{invoiceData.clientName}</Text>
          <Text style={styles.clientDetail}>{invoiceData.clientPhone}</Text>
          {invoiceData.clientEmail && (
            <Text style={styles.clientDetail}>{invoiceData.clientEmail}</Text>
          )}
        </View>
        
        {/* Event Details Row */}
        <View style={styles.eventDetailsRow}>
          <View style={styles.eventColumn}>
            <Text style={styles.eventLabel}>Titre</Text>
            <Text style={styles.eventValue}>{invoiceData.eventType}</Text>
          </View>
          <View style={styles.eventColumn}>
            <Text style={styles.eventLabel}>Remarque</Text>
            <Text style={styles.eventValue}>
              {invoiceData.eventRemarks || invoiceData.eventLocation}
            </Text>
          </View>
          <View style={styles.eventColumn}>
            <Text style={styles.eventLabel}>Date d'événement</Text>
            <Text style={styles.eventValue}>
              {new Date(invoiceData.eventDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>
        
        {/* Instagram Links */}
        {invoiceData.instagramLinks && invoiceData.instagramLinks.length > 0 && (
          <View style={styles.instagramSection}>
            {invoiceData.instagramLinks.map((link, index) => (
              <Text key={index} style={styles.instagramLink}>{link}</Text>
            ))}
          </View>
        )}
        
        {/* Plan Mariage */}
        {invoiceData.planDetails && invoiceData.planDetails.length > 0 && (
          <View style={styles.planSection}>
            <Text style={styles.planTitle}>Plan mariage :</Text>
            {invoiceData.planDetails.map((detail, index) => (
              <Text key={index} style={styles.planDetail}>{detail}</Text>
            ))}
          </View>
        )}
        
        {/* Services/Description Table */}
        <View style={styles.servicesTable}>
          <View style={styles.servicesHeader}>
            <Text style={[styles.servicesHeaderText, styles.serviceDescriptionHeader]}>
              Description
            </Text>
            <Text style={[styles.servicesHeaderText, styles.servicePriceHeader]}>
              Prix unitaire
            </Text>
            <Text style={[styles.servicesHeaderText, styles.servicePriceHeader]}>
              Prix total
            </Text>
          </View>
          
          {invoiceData.items.map((item, index) => (
            <View key={index} style={styles.servicesRow}>
              <Text style={styles.serviceDescription}>{item.description}</Text>
              <View style={styles.servicePriceCell}>
                <Text style={styles.servicePrice}>
                  {item.unitPrice.toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                  })}
                </Text>
              </View>
              <View style={styles.servicePriceCell}>
                <Text style={styles.servicePrice}>
                  {item.total.toLocaleString('fr-FR', {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total</Text>
            <Text style={styles.totalValue}>
              {invoiceData.subtotal.toLocaleString('fr-FR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
              })}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Acompte</Text>
            <Text style={styles.acompteValue}>
              {remainingAmount.toLocaleString('fr-FR', {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
              })}
            </Text>
          </View>
        </View>
        
        {/* Conditions du Contrat - Bilingual */}
        <View style={styles.conditionsSection}>
          {/* French Conditions */}
          <View style={styles.conditionsColumn}>
            {invoiceConditions.french.content.map((condition, index) => (
              <Text key={index} style={styles.conditionItem}>
                • {condition}
              </Text>
            ))}
          </View>
          
          {/* Arabic Conditions */}
          <View style={styles.conditionsColumn}>
            {invoiceConditions.arabic.content.map((condition, index) => (
              <Text key={index} style={styles.conditionItemArabic}>
                {condition} •
              </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
