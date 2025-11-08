# Wedding Guest Upload Feature - Complete Test Guide

## ✅ Feature Overview
This system allows wedding guests to upload photos via QR code and select their favorite for printing in a memory book.

---

## 🗂️ Database Schema Status
- ✅ ClientGallery extended with: `guestUploadEnabled`, `qrCodeUrl`, `eventDate`
- ✅ GuestUpload model created with all fields
- ✅ Database synced to MongoDB (collections and indexes created)
- ✅ Prisma client generated

---

## 🔗 Complete User Flows

### 📱 GUEST FLOW (Anonymous Users)

#### Step 1: Scan QR Code
- **Action**: Guest scans QR code with phone
- **Route**: `/events/[eventId]/guest-upload`
- **What happens**: Opens guest upload form

#### Step 2: Fill Upload Form
- **Page**: Guest Upload Form
- **Required fields**:
  - Name (required)
  - Message (required, 1-200 chars with counter)
  - Photos (1-10 files, drag & drop supported)
- **Validation**:
  - ✅ File types: JPG, PNG, WEBP only
  - ✅ Max size: 10MB per photo
  - ✅ Max count: 10 photos
  - ✅ Live preview with remove option
- **API Calls**:
  1. `POST /api/events/[eventId]/guest-upload/start` → Gets `uploadGroupId`
  2. `POST /api/events/[eventId]/guest-upload/upload` → Uploads files to Cloudinary
- **On Success**: Redirects to photo selection page

#### Step 3: Select Print Photo
- **Page**: Photo Selection
- **Route**: `/events/[eventId]/guest-upload/select?groupId=[uuid]`
- **Features**:
  - ✅ Grid display of all uploaded photos
  - ✅ Click to select with checkmark overlay
  - ✅ Shows guest's message in card
  - ✅ Visual feedback (ring border on selected)
- **API Call**: `POST /api/events/[eventId]/guest-upload/select-print`
- **Privacy**: Only shows photos for this specific `uploadGroupId`
- **On Success**: Redirects to success page

#### Step 4: Success Confirmation
- **Page**: Success
- **Route**: `/events/[eventId]/guest-upload/success`
- **Features**:
  - ✅ Animated checkmark
  - ✅ Pulsing heart animation
  - ✅ Thank you message
  - ✅ "Upload More" button (returns to form)
  - ✅ "Close" button

---

### 👨‍💼 ADMIN FLOW (Photographer)

#### Step 1: Access Client Detail Page
- **Route**: `/admin/dashboard/clients/[id]`
- **Features**:
  - ✅ Lists all galleries for client
  - ✅ Shows photo count per gallery
  - ✅ Shows guest upload count if enabled

#### Step 2: Generate QR Code
- **Action**: Click "QR" button on gallery card
- **API Call**: `POST /api/admin/events/[eventId]/generate-qr`
- **What happens**:
  - Generates 600x600px QR code (high error correction)
  - Points to: `[domain]/events/[eventId]/guest-upload`
  - Saves QR code to database as base64 data URL
  - Enables `guestUploadEnabled` automatically
- **Modal shows**:
  - ✅ QR code image
  - ✅ Upload URL
  - ✅ "Download QR Code" button
  - ✅ "Manage Uploads" button

#### Step 3: View Guest Uploads
- **Route**: `/admin/dashboard/events/[eventId]/guest-uploads`
- **Action**: Click "Guest Uploads" button or "Manage Uploads" in QR modal
- **Features**:
  
  **Stats Cards:**
  - ✅ Total Guests
  - ✅ Total Photos
  - ✅ Print Selected
  - ✅ Approved Count
  
  **Filters:**
  - ✅ All
  - ✅ Pending
  - ✅ Approved
  - ✅ Rejected
  
  **Table Columns:**
  - ✅ Guest name & upload date
  - ✅ Message preview
  - ✅ Photo count
  - ✅ Print photo thumbnail
  - ✅ Status badge
  - ✅ Action buttons (View, Approve, Reject)
  
  **Actions:**
  - ✅ View All Photos (opens modal with grid)
  - ✅ Approve uploads
  - ✅ Reject uploads
  - ✅ Export ZIP (all print photos + CSV manifest)
  - ✅ Export CSV (names, messages, URLs, dates)

---

## 🔌 API Endpoints

### Guest-Facing Endpoints

