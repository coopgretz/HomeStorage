'use client'

import { useEffect, useState } from 'react'
import { Box, Item } from '@/lib/types'
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PhotoIcon,
  QrCodeIcon,
  ShareIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  boxId: number
}

export default function BoxContents({ boxId }: Props) {
  const [box, setBox] = useState<Box | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBoxData()
  }, [boxId])

  const fetchBoxData = async () => {
    try {
      setLoading(true)
      
      // Fetch box details
      const boxResponse = await fetch(`/api/boxes/${boxId}`)
      if (!boxResponse.ok) {
        throw new Error('Box not found')
      }
      const boxData = await boxResponse.json()
      setBox(boxData)

      // Fetch items in this box
      const itemsResponse = await fetch(`/api/items?box_id=${boxId}`)
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }

    } catch (error) {
      console.error('Error fetching box data:', error)
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
        setItems(items.map(item => 
          item.id === itemId ? { ...item, status: newStatus as 'in_box' | 'out_of_box' } : item
        ))
      }
    } catch (error) {
      console.error('Error updating item status:', error)
    }
  }

  const generateQRCode = async () => {
    try {
      const response = await fetch(`/api/boxes/${boxId}/qr`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setBox(prev => prev ? { ...prev, qr_code_path: data.qrCodePath } : null)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const shareBox = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Box #${box?.box_number} - ${box?.label || 'Storage Box'}`,
          text: `Check out what's in this storage box`,
          url: url,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="card text-center py-12">
          <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Box Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const itemsInBox = items.filter(item => item.status === 'in_box')
  const itemsOutOfBox = items.filter(item => item.status === 'out_of_box')

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Box Header */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start space-x-4 mb-4 sm:mb-0">
            {/* Box Image */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {box?.image_path ? (
                <Image
                  src={box.image_path}
                  alt={`Box ${box.box_number}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ArchiveBoxIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Box Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Box #{box?.box_number}
              </h1>
              {box?.label && (
                <h2 className="text-lg text-gray-600 mb-2">{box.label}</h2>
              )}
              {box?.description && (
                <p className="text-gray-600 mb-3">{box.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <span>{box?.location}</span>
                <span className="mx-2">•</span>
                <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href={`/boxes/${boxId}/edit`}
              className="btn-secondary flex items-center justify-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Box
            </Link>
            <button
              onClick={shareBox}
              className="btn-secondary flex items-center justify-center"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </button>
            {box?.qr_code_path ? (
              <div className="relative">
                <Image
                  src={box.qr_code_path}
                  alt="QR Code"
                  width={40}
                  height={40}
                  className="rounded border cursor-pointer"
                  title="Box QR Code"
                />
              </div>
            ) : (
              <button
                onClick={generateQRCode}
                className="btn-primary flex items-center justify-center"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Generate QR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{itemsInBox.length}</div>
          <div className="text-sm text-gray-600">In Box</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{itemsOutOfBox.length}</div>
          <div className="text-sm text-gray-600">Out of Box</div>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="card text-center py-12">
          <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in this box</h3>
          <p className="text-gray-600 mb-4">Start by adding some items to track.</p>
          <Link
            href="/items/add"
            className="btn-primary inline-flex items-center"
          >
            Add First Item
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Items in this box</h3>
          
          {items.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
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
                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-base font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2">
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
                      {item.quantity > 1 && (
                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      )}
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
                    href={`/items/${item.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    title="Edit item"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
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