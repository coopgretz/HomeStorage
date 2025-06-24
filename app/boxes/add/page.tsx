'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'

export default function AddBoxPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    box_number: '',
    label: '',
    description: '',
    location: 'Garage',
    image: null as File | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loadingBoxNumber, setLoadingBoxNumber] = useState(true)

  // Fetch next available box number on component mount
  useEffect(() => {
    const fetchNextBoxNumber = async () => {
      try {
        const response = await fetch('/api/boxes')
        if (response.ok) {
          const boxes = await response.json()
          
          // Find the highest box number and add 1
          const boxNumbers = boxes.map((box: any) => box.box_number).sort((a: number, b: number) => a - b)
          let nextNumber = 1
          
          // Find the first gap in the sequence, or use the next number after the highest
          for (let i = 0; i < boxNumbers.length; i++) {
            if (boxNumbers[i] !== nextNumber) {
              break
            }
            nextNumber++
          }
          
          setFormData(prev => ({ ...prev, box_number: nextNumber.toString() }))
        }
      } catch (error) {
        console.error('Failed to fetch boxes:', error)
        // Default to 1 if we can't fetch existing boxes
        setFormData(prev => ({ ...prev, box_number: '1' }))
      } finally {
        setLoadingBoxNumber(false)
      }
    }

    fetchNextBoxNumber()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
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
    setLoading(true)
    setError(null)

    try {
      // First create the box
      const response = await fetch('/api/boxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          box_number: parseInt(formData.box_number),
          label: formData.label,
          description: formData.description,
          location: formData.location,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create box')
      }

      const newBox = await response.json()

      // Upload image if provided
      if (formData.image) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.image)
        imageFormData.append('type', 'box')
        imageFormData.append('id', newBox.id.toString())

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          console.warn('Image upload failed, but box was created')
        }
      }

      router.push('/boxes')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/boxes"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Boxes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ArchiveBoxIcon className="h-8 w-8 mr-3 text-primary-600" />
            Add New Storage Box
          </h1>
          <p className="mt-2 text-gray-600">
            Create a new storage box to organize your items
          </p>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Box Number */}
            <div>
              <label htmlFor="box_number" className="block text-sm font-medium text-gray-700">
                Box Number *
              </label>
              <div className="mt-1 relative">
                <input
                  type="number"
                  id="box_number"
                  name="box_number"
                  required
                  min="1"
                  value={formData.box_number}
                  onChange={handleInputChange}
                  disabled={loadingBoxNumber}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder={loadingBoxNumber ? "Loading..." : "Enter box number"}
                />
                {loadingBoxNumber && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {loadingBoxNumber 
                  ? "Finding next available number..." 
                  : "Auto-generated based on existing boxes. You can change this if needed."
                }
              </p>
            </div>

            {/* Label */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                Label
              </label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter a descriptive label (e.g., Electronics, Kitchen Items)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter a detailed description of what's in this box"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Garage">Garage</option>
                <option value="Basement">Basement</option>
                <option value="Attic">Attic</option>
                <option value="Storage Room">Storage Room</option>
                <option value="Closet">Closet</option>
                <option value="Shed">Shed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Box Photo
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
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
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/boxes"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || loadingBoxNumber}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : loadingBoxNumber ? 'Loading...' : 'Create Box'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 