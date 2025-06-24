'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Item } from '@/lib/types'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export default function RecentItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentItems()
  }, [])

  const fetchRecentItems = async () => {
    try {
      const response = await fetch('/api/items?limit=5')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching recent items:', error)
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
        setItems(items.map(item => 
          item.id === itemId ? { ...item, status: newStatus as 'in_box' | 'out_of_box' } : item
        ))
      }
    } catch (error) {
      console.error('Error updating item status:', error)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Items</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Recent Items</h2>
        <Link
          href="/items"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium self-start sm:self-auto"
        >
          View all items →
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <ExclamationCircleIcon className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first item to the storage system.</p>
          <Link
            href="/items/add"
            className="btn-primary inline-flex items-center"
          >
            Add First Item
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${
                    item.category_color ? `bg-opacity-10` : 'bg-gray-100'
                  }`} style={{
                    backgroundColor: item.category_color ? `${item.category_color}20` : undefined
                  }}>
                    <div 
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: item.category_color || '#6b7280' }}
                    ></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        Box #{item.box_number}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {item.category_name && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.category_name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'in_box'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.status === 'in_box' ? 'In Box' : 'Out of Box'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => toggleItemStatus(item.id, item.status)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      item.status === 'in_box'
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
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
                    href={`/items/${item.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    title="View details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 