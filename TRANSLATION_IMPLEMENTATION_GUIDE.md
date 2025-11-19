# 🌐 Complete Platform Translation Implementation Guide

## Current Status
✅ Translation system installed
✅ Language switcher working
✅ Partial translations applied

## Files Needing Complete Translation

### Priority 1: Navigation & Homepage
1. `src/app/(public)/page.tsx` - Simple Mode Homepage ⚠️ IN PROGRESS
2. `src/app/(public)/professional-home/page.tsx` - Professional Mode Homepage
3. `src/components/Navbar.tsx` - Main navigation bar
4. `src/components/Footer.tsx` - Footer component

### Priority 2: Main Pages
5. `src/app/(public)/gallery/page.tsx` - Gallery page
6. `src/app/(public)/videos/page.tsx` - Videos page
7. `src/app/(public)/about/page.tsx` - About page
8. `src/app/(public)/contact/page.tsx` - Contact page
9. `src/app/(public)/booking/page.tsx` - Booking page
10. `src/app/(public)/packs/page.tsx` - Packages page
11. `src/app/(public)/testimonials/page.tsx` - Testimonials page

### Priority 3: Client Portal
12. `src/app/client/login/page.tsx` - Client login
13. `src/app/client/dashboard/page.tsx` - Client dashboard
14. `src/app/client/galleries/page.tsx` - Client galleries
15. `src/app/client/photobooks/page.tsx` - Client photobooks
16. `src/app/client/guest-uploads/page.tsx` - Guest uploads
17. `src/app/client/photobooths/page.tsx` - Photo booth prints
18. `src/app/client/testimonials/page.tsx` - Client testimonials

### Priority 4: Admin Dashboard
19. `src/app/admin/dashboard/page.tsx` - Admin main dashboard
20. `src/app/admin/dashboard/photos/page.tsx` - Photos management
21. `src/app/admin/dashboard/videos/page.tsx` - Videos management
22. `src/app/admin/dashboard/albums/page.tsx` - Albums management
23. `src/app/admin/dashboard/clients/page.tsx` - Clients management
24. `src/app/admin/dashboard/bookings/page.tsx` - Bookings management
25. `src/app/admin/dashboard/messages/page.tsx` - Messages
26. `src/app/admin/dashboard/settings/page.tsx` - Settings
27. `src/app/admin/dashboard/calendar/page.tsx` - Calendar
28. `src/app/admin/dashboard/finances/page.tsx` - Finances
29. `src/app/admin/dashboard/team/page.tsx` - Team management
30. `src/app/admin/dashboard/packs/page.tsx` - Packages manager
31. `src/app/admin/dashboard/testimonials/page.tsx` - Testimonials manager
32. `src/app/admin/dashboard/highlights/page.tsx` - Instagram highlights
33. `src/app/admin/dashboard/photobooks/page.tsx` - Photobooks management

### Priority 5: Shared Components
34. `src/components/LightboxModal.tsx` - Image lightbox
35. `src/components/AlbumLightboxModal.tsx` - Album lightbox
36. `src/components/StoriesViewer.tsx` - Stories viewer
37. `src/components/ThemeSwitcherModal.tsx` - Theme switcher
38. `src/components/PublicPWAInstallPrompt.tsx` - PWA install prompt
39. `src/components/NavigationButton.tsx` - Navigation buttons
40. `src/modules/booking/EnhancedBookingForm.tsx` - Booking form
41. `src/modules/remerciements/RemerciementsSection.tsx` - Testimonials section

## Translation Pattern

### Step 1: Import Hook
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

