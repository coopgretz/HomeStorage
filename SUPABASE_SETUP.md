# 🚀 Supabase Setup Guide

This guide will help you set up Supabase for your Home Storage System, including database, authentication, and file storage.

## 📋 Prerequisites

- A Supabase account (free tier is sufficient)
- Your Next.js app ready for deployment

## 🎯 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Fill in project details:**
   - Organization: Choose or create one
   - Name: `home-storage-system`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. **Click "Create new project"**
5. **Wait 2-3 minutes** for setup to complete

## 🔑 Step 2: Get API Keys

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values:**
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: Long JWT token starting with `eyJ...`

## 🗄️ Step 3: Set Up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Click "New Query"**
3. **Copy and paste** the entire contents of `supabase-schema.sql`
4. **Click "Run"** to execute the schema

This creates:
- ✅ User-specific tables (boxes, items, categories)
- ✅ Row Level Security (RLS) policies
- ✅ Default categories for new users
- ✅ Database indexes for performance

## 📁 Step 4: Set Up Storage for Images

1. **Go to Storage** in your Supabase dashboard
2. **Click "Create a new bucket"**
3. **Bucket details:**
   - **Name**: `images`
   - **Public bucket**: ✅ **Yes** (check this box)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `image/*`
4. **Click "Create bucket"**

### Configure Storage Policies

After creating the bucket, set up storage policies:

1. **Click on the "images" bucket**
2. **Go to "Policies" tab**
3. **Add these policies:**

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

**Policy 2: Allow public read access**
```sql
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');
```

**Policy 3: Allow users to delete their own images**
```sql
CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 🔐 Step 5: Configure Authentication

### Email Settings
1. **Go to Authentication > Settings**
2. **Configure Site URL:**
   - For development: `http://localhost:3000`
   - For production: `https://your-domain.com`
3. **Add Redirect URLs:**
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### Email Templates (Optional)
You can customize the confirmation email template in **Authentication > Templates**.

## 🔑 Step 6: Admin API Configuration (Optional)

For complete account deletion functionality, you need to configure the Supabase Admin API:

### Service Role Key Setup

1. **In your Supabase project dashboard**, go to **Settings** → **API**
2. **Copy your service_role key** (this is different from the anon key)
3. **Add it to your environment variables** (see next step)

### Important Security Notes

- ⚠️ The service role key bypasses Row Level Security (RLS)
- ⚠️ Never expose this key in client-side code
- ⚠️ Only use it in server-side API routes
- ⚠️ Keep it secure and rotate it periodically

### Without Admin API

If you choose not to configure the admin API:
- ✅ Account deletion will still remove all user data from your database
- ⚠️ The user's authentication account will remain in Supabase Auth
- ℹ️ Users will see a warning message about contacting support
- ✅ This is still a valid approach for many applications

## 🌍 Step 7: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Site URL (important for email confirmations)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: For complete account deletion (keep this secure!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**For production deployment**, update `NEXT_PUBLIC_SITE_URL` to your actual domain and add all environment variables to your hosting platform.

## 🚀 Step 8: Deploy to Vercel

1. **Push your code to GitHub**
2. **Go to [vercel.com](https://vercel.com)** and import your repo
3. **Add environment variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to your Vercel domain)
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for complete account deletion)
4. **Deploy!**

## ✅ Step 9: Test Your Setup

1. **Visit your deployed app**
2. **Sign up for a new account**
3. **Check your email for confirmation**
4. **Try creating a box with an image**
5. **Add some items with photos**
6. **Test the search functionality**
7. **Visit account settings to test email updates and password reset**

## 🔧 Troubleshooting

### Images Not Uploading
- ✅ Check that the `images` bucket is public
- ✅ Verify storage policies are set correctly
- ✅ Check browser console for errors

### Email Confirmations Not Working
- ✅ Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- ✅ Check Supabase Auth settings for correct redirect URLs
- ✅ Check spam folder

### Database Errors
- ✅ Ensure RLS policies are enabled
- ✅ Check that the schema was applied correctly
- ✅ Verify user is authenticated

## 📊 Monitoring

Monitor your app's performance in the Supabase dashboard:
- **Database > Logs** - SQL query logs
- **Storage > Usage** - File storage usage
- **Auth > Users** - User management

## 💰 Pricing

The free tier includes:
- 500MB database storage
- 1GB file storage
- 50MB file uploads
- 50,000 monthly active users

This is more than enough for personal use!

---

## 🎉 You're Done!

Your Home Storage System is now fully configured with:
- ✅ Secure multi-user authentication
- ✅ Cloud database with RLS
- ✅ Image storage and serving
- ✅ Complete account management (email updates, password reset, account deletion)
- ✅ Ready for production deployment

Happy organizing! 📦 