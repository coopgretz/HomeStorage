import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  type: 'box' | 'item',
  id: number
): Promise<string> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${type}-${id}-${Date.now()}.${fileExt}`
  const filePath = `${type}s/${fileName}`
  
  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`)
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)
  
  return publicUrl
}

export async function deleteImage(supabase: SupabaseClient, imagePath: string): Promise<void> {
  if (!imagePath) return
  
  // Extract file path from URL
  const url = new URL(imagePath)
  const pathParts = url.pathname.split('/')
  const filePath = pathParts.slice(-2).join('/') // Get 'type/filename'
  
  const { error } = await supabase.storage
    .from('images')
    .remove([filePath])
  
  if (error) {
    console.warn('Failed to delete image:', error.message)
  }
}

export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

export function validateImageSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB
  return file.size <= maxSize
} 