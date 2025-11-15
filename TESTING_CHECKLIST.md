# 🧪 Gallery Separation Testing Checklist

## Date: November 15, 2025
## Feature: Complete Separation of Simple Mode (Instagram) and Professional Mode (Admin Uploads)

---

## ✅ Pre-Testing Setup

### Database Verification
- [ ] Run `npx prisma db push` to ensure schema is up to date
- [ ] Verify `showInProfessionalMode` field exists in Image model
- [ ] Verify `showInProfessionalMode` field exists in Video model
- [ ] Check that field default is `false`

### Authentication
- [ ] Login to admin dashboard
- [ ] Verify admin role/permissions
- [ ] Test session persistence

---

## 📸 Photo Upload & Management Tests

### Test 1: Upload Photo for Professional Mode
**Steps:**
1. Navigate to Admin Dashboard
2. Click Gallery Management → Photos
3. Click "Upload Photos" button
4. Select and upload 1 test photo
5. Wait for upload to complete
6. Click "Edit" on the uploaded photo
7. Scroll to find "Show in Professional Mode" checkbox (amber background with ✨)
8. Check the checkbox ✅
9. Click "Save Changes"

**Expected Results:**
- [ ] Photo uploads successfully to Cloudinary
- [ ] Photo appears in photos grid
- [ ] Edit modal opens smoothly
- [ ] Professional mode checkbox is visible with amber styling
- [ ] Checkbox has sparkle icon (✨)
- [ ] Save operation completes without errors
- [ ] Photo shows amber badge indicating professional mode

**Actual Results:** _________________

---

### Test 2: Verify Professional Mode Display
**Steps:**
1. Switch theme to "Professional Mode" (if not already)
2. Navigate to homepage
3. Check hero carousel section
4. Navigate to `/gallery`
5. Verify photo from Test 1 appears

**Expected Results:**
- [ ] Photo appears in professional homepage carousel
- [ ] Photo appears in professional gallery page
- [ ] Professional mode styling (luxury theme) active
- [ ] Smooth carousel transitions

**Actual Results:** _________________

---

### Test 3: Verify Simple Mode Isolation
**Steps:**
1. Switch theme to "Simple Mode"
2. Navigate to homepage
3. Check if admin-uploaded photo from Test 1 appears

**Expected Results:**
- [ ] Admin photo does NOT appear on homepage
- [ ] Only Instagram posts visible
- [ ] Instagram grid layout active
- [ ] Highlights row visible at top

**Actual Results:** _________________

---

### Test 4: Bulk Professional Mode Toggle
**Steps:**
1. Go to Admin → Gallery Management → Photos
2. Upload 5 test photos (or select 5 existing)
3. Check the selection checkbox on each photo
4. Verify "5 selected" count shows
5. Click "✨ Pro Mode" button (amber gradient)
6. Wait for operation to complete
7. Refresh page

**Expected Results:**
- [ ] All 5 photos selected successfully
- [ ] Bulk action button visible and clickable
- [ ] Operation completes without errors
- [ ] All 5 photos now have professional mode flag
- [ ] All 5 photos show amber badge
- [ ] All 5 photos appear in professional mode

**Actual Results:** _________________

---

## 🎬 Video Upload & Management Tests

### Test 5: Upload Video for Professional Mode
**Steps:**
1. Navigate to Admin Dashboard
2. Click Gallery Management → Videos
3. Click "Upload Videos" or "Sync from Cloudinary"
4. Upload 1 test video
5. Click "Edit" on the uploaded video
6. Find "Show in Professional Mode" checkbox (amber background)
7. Check the checkbox ✅
8. Click "Save Changes"

**Expected Results:**
- [ ] Video uploads successfully
- [ ] Edit modal opens
- [ ] Professional mode checkbox visible with amber styling
- [ ] Checkbox has sparkle icon (✨)
- [ ] Save completes successfully

**Actual Results:** _________________

---

### Test 6: Background Video Setup
**Steps:**
1. In video edit modal
2. Check "Use as background video in professional mode hero section"
3. Also check "Show in Professional Mode" if not already
4. Save changes
5. Switch to professional mode
6. Navigate to homepage
7. Wait for video to load

**Expected Results:**
- [ ] Background video checkbox available
- [ ] Save operation successful
- [ ] Video plays in professional homepage hero
- [ ] Video loops seamlessly
- [ ] Poster/thumbnail shows while loading
- [ ] Video doesn't autoplay audio (muted)

