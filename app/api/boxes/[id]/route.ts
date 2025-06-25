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

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Box not found' },
          { status: 404 }
        )
      }
      throw error
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

    if (!box_number) {
      return NextResponse.json(
        { error: 'Box number is required' },
        { status: 400 }
      )
    }

    // Get existing box to check for image deletion
    const { data: existingBox, error: fetchError } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Box not found' },
        { status: 404 }
      )
    }

    // Check if box number already exists for this user (excluding current box)
    const { data: duplicateBox } = await supabase
      .from('boxes')
      .select('id')
      .eq('user_id', user.id)
      .eq('box_number', box_number)
      .neq('id', id)
      .single()

    if (duplicateBox) {
      return NextResponse.json(
        { error: 'Box number already exists' },
        { status: 409 }
      )
    }

    let updateData: any = {
      box_number,
      label: label?.trim() || null,
      description: description?.trim() || null,
      location: location || 'Garage',
    }

    if (remove_image && existingBox.image_path) {
      // Remove the old image from Supabase Storage
      try {
        await deleteImage(supabase, existingBox.image_path)
      } catch (error) {
        console.warn('Failed to delete old image:', error)
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
        { error: 'Invalid box ID' },
        { status: 400 }
      )
    }

    // Get box to check for image deletion
    const { data: box } = await supabase
      .from('boxes')
      .select('image_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Delete associated image if exists
    if (box?.image_path) {
      try {
        await deleteImage(supabase, box.image_path)
      } catch (error) {
        console.warn('Failed to delete box image:', error)
      }
    }

    // Delete the box (items will be cascade deleted due to foreign key constraint)
    const { error } = await supabase
      .from('boxes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Box deleted successfully' })
  } catch (error) {
    console.error('Box DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete box' },
      { status: 500 }
    )
  }
} 