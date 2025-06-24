-- ============================================
-- Migration: Make Categories User-Specific
-- ============================================
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_id column to categories table
ALTER TABLE categories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create function to generate default categories for users
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
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create default categories for all existing users
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        PERFORM create_default_categories_for_user(user_record.id);
    END LOOP;
END $$;

-- Step 4: Update existing items to use user-specific categories
DO $$
DECLARE
    item_record RECORD;
    matching_category_id BIGINT;
BEGIN
    FOR item_record IN 
        SELECT i.id, i.user_id, i.category_id, c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.user_id IS NOT NULL 
        AND i.category_id IS NOT NULL
        AND c.user_id IS NULL  -- Old global category
    LOOP
        -- Find the user's equivalent category
        SELECT id INTO matching_category_id
        FROM categories 
        WHERE user_id = item_record.user_id 
        AND name = item_record.category_name;
        
        -- Update the item to use the user-specific category
        IF matching_category_id IS NOT NULL THEN
            UPDATE items 
            SET category_id = matching_category_id 
            WHERE id = item_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 5: Remove old global categories
DELETE FROM categories WHERE user_id IS NULL;

-- Step 6: Make user_id required
ALTER TABLE categories ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Update constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE categories ADD CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name);

-- Step 8: Update Row Level Security policies
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;

CREATE POLICY "Users can view their own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Step 9: Add performance index
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Migration complete! 