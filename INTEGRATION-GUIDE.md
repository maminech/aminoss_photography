# Integration Guide - Adaptive Upgrade Features

This guide shows you exactly how to integrate the new modular components into your existing pages.

---

## 🏠 Homepage Integration

### Add Animated Intro (First Visit Welcome)

**File:** `/src/app/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import AnimatedIntro from '@/modules/intro/AnimatedIntro';
// ... existing imports

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  
  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowIntro(true);
    }
  }, []);
  
  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('hasVisited', 'true');
  };
  
  return (
    <>
      {showIntro && <AnimatedIntro onComplete={handleIntroComplete} />}
      
      {/* Your existing homepage content */}
      <main>
        {/* ... existing content ... */}
      </main>
    </>
  );
}
```

### Add Remerciements Section

**File:** `/src/app/page.tsx`

Add this section anywhere in your homepage (recommended: before footer):

```typescript
import RemerciementsSection from '@/modules/remerciements/RemerciementsSection';

export default function HomePage() {
  return (
    <main>
      {/* ... existing sections ... */}
      
      {/* Add Remerciements Section */}
      <RemerciementsSection 
        autoPlayInterval={5000}  // 5 seconds per slide
        showDots={true}          // Show navigation dots
      />
      
      {/* Footer */}
    </main>
  );
}
```

---

## 🧭 Navbar Integration

### Add Navigation Mode Toggle

**File:** `/src/components/Navbar.tsx` (or wherever your navbar component is)

```typescript
import NavigationModeToggle from '@/modules/navigation/NavigationModeToggle';

export default function Navbar() {
  return (
    <nav className="...">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="logo">...</div>
        
        {/* Navigation Links */}
        <ul className="nav-links">...</ul>
        
        {/* Add Navigation Mode Toggle */}
        <div className="flex items-center gap-4">
          <NavigationModeToggle />
          
          {/* Existing buttons (dark mode, mobile menu, etc.) */}
          {/* ... */}
        </div>
      </div>
    </nav>
  );
}
```

---

## 📧 Contact Page Integration

### Replace/Extend with Enhanced Booking Form

**File:** `/src/app/contact/page.tsx`

**Option 1: Replace Existing Form**
```typescript
import EnhancedBookingForm from '@/modules/booking/EnhancedBookingForm';

export default function ContactPage() {
  return (
    <main>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Contact & Réservation</h1>
          
          {/* Replace your existing booking form with this */}
          <EnhancedBookingForm />
        </div>
      </section>
    </main>
  );
}
```

**Option 2: Add as Separate Section (Keep Existing Contact Form)**
```typescript
import EnhancedBookingForm from '@/modules/booking/EnhancedBookingForm';

export default function ContactPage() {
  return (
    <main>
      {/* Existing Contact Form Section */}
      <section className="py-16">
        {/* ... existing contact form ... */}
      </section>
      
      {/* Add Booking Form as New Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Demande de Devis</h2>
          <EnhancedBookingForm />
        </div>
      </section>
    </main>
  );
}
```

**Option 3: With Package Pre-fill (from /packages page)**
```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import EnhancedBookingForm from '@/modules/booking/EnhancedBookingForm';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const packageName = searchParams.get('package');
  const packagePrice = searchParams.get('price');
  
  return (
    <main>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Réservation</h1>
          
          <EnhancedBookingForm 
            prefilledPackage={packageName || undefined}
            prefilledPrice={packagePrice ? Number(packagePrice) : undefined}
          />
        </div>
      </section>
    </main>
  );
}
```

---

## 🎨 Admin Dashboard Integration

### Add New Tabs to Admin Panel

**File:** `/src/app/admin/page.tsx` or `/src/app/admin/layout.tsx`

```typescript
'use client';

import { useState } from 'react';
import ClientRequestsTab from '@/modules/admin/ClientRequestsTab';
import RemerciementsManagerTab from '@/modules/admin/RemerciementsManagerTab';
import PackagesManagerTab from '@/modules/admin/PackagesManagerTab';
import GoogleCalendarIntegration from '@/modules/admin/GoogleCalendarIntegration';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests');
  
  const tabs = [
    { id: 'requests', label: '📋 Demandes Clients', component: <ClientRequestsTab /> },
    { id: 'packages', label: '📦 Packages', component: <PackagesManagerTab /> },
    { id: 'remerciements', label: '💖 Remerciements', component: <RemerciementsManagerTab /> },
    { id: 'calendar', label: '📅 Calendrier', component: <GoogleCalendarIntegration /> },
    // ... your existing tabs (gallery, videos, settings, etc.)
  ];
  
  return (
    <div className="admin-dashboard">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
```

**Alternative: Separate Routes**
```typescript
// Create these files:
// /src/app/admin/client-requests/page.tsx
import ClientRequestsTab from '@/modules/admin/ClientRequestsTab';
export default function ClientRequestsPage() {
  return <ClientRequestsTab />;
}

// /src/app/admin/packages/page.tsx
import PackagesManagerTab from '@/modules/admin/PackagesManagerTab';
export default function PackagesPage() {
  return <PackagesManagerTab />;
}

// /src/app/admin/remerciements/page.tsx
import RemerciementsManagerTab from '@/modules/admin/RemerciementsManagerTab';
export default function RemerciementsPage() {
  return <RemerciementsManagerTab />;
}

// /src/app/admin/calendar/page.tsx
import GoogleCalendarIntegration from '@/modules/admin/GoogleCalendarIntegration';
export default function CalendarPage() {
  return <GoogleCalendarIntegration />;
}
```

