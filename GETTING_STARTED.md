# 🏠 Home Storage System - Getting Started

A mobile-first React application for managing items in your numbered storage boxes.

## 🚀 Quick Start

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Initialize the database**:
   ```bash
   npm run init-db
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile-Friendly Features

### ✅ Responsive Design
- **Mobile-first approach** using Tailwind CSS
- **Touch-friendly buttons** with proper sizing
- **Hamburger menu** for mobile navigation
- **Swipe and tap interactions** optimized for mobile devices

### ✅ Key Features
- **Dashboard Overview**: See stats and recent items at a glance
- **Quick Actions**: Large, easy-to-tap action buttons
- **Smart Search**: Find items by name, description, or category
- **Status Toggle**: One-tap to mark items as in/out of box
- **Add Items**: Simple, mobile-optimized form

### ✅ Navigation
- **Bottom-up approach** on mobile with collapsible navigation
- **Clear visual hierarchy** with proper spacing
- **Fast loading** with optimized components

## 🎯 How to Use

### Adding Your First Items
1. Tap **"Add New Item"** from the dashboard
2. Fill in the item details
3. Select which numbered box it goes in
4. Choose a category (optional)
5. Set initial status (In Box/Out of Box)

### Searching for Items
1. Tap **"Search"** in the navigation
2. Type item name, description, or category
3. Use filters to narrow results
4. Tap status icons to update item location

### Managing Boxes
1. Go to **"Boxes"** section
2. View all your numbered storage boxes
3. See what items are in each box
4. Add new boxes as needed

### Status Tracking
- **Green checkmark**: Mark item as "In Box"
- **Orange exclamation**: Mark item as "Out of Box"
- **Visual indicators**: Instantly see item status

## 🛠 Technical Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS (mobile-first)
- **Database**: SQLite with better-sqlite3
- **Icons**: Heroicons (optimized for mobile)
- **Responsive**: Works on phone, tablet, and desktop

## 📦 Sample Data

The system comes with sample boxes and categories to get you started:
- **Box #1**: Electronics
- **Box #2**: Tools  
- **Box #3**: Kitchen Items

## 🔧 Customization

### Adding Categories
Categories help organize your items with color coding:
- Electronics (Blue)
- Tools (Orange)
- Clothing (Purple)
- Books (Green)
- Kitchen (Red)
- Sports (Cyan)
- Decorations (Pink)
- Documents (Gray)
- Other (Dark Gray)

### Box Management
- Each box has a unique number
- Add labels and descriptions
- Track location (default: Garage)

## 📊 Dashboard Features

### Stats Cards
- **Total Boxes**: Number of storage boxes
- **Total Items**: All items in the system
- **Items In Box**: Currently stored items
- **Items Out of Box**: Items you've taken out

### Recent Items
- Shows latest 5 added items
- Quick status toggle buttons
- Direct links to item details

### Quick Actions
- **Add New Item**: Large touch target
- **Search Items**: Quick access to search
- **Manage Boxes**: Box organization
- **Scan QR Code**: Future feature for labels

## 🎨 Mobile UI Design

### Touch Targets
- **Minimum 44px touch targets** following mobile guidelines
- **Adequate spacing** between interactive elements
- **Visual feedback** on tap/touch

### Typography
- **Responsive text sizes** (smaller on mobile, larger on desktop)
- **High contrast** for readability
- **Proper line height** for easy reading

### Layout
- **Single column on mobile** for easy scrolling
- **Grid layout on tablet/desktop** for efficiency
- **Sticky navigation** for easy access

## 🔍 Search & Filter

### Search Capabilities
- **Real-time search** as you type
- **Cross-field search** (name, description, category)
- **Case-insensitive** matching

### Filter Options
- **Status filter**: All, In Box, Out of Box
- **Category filter**: Filter by item categories
- **Box filter**: Show items from specific boxes

This system is designed to make managing your home storage as easy as possible, especially on mobile devices! 📱✨ 