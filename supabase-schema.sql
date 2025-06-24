-- ============================================
-- Home Storage System - Supabase Schema
-- ============================================

-- Enable Row Level Security (automatically enabled for new tables)

-- ============================================
-- Categories Table (User-specific)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories_for_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, color) VALUES 
    (user_uuid, 'Electronics', '#3b82f6'),
    (user_uuid, 'Tools', '#f59e0b'),
    (user_uuid, 'Clothing', '#10b981'),
    (user_uuid, 'Books', '#8b5cf6'),
    (user_uuid, 'Kitchen', '#ef4444'),
    (user_uuid, 'Toys', '#ec4899'),
    (user_uuid, 'Sports', '#06b6d4'),
    (user_uuid, 'Office', '#6b7280'),
    (user_uuid, 'Other', '#84cc16')
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Boxes Table
-- ============================================
CREATE TABLE IF NOT EXISTS boxes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  box_number INTEGER NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_path TEXT,
  qr_code_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, box_number)
);

-- ============================================
-- Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  box_id BIGINT REFERENCES boxes(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_box' CHECK (status IN ('in_box', 'out_of_box')),
  quantity INTEGER DEFAULT 1,
  image_path TEXT,
  notes TEXT,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Categories: Users can only access their own categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

CREATE POLICY "Users can view their own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Boxes: Users can only access their own boxes
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can insert their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can update their own boxes" ON boxes;
DROP POLICY IF EXISTS "Users can delete their own boxes" ON boxes;

CREATE POLICY "Users can view their own boxes" ON boxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own boxes" ON boxes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own boxes" ON boxes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own boxes" ON boxes FOR DELETE USING (auth.uid() = user_id);

-- Items: Users can only access their own items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

CREATE POLICY "Users can view their own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own items" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own items" ON items FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_boxes_user_id ON boxes(user_id);
CREATE INDEX IF NOT EXISTS idx_boxes_box_number ON boxes(box_number);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_box_id ON items(box_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

-- ============================================
-- Functions for updated_at timestamps
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for items table
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (Optional)
-- ============================================
-- You can uncomment these lines to create sample data for testing
/*
-- Sample boxes (you'll need to replace the user_id with your actual user ID)
INSERT INTO boxes (user_id, box_number, label, description, location) VALUES 
  ('your-user-id-here', 1, 'Electronics Box', 'Various electronic items and cables', 'Garage Shelf A'),
  ('your-user-id-here', 2, 'Tools & Hardware', 'Hand tools and hardware supplies', 'Garage Shelf B'),
  ('your-user-id-here', 3, 'Kitchen Items', 'Extra kitchen appliances and utensils', 'Garage Shelf C');

-- Sample items (you'll need to replace user_id and use actual box IDs)
INSERT INTO items (user_id, name, description, box_id, category_id, quantity) VALUES 
  ('your-user-id-here', 'USB Cables', 'Various USB charging cables', 1, 1, 5),
  ('your-user-id-here', 'Screwdriver Set', 'Phillips and flathead screwdrivers', 2, 2, 1),
  ('your-user-id-here', 'Blender', 'Kitchen blender for smoothies', 3, 5, 1);
*/ 