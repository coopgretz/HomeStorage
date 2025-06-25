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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/boxes"
            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Boxes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center transition-colors duration-200">
            <ArchiveBoxIcon className="h-8 w-8 mr-3 text-primary-600 dark:text-primary-400" />
            Add New Storage Box
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Create a new storage box to organize your items
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded transition-colors duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Box Number */}
            <div>
              <label htmlFor="box_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
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
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors duration-200"
                  placeholder={loadingBoxNumber ? "Loading..." : "Enter box number"}
                />
                {loadingBoxNumber && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                {loadingBoxNumber 
                  ? "Finding next available number..." 
                  : "Auto-generated based on existing boxes. You can change this if needed."
                }
              </p>
            </div>

            {/* Label */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Label
              </label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                placeholder="e.g., Kitchen Items, Winter Clothes"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                Optional: Give your box a descriptive name
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors duration-200"
                placeholder="Describe what this box will contain..."
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Location *
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              >
                <option value="Garage">Garage</option>
                <option value="Basement">Basement</option>
                <option value="Attic">Attic</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Living Room">Living Room</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Closet">Closet</option>
                <option value="Storage Unit">Storage Unit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Box Photo
              </label>
              
              {imagePreview ? (
                <div className="mt-1 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Box preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData(prev => ({ ...prev, image: null }))
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
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Link
                href="/boxes"
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 order-2 sm:order-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 order-1 sm:order-2"
              >
                {loading ? 'Creating Box...' : 'Create Box'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 