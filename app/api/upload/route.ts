import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadImage, isValidImageType, validateImageSize } from '@/lib/storage'

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

    const formData = await request.formData()
    const file = formData.get('image') as File
    const type = formData.get('type') as string // 'box' or 'item'
    const id = formData.get('id') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['box', 'item'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "box" or "item"' },
        { status: 400 }
      )
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Invalid ID provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!isValidImageType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!validateImageSize(file)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Upload image to Supabase Storage with authenticated client
    const imagePath = await uploadImage(supabase, file, type as 'box' | 'item', parseInt(id))

    // Update the database record with the image path
    if (type === 'box') {
      const { error: updateError } = await supabase
        .from('boxes')
        .update({ image_path: imagePath })
        .eq('id', parseInt(id))
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update box with image path:', updateError)
      }
    } else if (type === 'item') {
      const { error: updateError } = await supabase
        .from('items')
        .update({ image_path: imagePath })
        .eq('id', parseInt(id))
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update item with image path:', updateError)
      }
    }

    return NextResponse.json({
      success: true,
      imagePath,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
} 