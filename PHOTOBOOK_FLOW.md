# 📚 Photobook System Flow

## User Roles & Responsibilities

### 👤 **CLIENT ROLE**
Clients can **create** and **order** photobooks from their galleries.

**Client Actions:**
1. Navigate to **Client Dashboard** → **Photobooks**
2. Click **"Create Photobook"** button
3. Select a gallery to create photobook from
4. Use **PhotobookEditor** to design pages:
   - Choose format (20x30 or 30x30)
   - Select layout templates (full, split, triple, quad, collage)
   - Add photos to pages
   - Add notes/instructions
5. Click **"Submit for Approval"**
6. Wait for admin approval
7. View status updates in their photobooks list

**Client Access:**
- `/client/photobooks` - View all their photobooks
- `/client/photobook?galleryId=xxx` - Create new photobook from gallery

---

### 👨‍💼 **ADMIN ROLE**
Admins **review**, **approve**, and **manage** client photobook submissions.

**Admin Actions:**
1. Navigate to **Admin Dashboard** → **Photobooks**
2. Review submitted photobooks:
   - View preview of all pages
   - Check layout and photo selection
   - Read client notes
3. **Approve** or **Reject** submissions
4. **Download PDF** for printing
5. Update status through workflow:
   - `submitted` → `approved` → `printing` → `completed`
6. Track statistics (total, submitted, approved, printing, completed)

**Admin Access:**
- `/admin/dashboard/photobooks` - Manage all photobooks
- **NO CREATE BUTTON** - Admins don't create photobooks, they manage them

---

## Workflow States

```
CLIENT                           ADMIN
   │                              │
   ├─ Create Photobook            │
   ├─ Design Pages                │
   ├─ Submit for Approval ────────┤
   │                              │
   │                         ├─ Review
   │                         ├─ Preview Pages
   │                         │
   │                         ├─ APPROVE ──┐
   │                         │            │
   │    ┌──────────────────── STATUS:     │
   │    │                     approved    │
   │    │                              │
   │    │                         ├─ Download PDF
   │    │                         ├─ Send to Print
   │    │                         │
   │    │                         ├─ STATUS: printing
   │    │                              │
   │    │                         ├─ Shipped
   │    │                         │
   │    └─ Notified ◄─────────── STATUS: completed
   │
   └─ OR ◄──────────────────── REJECT
      Client receives           (with notes)
      rejection notes
```

---

## Database Schema

### Photobook Model
```typescript
{
  id: string
  clientId: string
  galleryId: string
  title: string
  format: '20x30' | '30x30'
  status: 'draft' | 'submitted' | 'approved' | 'printing' | 'completed'
  coverPhotoUrl?: string
  totalPages: number
  notes?: string           // Client notes
  adminNotes?: string      // Admin rejection reason
  submittedAt?: Date
  approvedAt?: Date
  createdAt: Date
  pages: PhotobookPage[]
  client: Client
  gallery: Gallery
}
```

### PhotobookPage Model
```typescript
{
  id: string
  photobookId: string
  pageNumber: number
  layoutType: 'full' | 'split' | 'triple' | 'quad' | 'collage-3'
  photos: PhotobookPhoto[]
  notes?: string
}
```

---

## API Endpoints

### Client Endpoints
- `GET /api/client/photobooks` - List client's photobooks
- `POST /api/client/photobook` - Create new photobook
- `PUT /api/client/photobook` - Update photobook design
- `POST /api/client/photobook/submit` - Submit for approval

### Admin Endpoints
- `GET /api/admin/photobooks` - List all photobooks (with filtering)
- `GET /api/admin/photobooks/[id]` - Get photobook details
- `GET /api/admin/photobooks/[id]/pdf` - Get photobook data for PDF
- `GET /api/admin/photobooks/[id]/export-pdf` - Generate printable PDF
- `POST /api/admin/photobooks/status` - Update photobook status
- `PATCH /api/admin/photobooks/[id]` - Update photobook

---

## Key Features

### Client Features
✅ Custom PhotobookEditor (835 lines)
✅ 5 layout templates
✅ Drag-and-drop photo placement
✅ Auto-fill available photos
✅ Format selection (portrait/square)
✅ Submit with notes
✅ View submission status

### Admin Features
✅ View all submissions
✅ Filter by status
✅ Search by title/client/gallery
✅ Page-by-page preview
✅ Approve/reject with notes
✅ PDF export for printing
✅ Status workflow tracking
✅ Statistics dashboard

---

## Recent Fix (Nov 17, 2025)

**Issue:** Admin photobooks page had "Create New Photobook" button linking to client area

**Root Cause:** Admin role should only **manage** photobooks, not create them

**Solution:**
- Removed "Create New Photobook" button from `/admin/dashboard/photobooks`
- Clarified admin description: "Review, approve, and manage client photobook submissions"
- Admin focuses on: Review → Approve → Download PDF → Track Status

**Understanding:**
- **Clients** create photobooks from their galleries
- **Admins** review and approve client submissions
- Clear separation of responsibilities
- Admin dashboard is for **management**, not creation

---

## Production URLs

**Client Photobook Creation:**
`https://[domain]/client/photobook?galleryId=[id]`

**Admin Photobook Management:**
`https://[domain]/admin/dashboard/photobooks`

**PDF Export:**
`https://[domain]/api/admin/photobooks/[id]/export-pdf`
