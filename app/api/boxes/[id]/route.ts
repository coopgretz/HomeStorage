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
        { error: 'Invalid box ID' },
        { status: 400 }
      )
    }

    const { data: box, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (error || !box) {
      return NextResponse.json(
        { error: 'Box not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(box)
  } catch (error) {
    console.error('Box GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch box' },
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
        { error: 'Invalid box ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { box_number, label, description, location, remove_image } = body

    // Validate required fields
    if (!box_number) {
      return NextResponse.json(
        { error: 'Box number is required' },
        { status: 400 }
      )
    }

    // Check if box exists and belongs to user
    const { data: existingBox, error: fetchError } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !existingBox) {
      return NextResponse.json(
        { error: 'Box not found' },
        { status: 404 }
      )
    }

    // Check if box number is already taken by another box
    if (box_number !== existingBox.box_number) {
      const { data: conflictBox } = await supabase
        .from('boxes')
        .select('id')
        .eq('box_number', box_number)
        .eq('user_id', user.id)
        .neq('id', id)
        .single()
      
      if (conflictBox) {
        return NextResponse.json(
          { error: 'Box number already exists' },
          { status: 400 }
        )
      }
    }

    // Handle image removal
    let updateData: any = {
      box_number,
      label: label || null,
      description: description || null,
      location: location || 'Garage',
    }

    if (remove_image && existingBox.image_path) {
      // Remove the old image file
      try {
        const imagePath = path.join(process.cwd(), 'public', existingBox.image_path)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      } catch (error) {
        console.warn('Failed to delete old image file:', error)
      }
      updateData.image_path = null
    }

    // Update the box
    const { data: updatedBox, error: updateError } = await supabase
      .from('boxes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Box update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update box' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedBox)
  } catch (error) {
    console.error('Box PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update box' },
      { status: 500 }
    )
  }
} 