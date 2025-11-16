# 🧪 Photobook Submission - Testing Guide

## Quick Test Procedure

### Test as Client

1. **Login**
   - Go to: `https://Innov8photography.vercel.app/client/login`
   - Use client credentials

2. **Navigate to Photobooks**
   - Click "Photobooks" in navigation
   - Should see existing photobooks with status badges

3. **Create New Photobook**
   - Click "Create New Photobook" button
   - Select a gallery from the list
   - Wait for Polotno editor to load

4. **Design Photobook**
   - Add photos from gallery (left sidebar)
   - Add text elements
   - Customize layouts
   - Add multiple pages

5. **Save Progress**
   - Click "Save Design" button (blue)
   - Should see success message
   - URL should update with `photobookId` parameter

6. **Submit for Review**
   - Click "Submit for Review" button (pink-purple gradient)
   - Should see loading spinner
   - Should see success message
   - Should redirect to photobooks list

7. **Verify Submission**
   - Photobook should show "Submitted" status
   - Status badge should be blue
   - Message should say "Waiting for admin review"

---

### Test as Admin

1. **Login**
   - Go to: `https://Innov8photography.vercel.app/admin/login`
   - Use admin credentials

2. **Navigate to Photobooks**
   - Go to: `Dashboard > Photobooks`
   - Should see two sections:
     - "Old-Style Photobooks" (legacy)
     - "Polotno Photobooks" (modern)

3. **Verify Submission Appears**
   - Look in "Polotno Photobooks" section
   - Should see the client's submitted photobook
   - Should show:
     - Client name
     - Gallery name
     - Page count
     - Submitted date
     - "Submitted" status badge

4. **View Design**
   - Click "View" button on the photobook
   - Polotno viewer should load
   - Should show client's design exactly as created
   - Can scroll through pages

5. **Approve/Reject** (Optional)
   - Click "Approve" to change status to approved
   - Click "Reject" to send back to client
   - Status should update in real-time

---

## Expected Results

### ✅ Success Indicators:

**Client Side:**
- ✅ Polotno editor loads without errors
- ✅ Save button works and shows confirmation
- ✅ Submit button shows beautiful gradient design
- ✅ Loading spinner appears during submission
- ✅ Success message after submission
- ✅ Redirects to photobooks list
- ✅ Photobook status changes to "Submitted"

**Admin Side:**
- ✅ Submitted photobook appears in dashboard
- ✅ Shows up in "Polotno Photobooks" section
- ✅ All metadata is correct (client, gallery, pages)
- ✅ Design viewer opens and displays correctly
- ✅ Can see all pages client created
- ✅ Can approve/reject submission

---

## Common Issues & Solutions

### Issue 1: Photobook Not Appearing in Admin
**Symptom**: Client submits but admin doesn't see it

**Check**:
```bash
# In MongoDB or Prisma Studio
db.photobooks.find({ status: 'submitted' })
```

**Solution**: Ensure `design` field exists:
```json
{
  "id": "...",
  "status": "submitted",
  "design": { ... }, // ✅ Must exist
  "galleryId": "...",
  "clientId": "..."
}
```

---

### Issue 2: Editor Not Loading
**Symptom**: Blank screen or error on photobook page

**Check**:
- Browser console for errors
- Network tab for failed requests
- Polotno API key in environment variables

**Solution**:
```bash
# Verify environment variable
NEXT_PUBLIC_POLOTNO_KEY=your-key-here
```

---

### Issue 3: Submit Button Disabled
**Symptom**: Can't click submit button

**Reasons**:
1. No pages created (design empty)
2. Photobook not saved yet (no photobookId)
3. Already submitting (loading state)

**Solution**: Save design first, then submit

---

## Database Verification

### Check Photobook Record:
```javascript
// Prisma Studio or MongoDB
await prisma.photobook.findMany({
  where: { status: 'submitted' },
  include: {
    client: true,
    gallery: true
  }
})
```

### Expected Fields:
```json
{
  "id": "674abc123def...",
  "clientId": "674...",
  "galleryId": "674...",
  "title": "My Wedding Photobook",
  "status": "submitted", // ✅ Changed from 'draft'
  "design": { // ✅ Must exist
    "pages": [
      {
        "id": "page1",
        "children": [
          { "type": "image", "src": "https://..." },
          { "type": "text", "text": "Our Story" }
        ]
      }
    ]
  },
  "coverPhotoUrl": "https://...", // ✅ Extracted from first page
  "totalPages": 12, // ✅ From design.pages.length
  "submittedAt": "2024-12-15T...", // ✅ Timestamp added
  "createdAt": "2024-12-15T...",
  "updatedAt": "2024-12-15T..." // ✅ Updated on submit
}
```

---

## API Testing

### Test Submit Endpoint Directly:
```bash
curl -X POST https://Innov8photography.vercel.app/api/client/photobook/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: client-token=..." \
  -d '{
    "photobookId": "674...",
    "title": "Test Photobook",
    "design": {
      "pages": [
        {
          "id": "page1",
          "children": [
            { "type": "image", "src": "https://res.cloudinary.com/..." }
          ]
        }
      ]
    },
    "coverPhotoUrl": "https://res.cloudinary.com/..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Photobook submitted successfully",
  "photobook": {
    "id": "674...",
    "status": "submitted",
    "design": { ... },
    "submittedAt": "2024-12-15T..."
  }
}
```

---

## Performance Testing

### Load Testing:
1. Create 10 photobooks with 20 pages each
2. Submit all simultaneously
3. Verify all appear in admin dashboard
4. Check response times

**Expected**:
- Save: < 2 seconds
- Submit: < 3 seconds
- Admin load: < 5 seconds

---

## Regression Testing

### Test Legacy Photobooks Still Work:
1. Open old page-based photobook
2. Should load without errors
3. Should appear in "Old-Style Photobooks" section
4. Should be editable in legacy editor

### Test Mixed Environment:
- Some clients use Polotno
- Some clients use legacy editor
- Both should coexist without conflicts

---

## Browser Compatibility

### Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Chrome (iOS/Android)
- ✅ Mobile Safari (iOS)

### Known Issues:
- Polotno may have reduced functionality on IE11 (unsupported)

---

## Test Data Cleanup

### After Testing:
```javascript
// Delete test photobooks
await prisma.photobook.deleteMany({
  where: {
    title: { contains: 'Test' },
    status: 'submitted'
  }
})
```

---

## Success Criteria

### Definition of Done:
- ✅ Client can create photobook
- ✅ Client can design in Polotno editor
- ✅ Client can save multiple times
- ✅ Client can submit for review
- ✅ Admin sees submitted photobook immediately
- ✅ Admin can view design in Polotno viewer
- ✅ Admin can approve/reject
- ✅ No errors in browser console
- ✅ No 500 errors in API
- ✅ Database records are correct
- ✅ Legacy photobooks still work
- ✅ Responsive on mobile devices

---

## Rollback Plan

### If Issues Found:
```bash
# Revert to previous version
git revert bd524341

# Or checkout previous deployment
vercel --prod --force
```

---

*Last Updated: December 2024*
*Version: 1.0*

