# 🏠 Home Storage System

A modern web application for organizing and tracking items in your home storage boxes. Built with Next.js, React, TypeScript, and Supabase.

## ✨ Features

- 📦 **Box Management** - Create and organize numbered storage boxes
- 🔍 **Smart Search** - Find items by name, description, or category
- 🏷️ **Categories** - Color-coded organization system
- 📍 **Location Tracking** - Track items by room/location
- 📱 **Mobile-First Design** - Responsive interface for all devices
- 🖼️ **Photo Support** - Add photos to boxes and items
- ✅ **Status Tracking** - Mark items as in/out of box
- 👤 **Multi-User** - Secure authentication with Supabase
- 🌐 **Real-time** - Instant updates across devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd home-storage-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up your Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

3. **Set environment variables in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel domain)

4. **Update Supabase Auth settings**
   - In Supabase dashboard: Authentication > URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add your Vercel domain to "Redirect URLs"

## 📱 How to Use

1. **Sign up/Login** - Create an account or sign in
2. **Create categories** - Set up color-coded categories for your items
3. **Add boxes** - Create numbered storage boxes with photos
4. **Add items** - Add items to boxes with descriptions and photos
5. **Search & Filter** - Find items by name, category, or location
6. **Track status** - Mark items as in/out of box

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Local filesystem (with API routes)
- **Deployment**: Vercel

## 📋 Database Schema

The app uses three main tables:

- **boxes** - Storage box information
- **items** - Individual items in boxes
- **categories** - Item categorization system

All tables include Row Level Security (RLS) for multi-user support.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License. 