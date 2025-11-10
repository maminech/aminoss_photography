# 📱 Aminoss Admin Mobile App

Beautiful cross-platform mobile admin application for Aminoss Photography platform.

## 🚀 Quick Start

```powershell
# Navigate to project
cd "e:\aminoss photography\mobile-admin-app"

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

## ✨ Features

### ✅ Implemented (Ready to Use)
- **Authentication** - Secure login with session management
- **Dashboard** - Financial stats, business metrics, 8 quick actions
- **Invoices** - List, filter, and **Mark as Paid** ⭐
- **Bookings** - List, filter, **Approve/Reject** ⭐
- **Navigation** - Bottom tabs (Dashboard, Invoices, Bookings, More)

### ⏳ Coming Soon
- Photobooks management (update status)
- Photos management (sync from Cloudinary)
- Clients management (add, edit)
- Expenses tracking (add, view)
- Messages (contact form submissions)
- Settings (profile, logout)

## 🎯 Key Admin Actions

1. **Mark Invoice as Paid** - Tap green "Mark Paid" button on unpaid invoices
2. **Approve Booking** - Tap green "Approve" button on pending bookings
3. **Reject Booking** - Tap red "Reject" button on pending bookings
4. **View Dashboard Stats** - Pull down to refresh latest data
5. **Filter Lists** - Use tab filters (All, Paid/Unpaid, Pending/Approved)

## 🎨 Design

- **Brand Color**: Purple (#8B5CF6) - matches web platform
- **Status Colors**: Green (paid/approved), Red (unpaid/rejected), Amber (partial/pending)
- **Currency**: TND (Tunisian Dinar)
- **Icons**: Ionicons from Expo Vector Icons
- **Layout**: Card-based with shadows, bottom tab navigation

## 📱 Screenshots

### Login Screen
- Purple branding
- Camera icon
- Email/password inputs
- Show/hide password toggle

### Dashboard
- Financial overview (4 cards)
- Business stats (4 mini cards)
- 8 quick action buttons
- Notification badge
- Pull-to-refresh

### Invoices
- List with status badges
- Filter tabs (All/Paid/Unpaid/Partial)
- Mark as Paid button
- TND currency display
- Pull-to-refresh

### Bookings
- List with status icons
- Filter tabs (All/Pending/Approved/Rejected)
- Approve/Reject buttons
- Event details
- Client information
- Pull-to-refresh

## 🔧 Tech Stack

- **Framework**: React Native 0.73
- **Platform**: Expo 50 (managed workflow)
- **Navigation**: React Navigation 6 (Stack + Bottom Tabs)
- **State**: React Context API
- **Storage**: AsyncStorage
- **HTTP**: Axios
- **Icons**: Expo Vector Icons (Ionicons)
- **Date**: date-fns
- **Charts**: React Native Chart Kit (for future use)

## 🌐 API Connection

Connects to production API:
```
https://aminossphotography-pzcspo5w5-aminech990000-6355s-projects.vercel.app
```

All actions are real-time and sync with the web platform.

## 🔑 Login

Use your admin credentials:
- Email: admin@aminoss.com
- Password: [Your admin password]

## 📁 Project Structure

```
mobile-admin-app/
├── App.tsx                    # Entry point
├── src/
│   ├── constants/theme.ts    # Colors, sizes, shadows
│   ├── contexts/AuthContext.tsx
│   ├── navigation/AppNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── InvoicesScreen.tsx
│   │   └── BookingsScreen.tsx
│   └── services/api.ts       # API client
└── SETUP_GUIDE.md            # Detailed setup instructions
```

## 🚢 Build for Production

### Android APK (for testing)
```powershell
npx eas-cli build --platform android --profile preview
```

### Android AAB (for Play Store)
```powershell
npx eas-cli build --platform android --profile production
```

## 📝 Status

**Progress: ~30% Complete**

Core admin features (invoices and bookings management) are fully functional.
Remaining 6 screens to be built for complete coverage.

## 🎉 Ready to Test!

The app is functional and ready for testing on Android devices or emulators.

**Priority Features Working:**
✅ Login/logout
✅ Dashboard with stats
✅ Mark invoices as paid
✅ Approve/reject bookings
✅ TND currency display
✅ Pull-to-refresh
✅ Status filtering
