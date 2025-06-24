import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQRCode } from '@/lib/qr-utils'

export async function POST(
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

    const boxId = parseInt(params.id)
    
    if (isNaN(boxId)) {
      return NextResponse.json(
        { error: 'Invalid box ID' },
        { status: 400 }
      )
    }

    // Get box details
    const { data: box, error: boxError } = await supabase
      .from('boxes')
      .select('*')
      .eq('id', boxId)
      .eq('user_id', user.id)
      .single()

    if (boxError || !box) {
      return NextResponse.json(
        { error: 'Box not found' },
        { status: 404 }
      )
    }

    // Generate QR code
    const qrCodePath = await generateQRCode(boxId, box.box_number)
    
    // Update box with QR code path
    const { data: updatedBox, error: updateError } = await supabase
      .from('boxes')
      .update({ qr_code_path: qrCodePath })
      .eq('id', boxId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      qrCodePath,
      box: updatedBox,
      message: 'QR code generated successfully'
    })

  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
} 