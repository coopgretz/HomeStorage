'use client'

import { useEffect, useState } from 'react'
import { Box } from '@/lib/types'
import {
  ArchiveBoxIcon,
  QrCodeIcon,
  EyeIcon,
  PhotoIcon,
  PlusIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'

export default function BoxesGrid() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingQR, setGeneratingQR] = useState<number | null>(null)

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

  const generateQRCode = async (boxId: number) => {
    try {
      setGeneratingQR(boxId)
      const response = await fetch(`/api/boxes/${boxId}/qr`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setBoxes(boxes.map(box => 
          box.id === boxId ? { ...box, qr_code_path: data.qrCodePath } : box
        ))
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setGeneratingQR(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {boxes.length} box{boxes.length !== 1 ? 'es' : ''} total
        </p>
      </div>

      {boxes.length === 0 ? (
        <div className="card text-center py-12">
          <ArchiveBoxIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No boxes yet</h3>
          <p className="text-gray-600 mb-4">Create your first storage box to get started.</p>
          <Link
            href="/boxes/add"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add First Box
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boxes.map((box) => (
            <div key={box.id} className="card hover:shadow-lg transition-shadow duration-200">
              {/* Box Image */}
              <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {box.image_path ? (
                  <Image
                    src={box.image_path}
                    alt={`Box ${box.box_number}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ArchiveBoxIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* QR Code Overlay */}
                {box.qr_code_path && (
                  <div className="absolute top-2 right-2 bg-white rounded-lg p-2 shadow-lg">
                    <Image
                      src={box.qr_code_path}
                      alt="QR Code"
                      width={40}
                      height={40}
                      className="rounded"
                    />
                  </div>
                )}
              </div>

              {/* Box Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Box #{box.box_number}
                  </h3>
                  <span className="text-sm text-gray-500">{box.location}</span>
                </div>
                
                {box.label && (
                  <h4 className="text-gray-700 font-medium mb-1">{box.label}</h4>
                )}
                
                {box.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {box.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Link
                    href={`/box/${box.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    title="View contents"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                  
                  <Link
                    href={`/boxes/${box.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    title="Edit box"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  
                  {!box.qr_code_path ? (
                    <button
                      onClick={() => generateQRCode(box.id)}
                      disabled={generatingQR === box.id}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                      title="Generate QR code"
                    >
                      {generatingQR === box.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                      ) : (
                        <QrCodeIcon className="h-5 w-5" />
                      )}
                    </button>
                  ) : (
                    <div className="p-2 text-green-600" title="QR code ready">
                      <QrCodeIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <Link
                  href={`/box/${box.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View Contents →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 