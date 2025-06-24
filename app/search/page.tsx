import Navigation from '@/components/Navigation'
import SearchInterface from '@/components/SearchInterface'

export default function SearchPage() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Search Items
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Find items across your entire storage system
            </p>
          </div>
          
          <SearchInterface />
        </div>
      </main>
    </>
  )
} 