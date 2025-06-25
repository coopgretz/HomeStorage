'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Box, Category } from '@/lib/types'

// Separate component for handling search params
function AddItemFormWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedBoxId = searchParams.get('box_id')
  
  return <AddItemFormContent preselectedBoxId={preselectedBoxId} router={router} />
}

// Main form component that receives preselected box ID as prop
function AddItemFormContent({ preselectedBoxId, router }: { preselectedBoxId: string | null, router: any }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    box_id: preselectedBoxId || '',
    category_id: '',
    status: 'in_box',
    quantity: '1',
    notes: '',
  })
  
  const [boxes, setBoxes] = useState<Box[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchBoxesAndCategories()
  }, [])

  const fetchBoxesAndCategories = async () => {
    try {
      const [boxesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/boxes'),
        fetch('/api/categories')
      ])
      
      if (boxesResponse.ok) {
        const boxesData = await boxesResponse.json()
        setBoxes(boxesData)
      }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.box_id) {
      alert('Please fill in the required fields (Name and Box)')
      return
    }

    setLoading(true)

    try {
      // First create the item
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          box_id: parseInt(formData.box_id),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create item')
      }

      const newItem = await response.json()

      // Upload image if provided
      if (image) {
        const imageFormData = new FormData()
        imageFormData.append('image', image)
        imageFormData.append('type', 'item')
        imageFormData.append('id', newItem.id.toString())

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          console.warn('Image upload failed, but item was created')
        }
      }

      router.push('/')
    } catch (error: any) {
      console.error('Error creating item:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">Item Details</h2>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="label">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe the item (optional)"
            />
          </div>

          {/* Box Selection */}
          <div>
            <label htmlFor="box_id" className="label">
              Storage Box *
            </label>
            <select
              id="box_id"
              name="box_id"
              value={formData.box_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a box</option>
              {boxes.map((box) => (
                <option key={box.id} value={box.id}>
                  Box #{box.box_number} {box.label && `- ${box.label}`}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="label">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select a category (optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status and Quantity Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="in_box">In Box</option>
                <option value="out_of_box">Out of Box</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="label">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className="input-field"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="label">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
              placeholder="Any additional notes (optional)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="label">
              Item Photo
            </label>
            
            {imagePreview ? (
              <div className="mt-1 mb-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="h-32 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setImage(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 transition-colors duration-200"
                      >
                        <span>Upload a photo</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary w-full sm:w-auto order-1 sm:order-2"
          disabled={loading}
        >
          {loading ? 'Adding Item...' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}

// Loading fallback component
function AddItemFormFallback() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 transition-colors duration-200">Item Details</h2>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main exported component with Suspense wrapper
export default function AddItemForm() {
  return (
    <Suspense fallback={<AddItemFormFallback />}>
      <AddItemFormWithParams />
    </Suspense>
  )
} 