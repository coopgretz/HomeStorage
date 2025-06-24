import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    const { data: boxes, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('user_id', user.id)
      .order('box_number')

    if (error) {
      throw error
    }

    return NextResponse.json(boxes || [])
  } catch (error) {
    console.error('Boxes GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boxes' },
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
    const { box_number, label, description, location = 'Garage', image_path } = body

    if (!box_number) {
      return NextResponse.json(
        { error: 'Box number is required' },
        { status: 400 }
      )
    }

    // Check if box number already exists for this user
    const { data: existingBox } = await supabase
      .from('boxes')
      .select('id')
      .eq('user_id', user.id)
      .eq('box_number', box_number)
      .single()

    if (existingBox) {
      return NextResponse.json(
        { error: 'Box number already exists' },
        { status: 409 }
      )
    }

    const { data: newBox, error } = await supabase
      .from('boxes')
      .insert({
        user_id: user.id,
        box_number,
        label: label || null,
        description: description || null,
        location,
        image_path: image_path || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(newBox, { status: 201 })
  } catch (error) {
    console.error('Boxes POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create box' },
      { status: 500 }
    )
  }
} 