**Actual Results:** _________________

---

## 🎨 Admin Dashboard Tests

### Test 7: Dashboard Organization
**Steps:**
1. Navigate to Admin Dashboard home
2. Observe layout structure
3. Check for section headings
4. Test navigation to each section

**Expected Results:**
- [ ] Stats cards at top (Leads, Messages, Photos, Videos)
- [ ] "Quick Actions" section visible
- [ ] "🎨 Gallery Management" section with purple/pink gradient background
- [ ] Gallery Management contains: Photos, Videos, Highlights, Albums
- [ ] "🛠️ Additional Tools" section visible
- [ ] All cards clickable and navigate correctly
- [ ] Smooth staggered animations on page load

**Actual Results:** _________________

---

### Test 8: Navigation Animations
**Steps:**
1. Open admin sidebar (mobile or desktop)
2. Observe menu item animations
3. Click different menu items
4. Observe hover effects

**Expected Results:**
- [ ] Sidebar opens smoothly
- [ ] Menu items fade in with stagger effect
- [ ] Active page highlighted with primary color
- [ ] Hover effects show scale animation
- [ ] Icons scale slightly on hover
- [ ] Badge notifications visible (if any)
- [ ] Badge animations smooth

**Actual Results:** _________________

---

## 🔄 Content Flow Tests

