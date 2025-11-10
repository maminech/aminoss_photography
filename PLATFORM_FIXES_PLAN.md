# 🔧 Platform Fixes & Improvements Plan

## Overview
Comprehensive fixes requested by user for the Aminoss Photography platform.

---

## 📋 Issues to Fix

### 1. ✅ Invoice Payment Status
**Issue**: No way to mark invoices as paid in admin panel
**Current State**: Invoice model has `paymentStatus` field (unpaid, partial, paid)
**Fix Required**:
- Add "Mark as Paid" button in admin invoices page
- Create API endpoint to update invoice payment status
- Add ability to record payment method and date

---

### 2. 💰 Currency Change to TND
**Issue**: Platform shows generic currency, needs to display TND (Tunisian Dinars)
**Current State**: System uses "DT" in some places but inconsistent
**Files to Update**:
- Packages display (already shows "DT")
- Invoice displays
- Expense displays
- Salary displays
- Booking forms
- Financial reports

---

### 3. 🧭 Navigation Buttons
**Issue**: Need better navigation in dashboards
**Required**:
- Admin Dashboard: Quick access buttons to common actions
- Client Dashboard: Easy navigation to galleries, photobooks, uploads

---

### 4. 📘 Photobook Management Issue
**Issue**: When client approves photobook, it doesn't show in admin photobook management
**Current State**: 
- Photobook model has `status` field (draft, submitted, approved, printing, completed)
- Admin page may not be fetching approved photobooks correctly
**Fix Required**:
- Update admin photobook page to show all photobooks with status
- Add filters for draft/submitted/approved/printing/completed
- Show client name and gallery association

---

### 5. 📸 Client Guest Uploads View
**Issue**: Client needs dedicated space to see photos guests uploaded
**Current State**: Feature exists but may not be accessible from client dashboard
**Fix Required**:
- Add prominent button/link in client dashboard
- Create dedicated page showing all guest uploads for client's events
- Show photobooth prints separately

---

### 6. 🎭 Client Photobooth/Edited Photos View
**Issue**: Client needs special section for edited photos (photobooth prints)
**Current State**: Photobooth URLs stored in GuestUpload model
**Fix Required**:
- Create dedicated section in client dashboard
- Show all photobooth prints from guest uploads
- Make them easily downloadable

---

## 🎯 Implementation Order

### Phase 1: Quick Wins (30 minutes)
1. ✅ Currency change to TND across platform
2. ✅ Add Mark as Paid functionality to invoices

### Phase 2: Dashboard Improvements (45 minutes)
3. ✅ Add navigation buttons to admin dashboard
4. ✅ Add navigation buttons to client dashboard

### Phase 3: Photobook Fix (30 minutes)
5. ✅ Fix admin photobook management to show approved photobooks

### Phase 4: Client Views (1 hour)
6. ✅ Improve client guest uploads view
7. ✅ Add client photobooth prints view

---

## 📁 Files to Modify

### Phase 1:
- `src/app/admin/invoices/page.tsx` - Add mark as paid
- `src/app/api/invoices/[bookingId]/route.ts` - Add update endpoint
- Multiple display files for TND currency

### Phase 2:
- `src/app/admin/dashboard/page.tsx` - Navigation buttons
- `src/app/client/dashboard/page.tsx` - Navigation buttons

### Phase 3:
- `src/app/admin/dashboard/photobooks/page.tsx` - Fix fetching logic

### Phase 4:
- `src/app/client/dashboard/page.tsx` - Add guest uploads button
- `src/app/client/gallery/[id]/guest-uploads/page.tsx` - Enhance page
- Create new photobooth view page

---

## ✅ Success Criteria

1. ✅ Invoices can be marked as paid with one click
2. ✅ All prices show "TND" or "DT" consistently
3. ✅ Dashboards have quick action buttons
4. ✅ Admin can see all client photobooks regardless of status
5. ✅ Clients can easily view guest uploads
6. ✅ Clients can view and download photobooth prints

---

**Status**: Ready to implement
**Estimated Time**: 2-3 hours total
**Priority**: High
