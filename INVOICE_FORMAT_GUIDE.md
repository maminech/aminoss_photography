# Invoice/Contract Format Guide - innov8 Production

## Overview
The platform now generates professional contracts (factures/contrats) matching the innov8 Production branding with bilingual (French/Arabic) terms and conditions.

## Invoice Structure

### 1. Header Section
- **Blue Top Border** (3px, #3b5998)
- **Company Information** (Left side):
  - innov8 Production
  - Route Téboulba - près STEG MOKNINE
  - moknine-Monastir
  - Phone numbers: 55 98 55 65, 53 08 29 05

- **Payment History Table** (Right side):
  ```
  Montant payé  |  Date
  500           |  10-7-2025
  1990          |  08-10-2025
  ```

### 2. Contract Title
- Large "Contrat" title in blue (#3b5998)
- Issue date in red (#cc0000)

### 3. Client Section
- Client name
- Phone number
- Email (optional)

### 4. Event Details Row
Three columns:
- **Titre**: Event type (Mariage, Portrait, etc.)
- **Remarque**: Event location or special notes
- **Date d'événement**: Event date (DD/MM/YYYY)

### 5. Instagram Links (Optional)
- Event planning links
- Example: https://www.instagram.com/noursa8flagin=dTFQc2NWJmN0M...

### 6. Plan Mariage (Optional)
Wedding timeline:
- Manel deverssair 11h
- golf / hallon 12h → 13h
- haifa palace 15h

### 7. Description/Services Table
Columns:
- **Description**: Service details
  - Forfeit
  - Couverture vidéo full HD
  - Version de photos numériques traité
  - shortfilm 4k
  - tirage BD photo 15x23
  - shooting intérieur ou extérieur + preparatifs mariée

- **Prix unitaire**: Unit price
- **Prix total**: Total price (2,400.000)

### 8. Totals Section
- **Sous-total**: Subtotal amount (2.400,000)
- **Acompte**: Remaining balance in green (0,000)

### 9. Conditions du Contrat
**Bilingual terms & conditions box:**
- Left column: French conditions
- Right column: Arabic conditions (RTL)

Key conditions include:
- Signature obligation (3 days before event)
- Deposit payment terms (1 month delay = cancellation)
- Selection timing (within 7 days)
- Photo package selection
- Studio liability
- Non-refundable deposit after 2 months
- Contract modification terms
- Service continuation terms
- No contract terms for free services
- Liability exclusions

## Data Structure Required

```typescript
interface InvoiceData {
  // Basic Info
  invoiceNumber: string;
  issueDate: string;
  
  // Client Details
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientAddress?: string;
  
  // Event Details
  eventType: string;          // "Mariage", "Portrait", etc.
  eventDate: string;
  eventLocation: string;
  eventRemarks?: string;      // Optional remarks
  
  // Planning Details (Optional)
  instagramLinks?: string[];  // Array of Instagram planning links
  planDetails?: string[];     // Array of timeline details
  
  // Services/Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  
  // Financial
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  
  // Payment History (NEW)
  paymentHistory?: Array<{
    amount: number;
    date: string;
  }>;
  
  paymentStatus: string;
  notes?: string;
}
```

## Usage Example

```typescript
const invoiceData = {
  invoiceNumber: "INV-2025-001",
  issueDate: "2025-07-10",
  
  clientName: "Ahmed Belhadj Mabtouk & Nour Youssef",
  clientPhone: "99 039 873 Nour",
  clientEmail: "+33665214620",
  
  eventType: "Mariage Narafa",
  eventDate: "2025-10-12",
  eventLocation: "haifa palace Nabeul",
  eventRemarks: "haifa palace Nabeul",
  
  instagramLinks: [
    "https://www.instagram.com/noursa8flagin=dTFQc2NWJmN0M...",
    "https://www.instagram.com/u.fahadtb0107navin=1N5cilhTnhiEw"
  ],
  
  planDetails: [
    "Manel deverssair 11h",
    "golf / hallon 12h → 13h",
    "haifa palace 15h"
  ],
  
  items: [
    {
      description: "Forfeit\nCouverture vidéo full HD\nVersion de photos numériques traité\nshortfilm 4k\ntirage BD photo 15x23\nshooting intérieur ou extérieur + preparatifs mariée",
      quantity: 1,
      unitPrice: 2400.000,
      total: 2400.000
    }
  ],
  
  subtotal: 2400.000,
  discount: 0,
  totalAmount: 2400.000,
  paidAmount: 2490.000,
  
  paymentHistory: [
    { amount: 500, date: "2025-07-10" },
    { amount: 1990, date: "2025-10-08" }
  ],
  
  paymentStatus: "paid"
};
```

## API Endpoint

**Generate PDF:**
```
POST /api/admin/invoices/generate-pdf
Body: { invoiceId: "invoice_id_here" }
Response: { pdfUrl: "cloudinary_url", success: true }
```

## Styling Details

- **Blue color**: #3b5998 (Facebook blue - company brand)
- **Red color**: #cc0000 (for amounts/dates)
- **Green color**: #00cc00 (for paid/acompte)
- **Font sizes**: 7-24pt depending on section
- **Border**: 3px solid blue top border
- **Table borders**: 1px solid #cccccc
- **Conditions box**: 1px border, 10px padding

## Multilingual Support

The invoice includes:
- **French**: Left column in conditions section
- **Arabic**: Right column (RTL text alignment)
- **Date formats**: French format (DD/MM/YYYY or DD-MM-YYYY)

## Notes

1. The "Contrat" title emphasizes this is a legal contract
2. Payment history shows progressive payments
3. Instagram links allow clients to reference event planning
4. Plan mariage provides timeline visibility
5. Acompte (deposit/balance) highlighted in green when paid
6. Bilingual conditions protect both parties legally

## File Locations

- **PDF Component**: `src/components/invoice/InvoicePDF.tsx`
- **API Route**: `src/app/api/admin/invoices/generate-pdf/route.ts`
- **Conditions JSON**: `src/lib/invoiceConditions.json`
- **Admin Page**: `src/app/admin/invoices/page.tsx`
