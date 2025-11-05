# Contact Messages System - Setup Complete

## ✅ What's Been Implemented

### 1. Database Schema
- **ContactMessage Model** added to `prisma/schema.prisma`
- Fields include:
  - Contact details (name, email, phone, subject)
  - Message content
  - Status tracking (unread, read, replied, archived)
  - Reply functionality
  - IP address and user agent tracking
  - Timestamps

### 2. Backend APIs

#### Contact Form API (`/api/contact`)
- Saves every contact form submission to database
- Optionally sends email (graceful failure if email not configured)
- Tracks IP address and user agent
- Returns message ID to client

#### Messages Management API (`/api/admin/messages`)
- **GET**: Fetch all messages with optional status filter
  - Returns messages array and count object (unread, read, replied, archived totals)
  - Example: `/api/admin/messages?status=unread`
  
- **PUT**: Update message status or save reply
  - Mark as read/unread/replied/archived
  - Save reply text with timestamp
  - Example: `{ id: "123", status: "read" }` or `{ id: "123", replyText: "..." }`
  
- **DELETE**: Remove a message
  - Example: `/api/admin/messages?id=123`

#### Dashboard Stats API
- Updated to include `unreadMessages` count
- Displayed on admin dashboard overview

### 3. Admin Dashboard UI

#### Messages Page (`/admin/dashboard/messages`)
- **Inbox View**: List of all messages with filters
- **Status Filters**: All, Unread, Read, Replied, Archived
- **Message Details**: Full view with contact info and message
- **Actions**:
  - Mark as read
  - Archive message
  - Delete message
  - Write and save reply
- **Real-time Updates**: Automatically marks messages as read when opened
- **Responsive Design**: Works on mobile and desktop

#### Navigation
- **Messages Link** added to admin sidebar
- **Unread Badge**: Red notification badge shows unread count
- **Dashboard Card**: Messages stat card on overview page (clickable)

## 🔧 Setup Instructions

### Step 1: Configure Database
Ensure your `.env` file has the MongoDB connection string:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/aminoss_photography"
```

### Step 2: Push Schema to Database
Run this command to create the ContactMessage collection:
```bash
npx prisma db push
```

### Step 3: Generate Prisma Client
Regenerate the Prisma client (already done, but run again after database push):
```bash
npx prisma generate
```

### Step 4: Restart Development Server
Stop and restart your Next.js dev server to pick up new types:
```bash
# Press Ctrl+C to stop current server
npm run dev
```

## 📋 How to Use

### For Users (Contact Form)
1. Visit the contact page on your website
2. Fill in name, email, phone (optional), subject (optional), and message
3. Click Send
4. Message is instantly saved to database
5. Email is sent if configured (optional)

### For Admins (Dashboard)
1. Log in to admin dashboard
2. See unread message count in sidebar and on overview card
3. Click "Messages" in sidebar or dashboard card
4. View all messages with filters:
   - **All**: Every message
   - **Unread**: New messages (highlighted with blue dot)
   - **Read**: Messages you've opened
   - **Replied**: Messages with saved responses
   - **Archived**: Messages you've archived
5. Click a message to view full details
6. Actions:
   - Automatically marks as "read" when opened
   - Write reply and click "Save Reply"
   - Mark as archived to organize inbox
   - Delete unwanted messages

### Status Workflow
```
New Message → Unread (blue dot)
   ↓ (click to view)
   → Read
   ↓ (write reply)
   → Replied
   ↓ (organize)
   → Archived
```

## 🎨 Features

### User Experience
- Glass morphism design consistent with your portfolio
- Dark mode support
- Smooth animations
- Toast notifications for all actions
- Responsive layout (mobile/desktop)

### Admin Features
- **Auto-marking**: Messages automatically marked as read when opened
- **Badge Notifications**: Unread count visible at all times
- **Quick Filters**: One-click status filtering
- **Reply System**: Save replies for reference (email separately)
- **Archive System**: Keep inbox organized
- **Confirmation Dialogs**: Prevent accidental deletions

### Technical Features
- **Optimistic UI**: Instant feedback while API processes
- **Error Handling**: Graceful failures with user-friendly messages
- **Security**: Admin authentication required for all message operations
- **Privacy**: IP tracking for security, deletable at any time
- **Performance**: Efficient queries with status-based indexing

## 📧 Email Configuration (Optional)

If you want to receive email notifications when users submit the contact form, configure these environment variables:

```env
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=admin@yoursite.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Note**: Email is optional. Messages are always saved to database regardless of email configuration.

## 🔍 API Usage Examples

### Fetch All Unread Messages
```javascript
const response = await fetch('/api/admin/messages?status=unread');
const data = await response.json();
console.log(data.messages); // Array of unread messages
console.log(data.counts); // { unread: 5, read: 10, ... }
```

### Mark Message as Read
```javascript
await fetch('/api/admin/messages', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'message-id', status: 'read' })
});
```

### Save Reply
```javascript
await fetch('/api/admin/messages', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    id: 'message-id', 
    replyText: 'Thank you for your message...' 
  })
});
```

### Delete Message
```javascript
await fetch('/api/admin/messages?id=message-id', {
  method: 'DELETE'
});
```

## 🎯 Next Steps (Optional Enhancements)

### Suggested Improvements
1. **Email Integration**: Add reply-by-email functionality
2. **Search**: Add text search across messages
3. **Bulk Actions**: Select multiple messages for bulk operations
4. **Labels/Tags**: Add custom labels for better organization
5. **Export**: Export messages to CSV/PDF
6. **Statistics**: Message analytics and response time tracking
7. **Notifications**: Browser push notifications for new messages
8. **Templates**: Save reply templates for common responses

## 🐛 Troubleshooting

### Messages Not Appearing
1. Check database connection in `.env`
2. Run `npx prisma db push` to ensure schema is synced
3. Verify contact form is submitting correctly (check Network tab)

### TypeScript Errors
1. Restart VS Code TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Ensure Prisma client is generated: `npx prisma generate`
3. Restart dev server

### Badge Not Showing
1. Check dashboard stats API: `/api/admin/dashboard/stats`
2. Verify unreadMessages count is returned
3. Check browser console for errors

## 📦 File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       ├── messages/
│   │       │   └── page.tsx          # Messages inbox UI
│   │       ├── page.tsx               # Dashboard overview (updated)
│   │       └── layout.tsx
│   └── api/
│       ├── contact/
│       │   └── route.ts               # Contact form submission (updated)
│       └── admin/
│           ├── messages/
│           │   └── route.ts           # Messages management API (new)
│           └── dashboard/
│               └── stats/
│                   └── route.ts       # Dashboard stats (updated)
└── prisma/
    └── schema.prisma                  # Database schema (updated)
```

## ✨ Summary

You now have a complete contact message management system integrated into your admin dashboard! Users can contact you via the form, and you can view, organize, and respond to all messages from a centralized inbox.

**Key Benefits**:
- Never miss a customer inquiry
- Organized inbox with status tracking
- Professional reply management
- Full message history
- Mobile-friendly interface
- Secure and private

Your photography portfolio now has enterprise-level contact management! 📸✉️
