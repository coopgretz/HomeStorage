'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Box } from '@/lib/types'

export default function EditBoxPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [box, setBox] = useState<Box | null>(null)
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
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [loadingBox, setLoadingBox] = useState(true)

  // Fetch box data on component mount
  useEffect(() => {
    const fetchBox = async () => {
      try {
        const response = await fetch(`/api/boxes/${params.id}`)
        if (response.ok) {
          const boxData = await response.json()
          setBox(boxData)
          setFormData({
            box_number: boxData.box_number.toString(),
            label: boxData.label || '',
            description: boxData.description || '',
            location: boxData.location || 'Garage',
            image: null
          })
          if (boxData.image_path) {
            setImagePreview(boxData.image_path)
          }
        } else {
          setError('Box not found')
        }
      } catch (error) {
        console.error('Failed to fetch box:', error)
        setError('Failed to load box data')
      } finally {
        setLoadingBox(false)
      }
    }

    fetchBox()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      setRemoveExistingImage(false)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    setImagePreview(null)
    setRemoveExistingImage(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Update box data
      const response = await fetch(`/api/boxes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          box_number: parseInt(formData.box_number),
          label: formData.label,
          description: formData.description,
          location: formData.location,
          remove_image: removeExistingImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update box')
      }

      const updatedBox = await response.json()

      // Upload new image if provided
      if (formData.image) {
        const imageFormData = new FormData()
        imageFormData.append('image', formData.image)
        imageFormData.append('type', 'box')
        imageFormData.append('id', updatedBox.id.toString())

        const imageResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        })

        if (!imageResponse.ok) {
          console.warn('Image upload failed, but box was updated')
        }
      }

      router.push('/boxes')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingBox) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-200"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors duration-200"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 transition-colors duration-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !box) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Error</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">{error}</p>
              <Link
                href="/boxes"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
              >
                Back to Boxes
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-200">
            <ArchiveBoxIcon className="h-8 w-8 mr-3 text-primary-600 dark:text-primary-400 transition-colors duration-200" />
            Edit Box {box?.box_number}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Update your storage box information
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded transition-colors duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Box Number */}
            <div>
              <label htmlFor="box_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Box Number *
              </label>
              <input
                type="number"
                id="box_number"
                name="box_number"
                required
                min="1"
                value={formData.box_number}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
                placeholder="Enter box number"
              />
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
                placeholder="Enter a descriptive label"
              />
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
                placeholder="Enter a detailed description"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
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
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Box Photo
              </label>
              
              {imagePreview && !removeExistingImage ? (
                <div className="mt-1 mb-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Box preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1 hover:bg-red-600 dark:hover:bg-red-500 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    Click the X to remove the current image, or upload a new one to replace it.
                  </p>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 dark:focus-within:ring-primary-400 dark:focus-within:ring-offset-gray-800 transition-colors duration-200"
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/boxes"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Updating...' : 'Update Box'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 