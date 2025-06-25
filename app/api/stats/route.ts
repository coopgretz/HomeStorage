import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route uses authentication and needs to be dynamic
export const dynamic = 'force-dynamic'

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

    // Get all boxes for this user
    const { data: boxes, error: boxesError } = await supabase
      .from('boxes')
      .select('*')
      .eq('user_id', user.id)

    if (boxesError) {
      throw boxesError
    }

    // Get all items for this user
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)

    if (itemsError) {
      throw itemsError
    }

    const totalItems = items?.length || 0
    const totalBoxes = boxes?.length || 0
    const itemsInBox = items?.filter(item => item.status === 'in_box').length || 0
    const itemsOutOfBox = items?.filter(item => item.status === 'out_of_box').length || 0

    return NextResponse.json({
      totalBoxes,
      totalItems,
      itemsInBox,
      itemsOutOfBox,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 