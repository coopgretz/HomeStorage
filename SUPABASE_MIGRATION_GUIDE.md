# 🚀 Supabase Migration Guide

This guide will help you migrate your Home Storage System from SQLite to Supabase, adding authentication and making it ready for deployment on Vercel.

## ✅ What's Already Done

I've already set up the following for you:
- ✅ Supabase client configuration (browser & server)
- ✅ Authentication middleware
- ✅ Login/signup pages with Google OAuth
- ✅ Updated Navigation with auth UI
- ✅ Database schema for Supabase
- ✅ Row Level Security (RLS) policies

## 🎯 Step 1: Create Supabase Project

1. **Sign up for Supabase**: Go to [supabase.com](https://supabase.com) and create a free account
2. **Create a new project**: 
   - Click "New Project"
   - Choose your organization
   - Enter project name: `home-storage-system`  
   - Generate a strong database password
   - Select a region (choose closest to your users)
   - Click "Create new project"

3. **Wait for setup**: This takes 2-3 minutes

## 🔑 Step 2: Get Your API Keys

1. Go to **Settings > API** in your Supabase dashboard
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Key - anon public** (long JWT token)

## 🌍 Step 3: Configure Environment Variables

1. **Create `.env.local`** in your project root:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

2. **Replace the placeholder values** with your actual Supabase URL and anon key

⚠️ **Important**: Add `.env.local` to your `.gitignore` if it's not already there!

## 🗄️ Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- ✅ Categories table with default categories
- ✅ Boxes table with user association  
- ✅ Items table with user association
- ✅ Row Level Security policies
- ✅ Database indexes for performance

## 🔐 Step 5: Enable Google Authentication (Optional)

If you want Google OAuth login:

### 5.1 Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to **Credentials > Create Credentials > OAuth client ID**
5. Set up OAuth consent screen
6. Create Web application credentials:
   - **Authorized JavaScript origins**: `http://localhost:3000` (for dev), `https://yourdomain.com` (for prod)
   - **Authorized redirect URIs**: `https://your-project-ref.supabase.co/auth/v1/callback`

### 5.2 Supabase OAuth Setup  
1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable **Google** provider
3. Add your Google **Client ID** and **Client Secret**
4. Set **Redirect URL** to: `https://your-project-ref.supabase.co/auth/v1/callback`

## 🔄 Step 6: Update API Routes (We'll do this next)

The current API routes use SQLite. We need to update them to use Supabase. Here's what needs to be changed:

### Routes to Update:
- ✅ `/api/stats` - Dashboard statistics
- ✅ `/api/items` - Items CRUD operations  
- ✅ `/api/boxes` - Boxes management
- ✅ `/api/categories` - Categories (now from Supabase)
- ✅ `/api/upload` - File upload (will use Supabase Storage)

## 🚀 Step 7: Test the Migration

1. **Install dependencies** (already done):
```bash
npm install @supabase/supabase-js @supabase/ssr
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Test authentication**:
   - Visit `http://localhost:3000/login`
   - Try signing up with email/password
   - Try Google OAuth (if configured)

4. **Check database**:
   - Go to Supabase **Table Editor**
   - Verify your user appears in **Authentication > Users**

## 📦 Step 8: Deploy to Vercel

1. **Push to GitHub**: Make sure your code is in a GitHub repo
2. **Connect to Vercel**: 
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
3. **Add environment variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Update OAuth URLs**: Add your Vercel domain to Google OAuth settings

## 🔄 Migration Benefits

### ✅ What You Gain:
- 🔐 **Multi-user authentication** - Family members can have separate accounts
- 🌍 **Cloud hosting** - Access from anywhere  
- 📱 **Real-time sync** - Changes sync instantly across devices
- 🛡️ **Built-in security** - Row Level Security protects user data
- 📊 **Scalability** - Handles growth automatically
- 💾 **Automatic backups** - Your data is safe
- 🚀 **Serverless** - No server maintenance

### 📋 Current Status:
- ✅ Authentication system ready
- ✅ Database schema created
- ✅ Navigation updated with auth
- ⏳ API routes need updating (next step)
- ⏳ File storage needs migrating to Supabase Storage

## 🆘 Troubleshooting

### Common Issues:

**1. Environment Variables Not Working**
- Restart your dev server after adding `.env.local`
- Check for typos in variable names
- Ensure no spaces around the `=` sign

**2. Database Connection Issues**  
- Verify your Supabase URL and key are correct
- Check if your project is still initializing
- Ensure Row Level Security policies are set up

**3. Authentication Not Working**
- Check browser console for errors
- Verify callback URLs match exactly
- Test with different browsers/incognito mode

**4. Google OAuth Issues**
- Ensure authorized domains are set correctly
- Check that OAuth consent screen is configured
- Verify client ID and secret are correct

## 🎉 Next Steps

Ready to continue? I'll help you:
1. Update all API routes to use Supabase
2. Migrate file storage to Supabase Storage  
3. Add real-time features
4. Optimize for production deployment

Let me know when you've completed the Supabase setup and I'll continue with the API route migration!

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2) 