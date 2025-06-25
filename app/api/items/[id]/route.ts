import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteImage } from '@/lib/storage'

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
        box:boxes(id, box_number, label, location),
        category:categories(id, name, color)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Transform the data to flatten the box and category information
    const transformedItem = {
      ...item,
      box_number: item.box?.box_number,
      box_label: item.box?.label,
      box_location: item.box?.location,
      category_name: item.category?.name,
      category_color: item.category?.color,
    }

    return NextResponse.json(transformedItem)
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

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get existing item to check for image deletion
    const { data: existingItem, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
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
      // Remove the old image from Supabase Storage
      try {
        await deleteImage(supabase, existingItem.image_path)
      } catch (error) {
        console.warn('Failed to delete old image:', error)
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
        box:boxes(id, box_number, label, location),
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

    // Transform the data to flatten the box and category information
    const transformedItem = {
      ...updatedItem,
      box_number: updatedItem.box?.box_number,
      box_label: updatedItem.box?.label,
      box_location: updatedItem.box?.location,
      category_name: updatedItem.category?.name,
      category_color: updatedItem.category?.color,
    }

    return NextResponse.json(transformedItem)
  } catch (error) {
    console.error('Item PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get item to check for image deletion
    const { data: item } = await supabase
      .from('items')
      .select('image_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Delete associated image if exists
    if (item?.image_path) {
      try {
        await deleteImage(supabase, item.image_path)
      } catch (error) {
        console.warn('Failed to delete item image:', error)
      }
    }

    // Delete the item
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Item DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
} 