---

## 📦 Packages Page Integration (Optional)

If you want to use the new PackagesPage component instead of the existing one:

**File:** `/src/app/packages/page.tsx` (create new route)

```typescript
import PackagesPage from '@/modules/packages/PackagesPage';

export default function PublicPackagesPage() {
  return <PackagesPage />;
}
```

Or add it as a section to an existing page:
```typescript
import PackagesPage from '@/modules/packages/PackagesPage';

export default function ServicesPage() {
  return (
    <main>
      {/* Other content */}
      <PackagesPage />
    </main>
  );
}
```

---

## ⚙️ Configuration Steps

### 1. Update WhatsApp Number

**File:** `/src/modules/booking/EnhancedBookingForm.tsx`

```typescript
// Find this line (around line 180):
const phoneNumber = '21612345678';

// Replace with your actual WhatsApp number:
const phoneNumber = 'YOUR_WHATSAPP_NUMBER'; // Include country code
```

### 2. Create Missing API Routes

You need to create these API routes that are referenced by the admin components:

**Packages Management APIs:**
```bash
# Create these files:
/src/app/api/admin/packages/route.ts
/src/app/api/admin/packages/[id]/route.ts
```

**Google Calendar APIs:**
```bash
# Create these files:
/src/app/api/admin/google-calendar/settings/route.ts
/src/app/api/admin/google-calendar/auth/route.ts
/src/app/api/admin/google-calendar/disconnect/route.ts
/src/app/api/admin/google-calendar/sync/route.ts
/src/app/api/admin/google-calendar/add-event/route.ts
```

**Contract Generation API:**
```bash
# Create this file:
/src/app/api/admin/generate-contract/[id]/route.ts
```

### 3. Update Database Schema

```bash
# Push Prisma schema changes to MongoDB
npx prisma db push

# If you get errors about data migration, backup your data first!
```

---

## 🎨 Styling Integration

All components use your existing Tailwind CSS classes and design system:

- `glass-card` - Your existing glassmorphism card class
- `btn-primary` / `btn-secondary` - Your existing button classes
- `input-field` - Your existing input field class
- Dark mode via `dark:` prefix (automatically supported)

**If these classes don't exist**, add them to your global CSS:

**File:** `/src/styles/globals.css` or `/src/app/globals.css`

```css
/* Glass Card */
.glass-card {
  @apply bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl;
}

/* Primary Button */
.btn-primary {
  @apply px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

/* Secondary Button */
.btn-secondary {
  @apply px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors;
}

/* Input Field */
.input-field {
  @apply w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors;
}
```

---

## 🧪 Testing After Integration

### 1. Test Homepage
```
✓ Visit http://localhost:3000
✓ Should see animated intro (first visit only)
✓ Scroll down to see Remerciements section
✓ Check navbar for navigation mode toggle
```

### 2. Test Contact/Booking
```
✓ Visit /contact
✓ Fill out booking form
✓ Click submit
✓ Should open WhatsApp with message
✓ Check database for new booking record
```

### 3. Test Admin Panel
```
✓ Login as admin
✓ Navigate to new tabs
✓ View client requests
✓ Toggle remerciement items
✓ Create/edit packages
```

---

## 🐛 Troubleshooting

### Issue: Components not rendering
**Solution:** Make sure you're importing from the correct path:
```typescript
import AnimatedIntro from '@/modules/intro/AnimatedIntro';
// NOT: import AnimatedIntro from './modules/intro/AnimatedIntro';
```

### Issue: API routes returning 404
**Solution:** Make sure you've created all the API route files listed above.

### Issue: Prisma model errors
**Solution:** Run `npx prisma generate` and `npx prisma db push`

### Issue: Styling looks broken
**Solution:** Add the missing CSS classes to your globals.css (see Styling Integration section above)

### Issue: Dark mode not working
**Solution:** Ensure your existing theme context is working. All components use `dark:` classes that rely on your existing dark mode implementation.

---

## 📝 Checklist

- [ ] Homepage: Added AnimatedIntro with first-visit detection
- [ ] Homepage: Added RemerciementsSection
- [ ] Navbar: Added NavigationModeToggle
- [ ] Contact: Integrated EnhancedBookingForm
- [ ] Admin: Added ClientRequestsTab
- [ ] Admin: Added RemerciementsManagerTab
- [ ] Admin: Added PackagesManagerTab
- [ ] Admin: Added GoogleCalendarIntegration
- [ ] Config: Updated WhatsApp number
- [ ] Database: Ran `npx prisma db push`
- [ ] Styling: Added missing CSS classes (if needed)
- [ ] Testing: Tested all new features
- [ ] Commit: `git add . && git commit -m "feat: integrate adaptive upgrade features"`

---

## 🚀 Deployment

After integration and testing locally:

```bash
# Build to check for errors
npm run build

# If build successful, deploy
git push origin feature/adaptive-upgrade

# Deploy to Vercel
vercel --prod
```

---

**Need Help?** Review the CHANGELOG-ADAPTIVE-UPGRADE.md file for detailed component documentation and API specifications.
