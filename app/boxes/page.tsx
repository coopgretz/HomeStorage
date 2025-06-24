import Navigation from '@/components/Navigation'
import BoxesGrid from '@/components/BoxesGrid'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function BoxesPage() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Storage Boxes
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Manage your storage boxes and generate QR codes for quick access
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/boxes/add"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Box
              </Link>
            </div>
          </div>
          
          <BoxesGrid />
        </div>
      </main>
    </>
  )
} 