import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteImage } from '@/lib/storage'

export async function DELETE(request: NextRequest) {
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

    // Get all images to delete from storage
    const { data: boxes } = await supabase
      .from('boxes')
      .select('image_path')
      .eq('user_id', user.id)

    const { data: items } = await supabase
      .from('items')
      .select('image_path')
      .eq('user_id', user.id)

    // Collect all image paths
    const imagePaths: string[] = []
    
    if (boxes) {
      boxes.forEach(box => {
        if (box.image_path) imagePaths.push(box.image_path)
      })
    }
    
    if (items) {
      items.forEach(item => {
        if (item.image_path) imagePaths.push(item.image_path)
      })
    }

    // Delete all images from storage (in parallel)
    const imageDeletePromises = imagePaths.map(imagePath => 
      deleteImage(supabase, imagePath).catch(error => 
        console.warn(`Failed to delete image ${imagePath}:`, error)
      )
    )
    
    await Promise.all(imageDeletePromises)

    // Delete user data from database
    // Note: Due to foreign key constraints, deleting categories will cascade delete boxes and items
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .eq('user_id', user.id)

    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError)
      // Continue anyway - some data might still be deletable
    }

    // Delete any remaining boxes (in case they don't have categories)
    const { error: boxesError } = await supabase
      .from('boxes')
      .delete()
      .eq('user_id', user.id)

    if (boxesError) {
      console.error('Error deleting boxes:', boxesError)
    }

    // Delete any remaining items (in case they don't have boxes)
    const { error: itemsError } = await supabase
      .from('items')
      .delete()
      .eq('user_id', user.id)

    if (itemsError) {
      console.error('Error deleting items:', itemsError)
    }

    // Finally, delete the user account
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteUserError) {
      // If we can't delete the user account via admin API, 
      // the user data is still cleaned up, but the auth account remains
      console.error('Error deleting user account:', deleteUserError)
      
      return NextResponse.json({
        message: 'User data deleted successfully, but account deletion failed. Please contact support.',
        warning: true
      })
    }

    return NextResponse.json({
      message: 'Account and all data deleted successfully'
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again or contact support.' },
      { status: 500 }
    )
  }
} 