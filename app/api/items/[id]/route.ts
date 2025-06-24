import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const { data: item, error } = await supabase
      .from('items')
      .select(`
        *,
        box:boxes(id, box_number, label),
        category:categories(id, name, color)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Item GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get user to ensure they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, box_id, category_id, quantity, notes, remove_image } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    // Check if item exists and belongs to user
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Validate box_id if provided
    if (box_id) {
      const { data: box } = await supabase
        .from('boxes')
        .select('id')
        .eq('id', box_id)
        .eq('user_id', user.id)
        .single()
      
      if (!box) {
        return NextResponse.json(
          { error: 'Invalid box ID' },
          { status: 400 }
        )
      }
    }

    // Validate category_id if provided
    if (category_id) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', user.id)
        .single()
      
      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        )
      }
    }

    // Handle image removal
    let updateData: any = {
      name: name.trim(),
      description: description?.trim() || null,
      box_id: box_id || null,
      category_id: category_id || null,
      quantity: quantity || 1,
      notes: notes?.trim() || null,
      last_updated: new Date().toISOString(),
    }

    if (remove_image && existingItem.image_path) {
      // Remove the old image file
      try {
        const imagePath = path.join(process.cwd(), 'public', existingItem.image_path)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      } catch (error) {
        console.warn('Failed to delete old image file:', error)
      }
      updateData.image_path = null
    }

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        box:boxes(id, box_number, label),
        category:categories(id, name, color)
      `)
      .single()

    if (updateError) {
      console.error('Item update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Item PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
} 