'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Box, Item } from '@/lib/types'
import {
  ArrowLeftIcon,
  PlusIcon,
  PhotoIcon,
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface Props {
  boxId: number
}

export default function BoxContents({ boxId }: Props) {
  const router = useRouter()
  const [box, setBox] = useState<Box | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoxAndItems()
  }, [boxId])

  const fetchBoxAndItems = async () => {
    try {
      setLoading(true)
      const [boxResponse, itemsResponse] = await Promise.all([
        fetch(`/api/boxes/${boxId}`),
        fetch(`/api/items?box_id=${boxId}`)
      ])

      if (boxResponse.ok) {
        const boxData = await boxResponse.json()
        setBox(boxData)
      } else {
        setError('Box not found')
        return
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }
    } catch (error) {
      console.error('Error fetching box contents:', error)
      setError('Failed to load box contents')
    } finally {
      setLoading(false)
    }
  }

  const toggleItemStatus = async (itemId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'in_box' ? 'out_of_box' : 'in_box'
      const response = await fetch(`/api/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId ? { ...item, status: newStatus as 'in_box' | 'out_of_box' } : item
          )
        )
      }
    } catch (error) {
      console.error('Error updating item status:', error)
    }
  }

  const shareBox = async () => {
    if (navigator.share && box) {
      try {
        await navigator.share({
          title: `Box ${box.box_number}: ${box.label}`,
          text: `View the contents of storage box ${box.box_number}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Box Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-200">{error}</p>
            <Link
              href="/boxes"
              className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Boxes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !box) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-200"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 w-2/3 transition-colors duration-200"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-200"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors duration-200"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              href="/boxes"
              className="mr-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                Box {box.box_number}: {box.label}
              </h1>
              {box.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">{box.description}</p>
              )}
              {box.location && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">📍 {box.location}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                Items ({items.length})
              </h2>
              <Link
                href={`/items/add?box_id=${box.id}`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No items yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
                  Start by adding your first item to this box.
                </p>
                <Link
                  href={`/items/add?box_id=${box.id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add First Item
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="card hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Item Image */}
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden transition-colors duration-200">
                          {item.image_path ? (
                            <Image
                              src={item.image_path}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PhotoIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 transition-colors duration-200" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-200">
                              {item.name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                              item.status === 'in_box'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                            }`}>
                              {item.status === 'in_box' ? 'In Box' : 'Out of Box'}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2 transition-colors duration-200">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            {item.quantity > 1 && (
                              <span>Qty: {item.quantity}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => toggleItemStatus(item.id, item.status)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            item.status === 'in_box'
                              ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={item.status === 'in_box' ? 'Mark as out of box' : 'Mark as in box'}
                        >
                          {item.status === 'in_box' ? (
                            <ExclamationCircleIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        <Link
                          href={`/items/${item.id}/edit`}
                          className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Edit item"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box Details Sidebar */}
          <div className="space-y-6">
            {/* Box Photo */}
            {box.image_path && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Box Photo</h3>
                <Image
                  src={box.image_path}
                  alt="Box photo"
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Box Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/boxes/${box.id}/edit`}
                  className="w-full px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Box
                </Link>
                <button
                  onClick={shareBox}
                  className="w-full px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                >
                  Share Box
                </button>
              </div>
            </div>

            {/* Box Stats */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Total Items:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">In Box:</span>
                  <span className="font-medium text-green-600 dark:text-green-400 transition-colors duration-200">
                    {items.filter(item => item.status === 'in_box').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Out of Box:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400 transition-colors duration-200">
                    {items.filter(item => item.status === 'out_of_box').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 