// Inside component
const { t } = useLanguage();
```

### Step 2: Replace All Text
Replace every hardcoded string with `{t('key')}`:

**Before:**
```typescript
<h1>Welcome to Our Platform</h1>
<button>Click Here</button>
<p>Loading...</p>
```

**After:**
```typescript
<h1>{t('home.welcome')}</h1>
<button>{t('common.clickHere')}</button>
<p>{t('common.loading')}</p>
```

### Step 3: Common Elements to Translate
- ✅ Headings (h1, h2, h3, etc.)
- ✅ Paragraphs and text content
- ✅ Button text
- ✅ Link text
- ✅ Placeholders (input, textarea)
- ✅ Labels (form labels)
- ✅ Alt text (images)
- ✅ Title attributes
- ✅ Aria labels
- ✅ Error messages
- ✅ Success messages
- ✅ Loading states
- ✅ Empty states
- ✅ Tooltips
- ✅ Modal titles and content

## Quick Reference: Common Translations

### Navigation
```typescript
{t('nav.home')} // Home / Accueil
{t('nav.gallery')} // Gallery / Galerie
{t('nav.videos')} // Videos / Vidéos
{t('nav.about')} // About / À Propos
{t('nav.contact')} // Contact / Contact
{t('nav.booking')} // Booking / Réservation
{t('nav.packs')} // Packages / Forfaits
{t('nav.testimonials')} // Testimonials / Témoignages
```

### Common Actions
```typescript
{t('common.save')} // Save / Enregistrer
{t('common.cancel')} // Cancel / Annuler
{t('common.delete')} // Delete / Supprimer
{t('common.edit')} // Edit / Modifier
{t('common.view')} // View / Voir
{t('common.download')} // Download / Télécharger
{t('common.upload')} // Upload / Télécharger
{t('common.search')} // Search / Rechercher
{t('common.filter')} // Filter / Filtrer
{t('common.loading')} // Loading... / Chargement...
```

### States
```typescript
{t('common.success')} // Success / Succès
{t('common.error')} // An error occurred / Une erreur s'est produite
{t('common.loading')} // Loading... / Chargement...
```

## Implementation Checklist

### For Each File:
- [ ] Import `useLanguage` hook
- [ ] Call `const { t } = useLanguage()`
- [ ] Find all hardcoded text strings
- [ ] Replace with appropriate translation key
- [ ] Test in both English and French
- [ ] Check for missing translations
- [ ] Verify layout doesn't break (French is often longer)

## Testing Strategy

### Manual Testing:
1. Switch to English → Check all text
2. Switch to French → Check all text
3. Navigate through all pages
4. Test all buttons and links
5. Fill out all forms
6. Trigger all modals
7. Test error states
8. Test success messages
9. Test loading states
10. Check mobile view

### Automated Testing:
```bash
# Build to catch any missing imports
npm run build

# Check for untranslated strings
grep -r "\"[A-Z]" src/ | grep -v "className" | grep -v "import"
```

## Progress Tracking

### Completed ✅
- [x] Translation system (LanguageContext.tsx)
- [x] Language switcher component
- [x] Root layout integration
- [x] Simple Mode - Partial navigation menu
- [x] Professional Mode - Language switcher added

### In Progress ⚠️
- [ ] Simple Mode - Complete all text
- [ ] Professional Mode - Complete all text
- [ ] All other pages

### Not Started ❌
- [ ] 40+ component files need translation
- [ ] Admin dashboard pages
- [ ] Client portal pages
- [ ] Shared components

## Estimated Time
- **Per Page**: 10-15 minutes
- **Total Pages**: ~45 pages
- **Total Time**: 7-10 hours of focused work

## Priority Order
1. Homepage (both modes) - **User's first impression**
2. Navigation & Footer - **Seen on every page**
3. Main public pages - **Most visited**
4. Client portal - **Client-facing**
5. Admin dashboard - **Internal use**

## Notes
- French text is typically 20-30% longer than English
- Test layout responsiveness after translation
- Some technical terms might stay in English (Instagram, Admin, etc.)
- Dates and numbers may need formatting (future enhancement)
- Images with text overlays cannot be translated dynamically

## Next Steps
1. Complete Simple Mode homepage
2. Complete Professional Mode homepage
3. Do Navbar and Footer
4. Move through public pages systematically
5. Then client portal
6. Finally admin dashboard