### Test 9: Simple to Professional Mode Switch
**Steps:**
1. Start in Simple Mode
2. Upload 3 photos via admin (don't check professional mode)
3. Upload 3 photos via admin (DO check professional mode)
4. View simple mode homepage
5. Switch to professional mode
6. View professional homepage

**Expected Results:**
- [ ] Simple mode shows ONLY Instagram posts
- [ ] Professional mode shows ONLY the 3 flagged photos
- [ ] Mode switch happens instantly
- [ ] No flickering or loading issues
- [ ] Correct theme styling for each mode

**Actual Results:** _________________

---

### Test 10: Gallery Page Filtering
**Steps:**
1. Ensure you have:
   - Some photos with professional mode flag
   - Some photos without flag
   - Some Instagram posts
2. Switch to professional mode
3. Navigate to `/gallery`
4. Observe content
5. Switch to simple mode
6. Navigate to `/gallery`
7. Observe content

**Expected Results:**
- [ ] Professional gallery shows ONLY flagged admin photos
- [ ] Simple gallery shows ONLY Instagram posts
- [ ] No mixing of content between modes
- [ ] Gallery grid layouts correctly
- [ ] Lightbox works for both modes

**Actual Results:** _________________

---

## 🎯 API Endpoint Tests

### Test 11: Professional Mode API
**Steps:**
1. Open browser DevTools → Network tab
2. Switch to professional mode
3. Navigate to homepage
4. Look for API calls to `/api/admin/images` or `/api/videos`
5. Check query parameters

**Expected Results:**
- [ ] API called with `?professionalMode=true` parameter
- [ ] Only returns photos/videos with `showInProfessionalMode: true`
- [ ] Response time < 2 seconds
- [ ] No errors in console

**Actual Results:** _________________

---

### Test 12: Simple Mode API
**Steps:**
1. Open browser DevTools → Network tab
2. Switch to simple mode
3. Navigate to homepage
4. Look for API calls to `/api/public/posts` or `/api/instagram/posts`

**Expected Results:**
- [ ] API calls Instagram posts endpoint
- [ ] Does NOT call admin images endpoint
- [ ] Returns Instagram data only
- [ ] No admin content in response

**Actual Results:** _________________

---

## 💫 UI/UX Polish Tests

### Test 13: Amber Styling Verification
**Steps:**
1. Open photo edit modal
2. Locate professional mode checkbox
3. Verify visual styling
4. Compare with other checkboxes

**Expected Results:**
- [ ] Amber/yellow gradient background (from-amber-50 to-yellow-50)
- [ ] Border matches amber theme
- [ ] Sparkle icon (✨) visible
- [ ] Two-line label: main title + subtitle
- [ ] Subtitle text smaller and lighter
- [ ] Visually distinct from other options
- [ ] Dark mode styling also amber-themed

**Actual Results:** _________________

---

### Test 14: Animation Smoothness
**Steps:**
1. Load admin dashboard
2. Observe all animations
3. Test on different screen sizes
4. Check frame rate (should be 60fps)

**Expected Results:**
- [ ] Stats cards fade in smoothly
- [ ] Sections load with stagger (0.2s delay)
- [ ] Action cards have hover scale effect
- [ ] Sidebar menu items stagger on load
- [ ] No janky or stuttering animations
- [ ] Animations respect reduced motion preference

**Actual Results:** _________________

---

## 📱 Responsive Design Tests

### Test 15: Mobile Admin Interface
**Steps:**
1. Open admin dashboard on mobile device or resize browser to mobile width
2. Test sidebar open/close
3. Test photo upload
4. Test bulk operations
5. Test modal interactions

**Expected Results:**
- [ ] Hamburger menu button visible
- [ ] Sidebar slides in from left
- [ ] Backdrop closes sidebar on tap
- [ ] Upload buttons accessible (min 44px touch target)
- [ ] Bulk action buttons responsive
- [ ] Modals fit screen properly
- [ ] Professional mode checkbox accessible

**Actual Results:** _________________

---

## 🔒 Edge Case Tests

### Test 16: No Professional Content
**Steps:**
1. Ensure no photos/videos have professional mode flag
2. Switch to professional mode
3. Navigate to homepage

**Expected Results:**
- [ ] No error thrown
- [ ] Fallback content loads (featured images)
- [ ] Graceful empty state if no fallback
- [ ] User can still navigate interface

**Actual Results:** _________________

---

### Test 17: Mixed Content Scenarios
**Steps:**
1. Upload photo: featured=true, professional=true
2. Upload photo: featured=false, professional=true
3. Upload photo: featured=true, professional=false
4. Test all combinations in both modes

**Expected Results:**
- [ ] Featured flag independent of professional mode
- [ ] Both flags can be true simultaneously
- [ ] Filtering works correctly for each combination
- [ ] No conflicts between flags

**Actual Results:** _________________

---

## 🚀 Performance Tests

### Test 18: Load Time Verification
**Steps:**
1. Clear browser cache
2. Load professional homepage
3. Measure time to interactive
4. Check image loading
5. Verify lazy loading

**Expected Results:**
- [ ] Homepage loads < 3 seconds
- [ ] Images load progressively
- [ ] Lazy loading active for below-fold content
- [ ] Video doesn't block page load
- [ ] No layout shift (CLS < 0.1)

**Actual Results:** _________________

---

### Test 19: Bulk Operation Performance
**Steps:**
1. Select 50 photos
2. Click "Pro Mode" bulk button
3. Measure operation time
4. Check for errors

**Expected Results:**
- [ ] Operation completes < 10 seconds
- [ ] Progress indication shown
- [ ] Success message on completion
- [ ] No timeout errors
- [ ] Database updates consistently

**Actual Results:** _________________

---

## 🧹 Cleanup Tests

### Test 20: Toggle Off Professional Mode
**Steps:**
1. Select photo with professional mode enabled
2. Edit photo
3. Uncheck professional mode checkbox
4. Save changes
5. Verify photo no longer in professional gallery

**Expected Results:**
- [ ] Photo removed from professional homepage
- [ ] Photo removed from professional gallery
- [ ] Photo still exists in admin panel
- [ ] No errors during update

**Actual Results:** _________________

---

## 📊 Test Summary

### Coverage
- [ ] All 20 tests executed
- [ ] Critical path verified
- [ ] Edge cases covered
- [ ] Performance benchmarked

### Issues Found
List any bugs or issues:
1. _________________
2. _________________
3. _________________

### Recommendations
List any improvements:
1. _________________
2. _________________
3. _________________

---

## ✅ Sign-off

**Tester Name:** _________________  
**Date:** _________________  
**Browser(s) Tested:** _________________  
**Device(s) Tested:** _________________  
**Overall Result:** ☐ Pass ☐ Fail ☐ Pass with Minor Issues  

**Notes:**
_____________________________
_____________________________
_____________________________

---

## 🔄 Next Steps After Testing

If all tests pass:
1. [ ] Commit changes with descriptive message
2. [ ] Push to repository
3. [ ] Deploy to production/staging
4. [ ] Monitor for 24 hours
5. [ ] Gather user feedback

If issues found:
1. [ ] Document all bugs in detail
2. [ ] Prioritize by severity
3. [ ] Create fix plan
4. [ ] Re-test after fixes
5. [ ] Document resolution

---

**Testing Document Version:** 1.0  
**Related Docs:** GALLERY_SEPARATION_COMPLETE.md, ADMIN_QUICK_GUIDE.md
