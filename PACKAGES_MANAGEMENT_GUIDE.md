# 📦 How to Manage Packages in Admin Dashboard

## Overview
The packages displayed in "Demande de Devis" (booking form) are now **fully manageable** from the admin dashboard.

---

## 🎯 Accessing Package Management

**URL**: `/admin/dashboard/packs`

**From Admin Dashboard**:
1. Click **"Packages (Devis)"** in the sidebar

---

## ✨ What You Can Do

### **View All Packages**
- See all packages currently in the system
- View package details (name, price, duration, features)
- See how many bookings each package has received
- Check active/inactive status

### **Create New Package**
1. Click **"Add New Pack"** button
2. Fill in the details:
   - **Name**: e.g., "Essentiel", "Premium", "Luxe"
   - **Description**: Brief description
   - **Price**: In DT (Tunisian Dinar)
   - **Duration**: e.g., "2 heures", "Journée complète"
   - **Category**: e.g., "Wedding", "Portrait", "Photography"
   - **Cover Image**: URL to package image
   - **Features**: List of included services (one per line)
   - **Active**: Toggle to show/hide in booking form
   - **Order**: Display order (1, 2, 3, 4...)

3. Click **"Save"**

### **Edit Existing Package**
1. Find the package you want to edit
2. Click the **Edit** icon (pencil)
3. Update any field
4. Click **"Save"**

### **Delete Package**
1. Find the package to delete
2. Click the **Delete** icon (trash)
3. Confirm deletion

### **Activate/Deactivate Package**
- Toggle the **"Active"** switch
- **Active** = Shows in booking form
- **Inactive** = Hidden from public, but saved in database

---

## 📋 Default Packages Created

The system comes pre-loaded with 4 packages:

### 1. **Essentiel** (299 DT)
- 2h de couverture
- 100 photos retouchées
- 1 photographe
- Order: 1
- Icon: 📸

### 2. **Premium** (499 DT)
- 4h de couverture
- 200 photos retouchées
- 1 photographe
- Album digital
- Order: 2
- Icon: ⭐

### 3. **Luxe** (799 DT)
- Journée complète
- 400+ photos
- 2 photographes
- Album premium
- Vidéo highlights
- Order: 3
- Icon: 👑

### 4. **Sur mesure** (0 DT / Custom)
- Package personnalisé selon vos besoins
- Order: 4
- Icon: ✨

---

## 🔄 How It Works

### **Backend (Database)**
- Packages are stored in MongoDB using Prisma
- Model: `Pack`
- Fields: name, description, price, duration, features, category, active, order

### **Frontend (Booking Form)**
- Form automatically loads **active packages** from database
- Displays them in Step 2 of the booking process
- Users can select any active package
- If database is empty, shows default fallback packages

### **Admin Dashboard**
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time updates
- See booking count per package

---

## 💡 Best Practices

### **Package Naming**
- Keep names short and clear
- Use French names (e.g., "Essentiel", "Premium")
- Consistent capitalization

### **Pricing**
- Set realistic prices in DT
- Use 0 for custom/quote-based packages
- Update prices seasonally if needed

### **Features List**
- Use clear, concise bullet points
- Highlight key benefits
- Maximum 5-7 features per package
- Use French language

### **Display Order**
- Order 1 = Leftmost/top position
- Order 2, 3, 4 = Following positions
- Keep logical progression (basic → premium → luxury)

### **Active Status**
- Keep at least 2-3 packages active
- Deactivate seasonal packages when not relevant
- Don't delete packages with existing bookings (deactivate instead)

---

## 🎨 Package Icons

Icons are automatically assigned based on package name:
- **"Essentiel"** or **"Basic"** → 📸
- **"Premium"** → ⭐
- **"Luxe"** or **"Luxury"** → 👑
- **"Sur mesure"** or **"Custom"** → ✨
- **Default** → 📦

To change icons, edit the `getPackageIcon()` function in `EnhancedBookingForm.tsx`.

---

## 📊 Tracking Package Performance

### **View Booking Count**
- Each package shows number of bookings received
- Helps identify most popular packages

### **Analyze in Bookings Tracking**
- Go to **"Bookings Tracking"** dashboard
- See which packages users viewed
- See which packages were selected
- Optimize offerings based on data

---

## 🔧 Technical Details

### **API Endpoints**

#### Get Active Packages (Public)
```
GET /api/admin/packs?active=true
```
Used by booking form to load packages

#### Get All Packages (Admin)
```
GET /api/admin/packs
```
Used by admin dashboard

#### Create Package
```
POST /api/admin/packs
```

#### Update Package
```
PUT /api/admin/packs
```

#### Delete Package
```
DELETE /api/admin/packs?id={packageId}
```

### **Database Schema**
```prisma
model Pack {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  description String
  price       Float
  duration    String
  coverImage  String
  features    String[]
  category    String
  active      Boolean   @default(true)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bookings    Booking[]
}
```

---

## 🚀 Common Tasks

### **Add a New Wedding Package**
1. Go to `/admin/dashboard/packs`
2. Click "Add New Pack"
3. Fill in:
   - Name: "Mariage Complet"
   - Price: 1200
   - Duration: "8 heures"
   - Features: ["Préparatifs", "Cérémonie", "Réception", "500+ photos", "2 photographes", "Album 30x30", "Vidéo 4K"]
   - Category: "Wedding"
   - Active: ✓
   - Order: 5
4. Save

### **Change Package Price**
1. Find the package
2. Click Edit
3. Update "Price" field
4. Save
5. Changes immediately reflected in booking form

### **Temporarily Hide a Package**
1. Find the package
2. Toggle "Active" to OFF
3. Package hidden from booking form
4. To show again, toggle ON

### **Reorder Packages**
1. Edit each package
2. Change "Order" number
3. Save
4. Packages display in new order

---

## ✅ Checklist After Making Changes

- [ ] Save the changes
- [ ] Check booking form (`/booking`)
- [ ] Verify packages appear in correct order
- [ ] Test selecting each package
- [ ] Verify prices display correctly
- [ ] Check mobile display

---

## 🆘 Troubleshooting

### **Packages not showing in booking form**
- Check if packages are marked as **Active**
- Verify packages exist in database
- Check browser console for errors

### **Changes not appearing**
- Refresh the booking page (Ctrl+F5)
- Clear browser cache
- Check if changes were saved

### **Can't delete a package**
- Check if package has existing bookings
- Consider deactivating instead of deleting

---

## 📞 Need Help?

The packages system is now fully dynamic:
- **Database**: MongoDB (via Prisma)
- **Admin UI**: `/admin/dashboard/packs`
- **Public Display**: `/booking` (Step 2)
- **Tracking**: `/admin/bookings-tracking`

All changes made in the admin dashboard are **immediately reflected** in the booking form!

---

**Last Updated**: November 8, 2025  
**Status**: ✅ Fully Functional
