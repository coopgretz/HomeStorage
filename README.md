# Home Storage System

A web-based application for managing and tracking items in numbered storage boxes in your garage.

## Features

- **Box Management**: Organize items by numbered storage boxes
- **Item Tracking**: Add, edit, and remove items from your inventory
- **Status Management**: Track whether items are currently in their assigned box or out
- **Search Functionality**: Quickly find items across your entire storage system
- **Responsive UI**: Works on desktop, tablet, and mobile devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   npm run init-db
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Adding Items
1. Click "Add Item" button
2. Enter item details (name, description, category)
3. Assign to a box number
4. Set initial status (In Box/Out of Box)

### Searching Items
- Use the search bar to find items by name, description, or category
- Filter by box number or status
- View detailed information for each item

### Managing Boxes
- View all items in a specific box
- See box capacity and organization
- Move items between boxes

### Status Tracking
- Mark items as "Out of Box" when you take them out
- Mark them as "In Box" when you return them
- Track borrowing and usage patterns

## Database Schema

The system uses SQLite with the following tables:
- `boxes`: Storage box information
- `items`: Individual item records
- `categories`: Item categorization

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Icons**: Heroicons 