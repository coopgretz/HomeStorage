import Navigation from '@/components/Navigation'
import AddItemForm from '@/components/AddItemForm'

export default function AddItemPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
              Add New Item
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Add a new item to your storage system
            </p>
          </div>
          
          <AddItemForm />
        </div>
      </main>
    </div>
  )
} 