#### 1. Start Upload Session
```
POST /api/events/[eventId]/guest-upload/start
Body: { uploaderName, message }
Response: { uploadGroupId, eventId, uploaderName, message }
```
**Validation:**
- ✅ Name required
- ✅ Message 1-200 chars
- ✅ Gallery exists
- ✅ guestUploadEnabled = true

#### 2. Upload Photos
```
POST /api/events/[eventId]/guest-upload/upload
Content-Type: multipart/form-data
Body: { uploadGroupId, uploaderName, message, files[] }
Response: { uploadedCount, uploads[], uploadGroupId }
```
**Validation:**
- ✅ 1-10 files
- ✅ Max 10MB each
- ✅ JPG/PNG/WEBP only
- ✅ Uploads to Cloudinary: `events/{eventId}/guest-uploads/{groupId}`

#### 3. Get Guest Photos
```
GET /api/events/[eventId]/guest-upload/photos?groupId=[uuid]
Response: { uploaderName, message, photos[] }
```
**Privacy:** Only returns photos for specified `uploadGroupId`

#### 4. Select Print Photo
```
POST /api/events/[eventId]/guest-upload/select-print
Body: { uploadGroupId, photoId }
Response: { success }
```
**Transaction:**
1. Unselect all photos in group
2. Select chosen photo
**Ensures:** Only ONE print photo per guest

### Admin Endpoints

#### 5. Generate QR Code
```
POST /api/admin/events/[eventId]/generate-qr
Auth: Required (NextAuth)
Response: { qrCodeDataURL, uploadUrl }
```
**Features:**
- ✅ 600x600px QR code
- ✅ High error correction
- ✅ Base64 data URL
- ✅ Auto-enables guest uploads

#### 6. View All Guest Uploads
```
GET /api/admin/events/[eventId]/guest-uploads
Auth: Required
Response: { stats, uploads[] }
```
**Groups by:** `uploadGroupId`
**Stats:** totalGuests, totalPhotos, printSelected, pending, approved

#### 7. Approve/Reject Uploads
```
PATCH /api/admin/events/[eventId]/guest-uploads
Auth: Required
Body: { uploadGroupId, status }
Response: { success }
```

#### 8. Export ZIP
```
GET /api/admin/events/[eventId]/guest-uploads/export-zip
Auth: Required
Response: ZIP file (print photos + CSV manifest)
```

#### 9. Export CSV
```
GET /api/admin/events/[eventId]/guest-uploads/export-csv
Auth: Required
Response: CSV file (names, messages, URLs, dates)
```

---

## 🧪 Manual Testing Checklist

### Guest Flow Tests

- [ ] **QR Code Scan**
  - [ ] QR code scans correctly
  - [ ] Opens correct URL
  - [ ] Form loads without errors

- [ ] **Form Validation**
  - [ ] Name required - shows error if empty
  - [ ] Message required - shows error if empty
  - [ ] Message max 200 chars - counter updates
  - [ ] File upload rejects non-images
  - [ ] File upload rejects files > 10MB
  - [ ] Max 10 photos enforced
  - [ ] Can remove photos from preview
  - [ ] Drag & drop works

- [ ] **Upload Process**
  - [ ] Upload shows loading state
  - [ ] Photos upload to Cloudinary
  - [ ] Database entries created
  - [ ] Redirects to selection page

- [ ] **Photo Selection**
  - [ ] All uploaded photos display
  - [ ] Guest message shows correctly
  - [ ] Click selects photo (checkmark appears)
  - [ ] Only one photo selectable at a time
  - [ ] Confirm button works
  - [ ] Redirects to success page

- [ ] **Success Page**
  - [ ] Animations play
  - [ ] "Upload More" returns to form
  - [ ] "Close" button works

### Admin Flow Tests

- [ ] **Client Detail Page**
  - [ ] All galleries display
  - [ ] QR button visible on all galleries
  - [ ] Guest upload count shows if enabled
  - [ ] "Guest Uploads" button shows if enabled

- [ ] **QR Code Generation**
  - [ ] Modal opens on button click
  - [ ] QR code generates (or shows existing)
  - [ ] QR code is downloadable
  - [ ] Upload URL displays correctly
  - [ ] "Manage Uploads" button navigates correctly

- [ ] **Guest Uploads Dashboard**
  - [ ] Stats cards show correct counts
  - [ ] Filters work (all/pending/approved/rejected)
  - [ ] Table displays all uploads
  - [ ] Print photo thumbnails show
  - [ ] Status badges display correctly
  - [ ] View modal shows all photos
  - [ ] Approve button works (status updates)
  - [ ] Reject button works (status updates)
  - [ ] Export ZIP downloads file
  - [ ] Export CSV downloads file

