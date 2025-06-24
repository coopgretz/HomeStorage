import Navigation from '@/components/Navigation'
import AddItemForm from '@/components/AddItemForm'

export default function AddItemPage() {
  return (
    <>
      <Navigation />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add New Item
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Add a new item to your storage system
            </p>
          </div>
          
          <AddItemForm />
        </div>
      </main>
    </>
  )
} 