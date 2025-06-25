'use client'

import { useState, useEffect } from 'react'
import { Box } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArchiveBoxIcon,
  PencilIcon,
  PlusIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'

export default function BoxesGrid() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoxes()
  }, [])

  const fetchBoxes = async () => {
    try {
      const response = await fetch('/api/boxes')
      if (response.ok) {
        const data = await response.json()
        setBoxes(data)
      }
    } catch (error) {
      console.error('Error fetching boxes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Your Storage Boxes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 transition-colors duration-200"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors duration-200"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 transition-colors duration-200"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
          Your Storage Boxes ({boxes.length})
        </h2>
      </div>

      {boxes.length === 0 ? (
        <div className="card text-center py-12">
          <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No boxes yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
            Create your first storage box to get started organizing your items.
          </p>
          <Link
            href="/boxes/add"
            className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create First Box
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boxes.map((box) => (
            <div key={box.id} className="card hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300 group relative">
              <Link href={`/box/${box.id}`} className="block">
                {/* Box Image */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden transition-colors duration-200">
                  {box.image_path ? (
                    <Image
                      src={box.image_path}
                      alt={`Box ${box.box_number}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ArchiveBoxIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 dark:group-hover:text-gray-500 transition-colors duration-300" />
                    </div>
                  )}
                  
                  {/* Box Number Badge */}
                  <div className="absolute top-2 left-2 bg-primary-600 dark:bg-primary-700 text-white px-2 py-1 rounded text-sm font-medium">
                    #{box.box_number}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                    {box.label || `Box ${box.box_number}`}
                  </h3>
                  {box.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 transition-colors duration-200">
                      {box.description}
                    </p>
                  )}
                  {box.location && (
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      📍 {box.location}
                    </div>
                  )}
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <Link
                  href={`/box/${box.id}`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200"
                >
                  View Contents
                </Link>
                <Link
                  href={`/boxes/${box.id}/edit`}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  title="Edit box"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 