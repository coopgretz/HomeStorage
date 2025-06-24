import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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
    const body = await request.json()
    const { status } = body

    if (!status || !['in_box', 'out_of_box'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (in_box or out_of_box) is required' },
        { status: 400 }
      )
    }

    const { data: updatedItem, error } = await supabase
      .from('items')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error || !updatedItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Item status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update item status' },
      { status: 500 }
    )
  }
}