---

## 🚨 Error Handling Tests

### Guest Errors
- [ ] Gallery not found → 404 error
- [ ] Guest uploads disabled → 403 error
- [ ] Invalid file type → Clear error message
- [ ] File too large → Clear error message
- [ ] Too many files → Clear error message
- [ ] Network error → Error message shown
- [ ] No photos selected → Error message

### Admin Errors
- [ ] Not authenticated → Redirect to login
- [ ] Invalid event ID → Error message
- [ ] No uploads yet → Empty state shown

---

## 🔒 Security & Privacy Tests

- [ ] **Guest Privacy**
  - [ ] Guest can only see their own photos
  - [ ] uploadGroupId properly isolates data
  - [ ] Cannot access other guests' photos

- [ ] **Admin Authentication**
  - [ ] All admin endpoints require auth
  - [ ] Unauthenticated requests rejected

- [ ] **Print Selection**
  - [ ] Transaction ensures atomicity
  - [ ] Only one photo per guest marked
  - [ ] Cannot select another guest's photo

---

## 📊 Performance Tests

- [ ] **Upload Speed**
  - [ ] 10 photos upload in reasonable time
  - [ ] Progress indication works
  - [ ] Large files handled gracefully

- [ ] **Page Load**
  - [ ] Admin dashboard loads quickly
  - [ ] Thumbnails load efficiently
  - [ ] Filter changes are instant

---

## 🎨 UI/UX Tests

- [ ] **Mobile Responsive**
  - [ ] Form works on phone
  - [ ] Photo grid adapts to screen
  - [ ] Admin dashboard mobile-friendly

- [ ] **Dark Mode**
  - [ ] All pages work in dark mode
  - [ ] Contrast sufficient
  - [ ] QR code visible

- [ ] **Animations**
  - [ ] Checkmark animation smooth
  - [ ] Heart pulse works
  - [ ] Loading spinners show

---

## 🔄 Integration Tests

- [ ] **Cloudinary**
  - [ ] Images upload successfully
  - [ ] Thumbnails generated
  - [ ] Folder structure correct: `events/{id}/guest-uploads/{groupId}`

- [ ] **Database**
  - [ ] GuestUpload records created
  - [ ] Indexes work (fast queries)
  - [ ] Relations correct (ClientGallery → GuestUpload)

- [ ] **QR Code**
  - [ ] QR generates correct URL
  - [ ] QR scans properly on all devices
  - [ ] High error correction works

---

## 📝 Notes

**Cloudinary Folder Structure:**
```
events/
  └── {eventId}/
      └── guest-uploads/
          └── {uploadGroupId}/
              ├── photo1.jpg
              ├── photo2.jpg
              └── ...
```

**Database Collections:**
- `ClientGallery` - Extended with guest upload fields
- `GuestUpload` - New collection for guest photos

**Privacy Model:**
- Each guest session gets unique UUID (`uploadGroupId`)
- All queries filtered by this ID
- No cross-guest data leakage possible

---

## 🚀 Deployment Checklist

- [x] Database schema pushed to MongoDB
- [x] Prisma client generated
- [x] All API routes created
- [x] Frontend pages created
- [x] Icons fixed (QR code)
- [x] Build passing
- [ ] Environment variables set on production
- [ ] Cloudinary credentials configured
- [ ] Test with real QR code scanner
- [ ] Test complete guest flow on mobile
- [ ] Test admin flow on desktop

---

## 🎯 Key Success Metrics

1. **Guest Experience**: 
   - Simple, fast upload process
   - Beautiful UI matching wedding theme
   - Clear feedback at each step

2. **Admin Control**:
   - Easy QR generation
   - Quick approval workflow
   - Export functionality for print production

3. **Technical Excellence**:
   - Privacy enforced at database level
   - Transactional integrity for selections
   - Proper error handling throughout

---

## 🐛 Known Issues / Future Enhancements

- [ ] Add rate limiting to prevent abuse
- [ ] Add email notifications to photographer when guests upload
- [ ] Add ability to message guests from admin panel
- [ ] Add bulk actions (approve all, reject all)
- [ ] Add image compression on client side before upload
- [ ] Add progress bar during multi-file upload
- [ ] Add ability to regenerate QR code
- [ ] Add analytics (upload stats, popular times)

---

**Status**: ✅ FULLY IMPLEMENTED & READY FOR TESTING
**Last Updated**: November 8, 2025
