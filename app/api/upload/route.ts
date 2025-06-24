import { NextRequest, NextResponse } from 'next/server'
import { saveUploadedImage, isValidImageType, validateImageSize } from '@/lib/qr-utils'

export async function POST(request: NextRequest) {
  try {
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
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!validateImageSize(file.size)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Save image and get path
    const imagePath = saveUploadedImage(buffer, file.name, type as 'box' | 'item', parseInt(id))

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