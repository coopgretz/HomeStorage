'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Category } from '@/lib/types'

export default function AddItemForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    box_id: '',
    category_id: '',
    status: 'in_box',
    quantity: 1,
    notes: '',
  })

  useEffect(() => {
    fetchBoxesAndCategories()
  }, [])

  const fetchBoxesAndCategories = async () => {
    try {
      const [boxesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/boxes'),
        fetch('/api/categories'),
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.box_id) {
      alert('Please fill in the required fields (Name and Box)')
      return
    }

    setLoading(true)

    try {
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

      if (response.ok) {
        router.push('/')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to create item'}`)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item. Please try again.')
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