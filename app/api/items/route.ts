import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit
    const search = searchParams.get('search')
    const boxId = searchParams.get('box_id')
    
    let query = supabase
      .from('items')
      .select(`
        *,
        box:boxes(id, box_number, label, location),
        category:categories(id, name, color)
      `)
      .eq('user_id', user.id)
      .order('date_added', { ascending: false })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,notes.ilike.%${search}%`)
    }
    
    if (boxId) {
      query = query.eq('box_id', parseInt(boxId))
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: items, error } = await query

    if (error) {
      throw error
    }

    // Transform the data to flatten the box and category information
    const transformedItems = items?.map(item => ({
      ...item,
      box_number: item.box?.box_number,
      box_label: item.box?.label,
      box_location: item.box?.location,
      category_name: item.category?.name,
      category_color: item.category?.color,
    })) || []

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    })
  } catch (error) {
    console.error('Items GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description, box_id, category_id, status = 'in_box', quantity = 1, image_path, notes } = body

    if (!name || !box_id) {
      return NextResponse.json(
        { error: 'Name and box_id are required' },
        { status: 400 }
      )
    }

    // Validate box belongs to user
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

    // Validate category belongs to user (if provided)
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

    const { data: newItem, error } = await supabase
      .from('items')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        box_id,
        category_id: category_id || null,
        status,
        quantity,
        image_path: image_path || null,
        notes: notes || null
      })
      .select(`
        *,
        box:boxes(id, box_number, label, location),
        category:categories(id, name, color)
      `)
      .single()

    if (error) {
      throw error
    }

    // Transform the data to flatten the box and category information
    const transformedItem = {
      ...newItem,
      box_number: newItem.box?.box_number,
      box_label: newItem.box?.label,
      box_location: newItem.box?.location,
      category_name: newItem.category?.name,
      category_color: newItem.category?.color,
    }

    return NextResponse.json(transformedItem, { status: 201 })
  } catch (error) {
    console.error('Items POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
} 