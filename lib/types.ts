export interface Box {
  id: number
  user_id: string
  box_number: number
  label?: string
  description?: string
  location: string
  image_path?: string
  created_at: string
}

export interface Item {
  id: number
  user_id: string
  name: string
  description?: string
  box_id: number
  category_id?: number
  status: 'in_box' | 'out_of_box'
  quantity: number
  image_path?: string
  date_added: string
  last_updated: string
  notes?: string
}

export interface Category {
  id: number
  name: string
  color: string
  created_at: string
} 